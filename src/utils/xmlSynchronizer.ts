import { ThemeConfig, XmlFileItem } from '../types/theme';

/**
 * Synchronizes XML file contents back into the visual ThemeConfig state
 * so that any direct manual edits in the XML editor immediately reflect in the Live Phone Preview!
 */
export function syncXmlToTheme(files: XmlFileItem[], currentTheme: ThemeConfig): ThemeConfig {
  const nextTheme: ThemeConfig = JSON.parse(JSON.stringify(currentTheme));
  const parser = new DOMParser();

  // 1. Parse description.xml
  const desc = files.find((f) => f.path === 'description.xml');
  if (desc) {
    try {
      const doc = parser.parseFromString(desc.content, 'application/xml');
      const title = doc.querySelector('title')?.textContent;
      const author = doc.querySelector('author')?.textContent;
      const designer = doc.querySelector('designer')?.textContent;
      const version = doc.querySelector('version')?.textContent;
      const description = doc.querySelector('description')?.textContent;

      if (title && title.trim()) nextTheme.meta.title = title.trim();
      if (author && author.trim()) nextTheme.meta.author = author.trim();
      if (designer && designer.trim()) nextTheme.meta.designer = designer.trim();
      if (version && version.trim()) nextTheme.meta.version = version.trim();
      if (description && description.trim()) nextTheme.meta.description = description.trim();
    } catch {
      // ignore syntax errors in partial typing
    }
  }

  // 2. Parse lockscreen manifest.xml
  const lock = files.find((f) => f.path.includes('lockscreen'));
  if (lock) {
    try {
      const doc = parser.parseFromString(lock.content, 'application/xml');
      const vars = doc.querySelectorAll('Var');
      vars.forEach((v) => {
        const name = v.getAttribute('name');
        const expr = v.getAttribute('expression');
        if (name === 'clock_color' && expr) {
          const clean = expr.replace(/^'(.*)'$/s, '$1').trim();
          if (clean.startsWith('#')) nextTheme.lockscreen.clockColor = clean;
        }
        if (name === 'signature_text' && expr) {
          nextTheme.lockscreen.customSignature = expr.replace(/^'(.*)'$/s, '$1').trim();
        }
        if (name === 'clock_style' && expr) {
          const style = expr.replace(/^'(.*)'$/s, '$1').trim() as any;
          if (['mecha_stencil', 'hyper_magazine', 'digital_tech', 'classic_serif', 'minimal_pill'].includes(style)) {
            nextTheme.lockscreen.clockStyle = style;
          }
        }
      });

      // DateTime tag format and size
      const dt = doc.querySelector('DateTime');
      if (dt) {
        const sizeAttr = dt.getAttribute('size');
        const colorAttr = dt.getAttribute('color');
        if (sizeAttr && !isNaN(Number(sizeAttr))) {
          nextTheme.lockscreen.clockSize = Math.max(0.7, Math.min(1.5, Number(sizeAttr) / 140));
        }
        if (colorAttr && colorAttr.startsWith('#')) {
          nextTheme.lockscreen.clockColor = colorAttr;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Parse icons manifest.xml
  const icons = files.find((f) => f.path.includes('icons'));
  if (icons) {
    try {
      const doc = parser.parseFromString(icons.content, 'application/xml');
      const mask = doc.querySelector('mask');
      if (mask) {
        const shape = mask.getAttribute('shape') as any;
        if (['squircle', 'hexagon', 'chamfer', 'round', 'square'].includes(shape)) {
          nextTheme.icons.shape = shape;
        }
      }
      const colorFilter = doc.querySelector('color_filter');
      if (colorFilter) {
        const accent = colorFilter.getAttribute('accent');
        if (accent && accent.startsWith('#')) {
          nextTheme.icons.accentColor = accent;
        }
      }
    } catch {
      // ignore
    }
  }

  // 4. Parse systemui theme_values.xml
  const sys = files.find((f) => f.path.includes('systemui'));
  if (sys) {
    try {
      const doc = parser.parseFromString(sys.content, 'application/xml');
      const colors = doc.querySelectorAll('color');
      colors.forEach((c) => {
        const name = c.getAttribute('name');
        const val = c.textContent?.trim();
        if (name === 'qs_tile_bg_on_color' && val && val.startsWith('#')) {
          nextTheme.systemUi.accentColor = val.length === 9 ? `#${val.slice(3)}` : val;
        }
      });
    } catch {
      // ignore
    }
  }

  // 5. Parse com.miui.home theme_values.xml (Widgets & Launcher)
  const home = files.find((f) => f.path.includes('home'));
  if (home) {
    try {
      const doc = parser.parseFromString(home.content, 'application/xml');
      const strings = doc.querySelectorAll('string');
      strings.forEach((s) => {
        const name = s.getAttribute('name');
        const val = s.textContent?.trim();
        if (name === 'active_desktop_widget' && val) {
          nextTheme.widgets.activeWidget = val as any;
        }
        if (name === 'widget_container_style' && val) {
          nextTheme.widgets.style = val as any;
        }
        if (name === 'tactical_memo_title' && val) {
          nextTheme.widgets.memoTitle = val;
        }
      });
      const colors = doc.querySelectorAll('color');
      colors.forEach((c) => {
        const name = c.getAttribute('name');
        const val = c.textContent?.trim();
        if (name === 'widget_card_accent' && val && val.startsWith('#')) {
          nextTheme.widgets.accentColor = val;
        }
      });
    } catch {
      // ignore
    }
  }

  return nextTheme;
}
