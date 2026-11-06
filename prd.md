# Product Requirements Document (PRD)

## Jelantah Berkah --- Platform Sedekah Minyak Jelantah dan Program Sembako

**Status:** Draft untuk desain UI/UX dan perencanaan pengembangan\
**Versi:** 1.0\
**Bahasa antarmuka:** Bahasa Indonesia\
**Lingkup:** RW dengan 7 RT dan 1 Super Admin RW

------------------------------------------------------------------------

## 1. Ringkasan Produk

Jelantah Berkah adalah aplikasi web untuk mengelola pengumpulan minyak
jelantah sebagai sedekah warga, pencatatan volume minyak di tingkat RT,
penyerahan minyak kepada Dinas Kebersihan Kota Bekasi, pencatatan dana
yang diterima, pembelian sembako, dan distribusi paket sembako yang
seragam kepada satpam.

Aplikasi menyediakan pengalaman berbeda berdasarkan tiga jenis pengguna:

1.  **Warga** --- melihat informasi titik pengumpulan, riwayat setoran,
    dan kontribusi minyak jelantah.
2.  **Admin RT** --- relawan yang mencatat setoran dan volume aktual di
    titik pengumpulan RT masing-masing.
3.  **Super Admin RW** --- mengawasi seluruh RT dan mengelola penyerahan
    minyak, dana program, pembelian sembako, distribusi, pengguna, serta
    laporan.

Tujuan utama produk adalah mempermudah pencatatan operasional dan
meningkatkan transparansi pengelolaan program sosial di lingkungan RW.

## 2. Latar Belakang dan Masalah

Pengumpulan minyak jelantah dan pengelolaan hasilnya memerlukan
pencatatan yang konsisten dari beberapa RT. Tanpa sistem terpusat, data
volume pengumpulan, serah terima ke dinas, dana yang diterima, pembelian
sembako, dan distribusi bantuan berisiko tersebar atau sulit ditelusuri.

Aplikasi ini dirancang untuk: - Memusatkan data setoran minyak dari
tujuh RT. - Mencatat volume aktual yang diterima oleh relawan. -
Memisahkan volume minyak yang terkumpul dari volume yang telah
diserahkan. - Memisahkan dana yang diterima, pengeluaran sembako, dan
saldo dana tercatat. - Menyediakan riwayat transaksi dan bukti pendukung
untuk akuntabilitas. - Membatasi akses berdasarkan peran dan tanggung
jawab pengguna.

## 3. Tujuan Produk

### 3.1 Tujuan utama

-   Mempermudah warga mengetahui cara dan lokasi menyerahkan minyak
    jelantah.
-   Mempermudah relawan RT mencatat setoran secara cepat dan akurat.
-   Memungkinkan Super Admin memantau seluruh pengumpulan di tingkat RW.
-   Mencatat penyerahan minyak ke Dinas Kebersihan Kota Bekasi dan dana
    yang benar-benar diterima.
-   Mengelola pembelian sembako dan distribusi paket seragam kepada
    satpam.
-   Menyediakan laporan operasional dan keuangan yang dapat ditelusuri.

### 3.2 Indikator keberhasilan

-   Setiap setoran yang dicatat memiliki ID unik, waktu, volume aktual,
    RT, dan pencatat.
-   Admin RT hanya dapat mengakses data operasional RT yang ditugaskan.
-   Super Admin dapat membandingkan pengumpulan, serah terima,
    penerimaan dana, pembelian, dan distribusi.
-   Saldo dana serta stok minyak dihitung dari catatan transaksi yang
    relevan.
-   Setiap pembelian dan serah terima dapat dilengkapi bukti pendukung.
-   Warga dapat melihat kontribusi berdasarkan setoran yang
    terverifikasi.

## 4. Aturan Bisnis Wajib

Aturan berikut tidak boleh dilanggar oleh desain maupun implementasi:

1.  Aplikasi **hanya mengelola minyak jelantah**. Kertas, plastik,
    kardus, besi, dan kategori barang daur ulang lain berada di luar
    lingkup.
2.  Minyak jelantah dari warga merupakan **sedekah**. Warga tidak
    menerima uang, saldo, atau imbalan finansial dari setoran minyak.
3.  Setiap RT memiliki titik pengumpulan tetap.
4.  Warga membawa minyak sendiri ke titik pengumpulan RT. Warga dapat
    datang kapan saja; aplikasi tidak membutuhkan pemesanan jadwal atau
    permintaan penjemputan.
