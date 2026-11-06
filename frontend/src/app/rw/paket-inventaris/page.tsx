"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  RoleDeniedBanner,
  StatCard,
  formatRp,
} from "@/components/ui";
import { PackageCompositionItem } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  History,
  Package,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

export default function StandardPackageAndInventoryPage() {
  const {
    currentUser,
    packageComposition,
    compositionHistory,
    metrics,
    updateStandardPackageComposition,
  } = useApp();

  const [draftItems, setDraftItems] = useState<PackageCompositionItem[]>(
    packageComposition.length > 0
      ? packageComposition
      : [{ itemName: "Beras Medium", quantityPerPackage: 3, unit: "kg" }]
  );
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (currentUser.role !== "SUPER_ADMIN_RW") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Super Admin RW"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rt"}
      />
    );
  }

  const handleAddRow = () => {
    setDraftItems((prev) => [
      ...prev,
      { itemName: "", quantityPerPackage: 1, unit: "kg" },
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    if (draftItems.length <= 1) return;
    setDraftItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveComposition = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftItems
      .map((d) => ({
        itemName: d.itemName.trim(),
        quantityPerPackage: Number(d.quantityPerPackage),
        unit: d.unit.trim(),
      }))
      .filter((d) => d.itemName && d.quantityPerPackage > 0);

    const res = updateStandardPackageComposition(cleaned, note);
    if (!res.ok) {
      alert(res.message);
      return;
    }
    setFeedback(res.message);
    setNote("");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Paket Sembako Standar & Inventaris (FR-11)
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Satu komposisi paket standar berlaku seragam bagi setiap satpam
          penerima (Aturan Bisnis #10). Sistem menghitung paket lengkap maksimum
          dari item pembatas (Bab 9.3).
        </p>
      </div>

      {/* Ringkasan Ketersediaan Paket Lengkap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          highlight
          label="Jumlah Paket Lengkap Siap Disiapkan"
          value={`${metrics.maxCompletePackagesAvailable} Paket`}
          subtext="Ditentukan oleh stok item yang paling membatasi"
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          label="Estimasi Biaya per 1 Paket Standar"
          value={formatRp(metrics.estimatedCostPerPackageRp)}
          subtext="Dihitung dari harga rata-rata pembelian tercatat"
        />
        <StatCard
          label="Total Paket Telah Didistribusikan"
          value={`${metrics.totalPackagesDistributed} Paket`}
          subtext="Stok historis tetap terlacak"
        />
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Tabel Inventaris Sembako & Deteksi Item Pembatas */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line">
          <h2 className="text-sm sm:text-base font-bold text-forest">
            Stok Inventaris Sembako & Kalkulasi Paket Lengkap
          </h2>
          <p className="text-xs text-ink-muted">
            Menampilkan stok tersedia, kebutuhan per paket standar, dan penanda
            item yang tidak cukup untuk memenuhi 1 paket tambahan (FR-11).
          </p>
        </div>

        {metrics.inventorySummary.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Inventaris Sembako Masih Kosong"
              description="Tetapkan komposisi paket standar di bawah dan catat pembelian sembako yang telah diterima."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4">Dibeli (Terkonfirmasi)</th>
                  <th className="py-3 px-4">Didistribusikan</th>
                  <th className="py-3 px-4">Stok Tersedia</th>
                  <th className="py-3 px-4">Kebutuhan / Paket</th>
                  <th className="py-3 px-4">Maks Paket dari Item Ini</th>
                  <th className="py-3 px-4">Status Kecukupan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {metrics.inventorySummary.map((item) => {
                  const insufficientForNextPackage =
                    item.requiredPerPackage > 0 &&
                    item.availableStock <
                      (metrics.maxCompletePackagesAvailable + 1) *
                        item.requiredPerPackage;

                  return (
                    <tr key={`${item.itemName}-${item.unit}`}>
                      <td className="py-3.5 px-4 font-bold text-ink">
                        {item.itemName}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.totalPurchasedConfirmed} {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.totalDistributed} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest">
                        {item.availableStock} {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.requiredPerPackage > 0 ? (
                          <span className="font-semibold">
                            {item.requiredPerPackage} {item.unit} / paket
                          </span>
                        ) : (
                          <span className="text-ink-muted">
                            Di luar paket standar
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {item.maxPackagesFromThisItem !== null
                          ? `${item.maxPackagesFromThisItem} Paket`
                          : "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.isLimiting || insufficientForNextPackage ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Item Pembatas (Kurang untuk paket ke-
                            {metrics.maxCompletePackagesAvailable + 1})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage text-forest text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Stok Mencukupi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Form Pengaturan 1 Komposisi Paket Sembako Standar */}
      <Card>
        <h2 className="text-base font-bold text-forest mb-1">
          Pengaturan Komposisi Paket Sembako Standar (Seragam)
        </h2>
        <p className="text-xs text-ink-muted mb-4">
          Perubahan komposisi akan disimpan beserta riwayatnya dan tidak
          mengubah snapshot catatan distribusi historis (FR-11).
        </p>

        <form onSubmit={handleSaveComposition} className="space-y-4">
          <div className="space-y-2.5">
            {draftItems.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-10 gap-2.5 p-3 rounded-xl bg-cream/60 border border-line items-end"
              >
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Nama Item Barang dalam Paket
                  </label>
                  <input
                    type="text"
                    required
                    value={row.itemName}
                    onChange={(e) =>
                      setDraftItems((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, itemName: e.target.value } : r
                        )
                      )
                    }
                    className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-ink-muted mb-1">
                    Kuantitas / Paket
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={row.quantityPerPackage}
                    onChange={(e) =>
                      setDraftItems((prev) =>
                        prev.map((r, i) =>
                          i === idx
                            ? {
                                ...r,
                                quantityPerPackage:
                                  parseFloat(e.target.value) || 0,
                              }
                            : r
                        )
                      )
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
                      setDraftItems((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, unit: e.target.value } : r
                        )
                      )
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
                <div className="sm:col-span-1 flex justify-end">
                  {draftItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage text-forest text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Item Komposisi Paket
          </button>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Alasan / Catatan Penetapan Komposisi (Wajib untuk Riwayat FR-11){" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Penyesuaian komposisi paket sembako satpam periode November"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs sm:text-sm font-bold transition"
          >
            <Save className="w-4 h-4" />
            Simpan Komposisi Paket Standar
          </button>
        </form>
      </Card>

      {/* Riwayat Perubahan Komposisi Paket */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-forest" />
          <h2 className="text-sm font-bold text-forest">
            Riwayat Penetapan Komposisi Paket Standar
          </h2>
        </div>
        {compositionHistory.length === 0 ? (
          <p className="text-xs text-ink-muted">
            Belum ada riwayat perubahan komposisi.
          </p>
        ) : (
          <div className="space-y-2">
            {compositionHistory.map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-cream/60 border border-line text-xs"
              >
                <div className="flex justify-between font-bold text-ink">
                  <span>
                    {h.id} — {h.note}
                  </span>
                  <span className="text-ink-muted">
                    {new Date(h.updatedAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p className="text-ink-muted mt-1">
                  Isi per paket:{" "}
                  {h.items
                    .map(
                      (i) => `${i.itemName} (${i.quantityPerPackage} ${i.unit})`
                    )
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

