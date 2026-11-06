import {
  AgencyHandover,
  AuditLogEntry,
  CollectionPoint,
  FinanceTransaction,
  GroceryDistribution,
  GroceryPurchase,
  OilDeposit,
  PackageCompositionHistory,
  PackageCompositionItem,
  RTCode,
  StockAdjustment,
  UserAccount,
} from "./types";

export const RT_LIST: RTCode[] = [
  "RT 01",
  "RT 02",
  "RT 03",
  "RT 04",
  "RT 05",
  "RT 06",
  "RT 07",
];

// Seed akun dasar (1 Super Admin RW, 7 Admin RT, dan contoh akun Warga)
export const BASE_USERS: UserAccount[] = [
  {
    id: "USR-RW-01",
    username: "superadmin_rw",
    name: "Pengurus RW (Super Admin)",
    role: "SUPER_ADMIN_RW",
    phone: "-",
    active: true,
    createdAt: "2026-01-01T08:00:00Z",
  },
  ...RT_LIST.map((rt, idx) => ({
    id: `USR-RT-0${idx + 1}`,
    username: `admin_rt0${idx + 1}`,
    name: `Relawan Admin ${rt}`,
    role: "ADMIN_RT" as const,
    rt,
    phone: "-",
    active: true,
    createdAt: "2026-01-01T08:00:00Z",
  })),
  {
    id: "USR-W-01",
    username: "warga_rt01_a",
    name: "Warga Contoh A (Ilustratif)",
    role: "WARGA",
    rt: "RT 01",
    phone: "-",
    active: true,
    privacyShowNameInLeaderboard: true,
    createdAt: "2026-01-02T09:00:00Z",
  },
  {
    id: "USR-W-02",
    username: "warga_rt01_b",
    name: "Warga Contoh B (Ilustratif)",
    role: "WARGA",
    rt: "RT 01",
    phone: "-",
    active: true,
    privacyShowNameInLeaderboard: false,
    createdAt: "2026-01-02T09:30:00Z",
  },
  {
    id: "USR-W-03",
    username: "warga_rt02_a",
    name: "Warga Contoh C (Ilustratif)",
    role: "WARGA",
    rt: "RT 02",
    phone: "-",
    active: true,
    privacyShowNameInLeaderboard: true,
    createdAt: "2026-01-03T10:00:00Z",
  },
  {
    id: "USR-W-04",
    username: "warga_rt03_a",
    name: "Warga Contoh D (Ilustratif)",
    role: "WARGA",
    rt: "RT 03",
    phone: "-",
    active: true,
    privacyShowNameInLeaderboard: true,
    createdAt: "2026-01-04T10:00:00Z",
  },
];

// Titik pengumpulan default tanpa mengarang alamat palsu (Aturan Bisnis #14 & FR-02)
export const BASE_COLLECTION_POINTS: CollectionPoint[] = RT_LIST.map((rt) => ({
  rt,
  pointName: `Titik Pengumpulan Tetap ${rt}`,
  address: "", // Belum ditetapkan oleh pengelola (jangan mengarang alamat fiktif)
  instructions:
    "Saring minyak jelantah dari sisa makanan, masukkan ke jeriken/botol tertutup rapat, dan serahkan langsung ke relawan Admin RT untuk ditakar.",
  operatingHours: "Fleksibel (Datang langsung tanpa jadwal booking)",
  coordinatorName: `Relawan Admin ${rt}`,
  updatedAt: "2026-01-01T08:00:00Z",
}));

// Data Ilustratif (Hanya ditampilkan saat mode Simulasi Ilustratif aktif, diberi label jelas)
export const ILLUSTRATIVE_COLLECTION_POINTS: CollectionPoint[] = RT_LIST.map(
  (rt) => ({
    rt,
    pointName: `Pos Pengumpulan ${rt} [DATA ILUSTRATIF]`,
    address: `[Contoh Ilustratif - Alamat ${rt} belum diisi pengelola]`,
    instructions:
      "Pastikan minyak jelantah sudah dingin dan disaring. Bawa langsung ke titik pengumpulan RT kapan saja tanpa perlu booking jadwal.",
    operatingHours: "Setiap hari (Penyerahan langsung tanpa booking)",
    coordinatorName: `Relawan Admin ${rt}`,
    updatedAt: "2026-02-01T08:00:00Z",
  })
);

