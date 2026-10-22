/**
 * HyperOS Theme Configuration & Structure Types
 */

export type ClockStyle = 'mecha_stencil' | 'hyper_magazine' | 'digital_tech' | 'classic_serif' | 'minimal_pill';
export type IconShape = 'squircle' | 'hexagon' | 'chamfer' | 'round' | 'square';
export type IconStyle = 'mecha_outline' | 'hyper_color' | 'minimal_white' | 'neon_cyber' | 'glass';
export type PreviewMode = 'lockscreen' | 'homescreen' | 'widgets' | 'control_center';
export type BatteryStyle = 'inside' | 'outside' | 'pill' | 'circle' | 'bar';
export type WidgetType = 'clock_weather' | 'music_player' | 'device_health' | 'super_folder' | 'tactical_memo' | 'fitness_tracker';
export type WidgetStyle = 'glass' | 'solid_dark' | 'outline_mecha';

export interface AppIconDefinition {
  id: string;
  name: string;
  packageName: string;
  iconName: string; // e.g., 'phone', 'camera', 'settings', 'browser', 'music'
  category: 'system' | 'social' | 'media' | 'utility';
  customUrl?: string;
}

export type AspectTab =
  | 'hub'
  | 'identity'
  | 'wallpaper'
  | 'lockscreen'
  | 'icons'
  | 'widgets'
  | 'systemui'
  | 'preview_publish'
  | 'fonts'
  | 'sounds'
  | 'aod'
  | 'statusbar'
  | 'notification'
  | 'system_colors'
  | 'volume_dialog'
  | 'navigation_bar'
  | 'fingerprint'
  | 'other_ui'
  | 'maml_code'
  | 'nine_patch'
  | 'theme_check';

export interface ThemeConfig {
  meta: {
    title: string;
    author: string;
    designer: string;
    version: string;
    description: string;
    category?: string;
    changelog?: string;
    uiVersion: string; // 'HyperOS 1.0 / 2.0 / 3.0'
    targetPlatform?: 'hyperos_3' | 'hyperos_2' | 'hyperos_1' | 'universal';
  };
  wallpaper: {
    type: 'preset' | 'custom';
    presetId: string;
    url: string;
    blur: number; // 0 - 20
    dim: number; // 0 - 60
    lockscreenSame: boolean;
    lockscreenUrl: string;
  };
  lockscreen: {
    clockStyle: ClockStyle;
    clockColor: string;
    clockSize: number; // 0.8 - 1.4
    clockPosition: 'top' | 'center' | 'left';
    depthEffect: boolean;
    depthIntensity: number;
    showDate: boolean;
    showBattery: boolean;
    customSignature: string;
    bottomShortcuts: {
      left: 'flashlight' | 'dialer' | 'none';
      right: 'camera' | 'browser' | 'none';
    };
    mamlScript?: string;
  };
  icons: {
    shape: IconShape;
    style: IconStyle;
    accentColor: string;
    scale: number; // 0.85 - 1.15
    showLabels: boolean;
    labelColor: string;
    customIcons: Record<string, string>; // packageName -> custom data/image
  };
  systemUi: {
    accentColor: string;
    controlCenterBlur: number;
    batteryStyle: BatteryStyle;
    show5G: boolean;
    statusBarClockSide: 'left' | 'center' | 'right';
    volumeLevel: number;
    brightnessLevel: number;
    surfaceColor?: string;
    notificationBgColor?: string;
    navigationBarColor?: string;
    navigationPillWidth?: number;
    volumeSliderColor?: string;
    fingerprintStyle?: 'cyan_pulse' | 'blue_neon' | 'mecha_ring' | 'matrix_scan' | 'minimal';
    hideElements?: {
      carrierName?: boolean;
      notchIndicator?: boolean;
      lockIcon?: boolean;
      batteryPercentage?: boolean;
    };
  };
  widgets: {
    activeWidget: WidgetType;
    style: WidgetStyle;
    accentColor: string;
    showMusicControls: boolean;
    memoTitle: string;
    memoContent: string;
    // Widget placement & scaling on homescreen
    scale?: number; // 0.80 - 1.25 (default: 1.0)
    position?: 'top' | 'middle' | 'bottom'; // homescreen placement (default: 'top')
    clockFormat?: '24h' | '12h'; // 24-hour vs 12-hour clock
    clockFont?: 'rajdhani' | 'jetbrains' | 'sans' | 'serif';
    showDate?: boolean;
    showSecondWidget?: boolean;
    secondWidget?: WidgetType;
    opacity?: number; // 0.6 - 1.0
  };
  fonts?: {
    family: 'misans' | 'rajdhani' | 'jetbrains' | 'inter' | 'serif';
    scale: number;
    title: string;
  };
  sounds?: {
    lockSound: string;
    unlockSound: string;
    chargeSound: string;
    notificationTone: string;
  };
  aod?: {
    enabled: boolean;
    clockStyle: 'minimal_time' | 'analog_dial' | 'tech_matrix' | 'neon_glow';
    showBattery: boolean;
    showNotificationIcons: boolean;
    customText?: string;
  };
}

export interface XmlFileItem {
  path: string;
  displayName: string;
  content: string;
  category: 'metadata' | 'lockscreen' | 'icons' | 'systemui' | 'home';
}

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  file: string;
  line?: number;
  column?: number;
  message: string;
  suggestion?: string;
  ruleCode?: string;
  fixAvailable?: boolean;
  fixLabel?: string;
  fixType?: 'escape_amp' | 'add_uiversion' | 'format_xml' | 'close_tag' | 'fix_hex';
}

export interface ValidationReport {
  isValid: boolean;
  timestamp: string;
  issues: ValidationIssue[];
  stats: {
    totalFiles: number;
    validXmls: number;
    packagesMapped: number;
    readyForExport: boolean;
  };
}
