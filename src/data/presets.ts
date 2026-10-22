import { AppIconDefinition, ThemeConfig } from '../types/theme';

export interface WallpaperPreset {
  id: string;
  name: string;
  category: 'mecha' | 'minimal' | 'cyber' | 'glass';
  svgDataUri: string;
  description: string;
}

// Procedural SVG for Tactical Mecha Dark Steel (Matching the user's uploaded image!)
export const MECHA_DARK_WALLPAPER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2400" viewBox="0 0 1080 2400">
  <defs>
    <!-- Dark Titanium Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0b0d" />
      <stop offset="40%" stop-color="#121418" />
      <stop offset="70%" stop-color="#0e1013" />
      <stop offset="100%" stop-color="#07080a" />
    </linearGradient>

    <!-- Metal Plate Surface Gradient -->
    <linearGradient id="plateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e2229" />
      <stop offset="10%" stop-color="#15181d" />
      <stop offset="90%" stop-color="#0f1114" />
      <stop offset="100%" stop-color="#0a0b0d" />
    </linearGradient>

    <!-- Vent Glow Gradient -->
    <linearGradient id="ventGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#001824" />
      <stop offset="50%" stop-color="#002b3d" />
      <stop offset="100%" stop-color="#00121c" />
    </linearGradient>

    <!-- Plate Bevel Shadow -->
    <filter id="plateShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.9" />
    </filter>

    <!-- Screws/Rivets Pattern -->
    <g id="hexRivet">
      <circle cx="0" cy="0" r="14" fill="#0c0e11" stroke="#2a303c" stroke-width="2" />
      <polygon points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" fill="#1c2027" stroke="#3b4455" stroke-width="1.5" />
      <circle cx="0" cy="0" r="3" fill="#08090b" />
    </g>

    <!-- Carbon Fiber pattern -->
    <pattern id="carbonPattern" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#0d0f12" />
      <rect width="6" height="6" fill="#14171c" />
      <rect x="6" y="6" width="6" height="6" fill="#14171c" />
      <line x1="0" y1="0" x2="6" y2="6" stroke="#1d222a" stroke-width="1" />
      <line x1="6" y1="6" x2="12" y2="12" stroke="#1d222a" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Base Dark Canvas -->
  <rect width="1080" height="2400" fill="url(#bgGrad)" />

  <!-- Background Carbon Fiber Inset -->
  <rect x="60" y="80" width="960" height="2240" rx="30" fill="url(#carbonPattern)" opacity="0.65" />

  <!-- Left Main Armor Section -->
  <path d="M 60,100 L 780,100 L 780,500 L 750,540 L 750,1860 L 780,1900 L 780,2300 L 60,2300 Z"
        fill="url(#plateGrad)" stroke="#222832" stroke-width="3" filter="url(#plateShadow)" />

  <!-- Industrial Chamfer Lines & Groove Dividers -->
  <line x1="120" y1="280" x2="720" y2="280" stroke="#050608" stroke-width="4" />
  <line x1="120" y1="282" x2="720" y2="282" stroke="#2c3340" stroke-width="1.5" />

  <line x1="120" y1="880" x2="720" y2="880" stroke="#050608" stroke-width="4" />
  <line x1="120" y1="882" x2="720" y2="882" stroke="#2c3340" stroke-width="1.5" />

  <line x1="120" y1="1520" x2="720" y2="1520" stroke="#050608" stroke-width="4" />
  <line x1="120" y1="1522" x2="720" y2="1522" stroke="#2c3340" stroke-width="1.5" />

  <!-- Right Vertical Vent Grille Section (Exactly as in user photo) -->
  <rect x="810" y="240" width="200" height="1920" rx="16" fill="url(#ventGlow)" stroke="#1a2028" stroke-width="3" />
  <rect x="816" y="246" width="188" height="1908" rx="12" fill="#080a0d" />

  <!-- Repetitive Cooling Vents -->
  ${Array.from({ length: 36 })
    .map((_, i) => {
      const y = 290 + i * 50;
      return `
      <g>
        <rect x="836" y="${y}" width="148" height="24" rx="4" fill="#040507" stroke="#181e26" stroke-width="1" />
        <line x1="844" y1="${y + 2}" x2="976" y2="${y + 2}" stroke="#2e3746" stroke-width="1" opacity="0.6" />
        <rect x="844" y="${y + 6}" width="132" height="12" rx="2" fill="#010203" />
        <line x1="850" y1="${y + 12}" x2="970" y2="${y + 12}" stroke="#003547" stroke-width="2" opacity="0.4" />
      </g>
    `;
    })
    .join('')}

  <!-- Hex Rivets / Industrial Fasteners along structural seams -->
  <use href="#hexRivet" x="120" y="160" />
  <use href="#hexRivet" x="720" y="160" />
  <use href="#hexRivet" x="120" y="580" />
  <use href="#hexRivet" x="720" y="580" />
  <use href="#hexRivet" x="120" y="1200" />
  <use href="#hexRivet" x="720" y="1200" />
  <use href="#hexRivet" x="120" y="1820" />
  <use href="#hexRivet" x="720" y="1820" />
  <use href="#hexRivet" x="120" y="2240" />
  <use href="#hexRivet" x="720" y="2240" />

  <!-- High-Contrast Tactical Data Markings (Clearly readable mechanical aesthetics) -->
  <text x="140" y="270" font-family="'JetBrains Mono', monospace" font-size="34" font-weight="700" fill="#38bdf8" letter-spacing="6" opacity="0.95">SEC-01 // ARMOR CHASSIS</text>
  <text x="140" y="840" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="600" fill="#e2e8f0" letter-spacing="4" opacity="0.9">THERMAL EXHAUST VENT 88-R</text>
  <text x="140" y="1480" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="600" fill="#38bdf8" letter-spacing="4" opacity="0.9">HYPEROS CORE INTEGRITY</text>
  <text x="140" y="1800" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="600" fill="#94a3b8" letter-spacing="3" opacity="0.85">SPEC: XIAOMI HYPEROS // 1080x2400</text>
