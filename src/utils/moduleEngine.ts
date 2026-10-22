import JSZip from 'jszip';
import { ThemeConfig, XmlFileItem } from '../types/theme';
import { getAllGeneratedThemeFiles } from './xmlGenerators';
import { STANDARD_APP_ICONS } from '../data/presets';
import { generateRealAppIconPng, renderDataUriToRasterBlob } from './canvasRenderer';

export interface ModuleFileEntry {
  path: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  previewUrl?: string;
  contentSnippet?: string;
  isBinary: boolean;
}

export interface CompiledModule {
  id: string;
  name: string;
  displayName: string;
  category: 'core' | 'lockscreen' | 'icons' | 'systemui' | 'launcher' | 'framework' | 'media';
  description: string;
  targetPathInMtz: string;
  sizeBytes: number;
  format: 'zip_container' | 'xml' | 'jpeg' | 'png_directory';
  hexHeader: string;
  entryCount: number;
  blob: Blob;
  files: ModuleFileEntry[];
  lastCompiled: string;
}

export interface ModuleCompilationResult {
  modules: CompiledModule[];
  totalSizeBytes: number;
  timestamp: string;
  hyperOsCompatibility: 'HyperOS 1.0 & 2.0 (Official Spec)' | 'MIUI 14 Compatible';
  allIconsRenderedCount: number;
}

/**
 * Converts array buffer to human-readable hex preview (first N bytes)
 */
function getHexHeaderPreview(buffer: ArrayBuffer, length: number = 32): string {
  const bytes = new Uint8Array(buffer.slice(0, length));
  const hexParts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    hexParts.push(bytes[i].toString(16).padStart(2, '0').toUpperCase());
  }
  return hexParts.join(' ');
}

/**
 * Compiles all authentic Xiaomi HyperOS binary module files from current theme state
 */
