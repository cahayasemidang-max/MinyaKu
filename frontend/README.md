# Jelantah Berkah — Frontend (Next.js App Router)

Aplikasi web frontend untuk **Platform Sedekah Minyak Jelantah dan Program Sembako** tingkat RW (7 RT dan 1 Super Admin RW) sesuai spesifikasi **Product Requirements Document (PRD) v1.0**.

## Fitur Utama & Kepatuhan PRD

1. **Identitas Visual & Responsivitas Penuh (HP, Tablet, Laptop, PC):**
   - Palet warna: Forest Green (`#244D38`), Natural Cream (`#F5F0E4`), Sage Green (`#DCE9D9`), White (`#FFFFFF`), Main Text (`#24352B`), Secondary Text (`#68766B`), dan Border (`#E3E8DF`).
   - Di layar HP/Mobile otomatis menampilkan **Bottom Navigation Bar** + **Hamburger Drawer**; di layar Laptop/PC menampilkan **Sidebar Desktop** dan tabel/kartu fleksibel.
2. **Tiga Pengalaman Pengguna Berbasis Peran & Penugasan RT:**
   - **Warga (`/warga/*`):** Beranda, Info Titik Pengumpulan RT & Panduan Setor Langsung (tanpa booking jadwal), Riwayat Setoran Pribadi, Kontribusi Saya (hanya menghitung setoran `Terverifikasi`), Leaderboard (dengan opsi privasi nama), dan Profil. Sama sekali tidak menampilkan saldo uang.
   - **Admin RT (`/rt/*` — 7 Akun RT 01 s/d RT 07):** Dashboard RT, Form Catat Setoran Cepat (tombol cepat liter, foto bukti wajib, tinjau sebelum simpan, anti *double-submit*, langsung berstatus `Terverifikasi`), Riwayat Pengumpulan RT, Rekap RT, dan Pengaturan Titik Pengumpulan RT.
   - **Super Admin RW (`/rw/*` — 1 Akun Tingkat RW):** Dashboard RW, Pengelolaan Pengumpulan 7 RT & Penyesuaian Stok (Tumpahan/Selisih), Penyerahan ke Dinas Kebersihan Kota Bekasi, Dana Program (Dana Masuk, Pengeluaran, Saldo Dana Tercatat — bukan label keuntungan), Pembelian Sembako Multi-Item, Paket Sembako Standar & Inventaris (kalkulasi otomatis item pembatas), Distribusi Sembako Seragam kepada Satpam, Manajemen Pengguna & Audit Log, serta 6 Laporan Terpisah (dengan fitur Ekspor CSV).
3. **Dua Mode Data di Browser (`AppContext`):**
   - **Mode Data Ilustratif Berlabel:** Menampilkan contoh alur lengkap yang diberi label jelas `[Data Ilustratif]` sesuai Aturan Bisnis #14.
   - **Mode Data Kosong (Seed Murni):** Hanya berisi 1 Super Admin RW, 7 Admin RT, dan 7 Titik Pengumpulan RT tanpa alamat/transaksi fiktif.

## Cara Menjalankan di Lokal

Pastikan **Node.js (v18+)** sudah terpasang di komputer Anda, lalu jalankan perintah berikut di terminal:

```bash
cd frontend
npm install
npm run dev
```

Kemudian buka **`http://localhost:3000`** di browser (bisa dicoba dengan mode responsif HP, Tablet, maupun layar penuh Laptop/PC).

