"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { RoleDeniedBanner, StatCard, formatLiters } from "@/components/ui";
import { OilTrendChart } from "@/components/CollectionCharts";
import { CheckCircle2, Clock, Droplets } from "lucide-react";

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Kontribusi Minyak Jelantah Saya
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Sesuai Aturan Bisnis #13, FR-05 & FR-15: Total kontribusi dan grafik
          tren hanya menjumlahkan setoran yang berstatus{" "}
          <strong>Terverifikasi</strong> dalam satuan Liter (L).
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

      {/* Grafik Tren Kontribusi Pribadi (Harian, Mingguan, Bulanan + Filter Rentang Tanggal) */}
      <OilTrendChart
        title="Grafik Tren Kontribusi Pribadi (Harian / Mingguan / Bulanan)"
        subtitle="Pantau perkembangan volume minyak jelantah terverifikasi yang telah Anda sedekahkan berdasarkan rentang tanggal."
        deposits={myDeposits}
      />
    </div>
  );
}