5.  Terdapat tujuh Admin RT, masing-masing bertanggung jawab pada RT
    yang ditugaskan.
6.  Admin RT hanya menangani pengumpulan: mencatat identitas warga,
    volume aktual, waktu, dan informasi terkait setoran.
7.  Satu Super Admin RW mengelola seluruh data lintas RT serta seluruh
    proses keuangan dan program sembako.
8.  Super Admin mencatat penyerahan minyak ke Dinas Kebersihan Kota
    Bekasi dan dana yang benar-benar diterima dari penyerahan tersebut.
9.  Dana yang diterima digunakan untuk membeli sembako yang kemudian
    dibagikan kepada satpam. Dana tidak dicatat sebagai uang tunai yang
    diberikan langsung kepada satpam.
10. Setiap satpam menerima satu paket sembako dengan komposisi yang
    sama.
11. Volume minyak terkumpul harus dibedakan dari volume minyak yang
    telah diserahkan ke dinas.
12. Dana diterima, total pengeluaran, dan saldo dana tercatat harus
    ditampilkan secara terpisah. Saldo bukan label "keuntungan".
13. Total kontribusi dan leaderboard warga hanya menggunakan setoran
    yang terverifikasi.
14. Data contoh dalam mockup harus diberi label sebagai data ilustratif.
    Jangan mengarang alamat, harga, nilai transaksi, atau statistik
    operasional nyata.
15. Hak akses harus diterapkan di backend, bukan hanya dengan
    menyembunyikan menu di antarmuka.

## 5. Pengguna dan Hak Akses

### 5.1 Warga

**Kebutuhan:** mengetahui lokasi pengumpulan, melihat riwayat, dan
memantau kontribusi.

Hak akses: - Melihat informasi titik pengumpulan RT yang terkait dengan
akun. - Melihat panduan penyerahan minyak. - Melihat riwayat setoran
sendiri. - Melihat total liter terverifikasi dan tren kontribusi
sendiri. - Melihat leaderboard kontribusi sesuai kebijakan privasi. -
Mengelola informasi profil yang diizinkan.

Tidak boleh: - Melihat data pribadi atau riwayat lengkap warga lain. -
Melihat data keuangan program internal. - Menerima tampilan saldo atau
pembayaran dari setoran minyak. - Mengubah volume setoran yang telah
dicatat Admin.

### 5.2 Admin RT

**Jumlah:** 7 akun, satu akun untuk masing-masing RT.

Kebutuhan: mencatat setoran dengan cepat dan memantau pengumpulan RT
sendiri.

Hak akses: - Melihat dashboard dan riwayat pengumpulan RT yang
ditugaskan. - Mencari atau memilih warga. - Mencatat volume aktual dalam
liter. - Menambahkan catatan atau foto bukti jika diperlukan. - Melihat
rekap pengumpulan RT.

Tidak boleh: - Mengakses data pengumpulan RT lain tanpa otorisasi. -
Mengelola dana, penerimaan uang dari dinas, pembelian sembako, atau
distribusi. - Mengubah catatan keuangan Super Admin.

### 5.3 Super Admin RW

**Jumlah:** 1 akun dengan akses tingkat RW.

Hak akses: - Melihat data pengumpulan seluruh tujuh RT. - Mengelola
catatan penyerahan minyak kepada dinas. - Mencatat dana yang diterima. -
Mengelola transaksi dana program. - Mencatat pembelian sembako dan bukti
transaksi. - Mengatur komposisi paket sembako standar. - Memantau
inventaris sembako dan ketersediaan paket lengkap. - Mencatat distribusi
paket kepada satpam. - Mengelola akun warga dan Admin RT. - Melihat dan
mengekspor laporan.

## 6. Ruang Lingkup Fitur

### 6.1 Termasuk dalam MVP

-   Autentikasi dan akses berbasis peran.
-   Dashboard warga.
-   Informasi titik pengumpulan.
-   Riwayat setoran warga.
-   Total kontribusi dan leaderboard berbasis liter terverifikasi.
-   Dashboard Admin RT.
-   Form pencatatan setoran minyak.
-   Riwayat dan rekap pengumpulan per RT.
-   Dashboard Super Admin RW.
-   Pengelolaan catatan pengumpulan lintas RT.
-   Pencatatan penyerahan minyak ke dinas.
-   Pencatatan dana masuk dan pengeluaran program.
-   Pencatatan pembelian sembako.
-   Definisi paket sembako standar.
-   Inventaris sembako dan jumlah paket lengkap yang dapat disiapkan.
-   Pencatatan distribusi paket.
-   Manajemen akun dan laporan dasar.

