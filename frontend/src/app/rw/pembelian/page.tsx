"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  ProofUploadField,
  RoleDeniedBanner,
  StatCard,
  formatRp,
} from "@/components/ui";
import {
  CheckCircle2,
  Clock,
  FileImage,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

interface DraftItem {
  itemName: string;
  quantity: string;
  unit: string;
  unitPriceRp: string;
}

export default function GroceryPurchaseManagementPage() {
  const {
    currentUser,
    purchases,
    metrics,
    recordGroceryPurchase,
    confirmGroceryPurchaseReceived,
  } = useApp();

  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [supplierName, setSupplierName] = useState("");
  const [receivedConfirmed, setReceivedConfirmed] = useState(true);
  const [proofFileName, setProofFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([
    { itemName: "", quantity: "1", unit: "kg", unitPriceRp: "" },
  ]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (currentUser.role !== "SUPER_ADMIN_RW") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Super Admin RW"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rt"}
      />
    );
  }

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { itemName: "", quantity: "1", unit: "kg", unitPriceRp: "" },
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItemRow = (
    idx: number,
    field: keyof DraftItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const draftTotalRp = items.reduce((acc, row) => {
    const q = parseFloat(row.quantity) || 0;
    const p = parseFloat(row.unitPriceRp) || 0;
    return acc + q * p;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedItems = items
      .map((it) => ({
        itemName: it.itemName.trim(),
        quantity: parseFloat(it.quantity),
        unit: it.unit.trim(),
        unitPriceRp: parseFloat(it.unitPriceRp),
      }))
      .filter(
        (it) =>
          it.itemName &&
          !Number.isNaN(it.quantity) &&
          it.quantity > 0 &&
          !Number.isNaN(it.unitPriceRp) &&
          it.unitPriceRp >= 0
      );

    if (parsedItems.length === 0) {
      setErrorMsg(
        "Pastikan setiap item barang memiliki nama, kuantitas, satuan, dan harga satuan yang valid."
      );
      return;
    }

    const res = recordGroceryPurchase({
      purchaseDate,
      supplierName,
      items: parsedItems,
      receivedConfirmed,
      proofFileName,
      notes,
    });

    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    setFeedback(res.message);
    setSupplierName("");
    setProofFileName("");
    setNotes("");
    setItems([{ itemName: "", quantity: "1", unit: "kg", unitPriceRp: "" }]);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Manajemen Pembelian Sembako (FR-10)
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Catat pembelian sembako multi-item beserta foto nota bukti. Inventaris
          hanya diperbarui dari barang yang benar-benar dikonfirmasi telah
          diterima (FR-10).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          highlight
          label="Saldo Dana Program Tersedia"
          value={formatRp(metrics.recordedFundBalanceRp)}
          subtext="Sumber dana pembelian sembako"
        />
        <StatCard
          label="Total Transaksi Pembelian"
          value={`${purchases.length} Transaksi`}
          subtext={`${
            purchases.filter((p) => p.receivedConfirmed).length
          } sudah dikonfirmasi masuk stok`}
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <StatCard
          label="Total Nilai Pembelian Sembako"
          value={formatRp(
            purchases.reduce((acc, p) => acc + p.totalTransactionRp, 0)
          )}
          subtext="Dilengkapi bukti nota transaksi"
        />
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Formulir Pembelian Sembako Multi-Item */}
      <Card>
        <h2 className="text-base font-bold text-forest mb-4">
          Catat Pembelian Sembako Baru
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Tanggal Pembelian <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Nama Pemasok / Toko
              </label>
              <input
                type="text"
                placeholder="Contoh: Toko Sembako Makmur"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Status Penerimaan Fisik Barang (FR-10)
              </label>
              <select
                value={receivedConfirmed ? "YA" : "BELUM"}
                onChange={(e) =>
                  setReceivedConfirmed(e.target.value === "YA")
                }
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm bg-white font-medium"
              >
                <option value="YA">
                  Barang Sudah Diterima (Langsung Tambah Stok)
                </option>
                <option value="BELUM">
                  Belum Diterima Fisik (Jangan Tambah Stok Dulu)
                </option>
              </select>
            </div>
          </div>

          {/* Daftar Item Barang */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-forest">
                Rincian Item Barang Sembako
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sage text-forest text-xs font-bold hover:bg-sage-dark"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris Barang
              </button>
            </div>

            {items.map((row, idx) => {
              const subtotal =
                (parseFloat(row.quantity) || 0) *
                (parseFloat(row.unitPriceRp) || 0);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-xl bg-cream/60 border border-line items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                      Nama Barang
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: Beras Medium"
                      value={row.itemName}
                      onChange={(e) =>
                        updateItemRow(idx, "itemName", e.target.value)
                      }
                      className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                      Kuantitas
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={row.quantity}
                      onChange={(e) =>
                        updateItemRow(idx, "quantity", e.target.value)
                      }
                      className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                      Satuan
                    </label>
                    <select
                      value={row.unit}
                      onChange={(e) =>
                        updateItemRow(idx, "unit", e.target.value)
                      }
                      className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs sm:text-sm"
                    >
                      <option value="kg">kg</option>
                      <option value="liter">liter</option>
                      <option value="kantong">kantong</option>
                      <option value="kaleng">kaleng</option>
                      <option value="bungkus">bungkus</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                      Harga Satuan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="Rp"
                      value={row.unitPriceRp}
                      onChange={(e) =>
                        updateItemRow(idx, "unitPriceRp", e.target.value)
                      }
                      className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-ink-muted">Total Item</p>
                      <p className="text-xs font-bold text-forest">
                        {formatRp(subtotal)}
                      </p>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-1">
              <p className="text-sm font-bold text-forest">
                Total Transaksi Pembelian: {formatRp(draftTotalRp)}
              </p>
            </div>
          </div>

          <ProofUploadField
            label="Foto Nota / Bukti Transaksi Pembelian (Wajib)"
            value={proofFileName}
            onChange={setProofFileName}
          />

          <div>
            <label className="block text-xs font-semibold mb-1">
              Catatan Pembelian
            </label>
            <input
              type="text"
              placeholder="Catatan tambahan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs sm:text-sm font-bold transition"
          >
            Simpan Pembelian Sembako
          </button>
        </form>
      </Card>

      {/* Riwayat Pembelian */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line">
          <h2 className="text-sm sm:text-base font-bold text-forest">
            Riwayat Pembelian Sembako
          </h2>
        </div>

        {purchases.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Belum Ada Catatan Pembelian Sembako"
              description="Catat pembelian sembako pada formulir di atas."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {purchases.map((p) => (
              <div key={p.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-forest text-sm">
                        {p.id}
                      </span>
                      <span className="text-xs text-ink-muted">
                        • {p.purchaseDate} • {p.supplierName}
                      </span>
                      {p.receivedConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage text-forest text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Diterima (Masuk Stok)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          Belum Dikonfirmasi Diterima
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-forest font-medium mt-1 flex items-center gap-1">
                      <FileImage className="w-3.5 h-3.5" />
                      Nota: {p.proofFileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="sm:text-right">
                      <p className="text-xs text-ink-muted">Total Transaksi</p>
                      <p className="text-base font-bold text-forest">
                        {formatRp(p.totalTransactionRp)}
                      </p>
                    </div>
                    {!p.receivedConfirmed && (
                      <button
                        type="button"
                        onClick={() => confirmGroceryPurchaseReceived(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold"
                      >
                        Konfirmasi Barang Diterima
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {p.items.map((it, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-cream/60 border border-line text-xs flex justify-between"
                    >
                      <div>
                        <p className="font-bold text-ink">{it.itemName}</p>
                        <p className="text-ink-muted">
                          {it.quantity} {it.unit} × {formatRp(it.unitPriceRp)}
                        </p>
                      </div>
                      <span className="font-bold text-forest">
                        {formatRp(it.totalPriceRp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

