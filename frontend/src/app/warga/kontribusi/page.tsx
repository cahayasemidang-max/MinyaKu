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
import { BarChart3, CheckCircle2, Clock, Droplets } from "lucide-react";

export default function ResidentContributionPage() {
  const { currentUser, deposits } = useApp();

  if (currentUser.role !== "WARGA") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Warga"
        switchHref={currentUser.role === "ADMIN_RT" ? "/rt" : "/rw"}
      />
    );
  }

  const myDeposits = deposits.filter((d) => d.residentId === currentUser.id);
  const verifiedDeposits = myDeposits.filter(
    (d) => d.status === "Terverifikasi"
  );
  const unverifiedDeposits = myDeposits.filter(
    (d) => d.status !== "Terverifikasi"
  );

  const totalVerifiedLiters = verifiedDeposits.reduce(
    (acc, d) => acc + d.volumeLiters,
    0
  );
  const totalUnverifiedLiters = unverifiedDeposits.reduce(
    (acc, d) => acc + d.volumeLiters,
    0
  );

  // Rekap tren per bulan (hanya dari setoran Terverifikasi sesuai FR-05)
  const monthlyMap = new Map<string, number>();
  verifiedDeposits.forEach((d) => {
    const ym = d.recordedAt.slice(0, 7); // YYYY-MM
    monthlyMap.set(ym, (monthlyMap.get(ym) || 0) + d.volumeLiters);
  });

  const monthlyTrend = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, liters]) => ({
      month,
      liters: Number(liters.toFixed(2)),
    }));

  const maxMonthLiters = Math.max(...monthlyTrend.map((m) => m.liters), 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Kontribusi Minyak Jelantah Saya
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Sesuai Aturan Bisnis #13 & FR-05: Total kontribusi final hanya
          menjumlahkan setoran yang berstatus <strong>Terverifikasi</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          highlight
          label="Total Kontribusi Sah (Terverifikasi)"
          value={formatLiters(totalVerifiedLiters)}
          subtext={`Dari ${verifiedDeposits.length} setoran terverifikasi`}
          icon={<Droplets className="w-5 h-5" />}
        />
        <StatCard
          label="Belum Dihitung ke Kontribusi Final"
          value={formatLiters(totalUnverifiedLiters)}
          subtext={`${unverifiedDeposits.length} setoran berstatus Baru / Perlu diperiksa`}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Rata-rata per Setoran Terverifikasi"
          value={
            verifiedDeposits.length > 0
              ? formatLiters(totalVerifiedLiters / verifiedDeposits.length)
              : "0,0 L"
          }
          subtext={`Titik pengumpulan ${currentUser.rt}`}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Tren Kontribusi per Periode */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-forest" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Tren Kontribusi Terverifikasi per Bulan
            </h2>
            <p className="text-xs text-ink-muted">
              Visualisasi volume minyak jelantah terverifikasi yang telah Anda
              sedekahkan
            </p>
          </div>
        </div>

        {monthlyTrend.length === 0 ? (
          <EmptyState
            title="Belum Ada Data Tren Kontribusi"
            description="Tren bulanan akan muncul setelah Anda memiliki setoran berstatus Terverifikasi."
          />
        ) : (
          <div className="space-y-3">
            {monthlyTrend.map((item) => {
              const pct = Math.min(
                100,
                Math.round((item.liters / maxMonthLiters) * 100)
              );
              return (
                <div key={item.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-ink">
                      Periode {item.month}
                    </span>
                    <span className="font-bold text-forest">
                      {formatLiters(item.liters)}
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
        )}
      </Card>
    </div>
  );
}

