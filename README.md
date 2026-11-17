# Jelantah Berkah (MinyaKu) — Platform Sedekah Minyak Jelantah & Program Sembako RW

Aplikasi web *full-stack* (**Next.js App Router** + **FastAPI** + **Supabase PostgreSQL**) untuk pengelolaan sedekah minyak jelantah warga tingkat RW (terdiri dari **7 RT** dan **1 Super Admin RW**) yang disalurkan melalui Dinas Kebersihan Kota Bekasi menjadi paket sembako seragam bagi petugas keamanan (satpam) lingkungan.

---

## 🌐 Tautan Aplikasi (Live Deployment)

Aplikasi sudah dapat diakses langsung secara *online* melalui:
- **URL Web Utama:** [https://minya-ku.vercel.app/](https://minya-ku.vercel.app/)
- **Halaman Login:** [https://minya-ku.vercel.app/login](https://minya-ku.vercel.app/login)

---

## 🔑 Akun Uji Coba Login (Testing Credentials)

Gunakan akun berikut untuk mencoba alur autentikasi dan fitur pada masing-masing peran (*role*) di [https://minya-ku.vercel.app/login](https://minya-ku.vercel.app/login):

| Peran (Role) | Username / Nomor Rumah | Password Awal | PIN (6 Digit) | Hak Akses & Cara Login |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin RW** | `SUPERADMIN_RW` | `RW-Berkah1` | `123456` | Dapat login menggunakan **Password** (`RW-Berkah1`) atau **PIN** (`123456`). Mengakses seluruh manajemen tingkat RW (`/rw/*`). |
| **Admin RT (RT 01)** | `ADMIN_RT01` | `Hendra` | `123456` | Saat login pertama kali (`is_first_login = true`), masukkan Password `Hendra` lalu buat PIN 6 digit (`123456`). Untuk login berikutnya, langsung gunakan PIN `123456`. Mengakses fitur RT (`/rt/*`). |
| **Warga** | `B713` | `Budi` | `081387` | Saat login pertama kali (`is_first_login = true`), masukkan Password `Budi` (Nama Depan KK) lalu buat PIN 6 digit (`081387`). Untuk login berikutnya, langsung gunakan PIN `081387`. Mengakses fitur Warga (`/warga/*`). |

### Ringkasan Detail Kredensial
- **Super Admin RW**
  - `username`: `SUPERADMIN_RW`
  - `Password`: `RW-Berkah1`
  - `pin`: `123456`

- **Admin RT 01**
  - `username`: `ADMIN_RT01`
  - `Password`: `Hendra`
  - `pin`: `123456`

- **Warga**
  - `username`: `B713`
  - `Password`: `Budi`
  - `pin`: `081387`

> **Catatan Alur Autentikasi Web:**
> - **Layar Smartphone / Mobile (`< md`):** Menyediakan **Numpad 6 Digit ala Bank Jago** (auto-submit saat 6 bulatan PIN terisi penuh).
> - **Layar Laptop / Desktop (`>= md`):** Menggunakan formulir input standar dengan tombol tampilkan/sembunyikan PIN.
> - **Pengingat Perangkat (*Bound Account*):** Setelah berhasil login, perangkat akan mengingat Nomor Rumah/Username terakhir sehingga kunjungan berikutnya cukup memasukkan 6 digit PIN (sampai pengguna menekan tombol **Keluar / Logout**).

---

## 📁 Struktur Proyek Terkini

```text
MinyaKu/
├── backend/                  # Backend REST API (FastAPI + Supabase + JWT Auth)
│   ├── core/                 # Konfigurasi environment, koneksi Supabase, & JWT security
│   ├── routers/              # Endpoint API (/api/auth/* dan /api/users/*)
│   ├── schemas/              # Validasi request & response Pydantic
│   ├── services/             # Logika bisnis & query ke tabel Supabase
│   ├── main.py               # Entry point aplikasi FastAPI
│   └── requirements.txt      # Daftar dependensi Python
├── frontend/                 # Frontend Web (Next.js 14 App Router, TypeScript, Tailwind CSS)
│   ├── src/app/              # Halaman berbasis role (/login, /warga/*, /rt/*, /rw/*)
│   ├── src/components/       # Komponen UI, AppShell Full-Screen, & Grafik SVG Line/Bar Chart
│   ├── src/context/          # State aplikasi, sesi autentikasi JWT, & sinkronisasi API
│   └── src/lib/              # Definisi tipe data & seed data ilustratif/kosong
├── prd.md                    # Product Requirements Document (Spesifikasi & Skema Database)
└── README.md                 # Dokumentasi utama proyek
```

---

## ✨ Fitur Utama Berdasarkan Peran

1. **Warga (`/warga/*`)**
   - **Beranda & Grafik Tren Kontribusi Pribadi:** Menampilkan total liter minyak jelantah terverifikasi dan grafik tren (Harian, Mingguan, Bulanan).
   - **Setor Minyak Jelantah (`/warga/setor`):** Informasi lokasi titik pengumpulan RT terkait dan panduan setor langsung tanpa perlu booking jadwal.
   - **Riwayat Setoran & Kontribusi (`/warga/riwayat`, `/warga/kontribusi`):** Daftar catatan setoran beserta status verifikasi dan foto bukti.
   - **Leaderboard Warga (`/warga/leaderboard`):** Peringkat kontribusi liter warga (dilengkapi pengaturan privasi nama).
   - **Transparansi Dana Program (`/warga/dana`):** Ringkasan dana masuk, rincian per kategori pengeluaran, dan saldo dana tercatat (*read-only*).
   - **Profil & Ganti PIN (`/warga/profil`):** Pengaturan privasi nama pada leaderboard dan penggantian PIN 6 digit pribadi.

2. **Admin RT / Relawan Pencatat (`/rt/*` — 7 RT)**
   - **Dashboard Operasional RT (`/rt`):** Ringkasan capaian liter RT terkait dan grafik tren pengumpulan RT.
   - **Catat Setoran Cepat (`/rt/catat`):** Pemilihan warga RT, tombol cepat takaran liter, unggah foto bukti wajib, tinjau sebelum simpan, dan pencegahan *double-submit*.
   - **Riwayat & Rekap RT (`/rt/riwayat`, `/rt/rekap`):** Daftar pengumpulan tingkat RT dan rekap kontribusi per warga di RT tersebut.
   - **Transparansi Dana Program (`/rt/dana`):** Ringkasan keuangan program RW (*read-only*).
   - **Profil Relawan & Titik RT (`/rt/profil`):** Pengaturan alamat titik pengumpulan RT dan penggantian PIN Admin RT.

3. **Super Admin RW (`/rw/*` — 1 Akun Tingkat RW)**
   - **Dashboard RW (`/rw`):** Neraca volume minyak jelantah 7 RT, neraca keuangan program, kesiapan paket sembako standar, Line Chart tren pengumpulan RW, dan Bar Chart perbandingan 7 RT.
   - **Pengumpulan 7 RT & Penyesuaian Stok (`/rw/pengumpulan`):** Pemantauan seluruh setoran 7 RT, koreksi status dengan alasan audit, serta pencatatan penyusutan/tumpahan.
   - **Penyerahan ke Dinas (`/rw/penyerahan`):** Pencatatan serah terima volume minyak ke Dinas Kebersihan Kota Bekasi dan konfirmasi dana masuk.
   - **Dana Program (`/rw/dana`):** Pengelolaan dana masuk, pengeluaran per kategori, dan saldo tercatat secara transparan.
   - **Pembelian Sembako & Inventaris Paket (`/rw/pembelian`, `/rw/paket-inventaris`):** Pencatatan belanja multi-item, pengaturan komposisi paket standar seragam, dan kalkulasi otomatis item pembatas (*limiting item*).
   - **Distribusi Sembako Satpam (`/rw/distribusi`):** Pencatatan penyaluran paket sembako seragam kepada satpam penerima manfaat.
   - **Manajemen Pengguna & Laporan (`/rw/pengguna`, `/rw/laporan`):** Pengelolaan akun Warga/Admin RT, reset PIN, log audit, dan ekspor 6 laporan CSV terpisah.

---

## 💻 Cara Menjalankan Proyek di Lokal (Development)

### 1. Jalankan Backend API (FastAPI + Supabase)
Pastikan **Python 3.10+** sudah terpasang dan file `.env` di dalam folder `backend/` telah berisi `SUPABASE_URL`, `SUPABASE_KEY`, dan `JWT_SECRET_KEY`.

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- Server Backend berjalan di: `http://localhost:8000`
- Dokumentasi Swagger UI: `http://localhost:8000/docs`

### 2. Jalankan Frontend Web (Next.js)
Buka terminal baru, pastikan **Node.js (v18+)** sudah terpasang, lalu jalankan:

```bash
cd frontend
npm install
npm run dev
```
- Aplikasi Web lokal dapat diakses di: `http://localhost:3000`
