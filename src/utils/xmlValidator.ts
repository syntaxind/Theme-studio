import { ThemeConfig, ValidationIssue, ValidationReport, XmlFileItem } from '../types/theme';
import { getAllGeneratedThemeFiles } from './xmlGenerators';

/**
 * Formats/beautifies XML with consistent indentation
 */
export function formatXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Basic XML tokenizer that splits on tags
  const tokens = xml
    .replace(/>\s*</g, '><')
    .replace(/</g, '\n<')
    .split('\n')
    .filter((line) => line.trim().length > 0);

  tokens.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('<?') || trimmed.startsWith('<!')) {
      formatted += `${tab.repeat(indent)}${trimmed}\n`;
    } else if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += `${tab.repeat(indent)}${trimmed}\n`;
    } else if (trimmed.endsWith('/>')) {
      formatted += `${tab.repeat(indent)}${trimmed}\n`;
    } else if (trimmed.startsWith('<') && !trimmed.includes('</') && !trimmed.endsWith('/>')) {
      formatted += `${tab.repeat(indent)}${trimmed}\n`;
      indent++;
    } else if (trimmed.startsWith('<') && trimmed.includes('</')) {
      formatted += `${tab.repeat(indent)}${trimmed}\n`;
    } else {
      formatted += `${tab.repeat(indent)}${trimmed}\n`;
    }
  });

  return formatted.trim();
}

/**
 * Validates a single XML string using browser's DOMParser and line-by-line HyperOS rules
 */
