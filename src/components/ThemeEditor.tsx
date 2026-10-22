import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Clock,
  Sparkles,
  Sliders,
  FileText,
  Upload,
  Check,
  Palette,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Info,
  Trash2,
  FolderOpen,
  Send,
  Eye,
  Layers,
  ArrowRight,
  LayoutGrid,
  Zap,
  Folder,
  FolderArchive,
  Grid,
  Type,
  Music,
  Volume2,
  Lock,
  Unlock,
  Fingerprint,
  Bell,
  Signal,
  Battery,
  EyeOff,
  RefreshCw,
  ArrowLeft,
  Code2,
  SlidersHorizontal,
  List,
  MoveHorizontal,
  Play,
  VolumeX,
  ChevronRight,
  Search,
  FileCode,
} from 'lucide-react';
import { AspectTab, ClockStyle, IconShape, IconStyle, PreviewMode, ThemeConfig, WidgetStyle, WidgetType } from '../types/theme';
import { WALLPAPER_PRESETS, STANDARD_APP_ICONS } from '../data/presets';
import { renderDataUriToRasterBlob } from '../utils/canvasRenderer';
import { bakeAllStandardIconsToTheme } from '../utils/moduleEngine';

interface ThemeEditorProps {
  theme: ThemeConfig;
  onUpdateTheme: (updated: ThemeConfig) => void;
  activeTab: AspectTab;
  onTabChange: (tab: AspectTab) => void;
  onOpenImportModal?: () => void;
  onExportMtz?: () => void;
  onPreviewModeChange?: (mode: PreviewMode) => void;
  onNavigateToXml?: () => void;
  onNavigateToModules?: () => void;
}

