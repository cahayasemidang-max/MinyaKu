"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AgencyHandover,
  AuditLogEntry,
  CollectionPoint,
  DepositStatus,
  FinanceTransaction,
  GroceryDistribution,
  GroceryPurchase,
  OilDeposit,
  PackageCompositionHistory,
  PackageCompositionItem,
  RTCode,
  StockAdjustment,
  UserAccount,
} from "@/lib/types";
import {
  BASE_COLLECTION_POINTS,
  BASE_USERS,
  ILLUSTRATIVE_AUDIT_LOGS,
  ILLUSTRATIVE_COLLECTION_POINTS,
  ILLUSTRATIVE_COMPOSITION_HISTORY,
  ILLUSTRATIVE_DEPOSITS,
  ILLUSTRATIVE_DISTRIBUTIONS,
  ILLUSTRATIVE_FINANCE,
  ILLUSTRATIVE_HANDOVERS,
  ILLUSTRATIVE_PACKAGE_COMPOSITION,
  ILLUSTRATIVE_PURCHASES,
  ILLUSTRATIVE_STOCK_ADJUSTMENTS,
} from "@/lib/mockData";

export interface InventoryItemSummary {
  itemName: string;
  unit: string;
  totalPurchasedConfirmed: number;
  totalDistributed: number;
  availableStock: number;
  avgUnitPriceRp: number;
  requiredPerPackage: number;
  maxPackagesFromThisItem: number | null;
  isLimiting: boolean;
}

interface AppContextValue {
  currentUser: UserAccount;
  setCurrentUserById: (userId: string) => void;
  isIllustrativeMode: boolean;
  toggleDataMode: (useIllustrative: boolean) => void;
  resetData: () => void;

  users: UserAccount[];
  collectionPoints: CollectionPoint[];
  deposits: OilDeposit[];
  handovers: AgencyHandover[];
  stockAdjustments: StockAdjustment[];
  financeTransactions: FinanceTransaction[];
  purchases: GroceryPurchase[];
  packageComposition: PackageCompositionItem[];
  compositionHistory: PackageCompositionHistory[];
  distributions: GroceryDistribution[];
  auditLogs: AuditLogEntry[];

  metrics: {
    totalVerifiedVolumeAllRT: number;
    totalHandedOverVolume: number;
    totalStockAdjustmentLiters: number;
    remainingRecordedVolume: number;
    totalFundsReceivedRp: number;
    totalProgramExpensesRp: number;
    recordedFundBalanceRp: number;
    inventorySummary: InventoryItemSummary[];
    maxCompletePackagesAvailable: number;
    totalPackagesDistributed: number;
    estimatedCostPerPackageRp: number;
  };

  // FR-01: Autentikasi & Pengelolaan PIN (Warga, Admin RT, dan Super Admin membuat & mengganti PIN sendiri)
  authenticateWithPin: (
    userId: string,
    pinInput: string
  ) => { ok: boolean; message: string; user?: UserAccount };

  createSelfPin: (
    userId: string,
    newPin: string
  ) => { ok: boolean; message: string; user?: UserAccount };

  changeOwnPin: (
    currentPin: string,
    newPin: string
  ) => { ok: boolean; message: string };

  recordDeposit: (input: {
    residentId: string;
    volumeLiters: number;
    notes?: string;
    proofFileName: string;
    status?: DepositStatus;
  }) => { ok: boolean; message: string; record?: OilDeposit };

  updateDepositStatus: (
    depositId: string,
    newStatus: DepositStatus,
    reason: string
  ) => { ok: boolean; message: string };

  updateCollectionPoint: (
    rt: RTCode,
    payload: Omit<CollectionPoint, "rt" | "updatedAt">
  ) => { ok: boolean; message: string };

  recordAgencyHandover: (input: {
    handoverDate: string;
    volumeLiters: number;
    fundStatus: "Belum Diterima" | "Sudah Diterima";
    fundReceivedRp: number;
    proofFileName: string;
    notes?: string;
    forceOverrideStockWarning?: boolean;
  }) => { ok: boolean; message: string };

  confirmHandoverFundReceived: (
    handoverId: string,
    amountRp: number,
    receivedDate: string,
    proofFileName: string
  ) => { ok: boolean; message: string };

  recordStockAdjustment: (input: {
    date: string;
    type: "Tumpahan / Susut" | "Koreksi Pengukuran";
    volumeDeltaLiters: number;
    reason: string;
  }) => { ok: boolean; message: string };

  recordManualFinanceTransaction: (input: {
    date: string;
    type: "DANA_MASUK" | "PENGELUARAN";
    category:
      | "Penerimaan Dinas Kebersihan"
      | "Pembelian Sembako"
      | "Operasional Penunjang"
      | "Koreksi Tercatat";
    amountRp: number;
    description: string;
    proofFileName: string;
    correctionReason?: string;
  }) => { ok: boolean; message: string };

  recordGroceryPurchase: (input: {
    purchaseDate: string;
    supplierName: string;
    items: {
      itemName: string;
      quantity: number;
      unit: string;
      unitPriceRp: number;
    }[];
    receivedConfirmed: boolean;
    proofFileName: string;
    notes?: string;
  }) => { ok: boolean; message: string };

