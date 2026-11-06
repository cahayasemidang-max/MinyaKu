"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  RoleDeniedBanner,
  StatusBadge,
  formatLiters,
} from "@/components/ui";
import { DepositStatus } from "@/lib/types";
import { CheckCircle2, Edit3, FileImage, Search } from "lucide-react";

export default function RTCollectionHistoryPage() {
  const { currentUser, deposits, updateDepositStatus } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("SEMUA");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<DepositStatus>("Terverifikasi");
  const [auditReason, setAuditReason] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (currentUser.role !== "ADMIN_RT") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Admin RT (Relawan Pencatat RT)"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rw"}
      />
    );
  }

  // FR-04: Admin RT hanya melihat catatan RT yang ditugaskan
  const rtDeposits = deposits.filter((d) => d.rt === currentUser.rt);

  const filtered = rtDeposits.filter((d) => {
    const matchSearch =
      d.residentName.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      (d.notes || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "SEMUA" || d.status === (statusFilter as DepositStatus);
    return matchSearch && matchStatus;
  });

  const handleSaveStatus = (depositId: string) => {
    const res = updateDepositStatus(depositId, newStatus, auditReason);
    if (!res.ok) {
      alert(res.message);
      return;
    }
    setFeedback(res.message);
    setEditingId(null);
    setAuditReason("");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Riwayat Pengumpulan {currentUser.rt}
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Daftar seluruh setoran warga di {currentUser.rt}. Setiap koreksi status
          wajib disertai alasan untuk dicatat pada jejak audit (FR-03 & FR-04).
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama warga, ID setoran, atau catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line pl-9 pr-3 py-2 text-xs sm:text-sm"
            />
          </div>

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

      {filtered.length === 0 ? (
        <EmptyState
          title={`Tidak Ada Catatan Setoran di ${currentUser.rt}`}
          description="Belum ada data setoran yang sesuai dengan filter pencarian Anda."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                  <th className="py-3 px-4">ID & Waktu</th>
                  <th className="py-3 px-4">Warga ({currentUser.rt})</th>
                  <th className="py-3 px-4">Volume Aktual</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bukti & Catatan</th>
                  <th className="py-3 px-4 text-right">Aksi Audit</th>
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
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        {dep.residentName}
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
                            setAuditReason("");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-sage/40"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Koreksi Status
                        </button>
                      </td>
                    </tr>
                    {editingId === dep.id && (
                      <tr className="bg-cream/60">
                        <td colSpan={6} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-ink mb-1">
                                Ubah Status Setoran {dep.id}
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
                              <label className="block text-xs font-semibold text-ink mb-1">
                                Alasan Perubahan Status (Wajib untuk Audit Log){" "}
                                <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Contoh: Sudah ditakar ulang bersama warga dan sesuai"
                                value={auditReason}
                                onChange={(e) => setAuditReason(e.target.value)}
                                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs"
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveStatus(dep.id)}
                                className="px-3.5 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
                              >
                                Simpan Audit
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