### 6.2 Di luar lingkup

-   Pengumpulan plastik, kertas, kardus, besi, atau barang lain.
-   Pembayaran atau imbalan uang kepada warga.
-   Penjemputan minyak dari rumah warga.
-   Pemesanan slot atau jadwal penyerahan.
-   Pembagian uang tunai kepada satpam.
-   Paket sembako dengan komposisi berbeda per penerima.
-   Marketplace atau penjualan langsung kepada warga.
-   Integrasi pembayaran otomatis, kecuali ditambahkan sebagai kebutuhan
    baru.
-   Integrasi peta atau geolokasi langsung sebelum alamat titik
    pengumpulan tersedia.

## 7. Struktur Navigasi

### 7.1 Warga

-   Beranda
-   Setor Minyak Jelantah
-   Riwayat Setoran
-   Kontribusi Saya
-   Leaderboard
-   Profil

"Setor Minyak Jelantah" merupakan halaman informasi titik pengumpulan
dan panduan penyerahan langsung, bukan formulir pemesanan jadwal.

### 7.2 Admin RT

-   Dashboard RT
-   Catat Setoran
-   Riwayat Pengumpulan
-   Rekap RT
-   Profil

### 7.3 Super Admin RW

-   Dashboard RW
-   Pengumpulan
-   Penyerahan ke Dinas
-   Dana Program
-   Pembelian Sembako
-   Distribusi Sembako
-   Data Warga & Admin
-   Laporan

## 8. Persyaratan Fungsional

### FR-01 --- Autentikasi dan otorisasi

-   Pengguna masuk menggunakan akun yang terdaftar.
-   Sistem menentukan role dan RT yang ditugaskan.
-   Menu, halaman, dan data yang dapat diakses menyesuaikan role.
-   Akses langsung ke endpoint yang tidak berwenang harus ditolak oleh
    backend.

### FR-02 --- Informasi titik pengumpulan

-   Warga dapat melihat titik pengumpulan RT yang terkait dengan
    akunnya.
-   Informasi mendukung nama titik, alamat, petunjuk, dan jam
    operasional jika ditetapkan.
-   Karena warga dapat datang kapan saja, tidak ada kalender booking
    atau antrean terjadwal.
-   Alamat sebenarnya harus diisi oleh pengelola; jangan membuat alamat
    fiktif.

### FR-03 --- Pencatatan setoran

Setiap catatan setoran sekurang-kurangnya memuat: - ID setoran unik. -
Warga penyetor. - RT pengumpulan. - Volume aktual dalam liter. - Tanggal
dan waktu. - Admin yang mencatat. - Status verifikasi. - Catatan
opsional. - Foto bukti opsional, bila fitur ini diaktifkan.

Alur: 1. Admin memilih warga. 2. Admin memasukkan volume aktual. 3.
Sistem mengisi waktu dan identitas admin secara otomatis, dengan koreksi
waktu dibatasi sesuai kebijakan. 4. Admin meninjau data. 5. Admin
menyimpan catatan. 6. Sistem memberikan konfirmasi dan menampilkan
catatan yang tersimpan.

Sistem perlu mencegah pengiriman formulir ganda yang tidak disengaja.
Catatan yang telah diverifikasi tidak boleh diubah tanpa jejak audit.

### FR-04 --- Riwayat dan verifikasi

-   Warga hanya melihat riwayat setoran miliknya.
-   Admin RT hanya melihat catatan RT yang ditugaskan.
-   Super Admin dapat melihat semua RT.
-   Daftar mendukung pencarian, filter tanggal, filter RT untuk Super
    Admin, dan filter status.
-   Status harus memiliki label teks, bukan hanya warna.

Status awal yang disarankan: - Baru dicatat - Terverifikasi - Perlu
diperiksa

Status dan siapa yang boleh mengubahnya perlu konsisten di seluruh
halaman.

### FR-05 --- Kontribusi dan leaderboard

-   Total kontribusi adalah penjumlahan volume setoran yang
    terverifikasi.
-   Setoran yang belum terverifikasi tidak dihitung sebagai kontribusi
    final.
-   Warga dapat melihat tren kontribusi per periode.
-   Leaderboard menggunakan total liter terverifikasi, dengan filter
    periode bila diperlukan.
-   Tampilkan hanya informasi warga yang diperbolehkan oleh kebijakan
    privasi.

