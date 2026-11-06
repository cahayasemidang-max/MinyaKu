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
import { FileImage, Filter, Search } from "lucide-react";

export default function ResidentHistoryPage() {
  const { currentUser, deposits } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("SEMUA");
  const [monthFilter, setMonthFilter] = useState<string>("SEMUA");

  if (currentUser.role !== "WARGA") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Warga"
        switchHref={currentUser.role === "ADMIN_RT" ? "/rt" : "/rw"}
      />
    );
  }

  // FR-04: Warga hanya melihat riwayat setoran miliknya sendiri
  const myDeposits = deposits.filter((d) => d.residentId === currentUser.id);

  const filtered = myDeposits.filter((d) => {
    const matchSearch =
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      (d.notes || "").toLowerCase().includes(search.toLowerCase()) ||
      d.recordedByName.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "SEMUA" || d.status === (statusFilter as DepositStatus);
    const matchMonth =
      monthFilter === "SEMUA" || d.recordedAt.startsWith(monthFilter);
    return matchSearch && matchStatus && matchMonth;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Riwayat Setoran Minyak Jelantah Saya
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Menampilkan seluruh catatan setoran pribadi Anda di {currentUser.rt}{" "}
          beserta status verifikasi dan bukti foto.
        </p>
      </div>

      {/* Filter Bar Responsif */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari ID setoran atau catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-ink-muted shrink-0" />
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

          <div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm bg-white"
            >
              <option value="SEMUA">Semua Periode Bulan</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-10">Oktober 2026</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Daftar Riwayat (Kartu di HP, Tabel di Desktop) */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Catatan Setoran"
          description="Belum ada riwayat setoran yang cocok dengan filter pencarian Anda."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                  <th className="py-3 px-4">ID Setoran</th>
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Titik RT & Pencatat</th>
                  <th className="py-3 px-4">Volume Aktual</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bukti & Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {filtered.map((dep) => (
                  <tr key={dep.id} className="hover:bg-cream/30">
                    <td className="py-3.5 px-4 font-bold text-forest whitespace-nowrap">
                      {dep.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-ink">
                      {new Date(dep.recordedAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-ink">{dep.rt}</p>
                      <p className="text-xs text-ink-muted">
                        {dep.recordedByName}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-forest whitespace-nowrap">
                      {formatLiters(dep.volumeLiters)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={dep.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-forest font-medium">
                        <FileImage className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {dep.proofFileName}
                        </span>
                      </div>
                      {dep.notes && (
                        <p className="text-xs text-ink-muted mt-0.5">
                          {dep.notes}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