export function validateXmlString(xmlContent: string, filename: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lines = xmlContent.split('\n');

  if (!xmlContent || !xmlContent.trim()) {
    issues.push({
      id: `${filename}-empty`,
      severity: 'error',
      file: filename,
      line: 1,
      ruleCode: 'HYPEROS-EMPTY-XML',
      message: 'Berkas XML kosong tanpa konten.',
      suggestion: 'Pastikan file memiliki root elemen XML yang valid (misal <theme> atau <manifest>).',
      fixAvailable: true,
      fixLabel: 'Isi Template Standar',
      fixType: 'format_xml',
    });
    return issues;
  }

  // 1. Line-by-line syntax & character checks
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    // Check for unescaped '&' (not followed by valid entity like amp;, lt;, gt;, apos;, quot;, #\d+;)
    const ampRegex = /&(?!amp;|lt;|gt;|apos;|quot;|#\d+;|#x[0-9a-fA-F]+;)/g;
    let match: RegExpExecArray | null;
    while ((match = ampRegex.exec(lineText)) !== null) {
      issues.push({
        id: `${filename}-line-${lineNum}-amp-${match.index}`,
        severity: 'error',
        file: filename,
        line: lineNum,
        column: match.index + 1,
        ruleCode: 'XML-UNESCAPED-AMP',
        message: `Karakter '&' belum di-escape menjadi '&amp;' pada baris ${lineNum}.`,
        suggestion: "Ganti karakter '&' dengan '&amp;' sesuai standar XML.",
        fixAvailable: true,
        fixLabel: "Ganti '&' ke '&amp;'",
        fixType: 'escape_amp',
      });
    }

    // Check for unquoted attributes (e.g. key=value instead of key="value")
    const unquotedAttrRegex = /<[a-zA-Z0-9_:-]+\s+[^>]*\b([a-zA-Z0-9_:-]+)=([a-zA-Z0-9_#-]+)(?=[>\s])/;
    const unquotedMatch = lineText.match(unquotedAttrRegex);
    if (unquotedMatch && !lineText.includes(`="${unquotedMatch[2]}"`) && !lineText.includes(`='${unquotedMatch[2]}'`)) {
      issues.push({
        id: `${filename}-line-${lineNum}-unquoted-attr`,
        severity: 'warning',
        file: filename,
        line: lineNum,
        ruleCode: 'XML-UNQUOTED-ATTR',
        message: `Nilai atribut '${unquotedMatch[1]}' tidak diapit tanda kutip pada baris ${lineNum}.`,
        suggestion: `Gunakan tanda kutip ganda, misal: ${unquotedMatch[1]}="${unquotedMatch[2]}"`,
      });
    }

    // Check for invalid hex color format on this line
    const colorMatches = lineText.match(/#[0-9a-fA-F]+/g);
    if (colorMatches) {
      colorMatches.forEach((hex) => {
        // Android/HyperOS supports 4 (#RGB), 7 (#RRGGBB), or 9 (#AARRGGBB) chars
        if (![4, 7, 9].includes(hex.length)) {
          issues.push({
            id: `${filename}-line-${lineNum}-bad-hex-${hex}`,
            severity: 'warning',
            file: filename,
            line: lineNum,
            ruleCode: 'HYPEROS-COLOR-FORMAT',
            message: `Format kode warna '${hex}' tidak valid untuk HyperOS (panjang ${hex.length - 1} digit).`,
            suggestion: 'Gunakan format #RGB, #RRGGBB, atau #AARRGGBB (ARGB Android).',
            fixAvailable: true,
            fixLabel: 'Perbaiki Format Hex',
            fixType: 'fix_hex',
          });
        }
      });
    }
  });

  // 2. Browser DOMParser deep parsing
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'application/xml');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      const errorText = parserError.textContent || 'Syntax error in XML';

      // Extract line number
      const lineMatch =
        errorText.match(/line\s+(\d+)/i) ||
        errorText.match(/Line Number\s*[:\s](\d+)/i) ||
        errorText.match(/:(\d+):(\d+)/) ||
        errorText.match(/line\s*:\s*(\d+)/i);
      const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

      // Extract column number
      const colMatch =
        errorText.match(/column\s+(\d+)/i) ||
        errorText.match(/Column Number\s*[:\s](\d+)/i) ||
        errorText.match(/:(\d+):(\d+)/);
      const columnNumber = colMatch && colMatch[2] ? parseInt(colMatch[2], 10) : undefined;

      // Clean up human-readable message
      let cleanMessage = errorText.replace(/Below is a rendering of the page up to the first error\..*/s, '').trim();
      cleanMessage = cleanMessage.slice(0, 150);

      issues.push({
        id: `${filename}-parsererror-${lineNumber || 0}`,
        severity: 'error',
        file: filename,
        line: lineNumber,
        column: columnNumber,
        ruleCode: 'XML-SYNTAX-ERROR',
        message: `Error sintaks DOMParser pada baris ${lineNumber || '?'}: ${cleanMessage}`,
        suggestion: 'Pastikan seluruh tag pembuka memiliki pasangan penutup, dan tidak ada kurung siku yang tertinggal.',
        fixAvailable: true,
        fixLabel: 'Format Ulang XML',
        fixType: 'format_xml',
      });

      return issues;
    }

    // 3. Domain-specific checks for HyperOS specifications
    if (filename === 'description.xml') {
      const themeRoot = doc.querySelector('theme');
      if (!themeRoot) {
        issues.push({
          id: `${filename}-no-theme-root`,
          severity: 'error',
          file: filename,
          line: 2,
          ruleCode: 'HYPEROS-DESC-ROOT',
          message: 'Root tag <theme> tidak ditemukan pada description.xml.',
          suggestion: 'Bungkus seluruh metadata di dalam tag <theme>...</theme>.',
        });
      } else {
        const title = themeRoot.querySelector('title')?.textContent;
        const author = themeRoot.querySelector('author')?.textContent;
        const version = themeRoot.querySelector('version')?.textContent;
        const uiVersion = themeRoot.querySelector('uiVersion')?.textContent;

        // Find line for title/author if possible
        const titleLine = lines.findIndex((l) => l.includes('<title>')) + 1 || 3;
        const authorLine = lines.findIndex((l) => l.includes('<author>')) + 1 || 4;
        const uiVerLine = lines.findIndex((l) => l.includes('<uiVersion>')) + 1 || 6;

        if (!title || !title.trim()) {
          issues.push({
            id: `${filename}-missing-title`,
            severity: 'error',
            file: filename,
            line: titleLine,
            ruleCode: 'HYPEROS-DESC-TITLE',
            message: 'Tag <title> wajib diisi nama tema.',
            suggestion: 'Masukkan nama tema yang jelas pada <title>Nama Tema</title>.',
          });
        }
        if (!author || !author.trim()) {
          issues.push({
            id: `${filename}-missing-author`,
            severity: 'warning',
            file: filename,
            line: authorLine,
            ruleCode: 'HYPEROS-DESC-AUTHOR',
            message: 'Tag <author> belum diisi nama pembuat.',
            suggestion: 'Sertakan nama author/desainer tema agar diakui Theme Manager.',
          });
        }
        if (!version || !version.trim()) {
          issues.push({
            id: `${filename}-missing-version`,
            severity: 'warning',
            file: filename,
            line: titleLine + 2,
            ruleCode: 'HYPEROS-DESC-VER',
            message: 'Tag <version> tidak terdefinisi.',
            suggestion: 'Gunakan semantic versioning seperti <version>1.0.0</version>.',
          });
        }
        if (!uiVersion || uiVersion.trim() !== '1') {
          issues.push({
            id: `${filename}-missing-uiversion`,
            severity: 'error',
            file: filename,
            line: uiVerLine > 0 ? uiVerLine : 2,
            ruleCode: 'HYPEROS-UIVERSION-REQUIRED',
            message: "Tag <uiVersion> wajib bernilai '1' agar kompatibel dengan engine HyperOS.",
            suggestion: "Tambahkan <uiVersion>1</uiVersion> di dalam blok <theme>.",
            fixAvailable: true,
            fixLabel: 'Tambahkan <uiVersion>1</uiVersion>',
            fixType: 'add_uiversion',
          });
        }
      }
    }

    if (filename.includes('manifest.xml')) {
      const rootTag = doc.documentElement;
      const manifestLine = lines.findIndex((l) => l.includes('<Lockscreen') || l.includes('<manifest')) + 1 || 2;

      if (rootTag.tagName !== 'Lockscreen' && rootTag.tagName !== 'manifest') {
        issues.push({
          id: `${filename}-invalid-root`,
          severity: 'warning',
          file: filename,
          line: manifestLine,
          ruleCode: 'HYPEROS-MANIFEST-ROOT',
          message: `Root tag '${rootTag.tagName}' tidak standar untuk HyperOS manifest.`,
          suggestion: 'Lockscreen MAML memakai root tag <Lockscreen version="1" screenWidth="1080">.',
        });
      }

      if (rootTag.tagName === 'manifest') {
        issues.push({
          id: `${filename}-legacy-root`,
          severity: 'warning',
          file: filename,
          line: manifestLine,
          ruleCode: 'HYPEROS-LOCKSCREEN-ROOT',
          message: 'Root <manifest> bukan format MAML lockscreen yang dikenali Theme Manager.',
          suggestion: 'Ganti menjadi <Lockscreen version="1" frameRate="30" screenWidth="1080">.',
        });
      }
    }
  } catch (err) {
    issues.push({
      id: `${filename}-parse-exception`,
      severity: 'error',
      file: filename,
      line: 1,
      ruleCode: 'XML-EXCEPTION',
      message: `Gagal mem-parsing XML: ${(err as Error).message}`,
    });
  }

  return issues;
}