  confirmGroceryPurchaseReceived: (
    purchaseId: string
  ) => { ok: boolean; message: string };

  updateStandardPackageComposition: (
    items: PackageCompositionItem[],
    note: string
  ) => { ok: boolean; message: string };

  recordGroceryDistribution: (input: {
    distributionDate: string;
    location: string;
    packageCount: number;
    recipientNote: string;
    proofFileName: string;
    notes?: string;
  }) => { ok: boolean; message: string };

  upsertUserAccount: (
    input: Omit<UserAccount, "id" | "createdAt"> & { id?: string },
    reason: string
  ) => { ok: boolean; message: string };

  updateResidentProfile: (input: {
    name: string;
    phone: string;
    privacyShowNameInLeaderboard: boolean;
  }) => { ok: boolean; message: string };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const STORAGE_KEY = "jelantah_berkah_state_v3";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isIllustrativeMode, setIsIllustrativeMode] = useState<boolean>(true);
  const [users, setUsers] = useState<UserAccount[]>(BASE_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>("USR-W-01");
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>(
    ILLUSTRATIVE_COLLECTION_POINTS
  );
  const [deposits, setDeposits] = useState<OilDeposit[]>(ILLUSTRATIVE_DEPOSITS);
  const [handovers, setHandovers] = useState<AgencyHandover[]>(
    ILLUSTRATIVE_HANDOVERS
  );
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(
    ILLUSTRATIVE_STOCK_ADJUSTMENTS
  );
  const [financeTransactions, setFinanceTransactions] =
    useState<FinanceTransaction[]>(ILLUSTRATIVE_FINANCE);
  const [purchases, setPurchases] = useState<GroceryPurchase[]>(
    ILLUSTRATIVE_PURCHASES
  );
  const [packageComposition, setPackageComposition] = useState<
    PackageCompositionItem[]
  >(ILLUSTRATIVE_PACKAGE_COMPOSITION);
  const [compositionHistory, setCompositionHistory] = useState<
    PackageCompositionHistory[]
  >(ILLUSTRATIVE_COMPOSITION_HISTORY);
  const [distributions, setDistributions] = useState<GroceryDistribution[]>(
    ILLUSTRATIVE_DISTRIBUTIONS
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(
    ILLUSTRATIVE_AUDIT_LOGS
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setIsIllustrativeMode(parsed.isIllustrativeMode ?? true);
        setUsers(parsed.users ?? BASE_USERS);
        setCurrentUserId(parsed.currentUserId ?? "USR-W-01");
        setCollectionPoints(
          parsed.collectionPoints ?? ILLUSTRATIVE_COLLECTION_POINTS
        );
        setDeposits(parsed.deposits ?? ILLUSTRATIVE_DEPOSITS);
        setHandovers(parsed.handovers ?? ILLUSTRATIVE_HANDOVERS);
        setStockAdjustments(parsed.stockAdjustments ?? []);
        setFinanceTransactions(
          parsed.financeTransactions ?? ILLUSTRATIVE_FINANCE
        );
        setPurchases(parsed.purchases ?? ILLUSTRATIVE_PURCHASES);
        setPackageComposition(
          parsed.packageComposition ?? ILLUSTRATIVE_PACKAGE_COMPOSITION
        );
        setCompositionHistory(
          parsed.compositionHistory ?? ILLUSTRATIVE_COMPOSITION_HISTORY
        );
        setDistributions(parsed.distributions ?? ILLUSTRATIVE_DISTRIBUTIONS);
        setAuditLogs(parsed.auditLogs ?? ILLUSTRATIVE_AUDIT_LOGS);
      }
    } catch {
      // ignore localStorage read errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isIllustrativeMode,
          users,
          currentUserId,
          collectionPoints,
          deposits,
          handovers,
          stockAdjustments,
          financeTransactions,
          purchases,
          packageComposition,
          compositionHistory,
          distributions,
          auditLogs,
        })
      );
    } catch {
      // ignore localStorage write errors
    }
  }, [
    hydrated,
    isIllustrativeMode,
    users,
    currentUserId,
    collectionPoints,
    deposits,
    handovers,
    stockAdjustments,
    financeTransactions,
    purchases,
    packageComposition,
    compositionHistory,
    distributions,
    auditLogs,
  ]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const appendAudit = (
    action: string,
    targetId: string,
    reason: string,
    actorOverride?: UserAccount
  ) => {
    const actor = actorOverride || currentUser;
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      targetId,
      reason,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const toggleDataMode = (useIllustrative: boolean) => {
    setIsIllustrativeMode(useIllustrative);
    if (useIllustrative) {
      setUsers(BASE_USERS);
      setCollectionPoints(ILLUSTRATIVE_COLLECTION_POINTS);
      setDeposits(ILLUSTRATIVE_DEPOSITS);
      setHandovers(ILLUSTRATIVE_HANDOVERS);
      setStockAdjustments(ILLUSTRATIVE_STOCK_ADJUSTMENTS);
      setFinanceTransactions(ILLUSTRATIVE_FINANCE);
      setPurchases(ILLUSTRATIVE_PURCHASES);
      setPackageComposition(ILLUSTRATIVE_PACKAGE_COMPOSITION);
      setCompositionHistory(ILLUSTRATIVE_COMPOSITION_HISTORY);
      setDistributions(ILLUSTRATIVE_DISTRIBUTIONS);
      setAuditLogs(ILLUSTRATIVE_AUDIT_LOGS);
    } else {
      const cleanUsers = BASE_USERS.filter((u) => u.role !== "WARGA");
      setUsers(cleanUsers);
      if (currentUser.role === "WARGA") {
        setCurrentUserId("USR-RW-01");
      }
      setCollectionPoints(BASE_COLLECTION_POINTS);
      setDeposits([]);
      setHandovers([]);
      setStockAdjustments([]);
      setFinanceTransactions([]);
      setPurchases([]);
      setPackageComposition([]);
      setCompositionHistory([]);
      setDistributions([]);
      setAuditLogs([]);
    }
  };

  const resetData = () => {
    toggleDataMode(isIllustrativeMode);
  };

  const metrics = useMemo(() => {
    const totalVerifiedVolumeAllRT = Number(
      deposits
        .filter((d) => d.status === "Terverifikasi")
        .reduce((acc, d) => acc + d.volumeLiters, 0)
        .toFixed(2)
    );

    const totalHandedOverVolume = Number(
      handovers.reduce((acc, h) => acc + h.volumeLiters, 0).toFixed(2)
    );

    const totalStockAdjustmentLiters = Number(
      stockAdjustments
        .reduce((acc, s) => acc + s.volumeDeltaLiters, 0)
        .toFixed(2)
    );

    const remainingRecordedVolume = Number(
      (
        totalVerifiedVolumeAllRT -
        totalHandedOverVolume +
        totalStockAdjustmentLiters
      ).toFixed(2)
    );

    const totalFundsReceivedRp = financeTransactions
      .filter((t) => t.type === "DANA_MASUK")
      .reduce((acc, t) => acc + t.amountRp, 0);

    const totalProgramExpensesRp = financeTransactions
      .filter((t) => t.type === "PENGELUARAN")
      .reduce((acc, t) => acc + t.amountRp, 0);

    const recordedFundBalanceRp =
      totalFundsReceivedRp - totalProgramExpensesRp;

    const itemMap = new Map<
      string,
      {
        itemName: string;
        unit: string;
        purchasedQty: number;
        totalSpentRp: number;
        distributedQty: number;
      }
    >();

    packageComposition.forEach((comp) => {
      const key = `${comp.itemName.toLowerCase()}__${comp.unit.toLowerCase()}`;
      if (!itemMap.has(key)) {
        itemMap.set(key, {
          itemName: comp.itemName,
          unit: comp.unit,
          purchasedQty: 0,
          totalSpentRp: 0,
          distributedQty: 0,
        });
      }
    });

    purchases
      .filter((p) => p.receivedConfirmed)
      .forEach((p) => {
        p.items.forEach((it) => {
          const key = `${it.itemName.toLowerCase()}__${it.unit.toLowerCase()}`;
          const existing = itemMap.get(key) || {
            itemName: it.itemName,
            unit: it.unit,
            purchasedQty: 0,
            totalSpentRp: 0,
            distributedQty: 0,
          };
          existing.purchasedQty += it.quantity;
          existing.totalSpentRp += it.totalPriceRp;
          itemMap.set(key, existing);
        });
      });

    distributions.forEach((dist) => {
      dist.compositionSnapshot.forEach((comp) => {
        const key = `${comp.itemName.toLowerCase()}__${comp.unit.toLowerCase()}`;
        const existing = itemMap.get(key) || {
          itemName: comp.itemName,
          unit: comp.unit,
          purchasedQty: 0,
          totalSpentRp: 0,
          distributedQty: 0,
        };
        existing.distributedQty += comp.quantityPerPackage * dist.packageCount;
        itemMap.set(key, existing);
      });
    });

    const rawInventory: InventoryItemSummary[] = Array.from(
      itemMap.values()
    ).map((entry) => {
      const compItem = packageComposition.find(
        (c) =>
          c.itemName.toLowerCase() === entry.itemName.toLowerCase() &&
          c.unit.toLowerCase() === entry.unit.toLowerCase()
      );
      const availableStock = Math.max(
        0,
        Number((entry.purchasedQty - entry.distributedQty).toFixed(2))
      );
      const requiredPerPackage = compItem ? compItem.quantityPerPackage : 0;
      const maxPackagesFromThisItem =
        requiredPerPackage > 0
          ? Math.floor(availableStock / requiredPerPackage)
          : null;
      const avgUnitPriceRp =
        entry.purchasedQty > 0
          ? Math.round(entry.totalSpentRp / entry.purchasedQty)
          : 0;

      return {
        itemName: entry.itemName,
        unit: entry.unit,
        totalPurchasedConfirmed: entry.purchasedQty,
        totalDistributed: entry.distributedQty,
        availableStock,
        avgUnitPriceRp,
        requiredPerPackage,
        maxPackagesFromThisItem,
        isLimiting: false,
      };
    });

    const compositionItemsSummary = rawInventory.filter(
      (i) => i.requiredPerPackage > 0
    );

    const maxCompletePackagesAvailable =
      packageComposition.length === 0 || compositionItemsSummary.length === 0
        ? 0
        : Math.min(
            ...compositionItemsSummary.map(
              (i) => i.maxPackagesFromThisItem ?? 0
            )
          );

    const inventorySummary = rawInventory.map((item) => ({
      ...item,
      isLimiting:
        item.requiredPerPackage > 0 &&
        item.maxPackagesFromThisItem === maxCompletePackagesAvailable,
    }));

    const estimatedCostPerPackageRp = packageComposition.reduce((acc, comp) => {
      const summary = inventorySummary.find(
        (i) =>
          i.itemName.toLowerCase() === comp.itemName.toLowerCase() &&
          i.unit.toLowerCase() === comp.unit.toLowerCase()
      );
      return acc + (summary ? summary.avgUnitPriceRp * comp.quantityPerPackage : 0);
    }, 0);

    const totalPackagesDistributed = distributions.reduce(
      (acc, d) => acc + d.packageCount,
      0
    );

    return {
      totalVerifiedVolumeAllRT,
      totalHandedOverVolume,
      totalStockAdjustmentLiters,
      remainingRecordedVolume,
      totalFundsReceivedRp,
      totalProgramExpensesRp,
      recordedFundBalanceRp,
      inventorySummary,
      maxCompletePackagesAvailable,
      totalPackagesDistributed,
      estimatedCostPerPackageRp,
    };
  }, [
    deposits,
    handovers,
    stockAdjustments,
    financeTransactions,
    purchases,
    packageComposition,
    distributions,
  ]);

  const setCurrentUserById = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
    }
  };

  // FR-01: Validasi login menggunakan PIN masing-masing akun
  const authenticateWithPin: AppContextValue["authenticateWithPin"] = (
    userId,
    pinInput
  ) => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { ok: false, message: "Akun tidak ditemukan di database." };
    }
    if (!target.active) {
      return {
        ok: false,
        message: "Akun ini sedang dinonaktifkan oleh Super Admin RW.",
      };
    }
    if (!target.pin) {
      return {
        ok: false,
        message:
          "Akun ini belum memiliki PIN. Silakan buat PIN pribadi terlebih dahulu.",
      };
    }
    if (target.pin !== pinInput) {
      return {
        ok: false,
        message:
          "PIN yang Anda masukkan tidak sesuai dengan akun yang dipilih.",
      };
    }
    setCurrentUserId(target.id);
    return {
      ok: true,
      message: `Selamat datang, ${target.name}.`,
      user: target,
    };
  };

  // FR-01: Warga, Admin RT, dan Super Admin membuat PIN sendiri pada akun yang telah terdaftar
  const createSelfPin: AppContextValue["createSelfPin"] = (userId, newPin) => {
    const trimmed = newPin.trim();
    if (!trimmed) {
      return {
        ok: false,
        message: "PIN tidak boleh kosong (bebas menggunakan karakter & angka).",
      };
    }
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { ok: false, message: "Akun tidak ditemukan." };
    }

    const updatedUser: UserAccount = {
      ...target,
      pin: trimmed,
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? updatedUser : u))
    );
    setCurrentUserId(target.id);
    appendAudit(
      "Membuat PIN mandiri pada akun terdaftar",
      target.id,
      `${target.name} (${target.role}) menetapkan PIN pribadi`,
      updatedUser
    );
    return {
      ok: true,
      message: "PIN pribadi berhasil dibuat. Anda kini masuk ke aplikasi.",
      user: updatedUser,
    };
  };

  // FR-01: Semua role memiliki fitur untuk mengganti PIN
  const changeOwnPin: AppContextValue["changeOwnPin"] = (
    currentPin,
    newPin
  ) => {
    if (currentUser.pin && currentUser.pin !== currentPin) {
      return {
        ok: false,
        message: "PIN saat ini yang Anda masukkan tidak sesuai.",
      };
    }
    const trimmed = newPin.trim();
    if (!trimmed) {
      return {
        ok: false,
        message:
          "PIN baru tidak boleh kosong (bebas campuran karakter & angka).",
      };
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, pin: trimmed } : u
      )
    );
    appendAudit(
      "Mengganti PIN akun pribadi",
      currentUser.id,
      `${currentUser.name} (${currentUser.role}) memperbarui PIN keamanan`
    );
    return {
      ok: true,
      message: "PIN pribadi Anda berhasil diperbarui.",
    };
  };

  const recordDeposit: AppContextValue["recordDeposit"] = (input) => {
    if (
      currentUser.role !== "ADMIN_RT" &&
      currentUser.role !== "SUPER_ADMIN_RW"
    ) {
      return {
        ok: false,
        message:
          "Akses ditolak: Hanya Admin RT atau Super Admin yang berwenang mencatat setoran.",
      };
    }

    const resident = users.find(
      (u) => u.id === input.residentId && u.role === "WARGA"
    );
    if (!resident || !resident.rt) {
      return { ok: false, message: "Warga penyetor tidak ditemukan." };
    }

    if (
      currentUser.role === "ADMIN_RT" &&
      currentUser.rt !== resident.rt
    ) {
      return {
        ok: false,
        message: `Akses ditolak: Anda ditugaskan di ${currentUser.rt} dan tidak dapat mencatat untuk warga ${resident.rt}.`,
      };
    }

    if (input.volumeLiters <= 0 || Number.isNaN(input.volumeLiters)) {
      return {
        ok: false,
        message: "Volume aktual harus lebih dari 0 liter.",
      };
    }

    if (!input.proofFileName.trim()) {
      return {
        ok: false,
        message: "Foto bukti setoran wajib dilampirkan.",
      };
    }

    const newDeposit: OilDeposit = {
      id: `SET-2026-${String(deposits.length + 1).padStart(3, "0")}`,
      residentId: resident.id,
      residentName: resident.name,
      rt: resident.rt,
      volumeLiters: Number(input.volumeLiters.toFixed(2)),
      recordedAt: new Date().toISOString(),
      recordedById: currentUser.id,
      recordedByName: currentUser.name,
      status: input.status ?? "Terverifikasi",
      notes: input.notes?.trim() || undefined,
      proofFileName: input.proofFileName.trim(),
    };

    setDeposits((prev) => [newDeposit, ...prev]);
    appendAudit(
      `Mencatat setoran minyak (${newDeposit.status})`,
      newDeposit.id,
      `Setoran ${newDeposit.volumeLiters} L dari ${resident.name} (${resident.rt})`
    );

    return {
      ok: true,
      message: `Setoran ${newDeposit.id} (${newDeposit.volumeLiters} L) berhasil disimpan dengan status ${newDeposit.status}.`,
      record: newDeposit,
    };
  };

  const updateDepositStatus: AppContextValue["updateDepositStatus"] = (
    depositId,
    newStatus,
    reason
  ) => {
    if (
      currentUser.role !== "ADMIN_RT" &&
      currentUser.role !== "SUPER_ADMIN_RW"
    ) {
      return { ok: false, message: "Akses ditolak." };
    }
    if (!reason.trim()) {
      return {
        ok: false,
        message: "Alasan perubahan status wajib diisi untuk jejak audit.",
      };
    }
    const target = deposits.find((d) => d.id === depositId);
    if (!target) {
      return { ok: false, message: "Catatan setoran tidak ditemukan." };
    }
    if (
      currentUser.role === "ADMIN_RT" &&
      currentUser.rt !== target.rt
    ) {
      return {
        ok: false,
        message: "Akses ditolak: Anda hanya dapat mengelola data RT Anda.",
      };
    }

    setDeposits((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: newStatus } : d))
    );
    appendAudit(
      `Mengubah status setoran dari '${target.status}' menjadi '${newStatus}'`,
      depositId,
      reason.trim()
    );
    return {
      ok: true,
      message: `Status setoran ${depositId} berhasil diperbarui menjadi ${newStatus}.`,
    };
  };

  const updateCollectionPoint: AppContextValue["updateCollectionPoint"] = (
    rt,
    payload
  ) => {
    if (
      currentUser.role === "WARGA" ||
      (currentUser.role === "ADMIN_RT" && currentUser.rt !== rt)
    ) {
      return {
        ok: false,
        message:
          "Anda tidak berwenang mengubah informasi titik pengumpulan ini.",
      };
    }
    setCollectionPoints((prev) =>
      prev.map((cp) =>
        cp.rt === rt
          ? { ...cp, ...payload, updatedAt: new Date().toISOString() }
          : cp
      )
    );
    appendAudit(
      `Memperbarui informasi titik pengumpulan ${rt}`,
      rt,
      `Alamat & panduan titik pengumpulan ${rt} diperbarui`
    );
    return {
      ok: true,
      message: `Informasi titik pengumpulan ${rt} berhasil disimpan.`,
    };
  };

  const recordAgencyHandover: AppContextValue["recordAgencyHandover"] = (
    input
  ) => {
    if (currentUser.role !== "SUPER_ADMIN_RW") {
      return {
        ok: false,
        message:
          "Hanya Super Admin RW yang dapat mencatat penyerahan ke dinas.",
      };
    }
    if (input.volumeLiters <= 0) {
      return {
        ok: false,
        message: "Volume penyerahan harus lebih dari 0 liter.",
      };
    }
    if (!input.proofFileName.trim()) {
      return {
        ok: false,
        message: "Foto berita acara / bukti serah terima wajib diunggah.",
      };
    }
    if (
      input.volumeLiters > metrics.remainingRecordedVolume &&
      !input.forceOverrideStockWarning
    ) {
      return {
        ok: false,
        message: `Volume penyerahan (${input.volumeLiters} L) melebihi sisa stok tercatat (${metrics.remainingRecordedVolume} L).`,
      };
    }
    if (input.fundStatus === "Sudah Diterima" && input.fundReceivedRp <= 0) {
      return {
        ok: false,
        message:
          "Masukkan nominal dana yang benar-benar diterima jika status dana 'Sudah Diterima'.",
      };
    }

    const newHandover: AgencyHandover = {
      id: `SRH-2026-${String(handovers.length + 1).padStart(3, "0")}`,
      handoverDate: input.handoverDate,
      agencyName: "Dinas Kebersihan Kota Bekasi",
      volumeLiters: Number(input.volumeLiters.toFixed(2)),
      fundStatus: input.fundStatus,
      fundReceivedRp:
        input.fundStatus === "Sudah Diterima" ? input.fundReceivedRp : 0,
      fundReceivedDate:
        input.fundStatus === "Sudah Diterima" ? input.handoverDate : undefined,
      proofFileName: input.proofFileName.trim(),
      notes: input.notes?.trim() || undefined,
      recordedBy: currentUser.name,
    };

    setHandovers((prev) => [newHandover, ...prev]);

    if (input.fundStatus === "Sudah Diterima" && input.fundReceivedRp > 0) {
      const finEntry: FinanceTransaction = {
        id: `FIN-2026-${String(financeTransactions.length + 1).padStart(
          3,
          "0"
        )}`,
        date: input.handoverDate,
        type: "DANA_MASUK",
        category: "Penerimaan Dinas Kebersihan",
        amountRp: input.fundReceivedRp,
        description: `Penerimaan dana dari penyerahan ${newHandover.volumeLiters} L ke Dinas Kebersihan Kota Bekasi`,
        referenceId: newHandover.id,
        proofFileName: input.proofFileName.trim(),
        recordedBy: currentUser.name,
      };
      setFinanceTransactions((prev) => [finEntry, ...prev]);
    }

    appendAudit(
      "Mencatat penyerahan minyak ke Dinas Kebersihan Kota Bekasi",
      newHandover.id,
      `Volume ${newHandover.volumeLiters} L, status dana: ${newHandover.fundStatus}`
    );

    return {
      ok: true,
      message: `Catatan penyerahan ${newHandover.id} berhasil disimpan.`,
    };
  };

  const confirmHandoverFundReceived: AppContextValue["confirmHandoverFundReceived"] =
    (handoverId, amountRp, receivedDate, proofFileName) => {
      if (currentUser.role !== "SUPER_ADMIN_RW") {
        return { ok: false, message: "Akses ditolak." };
      }
      if (amountRp <= 0) {
        return {
          ok: false,
          message: "Nominal dana diterima harus lebih dari Rp 0.",
        };
      }
      if (!proofFileName.trim()) {
        return {
          ok: false,
          message: "Foto bukti penerimaan dana wajib dilampirkan.",
        };
      }
      const target = handovers.find((h) => h.id === handoverId);
      if (!target) {
        return { ok: false, message: "Data penyerahan tidak ditemukan." };
      }
      if (target.fundStatus === "Sudah Diterima") {
        return {
          ok: false,
          message: "Dana untuk penyerahan ini sudah tercatat sebelumnya.",
        };
      }

      setHandovers((prev) =>
        prev.map((h) =>
          h.id === handoverId
            ? {
                ...h,
                fundStatus: "Sudah Diterima",
                fundReceivedRp: amountRp,
                fundReceivedDate: receivedDate,
              }
            : h
        )
      );

      const finEntry: FinanceTransaction = {
        id: `FIN-2026-${String(financeTransactions.length + 1).padStart(
          3,
          "0"
        )}`,
        date: receivedDate,
        type: "DANA_MASUK",
        category: "Penerimaan Dinas Kebersihan",
        amountRp,
        description: `Penerimaan dana susulan atas penyerahan ${target.id} (${target.volumeLiters} L)`,
        referenceId: target.id,
        proofFileName: proofFileName.trim(),
        recordedBy: currentUser.name,
      };
      setFinanceTransactions((prev) => [finEntry, ...prev]);
      appendAudit(
        "Mencatat penerimaan dana dari penyerahan ke Dinas",
        handoverId,
        `Dana diterima sebesar Rp ${amountRp.toLocaleString("id-ID")}`
      );
      return {
        ok: true,
        message: `Dana sebesar Rp ${amountRp.toLocaleString(
          "id-ID"
        )} berhasil dicatat masuk ke Dana Program.`,
      };
    };

  const recordStockAdjustment: AppContextValue["recordStockAdjustment"] = (
    input
  ) => {
    if (currentUser.role !== "SUPER_ADMIN_RW") {
      return { ok: false, message: "Akses ditolak." };
    }
    if (!input.reason.trim()) {
      return { ok: false, message: "Alasan penyesuaian stok wajib diisi." };
    }
    const newAdj: StockAdjustment = {
      id: `ADJ-${Date.now().toString().slice(-4)}`,
      date: input.date,
      type: input.type,
      volumeDeltaLiters: Number(input.volumeDeltaLiters.toFixed(2)),
      reason: input.reason.trim(),
      recordedBy: currentUser.name,
    };
    setStockAdjustments((prev) => [newAdj, ...prev]);
    appendAudit(
      `Penyesuaian stok minyak (${input.type})`,
      newAdj.id,
      `${newAdj.volumeDeltaLiters} L — ${newAdj.reason}`
    );
    return {
      ok: true,
      message: "Penyesuaian stok minyak berhasil dicatat dengan jejak audit.",
    };
  };

  const recordManualFinanceTransaction: AppContextValue["recordManualFinanceTransaction"] =
    (input) => {
      if (currentUser.role !== "SUPER_ADMIN_RW") {
        return { ok: false, message: "Akses ditolak." };
      }
      if (input.amountRp <= 0) {
        return {
          ok: false,
          message: "Nominal transaksi harus lebih dari Rp 0.",
        };
      }
      if (!input.proofFileName.trim()) {
        return {
          ok: false,
          message: "Foto bukti transaksi wajib dilampirkan.",
        };
      }
      if (
        input.category === "Koreksi Tercatat" &&
        !input.correctionReason?.trim()
      ) {
        return {
          ok: false,
          message: "Alasan koreksi wajib diisi untuk auditabilitas.",
        };
      }
      const finEntry: FinanceTransaction = {
        id: `FIN-2026-${String(financeTransactions.length + 1).padStart(
          3,
          "0"
        )}`,
        date: input.date,
        type: input.type,
        category: input.category,
        amountRp: input.amountRp,
        description: input.description.trim(),
        proofFileName: input.proofFileName.trim(),
        recordedBy: currentUser.name,
        correctionReason: input.correctionReason?.trim(),
      };
      setFinanceTransactions((prev) => [finEntry, ...prev]);
      appendAudit(
        `Mencatat transaksi keuangan (${input.type})`,
        finEntry.id,
        `${input.category}: Rp ${input.amountRp.toLocaleString("id-ID")} — ${
          input.correctionReason || input.description
        }`
      );
      return {
        ok: true,
        message: `Transaksi ${finEntry.id} berhasil disimpan.`,
      };
    };

  const recordGroceryPurchase: AppContextValue["recordGroceryPurchase"] = (
    input
  ) => {
    if (currentUser.role !== "SUPER_ADMIN_RW") {
      return { ok: false, message: "Akses ditolak." };
    }
    if (!input.items.length) {
      return {
        ok: false,
        message: "Minimal 1 item barang sembako harus diisi.",
      };
    }
    if (!input.proofFileName.trim()) {
      return { ok: false, message: "Foto nota pembelian wajib diunggah." };
    }

    const mappedItems = input.items.map((it) => ({
      itemName: it.itemName.trim(),
      quantity: Number(it.quantity),
      unit: it.unit.trim(),
      unitPriceRp: Number(it.unitPriceRp),
      totalPriceRp: Number(it.quantity) * Number(it.unitPriceRp),
    }));

    const totalTransactionRp = mappedItems.reduce(
      (acc, i) => acc + i.totalPriceRp,
      0
    );

    const newPurchase: GroceryPurchase = {
      id: `PBL-2026-${String(purchases.length + 1).padStart(3, "0")}`,
      purchaseDate: input.purchaseDate,
      supplierName: input.supplierName.trim() || "Pemasok Tidak Dicantumkan",
      items: mappedItems,
      totalTransactionRp,
      receivedConfirmed: input.receivedConfirmed,
      proofFileName: input.proofFileName.trim(),
      notes: input.notes?.trim() || undefined,
      recordedBy: currentUser.name,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    const finEntry: FinanceTransaction = {
      id: `FIN-2026-${String(financeTransactions.length + 1).padStart(3, "0")}`,
      date: input.purchaseDate,
      type: "PENGELUARAN",
      category: "Pembelian Sembako",
      amountRp: totalTransactionRp,
      description: `Pembelian sembako (${mappedItems.length} item) di ${newPurchase.supplierName}`,
      referenceId: newPurchase.id,
      proofFileName: input.proofFileName.trim(),
      recordedBy: currentUser.name,
    };
    setFinanceTransactions((prev) => [finEntry, ...prev]);

    appendAudit(
      "Mencatat pembelian sembako",
      newPurchase.id,
      `Total Rp ${totalTransactionRp.toLocaleString("id-ID")} (${
        input.receivedConfirmed
          ? "Barang sudah diterima masuk stok"
          : "Menunggu konfirmasi barang diterima"
      })`
    );

    return {
      ok: true,
      message: `Pembelian ${newPurchase.id} berhasil disimpan.`,
    };
  };

  const confirmGroceryPurchaseReceived: AppContextValue["confirmGroceryPurchaseReceived"] =
    (purchaseId) => {
      if (currentUser.role !== "SUPER_ADMIN_RW") {
        return { ok: false, message: "Akses ditolak." };
      }
      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchaseId ? { ...p, receivedConfirmed: true } : p
        )
      );
      appendAudit(
        "Konfirmasi penerimaan fisik barang sembako",
        purchaseId,
        "Barang telah diterima dan masuk ke inventaris tersedia"
      );
      return {
        ok: true,
        message: `Barang pada pembelian ${purchaseId} telah dikonfirmasi masuk ke stok inventaris.`,
      };
    };

  const updateStandardPackageComposition: AppContextValue["updateStandardPackageComposition"] =
    (items, note) => {
      if (currentUser.role !== "SUPER_ADMIN_RW") {
        return { ok: false, message: "Akses ditolak." };
      }
      if (!items.length) {
        return {
          ok: false,
          message: "Komposisi paket standar harus memiliki minimal 1 item.",
        };
      }
      if (!note.trim()) {
        return {
          ok: false,
          message: "Catatan perubahan komposisi wajib diisi untuk riwayat.",
        };
      }

      setPackageComposition(items);
      const historyEntry: PackageCompositionHistory = {
        id: `KOMP-${String(compositionHistory.length + 1).padStart(3, "0")}`,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name,
        note: note.trim(),
        items,
      };
      setCompositionHistory((prev) => [historyEntry, ...prev]);
      appendAudit(
        "Memperbarui komposisi paket sembako standar",
        historyEntry.id,
        note.trim()
      );
      return {
        ok: true,
        message:
          "Komposisi paket sembako standar berhasil diperbarui. Catatan distribusi historis tetap terjaga.",
      };
    };

  const recordGroceryDistribution: AppContextValue["recordGroceryDistribution"] =
    (input) => {
      if (currentUser.role !== "SUPER_ADMIN_RW") {
        return { ok: false, message: "Akses ditolak." };
      }
      if (packageComposition.length === 0) {
        return {
          ok: false,
          message: "Tetapkan komposisi paket sembako standar terlebih dahulu.",
        };
      }
      if (input.packageCount <= 0) {
        return { ok: false, message: "Jumlah paket harus minimal 1 paket." };
      }
      if (input.packageCount > metrics.maxCompletePackagesAvailable) {
        return {
          ok: false,
          message: `Jumlah distribusi (${input.packageCount} paket) melebihi paket lengkap tersedia (${metrics.maxCompletePackagesAvailable} paket).`,
        };
      }
      if (!input.proofFileName.trim()) {
        return {
          ok: false,
          message: "Foto bukti distribusi wajib dilampirkan.",
        };
      }

      const newDist: GroceryDistribution = {
        id: `DST-2026-${String(distributions.length + 1).padStart(3, "0")}`,
        distributionDate: input.distributionDate,
        location: input.location.trim(),
        packageCount: input.packageCount,
        recipientCount: input.packageCount,
        recipientNote: input.recipientNote.trim(),
        compositionSnapshot: [...packageComposition],
        proofFileName: input.proofFileName.trim(),
        notes: input.notes?.trim() || undefined,
        recordedBy: currentUser.name,
      };

      setDistributions((prev) => [newDist, ...prev]);
      appendAudit(
        "Mencatat distribusi paket sembako seragam kepada satpam",
        newDist.id,
        `${newDist.packageCount} paket seragam di ${newDist.location}`
      );
      return {
        ok: true,
        message: `Distribusi ${newDist.id} (${newDist.packageCount} paket sembako seragam) berhasil dicatat.`,
      };
    };

  const upsertUserAccount: AppContextValue["upsertUserAccount"] = (
    input,
    reason
  ) => {
    if (currentUser.role !== "SUPER_ADMIN_RW") {
      return { ok: false, message: "Akses ditolak." };
    }
    if (!reason.trim()) {
      return {
        ok: false,
        message: "Alasan penambahan/perubahan akun wajib diisi.",
      };
    }

    if (input.id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === input.id ? { ...u, ...input } : u))
      );
      appendAudit("Memperbarui akun pengguna", input.id, reason.trim());
      return { ok: true, message: "Data akun berhasil diperbarui." };
    } else {
      const newUser: UserAccount = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        username: input.username.trim(),
        name: input.name.trim(),
        role: input.role,
        rt: input.rt,
        phone: input.phone || "-",
        active: input.active,
        // FR-01: Warga, Admin RT, dan Super Admin membuat PIN sendiri pada akun yang telah terdaftar
        pin: "",
        privacyShowNameInLeaderboard:
          input.privacyShowNameInLeaderboard ?? true,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      appendAudit(
        `Menambahkan akun ${newUser.role} baru`,
        newUser.id,
        `${newUser.name} (${newUser.rt || "Tingkat RW"}) — ${reason.trim()}`
      );
      return {
        ok: true,
        message: `Akun ${newUser.name} (${
          newUser.role === "ADMIN_RT" ? `Admin ${newUser.rt}` : `Warga ${newUser.rt}`
        }) berhasil didaftarkan. Pengguna akan membuat PIN sendiri saat pertama kali login.`,
      };
    }
  };

  const updateResidentProfile: AppContextValue["updateResidentProfile"] = (
    input
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              name: input.name.trim(),
              phone: input.phone.trim(),
              privacyShowNameInLeaderboard: input.privacyShowNameInLeaderboard,
            }
          : u
      )
    );
    appendAudit(
      "Memperbarui profil & preferensi privasi pribadi",
      currentUser.id,
      "Pembaruan mandiri oleh pengguna"
    );
    return { ok: true, message: "Profil Anda berhasil disimpan." };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUserById,
        isIllustrativeMode,
        toggleDataMode,
        resetData,
        users,
        collectionPoints,
        deposits,
        handovers,
        stockAdjustments,
        financeTransactions,
        purchases,
        packageComposition,
        compositionHistory,
        distributions,
        auditLogs,
        metrics,
        authenticateWithPin,
        createSelfPin,
        changeOwnPin,
        recordDeposit,
        updateDepositStatus,
        updateCollectionPoint,
        recordAgencyHandover,
        confirmHandoverFundReceived,
        recordStockAdjustment,
        recordManualFinanceTransaction,
        recordGroceryPurchase,
        confirmGroceryPurchaseReceived,
        updateStandardPackageComposition,
        recordGroceryDistribution,
        upsertUserAccount,
        updateResidentProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp harus digunakan di dalam AppProvider");
  }
  return ctx;
}
