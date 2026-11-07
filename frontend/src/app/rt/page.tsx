"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  RoleDeniedBanner,
  StatCard,
  StatusBadge,
  formatLiters,
} from "@/components/ui";
import { OilTrendChart } from "@/components/CollectionCharts";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  Droplets,
  PlusCircle,
} from "lucide-react";

export default function RTAdminDashboardPage() {
  const { currentUser, deposits } = useApp();

  if (currentUser.role !== "ADMIN_RT") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Admin RT (Relawan Pencatat RT)"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rw"}
      />
    );
  }

  // FR-06, FR-15 & Aturan Bisnis #5: Admin RT hanya mengakses data & grafik RT yang ditugaskan
  const rtDeposits = deposits.filter((d) => d.rt === currentUser.rt);

  const totalVerifiedLiters = rtDeposits
    .filter((d) => d.status === "Terverifikasi")
    .reduce((acc, d) => acc + d.volumeLiters, 0);

  const todayPrefix = new Date().toISOString().slice(0, 10);
  const todayDepositsCount = rtDeposits.filter((d) =>
    d.recordedAt.startsWith(todayPrefix)
  ).length;

  const needCheckDeposits = rtDeposits.filter(
    (d) => d.status === "Perlu diperiksa"
  );

  return (
    <div className="space-y-5">
      {/* Banner Utama & Aksi Cepat Catat Setoran Baru */}
      <div className="bg-forest text-white rounded-card p-5 sm:p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-sage">
              Dashboard Operasional • {currentUser.rt}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mt-2">
              {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-cream/90 mt-1">
              Fokus pencatatan volume aktual minyak jelantah warga di titik
              pengumpulan <strong>{currentUser.rt}</strong>.
            </p>
          </div>

          <Link
            href="/rt/catat"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-cream text-forest font-bold text-sm hover:bg-white transition shadow-sm shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Catat Setoran Baru
          </Link>
        </div>
      </div>

      {/* KPI RT Terkait */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          highlight
          label={`Total Volume Terverifikasi (${currentUser.rt})`}
          value={formatLiters(totalVerifiedLiters)}
          subtext={`Dari ${
            rtDeposits.filter((d) => d.status === "Terverifikasi").length
          } catatan terverifikasi`}
          icon={<Droplets className="w-5 h-5" />}
        />
        <StatCard
          label="Catatan Setoran Hari Ini"
          value={`${todayDepositsCount} Setoran`}
          subtext={`Tanggal ${todayPrefix}`}
          icon={<CalendarCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Catatan Perlu Diperiksa"
          value={`${needCheckDeposits.length} Catatan`}
          subtext={
            needCheckDeposits.length > 0
              ? "Segera tinjau di halaman Riwayat"
              : "Tidak ada catatan bermasalah"
          }
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* Grafik Tren Pengumpulan Khusus RT Ini (FR-15 & Bab 10.2) */}
      <OilTrendChart
        title={`Grafik Tren Pengumpulan Minyak Jelantah ${currentUser.rt} (Liter)`}
        subtitle={`Menampilkan volume pengumpulan berstatus Terverifikasi khusus untuk wilayah tanggung jawab ${currentUser.rt} (Harian, Mingguan, Bulanan).`}
        deposits={rtDeposits}
      />

      {/* Peringatan Catatan Perlu Diperiksa bila ada */}
      {needCheckDeposits.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                Catatan yang Perlu Diperiksa ({needCheckDeposits.length})
              </h2>
              <p className="text-xs text-amber-900 mt-0.5">
                Terdapat catatan setoran di {currentUser.rt} yang memerlukan
                pengecekan ulang takaran atau bukti foto.
              </p>
            </div>
            <Link
              href="/rt/riwayat"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold shrink-0"
            >
              Periksa Sekarang <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      )}

      {/* Setoran Terbaru di RT ini */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Setoran Terbaru di {currentUser.rt}
            </h2>
            <p className="text-xs text-ink-muted">
              Hanya menampilkan data warga {currentUser.rt} sesuai batas
              otorisasi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/rt/rekap"
              className="text-xs font-semibold text-forest hover:underline flex items-center gap-1"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Rekap RT
            </Link>
            <Link
              href="/rt/riwayat"
              className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
            >
              <ClipboardCheck className="w-3.5 h-3.5" /> Semua Riwayat
            </Link>
          </div>
        </div>

        {rtDeposits.length === 0 ? (
          <EmptyState
            title={`Belum Ada Catatan Pengumpulan di ${currentUser.rt}`}
            description="Gunakan tombol 'Catat Setoran Baru' ketika warga datang menyerahkan minyak jelantah."
            action={
              <Link
                href="/rt/catat"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                Catat Setoran Pertama
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-line">
            {rtDeposits.slice(0, 5).map((dep) => (
              <div
                key={dep.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-forest">
                      {dep.id}
                    </span>
                    <span className="text-xs font-semibold text-ink">
                      • {dep.residentName}
                    </span>
                    <StatusBadge status={dep.status} />
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {new Date(dep.recordedAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    • Bukti: {dep.proofFileName}
                  </p>
                  {dep.notes && (
                    <p className="text-xs text-ink mt-0.5">{dep.notes}</p>
                  )}
                </div>

                <div className="sm:text-right">
                  <p className="text-base font-bold text-forest">
                    {formatLiters(dep.volumeLiters)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
