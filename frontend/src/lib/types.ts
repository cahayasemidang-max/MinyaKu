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
  /**
   * FR-01:
   * Seluruh akun (Warga, Admin RT, dan Super Admin) telah terdaftar di database.
   * Masing-masing pengguna (Warga, Admin RT, Super Admin) membuat PIN sendiri
   * untuk akun yang telah terdaftar (bebas campuran karakter dan angka).
   */
  pin?: string;
  privacyShowNameInLeaderboard?: boolean;
  createdAt: string;
}

export interface CollectionPoint {
  rt: RTCode;
  pointName: string;
  address: string;
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
  proofFileName: string;
  proofUrl?: string;
}

export type HandoverFundStatus = "Belum Diterima" | "Sudah Diterima";

export interface AgencyHandover {
  id: string;
  handoverDate: string;
  agencyName: string;
  volumeLiters: number;
  fundStatus: HandoverFundStatus;
  fundReceivedRp: number;
  fundReceivedDate?: string;
  proofFileName: string;
  notes?: string;
  recordedBy: string;
}

export interface StockAdjustment {
  id: string;
  date: string;
  type: "Tumpahan / Susut" | "Koreksi Pengukuran";
  volumeDeltaLiters: number;
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
  referenceId?: string;
  proofFileName: string;
  recordedBy: string;
  correctionReason?: string;
}

export interface GroceryPurchaseItem {
  itemName: string;
  quantity: number;
  unit: string;
  unitPriceRp: number;
  totalPriceRp: number;
}

export interface GroceryPurchase {
  id: string;
  purchaseDate: string;
  supplierName: string;
  items: GroceryPurchaseItem[];
  totalTransactionRp: number;
  receivedConfirmed: boolean;
  proofFileName: string;
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
  recipientCount: number;
  recipientNote: string;
  compositionSnapshot: PackageCompositionItem[];
  proofFileName: string;
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