export const ILLUSTRATIVE_DEPOSITS: OilDeposit[] = [
  {
    id: "SET-2026-001",
    residentId: "USR-W-01",
    residentName: "Warga Contoh A (Ilustratif)",
    rt: "RT 01",
    volumeLiters: 2.5,
    recordedAt: "2026-10-15T09:15:00Z",
    recordedById: "USR-RT-01",
    recordedByName: "Relawan Admin RT 01",
    status: "Terverifikasi",
    notes: "[Data Ilustratif] Jeriken bersih, sudah disaring",
    proofFileName: "bukti_setoran_001_ilustratif.jpg",
  },
  {
    id: "SET-2026-002",
    residentId: "USR-W-02",
    residentName: "Warga Contoh B (Ilustratif)",
    rt: "RT 01",
    volumeLiters: 1.8,
    recordedAt: "2026-10-20T16:10:00Z",
    recordedById: "USR-RT-01",
    recordedByName: "Relawan Admin RT 01",
    status: "Terverifikasi",
    notes: "[Data Ilustratif] 2 botol kemasan",
    proofFileName: "bukti_setoran_002_ilustratif.jpg",
  },
  {
    id: "SET-2026-003",
    residentId: "USR-W-01",
    residentName: "Warga Contoh A (Ilustratif)",
    rt: "RT 01",
    volumeLiters: 3.2,
    recordedAt: "2026-11-02T08:40:00Z",
    recordedById: "USR-RT-01",
    recordedByName: "Relawan Admin RT 01",
    status: "Terverifikasi",
    notes: "[Data Ilustratif] Setoran rutin bulanan",
    proofFileName: "bukti_setoran_003_ilustratif.jpg",
  },
  {
    id: "SET-2026-004",
    residentId: "USR-W-02",
    residentName: "Warga Contoh B (Ilustratif)",
    rt: "RT 01",
    volumeLiters: 1.2,
    recordedAt: "2026-11-05T14:20:00Z",
    recordedById: "USR-RT-01",
    recordedByName: "Relawan Admin RT 01",
    status: "Perlu diperiksa",
    notes: "[Data Ilustratif] Ada endapan di dasar botol, perlu takar ulang",
    proofFileName: "bukti_setoran_004_ilustratif.jpg",
  },
  {
    id: "SET-2026-005",
    residentId: "USR-W-03",
    residentName: "Warga Contoh C (Ilustratif)",
    rt: "RT 02",
    volumeLiters: 4.5,
    recordedAt: "2026-10-25T10:00:00Z",
    recordedById: "USR-RT-02",
    recordedByName: "Relawan Admin RT 02",
    status: "Terverifikasi",
    notes: "[Data Ilustratif] Setoran terverifikasi RT 02",
    proofFileName: "bukti_setoran_005_ilustratif.jpg",
  },
  {
    id: "SET-2026-006",
    residentId: "USR-W-04",
    residentName: "Warga Contoh D (Ilustratif)",
    rt: "RT 03",
    volumeLiters: 5.0,
    recordedAt: "2026-10-28T11:30:00Z",
    recordedById: "USR-RT-03",
    recordedByName: "Relawan Admin RT 03",
    status: "Terverifikasi",
    notes: "[Data Ilustratif] Setoran terverifikasi RT 03",
    proofFileName: "bukti_setoran_006_ilustratif.jpg",
  },
];

export const ILLUSTRATIVE_HANDOVERS: AgencyHandover[] = [
  {
    id: "SRH-2026-001",
    handoverDate: "2026-10-30",
    agencyName: "Dinas Kebersihan Kota Bekasi",
    volumeLiters: 12.0,
    fundStatus: "Sudah Diterima",
    fundReceivedRp: 72000,
    fundReceivedDate: "2026-10-31",
    proofFileName: "berita_acara_dinas_001_ilustratif.jpg",
    notes: "[Data Ilustratif] Contoh serah terima tahap 1 ke Dinas Kebersihan",
    recordedBy: "Pengurus RW (Super Admin)",
  },
];

export const ILLUSTRATIVE_STOCK_ADJUSTMENTS: StockAdjustment[] = [];