### FR-06 --- Dashboard Admin RT

-   Menampilkan total volume terverifikasi untuk RT terkait.
-   Menampilkan jumlah catatan setoran hari ini.
-   Menampilkan setoran terbaru dan catatan yang perlu diperiksa.
-   Menyediakan aksi utama "Catat Setoran Baru".
-   Menyediakan rekap harian atau bulanan.
-   Tidak menampilkan fitur dana, pembelian, atau distribusi.

### FR-07 --- Dashboard Super Admin RW

-   Menampilkan total volume terverifikasi seluruh RT.
-   Menampilkan volume yang sudah diserahkan ke dinas.
-   Menampilkan sisa volume tercatat.
-   Menampilkan dana yang benar-benar diterima.
-   Menampilkan pengeluaran pembelian sembako.
-   Menampilkan saldo dana program tercatat.
-   Menampilkan jumlah paket yang disiapkan dan didistribusikan.
-   Menampilkan perbandingan pengumpulan antar-RT dan tren periode.
-   Menyediakan tautan ke catatan atau transaksi pendukung.

### FR-08 --- Penyerahan minyak ke dinas

Setiap transaksi penyerahan mencakup: - ID transaksi. - Tanggal
penyerahan. - Volume aktual yang diserahkan dalam liter. - Dana yang
benar-benar diterima, bila sudah diterima. - Status penerimaan dana. -
Bukti serah terima atau bukti transaksi. - Catatan.

Volume penyerahan tidak boleh melebihi volume minyak yang tersedia
menurut catatan stok. Jika pencatatan stok belum mendukung validasi
otomatis, sistem harus memberi peringatan dan meminta konfirmasi yang
berwenang.

Penyerahan minyak dan penerimaan dana perlu dapat dicatat secara
terpisah jika dana belum diterima pada saat minyak diserahkan.

### FR-09 --- Dana program

-   Catat setiap dana masuk yang benar-benar diterima.
-   Catat setiap pengeluaran program dengan tanggal, kategori, nominal,
    deskripsi, dan bukti bila tersedia.
-   Hitung saldo berdasarkan transaksi yang tercatat.
-   Jangan menyebut saldo sebagai keuntungan.
-   Tampilkan riwayat transaksi dan filter periode.
-   Koreksi transaksi harus memiliki alasan dan jejak audit.

Rumus dasar: **Saldo dana tercatat = total dana masuk yang tercatat −
total pengeluaran yang tercatat.**

Saldo ini bukan pengganti rekonsiliasi dengan rekening atau kas nyata.

### FR-10 --- Pembelian sembako

Setiap pembelian dapat berisi beberapa item dan mencatat: - ID
pembelian. - Tanggal pembelian. - Nama pemasok/toko jika diketahui. -
Nama barang. - Kuantitas dan satuan. - Harga satuan. - Total per item. -
Total transaksi. - Nota atau foto bukti. - Catatan.

Sistem harus memperbarui inventaris berdasarkan barang yang benar-benar
dicatat sebagai diterima. Pembelian yang belum dikonfirmasi tidak boleh
otomatis dianggap sebagai stok tersedia.

### FR-11 --- Paket sembako standar

-   Super Admin menetapkan satu komposisi paket standar.
-   Komposisi berlaku sama bagi setiap penerima.
-   Setiap item memiliki kuantitas per paket dan satuan.
-   Sistem menghitung jumlah paket lengkap maksimum berdasarkan
    inventaris yang tersedia.
-   Sistem menandai item yang tidak cukup untuk memenuhi satu paket
    tambahan.
-   Estimasi biaya per paket dihitung dari harga pembelian yang tercatat
    jika data cukup tersedia.
-   Perubahan komposisi paket harus memiliki riwayat dan tidak boleh
    mengubah catatan distribusi historis.

### FR-12 --- Distribusi sembako

Setiap distribusi mencatat: - ID distribusi. - Tanggal. - Lokasi. -
Jumlah paket. - Penerima atau daftar penerima sesuai kebijakan
pencatatan. - Bukti foto/dokumen bila tersedia. - Catatan.

Validasi: - Jumlah paket yang didistribusikan tidak boleh melebihi paket
lengkap yang tersedia. - Stok setiap item dikurangi sesuai komposisi
standar dan jumlah paket. - Sistem menampilkan total paket disiapkan,
didistribusikan, dan tersisa. - Data historis distribusi harus tetap
dapat ditelusuri.

### FR-13 --- Manajemen pengguna