</svg>
`)}`;

// Procedural SVG for Cyber Neon Grid
export const CYBER_GRID_WALLPAPER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2400" viewBox="0 0 1080 2400">
  <defs>
    <radialGradient id="cyberGlow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#082f49" />
      <stop offset="60%" stop-color="#020617" />
      <stop offset="100%" stop-color="#000000" />
    </radialGradient>
    <linearGradient id="neonCyanLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="50%" stop-color="#06b6d4" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="1080" height="2400" fill="url(#cyberGlow)" />
  <!-- Perspective Floor Grid -->
  <g opacity="0.3">
    ${Array.from({ length: 25 })
      .map((_, i) => `<line x1="0" y1="${800 + i * 65}" x2="1080" y2="${800 + i * 65}" stroke="#0ea5e9" stroke-width="1.5" />`)
      .join('')}
    ${Array.from({ length: 15 })
      .map((_, i) => `<line x1="${i * 80}" y1="800" x2="${-200 + i * 110}" y2="2400" stroke="#0ea5e9" stroke-width="1" />`)
      .join('')}
  </g>
  <circle cx="540" cy="720" r="280" fill="none" stroke="url(#neonCyanLine)" stroke-width="3" opacity="0.7" />
  <circle cx="540" cy="720" r="320" fill="none" stroke="#0ea5e9" stroke-dasharray="10 15" stroke-width="2" opacity="0.4" />
  <!-- Clearly readable Cyber Typography Markings -->
  <text x="120" y="300" font-family="'JetBrains Mono', monospace" font-size="32" font-weight="700" fill="#00f0ff" letter-spacing="6" opacity="0.95">CYBER GRID // MATRIX-01</text>
  <text x="120" y="1460" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="600" fill="#38bdf8" letter-spacing="4" opacity="0.85">NEON SYNAPSE PROTOCOL</text>
  <text x="120" y="1780" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="600" fill="#0284c7" letter-spacing="3" opacity="0.8">HYPEROS REALTIME TELEMETRY</text>
</svg>
`)}`;

