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
  ArrowRight,
  Award,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  History,
  Info,
  MapPin,
} from "lucide-react";

export default function ResidentDashboardPage() {
  const { currentUser, deposits, collectionPoints } = useApp();

  if (currentUser.role !== "WARGA") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Warga"
        switchHref={currentUser.role === "ADMIN_RT" ? "/rt" : "/rw"}
      />
    );
  }

  // Warga hanya melihat data dan grafik kontribusi pribadinya (FR-15 & Bab 10.2)
  const myDeposits = deposits.filter((d) => d.residentId === currentUser.id);
  const myVerifiedLiters = myDeposits
    .filter((d) => d.status === "Terverifikasi")
    .reduce((acc, d) => acc + d.volumeLiters, 0);

  const pendingOrCheckCount = myDeposits.filter(
    (d) => d.status !== "Terverifikasi"
  ).length;

  const myPoint = collectionPoints.find((cp) => cp.rt === currentUser.rt);

  return (
    <div className="space-y-5">
      {/* Hero Banner Warga */}
      <div className="bg-forest text-white rounded-card p-5 sm:p-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-sage text-xs font-semibold">
              <HeartHandshake className="w-3.5 h-3.5" />
              Sedekah Minyak Jelantah • {currentUser.rt}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mt-2">
              Halo, {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-cream/90 mt-1 max-w-2xl">
              Setiap tetes minyak jelantah yang Anda sedekahkan di titik
              pengumpulan <strong>{currentUser.rt}</strong> diserahkan ke Dinas
              Kebersihan Kota Bekasi untuk diwujudkan menjadi paket sembako
              seragam bagi satpam lingkungan RW kita.
            </p>
          </div>
          <Link
            href="/warga/setor"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cream text-forest font-bold text-xs sm:text-sm hover:bg-white transition shrink-0"
          >
            <MapPin className="w-4 h-4" />
            Lihat Lokasi & Cara Setor
          </Link>
        </div>
      </div>

      {/* Ringkasan Kontribusi Pribadi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          highlight
          label="Total Kontribusi Terverifikasi"
          value={formatLiters(myVerifiedLiters)}
          subtext="Hanya menghitung setoran berstatus Terverifikasi"
          icon={<Droplets className="w-5 h-5" />}
        />
        <StatCard
          label="Frekuensi Setoran Saya"
          value={`${myDeposits.length} Kali`}
          subtext={
            pendingOrCheckCount > 0
              ? `${pendingOrCheckCount} catatan perlu diperiksa/baru`
              : "Seluruh catatan sudah terverifikasi"
          }
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <StatCard
          label="Titik Pengumpulan Default"
          value={currentUser.rt || "-"}
          subtext={
            myPoint?.address
              ? myPoint.address
              : "Alamat pasti menunggu pengisian pengelola"
          }
          icon={<MapPin className="w-5 h-5" />}
        />
      </div>

      {/* Grafik Tren Kontribusi Pribadi Warga (FR-15 & Bab 10.2) */}
      <OilTrendChart
        title="Grafik Tren Kontribusi Minyak Jelantah Saya (Liter)"
        subtitle="Menampilkan perkembangan sedekah minyak jelantah pribadi Anda yang telah Terverifikasi berdasarkan periode Harian, Mingguan, atau Bulanan."
        deposits={myDeposits}
      />

      {/* Info Titik Pengumpulan Singkat & Aksi Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-forest">
                Titik Pengumpulan {currentUser.rt}
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sage text-forest">
                Tanpa Perlu Booking Jadwal
              </span>
            </div>
            <div className="mt-3 p-3.5 rounded-xl bg-cream/60 border border-line space-y-1.5 text-xs sm:text-sm">
              <p className="font-semibold text-ink">
                {myPoint?.pointName || `Titik Pengumpulan ${currentUser.rt}`}
              </p>
              <p className="text-ink-muted">
                <strong>Alamat:</strong>{" "}
                {myPoint?.address ? (
                  myPoint.address
                ) : (
                  <span className="italic text-amber-800">
                    Belum diisi oleh pengelola RT/RW (Sesuai PRD: Tidak
                    mengarang alamat fiktif)
                  </span>
                )}
              </p>
              <p className="text-ink-muted">
                <strong>Waktu Layanan:</strong>{" "}
                {myPoint?.operatingHours || "Datang langsung kapan saja"}
              </p>
              <p className="text-ink-muted">
                <strong>Relawan Pencatat:</strong>{" "}
                {myPoint?.coordinatorName || `Relawan Admin ${currentUser.rt}`}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              Bawa minyak sendiri ke lokasi RT
            </span>
            <Link
              href="/warga/setor"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline"
            >
              Panduan Penyerahan Lengkap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Menu Cepat Warga
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Pantau jejak sedekah minyak jelantah Anda secara transparan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
              <Link
                href="/warga/riwayat"
                className="p-3 rounded-xl border border-line hover:border-forest hover:bg-sage/30 transition flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-sage text-forest">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Riwayat Setoran</p>
                  <p className="text-[11px] text-ink-muted">
                    Detail waktu, liter & bukti
                  </p>
                </div>
              </Link>

              <Link
                href="/warga/kontribusi"
                className="p-3 rounded-xl border border-line hover:border-forest hover:bg-sage/30 transition flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-sage text-forest">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Kontribusi Saya</p>
                  <p className="text-[11px] text-ink-muted">
                    Tren kontribusi per periode
                  </p>
                </div>
              </Link>

              <Link
                href="/warga/leaderboard"
                className="p-3 rounded-xl border border-line hover:border-forest hover:bg-sage/30 transition flex items-center gap-3 sm:col-span-2"
              >
                <div className="p-2 rounded-lg bg-sage text-forest">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">
                    Leaderboard Sedekah Warga
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Apresiasi warga berdasarkan total liter terverifikasi
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-sage/40 text-[11px] text-forest flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Minyak jelantah adalah sedekah murni (tidak ada pengembalian
              uang/saldo kepada warga).
            </span>
          </div>
        </Card>
      </div>

      {/* Setoran Terbaru Warga */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Setoran Terbaru Saya
            </h2>
            <p className="text-xs text-ink-muted">
              Dicatat langsung oleh relawan Admin {currentUser.rt} di titik
              pengumpulan
            </p>
          </div>
          <Link
            href="/warga/riwayat"
            className="text-xs font-bold text-forest hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        {myDeposits.length === 0 ? (
          <EmptyState
            title="Belum Ada Catatan Setoran"
            description="Anda dapat membawa minyak jelantah yang sudah disaring langsung ke titik pengumpulan RT Anda kapan saja."
          />
        ) : (
          <div className="divide-y divide-line">
            {myDeposits.slice(0, 4).map((dep) => (
              <div
                key={dep.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-forest">
                      {dep.id}
                    </span>
                    <StatusBadge status={dep.status} />
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    {new Date(dep.recordedAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    • Dicatat oleh {dep.recordedByName}
                  </p>
                  {dep.notes && (
                    <p className="text-xs text-ink mt-0.5">{dep.notes}</p>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="text-base font-bold text-forest">
                    {formatLiters(dep.volumeLiters)}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Bukti: {dep.proofFileName}
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
