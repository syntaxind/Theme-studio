# HyperOS Theme Studio & MTZ Builder

Editor tema Xiaomi HyperOS: simulator perangkat, validator XML, dan pembuat `.mtz`.
Semua proses berjalan di browser; tidak ada server atau API key.

## Jalankan lokal
```
npm install
npm run dev
```

## Pasang sebagai aplikasi (PWA)
Setelah di-deploy ke GitHub Pages, buka link-nya di Chrome HP, lalu pilih
menu ⋮ → "Instal aplikasi" / "Tambahkan ke layar utama".

## Deploy
Push ke branch `main`; GitHub Actions membangun dan mempublikasikan ke GitHub Pages.
Aktifkan sekali: Settings → Pages → Source: **GitHub Actions**.