// Procedural SVG for Minimal Obsidian
export const OBSIDIAN_WALLPAPER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2400" viewBox="0 0 1080 2400">
  <defs>
    <linearGradient id="obsidianGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141416" />
      <stop offset="50%" stop-color="#090a0c" />
      <stop offset="100%" stop-color="#020203" />
    </linearGradient>
  </defs>
  <rect width="1080" height="2400" fill="url(#obsidianGrad)" />
  <path d="M -100,600 Q 300,450 700,750 T 1200,650 L 1200,2400 L -100,2400 Z" fill="#060709" opacity="0.8" />
  <path d="M -100,1100 Q 450,1300 800,1050 T 1200,1300 L 1200,2400 L -100,2400 Z" fill="#030405" opacity="0.9" />
  <line x1="0" y1="600" x2="1080" y2="750" stroke="#27272a" stroke-width="1" opacity="0.3" />
  <!-- Clearly readable Obsidian Editorial Markings -->
  <text x="120" y="300" font-family="'JetBrains Mono', monospace" font-size="32" font-weight="700" fill="#f1f5f9" letter-spacing="6" opacity="0.9">OBSIDIAN // MONOLITH-EDITION</text>
  <text x="120" y="1480" font-family="'JetBrains Mono', monospace" font-size="26" font-weight="600" fill="#94a3b8" letter-spacing="4" opacity="0.85">MINIMAL ARCHITECTURE // 01</text>
</svg>
`)}`;

// Preset Wallpapers List
export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'mecha_apex',
    name: 'Mecha Dark Chassis (User Concept)',
    category: 'mecha',
    svgDataUri: MECHA_DARK_WALLPAPER_SVG,
    description: 'Matte dark titanium armor, precision vent grilles & tactical chamfers',
  },
  {
    id: 'cyber_grid',
    name: 'Cyberpunk Wireframe',
    category: 'cyber',
    svgDataUri: CYBER_GRID_WALLPAPER_SVG,
    description: 'Perspective cyan laser grid with geometric halo',
  },
  {
    id: 'obsidian_minimal',
    name: 'Obsidian Monolith',
    category: 'minimal',
    svgDataUri: OBSIDIAN_WALLPAPER_SVG,
    description: 'Ultra-dark mineral cuts and subtle organic depth shadows',
  },
];

// Standard HyperOS App List with canonical package names
export const STANDARD_APP_ICONS: AppIconDefinition[] = [
  { id: 'phone', name: 'Phone', packageName: 'com.android.contacts', iconName: 'phone', category: 'system' },
  { id: 'messages', name: 'Messages', packageName: 'com.android.mms', iconName: 'message-square', category: 'system' },
  { id: 'browser', name: 'Mi Browser', packageName: 'com.android.browser', iconName: 'compass', category: 'system' },
  { id: 'camera', name: 'Camera', packageName: 'com.android.camera', iconName: 'camera', category: 'system' },
  { id: 'gallery', name: 'Gallery', packageName: 'com.miui.gallery', iconName: 'image', category: 'media' },
  { id: 'settings', name: 'Settings', packageName: 'com.android.settings', iconName: 'settings', category: 'system' },
  { id: 'security', name: 'Security', packageName: 'com.miui.securitycenter', iconName: 'shield-check', category: 'system' },
  { id: 'themes', name: 'Themes', packageName: 'com.android.thememanager', iconName: 'palette', category: 'system' },
  { id: 'music', name: 'Music', packageName: 'com.miui.player', iconName: 'music', category: 'media' },
  { id: 'whatsapp', name: 'WhatsApp', packageName: 'com.whatsapp', iconName: 'message-circle', category: 'social' },
  { id: 'youtube', name: 'YouTube', packageName: 'com.google.android.youtube', iconName: 'play-square', category: 'media' },
  { id: 'chrome', name: 'Chrome', packageName: 'com.android.chrome', iconName: 'globe', category: 'utility' },
  { id: 'clock', name: 'Clock', packageName: 'com.android.deskclock', iconName: 'clock', category: 'utility' },
  { id: 'calculator', name: 'Calculator', packageName: 'com.miui.calculator', iconName: 'calculator', category: 'utility' },
  { id: 'files', name: 'File Manager', packageName: 'com.mi.android.globalFileexplorer', iconName: 'folder', category: 'utility' },
  { id: 'notes', name: 'Notes', packageName: 'com.miui.notes', iconName: 'file-text', category: 'utility' },
];

