import JSZip from 'jszip';
import { ThemeConfig, XmlFileItem } from '../types/theme';
import { THEME_PRESETS, MECHA_DARK_WALLPAPER_SVG } from '../data/presets';

export interface ImportResult {
  theme: ThemeConfig;
  files: XmlFileItem[];
  importedFilesCount: number;
  warnings: string[];
  originalFilename: string;
}

/**
 * Extracts text content from a ZIP entry safely
 */
async function getZipEntryText(zip: JSZip, possiblePaths: string[]): Promise<{ path: string; text: string } | null> {
  for (const path of possiblePaths) {
    const file = zip.file(path);
    if (file) {
      const text = await file.async('text');
      return { path, text };
    }
  }
  return null;
}

/**
 * Unpacks an authentic Xiaomi HyperOS .mtz (or .zip) file and reconstitutes the ThemeConfig and XML files
 */
export async function parseMtzArchive(file: File | Blob, filename: string): Promise<ImportResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const warnings: string[] = [];
  const extractedFiles: XmlFileItem[] = [];

  // Start with a clone of default preset as baseline
  const resultTheme: ThemeConfig = JSON.parse(JSON.stringify(THEME_PRESETS.mecha_dark));

  // 1. Extract description.xml
  const descEntry = await getZipEntryText(loadedZip, ['description.xml', 'theme/description.xml']);
  if (descEntry) {
    extractedFiles.push({
      path: 'description.xml',
      displayName: 'description.xml (Theme Metadata)',
      content: descEntry.text,
      category: 'metadata',
    });

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(descEntry.text, 'application/xml');
      const title = doc.querySelector('title')?.textContent;
      const author = doc.querySelector('author')?.textContent;
      const designer = doc.querySelector('designer')?.textContent;
      const version = doc.querySelector('version')?.textContent;
      const description = doc.querySelector('description')?.textContent;
      const uiVersion = doc.querySelector('uiVersion')?.textContent;

      if (title) resultTheme.meta.title = title;
      if (author) resultTheme.meta.author = author;
      if (designer) resultTheme.meta.designer = designer;
      if (version) resultTheme.meta.version = version;
      if (description) resultTheme.meta.description = description;
      if (uiVersion) resultTheme.meta.uiVersion = uiVersion === '1' ? 'HyperOS 1.0 / 2.0' : `MIUI v${uiVersion}`;
    } catch {
      warnings.push('Gagal mem-parse tag metadata pada description.xml');
    }
  } else {
    warnings.push('Berkas description.xml tidak ditemukan di akar arsip .mtz.');
  }

  // 2. Extract lockscreen (in Xiaomi .mtz, lockscreen is usually a sub-zip without extension, or a folder)
  let lockscreenManifestText: string | null = null;
  const directLockFile = loadedZip.file('lockscreen/advance/manifest.xml') || loadedZip.file('lockscreen/manifest.xml');

  if (directLockFile) {
    lockscreenManifestText = await directLockFile.async('text');
  } else {
    // Check if 'lockscreen' is a nested zip file
    const lockEntry = loadedZip.file('lockscreen');
    if (lockEntry) {
      try {
        const lockZipData = await lockEntry.async('blob');
        const lockSubZip = await new JSZip().loadAsync(lockZipData);
        const subManifest =
          lockSubZip.file('advance/manifest.xml') ||
          lockSubZip.file('manifest.xml') ||
          lockSubZip.file('manifest.xml');
        if (subManifest) {
          lockscreenManifestText = await subManifest.async('text');
        }
      } catch {
        warnings.push('Sub-arsip lockscreen tidak dapat didekompresi.');
      }
    }
  }

  if (lockscreenManifestText) {
    extractedFiles.push({
      path: 'lockscreen/advance/manifest.xml',
      displayName: 'lockscreen/advance/manifest.xml (Lock Engine)',
      content: lockscreenManifestText,
      category: 'lockscreen',
    });

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(lockscreenManifestText, 'application/xml');
      // Extract clock color if specified in variables
      const vars = doc.querySelectorAll('Var');
      vars.forEach((v) => {
        const name = v.getAttribute('name');
        const unquote = (x: string) => x.replace(/^'(.*)'$/s, '$1');
        const expr = v.getAttribute('expression');
        if (name === 'clock_color' && expr) {
          resultTheme.lockscreen.clockColor = unquote(expr);
        }
        if (name === 'signature_text' && expr) {
          resultTheme.lockscreen.customSignature = unquote(expr);
        }
        if (name === 'clock_style' && expr) {
          const val = unquote(expr) as any;
          if (['mecha_stencil', 'hyper_magazine', 'digital_tech', 'classic_serif', 'minimal_pill'].includes(val)) {
            resultTheme.lockscreen.clockStyle = val;
          }
        }
      });
    } catch {
      // Keep defaults
    }
  }

  // 3. Extract icons manifest AND real PNG icon assets
  let iconsManifestText: string | null = null;
  const directIconsFile = loadedZip.file('icons/transform_config.xml') || loadedZip.file('icons/manifest.xml');
  let iconsSubZipInstance: JSZip | null = null;

  if (directIconsFile) {
    iconsManifestText = await directIconsFile.async('text');
  } else {
    const iconsEntry = loadedZip.file('icons');
    if (iconsEntry) {
      try {
        const iconsBlob = await iconsEntry.async('blob');
        iconsSubZipInstance = await new JSZip().loadAsync(iconsBlob);
        const manifest = iconsSubZipInstance.file('transform_config.xml') || iconsSubZipInstance.file('manifest.xml');
        if (manifest) {
          iconsManifestText = await manifest.async('text');
        }
      } catch {
        warnings.push('Sub-arsip ikon biner (icons) tidak dapat dibaca.');
      }
    }
  }

  // Extract all real PNG icons from icons sub-archive or icons folder
  if (!resultTheme.icons.customIcons) {
    resultTheme.icons.customIcons = {};
  }

  if (iconsSubZipInstance) {
    const iconEntries = Object.keys(iconsSubZipInstance.files).filter(
      (path) => path.toLowerCase().endsWith('.png') && !path.startsWith('__MACOSX')
    );
    for (const iconPath of iconEntries) {
      const file = iconsSubZipInstance.file(iconPath);
      if (file) {
        try {
          const blob = await file.async('blob');
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const cleanPkg = iconPath.split('/').pop()?.replace(/\.png$/i, '') || '';
          if (cleanPkg && !cleanPkg.startsWith('.')) {
            resultTheme.icons.customIcons[cleanPkg] = dataUrl;
          }
        } catch {
          // ignore individual icon read error
        }
      }
    }
  } else {
    // Check direct folder
    const directPngs = Object.keys(loadedZip.files).filter(
      (p) => p.startsWith('icons/') && p.toLowerCase().endsWith('.png')
    );
    for (const iconPath of directPngs) {
      const file = loadedZip.file(iconPath);
      if (file) {
        try {
          const blob = await file.async('blob');
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const cleanPkg = iconPath.split('/').pop()?.replace(/\.png$/i, '') || '';
          if (cleanPkg) {
            resultTheme.icons.customIcons[cleanPkg] = dataUrl;
          }
        } catch {
          // ignore
        }
      }
    }
  }

  if (iconsManifestText) {
    extractedFiles.push({
      path: 'icons/transform_config.xml',
      displayName: 'icons/transform_config.xml (Icon Transform)',
      content: iconsManifestText,
      category: 'icons',
    });

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(iconsManifestText, 'application/xml');
      const maskTag = doc.querySelector('mask');
      if (maskTag) {
        const shape = maskTag.getAttribute('shape') as any;
        if (['squircle', 'hexagon', 'chamfer', 'round', 'square'].includes(shape)) {
          resultTheme.icons.shape = shape;
        }
      }
      const colorFilter = doc.querySelector('color_filter');
      if (colorFilter) {
        const accent = colorFilter.getAttribute('accent');
        if (accent) resultTheme.icons.accentColor = accent;
      }
    } catch {
      // Keep defaults
    }
  }

  // 4. Extract com.android.systemui
  let systemuiText: string | null = null;
  const directSysFile = loadedZip.file('com.android.systemui/theme_values.xml');
  if (directSysFile) {
    systemuiText = await directSysFile.async('text');
  } else {
    const sysEntry = loadedZip.file('com.android.systemui');
    if (sysEntry) {
      try {
        const sysBlob = await sysEntry.async('blob');
        const sysSubZip = await new JSZip().loadAsync(sysBlob);
        const tv = sysSubZip.file('theme_values.xml');
        if (tv) systemuiText = await tv.async('text');
      } catch {
        // silent
      }
    }
  }

  if (systemuiText) {
    extractedFiles.push({
      path: 'com.android.systemui/theme_values.xml',
      displayName: 'com.android.systemui/theme_values.xml (Control Center)',
      content: systemuiText,
      category: 'systemui',
    });
  }

  // 5. Extract com.miui.home
  let miuiHomeText: string | null = null;
  const directHomeFile = loadedZip.file('com.miui.home/theme_values.xml');
  if (directHomeFile) {
    miuiHomeText = await directHomeFile.async('text');
  } else {
    const homeEntry = loadedZip.file('com.miui.home');
    if (homeEntry) {
      try {
        const homeBlob = await homeEntry.async('blob');
        const homeSubZip = await new JSZip().loadAsync(homeBlob);
        const tv = homeSubZip.file('theme_values.xml');
        if (tv) miuiHomeText = await tv.async('text');
      } catch {
        // silent
      }
    }
  }

  if (miuiHomeText) {
    extractedFiles.push({
      path: 'com.miui.home/theme_values.xml',
      displayName: 'com.miui.home/theme_values.xml (Launcher Desktop)',
      content: miuiHomeText,
      category: 'home',
    });
  }

  // 6. Extract framework-res (Global Framework Tokens)
  let frameworkText: string | null = null;
  const directFrameworkFile = loadedZip.file('framework-miui-res/theme_values.xml');
  if (directFrameworkFile) {
    frameworkText = await directFrameworkFile.async('text');
  } else {
    const fwEntry = loadedZip.file('framework-miui-res') || loadedZip.file('framework-res');
    if (fwEntry) {
      try {
        const fwBlob = await fwEntry.async('blob');
        const fwZip = await new JSZip().loadAsync(fwBlob);
        const tv = fwZip.file('theme_values.xml');
        if (tv) frameworkText = await tv.async('text');
      } catch {
        // silent
      }
    }
  }

  if (frameworkText) {
    extractedFiles.push({
      path: 'framework-miui-res/theme_values.xml',
      displayName: 'framework-miui-res/theme_values.xml (System UI Tokens)',
      content: frameworkText,
      category: 'systemui',
    });
  }

  // 7. Extract Wallpaper (JPG or PNG) as base64 DataURL
  const wallpaperFile =
    loadedZip.file('wallpaper/default_wallpaper.jpg') ||
    loadedZip.file('wallpaper/default_wallpaper.png') ||
    loadedZip.file('wallpaper/default_wallpaper.webp');

  if (wallpaperFile) {
    try {
      const wallpaperBlob = await wallpaperFile.async('blob');
      const wallpaperDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(wallpaperBlob);
      });
      resultTheme.wallpaper.type = 'custom';
      resultTheme.wallpaper.url = wallpaperDataUrl;
      resultTheme.wallpaper.lockscreenUrl = wallpaperDataUrl;
    } catch {
      warnings.push('Gambar wallpaper tidak dapat diekstrak, menggunakan default.');
    }
  }

  return {
    theme: resultTheme,
    files: extractedFiles,
    importedFilesCount: Object.keys(loadedZip.files).length,
    warnings,
    originalFilename: filename,
  };
}
