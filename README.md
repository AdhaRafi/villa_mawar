# Villa Mawar: Sandi Terakhir 🌹

Game misteri detektif 2D pixel-art berbasis Canvas dan Matematika (fungsi dan inversi).

## 📁 Struktur Proyek

```text
├── index.html        # Halaman utama game & container modal
├── css/
│   └── style.css     # Styling tema pixel-art, layout canvas, dan dialog
├── js/
│   ├── assets.js     # Data gambar, sprite karakter, dan properti visual (Base64)
│   ├── data.js       # Koordinat peta hotspot ruangan dan papan bukti
│   └── game.js       # Engine game, state, puzzle matematika, dan sistem dialog
├── vercel.json       # Konfigurasi deployment & security headers Vercel
└── README.md
```

## 🚀 Menjalankan Secara Lokal

Cukup buka `index.html` langsung di browser atau gunakan local server:

```bash
# Menggunakan npx serve
npx serve .

# Atau menggunakan Python
python -m http.server 3000
```

Buka `http://localhost:3000` pada browser Anda.

## 🌐 Deploy ke Vercel

1. Push repository ini ke GitHub.
2. Buka [Vercel](https://vercel.com/) dan buat project baru (**Add New Project**).
3. Import repository GitHub ini.
4. Pada bagian **Framework Preset**, pilih **Other**.
5. Klik **Deploy**.