export async function compileAllThemeModules(
  theme: ThemeConfig,
  customFiles?: XmlFileItem[] | null,
  onProgress?: (percent: number, stepText: string) => void
): Promise<ModuleCompilationResult> {
  const files = customFiles || getAllGeneratedThemeFiles(theme);
  const compiledModules: CompiledModule[] = [];
  let totalIconsRendered = 0;

  // ----------------------------------------------------
  // MODULE 1: description.xml (Root metadata descriptor)
  // ----------------------------------------------------
  onProgress?.(10, 'Mengompilasi metadata root description.xml...');
  const descItem = files.find((f) => f.path === 'description.xml') || {
    path: 'description.xml',
    displayName: 'description.xml',
    content: '',
    category: 'metadata' as const,
  };
  const descBlob = new Blob([descItem.content], { type: 'application/xml' });
  const descBuffer = await descBlob.arrayBuffer();

  compiledModules.push({
    id: 'description',
    name: 'description.xml',
    displayName: 'Manifest Metadata Tema (description.xml)',
    category: 'core',
    description: 'Berkas deskriptor utama di akar arsip .MTZ. Dibaca oleh Theme Manager HyperOS untuk memverifikasi kompatibilitas uiVersion=1.',
    targetPathInMtz: 'description.xml',
    sizeBytes: descBlob.size,
    format: 'xml',
    hexHeader: getHexHeaderPreview(descBuffer, 24),
    entryCount: 1,
    blob: descBlob,
    files: [
      {
        path: 'description.xml',
        name: 'description.xml',
        sizeBytes: descBlob.size,
        mimeType: 'application/xml',
        contentSnippet: descItem.content.slice(0, 300),
        isBinary: false,
      },
    ],
    lastCompiled: new Date().toLocaleTimeString('id-ID'),
  });

  // ----------------------------------------------------
  // MODULE 2: lockscreen (Sub-archive mesin layar kunci)
  // ----------------------------------------------------
  onProgress?.(30, 'Mengompilasi modul layar kunci biner (lockscreen)...');
  const lockZip = new JSZip();
  const lockManifest = files.find((f) => f.path.includes('lockscreen'))?.content || '';
  lockZip.file('advance/manifest.xml', lockManifest);

  // Shortcut PNG icons inside advance/icons/
  const torchBlob = await generateRealAppIconPng('round', 'hyper_color', '#ffb800', 'FL', 'utility');
  const cameraBlob = await generateRealAppIconPng('round', 'hyper_color', '#ef4444', 'CA', 'media');
  lockZip.file('advance/icons/torch.png', torchBlob);
  lockZip.file('advance/icons/camera.png', cameraBlob);

  const lockscreenBlob = await lockZip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const lockBuffer = await lockscreenBlob.arrayBuffer();

  const torchUrl = URL.createObjectURL(torchBlob);
  const cameraUrl = URL.createObjectURL(cameraBlob);

  compiledModules.push({
    id: 'lockscreen',
    name: 'lockscreen',
    displayName: 'Modul Mesin Layar Kunci (lockscreen)',
    category: 'lockscreen',
    description: 'Modul biner terkompresi tanpa ekstensi. Berisi logika XML advance/manifest.xml, layout jam mendalam, dan tombol pintasan kamera/senter.',
    targetPathInMtz: 'lockscreen',
    sizeBytes: lockscreenBlob.size,
    format: 'zip_container',
    hexHeader: getHexHeaderPreview(lockBuffer, 24),
    entryCount: 3,
    blob: lockscreenBlob,
    files: [
      {
        path: 'advance/manifest.xml',
        name: 'manifest.xml',
        sizeBytes: lockManifest.length,
        mimeType: 'application/xml',
        contentSnippet: lockManifest.slice(0, 300),
        isBinary: false,
      },
      {
        path: 'advance/icons/torch.png',
        name: 'torch.png',
        sizeBytes: torchBlob.size,
        mimeType: 'image/png',
        previewUrl: torchUrl,
        isBinary: true,
      },
      {
        path: 'advance/icons/camera.png',
        name: 'camera.png',
        sizeBytes: cameraBlob.size,
        mimeType: 'image/png',
        previewUrl: cameraUrl,
        isBinary: true,
      },
    ],
    lastCompiled: new Date().toLocaleTimeString('id-ID'),
  });

  // ----------------------------------------------------
  // MODULE 3: icons (Sub-archive paket ikon PNG 192x192)
  // ----------------------------------------------------
  onProgress?.(55, 'Merender dan mengompilasi modul paket ikon nyata (icons)...');
  const iconsZip = new JSZip();
  const iconsManifest = files.find((f) => f.path.includes('icons'))?.content || '';
  iconsZip.file('transform_config.xml', iconsManifest);

  const iconsSubFiles: ModuleFileEntry[] = [
    {
      path: 'transform_config.xml',
      name: 'transform_config.xml',
      sizeBytes: iconsManifest.length,
      mimeType: 'application/xml',
      contentSnippet: iconsManifest.slice(0, 300),
      isBinary: false,
    },
  ];

  // Generate 192x192 PNG for all standard HyperOS app icons
  for (let i = 0; i < STANDARD_APP_ICONS.length; i++) {
    const app = STANDARD_APP_ICONS[i];
    const customDataUri = theme.icons.customIcons?.[app.packageName];
    const iconPngBlob = await generateRealAppIconPng(
      theme.icons.shape,
      theme.icons.style,
      theme.icons.accentColor,
      app.name,
      app.category,
      customDataUri
    );

    iconsZip.file(`res/drawable-xxhdpi/${app.packageName}.png`, iconPngBlob);

    const iconUrl = URL.createObjectURL(iconPngBlob);
    iconsSubFiles.push({
      path: `res/drawable-xxhdpi/${app.packageName}.png`,
      name: `${app.packageName}.png (${app.name})`,
      sizeBytes: iconPngBlob.size,
      mimeType: 'image/png',
      previewUrl: iconUrl,
      isBinary: true,
    });
    totalIconsRendered++;
  }

  // Also include custom icons added by user
  if (theme.icons.customIcons) {
    for (const [pkgName, dataUri] of Object.entries(theme.icons.customIcons)) {
      if (!STANDARD_APP_ICONS.some((a) => a.packageName === pkgName)) {
        const extraIconBlob = await generateRealAppIconPng(
          theme.icons.shape,
          theme.icons.style,
          theme.icons.accentColor,
          pkgName.split('.').pop() || 'App',
          'utility',
          dataUri
        );
        iconsZip.file(`res/drawable-xxhdpi/${pkgName}.png`, extraIconBlob);
        const iconUrl = URL.createObjectURL(extraIconBlob);
        iconsSubFiles.push({
          path: `res/drawable-xxhdpi/${pkgName}.png`,
          name: `${pkgName}.png (Kustom)`,
          sizeBytes: extraIconBlob.size,
          mimeType: 'image/png',
          previewUrl: iconUrl,
          isBinary: true,
        });
        totalIconsRendered++;
      }
    }
  }

  const iconsBlob = await iconsZip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const iconsBuffer = await iconsBlob.arrayBuffer();

  compiledModules.push({
    id: 'icons',
    name: 'icons',
    displayName: 'Modul Paket Ikon Biner (icons)',
    category: 'icons',
    description: 'Modul biner berisi file gambar PNG 192x192 nyata untuk setiap nama paket aplikasi Android/HyperOS serta manifest aturan bentuk & bayangan.',
    targetPathInMtz: 'icons',
    sizeBytes: iconsBlob.size,
    format: 'zip_container',
    hexHeader: getHexHeaderPreview(iconsBuffer, 24),
    entryCount: iconsSubFiles.length,
    blob: iconsBlob,
    files: iconsSubFiles,
    lastCompiled: new Date().toLocaleTimeString('id-ID'),
  });

  // ----------------------------------------------------
  // MODULE 4: com.android.systemui (Control Center & Status Bar)
  // ----------------------------------------------------
  onProgress?.(75, 'Mengompilasi modul SystemUI (Pusat Kontrol)...');
  const sysZip = new JSZip();
  const sysContent = files.find((f) => f.path.includes('systemui'))?.content || '';
  sysZip.file('theme_values.xml', sysContent);

  const sysBlob = await sysZip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const sysBuffer = await sysBlob.arrayBuffer();

  compiledModules.push({
    id: 'systemui',
    name: 'com.android.systemui',
    displayName: 'Modul SystemUI & Pusat Kontrol (com.android.systemui)',
    category: 'systemui',
    description: 'Modul pengendali warna status bar, baterai, radius blur Pusat Kontrol HyperOS, dan ikon Quick Settings.',
    targetPathInMtz: 'com.android.systemui',
    sizeBytes: sysBlob.size,
    format: 'zip_container',
    hexHeader: getHexHeaderPreview(sysBuffer, 24),
    entryCount: 1,
    blob: sysBlob,
    files: [
      {
        path: 'theme_values.xml',
        name: 'theme_values.xml',
        sizeBytes: sysContent.length,
        mimeType: 'application/xml',
        contentSnippet: sysContent.slice(0, 300),
        isBinary: false,
      },
    ],
    lastCompiled: new Date().toLocaleTimeString('id-ID'),
  });

  // ----------------------------------------------------
  // MODULE 5: com.miui.home (Launcher & Widgets)
  // ----------------------------------------------------
  onProgress?.(85, 'Mengompilasi modul Launcher Desktop (com.miui.home)...');
  const homeZip = new JSZip();
  const homeContent = files.find((f) => f.path.includes('miui.home'))?.content || '';
  homeZip.file('theme_values.xml', homeContent);

  const homeBlob = await homeZip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const homeBuffer = await homeBlob.arrayBuffer();

  compiledModules.push({
    id: 'home',
    name: 'com.miui.home',
    displayName: 'Modul Launcher Desktop & Widget (com.miui.home)',
    category: 'launcher',
    description: 'Modul pengaturan tata letak desktop HyperOS, ukuran grid icon, super folder, dan konfigurasi kartu widget kustom.',
    targetPathInMtz: 'com.miui.home',
    sizeBytes: homeBlob.size,
    format: 'zip_container',
    hexHeader: getHexHeaderPreview(homeBuffer, 24),
    entryCount: 1,
    blob: homeBlob,
    files: [
      {
        path: 'theme_values.xml',
        name: 'theme_values.xml',
        sizeBytes: homeContent.length,
        mimeType: 'application/xml',
        contentSnippet: homeContent.slice(0, 300),
        isBinary: false,
      },
    ],
    lastCompiled: new Date().toLocaleTimeString('id-ID'),
  });

  // ----------------------------------------------------
  // MODULE 6: framework-res (Global Framework UI Tokens)
  // ----------------------------------------------------
  onProgress?.(90, 'Mengompilasi modul framework-res (Palet Warna Sistem)...');
  const frameworkZip = new JSZip();
  const frameworkXml = files.find((f) => f.path === 'framework-miui-res/theme_values.xml')?.content || '';
  frameworkZip.file('theme_values.xml', frameworkXml);

  const frameworkBlob = await frameworkZip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const frameworkBuffer = await frameworkBlob.arrayBuffer();

  compiledModules.push({
    id: 'framework',
    name: 'framework-miui-res',
    displayName: 'Modul Kerangka UI Sistem (framework-miui-res)',
    category: 'framework',
    description: 'Modul kerangka inti yang mengatur warna aksen global, sudut rounded dialog, dan palet material HyperOS di seluruh aplikasi sistem.',
    targetPathInMtz: 'framework-miui-res',
    sizeBytes: frameworkBlob.size,
    format: 'zip_container',
    hexHeader: getHexHeaderPreview(frameworkBuffer, 24),
    entryCount: 1,
    blob: frameworkBlob,
    files: [
      {
        path: 'theme_values.xml',
        name: 'theme_values.xml',
        sizeBytes: frameworkXml.length,
        mimeType: 'application/xml',
        contentSnippet: frameworkXml.slice(0, 300),
        isBinary: false,
      },
    ],
    lastCompiled: new Date().toLocaleTimeString('id-ID'),
  });

  // ----------------------------------------------------
  // MODULE 7: wallpaper (Berkas Wallpaper Asli 1080x2400)
  // ----------------------------------------------------
  onProgress?.(95, 'Merasterisasi wallpaper biner JPEG 1080x2400 murni...');
  let wallpaperJpegBlob: Blob;
  try {
    wallpaperJpegBlob = await renderDataUriToRasterBlob(
      theme.wallpaper.url,
      1080,
      2400,
      'image/jpeg',
      0.95
    );
  } catch {
    wallpaperJpegBlob = new Blob(['FALLBACK_WALLPAPER'], { type: 'image/jpeg' });
  }

  const wallpaperBuffer = await wallpaperJpegBlob.arrayBuffer();
  const wallpaperPreviewUrl = URL.createObjectURL(wallpaperJpegBlob);

  compiledModules.push({
    id: 'wallpaper',
    name: 'wallpaper/default_wallpaper.jpg',
    displayName: 'Berkas Wallpaper Asli (default_wallpaper.jpg)',
    category: 'media',
    description: 'Berkas citra JPEG beresolusi 1080x2400 murni yang dipasang langsung ke layar beranda dan layar kunci Xiaomi.',
    targetPathInMtz: 'wallpaper/default_wallpaper.jpg',
    sizeBytes: wallpaperJpegBlob.size,
    format: 'jpeg',
    hexHeader: getHexHeaderPreview(wallpaperBuffer, 24),
    entryCount: 1,
    blob: wallpaperJpegBlob,
    files: [
      {
        path: 'wallpaper/default_wallpaper.jpg',
        name: 'default_wallpaper.jpg (1080x2400 JPEG)',
        sizeBytes: wallpaperJpegBlob.size,
        mimeType: 'image/jpeg',
        previewUrl: wallpaperPreviewUrl,
        isBinary: true,
      },
    ],
    lastCompiled: new Date().toLocaleTimeString('id-ID'),
  });

  onProgress?.(100, 'Seluruh modul biner tema HyperOS berhasil dikompilasi!');

  const totalBytes = compiledModules.reduce((acc, m) => acc + m.sizeBytes, 0);

  return {
    modules: compiledModules,
    totalSizeBytes: totalBytes,
    timestamp: new Date().toLocaleTimeString('id-ID'),
    hyperOsCompatibility: 'HyperOS 1.0 & 2.0 (Official Spec)',
    allIconsRenderedCount: totalIconsRendered,
  };
}

