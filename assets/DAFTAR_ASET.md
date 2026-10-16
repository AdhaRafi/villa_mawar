# Aset Game — Villa Mawar: Sandi Terakhir

Layar 384x216 px. Garis lantai y=176, tapak kaki karakter y=196. Sprite karakter 64x64 per frame (lihat atlas.json di tiap folder).
Skala di engine: kelipatan bulat (x3 = 1152x648, x5 = 1920x1080), filter "nearest".

## latar/  (6 ruangan + versi subuh)
aula, ruang_musik, ruang_kerja, dapur_makan, lorong_kamar, gudang, ruang_musik_subuh (Bab 6)
rooms.json = koordinat hotspot & pintu keluar tiap ruangan [x, y, lebar, tinggi]
Graf ruangan: aula <-> {ruang_musik, ruang_kerja, dapur_makan, lorong_kamar}; dapur_makan <-> gudang

## karakter/
raka, sari, dimas, naya, bima, arga : spritesheet.png, _left.png, _x4.png, atlas.json, preview.gif, frames/
  animasi: idle, walk, run, jump, land, crouch, hurt, talk (+ notes untuk raka)
siluet_pelaku/ : jas hujan berkerudung (kilas balik), ada animasi attack
jasad_arga/    : jasad 2D (dengan/tanpa darah, versi kiri)

## potret/
potret_<tokoh>_<netral|bicara|terkejut|terpejam>.png (128x128, berbingkai) dan *_transparan.png

## properti/
Bukti & benda: jam musik (normal / retak 21.45), pembuka surat (bersih / berdarah), kartu sandi 1 & 2 (+_x3),
brankas (tutup/buka), map Audit MJC, jas hujan TAMU (bersih/berdarah), pantofel (bersih/lumpur merah), sandal rumah,
jejak pantofel, arang kertas MJC, kotak perkakas (+pembuka surat), interkom (mati/menyala), kunci induk, lup (kursor),
nampan teh + kartu, surat Arga, kaca pecah di atas darah, buku catatan, jam tangan, ikon asap.

## ui/
kotak_dialog, lanjut_dialog, buku_catatan_halaman, slot_bukti_(kosong|terisi|terpilih), papan_bukti (+layout.json: 11 slot bukti, 5 kesimpulan),
tombol_(normal|hover|ditekan), ikon_(kiri|kanan|atas|periksa|bicara|pintu)

## efek/
hujan_0..3 (overlay loop 4 frame), kilat (flash putih transparan)

contoh_adegan_ruang_musik.png = contoh tata letak (latar + jam retak + jasad + Raka + Sari).

## menu/  (judul, tombol, layar menu; semua teks Indonesia)
layar/       latar_menu_utama (+_kilat), logo_villa_mawar
tombol/      MULAI, LANJUTKAN, PENGATURAN, KELUAR, BUKU CATATAN, MENU UTAMA, LANJUT, KEMBALI, YA, BELUM, PILIH BAB, ULANGI, MULAI BARU, kosong
             tiap tombol punya 4 status: normal, hover, ditekan, nonaktif (124x20; YA/BELUM 70x20); tombol_mulai_besar (160x30)
panel/       panel_jeda, panel_pengaturan, panel_konfirmasi, kartu_bab_1..6 (+_terkunci)
ikon/        mawar (segar/pudar/layu), gembok, peringatan, kotak centang, slider
judul_bab/   judul_bab_1..6 (kartu hitam saat bab dimulai)
akhir/       akhir_1 Sandi Terakhir, akhir_2 Bukti yang Tipis, akhir_3 Mawar yang Salah
contoh/      menu_utama_contoh (+gif hujan & kilat), jeda, pengaturan, pilih_bab, konfirmasi_tuduh
Font: piksel 5x7 buatan sendiri (huruf kapital, angka, . , : - ! ? /). Kalau perlu font untuk teks dialog panjang, pakai font piksel gratis di engine.