-   Super Admin dapat mengelola akun warga dan tujuh Admin RT.
-   Setiap Admin RT memiliki penugasan RT yang jelas.
-   Perubahan penugasan atau status akun dicatat dalam audit log.
-   Warga dikaitkan dengan RT untuk menentukan titik pengumpulan
    default.

### FR-14 --- Laporan

Sediakan laporan terpisah untuk: - Pengumpulan per RT dan periode. -
Penyerahan minyak ke dinas. - Dana masuk dan pengeluaran program. -
Pembelian sembako. - Inventaris sembako. - Distribusi paket.

Laporan harus memiliki filter dan dapat diekspor bila fitur ekspor
diimplementasikan.

## 9. Persyaratan Data dan Perhitungan

### 9.1 Volume minyak

-   Semua volume disimpan dengan satuan liter.
-   Gunakan presisi desimal yang memadai untuk hasil pengukuran.
-   Jangan menjumlahkan volume yang sama berulang kali karena muncul di
    beberapa status atau laporan.
-   Tetapkan definisi yang konsisten untuk total volume terverifikasi,
    volume diserahkan, dan sisa volume tercatat.

Rumus operasional dasar: **Sisa volume tercatat = volume minyak masuk
yang diakui sebagai stok − volume yang tercatat keluar melalui
penyerahan atau penyesuaian yang sah.**

Implementasi harus menentukan bagaimana koreksi, tumpahan, selisih
pengukuran, dan penyesuaian stok dicatat. Jangan menganggap semua
perbedaan sebagai penjualan.

### 9.2 Dana program

-   Semua nilai uang menggunakan Rupiah (Rp).
-   Dana masuk hanya dihitung jika penerimaan benar-benar tercatat.
-   Pengeluaran harus merujuk pada transaksi pembelian atau pengeluaran
    program.
-   Hindari menghitung transaksi yang sama dua kali.
-   Dana yang belum diterima tidak boleh dihitung sebagai dana masuk.

### 9.3 Inventaris dan paket

-   Stok dikelola per item dan satuan.
-   Ketersediaan paket lengkap ditentukan oleh item yang paling
    membatasi jumlah paket.
-   Distribusi mengurangi stok sesuai kuantitas per paket.
-   Sistem perlu menangani pembatalan atau koreksi dengan jejak audit.

## 10. Persyaratan UI/UX

### 10.1 Identitas visual

-   Forest Green: `#244D38`
-   Natural Cream: `#F5F0E4`
-   Sage Green: `#DCE9D9`
-   White: `#FFFFFF`
-   Main text: `#24352B`
-   Secondary text: `#68766B`
-   Border: `#E3E8DF`

Gaya visual: - Natural, ramah, bersih, dan terpercaya. - Kartu membulat
sekitar 12--16 px. - Bayangan lembut dan batas tipis. - Tipografi Inter
atau Plus Jakarta Sans. - Ikon sederhana yang konsisten. - Status
ditampilkan dengan warna dan teks. - Gunakan grafik hanya bila mendukung
pemahaman.

### 10.2 Pola layout per role

**Warga:** mobile-first dengan navigasi bawah dan aksi utama yang mudah
ditemukan.\
**Admin RT:** mobile-friendly, input cepat, tombol besar, dan sedikit
pengetikan.\
**Super Admin:** desktop-first dengan sidebar, KPI, filter, tabel,
grafik, dan detail transaksi.

### 10.3 Kondisi antarmuka

Setiap halaman relevan harus memiliki: - Loading state. - Empty state. -
Error state. - Validasi formulir. - Konfirmasi tindakan penting. -
Feedback sukses atau gagal. - Tampilan data contoh yang jelas diberi
label jika digunakan untuk prototipe.

## 11. Persyaratan Nonfungsional

-   **Keamanan:** autentikasi, otorisasi berbasis peran, validasi
    server, dan pembatasan data per RT.
-   **Privasi:** warga tidak boleh melihat data pribadi warga lain yang
    tidak diperlukan.
-   **Auditabilitas:** simpan pelaku, waktu, dan alasan perubahan untuk
    catatan penting.
-   **Responsivitas:** halaman berfungsi pada ponsel, tablet, dan
    desktop.
-   **Aksesibilitas:** kontras memadai, label formulir jelas, dan
    kontrol dapat digunakan dengan sentuhan.
-   **Keandalan data:** hindari duplikasi transaksi dan pastikan
    perhitungan konsisten.
