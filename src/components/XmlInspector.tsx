import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  RefreshCw,
  FileCode,
  ShieldCheck,
  Zap,
  Check,
  Columns,
  Maximize2,
  Minimize2,
  Wrench,
  BookOpen,
  Code2,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ThemeConfig, ValidationIssue, ValidationReport, XmlFileItem } from '../types/theme';
import { applyQuickFix, formatXml, validateXmlString } from '../utils/xmlValidator';

interface XmlInspectorProps {
  theme: ThemeConfig;
  files: XmlFileItem[];
  onUpdateFileContent: (path: string, newContent: string) => void;
  onResetFilesToGenerated: () => void;
  report: ValidationReport;
  onRunDiagnostic: () => void;
}

export const XmlInspector: React.FC<XmlInspectorProps> = ({
  theme,
  files,
  onUpdateFileContent,
  onResetFilesToGenerated,
  report,
  onRunDiagnostic,
}) => {
  const [activeFilePath, setActiveFilePath] = useState<string>(files[0]?.path || 'description.xml');
  const [copied, setCopied] = useState(false);
  const [viewLayout, setViewLayout] = useState<'split' | 'editor_only' | 'diagnostics_only'>('split');
  const [rightPanelTab, setRightPanelTab] = useState<'issues' | 'rules' | 'snippets'>('issues');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];

  // Real-time issues specifically for the active file
  const activeFileIssues = useMemo(() => {
    return validateXmlString(activeFile?.content || '', activeFile?.path || '');
  }, [activeFile?.content, activeFile?.path]);

  // Compute total line count and lines array
  const lines = useMemo(() => {
    return (activeFile?.content || '').split('\n');
  }, [activeFile?.content]);

  // Map issues by line number for fast gutter lookup
  const issuesByLine = useMemo(() => {
    const map = new Map<number, ValidationIssue[]>();
    activeFileIssues.forEach((issue) => {
      if (issue.line) {
        const existing = map.get(issue.line) || [];
        existing.push(issue);
        map.set(issue.line, existing);
      }
    });
    return map;
  }, [activeFileIssues]);

  // Sync scroll between line numbers gutter and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Track cursor position
  const handleSelectOrKeyUp = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const value = target.value.substring(0, target.selectionStart);
    const lineCount = value.split('\n').length;
    const lastLine = value.split('\n').pop() || '';
    setCursorPos({ line: lineCount, col: lastLine.length + 1 });
  };

  // Allow tab key indentation inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onUpdateFileContent(activeFile.path, newValue);
      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format active XML
  const handleFormatXml = () => {
    if (activeFile) {
      const formatted = formatXml(activeFile.content);
      onUpdateFileContent(activeFile.path, formatted);
    }
  };

  // Quick fix handler
  const handleQuickFix = (issue: ValidationIssue) => {
    if (activeFile) {
      const fixed = applyQuickFix(activeFile.content, issue);
      onUpdateFileContent(activeFile.path, fixed);
    }
  };

  // Insert code snippet at end
  const handleInsertSnippet = (snippet: string) => {
    if (activeFile) {
      const newContent = activeFile.content + '\n' + snippet;
      onUpdateFileContent(activeFile.path, newContent);
    }
  };

  // Jump to specific line in textarea
  const handleJumpToLine = (lineNumber?: number) => {
    if (!lineNumber || !textareaRef.current) return;
    const lineIndex = lineNumber - 1;
    let charIndex = 0;
    for (let i = 0; i < lineIndex && i < lines.length; i++) {
      charIndex += lines[i].length + 1; // +1 for newline
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIndex, charIndex + (lines[lineIndex]?.length || 0));

    // Scroll to line
    const approxLineHeight = 20;
    textareaRef.current.scrollTop = Math.max(0, lineIndex * approxLineHeight - 100);
  };

  const hasErrors = activeFileIssues.some((i) => i.severity === 'error');
  const hasWarnings = activeFileIssues.some((i) => i.severity === 'warning');

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. TOP HEADER & TOOLBAR */}
      <div className="px-5 py-3.5 bg-neutral-950/90 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileCode size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Viewer & Editor XML Berdampingan
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">· {activeFile.path}</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Validasi sintaks real-time & standar kepatuhan Xiaomi HyperOS Engine
            </p>
          </div>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Layout Toggle Buttons */}
          <div className="flex items-center p-0.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewLayout('split')}
              className={`p-1.5 rounded-md transition-all ${
                viewLayout === 'split' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white'
              }`}
              title="Tampilan Berdampingan (Split 50/50)"
            >
              <Columns size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('editor_only')}
              className={`p-1.5 rounded-md transition-all ${
                viewLayout === 'editor_only' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white'
              }`}
              title="Editor Penuh"
            >
              <Maximize2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('diagnostics_only')}
              className={`p-1.5 rounded-md transition-all ${
                viewLayout === 'diagnostics_only' ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white'
              }`}
              title="Panel Standar & Diagnostik Penuh"
            >
              <Minimize2 size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleFormatXml}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-all"
            title="Rapikan indentasi XML"
          >
            <Code2 size={13} className="text-cyan-400" />
            <span>Rapikan</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-all"
            title="Salin XML"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            type="button"
            onClick={onResetFilesToGenerated}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-800/60 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-all"
            title="Kembalikan isi berkas ke hasil konfigurasi visual"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onRunDiagnostic}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all active:scale-95"
          >
            <ShieldCheck size={14} />
            <span>Uji Ulang</span>
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME VALIDATION STATUS BANNER */}
      <div
        className={`px-5 py-2.5 flex items-center justify-between border-b text-xs transition-colors ${
          !hasErrors
            ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
            : 'bg-rose-950/40 border-rose-900/50 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {!hasErrors ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <XCircle size={16} className="text-rose-400 shrink-0" />
          )}
          <span className="font-medium">
            {!hasErrors
              ? `Berkas '${activeFile.path}' 100% valid & sesuai standar XML HyperOS.`
              : `Terdeteksi ${activeFileIssues.filter((i) => i.severity === 'error').length} error sintaks pada '${activeFile.path}'.`}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span>Baris: {lines.length}</span>
          <span>·</span>
          <span>
            {hasErrors ? (
              <span className="text-rose-400 font-bold">{activeFileIssues.length} Masalah</span>
            ) : hasWarnings ? (
              <span className="text-amber-400 font-bold">{activeFileIssues.length} Peringatan</span>
            ) : (
              <span className="text-emerald-400 font-bold">Lolos Uji</span>
            )}
          </span>
        </div>
      </div>

      {/* 3. FILE NAVIGATION TABS */}
      <div className="flex items-center gap-1 px-3 py-2 bg-neutral-950 border-b border-neutral-800 overflow-x-auto text-xs">
        {files.map((file) => {
          const fileErrors = validateXmlString(file.content, file.path).filter((i) => i.severity === 'error');
          const fileWarnings = validateXmlString(file.content, file.path).filter((i) => i.severity === 'warning');

          const isActive = activeFilePath === file.path;

          return (
            <button
              key={file.path}
              type="button"
              onClick={() => setActiveFilePath(file.path)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-neutral-800 text-white font-medium border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <span className="font-mono text-[11px]">{file.path}</span>
              {fileErrors.length > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {fileErrors.length}
                </span>
              ) : fileWarnings.length > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {fileWarnings.length}
                </span>
              ) : (
                <CheckCircle2 size={12} className="text-emerald-500 opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN SIDE-BY-SIDE CONTENT CONTAINER */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[520px] bg-neutral-950 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
        {/* LEFT PANE: CODE EDITOR WITH LINE NUMBERS & REAL-TIME ERROR GUTTER */}
        {(viewLayout === 'split' || viewLayout === 'editor_only') && (
          <div
            className={`${
              viewLayout === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'
            } flex flex-col h-full overflow-hidden bg-neutral-950 font-code relative`}
          >
            {/* Editor Subheader */}
            <div className="px-4 py-2 bg-neutral-950/90 border-b border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Code2 size={12} className="text-cyan-400" />
                <span>Editor Berkas XML (Edit langsung untuk menguji toleransi sintaks)</span>
              </span>
              <span className="font-mono text-neutral-500">
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
            </div>

            {/* Split Line Numbers + Textarea Container */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Line Numbers Gutter */}
              <div
                ref={lineNumbersRef}
                className="w-14 py-3 bg-neutral-950 border-r border-neutral-800/80 text-neutral-600 text-[12px] font-mono select-none overflow-hidden shrink-0 text-right pr-2 space-y-0"
                style={{ lineHeight: '20px' }}
              >
                {lines.map((_, index) => {
                  const lineNum = index + 1;
                  const lineIssues = issuesByLine.get(lineNum) || [];
                  const hasLineError = lineIssues.some((i) => i.severity === 'error');
                  const hasLineWarning = lineIssues.some((i) => i.severity === 'warning');

                  return (
                    <div
                      key={lineNum}
                      onClick={() => handleJumpToLine(lineNum)}
                      className={`h-[20px] flex items-center justify-end gap-1 px-1 cursor-pointer transition-colors ${
                        hasLineError
                          ? 'text-rose-400 font-bold bg-rose-500/10'
                          : hasLineWarning
                          ? 'text-amber-400 font-bold bg-amber-500/10'
                          : cursorPos.line === lineNum
                          ? 'text-cyan-300 font-semibold'
                          : 'hover:text-neutral-300'
                      }`}
                      title={
                        lineIssues.length > 0
                          ? `Baris ${lineNum}: ${lineIssues.map((i) => i.message).join(' | ')}`
                          : `Baris ${lineNum}`
                      }
                    >
                      {hasLineError && (
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                      {!hasLineError && hasLineWarning && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      <span>{lineNum}</span>
                    </div>
                  );
                })}
              </div>

              {/* Textarea Editor */}
              <textarea
                ref={textareaRef}
                value={activeFile?.content || ''}
                onChange={(e) => onUpdateFileContent(activeFile.path, e.target.value)}
                onScroll={handleScroll}
                onKeyUp={handleSelectOrKeyUp}
                onClick={handleSelectOrKeyUp}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="w-full flex-1 p-3 bg-transparent text-neutral-100 outline-none resize-none font-mono text-[12px] leading-[20px] whitespace-pre overflow-auto selection:bg-cyan-500/30 selection:text-cyan-200"
                placeholder="Tulis atau paste kode XML di sini..."
              />
            </div>

            {/* In-Editor Error Warning Strip (If active line has issues) */}
            {issuesByLine.has(cursorPos.line) && (
              <div className="px-4 py-2 bg-rose-950/70 border-t border-rose-900/50 text-xs text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400 shrink-0" />
                  <span className="font-semibold">
                    Baris {cursorPos.line}: {issuesByLine.get(cursorPos.line)?.[0]?.message}
                  </span>
                </div>
                {issuesByLine.get(cursorPos.line)?.[0]?.fixAvailable && (
                  <button
                    type="button"
                    onClick={() => handleQuickFix(issuesByLine.get(cursorPos.line)![0])}
                    className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[11px] font-semibold text-rose-200 flex items-center gap-1 transition-all"
                  >
                    <Wrench size={11} />
                    <span>Perbaiki Sekarang</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* RIGHT PANE: HYPEROS STANDARDS, DIAGNOSTICS & FIX SUGGESTIONS */}
        {(viewLayout === 'split' || viewLayout === 'diagnostics_only') && (
          <div
            className={`${
              viewLayout === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'
            } flex flex-col h-full bg-neutral-900/60 overflow-hidden text-xs`}
          >
            {/* Right Pane Tab Header */}
            <div className="p-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('issues')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    rightPanelTab === 'issues'
                      ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck size={13} />
                  <span>Daftar Masalah</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeFileIssues.length > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {activeFileIssues.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightPanelTab('rules')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    rightPanelTab === 'rules'
                      ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <BookOpen size={13} />
                  <span>Standar HyperOS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightPanelTab('snippets')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    rightPanelTab === 'snippets'
                      ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Code2 size={13} />
                  <span>Snippet XML</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: ACTIVE ISSUES & QUICK FIXES */}
            {rightPanelTab === 'issues' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {activeFileIssues.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-3 my-auto">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Tidak Ditemukan Masalah Sintaks</div>
                      <div className="text-xs text-neutral-400 mt-1 max-w-xs">
                        Berkas ini memenuhi seluruh kaidah XML standar dan spesifikasi tema Xiaomi HyperOS 1.0 & 2.0.
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleFormatXml}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-xs text-neutral-300 flex items-center gap-1.5"
                      >
                        <Code2 size={13} className="text-cyan-400" />
                        <span>Rapikan Indentasi Berkas</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  activeFileIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                        issue.severity === 'error'
                          ? 'bg-rose-950/40 border-rose-900/60 text-rose-200'
                          : 'bg-amber-950/40 border-amber-900/60 text-amber-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {issue.severity === 'error' ? (
                            <XCircle size={15} className="text-rose-400 shrink-0" />
                          ) : (
                            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                          )}
                          <span className="font-bold text-xs uppercase tracking-wider">
                            {issue.severity === 'error' ? 'Sintaks Error' : 'Peringatan Standar'}
                          </span>
                        </div>

                        {issue.line && (
                          <button
                            type="button"
                            onClick={() => handleJumpToLine(issue.line)}
                            className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 flex items-center gap-1 transition-all"
                            title="Klik untuk melompat ke baris ini di editor"
                          >
                            <span>Baris {issue.line}</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>

                      <div className="text-xs font-medium text-white leading-relaxed">
                        {issue.message}
                      </div>

                      {issue.suggestion && (
                        <div className="text-[11px] text-neutral-300 bg-black/40 p-2 rounded-lg border border-neutral-800 flex items-start gap-1.5">
                          <Info size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-cyan-300">Saran Perbaikan: </span>
                            {issue.suggestion}
                          </div>
                        </div>
                      )}

                      {/* 1-Click Quick Fix Action */}
                      {issue.fixAvailable && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleQuickFix(issue)}
                            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-all active:scale-95"
                          >
                            <Wrench size={12} />
                            <span>{issue.fixLabel || 'Perbaiki Otomatis'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 2: HYPEROS SPECIFICATION RULES */}
            {rightPanelTab === 'rules' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs text-neutral-300">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen size={14} className="text-cyan-400" />
                    <span>Kaidah description.xml HyperOS</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px]">
                    <li>
                      <code className="text-cyan-300 font-mono">&lt;uiVersion&gt;1&lt;/uiVersion&gt;</code> wajib
                      disertakan agar tema diidentifikasi sebagai HyperOS (bukan MIUI 10 legacy).
                    </li>
                    <li>
                      <code className="text-cyan-300 font-mono">&lt;platform&gt;HyperOS&lt;/platform&gt;</code>{' '}
                      menandai kompatibilitas arsitektur engine terbaru.
                    </li>
                    <li>
                      Tag <code className="text-cyan-300 font-mono">&lt;title&gt;</code> dan{' '}
                      <code className="text-cyan-300 font-mono">&lt;author&gt;</code> tidak boleh kosong.
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen size={14} className="text-cyan-400" />
                    <span>Kaidah lockscreen/manifest.xml</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px]">
                    <li>
                      Gunakan <code className="text-cyan-300 font-mono">version="2"</code> pada tag root manifest untuk
                      mendukung efek kedalaman (*depth wallpaper*) dan font majalah.
                    </li>
                    <li>
                      Format warna harus berupa heksadesimal valid Android: <code className="text-cyan-300 font-mono">#RRGGBB</code> atau <code className="text-cyan-300 font-mono">#AARRGGBB</code>.
                    </li>
                    <li>
                      Semua elemen teks atau waktu harus berada di dalam grup koordinat layar standar 1080px.
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen size={14} className="text-cyan-400" />
                    <span>Kaidah icons & package mapping</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[11px]">
                    <li>
                      Masking bentuk ikon HyperOS standar memakai <code className="text-cyan-300 font-mono">shape="squircle"</code> radius 38px atau chamfer untuk gaya mecha.
                    </li>
                    <li>
                      Nama file ikon harus persis dengan package name aplikasi (contoh: <code className="text-cyan-300 font-mono">com.whatsapp.png</code>).
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: QUICK XML CODE SNIPPETS */}
            {rightPanelTab === 'snippets' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                <div className="text-[11px] text-neutral-400 mb-2">
                  Klik tombol sisipkan untuk menambahkan elemen standar ke berkas XML yang sedang dibuka:
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Elemen Jam Digital</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertSnippet(
                          '  <DateTime x="540" y="360" align="center" format="HH:mm" color="#00F0FF" size="140" fontStyle="bold" />'
                        )
                      }
                      className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Plus size={11} />
                      <span>Sisipkan</span>
                    </button>
                  </div>
                  <code className="p-2 rounded bg-black/60 font-mono text-[10px] text-neutral-300 block overflow-x-auto">
                    &lt;DateTime x="540" y="360" align="center" format="HH:mm" color="#00F0FF" size="140" /&gt;
                  </code>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Variabel Warna Kustom</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertSnippet(
                          '  <Var name="accent_theme_color" expression="\'#00F0FF\'" type="string" />'
                        )
                      }
                      className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Plus size={11} />
                      <span>Sisipkan</span>
                    </button>
                  </div>
                  <code className="p-2 rounded bg-black/60 font-mono text-[10px] text-neutral-300 block overflow-x-auto">
                    &lt;Var name="accent_theme_color" expression="'#00F0FF'" type="string" /&gt;
                  </code>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Tombol Shortcut Senter</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertSnippet(
                          '  <Button name="torch_button" x="100" y="2180" w="100" h="100">\n    <Normal>\n      <Circle x="50" y="50" r="44" fillColor="#1f2937" alpha="180" />\n      <Image x="30" y="30" w="40" h="40" src="icons/torch.png" />\n    </Normal>\n  </Button>'
                        )
                      }
                      className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Plus size={11} />
                      <span>Sisipkan</span>
                    </button>
                  </div>
                  <code className="p-2 rounded bg-black/60 font-mono text-[10px] text-neutral-300 block overflow-x-auto">
                    &lt;Button name="torch_button" x="100" y="2180" w="100" h="100"&gt; ... &lt;/Button&gt;
                  </code>
                </div>
              </div>
            )}

            {/* Bottom Panel Summary */}
            <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-cyan-400" />
                <span>Engine DOMParser Aktif</span>
              </span>
              <span className="font-mono text-cyan-400">
                {activeFileIssues.length === 0 ? 'Semua Baris Bersih' : `${activeFileIssues.length} Perlu Dicek`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. BOTTOM XML TIPS FOOTER */}
      <div className="px-5 py-2.5 bg-neutral-950 border-t border-neutral-800 text-[11px] text-neutral-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-cyan-400 shrink-0" />
          <span>
            Setiap pengetikan XML divalidasi secara real-time. Baris berkode merah menunjukkan tag yang tidak berpasangan atau karakter terlarang.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-neutral-500">
          <span>HyperOS Engine Validator v2.4</span>
        </div>
      </div>
    </div>
  );
};
