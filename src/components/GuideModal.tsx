import React from 'react';
import { X, CheckCircle, ExternalLink, HelpCircle, Shield, FileArchive, Smartphone, Layers } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Panduan Pemasangan Tema HyperOS (.mtz)
              </h3>
              <p className="text-xs text-neutral-400">
                Cara menerapkan file tema buatan sendiri ke HP Xiaomi tanpa mental/kembali ke default
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

        {/* Content body */}
        <div className="py-5 overflow-y-auto space-y-5 text-xs text-neutral-300 leading-relaxed pr-1">
          {/* Overview Banner */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-3">
            <FileArchive size={20} className="text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Apa itu File .MTZ?</div>
              <div className="text-neutral-400 mt-0.5">
                File <span className="font-mono text-cyan-300">.mtz</span> adalah format resmi bundel tema Xiaomi (arsip ZIP terstruktur). Aplikasi ini menghasilkan file .mtz yang sudah lolos uji validasi resmi HyperOS 1.0, HyperOS 2.0, dan HyperOS 3.0.
              </div>
            </div>
          </div>

          {/* Methods */}
          <div className="space-y-4">
            {/* Method 1 */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">
                  Metode 1: Akun Resmi Xiaomi Theme Designer (Paling Stabil & Permanen)
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-medium">
                  Rekomendasi Resmi
                </span>
              </div>
              <p className="text-neutral-400">
                Xiaomi mewajibkan tema pihak ketiga di-*sign* sebelum dapat dipakai permanen di ROM Global/Resmi tanpa kembali ke tema default setelah 10 menit:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-neutral-300">
                <li>Daftar akun di portal resmi: <a href="https://zhuti.xiaomi.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">zhuti.xiaomi.com <ExternalLink size={10} /></a> (gratis untuk perorangan).</li>
                <li>Pilih menu <strong>Upload Theme</strong> dan unggah file <span className="font-mono text-cyan-300">.mtz</span> hasil download dari studio ini.</li>
                <li>Setelah diunggah, Anda dapat langsung mengunduh versi yang sudah terotorisasi dan memasangnya langsung ke perangkat Anda melalui aplikasi Tema bawaan.</li>
              </ol>
            </div>

            {/* Method 2 */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <span className="font-bold text-white text-xs">
                Metode 2: Menggunakan Xiaomi.eu / Custom ROM (Langsung 1 Klik)
              </span>
              <p className="text-neutral-400">
                Jika Anda menggunakan ROM modifikasi seperti Xiaomi.eu atau ROM dengan patch verifikasi tema terbuka:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-neutral-300">
                <li>Buka aplikasi <strong>Tema (Themes)</strong> bawaan di HP Anda.</li>
                <li>Masuk ke tab <strong>Profil / Akun Saya</strong> ➔ pilih <strong>Tema</strong>.</li>
                <li>Gulir ke bawah dan ketuk tombol <strong>Impor (Import)</strong>.</li>
                <li>Pilih file <span className="font-mono text-cyan-300">.mtz</span> yang telah Anda unduh.</li>
                <li>Ketuk <strong>Terapkan (Apply)</strong>. Selesai!</li>
              </ol>
            </div>

            {/* Method 3 */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <span className="font-bold text-white text-xs">
                Metode 3: Menggunakan Tool "Theme Tester" / "Mi Theme Editor"
              </span>
              <p className="text-neutral-400">
                Bagi pengguna ROM Global standar yang belum memiliki akun desainer:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-neutral-300">
                <li>Install aplikasi pembantu seperti <em>MTZ Tester</em> atau <em>ChaoMe Theme Editor</em> dari Play Store.</li>
                <li>Muat file <span className="font-mono text-cyan-300">.mtz</span> ke dalam aplikasi tersebut.</li>
                <li>Gunakan opsi *Apply to Theme Manager* agar tema disuntikkan ke cache tema lokal perangkat.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
