"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  RoleDeniedBanner,
  StatCard,
  formatLiters,
  formatRp,
} from "@/components/ui";
import { OilTrendChart, RTComparisonChart } from "@/components/CollectionCharts";
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
              pengeluaran pembelian sembako, dan saldo dana tercatat (FR-07 &
              FR-15).
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

      {/* Blok 1: KPI Stok & Volume Minyak Jelantah */}
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

      {/* Blok 2: KPI Keuangan Program */}
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

      {/* Grafik 1 & 2 (FR-15): Proporsional Full-Width di Desktop */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 items-start">
        <OilTrendChart
          title="Grafik Tren Pengumpulan Minyak Jelantah Tingkat RW (Liter)"
          subtitle="Pantau perkembangan volume minyak jelantah terverifikasi seluruh RW atau per RT berdasarkan periode Harian, Mingguan, dan Bulanan (Tanpa dicampur dengan volume penyerahan ke dinas)."
          deposits={deposits}
          allowRTFilter={true}
        />

        <RTComparisonChart deposits={deposits} />
      </div>
    </div>
  );
}