-   **Keterpakaian:** alur pencatatan setoran harus sederhana bagi
    relawan.
-   **Bahasa:** gunakan Bahasa Indonesia untuk label dan pesan
    antarmuka.

## 12. Kebutuhan Desain Google Stitch

Desain harus berupa aplikasi yang memiliki halaman-halaman terhubung,
bukan hanya landing page atau poster presentasi.

Urutan desain yang disarankan: 1. Bangun design system dan komponen
dasar. 2. Bangun navigasi untuk Warga, Admin RT, dan Super Admin. 3.
Rancang Dashboard Warga. 4. Rancang informasi titik pengumpulan,
riwayat, kontribusi, leaderboard, dan profil. 5. Rancang Dashboard Admin
RT dan form pencatatan setoran. 6. Rancang riwayat dan rekap RT. 7.
Rancang Dashboard Super Admin RW. 8. Rancang pengumpulan, penyerahan ke
dinas, dana program, pembelian, paket standar, dan distribusi sembako.
9. Rancang manajemen pengguna dan laporan. 10. Periksa konsistensi
visual, alur navigasi, responsivitas, dan kesesuaian dengan aturan
bisnis.

### Daftar halaman wajib

-   Resident Dashboard
-   Collection Point Information
-   Resident Donation History
-   Resident Contribution
-   Leaderboard
-   Resident Profile
-   RT Admin Dashboard
-   Record Donation Form
-   RT Collection History
-   RT Report
-   RW Super Admin Dashboard
-   Collection Management
-   Agency Handover Records
-   Program Finance
-   Grocery Purchase Management
-   Standard Grocery Package and Inventory
-   Grocery Distribution
-   Residents and Admin Management
-   Reports

## 13. Acceptance Criteria

Produk atau prototipe dianggap sesuai dengan PRD apabila:

-   [ ] Hanya minyak jelantah yang menjadi kategori pengumpulan.
-   [ ] Tidak ada pembayaran uang kepada warga atas minyak yang
    disedekahkan.
-   [ ] Warga diarahkan ke titik pengumpulan RT dan tidak diminta
    memesan jadwal.
-   [ ] Tujuh Admin RT dapat dibedakan penugasannya.
-   [ ] Admin RT hanya memiliki akses ke data RT masing-masing.
-   [ ] Admin dapat mencatat volume aktual dalam liter.
-   [ ] Super Admin dapat melihat data seluruh tujuh RT.
-   [ ] Volume terkumpul dan volume yang diserahkan ditampilkan
    terpisah.
-   [ ] Dana masuk, pengeluaran, dan saldo dana tercatat ditampilkan
    terpisah.
-   [ ] Pembelian sembako menyimpan detail item dan bukti transaksi.
-   [ ] Paket sembako memiliki satu komposisi standar.
-   [ ] Distribusi tidak melebihi stok paket lengkap yang tersedia.
-   [ ] Warga dapat melihat total kontribusi dari setoran terverifikasi.
-   [ ] Data contoh tidak disajikan sebagai statistik nyata.
-   [ ] Navigasi dan gaya visual konsisten di seluruh halaman.
-   [ ] Desain responsif dan sesuai kebutuhan tiap role.
-   [ ] Aksi penting dan perubahan data memiliki konfirmasi atau jejak
    audit yang sesuai.

## 14. Hal yang Masih Perlu Dikonfirmasi

Hal berikut tidak boleh diasumsikan sebagai fakta sebelum dikonfirmasi
oleh pengelola:

-   Nama final aplikasi dan logo.
-   Alamat pasti setiap titik pengumpulan RT.
-   Jam operasional atau aturan akses titik pengumpulan.
-   Siapa yang boleh mengubah status menjadi terverifikasi dan apakah
    diperlukan pemeriksaan kedua.
-   Kebijakan pencatatan nama penerima satpam atau cukup jumlah
    penerima.
-   Komposisi paket sembako standar.
-   Aturan untuk selisih volume, tumpahan, atau penyesuaian stok.
-   Format bukti serah terima dan bukti transaksi yang akan digunakan.
-   Apakah foto bukti wajib atau opsional.
-   Teknologi, hosting, autentikasi, dan mekanisme ekspor yang akan
    dipakai.

------------------------------------------------------------------------

**Prinsip produk:** setiap liter minyak, setiap dana yang diterima,
setiap pembelian, dan setiap paket yang dibagikan harus dapat ditelusuri
tanpa mencampur data operasional, keuangan, dan kontribusi warga.
