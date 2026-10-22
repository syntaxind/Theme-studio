import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Signal,
  Battery,
  Camera,
  Flashlight,
  Phone,
  MessageSquare,
  Compass,
  Settings,
  ShieldCheck,
  Palette,
  Music,
  PlaySquare,
  Globe,
  Sliders,
  Volume2,
  Sun,
  Bluetooth,
  RotateCw,
  Moon,
  Radio,
  Search,
  Check,
  Eye,
  LayoutGrid,
  Play,
  Pause,
  SkipForward,
  Cpu,
  Flame,
  Activity,
  CheckSquare,
  Square,
  Folder,
  Sparkles,
  Zap,
  Wind,
  Droplets,
  Clock,
  Layers,
  ChevronRight,
  Download,
  FolderArchive,
  Package,
  HardDrive,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  SlidersHorizontal,
  Maximize2,
} from 'lucide-react';
import { PreviewMode, ThemeConfig, WidgetType, WidgetStyle } from '../types/theme';
import { STANDARD_APP_ICONS } from '../data/presets';
import {
  getSingleCompiledModule,
  downloadModuleBlob,
  bakeAllStandardIconsToTheme,
} from '../utils/moduleEngine';

interface PhoneSimulatorProps {
  theme: ThemeConfig;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  scale?: number;
  onUpdateTheme?: (updated: ThemeConfig) => void;
  onNavigateToModules?: (moduleId?: string) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  theme,
  previewMode,
  onPreviewModeChange,
  onUpdateTheme,
  onNavigateToModules,
}) => {
  const [torchActive, setTorchActive] = useState(false);
  const [wifiActive, setWifiActive] = useState(true);
  const [bluetoothActive, setBluetoothActive] = useState(true);
  const [volume, setVolume] = useState(theme.systemUi.volumeLevel);
  const [brightness, setBrightness] = useState(theme.systemUi.brightnessLevel);

  // Widget interactivity states
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [isBoostingRam, setIsBoostingRam] = useState(false);
  const [ramFreedToast, setRamFreedToast] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    task1: true,
    task2: true,
    task3: false,
  });

  // Real Module Engine states
  const [isBakingIcons, setIsBakingIcons] = useState(false);
  const [isDownloadingModule, setIsDownloadingModule] = useState(false);
  const [moduleActionToast, setModuleActionToast] = useState<string | null>(null);
  const [clarifyWallpaperText, setClarifyWallpaperText] = useState(false);

  // Count of baked PNG icons
  const bakedIconsCount = Object.keys(theme.icons.customIcons || {}).length;

  // Active module corresponding to preview mode
  const getActiveModuleInfo = () => {
    switch (previewMode) {
      case 'lockscreen':
        return {
          id: 'lockscreen',
          name: 'lockscreen',
          type: 'Sub-Arsip Biner (DEFLATE)',
          path: 'lockscreen/advance/manifest.xml',
          desc: 'Mesin layar kunci HyperOS dengan manifest XML dan ikon shortcut PNG.',
        };
      case 'homescreen':
      case 'widgets':
        return {
          id: 'icons',
          name: 'icons',
          type: 'Sub-Arsip Biner (DEFLATE)',
          path: 'icons/ (16 PNG 192x192 + manifest)',
          desc: 'Kumpulan berkas biner PNG 192x192 asli untuk seluruh package aplikasi Xiaomi.',
        };
      case 'control_center':
        return {
          id: 'systemui',
          name: 'com.android.systemui',
          type: 'Sub-Arsip Biner (DEFLATE)',
          path: 'com.android.systemui/theme_values.xml',
          desc: 'Nilai warna, slider volume & kecerahan, toggle quick settings HyperOS.',
        };
    }
  };

  const handleBakeAllIcons = async () => {
    if (!onUpdateTheme || isBakingIcons) return;
    setIsBakingIcons(true);
    setModuleActionToast('Mengompilasi 16 berkas PNG 192x192 asli...');
    try {
      const baked = await bakeAllStandardIconsToTheme(theme);
      onUpdateTheme(baked);
      setModuleActionToast('16 Berkas PNG asli berhasil disimpan ke modul ikon!');
      setTimeout(() => setModuleActionToast(null), 3000);
    } catch {
      setModuleActionToast('Gagal mengompilasi ikon');
      setTimeout(() => setModuleActionToast(null), 2500);
    } finally {
      setIsBakingIcons(false);
    }
  };

  const handleDownloadCurrentModule = async () => {
    const modInfo = getActiveModuleInfo();
    setIsDownloadingModule(true);
    setModuleActionToast(`Menyiapkan modul biner ${modInfo.name}...`);
    try {
      const mod = await getSingleCompiledModule(theme, modInfo.id);
      if (mod) {
        downloadModuleBlob(mod.blob, mod.name);
        setModuleActionToast(`Berkas modul ${mod.name} berhasil diunduh!`);
      } else {
        setModuleActionToast(`Gagal menemukan modul ${modInfo.name}`);
      }
      setTimeout(() => setModuleActionToast(null), 3000);
    } catch {
      setModuleActionToast('Gagal mengunduh modul biner');
      setTimeout(() => setModuleActionToast(null), 2500);
    } finally {
      setIsDownloadingModule(false);
    }
  };

  // Time representation
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

  // RAM booster simulation
  const handleBoostRam = () => {
    if (isBoostingRam) return;
    setIsBoostingRam(true);
    setTimeout(() => {
      setIsBoostingRam(false);
      setRamFreedToast('RAM dioptimalkan! +1.4 GB ruang dibebaskan');
      setTimeout(() => setRamFreedToast(null), 3000);
    }, 1200);
  };

  // Toggle tasks
  const handleToggleTask = (id: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Switch active widget
  const handleSelectActiveWidget = (widgetType: WidgetType) => {
    if (onUpdateTheme) {
      onUpdateTheme({
        ...theme,
        widgets: {
          ...theme.widgets,
          activeWidget: widgetType,
        },
      });
    }
  };

  // Switch widget style
  const handleSelectWidgetStyle = (style: WidgetStyle) => {
    if (onUpdateTheme) {
      onUpdateTheme({
        ...theme,
        widgets: {
          ...theme.widgets,
          style,
        },
      });
    }
  };

  // Helper to update widget configuration
  const handleUpdateWidgetConfig = (partial: Partial<ThemeConfig['widgets']>) => {
    if (!onUpdateTheme) return;
    onUpdateTheme({
      ...theme,
      widgets: {
        ...theme.widgets,
        ...partial,
      },
    });
  };

  // Icon shape classes
  const getIconShapeClass = () => {
    switch (theme.icons.shape) {
      case 'squircle':
        return 'rounded-2xl';
      case 'round':
        return 'rounded-full';
      case 'chamfer':
        return 'rounded-lg [clip-path:polygon(12%_0%,88%_0%,100%_12%,100%_88%,88%_100%,12%_100%,0%_88%,0%_12%)]';
      case 'hexagon':
        return '[clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]';
      case 'square':
      default:
        return 'rounded-md';
    }
  };

  // Icon style classes
  const getIconContainerStyle = () => {
    switch (theme.icons.style) {
      case 'mecha_outline':
        return {
          backgroundColor: '#0d1117',
          borderColor: theme.icons.accentColor,
          borderWidth: '1.5px',
          boxShadow: `0 0 10px ${theme.icons.accentColor}25`,
        };
      case 'neon_cyber':
        return {
          backgroundColor: '#030712',
          borderColor: theme.icons.accentColor,
          borderWidth: '2px',
          boxShadow: `0 0 14px ${theme.icons.accentColor}40`,
        };
      case 'minimal_white':
        return {
          backgroundColor: '#18181b',
          borderColor: '#3f3f46',
          borderWidth: '1px',
        };
      case 'hyper_color':
      default:
        return {
          backgroundColor: '#1e293b',
          borderColor: '#334155',
          borderWidth: '1px',
        };
    }
  };

  const getIconGlyphColor = (cat: string) => {
    if (theme.icons.style === 'mecha_outline' || theme.icons.style === 'neon_cyber') {
      return theme.icons.accentColor;
    }
    if (theme.icons.style === 'minimal_white') {
      return '#f8fafc';
    }
    switch (cat) {
      case 'system':
        return '#38bdf8';
      case 'media':
        return '#f43f5e';
      case 'social':
        return '#22c55e';
      case 'utility':
      default:
        return '#eab308';
    }
  };

  const renderIconGlyph = (iconName: string, color: string) => {
    const props = { size: 20, color };
    switch (iconName) {
      case 'phone':
        return <Phone {...props} />;
      case 'message-square':
        return <MessageSquare {...props} />;
      case 'compass':
        return <Compass {...props} />;
      case 'camera':
        return <Camera {...props} />;
      case 'image':
        return <Palette {...props} />;
      case 'settings':
        return <Settings {...props} />;
      case 'shield-check':
        return <ShieldCheck {...props} />;
      case 'palette':
        return <Palette {...props} />;
      case 'music':
        return <Music {...props} />;
      case 'play-square':
        return <PlaySquare {...props} />;
      case 'globe':
        return <Globe {...props} />;
      default:
        return <Sliders {...props} />;
    }
  };

  // Helper to render individual standard app icon
  const renderAppIcon = (app: (typeof STANDARD_APP_ICONS)[number]) => (
    <div key={app.id} className="flex flex-col items-center gap-1 group cursor-pointer">
      <div
        className={`w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 overflow-hidden ${getIconShapeClass()}`}
        style={{
          ...getIconContainerStyle(),
          transform: `scale(${theme.icons.scale})`,
        }}
      >
        {theme.icons.customIcons?.[app.packageName] ? (
          <img
            src={theme.icons.customIcons[app.packageName]}
            alt={app.name}
            className="w-full h-full object-cover"
          />
        ) : (
          renderIconGlyph(app.iconName, getIconGlyphColor(app.category))
        )}
      </div>
      {theme.icons.showLabels && (
        <span
          className="text-[10px] font-medium tracking-tight truncate max-w-[62px] text-center"
          style={{ color: theme.icons.labelColor }}
        >
          {app.name}
        </span>
      )}
    </div>
  );

  // Widget Container Theming
  const getWidgetCardStyle = (overrideStyle?: WidgetStyle) => {
    const activeStyle = overrideStyle || theme.widgets?.style || 'outline_mecha';
    const accent = theme.widgets?.accentColor || theme.icons.accentColor || '#00F0FF';

    switch (activeStyle) {
      case 'outline_mecha':
        return {
          background: 'linear-gradient(145deg, rgba(13, 17, 23, 0.90), rgba(2, 6, 23, 0.95))',
          borderColor: accent,
          borderWidth: '1.5px',
          boxShadow: `0 0 16px ${accent}25, inset 0 1px 1px rgba(255,255,255,0.12)`,
        };
      case 'solid_dark':
        return {
          background: 'rgba(15, 23, 42, 0.92)',
          borderColor: '#334155',
          borderWidth: '1px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
        };
      case 'glass':
      default:
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          borderWidth: '1px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.2)',
        };
    }
  };

  const widgetAccent = theme.widgets?.accentColor || theme.icons.accentColor || '#00F0FF';
  const widgetPosition = theme.widgets?.position || 'top';
  const widgetScale = theme.widgets?.scale || 1.0;

  // Format hours and minutes according to theme.widgets.clockFormat
  const getWidgetClockDisplay = () => {
    const is12h = theme.widgets?.clockFormat === '12h';
    if (is12h) {
      const hNum = parseInt(hours, 10);
      const h12 = hNum % 12 || 12;
      const ampm = hNum >= 12 ? 'PM' : 'AM';
      return {
        time: `${h12.toString().padStart(2, '0')}:${minutes}`,
        suffix: ampm,
      };
    }
    return {
      time: `${hours}:${minutes}`,
      suffix: 'WIB',
    };
  };

  const getWidgetClockFontClass = () => {
    switch (theme.widgets?.clockFont) {
      case 'jetbrains':
        return 'font-code font-bold';
      case 'serif':
        return 'font-serif italic font-bold';
      case 'sans':
        return 'font-sans font-extrabold';
      case 'rajdhani':
      default:
        return 'font-tech font-bold tracking-tight';
    }
  };

  // Render individual widget views
  const renderSingleWidget = (type: WidgetType, isCompactOnHome = false) => {
    switch (type) {
      // 1. CLOCK & WEATHER WIDGET (4x2 Dual-Dial / Minimal)
      case 'clock_weather':
        return (
          <div
            className={`rounded-2xl p-3.5 transition-all relative overflow-hidden select-none ${
              isCompactOnHome ? 'w-full' : 'w-full'
            }`}
            style={getWidgetCardStyle()}
          >
            {/* Subtle corner badge for mecha style */}
            {theme.widgets?.style === 'outline_mecha' && (
              <div
                className="absolute top-0 right-0 w-8 h-2 rounded-bl-sm"
                style={{ backgroundColor: widgetAccent }}
              />
            )}

            <div className="flex items-center justify-between">
              {/* Left: Time & Location */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl tabular-nums leading-none ${getWidgetClockFontClass()}`}
                    style={{ color: widgetAccent }}
                  >
                    {getWidgetClockDisplay().time}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {getWidgetClockDisplay().suffix}
                  </span>
                </div>
                {theme.widgets?.showDate !== false && (
                  <div className="text-[11px] font-medium text-neutral-300 mt-1 flex items-center gap-1">
                    <span>{dateStr}</span>
                    <span className="text-neutral-500">•</span>
                    <span className="text-neutral-400">Jakarta</span>
                  </div>
                )}
              </div>

              {/* Right: Weather & Temp */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner"
                  style={{ backgroundColor: `${widgetAccent}20`, border: `1px solid ${widgetAccent}40` }}
                >
                  ☀️
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white leading-tight">29°C</div>
                  <div className="text-[10px] text-neutral-400">Cerah Berawan</div>
                </div>
              </div>
            </div>

            {/* Bottom info strip: AQI & Humidity */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AQI 24 Bagus
                </span>
                <span className="flex items-center gap-0.5">
                  <Droplets size={10} className="text-cyan-400" />
                  <span>62%</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <Wind size={10} className="text-neutral-400" />
                  <span>12 km/j</span>
                </span>
              </div>
              <span className="text-[9px] font-mono text-neutral-400 uppercase">HyperOS Weather</span>
            </div>
          </div>
        );

      // 2. HI-FI AUDIO & MUSIC PLAYER WIDGET (4x2 or 2x2)
      case 'music_player':
        return (
          <div
            className="rounded-2xl p-3.5 transition-all relative overflow-hidden select-none"
            style={getWidgetCardStyle()}
          >
            <div className="flex items-center gap-3">
              {/* Rotating / Glowing Vinyl Album Art */}
              <div
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0 transition-transform ${
                  isPlayingMusic ? 'rotate-animation' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: `1.5px solid ${widgetAccent}`,
                  boxShadow: `0 0 12px ${widgetAccent}40`,
                }}
              >
                <div className="w-4 h-4 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: widgetAccent }} />
                </div>
                <Music size={16} className="absolute text-white/40" />
              </div>

              {/* Track Title & Artist */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>Mecha Odyssey // Apex Wave</span>
                  {isPlayingMusic && (
                    <span className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 h-3 bg-cyan-400 animate-pulse rounded-full" />
                      <span className="w-0.5 h-2 bg-cyan-400 animate-pulse rounded-full delay-75" />
                      <span className="w-0.5 h-2.5 bg-cyan-400 animate-pulse rounded-full delay-150" />
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                  HyperOS Studio Soundtrack • 320kbps Hi-Fi
                </div>

                {/* Simulated Progress Bar */}
                <div className="w-full bg-neutral-800 rounded-full h-1 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: '48%', backgroundColor: widgetAccent }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                <button
                  type="button"
                  onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold shadow-md transition-transform active:scale-90"
                  style={{ backgroundColor: widgetAccent }}
                  title={isPlayingMusic ? 'Jeda' : 'Putar'}
                >
                  {isPlayingMusic ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90"
                >
                  <SkipForward size={13} />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[9px] text-neutral-400">
              <span className="font-mono">01:42 / 03:30</span>
              <span className="flex items-center gap-1">
                <Volume2 size={10} style={{ color: widgetAccent }} />
                <span>Xiaomi Sound Surround</span>
              </span>
            </div>
          </div>
        );

      // 3. DEVICE HEALTH & TURBO BOOST WIDGET (2x2 / 4x2)
      case 'device_health':
        return (
          <div
            className="rounded-2xl p-3.5 transition-all relative overflow-hidden select-none"
            style={getWidgetCardStyle()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-white/10" style={{ color: widgetAccent }}>
                  <Cpu size={14} />
                </div>
                <span className="text-xs font-bold text-white">Status Sistem & RAM</span>
              </div>
              <button
                type="button"
                onClick={handleBoostRam}
                disabled={isBoostingRam}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-black transition-all active:scale-95"
                style={{ backgroundColor: widgetAccent }}
              >
                <Zap size={11} className={isBoostingRam ? 'animate-spin' : ''} />
                <span>{isBoostingRam ? 'Boosting...' : 'Bersihkan'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              {/* RAM Usage */}
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center">
                <span className="text-[9px] text-neutral-400 font-medium">RAM Bebas</span>
                <span
                  className="text-sm font-extrabold font-mono mt-0.5 leading-tight"
                  style={{ color: widgetAccent }}
                >
                  {isBoostingRam ? '7.2 GB' : '5.8 GB'}
                </span>
                <span className="text-[8px] text-neutral-500">dari 12 GB</span>
              </div>

              {/* CPU Temp */}
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center">
                <span className="text-[9px] text-neutral-400 font-medium">Suhu CPU</span>
                <span className="text-sm font-extrabold text-white font-mono mt-0.5 leading-tight">
                  34°C
                </span>
                <span className="text-[8px] text-emerald-400 font-medium">Normal</span>
              </div>

              {/* Storage */}
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center">
                <span className="text-[9px] text-neutral-400 font-medium">Memori</span>
                <span className="text-sm font-extrabold text-white font-mono mt-0.5 leading-tight">
                  128 GB
                </span>
                <span className="text-[8px] text-neutral-500">Tersedia</span>
              </div>
            </div>

            {/* RAM feedback toast */}
            {ramFreedToast && (
              <div className="mt-2 text-center text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/40 py-1 rounded-lg">
                {ramFreedToast}
              </div>
            )}
          </div>
        );

      // 4. TACTICAL MEMO & TASK CARD WIDGET
      case 'tactical_memo':
        return (
          <div
            className="rounded-2xl p-3.5 transition-all relative overflow-hidden select-none"
            style={getWidgetCardStyle()}
          >
            {/* Top Pin / Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: widgetAccent }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider font-mono truncate max-w-[190px]"
                  style={{ color: widgetAccent }}
                >
                  {theme.widgets?.memoTitle || 'TACTICAL OPS // LOG-01'}
                </span>
              </div>
              <span className="text-[9px] text-neutral-400 font-mono">Pinned</span>
            </div>

            {/* Note text */}
            <p className="text-[11px] text-neutral-200 line-clamp-2 leading-relaxed">
              {theme.widgets?.memoContent ||
                'HyperOS core engine status nominal. Power cells at 88%. Cooling vents operational.'}
            </p>

            {/* Mini Checklist */}
            <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
              <div
                onClick={() => handleToggleTask('task1')}
                className="flex items-center gap-2 text-[10px] text-neutral-300 cursor-pointer hover:text-white"
              >
                {completedTasks.task1 ? (
                  <CheckSquare size={12} style={{ color: widgetAccent }} />
                ) : (
                  <Square size={12} className="text-neutral-500" />
                )}
                <span className={completedTasks.task1 ? 'line-through text-neutral-500' : ''}>
                  Desain arsitektur tema .MTZ
                </span>
              </div>
              <div
                onClick={() => handleToggleTask('task2')}
                className="flex items-center gap-2 text-[10px] text-neutral-300 cursor-pointer hover:text-white"
              >
                {completedTasks.task2 ? (
                  <CheckSquare size={12} style={{ color: widgetAccent }} />
                ) : (
                  <Square size={12} className="text-neutral-500" />
                )}
                <span className={completedTasks.task2 ? 'line-through text-neutral-500' : ''}>
                  Uji kedalaman layar kunci & jam
                </span>
              </div>
            </div>
          </div>
        );

      // 5. HYPEROS 2.0 SUPER FOLDER WIDGET
      case 'super_folder':
        return (
          <div
            className="rounded-2xl p-3 transition-all relative overflow-hidden select-none"
            style={getWidgetCardStyle()}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Folder size={13} style={{ color: widgetAccent }} />
                <span>Super Folder: Utilitas</span>
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">HyperOS 2.0</span>
            </div>

            {/* 4 enlarged quick launch apps */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'Kamera', icon: 'camera', cat: 'system' },
                { name: 'Musik', icon: 'music', cat: 'media' },
                { name: 'Pengaturan', icon: 'settings', cat: 'system' },
                { name: 'Browser', icon: 'compass', cat: 'system' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      border: `1px solid ${widgetAccent}40`,
                    }}
                  >
                    {renderIconGlyph(item.icon, widgetAccent)}
                  </div>
                  <span className="text-[9px] text-neutral-300 truncate max-w-[48px]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      // 6. FITNESS & STEP TRACKER WIDGET
      case 'fitness_tracker':
      default:
        return (
          <div
            className="rounded-2xl p-3.5 transition-all relative overflow-hidden select-none"
            style={getWidgetCardStyle()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded-md bg-white/10" style={{ color: widgetAccent }}>
                  <Activity size={14} />
                </div>
                <span className="text-xs font-bold text-white">Aktivitas & Langkah</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400">84% Target</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              {/* Step counter */}
              <div className="flex flex-col">
                <span
                  className="text-2xl font-black font-mono tracking-tight leading-none"
                  style={{ color: widgetAccent }}
                >
                  8,420
                </span>
                <span className="text-[10px] text-neutral-400 mt-1">Langkah / 10,000</span>
              </div>

              {/* Calories & Distance stats */}
              <div className="flex items-center gap-3 pr-1">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-400 justify-end">
                    <Flame size={12} />
                    <span>412</span>
                  </div>
                  <span className="text-[9px] text-neutral-400">Kkal</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10" />
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-300">5.8</div>
                  <span className="text-[9px] text-neutral-400">km</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const widgetTypeList: { id: WidgetType; label: string; icon: string }[] = [
    { id: 'clock_weather', label: 'Cuaca & Jam', icon: '☀️' },
    { id: 'music_player', label: 'Hi-Fi Musik', icon: '🎵' },
    { id: 'device_health', label: 'Status RAM', icon: '⚡' },
    { id: 'tactical_memo', label: 'Memo Taktis', icon: '📝' },
    { id: 'super_folder', label: 'Super Folder', icon: '📁' },
    { id: 'fitness_tracker', label: 'Langkah', icon: '🏃' },
  ];

  return (
    <div className="flex flex-col items-center select-none">
      {/* View Mode Segmented Control Bar (Includes the new 'widgets' Preview Mode) */}
      <div className="mb-2 flex flex-wrap items-center justify-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl shadow-inner gap-0.5">
        <button
          type="button"
          onClick={() => onPreviewModeChange('lockscreen')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            previewMode === 'lockscreen'
              ? 'bg-neutral-800 text-cyan-400 shadow-sm border border-neutral-700 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Moon size={13} />
          <span>Layar Kunci</span>
        </button>

        <button
          type="button"
          onClick={() => onPreviewModeChange('homescreen')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            previewMode === 'homescreen'
              ? 'bg-neutral-800 text-cyan-400 shadow-sm border border-neutral-700 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders size={13} />
          <span>Layar Utama</span>
        </button>

        {/* NEW WIDGET PREVIEW PANEL BUTTON */}
        <button
          type="button"
          onClick={() => onPreviewModeChange('widgets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            previewMode === 'widgets'
              ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40 font-bold'
              : 'text-neutral-300 hover:text-white'
          }`}
        >
          <LayoutGrid size={13} className="text-cyan-400" />
          <span>Panel Widget</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        <button
          type="button"
          onClick={() => onPreviewModeChange('control_center')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            previewMode === 'control_center'
              ? 'bg-neutral-800 text-cyan-400 shadow-sm border border-neutral-700 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <RotateCw size={13} />
          <span>Pusat Kontrol</span>
        </button>
      </div>

      {/* Quick Wallpaper & Background Text Clarity Switch */}
      <div className="mb-3 flex items-center justify-between w-[340px] sm:w-[370px] px-2 text-[11px]">
        <span className="text-neutral-400 font-medium flex items-center gap-1.5">
          <Eye size={12} className="text-cyan-400" />
          <span>Tulisan di Belakang:</span>
        </span>
        <button
          type="button"
          onClick={() => setClarifyWallpaperText(!clarifyWallpaperText)}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-medium transition-all ${
            clarifyWallpaperText
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
          }`}
          title="Perjelas seluruh tulisan & data mekanikal pada wallpaper (hilangkan blur & redup)"
        >
          <span>{clarifyWallpaperText ? '✓ Teks Belakang Tajam' : 'Perjelas Teks Belakang'}</span>
        </button>
      </div>

      {/* Realistic Xiaomi Flagship Phone Bezel Frame */}
      <div
        className="relative w-[340px] sm:w-[370px] h-[720px] rounded-[50px] p-[10px] shadow-2xl transition-all duration-300"
        style={{
          background: 'linear-gradient(145deg, #2b303c, #0d0f14 45%, #1b1f28)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), inset 0 1px 2px rgba(255,255,255,0.2), 0 0 0 1px #374151',
        }}
      >
        {/* Antenna Lines on Titanium Frame */}
        <div className="absolute -left-[2px] top-24 w-[2px] h-3 bg-neutral-600 rounded-sm" />
        <div className="absolute -left-[2px] top-36 w-[2px] h-10 bg-neutral-600 rounded-sm" />
        <div className="absolute -right-[2px] top-28 w-[2px] h-8 bg-neutral-600 rounded-sm" />

        {/* Outer Screen Glass Border */}
        <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-black border border-black flex flex-col">
          {/* Wallpaper Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-300"
            style={{
              backgroundImage: `url(${theme.wallpaper.url})`,
              filter: clarifyWallpaperText
                ? 'brightness(110%) contrast(105%)'
                : `blur(${theme.wallpaper.blur}px) brightness(${100 - theme.wallpaper.dim}%)`,
            }}
          />

          {/* Top Status Bar with Punch Hole Camera */}
          <div className="relative z-30 pt-3 px-6 pb-2 flex items-center justify-between text-white text-[12px] font-medium tracking-tight">
            {/* Left Clock */}
            <span className="font-semibold tabular-nums">{hours}:{minutes}</span>

            {/* HyperOS Punch-Hole Camera */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900/80" />
            </div>

            {/* Right Status Icons */}
            <div className="flex items-center gap-1.5">
              {theme.systemUi.show5G && (
                <span className="text-[10px] font-bold tracking-tighter bg-white/20 px-1 rounded text-white">5G</span>
              )}
              <Signal size={13} className="text-white" />
              <Wifi size={13} className="text-white" />
              <div className="flex items-center gap-0.5">
                {theme.systemUi.batteryStyle === 'inside' ? (
                  <div className="relative flex items-center">
                    <Battery size={16} className="text-white" />
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold">88</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] font-semibold">88%</span>
                    <Battery size={15} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SCREEN CONTENT AREA (Switchable) */}
          <div className="relative z-20 flex-1 flex flex-col overflow-hidden">
            {/* MODE 1: LOCK SCREEN */}
            {previewMode === 'lockscreen' && (
              <div className="flex-1 flex flex-col justify-between p-6">
                {/* Upper Clock & Date Area */}
                <div
                  className={`flex flex-col pt-4 ${
                    theme.lockscreen.clockPosition === 'center'
                      ? 'items-center my-auto'
                      : theme.lockscreen.clockPosition === 'left'
                      ? 'items-start text-left'
                      : 'items-center text-center'
                  }`}
                >
                  {/* Lock Status Pill */}
                  <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-neutral-300/80 tracking-wide">
                    <span>Terbuka via Wajah</span>
                  </div>

                  {/* Clock Typography Render */}
                  {theme.lockscreen.clockStyle === 'mecha_stencil' && (
                    <div
                      className="font-tech font-bold tracking-wider leading-none select-none transition-all drop-shadow-md"
                      style={{
                        color: theme.lockscreen.clockColor,
                        fontSize: `${4.2 * theme.lockscreen.clockSize}rem`,
                        textShadow: `0 0 20px ${theme.lockscreen.clockColor}50`,
                      }}
                    >
                      {hours}:{minutes}
                    </div>
                  )}

                  {theme.lockscreen.clockStyle === 'hyper_magazine' && (
                    <div className="flex flex-col items-center">
                      <div
                        className="font-extrabold tracking-tighter leading-[0.85] text-center select-none drop-shadow-lg"
                        style={{
                          color: theme.lockscreen.clockColor,
                          fontSize: `${5.2 * theme.lockscreen.clockSize}rem`,
                        }}
                      >
                        {hours}
                      </div>
                      <div
                        className="font-extrabold tracking-tighter leading-[0.85] text-center select-none drop-shadow-lg"
                        style={{
                          color: theme.lockscreen.clockColor,
                          fontSize: `${5.2 * theme.lockscreen.clockSize}rem`,
                        }}
                      >
                        {minutes}
                      </div>
                    </div>
                  )}

                  {theme.lockscreen.clockStyle === 'digital_tech' && (
                    <div
                      className="font-code font-bold tracking-widest leading-none select-none px-4 py-1.5 rounded-lg border border-cyan-500/30 bg-black/40 backdrop-blur-sm"
                      style={{
                        color: theme.lockscreen.clockColor,
                        fontSize: `${3.4 * theme.lockscreen.clockSize}rem`,
                        boxShadow: `0 0 16px ${theme.lockscreen.clockColor}30`,
                      }}
                    >
                      {hours}:{minutes}
                    </div>
                  )}

                  {theme.lockscreen.clockStyle === 'classic_serif' && (
                    <div
                      className="font-serif italic font-bold tracking-tight leading-none select-none"
                      style={{
                        color: theme.lockscreen.clockColor,
                        fontSize: `${4.4 * theme.lockscreen.clockSize}rem`,
                      }}
                    >
                      {hours}:{minutes}
                    </div>
                  )}

                  {theme.lockscreen.clockStyle === 'minimal_pill' && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
                      <span
                        className="font-bold text-2xl tracking-tight"
                        style={{ color: theme.lockscreen.clockColor }}
                      >
                        {hours}:{minutes}
                      </span>
                      <span className="text-xs text-neutral-300">28°C Cerah</span>
                    </div>
                  )}

                  {/* Date Display */}
                  {theme.lockscreen.showDate && (
                    <div
                      className="mt-2 text-sm font-medium tracking-wide drop-shadow"
                      style={{ color: theme.lockscreen.clockColor, opacity: 0.85 }}
                    >
                      {dateStr}
                    </div>
                  )}

                  {/* Custom Signature / Cap Perangkat Kustom (Tulisan di Belakang) */}
                  {theme.lockscreen.customSignature && (
                    <div className="mt-2.5 px-3.5 py-1 rounded-full bg-black/80 border border-cyan-500/50 backdrop-blur-md shadow-lg text-center max-w-[280px]">
                      <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-300 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {theme.lockscreen.customSignature}
                      </span>
                    </div>
                  )}
                </div>

                {/* Simulated Depth Effect Layer Tag */}
                {theme.lockscreen.depthEffect && (
                  <div className="self-center flex items-center gap-1.5 px-3 py-1 bg-black/80 border border-cyan-400/60 rounded-full text-[10px] font-bold text-cyan-300 shadow-md backdrop-blur-md">
                    <Eye size={12} className="text-cyan-400" />
                    <span>HyperOS Depth Effect (Tulisan di Belakang Subjek Aktif)</span>
                  </div>
                )}

                {/* Bottom Lockscreen Shortcuts & Swipe Indicator */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={() => setTorchActive(!torchActive)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 ${
                        torchActive
                          ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/50'
                          : 'bg-black/50 border border-white/20 text-white hover:bg-black/70'
                      }`}
                    >
                      <Flashlight size={18} />
                    </button>
                    <div className="text-[11px] text-neutral-300/80 font-medium tracking-wider">
                      Geser ke atas untuk membuka
                    </div>
                    <button
                      type="button"
                      className="w-11 h-11 rounded-full flex items-center justify-center bg-black/50 border border-white/20 text-white backdrop-blur-md hover:bg-black/70 active:scale-95"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  {/* Home Indicator Pill */}
                  <div className="w-28 h-1 rounded-full bg-white/70" />
                </div>
              </div>
            )}

            {/* MODE 2: HOME SCREEN WITH LIVE DYNAMIC CUSTOM WIDGET */}
            {previewMode === 'homescreen' && (
              <div className="flex-1 flex flex-col justify-between p-3.5 pb-2">
                {/* WIDGET CONTROLS & SELECTION BAR */}
                <div className="flex items-center justify-between px-1 mb-1 bg-black/40 backdrop-blur-md rounded-xl p-1 border border-white/10">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {widgetTypeList.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleSelectActiveWidget(w.id)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                          (theme.widgets?.activeWidget || 'clock_weather') === w.id
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 shadow-sm'
                            : 'bg-white/5 text-neutral-400 hover:text-white border border-transparent'
                        }`}
                      >
                        <span>{w.icon}</span>
                        <span>{w.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Position Toggle & Scale Badge */}
                  <div className="flex items-center gap-1 ml-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const nextPos =
                          widgetPosition === 'top'
                            ? 'middle'
                            : widgetPosition === 'middle'
                            ? 'bottom'
                            : 'top';
                        handleUpdateWidgetConfig({ position: nextPos });
                      }}
                      className="px-1.5 py-0.5 rounded-md text-[8.5px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60 flex items-center gap-0.5 transition-colors"
                      title="Ubah posisi penempatan widget (Atas / Tengah / Bawah)"
                    >
                      <MoveVertical size={10} />
                      <span>{widgetPosition === 'top' ? 'ATAS' : widgetPosition === 'middle' ? 'TENGAH' : 'BAWAH'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreviewModeChange('widgets')}
                      className="px-1.5 py-0.5 rounded-md text-[8.5px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60"
                      title="Atur skala widget di Panel Pratinjau"
                    >
                      {(widgetScale * 100).toFixed(0)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreviewModeChange('widgets')}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Buka Panel Pratinjau Semua Widget"
                    >
                      <LayoutGrid size={11} />
                    </button>
                  </div>
                </div>

                {/* DYNAMIC HOMESCREEN CONTENT BASED ON WIDGET POSITION */}
                <div className="flex-1 flex flex-col justify-around my-auto">
                  {/* POSITION: TOP */}
                  {widgetPosition === 'top' && (
                    <>
                      <div
                        className="w-full transition-transform duration-200 origin-center my-1"
                        style={{ transform: `scale(${widgetScale})` }}
                      >
                        {renderSingleWidget(theme.widgets?.activeWidget || 'clock_weather', true)}
                      </div>
                      <div className="grid grid-cols-4 gap-y-3 gap-x-2 px-1 pt-1">
                        {STANDARD_APP_ICONS.slice(0, 12).map(renderAppIcon)}
                      </div>
                    </>
                  )}

                  {/* POSITION: MIDDLE */}
                  {widgetPosition === 'middle' && (
                    <>
                      <div className="grid grid-cols-4 gap-y-2.5 gap-x-2 px-1">
                        {STANDARD_APP_ICONS.slice(0, 4).map(renderAppIcon)}
                      </div>
                      <div
                        className="w-full transition-transform duration-200 origin-center my-1.5"
                        style={{ transform: `scale(${widgetScale})` }}
                      >
                        {renderSingleWidget(theme.widgets?.activeWidget || 'clock_weather', true)}
                      </div>
                      <div className="grid grid-cols-4 gap-y-2.5 gap-x-2 px-1">
                        {STANDARD_APP_ICONS.slice(4, 12).map(renderAppIcon)}
                      </div>
                    </>
                  )}

                  {/* POSITION: BOTTOM */}
                  {widgetPosition === 'bottom' && (
                    <>
                      <div className="grid grid-cols-4 gap-y-3 gap-x-2 px-1">
                        {STANDARD_APP_ICONS.slice(0, 12).map(renderAppIcon)}
                      </div>
                      <div
                        className="w-full transition-transform duration-200 origin-center my-1"
                        style={{ transform: `scale(${widgetScale})` }}
                      >
                        {renderSingleWidget(theme.widgets?.activeWidget || 'clock_weather', true)}
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Fixed Dock */}
                <div className="pt-2 border-t border-white/10 mt-auto">
                  <div className="grid grid-cols-4 gap-2 px-1">
                    {STANDARD_APP_ICONS.slice(12, 16).map((app) => (
                      <div key={app.id} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-12 h-12 flex items-center justify-center overflow-hidden ${getIconShapeClass()}`}
                          style={{
                            ...getIconContainerStyle(),
                            transform: `scale(${theme.icons.scale})`,
                          }}
                        >
                          {theme.icons.customIcons?.[app.packageName] ? (
                            <img
                              src={theme.icons.customIcons[app.packageName]}
                              alt={app.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            renderIconGlyph(app.iconName, getIconGlyphColor(app.category))
                          )}
                        </div>
                        {theme.icons.showLabels && (
                          <span
                            className="text-[10px] font-medium tracking-tight truncate max-w-[62px]"
                            style={{ color: theme.icons.labelColor }}
                          >
                            {app.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Navigation Bar Home Pill */}
                  <div className="mt-2.5 flex justify-center pb-1">
                    <div className="w-28 h-1 rounded-full bg-white/60" />
                  </div>
                </div>
              </div>
            )}

            {/* MODE 3: DEDICATED HYPEROS WIDGET PRATINJAU & PLACEMENT PANEL */}
            {previewMode === 'widgets' && (
              <div
                className="flex-1 flex flex-col justify-between p-3.5 overflow-y-auto no-scrollbar"
                style={{
                  backgroundColor: 'rgba(5, 7, 12, 0.88)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                <div className="space-y-3 pb-3">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between px-1 pt-1 border-b border-white/10 pb-2.5">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <LayoutGrid size={14} style={{ color: widgetAccent }} />
                        <span>Panel Pratinjau & Tata Letak Widget</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Visualisasi penempatan posisi & penskalaan widget real-time
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPreviewModeChange('homescreen')}
                      className="px-2.5 py-1 rounded-lg text-[10px] bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold flex items-center gap-1 transition-all active:scale-95"
                    >
                      <span>Lihat Beranda</span>
                      <ChevronRight size={11} />
                    </button>
                  </div>

                  {/* SECTION 1: INTERACTIVE HOMESCREEN PLACEMENT SCHEMATIC */}
                  <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MoveVertical size={13} style={{ color: widgetAccent }} />
                        <span className="text-xs font-bold text-white">Posisi Penempatan di Beranda</span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        {widgetPosition === 'top' ? 'SLOT ATAS' : widgetPosition === 'middle' ? 'SLOT TENGAH' : 'SLOT BAWAH'}
                      </span>
                    </div>

                    {/* Interactive 3-Slot Visual Mini-Schematic */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {/* Slot Atas */}
                      <button
                        type="button"
                        onClick={() => handleUpdateWidgetConfig({ position: 'top' })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          widgetPosition === 'top'
                            ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/20 text-white'
                            : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className={`p-1 rounded-md ${widgetPosition === 'top' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-neutral-400'}`}>
                          <ArrowUp size={14} />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[10px] font-bold">Atas</div>
                          <div className="text-[8px] text-neutral-400">Header Grid</div>
                        </div>
                        {widgetPosition === 'top' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </button>

                      {/* Slot Tengah */}
                      <button
                        type="button"
                        onClick={() => handleUpdateWidgetConfig({ position: 'middle' })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          widgetPosition === 'middle'
                            ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/20 text-white'
                            : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className={`p-1 rounded-md ${widgetPosition === 'middle' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-neutral-400'}`}>
                          <MoveVertical size={14} />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[10px] font-bold">Tengah</div>
                          <div className="text-[8px] text-neutral-400">Antara Ikon</div>
                        </div>
                        {widgetPosition === 'middle' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </button>

                      {/* Slot Bawah */}
                      <button
                        type="button"
                        onClick={() => handleUpdateWidgetConfig({ position: 'bottom' })}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          widgetPosition === 'bottom'
                            ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/20 text-white'
                            : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className={`p-1 rounded-md ${widgetPosition === 'bottom' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-neutral-400'}`}>
                          <ArrowDown size={14} />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[10px] font-bold">Bawah</div>
                          <div className="text-[8px] text-neutral-400">Diatas Dock</div>
                        </div>
                        {widgetPosition === 'bottom' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SECTION 2: REAL-TIME WIDGET SCALING CONTROLS */}
                  <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <SlidersHorizontal size={13} style={{ color: widgetAccent }} />
                        <span className="text-xs font-bold text-white">Skala & Ukuran Widget</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                        {(widgetScale * 100).toFixed(0)}% ({widgetScale.toFixed(2)}x)
                      </span>
                    </div>

                    {/* Scale Slider */}
                    <input
                      type="range"
                      min="0.80"
                      max="1.25"
                      step="0.05"
                      value={widgetScale}
                      onChange={(e) => handleUpdateWidgetConfig({ scale: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />

                    {/* Quick Scale Presets */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: '85%', val: 0.85, sub: 'Kompak' },
                        { label: '100%', val: 1.0, sub: 'Standar' },
                        { label: '115%', val: 1.15, sub: 'Besar' },
                        { label: '125%', val: 1.25, sub: 'Maks' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleUpdateWidgetConfig({ scale: item.val })}
                          className={`py-1 px-1.5 rounded-lg border text-center transition-all ${
                            Math.abs(widgetScale - item.val) < 0.02
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold'
                              : 'bg-black/30 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="text-[10px]">{item.label}</div>
                          <div className="text-[7.5px] opacity-70">{item.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 3: CLOCK FORMAT & TYPOGRAPHY QUICK CONTROLS */}
                  <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Clock size={13} style={{ color: widgetAccent }} />
                        <span>Kustomisasi Jam & Tipografi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateWidgetConfig({ clockFormat: '24h' })}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                            (theme.widgets?.clockFormat || '24h') === '24h'
                              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          24 Jam
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateWidgetConfig({ clockFormat: '12h' })}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                            theme.widgets?.clockFormat === '12h'
                              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          12 Jam (AM/PM)
                        </button>
                      </div>
                    </div>

                    {/* Font Selector */}
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: 'rajdhani', label: 'Rajdhani', desc: 'Tech' },
                        { id: 'jetbrains', label: 'JetBrains', desc: 'Mono' },
                        { id: 'sans', label: 'Sans', desc: 'Modern' },
                        { id: 'serif', label: 'Serif', desc: 'Klasik' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleUpdateWidgetConfig({ clockFont: f.id as any })}
                          className={`py-1 px-1 rounded-lg border text-center transition-all ${
                            (theme.widgets?.clockFont || 'rajdhani') === f.id
                              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                              : 'bg-black/30 border-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="text-[9.5px] leading-tight">{f.label}</div>
                          <div className="text-[7.5px] opacity-70">{f.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Card Style Switcher */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                      <span className="text-neutral-400">Gaya Kartu:</span>
                      <div className="flex items-center gap-1">
                        {(
                          [
                            { id: 'outline_mecha', label: 'Outline Mecha' },
                            { id: 'glass', label: 'Glass' },
                            { id: 'solid_dark', label: 'Solid' },
                          ] as const
                        ).map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => handleSelectWidgetStyle(st.id)}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-semibold transition-all ${
                              (theme.widgets?.style || 'outline_mecha') === st.id
                                ? 'bg-white/25 text-white border border-white/30'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: LIVE SCALED STAGE OF ACTIVE WIDGET */}
                  <div className="p-3 rounded-2xl bg-gradient-to-b from-neutral-900/90 to-black/90 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                        <Sparkles size={13} />
                        <span>Pratinjau Aktif dengan Skala {(widgetScale * 100).toFixed(0)}%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onPreviewModeChange('homescreen')}
                        className="text-[9.5px] text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Terapkan di Beranda</span>
                        <ChevronRight size={10} />
                      </button>
                    </div>

                    {/* Scaled Preview Box */}
                    <div className="p-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden">
                      <div
                        className="w-full transition-transform duration-200 origin-center"
                        style={{ transform: `scale(${widgetScale})` }}
                      >
                        {renderSingleWidget(theme.widgets?.activeWidget || 'clock_weather')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[8.5px] text-neutral-400 font-mono px-1">
                      <span>POSISI: {widgetPosition.toUpperCase()}</span>
                      <span>SKALA: {(widgetScale * 100).toFixed(0)}%</span>
                      <span>GAYA: {theme.widgets?.style || 'outline_mecha'}</span>
                    </div>
                  </div>

                  {/* SECTION 5: CATALOG OF 6 HYPEROS WIDGETS */}
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[11px] font-bold text-neutral-300 px-1 flex items-center gap-1">
                      <Layers size={12} style={{ color: widgetAccent }} />
                      <span>Katalog Lengkap Widget HyperOS (Pilih untuk Memasang):</span>
                    </div>

                    {/* WIDGET 1: Dual-Dial Weather & Clock (4x2) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] px-1">
                        <span className="text-neutral-300 font-semibold">1. Jam & Cuaca Dinamis (4x2)</span>
                        <button
                          type="button"
                          onClick={() => handleSelectActiveWidget('clock_weather')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                            (theme.widgets?.activeWidget || 'clock_weather') === 'clock_weather'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {(theme.widgets?.activeWidget || 'clock_weather') === 'clock_weather'
                            ? '✓ Aktif di Beranda'
                            : '+ Pasang ke Beranda'}
                        </button>
                      </div>
                      {renderSingleWidget('clock_weather')}
                    </div>

                    {/* WIDGET 2: Hi-Fi Music Player (4x2 / 2x2) */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] px-1">
                        <span className="text-neutral-300 font-semibold">2. Pemutar Musik Hi-Fi (4x2)</span>
                        <button
                          type="button"
                          onClick={() => handleSelectActiveWidget('music_player')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                            theme.widgets?.activeWidget === 'music_player'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {theme.widgets?.activeWidget === 'music_player' ? '✓ Aktif di Beranda' : '+ Pasang ke Beranda'}
                        </button>
                      </div>
                      {renderSingleWidget('music_player')}
                    </div>

                    {/* WIDGET 3: Device Health & RAM Turbo (4x2 / 2x2) */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] px-1">
                        <span className="text-neutral-300 font-semibold">3. Status RAM & Pendingin (4x2)</span>
                        <button
                          type="button"
                          onClick={() => handleSelectActiveWidget('device_health')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                            theme.widgets?.activeWidget === 'device_health'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {theme.widgets?.activeWidget === 'device_health' ? '✓ Aktif di Beranda' : '+ Pasang ke Beranda'}
                        </button>
                      </div>
                      {renderSingleWidget('device_health')}
                    </div>

                    {/* WIDGET 4: Tactical Memo (4x2) */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] px-1">
                        <span className="text-neutral-300 font-semibold">4. Catatan & Memo Taktis (4x2)</span>
                        <button
                          type="button"
                          onClick={() => handleSelectActiveWidget('tactical_memo')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                            theme.widgets?.activeWidget === 'tactical_memo'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {theme.widgets?.activeWidget === 'tactical_memo' ? '✓ Aktif di Beranda' : '+ Pasang ke Beranda'}
                        </button>
                      </div>
                      {renderSingleWidget('tactical_memo')}
                    </div>

                    {/* WIDGET 5: Super Folder (2x2) */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] px-1">
                        <span className="text-neutral-300 font-semibold">5. HyperOS Super Folder (2x2)</span>
                        <button
                          type="button"
                          onClick={() => handleSelectActiveWidget('super_folder')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                            theme.widgets?.activeWidget === 'super_folder'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {theme.widgets?.activeWidget === 'super_folder' ? '✓ Aktif di Beranda' : '+ Pasang ke Beranda'}
                        </button>
                      </div>
                      {renderSingleWidget('super_folder')}
                    </div>

                    {/* WIDGET 6: Fitness & Steps Tracker */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] px-1">
                        <span className="text-neutral-300 font-semibold">6. Cincin Kebugaran & Langkah</span>
                        <button
                          type="button"
                          onClick={() => handleSelectActiveWidget('fitness_tracker')}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${
                            theme.widgets?.activeWidget === 'fitness_tracker'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-white/10 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {theme.widgets?.activeWidget === 'fitness_tracker' ? '✓ Aktif di Beranda' : '+ Pasang ke Beranda'}
                        </button>
                      </div>
                      {renderSingleWidget('fitness_tracker')}
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation Home Pill */}
                <div className="flex justify-center pt-2">
                  <div className="w-28 h-1 rounded-full bg-white/40" />
                </div>
              </div>
            )}

            {/* MODE 4: CONTROL CENTER (HYPEROS 2.0 STYLE) */}
            {previewMode === 'control_center' && (
              <div
                className="flex-1 flex flex-col justify-between p-4 overflow-y-auto"
                style={{
                  backgroundColor: 'rgba(5, 7, 10, 0.72)',
                  backdropFilter: `blur(${theme.systemUi.controlCenterBlur}px)`,
                }}
              >
                <div className="flex flex-col gap-3">
                  {/* Top Header */}
                  <div className="flex items-center justify-between text-neutral-400 text-xs px-1">
                    <span className="font-semibold text-white">Pusat Kontrol</span>
                    <Settings size={14} className="hover:text-white cursor-pointer" />
                  </div>

                  {/* Big Primary Network Tiles */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Wi-Fi Tile */}
                    <button
                      type="button"
                      onClick={() => setWifiActive(!wifiActive)}
                      className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                        wifiActive
                          ? 'text-black font-semibold shadow-lg'
                          : 'bg-white/10 text-white border border-white/10'
                      }`}
                      style={{
                        backgroundColor: wifiActive ? theme.systemUi.accentColor : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${wifiActive ? 'bg-black/20' : 'bg-white/10'}`}>
                          <Wifi size={18} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold leading-tight">Wi-Fi</div>
                          <div className={`text-[10px] ${wifiActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                            {wifiActive ? 'Hyper_5G_Apex' : 'Mati'}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Bluetooth Tile */}
                    <button
                      type="button"
                      onClick={() => setBluetoothActive(!bluetoothActive)}
                      className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                        bluetoothActive
                          ? 'text-black font-semibold shadow-lg'
                          : 'bg-white/10 text-white border border-white/10'
                      }`}
                      style={{
                        backgroundColor: bluetoothActive ? theme.systemUi.accentColor : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${bluetoothActive ? 'bg-black/20' : 'bg-white/10'}`}>
                          <Bluetooth size={18} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold leading-tight">Bluetooth</div>
                          <div className={`text-[10px] ${bluetoothActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                            {bluetoothActive ? 'Xiaomi Buds 5' : 'Mati'}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Dual Sliders: Brightness & Volume (HyperOS Style) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Brightness Slider */}
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10 flex flex-col justify-between h-32 relative overflow-hidden">
                      <div
                        className="absolute inset-x-0 bottom-0 transition-all rounded-b-2xl opacity-30"
                        style={{
                          height: `${brightness}%`,
                          backgroundColor: theme.systemUi.accentColor,
                        }}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <Sun size={18} className="text-white" />
                        <span className="text-xs font-bold text-white tabular-nums">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="relative z-10 w-full accent-cyan-400 cursor-pointer"
                      />
                      <span className="relative z-10 text-[10px] text-neutral-300">Kecerahan</span>
                    </div>

                    {/* Volume Slider */}
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10 flex flex-col justify-between h-32 relative overflow-hidden">
                      <div
                        className="absolute inset-x-0 bottom-0 transition-all rounded-b-2xl opacity-30"
                        style={{
                          height: `${volume}%`,
                          backgroundColor: theme.systemUi.accentColor,
                        }}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <Volume2 size={18} className="text-white" />
                        <span className="text-xs font-bold text-white tabular-nums">{volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="relative z-10 w-full accent-cyan-400 cursor-pointer"
                      />
                      <span className="relative z-10 text-[10px] text-neutral-300">Volume Media</span>
                    </div>
                  </div>

                  {/* Quick Settings Round Buttons Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setTorchActive(!torchActive)}
                      className={`h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                        torchActive ? 'text-black' : 'bg-white/10 text-white'
                      }`}
                      style={{ backgroundColor: torchActive ? theme.systemUi.accentColor : undefined }}
                    >
                      <Flashlight size={16} />
                      <span className="text-[9px]">Senter</span>
                    </button>
                    <button
                      type="button"
                      className="h-14 rounded-2xl bg-white/10 text-white flex flex-col items-center justify-center gap-1 hover:bg-white/20"
                    >
                      <RotateCw size={16} />
                      <span className="text-[9px]">Rotasi</span>
                    </button>
                    <button
                      type="button"
                      className="h-14 rounded-2xl bg-white/10 text-white flex flex-col items-center justify-center gap-1 hover:bg-white/20"
                    >
                      <Moon size={16} />
                      <span className="text-[9px]">Gelap</span>
                    </button>
                    <button
                      type="button"
                      className="h-14 rounded-2xl bg-white/10 text-white flex flex-col items-center justify-center gap-1 hover:bg-white/20"
                    >
                      <Radio size={16} />
                      <span className="text-[9px]">Hotspot</span>
                    </button>
                  </div>

                  {/* Media Controller Pill */}
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-cyan-400">
                        <Music size={18} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-white">Mecha OST // HyperOS</div>
                        <div className="text-[10px] text-neutral-400">Tactical Audio Driver</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-black"
                        style={{ backgroundColor: theme.systemUi.accentColor }}
                      >
                        <PlaySquare size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation Home Pill */}
                <div className="flex justify-center pt-2">
                  <div className="w-28 h-1 rounded-full bg-white/50" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REAL HYPEROS MODULE OUTPUT ENGINE BAR */}
      <div className="w-[340px] sm:w-[370px] bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <FolderArchive size={14} className="text-cyan-400" />
              <span>Keluaran Modul Asli HyperOS</span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
            Berkas Biner Asli
          </span>
        </div>

        {/* Active Module Details */}
        <div className="bg-neutral-950/90 rounded-xl p-3 border border-neutral-800/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-[11px]">Modul Layar Ini:</span>
            <span className="font-mono font-bold text-cyan-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
              {getActiveModuleInfo().name}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 leading-snug">
            {getActiveModuleInfo().desc}
          </div>
          <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800/60 font-mono">
            <span className="truncate max-w-[210px]">Format: {getActiveModuleInfo().type}</span>
            <span className="text-cyan-300 shrink-0">{bakedIconsCount} PNG Terarsip</span>
          </div>
        </div>

        {/* Module Action Toast if any */}
        {moduleActionToast && (
          <div className="text-xs bg-cyan-950/70 border border-cyan-700/60 text-cyan-200 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-fade-in">
            <Sparkles size={12} className="text-cyan-400 animate-spin" />
            <span>{moduleActionToast}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleDownloadCurrentModule}
            disabled={isDownloadingModule}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium border border-neutral-700 transition-all active:scale-95 disabled:opacity-50"
            title="Unduh berkas modul biner ini langsung"
          >
            <Download size={13} className="text-cyan-400" />
            <span className="truncate">Unduh Modul Ini</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToModules?.(getActiveModuleInfo().id)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Buka Pusat Modul & File Nyata"
          >
            <Package size={13} />
            <span className="truncate">Pusat Modul MTZ</span>
          </button>
        </div>

        {/* Bake All Icons to Real PNG if on homescreen or icons not yet baked */}
        {(previewMode === 'homescreen' || previewMode === 'widgets') && (
          <button
            type="button"
            onClick={handleBakeAllIcons}
            disabled={isBakingIcons}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-cyan-800/50 hover:border-cyan-600 text-[11px] font-medium text-cyan-300 transition-colors"
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span>
              {bakedIconsCount === 16
                ? '⚡ 16/16 Berkas PNG Asli Siap (Perbarui Semua)'
                : `⚡ Konversi Semua Ikon ke Berkas PNG Asli (${bakedIconsCount}/16 Siap)`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
