"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  RoleDeniedBanner,
  StatCard,
  StatusBadge,
  formatLiters,
} from "@/components/ui";
import { RT_LIST } from "@/lib/mockData";
import { DepositStatus } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  FileImage,
  Search,
  Sliders,
} from "lucide-react";

export default function RWCollectionManagementPage() {
  const {
    currentUser,
    deposits,
    stockAdjustments,
    metrics,
    updateDepositStatus,
    recordStockAdjustment,
  } = useApp();

  const [rtFilter, setRtFilter] = useState<string>("SEMUA");
  const [statusFilter, setStatusFilter] = useState<string>("SEMUA");
  const [search, setSearch] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<DepositStatus>("Terverifikasi");
  const [reason, setReason] = useState<string>("");

  // State form penyesuaian stok (tumpahan / selisih pengukuran sesuai Bab 9.1 PRD)
  const [showAdjForm, setShowAdjForm] = useState(false);
  const [adjDate, setAdjDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [adjType, setAdjType] = useState<
    "Tumpahan / Susut" | "Koreksi Pengukuran"
  >("Tumpahan / Susut");
  const [adjDelta, setAdjDelta] = useState("-0.5");
  const [adjReason, setAdjReason] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (currentUser.role !== "SUPER_ADMIN_RW") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Super Admin RW"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rt"}
      />
    );
  }

  const filtered = deposits.filter((d) => {
    const matchRt = rtFilter === "SEMUA" || d.rt === rtFilter;
    const matchStatus =
      statusFilter === "SEMUA" || d.status === (statusFilter as DepositStatus);
    const matchSearch =
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.residentName.toLowerCase().includes(search.toLowerCase()) ||
      (d.notes || "").toLowerCase().includes(search.toLowerCase());
    return matchRt && matchStatus && matchSearch;
  });

  const handleStatusUpdate = (depositId: string) => {
    const res = updateDepositStatus(depositId, newStatus, reason);
    if (!res.ok) {
      alert(res.message);
      return;
    }
    setFeedback(res.message);
    setEditingId(null);
    setReason("");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAddAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const delta = parseFloat(adjDelta);
    if (Number.isNaN(delta) || delta === 0) {
      alert("Masukkan angka perubahan liter (misal -0.5 untuk susut/tumpahan).");
      return;
    }
    const res = recordStockAdjustment({
      date: adjDate,
      type: adjType,
      volumeDeltaLiters: delta,
      reason: adjReason,
    });
    if (!res.ok) {
      alert(res.message);
      return;
    }
    setFeedback(res.message);
    setShowAdjForm(false);
    setAdjReason("");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-forest">
            Pengelolaan Pengumpulan Minyak Lintas 7 RT
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Super Admin memantau seluruh catatan RT 01–RT 07, memverifikasi
            catatan yang perlu diperiksa, dan mencatat penyesuaian stok sah
            (Bab 9.1 PRD).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdjForm(!showAdjForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-forest text-forest hover:bg-sage/50 text-xs sm:text-sm font-bold shrink-0"
        >
          <Sliders className="w-4 h-4" />
          Catat Penyesuaian Stok (Tumpahan / Selisih)
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Ringkasan Stok Minyak RW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          highlight
          label="Total Masuk Terverifikasi (7 RT)"
          value={formatLiters(metrics.totalVerifiedVolumeAllRT)}
          subtext="Diakui sebagai stok masuk"
        />
        <StatCard
          label="Penyesuaian Stok Sah (Tumpahan/Selisih)"
          value={formatLiters(metrics.totalStockAdjustmentLiters)}
          subtext={`${stockAdjustments.length} catatan penyesuaian`}
        />
        <StatCard
          label="Sisa Volume Tercatat Saat Ini"
          value={formatLiters(metrics.remainingRecordedVolume)}
          subtext={`Setelah dikurangi ${formatLiters(
            metrics.totalHandedOverVolume
          )} diserahkan ke dinas`}
        />
      </div>

      {/* Form Penyesuaian Stok (Bab 9.1 PRD: Jangan menganggap semua perbedaan sebagai penjualan) */}
      {showAdjForm && (
        <Card className="border-2 border-forest space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-forest" />
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Catat Penyesuaian Stok Minyak (Bab 9.1 PRD)
            </h2>
          </div>
          <p className="text-xs text-ink-muted">
            Gunakan formulir ini untuk mencatat tumpahan, penyusutan penyaringan,
            atau selisih pengukuran agar stok tercatat tetap akurat tanpa
            dianggap sebagai penyerahan ke dinas.
          </p>
          <form
            onSubmit={handleAddAdjustment}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={adjDate}
                onChange={(e) => setAdjDate(e.target.value)}
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Jenis Penyesuaian
              </label>
              <select
                value={adjType}
                onChange={(e) =>
                  setAdjType(
                    e.target.value as
                      | "Tumpahan / Susut"
                      | "Koreksi Pengukuran"
                  )
                }
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm bg-white"
              >
                <option value="Tumpahan / Susut">Tumpahan / Susut</option>
                <option value="Koreksi Pengukuran">Koreksi Pengukuran</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Selisih Volume (Liter, misal -0.5)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={adjDelta}
                onChange={(e) => setAdjDelta(e.target.value)}
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Alasan Wajib (Audit)
              </label>
              <input
                type="text"
                required
                placeholder="Alasan selisih/tumpahan..."
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdjForm(false)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
              >
                Simpan Penyesuaian Stok
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Lintas 7 RT */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari warga, ID setoran, catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line pl-9 pr-3 py-2 text-xs sm:text-sm"
            />
          </div>

          <select
            value={rtFilter}
            onChange={(e) => setRtFilter(e.target.value)}
            className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm bg-white"
          >
            <option value="SEMUA">Semua RT (RT 01 s/d RT 07)</option>
            {RT_LIST.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm bg-white"
          >
            <option value="SEMUA">Semua Status Verifikasi</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Perlu diperiksa">Perlu diperiksa</option>
            <option value="Baru dicatat">Baru dicatat</option>
          </select>
        </div>
      </Card>

      {/* Tabel Catatan Setoran 7 RT */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Data Pengumpulan"
          description="Belum ada catatan setoran yang cocok dengan filter RT atau status."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                  <th className="py-3 px-4">ID & Waktu</th>
                  <th className="py-3 px-4">RT</th>
                  <th className="py-3 px-4">Warga & Pencatat</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bukti Foto</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {filtered.map((dep) => (
                  <React.Fragment key={dep.id}>
                    <tr className="hover:bg-cream/30">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-forest">{dep.id}</p>
                        <p className="text-xs text-ink-muted">
                          {new Date(dep.recordedAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full bg-sage text-forest text-xs font-bold">
                          {dep.rt}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-ink">
                          {dep.residentName}
                        </p>
                        <p className="text-xs text-ink-muted">
                          Oleh: {dep.recordedByName}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest whitespace-nowrap">
                        {formatLiters(dep.volumeLiters)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={dep.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-forest">
                          <FileImage className="w-3.5 h-3.5" />
                          {dep.proofFileName}
                        </span>
                        {dep.notes && (
                          <p className="text-xs text-ink-muted mt-0.5">
                            {dep.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(editingId === dep.id ? null : dep.id);
                            setNewStatus(dep.status);
                            setReason("");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold hover:bg-sage/40"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Ubah Status
                        </button>
                      </td>
                    </tr>
                    {editingId === dep.id && (
                      <tr className="bg-cream/60">
                        <td colSpan={7} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                            <div>
                              <label className="block text-xs font-semibold mb-1">
                                Status Baru ({dep.id})
                              </label>
                              <select
                                value={newStatus}
                                onChange={(e) =>
                                  setNewStatus(e.target.value as DepositStatus)
                                }
                                className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold"
                              >
                                <option value="Terverifikasi">
                                  Terverifikasi
                                </option>
                                <option value="Perlu diperiksa">
                                  Perlu diperiksa
                                </option>
                                <option value="Baru dicatat">
                                  Baru dicatat
                                </option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold mb-1">
                                Alasan Perubahan Status (Wajib untuk Audit Log)
                              </label>
                              <input
                                type="text"
                                placeholder="Masukkan alasan pemeriksaan / koreksi..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(dep.id)}
                                className="px-3.5 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-3 py-2 rounded-xl border border-line bg-white text-xs font-semibold"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

