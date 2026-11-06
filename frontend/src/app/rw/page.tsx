"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Card,
  RoleDeniedBanner,
  StatCard,
  formatLiters,
  formatRp,
} from "@/components/ui";
import { RT_LIST } from "@/lib/mockData";
import {
  ArrowRight,
  BarChart3,
  Coins,
  Droplets,
  HeartHandshake,
  Package,
  ShoppingBag,
  Truck,
  Wallet,
} from "lucide-react";

export default function RWSuperAdminDashboardPage() {
  const { currentUser, deposits, metrics } = useApp();

  if (currentUser.role !== "SUPER_ADMIN_RW") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Super Admin RW"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rt"}
      />
    );
  }

  // Perbandingan pengumpulan antar 7 RT (FR-07)
  const rtComparison = RT_LIST.map((rt) => {
    const rtDeps = deposits.filter((d) => d.rt === rt);
    const verifiedLiters = rtDeps
      .filter((d) => d.status === "Terverifikasi")
      .reduce((acc, d) => acc + d.volumeLiters, 0);
    const needCheckCount = rtDeps.filter(
      (d) => d.status === "Perlu diperiksa"
    ).length;
    return {
      rt,
      verifiedLiters: Number(verifiedLiters.toFixed(2)),
      totalRecords: rtDeps.length,
      needCheckCount,
    };
  });

  const maxRtLiters = Math.max(
    ...rtComparison.map((r) => r.verifiedLiters),
    1
  );

  return (
    <div className="space-y-5">
      {/* Header Ringkasan Super Admin RW */}
      <div className="bg-forest text-white rounded-card p-5 sm:p-6 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-sage">
              Pengawasan Tingkat RW • 7 RT Terintegrasi
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mt-2">
              Dashboard Operasional & Keuangan Program RW
            </h1>
            <p className="text-xs sm:text-sm text-cream/90 mt-1 max-w-3xl">
              Memisahkan secara tegas volume minyak terkumpul vs diserahkan ke
              Dinas Kebersihan Kota Bekasi, serta memisahkan dana masuk,
              pengeluaran pembelian sembako, dan saldo dana tercatat (FR-07).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/rw/penyerahan"
              className="px-3.5 py-2.5 rounded-xl bg-cream text-forest font-bold text-xs sm:text-sm hover:bg-white transition"
            >
              + Serah Terima Dinas
            </Link>
            <Link
              href="/rw/distribusi"
              className="px-3.5 py-2.5 rounded-xl bg-white/15 text-white border border-white/25 font-bold text-xs sm:text-sm hover:bg-white/25 transition"
            >
              + Distribusi Sembako Satpam
            </Link>
          </div>
        </div>
      </div>

      {/* Blok 1: KPI Stok & Volume Minyak Jelantah (Aturan Bisnis #11 & Bab 9.1) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest">
            1. Neraca Volume Minyak Jelantah (Liter) — 7 RT
          </h2>
          <Link
            href="/rw/pengumpulan"
            className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
          >
            Kelola Pengumpulan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StatCard
            highlight
            label="Total Volume Terverifikasi (7 RT)"
            value={formatLiters(metrics.totalVerifiedVolumeAllRT)}
            subtext="Akumulasi setoran warga berstatus Terverifikasi"
            icon={<Droplets className="w-5 h-5" />}
          />
          <StatCard
            label="Volume Diserahkan ke Dinas"
            value={formatLiters(metrics.totalHandedOverVolume)}
            subtext="Tercatat dalam berita acara Dinas Kebersihan"
            icon={<Truck className="w-5 h-5" />}
          />
          <StatCard
            label="Sisa Volume Tercatat (Stok RW)"
            value={formatLiters(metrics.remainingRecordedVolume)}
            subtext={
              metrics.totalStockAdjustmentLiters !== 0
                ? `Termasuk penyesuaian ${formatLiters(
                    metrics.totalStockAdjustmentLiters
                  )}`
                : "Volume masuk terverifikasi − volume diserahkan"
            }
            icon={<BarChart3 className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Blok 2: KPI Keuangan Program (Aturan Bisnis #12 & FR-09 — Saldo bukan label keuntungan) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest">
            2. Neraca Dana Program (Rupiah) — Transparan & Terpisah
          </h2>
          <Link
            href="/rw/dana"
            className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
          >
            Rincian Dana Program <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StatCard
            label="Dana Benar-Benar Diterima"
            value={formatRp(metrics.totalFundsReceivedRp)}
            subtext="Hanya menghitung dana yang sudah masuk tercatat"
            icon={<Coins className="w-5 h-5" />}
          />
          <StatCard
            label="Total Pengeluaran Program"
            value={formatRp(metrics.totalProgramExpensesRp)}
            subtext="Pembelian sembako & pengeluaran tercatat"
            icon={<ShoppingBag className="w-5 h-5" />}
          />
          <StatCard
            highlight
            label="Saldo Dana Program Tercatat"
            value={formatRp(metrics.recordedFundBalanceRp)}
            subtext="Total dana masuk tercatat − total pengeluaran tercatat"
            icon={<Wallet className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Blok 3: KPI Paket Sembako Seragam & Distribusi Satpam */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-forest">
            3. Kesiapan Paket Sembako Standar & Distribusi Satpam
          </h2>
          <Link
            href="/rw/paket-inventaris"
            className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
          >
            Atur Komposisi & Stok <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StatCard
            label="Paket Lengkap Siap Disalurkan"
            value={`${metrics.maxCompletePackagesAvailable} Paket`}
            subtext="Dihitung otomatis dari stok item pembatas"
            icon={<Package className="w-5 h-5" />}
          />
          <StatCard
            label="Total Paket Sudah Didistribusikan"
            value={`${metrics.totalPackagesDistributed} Paket`}
            subtext="1 paket seragam untuk setiap satpam penerima"
            icon={<HeartHandshake className="w-5 h-5" />}
          />
          <StatCard
            label="Estimasi Nilai per Paket Standar"
            value={formatRp(metrics.estimatedCostPerPackageRp)}
            subtext="Berdasarkan harga rata-rata pembelian tercatat"
            icon={<ShoppingBag className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Perbandingan Pengumpulan Antar-7 RT */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Perbandingan Volume Terverifikasi Antar-RT (RT 01 s/d RT 07)
            </h2>
            <p className="text-xs text-ink-muted">
              Pantau capaian setiap titik pengumpulan RT dan catatan yang perlu
              diperiksa
            </p>
          </div>
          <Link
            href="/rw/laporan"
            className="text-xs font-bold text-forest hover:underline"
          >
            Buka Laporan Lengkap →
          </Link>
        </div>

        <div className="space-y-3">
          {rtComparison.map((row) => {
            const pct = Math.min(
              100,
              Math.round((row.verifiedLiters / maxRtLiters) * 100)
            );
            return (
              <div key={row.rt} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink w-14">{row.rt}</span>
                    <span className="text-xs text-ink-muted">
                      ({row.totalRecords} catatan)
                    </span>
                    {row.needCheckCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold">
                        {row.needCheckCount} perlu diperiksa
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-forest">
                    {formatLiters(row.verifiedLiters)}
                  </span>
                </div>
                <div className="w-full h-3 bg-cream rounded-full overflow-hidden border border-line">
                  <div
                    className="h-full bg-forest rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

