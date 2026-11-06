export type UserRole = "WARGA" | "ADMIN_RT" | "SUPER_ADMIN_RW";

export type RTCode =
  | "RT 01"
  | "RT 02"
  | "RT 03"
  | "RT 04"
  | "RT 05"
  | "RT 06"
  | "RT 07";

export type DepositStatus =
  | "Baru dicatat"
  | "Terverifikasi"
  | "Perlu diperiksa";

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  rt?: RTCode; // Required for WARGA and ADMIN_RT
  phone?: string;
  active: boolean;
  privacyShowNameInLeaderboard?: boolean;
  createdAt: string;
}

export interface CollectionPoint {
  rt: RTCode;
  pointName: string;
  address: string; // Kosong secara default jika belum diisi pengelola (jangan mengarang alamat nyata)
  instructions: string;
  operatingHours: string;
  coordinatorName: string;
  updatedAt: string;
}

export interface OilDeposit {
  id: string;
  residentId: string;
  residentName: string;
  rt: RTCode;
  volumeLiters: number;
  recordedAt: string; // ISO string
  recordedById: string;
  recordedByName: string;
  status: DepositStatus;
  notes?: string;
  proofFileName: string; // Wajib foto bukti sesuai keputusan
  proofUrl?: string;
}

export type HandoverFundStatus = "Belum Diterima" | "Sudah Diterima";

export interface AgencyHandover {
  id: string;
  handoverDate: string;
  agencyName: string; // Default: Dinas Kebersihan Kota Bekasi
  volumeLiters: number;
  fundStatus: HandoverFundStatus;
  fundReceivedRp: number; // 0 jika belum diterima
  fundReceivedDate?: string;
  proofFileName: string; // Wajib bukti serah terima / transaksi
  notes?: string;
  recordedBy: string;
}

export interface StockAdjustment {
  id: string;
  date: string;
  type: "Tumpahan / Susut" | "Koreksi Pengukuran";
  volumeDeltaLiters: number; // negatif jika mengurangi stok
  reason: string;
  recordedBy: string;
}

export type FinanceEntryType = "DANA_MASUK" | "PENGELUARAN";

export interface FinanceTransaction {
  id: string;
  date: string;
  type: FinanceEntryType;
  category:
    | "Penerimaan Dinas Kebersihan"
    | "Pembelian Sembako"
    | "Operasional Penunjang"
    | "Koreksi Tercatat";
  amountRp: number;
  description: string;
  referenceId?: string; // ID serah terima atau ID pembelian sembako
  proofFileName: string;
  recordedBy: string;
  correctionReason?: string;
}

export interface GroceryPurchaseItem {
  itemName: string;
  quantity: number;
  unit: string; // kg, liter, kantong, kaleng, bungkus
  unitPriceRp: number;
  totalPriceRp: number;
}

export interface GroceryPurchase {
  id: string;
  purchaseDate: string;
  supplierName: string;
  items: GroceryPurchaseItem[];
  totalTransactionRp: number;
  receivedConfirmed: boolean; // Hanya masuk stok jika dikonfirmasi diterima
  proofFileName: string; // Wajib foto nota
  notes?: string;
  recordedBy: string;
}

export interface PackageCompositionItem {
  itemName: string;
  quantityPerPackage: number;
  unit: string;
}

export interface PackageCompositionHistory {
  id: string;
  updatedAt: string;
  updatedBy: string;
  note: string;
  items: PackageCompositionItem[];
}

export interface GroceryInventoryAdjustment {
  id: string;
  date: string;
  itemName: string;
  unit: string;
  deltaQuantity: number;
  reason: string;
  recordedBy: string;
}

export interface GroceryDistribution {
  id: string;
  distributionDate: string;
  location: string;
  packageCount: number;
  recipientCount: number; // Jumlah satpam penerima (masing-masing 1 paket seragam)
  recipientNote: string; // Catatan penerima / pos satpam
  compositionSnapshot: PackageCompositionItem[]; // Snapshot agar perubahan komposisi masa depan tidak mengubah historis
  proofFileName: string; // Wajib foto bukti distribusi
  notes?: string;
  recordedBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetId: string;
  reason: string;
}