/**
 * Applies automated quick-fix to an XML string based on the issue type
 */
export function applyQuickFix(xmlContent: string, issue: ValidationIssue): string {
  switch (issue.fixType) {
    case 'escape_amp': {
      // Replace raw '&' not followed by valid entity
      return xmlContent.replace(/&(?!amp;|lt;|gt;|apos;|quot;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
    }
    case 'add_uiversion': {
      if (xmlContent.includes('<uiVersion>')) {
        return xmlContent.replace(/<uiVersion>.*?<\/uiVersion>/g, '<uiVersion>1</uiVersion>');
      }
      if (xmlContent.includes('<theme>')) {
        return xmlContent.replace('<theme>', '<theme>\n  <uiVersion>1</uiVersion>');
      }
      return xmlContent;
    }
    case 'fix_hex': {
      // Replace 5-character hex like #00FF with 7-character #0000FF
      return xmlContent.replace(/#([0-9a-fA-F]{4})\b/g, '#$100');
    }
    case 'format_xml': {
      return formatXml(xmlContent);
    }
    default:
      return xmlContent;
  }
}

/**
 * Runs full diagnostic on current theme configuration and all generated XML files
 */
export function runThemeDiagnostic(
  theme: ThemeConfig,
  customFiles?: XmlFileItem[]
): ValidationReport {
  const files = customFiles || getAllGeneratedThemeFiles(theme);
  const issues: ValidationIssue[] = [];
  let validXmlCount = 0;

  files.forEach((file) => {
    const fileIssues = validateXmlString(file.content, file.path);
    issues.push(...fileIssues);
    const hasError = fileIssues.some((issue) => issue.severity === 'error');
    if (!hasError) {
      validXmlCount++;
    }
  });

  // Wallpaper checks
  if (!theme.wallpaper.url) {
    issues.push({
      id: 'wallpaper-empty',
      severity: 'error',
      file: 'wallpaper/default_wallpaper.jpg',
      line: 1,
      ruleCode: 'HYPEROS-WALLPAPER-MISSING',
      message: 'Wallpaper tema belum ditentukan.',
      suggestion: 'Pilih preset wallpaper Mecha atau unggah gambar sendiri.',
    });
  }

  // Icons check
  const mappedPackages = 12; // default standard mapped packages
  if (theme.icons.scale < 0.7 || theme.icons.scale > 1.3) {
    issues.push({
      id: 'icons-scale-extreme',
      severity: 'warning',
      file: 'icons/transform_config.xml',
      line: 5,
      ruleCode: 'HYPEROS-ICON-SCALE',
      message: `Skala ikon (${theme.icons.scale.toFixed(2)}) terlalu ekstrem.`,
      suggestion: 'Rekomendasi ukuran ikon HyperOS adalah antara 0.85 hingga 1.15.',
    });
  }

  const hasCriticalErrors = issues.some((i) => i.severity === 'error');

  return {
    isValid: !hasCriticalErrors,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    issues,
    stats: {
      totalFiles: files.length + 2, // including wallpaper & preview
      validXmls: validXmlCount,
      packagesMapped: mappedPackages,
      readyForExport: !hasCriticalErrors,
    },
  };
}