const ACCENT_COLORS = [
  { name: 'Cyber Cyan', hex: '#00F0FF' },
  { name: 'Neon Amber', hex: '#FFB800' },
  { name: 'Hyper Crimson', hex: '#FF4D4D' },
  { name: 'Acid Green', hex: '#10B981' },
  { name: 'Electric Purple', hex: '#A855F7' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

const THEME_CATEGORIES = [
  'Tech & Mecha',
  'Dark & Minimalist',
  'Magazine Editorial',
  'Cyberpunk & Futuristic',
  'Anime & Games',
  'Business & Elegant',
  'Nature & Abstract',
];

export const ThemeEditor: React.FC<ThemeEditorProps> = ({
  theme,
  onUpdateTheme,
  activeTab,
  onTabChange,
  onOpenImportModal,
  onExportMtz,
  onPreviewModeChange,
  onNavigateToXml,
  onNavigateToModules,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconUploadRef = useRef<HTMLInputElement>(null);
  const [selectedAppForCustomIcon, setSelectedAppForCustomIcon] = useState<string | null>(null);
  const [downloadingPreview, setDownloadingPreview] = useState(false);
  const [isBakingIcons, setIsBakingIcons] = useState(false);
  const [bakeStatusToast, setBakeStatusToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundPlaying, setSoundPlaying] = useState<string | null>(null);
  const [fodScanning, setFodScanning] = useState(false);

  // Synthesize realistic system audio tone using Web Audio API
  const playSynthesizedSystemTone = (type: 'lock' | 'unlock' | 'charge' | 'notification') => {
    try {
      setSoundPlaying(type);
      setTimeout(() => setSoundPlaying(null), 700);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const t = ctx.currentTime;
      if (type === 'lock') {
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
      } else if (type === 'unlock') {
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(940, t + 0.12);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
      } else if (type === 'charge') {
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.16); // G5
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
        osc.start(t);
        osc.stop(t + 0.28);
      } else {
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.15);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
      }
    } catch {
      // Audio playback silently guarded
    }
  };

  const getActiveModuleTitle = (tab: AspectTab) => {
    switch (tab) {
      case 'wallpaper':
        return 'Layar utama & kunci > Wallpaper';
      case 'lockscreen':
        return 'Layar utama & kunci > Kunci Layar & Jam';
      case 'aod':
        return 'Layar utama & kunci > Layar Selalu Aktif & Menu Daya [PRO]';
      case 'icons':
        return 'Layar utama & kunci > Ikon Aplikasi';
      case 'widgets':
        return 'Layar utama & kunci > Peluncur & Widget HyperOS';
      case 'system_colors':
        return 'Antarmuka sistem > Palet Tema & Warna Aksen';
      case 'statusbar':
        return 'Antarmuka sistem > Bilah Status (Status Bar)';
      case 'notification':
        return 'Antarmuka sistem > Panel Notifikasi & Quick Tiles';
      case 'systemui':
        return 'Antarmuka sistem > Warna Sistem & Nilai Global';
      case 'volume_dialog':
        return 'Antarmuka sistem > Dialog Volume & Slider Suara';
      case 'navigation_bar':
        return 'Antarmuka sistem > Bilah Navigasi & Gesture Pill';
      case 'fingerprint':
        return 'Antarmuka sistem > Sidik Jari FOD (Fingerprint on Display)';
      case 'other_ui':
        return 'Antarmuka sistem > Sembunyikan Elemen & UI Sistem';
      case 'fonts':
        return 'Aplikasi & font > Tipografi & Font Sistem';
      case 'sounds':
        return 'Aplikasi & font > Suara, Nada Dering & Efek Audio';
      case 'identity':
        return 'Detail tema > Keterangan & Metadata Toko';
      case 'preview_publish':
        return 'Detail tema > Preview Tangkapan Layar & Toko';
      case 'theme_check':
        return 'Detail tema > Pemeriksaan & Validasi Tema';
      case 'maml_code':
        return 'Detail tema > Kode MAML Layar Kunci [PRO]';
      case 'nine_patch':
        return 'Detail tema > Editor Nine-Patch (.9.png) [PRO]';
      case 'hub':
      default:
        return 'Pusat Folder Modul HyperOS';
    }
  };

  const handleBakeAllIcons = async () => {
    setIsBakingIcons(true);
    setBakeStatusToast('Mengonversi 16 ikon menjadi berkas PNG 192x192 asli...');
    try {
      const baked = await bakeAllStandardIconsToTheme(theme);
      onUpdateTheme(baked);
      setBakeStatusToast('16 Berkas PNG asli berhasil dimasukkan ke modul tema!');
      setTimeout(() => setBakeStatusToast(null), 3000);
    } catch {
      setBakeStatusToast('Gagal memproses berkas PNG');
      setTimeout(() => setBakeStatusToast(null), 2500);
    } finally {
      setIsBakingIcons(false);
    }
  };

  // Custom Wallpaper Upload
  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateTheme({
          ...theme,
          wallpaper: {
            ...theme.wallpaper,
            type: 'custom',
            presetId: 'custom',
            url: result,
            lockscreenUrl: theme.wallpaper.lockscreenSame ? result : theme.wallpaper.lockscreenUrl,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom App Icon Upload
  const handleAppIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedAppForCustomIcon) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateTheme({
          ...theme,
          icons: {
            ...theme.icons,
            customIcons: {
              ...theme.icons.customIcons,
              [selectedAppForCustomIcon]: result,
            },
          },
        });
        setSelectedAppForCustomIcon(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomIcon = (pkgName: string) => {
    const copy = { ...theme.icons.customIcons };
    delete copy[pkgName];
    onUpdateTheme({
      ...theme,
      icons: {
        ...theme.icons,
        customIcons: copy,
      },
    });
  };

  // Download real preview PNG for Theme Store submission
  const handleDownloadStorePreview = async (type: 'lockscreen' | 'launcher') => {
    try {
      setDownloadingPreview(true);
      const blob = await renderDataUriToRasterBlob(theme.wallpaper.url, 1080, 2400, 'image/png');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preview_${type}_0.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setDownloadingPreview(false);
    }
  };

  // Pre-flight audit readiness calculations
  const isTitleValid = Boolean(theme.meta.title && theme.meta.title.trim().length > 2);
  const isAuthorValid = Boolean(theme.meta.author && theme.meta.author.trim().length > 1);
  const isDesignerValid = Boolean(theme.meta.designer && theme.meta.designer.trim().length > 2);
  const isWallpaperValid = Boolean(theme.wallpaper.url);
  const isIconsConfigured = Boolean(theme.icons.shape && theme.icons.accentColor);
  const isLockscreenValid = Boolean(theme.lockscreen.clockColor && theme.lockscreen.clockStyle);

  const checklistItems = [
    { label: 'Identitas & ID Desainer Resmi Xiaomi', valid: isTitleValid && isAuthorValid && isDesignerValid },
    { label: 'Wallpaper Resolusi Tinggi FHD+ (1080 × 2400)', valid: isWallpaperValid },
    { label: 'Mesin Layar Kunci & Jam Manifest HyperOS v2', valid: isLockscreenValid },
    { label: 'Paket Ikon Lengkap (192×192 PNG Sub-Arsip)', valid: isIconsConfigured },
    { label: 'Modul Pusat Kontrol & Status Bar (SystemUI)', valid: true },
    { label: 'Tangkapan Layar Pratinjau Siap Diunggah', valid: true },
  ];

  const totalValid = checklistItems.filter((i) => i.valid).length;
  const readinessPercent = Math.round((totalValid / checklistItems.length) * 100);

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. TOP MODULE NAVIGATION BAR */}
      <div className="flex items-center justify-between p-2 bg-neutral-950 border-b border-neutral-800 text-xs font-medium">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* Main Folder Hub Button (As requested by user!) */}
          <button
            type="button"
            onClick={() => onTabChange('hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-bold ${
              activeTab === 'hub'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400'
                : 'bg-blue-950/40 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-400'
            }`}
          >
            <Folder size={14} className={activeTab === 'hub' ? 'text-white' : 'text-blue-400'} />
            <span>Pusat Folder Modul</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <div className="w-[1px] h-5 bg-neutral-800 mx-1 shrink-0" />

          {/* Quick Aspect Tabs */}
          <button
            type="button"
            onClick={() => onTabChange('identity')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'identity'
                ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText size={13} />
            <span>Identitas</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('wallpaper')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'wallpaper'
                ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon size={13} />
            <span>Wallpaper</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('lockscreen')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'lockscreen'
                ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock size={13} />
            <span>Kunci Layar</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('icons')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'icons'
                ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Ikon</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onTabChange('widgets');
              onPreviewModeChange?.('widgets');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'widgets'
                ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutGrid size={13} />
            <span>Widget</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('systemui')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'systemui'
                ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders size={13} />
            <span>System UI</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('fonts')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'fonts'
                ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Type size={13} />
            <span>Fonts</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('sounds')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'sounds'
                ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Music size={13} />
            <span>Suara</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('preview_publish')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'preview_publish'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-neutral-300 hover:text-white bg-neutral-900/60'
            }`}
          >
            <Send size={13} className="text-cyan-400" />
            <span>Toko ({readinessPercent}%)</span>
          </button>
        </div>
      </div>

      {/* Sub-header Breadcrumb when navigating inside a specific module */}
      {activeTab !== 'hub' && (
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-950/80 border-b border-neutral-800/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTabChange('hub')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30 transition-all font-semibold active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Kembali ke Folder</span>
            </button>
            <div className="flex items-center gap-1 text-neutral-400">
              <ChevronRight size={12} className="text-neutral-600" />
              <span className="font-semibold text-white">{getActiveModuleTitle(activeTab)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTabChange('hub')}
              className="text-[11px] text-neutral-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
            >
              <Grid size={11} />
              <span>Semua Folder</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input for custom app icon replacement */}
      <input
        type="file"
        ref={iconUploadRef}
        accept="image/png,image/jpeg,image/webp"
        onChange={handleAppIconUpload}
        className="hidden"
      />

      {/* Editor Content Area */}
      <div className="p-4 sm:p-6 overflow-y-auto max-h-[660px] space-y-6 text-sm">
        {/* ========================================================================= */}
        {/* HYPEROS THEME EDITOR FOLDER GRID HUB (DASHBOARD MODUL SEPERTI CONTOH USER) */}
        {/* ========================================================================= */}
        {activeTab === 'hub' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Hub & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <Folder size={17} className="text-blue-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Pusat Folder Modul Tema HyperOS
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                    HyperOS 3.0 / 2.0
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Pilih folder/modul di bawah ini untuk mengedit elemen tema secara terorganisir dan rapi.
                </p>
              </div>

              {/* Search Filter */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari modul tema..."
                  className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:border-blue-500 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* FOLDER CATEGORY 1: LAYAR UTAMA & KUNCI */}
            {(!searchQuery || 'layar utama kunci wallpaper aod peluncur ikon'.includes(searchQuery.toLowerCase())) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Layar utama & kunci
                  </h4>
                  <div className="flex-1 h-[1px] bg-neutral-800/80" />
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                  {/* Wallpaper */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('wallpaper');
                      onPreviewModeChange?.('lockscreen');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]">
                      {theme.wallpaper.type === 'custom' && (
                        <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          Kustom
                        </span>
                      )}
                    </div>
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <ImageIcon size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Wallpaper
                    </div>
                  </button>

                  {/* Kunci Layar */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('lockscreen');
                      onPreviewModeChange?.('lockscreen');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Lock size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Kunci Layar
                    </div>
                  </button>

                  {/* Layar selalu aktif dan menu daya [PRO] */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('aod');
                      onPreviewModeChange?.('lockscreen');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-start min-h-[14px]">
                      <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-white/10 text-neutral-200 border border-white/30">
                        PRO
                      </span>
                    </div>
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Smartphone size={23} />
                    </div>
                    <div className="text-[11px] sm:text-xs font-medium text-neutral-200 group-hover:text-white leading-tight px-0.5 line-clamp-2">
                      Layar selalu aktif dan menu daya
                    </div>
                  </button>

                  {/* Ikon Aplikasi */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('icons');
                      onPreviewModeChange?.('homescreen');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]">
                      {Object.keys(theme.icons.customIcons || {}).length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {Object.keys(theme.icons.customIcons || {}).length} PNG
                        </span>
                      )}
                    </div>
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <LayoutGrid size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Ikon Aplikasi
                    </div>
                  </button>

                  {/* Peluncur */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('widgets');
                      onPreviewModeChange?.('widgets');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <List size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Peluncur
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* FOLDER CATEGORY 2: ANTARMUKA SISTEM */}
            {(!searchQuery || 'antarmuka sistem status panel notifikasi warna volume navigasi sidik jari elemen ui latar'.includes(searchQuery.toLowerCase())) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Antarmuka sistem
                  </h4>
                  <div className="flex-1 h-[1px] bg-neutral-800/80" />
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                  {/* Palet Tema */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('system_colors');
                      onPreviewModeChange?.('control_center');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Palette size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Palet Tema
                    </div>
                  </button>

                  {/* Bilah Status */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('statusbar');
                      onPreviewModeChange?.('control_center');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Signal size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Bilah Status
                    </div>
                  </button>

                  {/* Panel Notifikasi */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('notification');
                      onPreviewModeChange?.('control_center');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Bell size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Panel Notifikasi
                    </div>
                  </button>

                  {/* Warna Sistem */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('systemui');
                      onPreviewModeChange?.('control_center');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <SlidersHorizontal size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Warna Sistem
                    </div>
                  </button>

                  {/* Dialog Volume */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('volume_dialog');
                      onPreviewModeChange?.('control_center');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Volume2 size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Dialog Volume
                    </div>
                  </button>

                  {/* Bilah Navigasi */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('navigation_bar');
                      onPreviewModeChange?.('homescreen');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Layers size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Bilah Navigasi
                    </div>
                  </button>

                  {/* Sidik Jari */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('fingerprint');
                      onPreviewModeChange?.('lockscreen');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Fingerprint size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Sidik Jari
                    </div>
                  </button>

                  {/* Sembunyikan Elemen */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('other_ui');
                      onPreviewModeChange?.('control_center');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <EyeOff size={23} />
                    </div>
                    <div className="text-[11px] sm:text-xs font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Sembunyikan Elemen
                    </div>
                  </button>

                  {/* UI Sistem Lainnya */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('other_ui');
                      onPreviewModeChange?.('control_center');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Sliders size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      UI Sistem Lainnya
                    </div>
                  </button>

                  {/* Latar Belakang */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('wallpaper');
                      onPreviewModeChange?.('homescreen');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <ImageIcon size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Latar Belakang
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* FOLDER CATEGORY 3: APLIKASI & FONT */}
            {(!searchQuery || 'aplikasi font suara nada dering tipografi'.includes(searchQuery.toLowerCase())) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Aplikasi & font
                  </h4>
                  <div className="flex-1 h-[1px] bg-neutral-800/80" />
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                  {/* Fonts */}
                  <button
                    type="button"
                    onClick={() => onTabChange('fonts')}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Type size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Fonts
                    </div>
                  </button>

                  {/* Suara */}
                  <button
                    type="button"
                    onClick={() => onTabChange('sounds')}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Music size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Suara
                    </div>
                  </button>

                  {/* Aplikasi */}
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('icons');
                      onPreviewModeChange?.('homescreen');
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <List size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Aplikasi
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* FOLDER CATEGORY 4: DETAIL TEMA */}
            {(!searchQuery || 'detail tema keterangan preview preset ulang nine patch pemeriksaan kode maml lanjutan'.includes(searchQuery.toLowerCase())) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Detail tema
                  </h4>
                  <div className="flex-1 h-[1px] bg-neutral-800/80" />
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                  {/* Keterangan */}
                  <button
                    type="button"
                    onClick={() => onTabChange('identity')}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <FileText size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Keterangan
                    </div>
                  </button>

                  {/* Preview */}
                  <button
                    type="button"
                    onClick={() => onTabChange('preview_publish')}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Eye size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Preview
                    </div>
                  </button>

                  {/* Preset & Setel Ulang */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenImportModal) {
                        onOpenImportModal();
                      } else {
                        onTabChange('identity');
                      }
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <RefreshCw size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Preset & Setel Ulang
                    </div>
                  </button>

                  {/* Editor nine-patch */}
                  <button
                    type="button"
                    onClick={() => onTabChange('nine_patch')}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Layers size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Editor nine-patch
                    </div>
                  </button>

                  {/* Pemeriksaan tema */}
                  <button
                    type="button"
                    onClick={() => onTabChange('theme_check')}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-end min-h-[14px]" />
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <CheckCircle2 size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Pemeriksaan tema
                    </div>
                  </button>

                  {/* Editor lanjutan [PRO] */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToXml) {
                        onNavigateToXml();
                      } else {
                        onTabChange('identity');
                      }
                    }}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-start min-h-[14px]">
                      <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-white/10 text-neutral-200 border border-white/30">
                        PRO
                      </span>
                    </div>
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <FileCode size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Editor lanjutan
                    </div>
                  </button>

                  {/* Kode MAML [PRO] */}
                  <button
                    type="button"
                    onClick={() => onTabChange('maml_code')}
                    className="relative group bg-[#161922] hover:bg-[#1e2330] border border-white/5 hover:border-blue-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md shadow-black/40 min-h-[130px] sm:min-h-[148px] cursor-pointer"
                  >
                    <div className="w-full flex justify-start min-h-[14px]">
                      <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-white/10 text-neutral-200 border border-white/30">
                        PRO
                      </span>
                    </div>
                    <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#274291] group-hover:bg-[#3453b5] flex items-center justify-center text-white shadow-md shadow-blue-900/40 my-1 transition-transform group-hover:scale-105">
                      <Code2 size={23} />
                    </div>
                    <div className="text-xs sm:text-[13px] font-medium text-neutral-200 group-hover:text-white leading-tight">
                      Kode MAML
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ASPEK 1: IDENTITAS & METADATA TOKO */}
        {activeTab === 'identity' && (
          <div className="space-y-5">
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex items-start gap-3">
              <Info size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-300">
                <div className="font-bold text-white text-sm mb-0.5">
                  Metadata Resmi Theme Store Xiaomi (description.xml)
                </div>
                Data ini akan dibaca langsung oleh sistem verifikasi Xiaomi Theme Store (zhuti.xiaomi.com) saat Anda mengunggah berkas .MTZ.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Judul Tema (Theme Title) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={theme.meta.title}
                  onChange={(e) =>
                    onUpdateTheme({ ...theme, meta: { ...theme.meta, title: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none font-medium"
                  placeholder="Contoh: Mecha Apex Dark Tactical"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  ID Desainer Xiaomi (Designer ID) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={theme.meta.designer}
                  onChange={(e) =>
                    onUpdateTheme({ ...theme, meta: { ...theme.meta, designer: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none font-medium"
                  placeholder="ID Akun Desainer terdaftar di zhuti.xiaomi.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nama Pembuat (Author) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={theme.meta.author}
                  onChange={(e) =>
                    onUpdateTheme({ ...theme, meta: { ...theme.meta, author: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none font-medium"
                  placeholder="Nama studio atau nama Anda"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Kategori Tema Toko (Category)
                </label>
                <select
                  value={theme.meta.category || THEME_CATEGORIES[0]}
                  onChange={(e) =>
                    onUpdateTheme({ ...theme, meta: { ...theme.meta, category: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none font-medium"
                >
                  {THEME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Versi Rilis (Semantic Version)
                </label>
                <input
                  type="text"
                  value={theme.meta.version}
                  onChange={(e) =>
                    onUpdateTheme({ ...theme, meta: { ...theme.meta, version: e.target.value } })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Platform Target Xiaomi HyperOS
                </label>
                <select
                  value={theme.meta.targetPlatform || 'hyperos_3'}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      meta: {
                        ...theme.meta,
                        targetPlatform: e.target.value as 'hyperos_3' | 'hyperos_2' | 'hyperos_1' | 'universal',
                        uiVersion:
                          e.target.value === 'hyperos_3'
                            ? 'HyperOS 1.0 / 2.0 / 3.0 Ready'
                            : e.target.value === 'hyperos_2'
                            ? 'HyperOS 2.0'
                            : 'HyperOS 1.0',
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-cyan-300 focus:border-cyan-500 outline-none font-semibold cursor-pointer"
                >
                  <option value="hyperos_3">HyperOS 3.0 Ready (Kompatibilitas Penuh 1.0 / 2.0 / 3.0)</option>
                  <option value="hyperos_2">HyperOS 2.0 Alive Architecture</option>
                  <option value="hyperos_1">HyperOS 1.0 Unified Engine</option>
                </select>
              </div>
            </div>

            {/* HyperOS 3.0 Integration Status Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-neutral-950 to-neutral-900 border border-cyan-800/40 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Status Integrasi HyperOS 3.0: 100% Siap & Terintegrasi</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Engine v3.0 Native
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Studio ini menghasilkan struktur tema MTZ resmi berstandar <strong>HyperOS 3.0</strong> dengan arsitektur <em>Unified Engine (uiVersion: 1)</em>, sub-arsip biner asli (icons 192×192, lockscreen advance manifest v2, SystemUI v3), serta kompatibilitas mundur penuh ke HyperOS 2.0 & HyperOS 1.0.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Deskripsi Tema untuk Calon Pengunduh di Toko
              </label>
              <textarea
                rows={3}
                value={theme.meta.description}
                onChange={(e) =>
                  onUpdateTheme({ ...theme, meta: { ...theme.meta, description: e.target.value } })
                }
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none resize-none leading-relaxed"
                placeholder="Jelaskan keistimewaan tema Anda, misal jam majalah, aksen pelat baja mecha, dan ikon kustom..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Catatan Rilis Pembaruan (Changelog / Update Log)
              </label>
              <input
                type="text"
                value={theme.meta.changelog || 'Rilis tema perdana untuk Xiaomi HyperOS.'}
                onChange={(e) =>
                  onUpdateTheme({ ...theme, meta: { ...theme.meta, changelog: e.target.value } })
                }
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:border-cyan-500 outline-none"
                placeholder="Misal: Perilisan awal dengan ikon kustom & lockscreen stencil"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onTabChange('wallpaper')}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Lanjut ke Aspek 2: Wallpaper</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ASPEK 2: WALLPAPER */}
        {activeTab === 'wallpaper' && (
          <div className="space-y-6">
            {onOpenImportModal && (
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Upload size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Sudah punya file .MTZ yang ingin diedit?</div>
                    <div className="text-[11px] text-neutral-400">Bongkar berkas tema dari komputer Anda untuk dimodifikasi aspek per aspek</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenImportModal}
                  className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                >
                  Impor Berkas .MTZ
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Pilih Preset Wallpaper HyperOS
                </label>
                <span className="text-[11px] font-mono text-cyan-400">Standar 1080 × 2400 FHD+</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {WALLPAPER_PRESETS.map((preset) => {
                  const isSelected = theme.wallpaper.presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        onUpdateTheme({
                          ...theme,
                          wallpaper: {
                            ...theme.wallpaper,
                            type: 'preset',
                            presetId: preset.id,
                            url: preset.svgDataUri,
                            lockscreenUrl: theme.wallpaper.lockscreenSame ? preset.svgDataUri : theme.wallpaper.lockscreenUrl,
                          },
                        })
                      }
                      className={`relative p-3 rounded-xl border text-left transition-all overflow-hidden flex flex-col justify-between h-36 ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/50'
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className="absolute inset-0 opacity-40 bg-cover bg-center"
                        style={{ backgroundImage: `url(${preset.svgDataUri})` }}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-xs font-bold text-white drop-shadow">
                          {preset.name}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-black">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="relative z-10 text-[10px] text-neutral-300 drop-shadow line-clamp-2">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Upload */}
            <div className="p-5 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/70 flex flex-col items-center justify-center text-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleCustomWallpaperUpload}
                className="hidden"
              />
              <Upload size={24} className="text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-neutral-100">
                  Unggah Wallpaper Kustom Sendiri
                </div>
                <div className="text-[11px] text-neutral-400">
                  Otomatis dikonversi ke JPEG 1080×2400 murni agar terbaca oleh Wallpaper Service Xiaomi
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white border border-neutral-700 transition-all shadow-sm"
              >
                Pilih Berkas Gambar
              </button>
            </div>

            {/* Visual Adjustments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>Efek Blur Wallpaper</span>
                  <span className="font-mono text-cyan-400">{theme.wallpaper.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={theme.wallpaper.blur}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      wallpaper: { ...theme.wallpaper, blur: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>Peredup Latar (Dimming)</span>
                  <span className="font-mono text-cyan-400">{theme.wallpaper.dim}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={theme.wallpaper.dim}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      wallpaper: { ...theme.wallpaper, dim: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Background Text Clarity Helper */}
            <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Eye size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Keterbacaan Tulisan di Belakang (Wallpaper)</div>
                  <div className="text-[11px] text-neutral-400">
                    Jika tulisan/tanda teknis di belakang tertutup redup atau kabur, gunakan preset tajam tanpa blur.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateTheme({
                    ...theme,
                    wallpaper: { ...theme.wallpaper, blur: 0, dim: 0 },
                  })
                }
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shadow-sm"
              >
                Murnikan Teks Belakang (0 Blur / 0 Dim)
              </button>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => onTabChange('identity')}
                className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => onTabChange('lockscreen')}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Lanjut ke Aspek 3: Layar Kunci</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ASPEK 3: LAYAR KUNCI & JAM MANIFEST */}
        {activeTab === 'lockscreen' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Gaya Tipografi Jam HyperOS
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'mecha_stencil', name: 'Mecha Stencil (Tactical)', preview: '09:45' },
                    { id: 'hyper_magazine', name: 'Hyper Magazine (Bold)', preview: '09 / 45' },
                    { id: 'digital_tech', name: 'Digital Monospace', preview: '[09:45]' },
                    { id: 'classic_serif', name: 'Editorial Serif', preview: '09:45' },
                    { id: 'minimal_pill', name: 'Minimal Pill Bar', preview: '09:45 28°' },
                  ] as const
                ).map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({
                        ...theme,
                        lockscreen: { ...theme.lockscreen, clockStyle: style.id },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      theme.lockscreen.clockStyle === style.id
                        ? 'border-cyan-500 bg-cyan-950/20 text-white ring-1 ring-cyan-500/50'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{style.name}</div>
                    <div className="text-[11px] font-mono text-cyan-400 mt-1">{style.preview}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Clock Color Swatches */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Warna Aksen Jam Layar Kunci
              </label>
              <div className="flex items-center gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({
                        ...theme,
                        lockscreen: { ...theme.lockscreen, clockColor: color.hex },
                      })
                    }
                    className="group relative flex flex-col items-center"
                    title={color.name}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        theme.lockscreen.clockColor === color.hex
                          ? 'scale-110 border-white shadow-lg'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] text-neutral-400 mt-1">{color.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Scale & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>Ukuran Jam</span>
                  <span className="font-mono text-cyan-400">{theme.lockscreen.clockSize.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={theme.lockscreen.clockSize}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      lockscreen: { ...theme.lockscreen, clockSize: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs text-neutral-300">Posisi Jam</label>
                <div className="flex gap-2">
                  {(['top', 'center', 'left'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() =>
                        onUpdateTheme({
                          ...theme,
                          lockscreen: { ...theme.lockscreen, clockPosition: pos },
                        })
                      }
                      className={`flex-1 py-1.5 text-xs rounded-lg border capitalize transition-all ${
                        theme.lockscreen.clockPosition === pos
                          ? 'border-cyan-500 bg-cyan-950/30 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Depth Effect & Signature */}
            <div className="space-y-4 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between p-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <div>
                  <div className="text-xs font-semibold text-white">HyperOS Depth Effect (Efek Kedalaman)</div>
                  <div className="text-[11px] text-neutral-400">
                    Menempatkan subjek wallpaper di atas angka jam untuk efek majalah 3D
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={theme.lockscreen.depthEffect}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      lockscreen: { ...theme.lockscreen, depthEffect: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Teks Signature / Cap Perangkat Kustom
                </label>
                <input
                  type="text"
                  value={theme.lockscreen.customSignature}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      lockscreen: { ...theme.lockscreen, customSignature: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 font-mono focus:border-cyan-500 outline-none"
                  placeholder="Misal: TACTICAL ARMOR // CHASSIS-01"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => onTabChange('wallpaper')}
                className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => onTabChange('icons')}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Lanjut ke Aspek 4: Paket Ikon</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ASPEK 4: PAKET IKON LENGKAP & KUSTOMISASI PER APLIKASI */}
        {activeTab === 'icons' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Bentuk Masking Ikon Global (Icon Shape Mask)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: 'chamfer', name: 'Chamfer (Mecha)', desc: 'Sudut Terpotong' },
                    { id: 'squircle', name: 'Squircle', desc: 'Bawaan HyperOS' },
                    { id: 'hexagon', name: 'Hexagon', desc: 'Sarang Lebah Cyber' },
                    { id: 'round', name: 'Circle', desc: 'Bulat Klasik' },
                    { id: 'square', name: 'Square', desc: 'Kotak Tegas' },
                  ] as const
                ).map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({
                        ...theme,
                        icons: { ...theme.icons, shape: shape.id },
                      })
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      theme.icons.shape === shape.id
                        ? 'border-cyan-500 bg-cyan-950/20 text-white ring-1 ring-cyan-500/50'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{shape.name}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{shape.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Gaya Shader / Palet Ikon
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'mecha_outline', name: 'Mecha Outline (Dark)', desc: 'Garis Neon Minimalis' },
                    { id: 'neon_cyber', name: 'Neon Cyberpunk', desc: 'Glow Aksen Kuat' },
                    { id: 'hyper_color', name: 'HyperOS Flat Color', desc: 'Warna Segar Bawaan' },
                    { id: 'minimal_white', name: 'Monochrome White', desc: 'Putih Kontras Tinggi' },
                  ] as const
                ).map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({
                        ...theme,
                        icons: { ...theme.icons, style: style.id },
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      theme.icons.style === style.id
                        ? 'border-cyan-500 bg-cyan-950/20 text-white ring-1 ring-cyan-500/50'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{style.name}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color for outline/neon icons */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Warna Aksen Border Ikon
              </label>
              <div className="flex items-center gap-3">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({
                        ...theme,
                        icons: { ...theme.icons, accentColor: c.hex },
                      })
                    }
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-7 h-7 rounded-full border-2 ${
                        theme.icons.accentColor === c.hex ? 'border-white scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* KUSTOMISASI IKON PER APLIKASI (APP-BY-APP ICON MANAGER) */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span>Kustomisasi Ikon Per Aplikasi (Berkas PNG Asli 192x192)</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Setiap ikon disimpan sebagai berkas PNG 192x192 asli ke dalam modul <code className="text-cyan-300">icons</code> MTZ:
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBakeAllIcons}
                  disabled={isBakingIcons}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  title="Render semua ikon otomatis menjadi berkas PNG 192x192"
                >
                  <Sparkles size={12} className={isBakingIcons ? 'animate-spin' : ''} />
                  <span>{isBakingIcons ? 'Memproses...' : 'Bake Semua Ikon ke PNG'}</span>
                </button>
              </div>

              {bakeStatusToast && (
                <div className="text-xs bg-cyan-950/70 border border-cyan-700/60 text-cyan-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-cyan-400" />
                  <span>{bakeStatusToast}</span>
                </div>
              )}

              {/* Grid of standard apps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {STANDARD_APP_ICONS.map((app) => {
                  const hasCustom = Boolean(theme.icons.customIcons?.[app.packageName]);

                  return (
                    <div
                      key={app.id}
                      className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {hasCustom ? (
                          <img
                            src={theme.icons.customIcons[app.packageName]}
                            alt={app.name}
                            className="w-8 h-8 rounded-lg object-cover border border-cyan-500"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-[11px] text-cyan-400 border border-neutral-700">
                            {app.name.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{app.name}</div>
                          <div className="font-mono text-[10px] text-neutral-500 truncate max-w-[140px]">
                            {app.packageName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {hasCustom ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomIcon(app.packageName)}
                            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800"
                            title="Hapus gambar kustom"
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAppForCustomIcon(app.packageName);
                            iconUploadRef.current?.click();
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            hasCustom
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          {hasCustom ? 'Ganti PNG' : 'Unggah PNG'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => onTabChange('lockscreen')}
                className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  onTabChange('widgets');
                  onPreviewModeChange?.('widgets');
                }}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Lanjut ke Aspek 5: Widget HyperOS</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ASPEK 5: WIDGET KUSTOM HYPEROS */}
        {activeTab === 'widgets' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 bg-cyan-950/20 rounded-2xl border border-cyan-500/30 flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <LayoutGrid size={15} className="text-cyan-400" />
                  <span>Kustomisasi Widget HyperOS (Layar Beranda & Shelf)</span>
                </h4>
                <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                  Xiaomi HyperOS memperkenalkan sistem widget super dinamis dengan kartu bertekstur, efek kaca
                  transparan, dan kartu taktis mecha. Pilih widget aktif untuk ditampilkan di layar utama simulator Anda.
                </p>
              </div>

              {onPreviewModeChange && (
                <button
                  type="button"
                  onClick={() => onPreviewModeChange('widgets')}
                  className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-md shadow-cyan-400/20"
                >
                  <Eye size={12} />
                  <span>Buka Panel Widget</span>
                </button>
              )}
            </div>

            {/* 1. Pilih Widget Aktif di Beranda */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                1. Pilih Widget Aktif di Layar Utama
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'clock_weather',
                    name: 'Cuaca & Jam (4x2)',
                    desc: 'Dual-dial digital dengan info suhu & kualitas udara AQI',
                    icon: '☀️',
                  },
                  {
                    id: 'music_player',
                    name: 'Pemutar Musik Hi-Fi',
                    desc: 'Piringan hitam menyala dengan visualizer spektrum audio',
                    icon: '🎵',
                  },
                  {
                    id: 'device_health',
                    name: 'Status RAM & Pendingin',
                    desc: 'Monitor suhu CPU & tombol Turbo Boost pembersih memori',
                    icon: '⚡',
                  },
                  {
                    id: 'tactical_memo',
                    name: 'Catatan & Memo Taktis',
                    desc: 'Kartu catatan memo tersemat dengan daftar periksa',
                    icon: '📝',
                  },
                  {
                    id: 'super_folder',
                    name: 'HyperOS Super Folder',
                    desc: 'Folder 2x2 interaktif dengan pintasan aplikasi langsung',
                    icon: '📁',
                  },
                  {
                    id: 'fitness_tracker',
                    name: 'Kebugaran & Langkah',
                    desc: 'Tiga cincin aktivitas harian, kalori, dan jarak',
                    icon: '🏃',
                  },
                ].map((w) => {
                  const isSelected = (theme.widgets?.activeWidget || 'clock_weather') === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() =>
                        onUpdateTheme({
                          ...theme,
                          widgets: {
                            ...theme.widgets,
                            activeWidget: w.id as WidgetType,
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/30 shadow-md ring-1 ring-cyan-500/40'
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{w.icon}</span>
                        {isSelected && <span className="text-[10px] text-cyan-400 font-bold">✓ Aktif</span>}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{w.name}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{w.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Penempatan & Posisi Widget di Layar Beranda */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  2. Posisi Penempatan Widget di Layar Beranda
                </label>
                <span className="font-mono text-xs text-cyan-400 capitalize">
                  {theme.widgets?.position || 'top'} (Layar Utama)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'top',
                    name: 'Atas (Top)',
                    desc: 'Widget di atas, 3 baris ikon di bawah',
                    icon: '⬆️',
                  },
                  {
                    id: 'middle',
                    name: 'Tengah (Middle)',
                    desc: '1 baris ikon di atas, widget di tengah, 2 baris ikon di bawah',
                    icon: '↕️',
                  },
                  {
                    id: 'bottom',
                    name: 'Bawah (Bottom)',
                    desc: 'Semua ikon di atas, widget di bawah dekat dock',
                    icon: '⬇️',
                  },
                ].map((pos) => {
                  const isSelected = (theme.widgets?.position || 'top') === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() =>
                        onUpdateTheme({
                          ...theme,
                          widgets: {
                            ...theme.widgets,
                            position: pos.id as 'top' | 'middle' | 'bottom',
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/40 shadow-sm'
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{pos.icon}</span>
                        {isSelected && <span className="text-[10px] text-cyan-400 font-bold">✓ Aktif</span>}
                      </div>
                      <div className="text-xs font-bold text-white">{pos.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{pos.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Skala & Ukuran Widget (Real-time Scaling) */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-neutral-300 uppercase tracking-wider">
                    3. Skala & Ukuran Widget (Real-time Scaling)
                  </span>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Ubah skala widget untuk mengatur proporsi kartu terhadap kisi ikon beranda
                  </div>
                </div>
                <span className="font-mono text-cyan-400 font-bold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                  {((theme.widgets?.scale || 1.0) * 100).toFixed(0)}% ({(theme.widgets?.scale || 1.0).toFixed(2)}x)
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="0.80"
                  max="1.25"
                  step="0.05"
                  value={theme.widgets?.scale || 1.0}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      widgets: {
                        ...theme.widgets,
                        scale: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Kompak (0.80x)</span>
                  <div className="flex items-center gap-1.5">
                    {[0.85, 1.0, 1.15, 1.25].map((presetScale) => (
                      <button
                        key={presetScale}
                        type="button"
                        onClick={() =>
                          onUpdateTheme({
                            ...theme,
                            widgets: {
                              ...theme.widgets,
                              scale: presetScale,
                            },
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                          (theme.widgets?.scale || 1.0) === presetScale
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                            : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {(presetScale * 100).toFixed(0)}%
                      </button>
                    ))}
                  </div>
                  <span>Ekstra Besar (1.25x)</span>
                </div>
              </div>
            </div>

            {/* 4. Kustomisasi Jam & Tipografi Widget */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  4. Kustomisasi Jam & Tipografi Waktu Widget
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  Khusus Widget Cuaca & Jam
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Format Jam */}
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <span className="text-[11px] font-medium text-neutral-300">Format Waktu Jam:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '24h', label: '24 Jam (09:45 WIB)' },
                      { id: '12h', label: '12 Jam (09:45 AM)' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() =>
                          onUpdateTheme({
                            ...theme,
                            widgets: {
                              ...theme.widgets,
                              clockFormat: fmt.id as '24h' | '12h',
                            },
                          })
                        }
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                          (theme.widgets?.clockFormat || '24h') === fmt.id
                            ? 'border-cyan-500 bg-cyan-950/40 text-white font-bold'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipografi Jam */}
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <span className="text-[11px] font-medium text-neutral-300">Gaya Tipografi Jam:</span>
                  <select
                    value={theme.widgets?.clockFont || 'rajdhani'}
                    onChange={(e) =>
                      onUpdateTheme({
                        ...theme,
                        widgets: {
                          ...theme.widgets,
                          clockFont: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="rajdhani">Tactical Stencil (Rajdhani)</option>
                    <option value="jetbrains">Monospace Tech (JetBrains Mono)</option>
                    <option value="sans">Clean Modern (Sans-Serif)</option>
                    <option value="serif">Editorial Italic (Serif)</option>
                  </select>
                </div>
              </div>

              {/* Toggle Tanggal */}
              <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-xs text-neutral-300 font-medium">Tampilkan Baris Tanggal & Lokasi</span>
                <input
                  type="checkbox"
                  checked={theme.widgets?.showDate !== false}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      widgets: {
                        ...theme.widgets,
                        showDate: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
                />
              </div>
            </div>

            {/* 5. Gaya Kartu Widget */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                5. Gaya Kartu Widget (Material & Estetika)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'outline_mecha',
                    name: 'Outline Mecha',
                    desc: 'Aksen garis neon taktis, sudut industrial bersudut',
                  },
                  {
                    id: 'glass',
                    name: 'Kaca Transparan (Glass)',
                    desc: 'Frosted blur modern dengan pantulan specular halus',
                  },
                  {
                    id: 'solid_dark',
                    name: 'Solid Obsidian Dark',
                    desc: 'Latar gelap pekat monolitik kontras tinggi',
                  },
                ].map((s) => {
                  const isSelected = (theme.widgets?.style || 'outline_mecha') === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        onUpdateTheme({
                          ...theme,
                          widgets: {
                            ...theme.widgets,
                            style: s.id as WidgetStyle,
                          },
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/40'
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{s.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-1">{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Aksen Warna Widget */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  3. Aksen Warna Widget
                </label>
                <span className="font-mono text-xs" style={{ color: theme.widgets?.accentColor || '#00F0FF' }}>
                  {theme.widgets?.accentColor || '#00F0FF'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({
                        ...theme,
                        widgets: {
                          ...theme.widgets,
                          accentColor: c.hex,
                        },
                      })
                    }
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 ${
                        (theme.widgets?.accentColor || '#00F0FF') === c.hex
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-neutral-400 mt-1">{c.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Konten Memo Taktis (Jika memilih Tactical Memo) */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>📝 Kustomisasi Teks Catatan & Memo Taktis</span>
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Judul Memo / Tag Panggilan</label>
                  <input
                    type="text"
                    value={theme.widgets?.memoTitle || ''}
                    onChange={(e) =>
                      onUpdateTheme({
                        ...theme,
                        widgets: {
                          ...theme.widgets,
                          memoTitle: e.target.value,
                        },
                      })
                    }
                    placeholder="Misal: TACTICAL OPS // LOG-01"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Isi Pesan Catatan</label>
                  <textarea
                    rows={2}
                    value={theme.widgets?.memoContent || ''}
                    onChange={(e) =>
                      onUpdateTheme({
                        ...theme,
                        widgets: {
                          ...theme.widgets,
                          memoContent: e.target.value,
                        },
                      })
                    }
                    placeholder="Tulis instruksi atau catatan tema di sini..."
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:border-cyan-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => onTabChange('icons')}
                className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Kembali ke Ikon
              </button>
              <button
                type="button"
                onClick={() => onTabChange('systemui')}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-400/20"
              >
                <span>Lanjut ke Aspek 6: Control Center</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ASPEK 6: PUSAT KONTROL & SYSTEMUI */}
        {activeTab === 'systemui' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Aksen Warna Pusat Kontrol (Control Center Accent)
              </label>
              <div className="flex items-center gap-3">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({
                        ...theme,
                        systemUi: { ...theme.systemUi, accentColor: c.hex },
                      })
                    }
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 ${
                        theme.systemUi.accentColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-neutral-400 mt-1">{c.name.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Control Center Blur */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Intensitas Blur Pusat Kontrol</span>
                <span className="font-mono text-cyan-400">{theme.systemUi.controlCenterBlur}dp</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={theme.systemUi.controlCenterBlur}
                onChange={(e) =>
                  onUpdateTheme({
                    ...theme,
                    systemUi: { ...theme.systemUi, controlCenterBlur: Number(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Status Bar Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
              <div className="space-y-2">
                <label className="block text-xs text-neutral-300">Gaya Indikator Baterai</label>
                <div className="flex gap-2">
                  {(
                    [
                      { id: 'inside', name: 'Angka di Dalam' },
                      { id: 'outside', name: 'Persen di Luar' },
                    ] as const
                  ).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        onUpdateTheme({
                          ...theme,
                          systemUi: { ...theme.systemUi, batteryStyle: b.id },
                        })
                      }
                      className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                        theme.systemUi.batteryStyle === b.id
                          ? 'border-cyan-500 bg-cyan-950/30 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div>
                  <div className="text-xs font-semibold text-white">Indikator 5G Aktif</div>
                  <div className="text-[11px] text-neutral-400">Badge 5G di status bar</div>
                </div>
                <input
                  type="checkbox"
                  checked={theme.systemUi.show5G}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      systemUi: { ...theme.systemUi, show5G: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-cyan-400 cursor-pointer rounded"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => onTabChange('widgets')}
                className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Kembali ke Widget
              </button>
              <button
                type="button"
                onClick={() => onTabChange('preview_publish')}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-400/20"
              >
                <span>Lihat Kesiapan Posting Tema</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ASPEK 6: PRATINJAU TOKO & KESIAPAN PUBLIKASI (STORE SHOWCASE & PRE-FLIGHT AUDIT) */}
        {activeTab === 'preview_publish' && (
          <div className="space-y-6">
            {/* Readiness Score Banner */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg font-mono">
                  {readinessPercent}%
                </div>
                <div>
                  <div className="font-bold text-white text-sm">
                    {readinessPercent === 100
                      ? 'Tema 100% Lengkap & Siap Diposting ke Toko!'
                      : 'Hampir Siap! Lengkapi beberapa aspek sebelum posting'}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {totalValid} dari {checklistItems.length} aspek resmi Xiaomi Theme Store telah terpenuhi
                  </div>
                </div>
              </div>

              {onExportMtz && (
                <button
                  type="button"
                  onClick={onExportMtz}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-400/25 transition-all"
                >
                  <Download size={14} strokeWidth={2.5} />
                  <span>Unduh Paket .MTZ Siap Unggah</span>
                </button>
              )}
            </div>

            {/* Checklist Pre-Flight */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
              <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                Checklist Kelayakan Publikasi (Submission Standards)
              </div>
              <div className="space-y-2">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {item.valid ? (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                      )}
                      <span className={item.valid ? 'text-neutral-200' : 'text-amber-300 font-medium'}>
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        item.valid
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                      }`}
                    >
                      {item.valid ? 'LENGKAP' : 'PERIKSA KEMBALI'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Official Store Preview Screenshots */}
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Eye size={14} className="text-cyan-400" />
                    <span>Unduh Gambar Pratinjau Toko (Store Screenshots)</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Formulir pendaftaran tema di zhuti.xiaomi.com mewajibkan unggah gambar tangkapan layar preview resolusi tinggi:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadStorePreview('lockscreen')}
                  disabled={downloadingPreview}
                  className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-200 transition-all text-left"
                >
                  <div>
                    <div className="font-semibold text-white">preview_lockscreen_0.png</div>
                    <div className="text-[10px] text-neutral-500">Tangkapan Layar Kunci 1080×2400</div>
                  </div>
                  <Download size={14} className="text-cyan-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadStorePreview('launcher')}
                  disabled={downloadingPreview}
                  className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 flex items-center justify-between text-xs text-neutral-200 transition-all text-left"
                >
                  <div>
                    <div className="font-semibold text-white">preview_launcher_0.png</div>
                    <div className="text-[10px] text-neutral-500">Tangkapan Layar Beranda & Ikon</div>
                  </div>
                  <Download size={14} className="text-cyan-400" />
                </button>
              </div>
            </div>

            {/* Direct Link to Xiaomi Theme Designer Portal */}
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Langkah Terakhir: Unggah ke Portal Resmi</div>
                <div className="text-[11px] text-neutral-400">
                  Buka portal resmi desainer Xiaomi untuk memposting tema Anda ke seluruh pengguna HyperOS di dunia.
                </div>
              </div>
              <a
                href="https://zhuti.xiaomi.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition-all"
              >
                <span>zhuti.xiaomi.com</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