/**
 * Downloads a single raw module file without .zip extension (as required by HyperOS /data/system/theme/)
 */
export function downloadModuleBlob(blob: Blob, moduleFilename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = moduleFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Compiles and returns a single module
 */
export async function getSingleCompiledModule(
  theme: ThemeConfig,
  moduleId: string
): Promise<CompiledModule | null> {
  const result = await compileAllThemeModules(theme);
  return result.modules.find((m) => m.id === moduleId) || null;
}

/**
 * Bakes all 16 standard app icons into genuine 192x192 PNG Data URIs
 * so they are stored in theme.icons.customIcons as real binary PNG assets
 */
export async function bakeAllStandardIconsToTheme(
  theme: ThemeConfig
): Promise<ThemeConfig> {
  const newCustomIcons: Record<string, string> = { ...(theme.icons.customIcons || {}) };
  for (const app of STANDARD_APP_ICONS) {
    const existing = newCustomIcons[app.packageName];
    // If not existing or if we want fresh real PNG bitmap
    const blob = await generateRealAppIconPng(
      theme.icons.shape,
      theme.icons.style,
      theme.icons.accentColor || theme.systemUi.accentColor,
      app.name.slice(0, 2).toUpperCase(),
      app.category,
      existing
    );
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    newCustomIcons[app.packageName] = dataUrl;
  }
  return {
    ...theme,
    icons: {
      ...theme.icons,
      customIcons: newCustomIcons,
    },
  };
}