export const ILLUSTRATIVE_FINANCE: FinanceTransaction[] = [
  {
    id: "FIN-2026-001",
    date: "2026-10-31",
    type: "DANA_MASUK",
    category: "Penerimaan Dinas Kebersihan",
    amountRp: 72000,
    description:
      "[Data Ilustratif] Penerimaan dana dari penyerahan 12.0 L ke Dinas Kebersihan Kota Bekasi",
    referenceId: "SRH-2026-001",
    proofFileName: "bukti_transfer_dinas_001_ilustratif.jpg",
    recordedBy: "Pengurus RW (Super Admin)",
  },
  {
    id: "FIN-2026-002",
    date: "2026-11-01",
    type: "PENGELUARAN",
    category: "Pembelian Sembako",
    amountRp: 54000,
    description: "[Data Ilustratif] Pembelian bahan paket sembako standar",
    referenceId: "PBL-2026-001",
    proofFileName: "nota_sembako_001_ilustratif.jpg",
    recordedBy: "Pengurus RW (Super Admin)",
  },
];

export const ILLUSTRATIVE_PURCHASES: GroceryPurchase[] = [
  {
    id: "PBL-2026-001",
    purchaseDate: "2026-11-01",
    supplierName: "Toko Grosir Contoh [Data Ilustratif]",
    items: [
      {
        itemName: "Beras Medium (Contoh Ilustratif)",
        quantity: 6,
        unit: "kg",
        unitPriceRp: 6000,
        totalPriceRp: 36000,
      },
      {
        itemName: "Gula Pasir (Contoh Ilustratif)",
        quantity: 2,
        unit: "kg",
        unitPriceRp: 9000,
        totalPriceRp: 18000,
      },
    ],
    totalTransactionRp: 54000,
    receivedConfirmed: true,
    proofFileName: "nota_sembako_001_ilustratif.jpg",
    notes: "[Data Ilustratif] Barang sudah diterima lengkap di pos RW",
    recordedBy: "Pengurus RW (Super Admin)",
  },
];

export const ILLUSTRATIVE_PACKAGE_COMPOSITION: PackageCompositionItem[] = [
  {
    itemName: "Beras Medium (Contoh Ilustratif)",
    quantityPerPackage: 3,
    unit: "kg",
  },
  {
    itemName: "Gula Pasir (Contoh Ilustratif)",
    quantityPerPackage: 1,
    unit: "kg",
  },
];

export const ILLUSTRATIVE_COMPOSITION_HISTORY: PackageCompositionHistory[] = [
  {
    id: "KOMP-001",
    updatedAt: "2026-10-01T08:00:00Z",
    updatedBy: "Pengurus RW (Super Admin)",
    note: "[Data Ilustratif] Penetapan komposisi paket seragam contoh",
    items: ILLUSTRATIVE_PACKAGE_COMPOSITION,
  },
];

export const ILLUSTRATIVE_DISTRIBUTIONS: GroceryDistribution[] = [
  {
    id: "DST-2026-001",
    distributionDate: "2026-11-03",
    location: "Pos Keamanan RW [Data Ilustratif]",
    packageCount: 1,
    recipientCount: 1,
    recipientNote: "[Data Ilustratif] 1 petugas satpam jaga pagi (1 paket seragam)",
    compositionSnapshot: ILLUSTRATIVE_PACKAGE_COMPOSITION,
    proofFileName: "bukti_distribusi_satpam_001_ilustratif.jpg",
    notes: "[Data Ilustratif] Penyerahan paket sembako seragam",
    recordedBy: "Pengurus RW (Super Admin)",
  },
];

export const ILLUSTRATIVE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "AUD-001",
    timestamp: "2026-10-15T09:15:00Z",
    actorId: "USR-RT-01",
    actorName: "Relawan Admin RT 01",
    actorRole: "ADMIN_RT",
    action: "Mencatat setoran minyak jelantah (Langsung Terverifikasi)",
    targetId: "SET-2026-001",
    reason: "Pencatatan aktual di titik pengumpulan RT 01 (2.5 L)",
  },
  {
    id: "AUD-002",
    timestamp: "2026-10-30T14:00:00Z",
    actorId: "USR-RW-01",
    actorName: "Pengurus RW (Super Admin)",
    actorRole: "SUPER_ADMIN_RW",
    action: "Mencatat penyerahan minyak ke Dinas Kebersihan Kota Bekasi",
    targetId: "SRH-2026-001",
    reason: "Serah terima 12.0 L dengan berita acara",
  },
];

