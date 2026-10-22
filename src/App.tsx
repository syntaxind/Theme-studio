/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Sliders,
  FileCode,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Layers,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Eye,
  Activity,
  Package,
  UploadCloud,
  FolderOpen,
  FolderArchive,
} from 'lucide-react';

import { AspectTab, PreviewMode, ThemeConfig, XmlFileItem, ValidationReport } from './types/theme';
import { THEME_PRESETS } from './data/presets';
import { getAllGeneratedThemeFiles } from './utils/xmlGenerators';
import { runThemeDiagnostic } from './utils/xmlValidator';
import { generateMtzArchive, downloadBlob } from './utils/mtzPackager';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ThemeEditor } from './components/ThemeEditor';
import { XmlInspector } from './components/XmlInspector';
import { ModuleExplorer } from './components/ModuleExplorer';
import { GuideModal } from './components/GuideModal';
import { ImportThemeModal } from './components/ImportThemeModal';
import { ImportResult } from './utils/mtzImporter';
import { syncXmlToTheme } from './utils/xmlSynchronizer';

export default function App() {
  // Current active theme configuration
  const [theme, setTheme] = useState<ThemeConfig>(THEME_PRESETS.mecha_dark);

  // Active view states
  const [previewMode, setPreviewMode] = useState<PreviewMode>('lockscreen');
  const [activeEditorTab, setActiveEditorTab] = useState<AspectTab>('identity');
  const [workspaceMode, setWorkspaceMode] = useState<
    'visual_editor' | 'modules_explorer' | 'xml_inspector' | 'health_matrix'
  >('visual_editor');

  // Custom XML file overrides (if user edits in XML inspector)
  const [customFiles, setCustomFiles] = useState<XmlFileItem[] | null>(null);

  // Generated XML files computed from theme config
  const currentFiles = useMemo(() => {
    if (customFiles) return customFiles;
    return getAllGeneratedThemeFiles(theme);
  }, [theme, customFiles]);

  // Real-time XML and file validation diagnostic
  const [report, setReport] = useState<ValidationReport>(() => runThemeDiagnostic(theme, currentFiles));

  // Modals & Export state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isXmlExpanded, setIsXmlExpanded] = useState(false);
  const [isPhoneMockupVisible, setIsPhoneMockupVisible] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<{ percent: number; text: string }>({
    percent: 0,
    text: '',
  });

  const handleThemeImported = (result: ImportResult, targetView: 'visual' | 'xml' | 'modules') => {
    setTheme(result.theme);
    setCustomFiles(result.files.length > 0 ? result.files : null);
    if (targetView === 'xml') {
      setWorkspaceMode('xml_inspector');
    } else if (targetView === 'modules') {
      setWorkspaceMode('modules_explorer');
    } else {
      setWorkspaceMode('visual_editor');
    }
    const fresh = runThemeDiagnostic(result.theme, result.files);
    setReport(fresh);
    const customIconsCount = Object.keys(result.theme.icons.customIcons || {}).length;
    setToastMessage(
      `Tema "${result.theme.meta.title}" berhasil diimpor! (${customIconsCount} ikon PNG nyata & ${result.files.length} berkas modul siap dipakai).`
    );
    setTimeout(() => setToastMessage(null), 6000);
  };

  // Re-run validation whenever theme or files change
  useEffect(() => {
    const updatedReport = runThemeDiagnostic(theme, currentFiles);
    setReport(updatedReport);
  }, [theme, currentFiles]);

  // Handle Preset Theme Selection
  const handleSelectPreset = (presetKey: string) => {
    if (THEME_PRESETS[presetKey]) {
      setTheme(THEME_PRESETS[presetKey]);
      setCustomFiles(null);
    }
  };
  // Handle manual XML edits in the Inspector
  const handleUpdateFileContent = (path: string, newContent: string) => {
    const base = customFiles || getAllGeneratedThemeFiles(theme);
    const updated = base.map((file) => (file.path === path ? { ...file, content: newContent } : file));
    setCustomFiles(updated);

    // Bidirectional sync: automatically parse valid XML changes and update live phone preview!
    try {
      const syncedTheme = syncXmlToTheme(updated, theme);
      setTheme(syncedTheme);
    } catch {
      // Incomplete typing in XML editor
    }
  };

  // Reset custom XML edits back to the visual theme state
  const handleResetFilesToGenerated = () => {
    setCustomFiles(null);
  };

  // Trigger diagnostic manually
  const handleRunDiagnostic = () => {
    const fresh = runThemeDiagnostic(theme, currentFiles);
    setReport(fresh);
  };

  // Export & Download authentic .mtz file
  const handleExportMtz = async () => {
    try {
      setIsExporting(true);
      setExportProgress({ percent: 10, text: 'Menginisialisasi kompresi tema...' });

      const blob = await generateMtzArchive(theme, currentFiles, (percent, text) => {
        setExportProgress({ percent, text });
      });

      const sanitizedName = (theme.meta.title || 'HyperOS_Theme')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_');

      downloadBlob(blob, `${sanitizedName}.mtz`);
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to export MTZ:', err);
      setIsExporting(false);
      alert('Gagal mengekspor file .mtz: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* TOP BAR CONTRACT: 3 ZONES */}
      <header className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Cpu size={18} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              HyperOS Theme Studio
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-700/60 text-cyan-300">
              HyperOS 3.0 Ready
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-neutral-400">
          <button
            type="button"
            onClick={() => setWorkspaceMode('visual_editor')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              workspaceMode === 'visual_editor' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Visual Studio
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('modules_explorer')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              workspaceMode === 'modules_explorer' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <FolderArchive size={13} className="text-cyan-400" />
            <span>Pusat Modul & File Nyata</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-mono">
              Data Asli
            </span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('xml_inspector')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              workspaceMode === 'xml_inspector' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Pemeriksa File & XML
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('health_matrix')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              workspaceMode === 'health_matrix' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Uji Kelancaran Sistem
          </button>
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white text-neutral-400 flex items-center gap-1"
          >
            <HelpCircle size={13} />
            <span>Panduan Pasang</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Import & Export) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-all active:scale-95 whitespace-nowrap shrink-0 shadow-sm"
            title="Buka atau impor file tema .mtz dari komputer Anda untuk dicek dan diedit"
          >
            <UploadCloud size={14} className="text-cyan-400" />
            <span>Impor Tema (.MTZ)</span>
          </button>

          <button
            type="button"
            onClick={handleExportMtz}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-400/20 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download size={14} strokeWidth={2.5} />
            <span>Ekspor .MTZ Siap Pasang</span>
          </button>
        </div>
      </header>

      {/* SUB-HEADER PRESET PICKER & QUICK STATUS STRIP */}
      <section className="bg-neutral-900/60 border-b border-neutral-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Preset Theme Quick Switches */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium whitespace-nowrap">Template Desain:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => handleSelectPreset('mecha_dark')}
              className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap ${
                theme.meta.title.includes('Mecha')
                  ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Mecha Dark Apex (Konsep Anda)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('hyper_magazine')}
              className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap ${
                theme.meta.title.includes('Magazine')
                  ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Hyper Magazine Red
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('cyber_neon')}
              className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap ${
                theme.meta.title.includes('Cyber')
                  ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Cyber Grid 2077
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('minimal_monochrome')}
              className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap ${
                theme.meta.title.includes('Monochrome')
                  ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Monochrome Steel
            </button>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
            >
              <UploadCloud size={12} />
              <span>Impor .MTZ Sendiri</span>
            </button>
          </div>
        </div>

        {/* XML Health Status Indicator & Mockup Visibility Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Mockup Visibility Toggle */}
          <button
            type="button"
            onClick={() => setIsPhoneMockupVisible(!isPhoneMockupVisible)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isPhoneMockupVisible
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
            }`}
            title={
              isPhoneMockupVisible
                ? 'Sembunyikan simulasi HP agar tulisan editor leluasa & tidak tertutup'
                : 'Tampilkan kembali simulasi HP di samping editor'
            }
          >
            <Smartphone size={13} className={isPhoneMockupVisible ? 'text-neutral-400' : 'text-cyan-400'} />
            <span>{isPhoneMockupVisible ? 'Sembunyikan Mockup HP' : 'Tampilkan Mockup HP'}</span>
          </button>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${
              report.isValid
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            {report.isValid ? <CheckCircle2 size={13} className="text-emerald-400" /> : <ShieldCheck size={13} className="text-rose-400" />}
            <span>Status XML: {report.isValid ? '100% Lancar & Valid' : `${report.issues.length} Isu Terdeteksi`}</span>
          </div>

          <button
            type="button"
            onClick={handleRunDiagnostic}
            className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 text-xs transition-colors"
            title="Periksa ulang semua XML"
          >
            <RefreshCw size={12} />
            <span>Tes Ulang</span>
          </button>
        </div>
      </section>

      {/* MAIN TWO-COLUMN STUDIO WORKSPACE */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: REALISTIC XIAOMI PHONE SIMULATOR (5 COLS when visible) */}
        {isPhoneMockupVisible && (!isXmlExpanded || workspaceMode !== 'xml_inspector') && (
          <section className="lg:col-span-5 flex flex-col items-center justify-start relative lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto no-scrollbar z-10 w-full">
            <div className="w-full flex items-center justify-between px-2 mb-2 max-w-[370px]">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-cyan-400" />
                <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Live View HyperOS
                </h2>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  3.0 Ready
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPhoneMockupVisible(false)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
                title="Sembunyikan mockup HP agar seluruh tulisan editor terlihat penuh tanpa tertutup"
              >
                <span>Tutup Mockup</span>
                <span className="text-[10px] text-neutral-500">✕</span>
              </button>
            </div>

            {/* Interactive Phone Frame */}
            <PhoneSimulator
              theme={theme}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              onUpdateTheme={(updated) => {
                setTheme(updated);
                setCustomFiles(null);
              }}
              onNavigateToModules={() => setWorkspaceMode('modules_explorer')}
            />
          </section>
        )}

        {/* RIGHT COLUMN: WORKSPACE TABS & CONTROLS (7 COLS or 12 COLS if mockup hidden/expanded) */}
        <section
          className={`${
            !isPhoneMockupVisible || (isXmlExpanded && workspaceMode === 'xml_inspector')
              ? 'lg:col-span-12'
              : 'lg:col-span-7'
          } flex flex-col space-y-4 w-full`}
        >
          {/* Notice when Mockup is Hidden */}
          {!isPhoneMockupVisible && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-300 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <Smartphone size={15} className="text-cyan-400 shrink-0" />
                <span>
                  <strong>Mode Layar Penuh:</strong> Mockup HP sedang disembunyikan agar seluruh tulisan, navigasi, dan formulir terbaca dengan jelas tanpa terhalang.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPhoneMockupVisible(true)}
                className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
              >
                Buka Mockup HP
              </button>
            </div>
          )}
          {/* Workspace Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs gap-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setWorkspaceMode('visual_editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  workspaceMode === 'visual_editor'
                    ? 'bg-neutral-800 text-cyan-400 shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sliders size={14} />
                <span>Visual Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('xml_inspector')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  workspaceMode === 'xml_inspector'
                    ? 'bg-neutral-800 text-cyan-400 shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileCode size={14} />
                <span>Inspeksi XML & Kode</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('health_matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  workspaceMode === 'health_matrix'
                    ? 'bg-neutral-800 text-cyan-400 shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Activity size={14} />
                <span>Uji Kelancaran ({report.isValid ? 'Lancar' : 'Perlu Cek'})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {workspaceMode === 'xml_inspector' && (
                <button
                  type="button"
                  onClick={() => setIsXmlExpanded(!isXmlExpanded)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    isXmlExpanded
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                  title={isXmlExpanded ? 'Tampilkan Mockup HP di Samping' : 'Layar Penuh Studio XML'}
                >
                  <Eye size={12} />
                  <span>{isXmlExpanded ? 'Tampilkan Mockup HP' : 'Fokus Layar Penuh XML'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="text-neutral-400 hover:text-cyan-400 text-xs font-medium px-2 py-1 flex items-center gap-1 transition-colors"
              >
                <span>Cara Pasang MTZ</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: VISUAL THEME EDITOR */}
          {workspaceMode === 'visual_editor' && (
            <ThemeEditor
              theme={theme}
              onUpdateTheme={(updated) => {
                setTheme(updated);
                setCustomFiles(null);
              }}
              activeTab={activeEditorTab}
              onTabChange={setActiveEditorTab}
              onOpenImportModal={() => setIsImportOpen(true)}
              onExportMtz={handleExportMtz}
              onPreviewModeChange={setPreviewMode}
            />
          )}

          {/* VIEW MODE 2: AUTHENTIC HYPEROS MODULE EXPLORER */}
          {workspaceMode === 'modules_explorer' && (
            <ModuleExplorer
              theme={theme}
              customFiles={currentFiles}
              onUpdateTheme={(updated) => {
                setTheme(updated);
                setCustomFiles(null);
              }}
              onExportMtz={handleExportMtz}
            />
          )}

          {/* VIEW MODE 3: XML & FILE INSPECTOR */}
          {workspaceMode === 'xml_inspector' && (
            <XmlInspector
              theme={theme}
              files={currentFiles}
              onUpdateFileContent={handleUpdateFileContent}
              onResetFilesToGenerated={handleResetFilesToGenerated}
              report={report}
              onRunDiagnostic={handleRunDiagnostic}
            />
          )}

          {/* VIEW MODE 3: THEME HEALTH MATRIX & VALIDATION VERIFIER */}
          {workspaceMode === 'health_matrix' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck size={18} className="text-cyan-400" />
                    <span>Laporan Kelancaran Berkas & Validasi XML HyperOS</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Memastikan seluruh berkas dan sintaks XML 100% kompatibel sebelum dipasang ke HP
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunDiagnostic}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw size={12} />
                  <span>Jalankan Diagnostik</span>
                </button>
              </div>

              {/* Status KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Status Sintaks XML</div>
                  <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                    <span className={report.isValid ? 'text-emerald-400' : 'text-rose-400'}>
                      {report.isValid ? 'Lancar & Valid' : 'Ada Masalah'}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">Uji DOMParser Browser</div>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Total Berkas Terverifikasi</div>
                  <div className="text-lg font-bold text-white mt-1 tabular-nums">
                    {report.stats.validXmls} / {report.stats.totalFiles - 2} File XML
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    Struktur arsip MTZ resmi
                  </div>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">Kompatibilitas HyperOS</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1">
                    HyperOS 1.0 & 2.0
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">uiVersion 1 (Flag 1)</div>
                </div>
              </div>

              {/* File Breakdown List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Daftar Berkas Bundel Tema
                </div>
                <div className="space-y-2 text-xs">
                  {currentFiles.map((file) => {
                    const fileErrors = report.issues.filter(
                      (i) => (i.file === file.path || file.path.includes(i.file)) && i.severity === 'error'
                    );
                    const isOk = fileErrors.length === 0;

                    return (
                      <div
                        key={file.path}
                        className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileCode size={16} className={isOk ? 'text-cyan-400' : 'text-rose-400'} />
                          <div>
                            <div className="font-mono text-white text-xs">{file.path}</div>
                            <div className="text-[11px] text-neutral-400">{file.displayName}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                              isOk
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                                : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                            }`}
                          >
                            {isOk ? 'Lancar (Valid XML)' : `${fileErrors.length} Error`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {/* Binary Assets */}
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Package size={16} className="text-cyan-400" />
                      <div>
                        <div className="font-mono text-white text-xs">wallpaper/default_wallpaper.jpg</div>
                        <div className="text-[11px] text-neutral-400">Wallpaper latar belakang resolusi tinggi</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                      Tersedia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* EXPORT PROGRESS OVERLAY MODAL */}
      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto animate-spin">
              <RefreshCw size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Sedang Mengemas Tema HyperOS (.mtz)
              </h3>
              <p className="text-xs text-neutral-400 mt-1">{exportProgress.text}</p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress.percent}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-neutral-400">
              {exportProgress.percent}% Selesai
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST BANNER */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-2.5 bg-neutral-900 border border-cyan-500/50 rounded-2xl shadow-2xl flex items-center gap-2 text-xs text-cyan-200">
            <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* HOW TO INSTALL GUIDE MODAL */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* IMPORT THEME MODAL */}
      <ImportThemeModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onThemeImported={handleThemeImported}
      />

      {/* SIMPLE FOOTER */}
      <footer className="mt-auto border-t border-neutral-800/80 px-6 py-4 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span>HyperOS Theme Studio</span>
          <span className="mx-2">·</span>
          <span>Dukungan Xiaomi HyperOS 1.0 & 2.0</span>
          <span className="mx-2">·</span>
          <span>Ekspor Format .MTZ Asli</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-white transition-colors"
          >
            Panduan Pemasangan
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={handleRunDiagnostic}
            className="hover:text-white transition-colors"
          >
            Diagnostik XML
          </button>
        </div>
      </footer>
    </div>
  );
}
