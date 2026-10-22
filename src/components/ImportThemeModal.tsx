import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCode,
  ArrowRight,
  Eye,
  Sliders,
  Sparkles,
  RefreshCw,
  FolderArchive,
} from 'lucide-react';
import { ImportResult, parseMtzArchive } from '../utils/mtzImporter';
import { generateMtzArchive } from '../utils/mtzPackager';
import { THEME_PRESETS } from '../data/presets';
import { ThemeConfig, XmlFileItem } from '../types/theme';

interface ImportThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeImported: (result: ImportResult, targetView: 'visual' | 'xml' | 'modules') => void;
}

export const ImportThemeModal: React.FC<ImportThemeModalProps> = ({
  isOpen,
  onClose,
  onThemeImported,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await parseMtzArchive(file, file.name);
      setImportPreview(result);
    } catch (err) {
      console.error('Import error:', err);
      setErrorMsg(`Gagal membaca berkas: ${(err as Error).message}. Pastikan berkas berformat .mtz atau .zip valid.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Generate demo sample MTZ to test the import workflow immediately
  const handleTestWithSample = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Create a sample MTZ in memory from preset
      const sampleBlob = await generateMtzArchive(THEME_PRESETS.mecha_dark);
      const fakeFile = new File([sampleBlob], 'Mecha_Dark_Apex_Sample.mtz', { type: 'application/octet-stream' });
      const result = await parseMtzArchive(fakeFile, 'Mecha_Dark_Apex_Sample.mtz');
      setImportPreview(result);
    } catch (err) {
      setErrorMsg('Gagal membuat sampel tema: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = (targetView: 'visual' | 'xml' | 'modules') => {
    if (importPreview) {
      onThemeImported(importPreview, targetView);
      onClose();
      setImportPreview(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Impor & Periksa Tema HyperOS (.MTZ)
              </h3>
              <p className="text-xs text-neutral-400">
                Muat tema eksternal untuk dicek sintaks XML-nya, diedit tampilannya, atau dipaket ulang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 overflow-y-auto space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".mtz,.zip,application/zip"
            onChange={handleFileChange}
            className="hidden"
          />

          {!importPreview ? (
            <>
              {/* Dropzone Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                    : 'border-neutral-700 bg-neutral-950/70 hover:border-neutral-600 hover:bg-neutral-950'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
                  {isLoading ? (
                    <RefreshCw size={26} className="animate-spin text-cyan-400" />
                  ) : (
                    <FileArchive size={28} />
                  )}
                </div>

                <div className="text-sm font-semibold text-white">
                  {isLoading ? 'Sedang Membongkar Arsip Tema...' : 'Tarik & Letakkan Berkas .MTZ atau .ZIP di Sini'}
                </div>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Atau klik untuk memilih file dari komputer Anda (mendukung tema resmi Xiaomi HyperOS atau MIUI 14)
                </p>

                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white rounded-xl border border-neutral-700 transition-all pointer-events-none"
                >
                  Pilih Berkas .MTZ / .ZIP
                </button>
              </div>

              {/* Sample Test Fallback Button */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-amber-400 shrink-0" />
                  <div className="text-left text-xs">
                    <div className="font-semibold text-white">Belum punya file .mtz di laptop?</div>
                    <div className="text-[11px] text-neutral-400">
                      Uji fungsi impor dengan memuat bundel arsip tema Mecha Tactical buatan studio
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTestWithSample}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                >
                  Muat Contoh Tema
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-900/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          ) : (
            /* PREVIEW IMPORTED THEME DETAILS */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-2xl flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-300 text-sm">
                    Arsip Tema Berhasil Diekstrak!
                  </div>
                  <div className="text-xs text-neutral-300 mt-0.5">
                    Berkas: <span className="font-mono text-white">{importPreview.originalFilename}</span> ({importPreview.importedFilesCount} sub-berkas terdeteksi)
                  </div>
                </div>
              </div>

              {/* Extracted Theme Metadata Card */}
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2.5">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Data Metadata Tema
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500">Judul Tema:</span>
                    <div className="font-bold text-white text-sm">{importPreview.theme.meta.title}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500">Pembuat (Author):</span>
                    <div className="font-semibold text-neutral-200">{importPreview.theme.meta.author}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500">Desainer:</span>
                    <div className="font-semibold text-neutral-200">{importPreview.theme.meta.designer}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500">Versi:</span>
                    <div className="font-mono text-cyan-400">{importPreview.theme.meta.version}</div>
                  </div>
                </div>
              </div>

              {/* Extracted XML Files List */}
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Berkas XML yang Diambil ({importPreview.files.length})</span>
                  <span className="text-[11px] text-emerald-400 font-mono">Siap Diedit</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {importPreview.files.map((f) => (
                    <div
                      key={f.path}
                      className="p-2 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-neutral-300 flex items-center gap-1.5">
                        <FileCode size={13} className="text-cyan-400" />
                        <span>{f.path}</span>
                      </span>
                      <span className="text-[10px] text-neutral-500">{f.content.length} bytes</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Genuine Extracted PNG Icons Notice */}
              {Object.keys(importPreview.theme.icons.customIcons || {}).length > 0 && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400 shrink-0" />
                    <span className="text-neutral-200">
                      <strong className="text-white font-mono">{Object.keys(importPreview.theme.icons.customIcons).length}</strong> berkas gambar PNG ikon nyata berhasil diekstrak langsung dari sub-arsip modul <code className="text-cyan-300">icons</code>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 text-[10px] font-mono whitespace-nowrap">
                    Data Modul Asli
                  </span>
                </div>
              )}

              {/* Warnings if any */}
              {importPreview.warnings.length > 0 && (
                <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-xl text-xs text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertTriangle size={13} />
                    <span>Catatan Import:</span>
                  </div>
                  {importPreview.warnings.map((w, i) => (
                    <div key={i} className="text-[11px] opacity-90">· {w}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          {importPreview ? (
            <>
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="px-3.5 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Pilih Berkas Lain
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmImport('visual')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition-all border border-neutral-700"
                >
                  <Eye size={13} />
                  <span>Mockup HP</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmImport('modules')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 rounded-xl text-xs font-semibold transition-all border border-cyan-500/30 hover:border-cyan-400"
                  title="Periksa seluruh struktur berkas modul biner asli HyperOS hasil ekstraksi"
                >
                  <FolderArchive size={13} />
                  <span>Modul Asli</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmImport('xml')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-400/20"
                >
                  <FileCode size={13} strokeWidth={2.5} />
                  <span>Periksa & Edit XML</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
