"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  RoleDeniedBanner,
  StatCard,
  formatLiters,
} from "@/components/ui";
import { OilTrendChart } from "@/components/CollectionCharts";
import { BarChart3, CheckCircle2, Droplets, Users } from "lucide-react";

export default function RTReportPage() {
  const { currentUser, deposits } = useApp();

  if (currentUser.role !== "ADMIN_RT") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Admin RT (Relawan Pencatat RT)"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rw"}
      />
    );
  }

  const rtDeposits = deposits.filter((d) => d.rt === currentUser.rt);
  const verifiedDeposits = rtDeposits.filter(
    (d) => d.status === "Terverifikasi"
  );

  const totalVerifiedLiters = verifiedDeposits.reduce(
    (acc, d) => acc + d.volumeLiters,
    0
  );

  const uniqueContributors = new Set(verifiedDeposits.map((d) => d.residentId))
    .size;

  const monthlyMap = new Map<
    string,
    { verifiedLiters: number; count: number; needCheckCount: number }
  >();

  rtDeposits.forEach((d) => {
    const ym = d.recordedAt.slice(0, 7);
    const cur = monthlyMap.get(ym) || {
      verifiedLiters: 0,
      count: 0,
      needCheckCount: 0,
    };
    if (d.status === "Terverifikasi") {
      cur.verifiedLiters += d.volumeLiters;
      cur.count += 1;
    } else {
      cur.needCheckCount += 1;
    }
    monthlyMap.set(ym, cur);
  });

  const monthlyRecap = Array.from(monthlyMap.entries()).sort(([a], [b]) =>
    b.localeCompare(a)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Rekap & Grafik Tren Pengumpulan {currentUser.rt}
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Ringkasan operasional dan grafik perkembangan pengumpulan minyak
          jelantah khusus wilayah {currentUser.rt} (FR-06 & FR-15).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          highlight
          label={`Total Liter Terverifikasi (${currentUser.rt})`}
          value={formatLiters(totalVerifiedLiters)}
          subtext="Siap diserahkan ke tingkat RW"
          icon={<Droplets className="w-5 h-5" />}
        />
        <StatCard
          label="Jumlah Transaksi Terverifikasi"
          value={`${verifiedDeposits.length} Setoran`}
          subtext={`Dari total ${rtDeposits.length} catatan di ${currentUser.rt}`}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          label={`Warga Aktif Menyetor (${currentUser.rt})`}
          value={`${uniqueContributors} Warga`}
          subtext="Memiliki setoran terverifikasi"
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Grafik Tren Pengumpulan RT (Harian/Mingguan/Bulanan + Filter Rentang Tanggal) */}
      <OilTrendChart
        title={`Grafik Tren Pengumpulan ${currentUser.rt} (Harian / Mingguan / Bulanan)`}
        subtitle={`Filter perkembangan volume setoran terverifikasi di ${currentUser.rt} berdasarkan rentang tanggal.`}
        deposits={rtDeposits}
      />

      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-forest" />
          <h2 className="text-sm sm:text-base font-bold text-forest">
            Tabel Rekap Bulanan {currentUser.rt}
          </h2>
        </div>

        {monthlyRecap.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Belum Ada Rekap Bulanan"
              description={`Belum ada setoran tercatat di ${currentUser.rt}.`}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                  <th className="py-3 px-4">Periode Bulan</th>
                  <th className="py-3 px-4">Jumlah Setoran Sah</th>
                  <th className="py-3 px-4">Volume Terverifikasi</th>
                  <th className="py-3 px-4">Catatan Perlu Diperiksa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {monthlyRecap.map(([ym, data]) => (
                  <tr key={ym}>
                    <td className="py-3.5 px-4 font-bold text-ink">{ym}</td>
                    <td className="py-3.5 px-4">{data.count} Setoran</td>
                    <td className="py-3.5 px-4 font-bold text-forest">
                      {formatLiters(data.verifiedLiters)}
                    </td>
                    <td className="py-3.5 px-4">
                      {data.needCheckCount > 0 ? (
                        <span className="text-amber-800 font-semibold">
                          {data.needCheckCount} catatan
                        </span>
                      ) : (
                        <span className="text-ink-muted">0 catatan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
