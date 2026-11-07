"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, EmptyState, StatCard, formatRp } from "./ui";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  HeartHandshake,
  Info,
  PieChart,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Pembelian Sembako",
  "Operasional Penunjang",
  "Koreksi Tercatat",
] as const;

export function ProgramFinanceSummaryView({
  viewerRoleLabel,
}: {
  viewerRoleLabel: string;
}) {
  const { financeTransactions, metrics } = useApp();
  const [periodFilter, setPeriodFilter] = useState<string>("SEMUA");

  const filteredTx = useMemo(() => {
    return financeTransactions.filter((t) => {
      if (periodFilter !== "SEMUA" && !t.date.startsWith(periodFilter)) {
        return false;
      }
      return true;
    });
  }, [financeTransactions, periodFilter]);

  const totalFundsInPeriod = filteredTx
    .filter((t) => t.type === "DANA_MASUK")
    .reduce((acc, t) => acc + t.amountRp, 0);

  const totalExpensesInPeriod = filteredTx
    .filter((t) => t.type === "PENGELUARAN")
    .reduce((acc, t) => acc + t.amountRp, 0);

  const balanceInPeriod = totalFundsInPeriod - totalExpensesInPeriod;

  // Ringkasan per kategori pengeluaran untuk transparansi penuh
  const expenseCategorySummary = useMemo(() => {
    return EXPENSE_CATEGORIES.map((category) => {
      const matching = filteredTx.filter(
        (t) => t.type === "PENGELUARAN" && t.category === category
      );
      const totalRp = matching.reduce((acc, t) => acc + t.amountRp, 0);
      const percentage =
        totalExpensesInPeriod > 0
          ? Math.round((totalRp / totalExpensesInPeriod) * 100)
          : 0;
      return {
        category,
        totalRp,
        txCount: matching.length,
        percentage,
      };
    });
  }, [filteredTx, totalExpensesInPeriod]);

  // Ringkasan pemasukan per kategori
  const incomeTransactionsCount = filteredTx.filter(
    (t) => t.type === "DANA_MASUK"
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage text-forest text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Transparansi Pengelolaan Dana Program • {viewerRoleLabel}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-forest mt-1.5">
            Ringkasan Neraca Dana Program RW (FR-09)
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Menampilkan ringkasan dana hasil penyerahan minyak jelantah ke Dinas
            Kebersihan Kota Bekasi, rincian per kategori pengeluaran, dan saldo
            dana tercatat (Saldo bukan label &ldquo;keuntungan&rdquo;).
          </p>
        </div>

        <div className="shrink-0">
          <label className="block text-[11px] font-semibold text-ink-muted mb-1">
            Filter Periode
          </label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-ink"
          >
            <option value="SEMUA">Akumulasi Seluruh Periode</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-10">Oktober 2026</option>
          </select>
        </div>
      </div>

      {/* 3 Kartu Utama Neraca Dana Program (Aturan Bisnis #12 & FR-09) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          label="Total Dana Masuk Tercatat"
          value={formatRp(totalFundsInPeriod)}
          subtext={`Dari ${incomeTransactionsCount} penerimaan sah Dinas Kebersihan`}
          icon={<Coins className="w-5 h-5" />}
        />
        <StatCard
          label="Total Pengeluaran Program Tercatat"
          value={formatRp(totalExpensesInPeriod)}
          subtext="Pembelian sembako & pengeluaran program tercatat"
          icon={<ShoppingBag className="w-5 h-5" />}
        />
        <StatCard
          highlight
          label="Saldo Dana Program Tercatat"
          value={formatRp(balanceInPeriod)}
          subtext="Total dana masuk tercatat − total pengeluaran tercatat"
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      {/* Ringkasan per Kategori Pengeluaran (Transparansi Penggunaan Dana) */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-forest" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-forest">
                Ringkasan Pengeluaran per Kategori Program
              </h2>
              <p className="text-xs text-ink-muted">
                Transparansi alokasi penggunaan dana program tingkat RW
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-forest">
            Total Pengeluaran: {formatRp(totalExpensesInPeriod)}
          </span>
        </div>

        {totalExpensesInPeriod === 0 ? (
          <EmptyState
            title="Belum Ada Pengeluaran Tercatat pada Periode Ini"
            description="Rincian kategori pengeluaran akan tampil setelah Super Admin RW mencatat transaksi pembelian sembako atau operasional."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {expenseCategorySummary.map((item) => (
              <div
                key={item.category}
                className="p-4 rounded-xl bg-cream/60 border border-line space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-ink">
                      {item.category}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {item.txCount} transaksi tercatat
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sage text-forest text-xs font-bold">
                    {item.percentage}%
                  </span>
                </div>

                <p className="text-base sm:text-lg font-bold text-forest">
                  {formatRp(item.totalRp)}
                </p>

                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-line">
                  <div
                    className="h-full bg-forest rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Ringkasan Sumber Pemasukan & Realisasi Paket Sembako */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-forest" />
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Sumber Pemasukan Dana Program
            </h2>
          </div>
          <div className="p-3.5 rounded-xl bg-cream/60 border border-line flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-bold text-ink">
                Penerimaan Dinas Kebersihan Kota Bekasi
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                Hasil serah terima minyak jelantah warga dari 7 RT (
                {incomeTransactionsCount} transaksi)
              </p>
            </div>
            <p className="text-base font-bold text-forest">
              {formatRp(totalFundsInPeriod)}
            </p>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-forest" />
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Dampak Sosial Program Sembako Satpam
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-cream/60 border border-line">
              <p className="text-xs text-ink-muted">Paket Sembako Disalurkan</p>
              <p className="text-base font-bold text-forest mt-0.5">
                {metrics.totalPackagesDistributed} Paket Seragam
              </p>
            </div>
            <div className="p-3 rounded-xl bg-cream/60 border border-line">
              <p className="text-xs text-ink-muted">Paket Siap Disalurkan</p>
              <p className="text-base font-bold text-forest mt-0.5">
                {metrics.maxCompletePackagesAvailable} Paket Lengkap
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Catatan Prinsip Akuntabilitas FR-09 */}
      <div className="p-3.5 rounded-xl bg-sage/40 border border-forest/20 text-xs text-ink flex items-start gap-2.5">
        <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-forest">
            Ketentuan Transparansi & Rumus Neraca (FR-09)
          </p>
          <p className="text-ink-muted">
            <strong>
              Saldo dana tercatat = Total dana masuk yang tercatat − Total
              pengeluaran yang tercatat.
            </strong>{" "}
            Dana yang diterima dari Dinas Kebersihan Kota Bekasi seluruhnya
            digunakan untuk pembelian paket sembako seragam bagi satpam (tidak
            dibagikan sebagai uang tunai). Pencatatan dan pengelolaan rincian
            transaksi dilakukan oleh Super Admin RW.
          </p>
        </div>
      </div>
    </div>
  );
}