// Complete Theme Presets
export const THEME_PRESETS: Record<string, ThemeConfig> = {
  mecha_dark: {
    meta: {
      title: 'Mecha Apex Tactical',
      author: 'Studio Engineer',
      designer: 'Ryandi Design Lab',
      version: '1.2.0',
      description: 'Tactical sci-fi dark matte chassis with industrial vents and stencil clock typography.',
      uiVersion: 'HyperOS 1.0 / 2.0 / 3.0 Ready',
      targetPlatform: 'hyperos_3',
    },
    wallpaper: {
      type: 'preset',
      presetId: 'mecha_apex',
      url: MECHA_DARK_WALLPAPER_SVG,
      blur: 0,
      dim: 0,
      lockscreenSame: true,
      lockscreenUrl: MECHA_DARK_WALLPAPER_SVG,
    },
    lockscreen: {
      clockStyle: 'mecha_stencil',
      clockColor: '#00F0FF',
      clockSize: 1.15,
      clockPosition: 'top',
      depthEffect: true,
      depthIntensity: 8,
      showDate: true,
      showBattery: true,
      customSignature: 'TACTICAL ARMOR // CHASSIS-01',
      bottomShortcuts: {
        left: 'flashlight',
        right: 'camera',
      },
    },
    icons: {
      shape: 'chamfer',
      style: 'mecha_outline',
      accentColor: '#00F0FF',
      scale: 1.0,
      showLabels: true,
      labelColor: '#e2e8f0',
      customIcons: {},
    },
    systemUi: {
      accentColor: '#00F0FF',
      controlCenterBlur: 24,
      batteryStyle: 'inside',
      show5G: true,
      statusBarClockSide: 'left',
      volumeLevel: 75,
      brightnessLevel: 80,
    },
    widgets: {
      activeWidget: 'clock_weather',
      style: 'outline_mecha',
      accentColor: '#00F0FF',
      showMusicControls: true,
      memoTitle: 'TACTICAL OPS // LOG-01',
      memoContent: 'HyperOS core engine status nominal. Power cells at 88%. Cooling vents operational.',
      scale: 1.0,
      position: 'top',
      clockFormat: '24h',
      clockFont: 'rajdhani',
      showDate: true,
    },
  },
  hyper_magazine: {
    meta: {
      title: 'HyperOS Crimson Magazine',
      author: 'Studio Engineer',
      designer: 'HyperOS Creative',
      version: '1.0.0',
      description: 'Vivid editorial typography with depth wallpaper layering and modern squircle icons.',
      uiVersion: 'HyperOS 1.0 / 2.0 / 3.0 Ready',
      targetPlatform: 'hyperos_3',
    },
    wallpaper: {
      type: 'preset',
      presetId: 'obsidian_minimal',
      url: OBSIDIAN_WALLPAPER_SVG,
      blur: 0,
      dim: 5,
      lockscreenSame: true,
      lockscreenUrl: OBSIDIAN_WALLPAPER_SVG,
    },
    lockscreen: {
      clockStyle: 'hyper_magazine',
      clockColor: '#FF4D4D',
      clockSize: 1.25,
      clockPosition: 'top',
      depthEffect: true,
      depthIntensity: 12,
      showDate: true,
      showBattery: true,
      customSignature: 'HYPEROS MAGAZINE ISSUE 08',
      bottomShortcuts: {
        left: 'flashlight',
        right: 'camera',
      },
    },
    icons: {
      shape: 'squircle',
      style: 'hyper_color',
      accentColor: '#FF4D4D',
      scale: 1.0,
      showLabels: true,
      labelColor: '#f1f5f9',
      customIcons: {},
    },
    systemUi: {
      accentColor: '#FF4D4D',
      controlCenterBlur: 20,
      batteryStyle: 'outside',
      show5G: true,
      statusBarClockSide: 'left',
      volumeLevel: 60,
      brightnessLevel: 70,
    },
    widgets: {
      activeWidget: 'clock_weather',
      style: 'glass',
      accentColor: '#FF4D4D',
      showMusicControls: true,
      memoTitle: 'EDITORIAL NOTES',
      memoContent: 'Modern magazine typography with HyperOS depth wallpaper support.',
      scale: 1.05,
      position: 'top',
      clockFormat: '24h',
      clockFont: 'sans',
      showDate: true,
    },
  },
  cyber_neon: {
    meta: {
      title: 'Cyber Grid 2077',
      author: 'Studio Engineer',
      designer: 'Matrix Workshop',
      version: '2.0.0',
      description: 'High frequency neon cyan grid with futuristic digital HUD metrics.',
      uiVersion: 'HyperOS 1.0 / 2.0 / 3.0 Ready',
      targetPlatform: 'hyperos_3',
    },
    wallpaper: {
      type: 'preset',
      presetId: 'cyber_grid',
      url: CYBER_GRID_WALLPAPER_SVG,
      blur: 0,
      dim: 0,
      lockscreenSame: true,
      lockscreenUrl: CYBER_GRID_WALLPAPER_SVG,
    },
    lockscreen: {
      clockStyle: 'digital_tech',
      clockColor: '#00F0FF',
      clockSize: 1.1,
      clockPosition: 'center',
      depthEffect: false,
      depthIntensity: 0,
      showDate: true,
      showBattery: true,
      customSignature: 'CYBERLINK // VERIFIED',
      bottomShortcuts: {
        left: 'flashlight',
        right: 'camera',
      },
    },
    icons: {
      shape: 'hexagon',
      style: 'neon_cyber',
      accentColor: '#00F0FF',
      scale: 1.02,
      showLabels: true,
      labelColor: '#38bdf8',
      customIcons: {},
    },
    systemUi: {
      accentColor: '#00F0FF',
      controlCenterBlur: 26,
      batteryStyle: 'bar',
      show5G: true,
      statusBarClockSide: 'left',
      volumeLevel: 90,
      brightnessLevel: 85,
    },
    widgets: {
      activeWidget: 'music_player',
      style: 'solid_dark',
      accentColor: '#00F0FF',
      showMusicControls: true,
      memoTitle: 'NEON AUDIO DRIVER',
      memoContent: 'Cyberpunk synths streaming at 320kbps. Frequency lock: 104.8 MHz.',
      scale: 1.0,
      position: 'top',
      clockFormat: '24h',
      clockFont: 'jetbrains',
      showDate: true,
    },
  },
  minimal_monochrome: {
    meta: {
      title: 'Monochrome Steel',
      author: 'Studio Engineer',
      designer: 'Mono Atelier',
      version: '1.0.1',
      description: 'Ultra-clean pitch black aesthetics with high contrast architectural lines.',
      uiVersion: 'HyperOS 1.0 / 2.0 / 3.0 Ready',
      targetPlatform: 'hyperos_3',
    },
    wallpaper: {
      type: 'preset',
      presetId: 'obsidian_minimal',
      url: OBSIDIAN_WALLPAPER_SVG,
      blur: 2,
      dim: 10,
      lockscreenSame: true,
      lockscreenUrl: OBSIDIAN_WALLPAPER_SVG,
    },
    lockscreen: {
      clockStyle: 'minimal_pill',
      clockColor: '#FFFFFF',
      clockSize: 1.0,
      clockPosition: 'top',
      depthEffect: false,
      depthIntensity: 0,
      showDate: true,
      showBattery: true,
      customSignature: 'STUDIO MONOCHROME',
      bottomShortcuts: {
        left: 'flashlight',
        right: 'camera',
      },
    },
    icons: {
      shape: 'squircle',
      style: 'minimal_white',
      accentColor: '#FFFFFF',
      scale: 0.98,
      showLabels: true,
      labelColor: '#cbd5e1',
      customIcons: {},
    },
    systemUi: {
      accentColor: '#E2E8F0',
      controlCenterBlur: 20,
      batteryStyle: 'inside',
      show5G: true,
      statusBarClockSide: 'left',
      volumeLevel: 50,
      brightnessLevel: 65,
    },
    widgets: {
      activeWidget: 'device_health',
      style: 'glass',
      accentColor: '#FFFFFF',
      showMusicControls: true,
      memoTitle: 'SYSTEM ATELIER',
      memoContent: 'Monochrome minimalist workspace. All processes quiet and nominal.',
      scale: 0.95,
      position: 'top',
      clockFormat: '24h',
      clockFont: 'sans',
      showDate: true,
    },
  },
};
