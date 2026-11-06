"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Card, RoleDeniedBanner } from "@/components/ui";
import {
  CheckCircle2,
  Clock,
  Droplets,
  HeartHandshake,
  Info,
  MapPin,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function CollectionPointInfoPage() {
  const { currentUser, collectionPoints } = useApp();

  if (currentUser.role !== "WARGA") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Warga"
        switchHref={currentUser.role === "ADMIN_RT" ? "/rt" : "/rw"}
      />
    );
  }

  const myPoint = collectionPoints.find((cp) => cp.rt === currentUser.rt);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Setor Minyak Jelantah — Titik Pengumpulan {currentUser.rt}
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Halaman informasi lokasi tetap & panduan penyerahan langsung (Tanpa
          pemesanan jadwal atau permintaan penjemputan — FR-02 & Aturan Bisnis #4)
        </p>
      </div>

      {/* Kartu Informasi Utama Titik Pengumpulan RT */}
      <Card className="border-2 border-forest/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-forest text-white">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest">
                Titik Pengumpulan Tetap Anda
              </span>
              <h2 className="text-lg font-bold text-ink">
                {myPoint?.pointName || `Titik Pengumpulan ${currentUser.rt}`}
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage text-forest text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Datang Kapan Saja (Tanpa Booking)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="text-xs font-semibold text-ink-muted">
              Alamat Titik Pengumpulan {currentUser.rt}
            </p>
            <p className="text-sm font-bold text-ink mt-1">
              {myPoint?.address ? (
                myPoint.address
              ) : (
                <span className="text-amber-800 font-medium">
                  Alamat resmi belum ditetapkan oleh pengelola RT/RW.
                </span>
              )}
            </p>
            <p className="text-[11px] text-ink-muted mt-1">
              Sesuai FR-02: Alamat sebenarnya diisi oleh pengelola, sistem tidak
              membuat alamat fiktif.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="text-xs font-semibold text-ink-muted">
              Aturan Waktu Kunjungan
            </p>
            <p className="text-sm font-bold text-ink mt-1">
              {myPoint?.operatingHours ||
                "Fleksibel — Tidak memerlukan reservasi slot waktu"}
            </p>
            <p className="text-[11px] text-ink-muted mt-1">
              Warga membawa minyak sendiri langsung ke lokasi RT.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="text-xs font-semibold text-ink-muted">
              Relawan Pencatat ({currentUser.rt})
            </p>
            <p className="text-sm font-bold text-ink mt-1 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-forest" />
              {myPoint?.coordinatorName || `Relawan Admin ${currentUser.rt}`}
            </p>
            <p className="text-[11px] text-ink-muted mt-1">
              Relawan akan menakar volume aktual (liter) dan memfoto bukti setoran.
            </p>
          </div>
        </div>
      </Card>

      {/* Panduan 4 Langkah Penyerahan Minyak Jelantah */}
      <Card>
        <h2 className="text-base font-bold text-forest mb-3">
          Panduan Penyerahan Sedekah Minyak Jelantah
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-cream/50 border border-line">
            <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm font-bold text-ink mt-2.5">
              Dinginkan & Saring
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Pastikan minyak bekas menggoreng sudah dingin dan disaring dari sisa
              remah makanan atau air.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cream/50 border border-line">
            <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm font-bold text-ink mt-2.5">
              Gunakan Wadah Tertutup
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Tuang ke dalam botol plastik atau jeriken bersih yang tertutup rapat
              agar tidak tumpah di perjalanan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cream/50 border border-line">
            <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm font-bold text-ink mt-2.5">
              Bawa ke Titik {currentUser.rt}
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Datang langsung ke titik pengumpulan {currentUser.rt} tanpa perlu
              memesan jadwal terlebih dahulu.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cream/50 border border-line">
            <span className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="text-sm font-bold text-ink mt-2.5">
              Penakaran & Verifikasi
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Relawan Admin {currentUser.rt} mengukur liter aktual, mengambil foto
              bukti, dan mencatatnya langsung sebagai Terverifikasi.
            </p>
          </div>
        </div>
      </Card>

      {/* Catatan Aturan Program */}
      <Card className="bg-sage/30">
        <div className="flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-forest shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <p className="font-bold text-forest">
              Ketentuan Lingkup Program Jelantah Berkah
            </p>
            <ul className="list-disc list-inside text-ink-muted space-y-1">
              <li>
                <strong>Hanya Minyak Jelantah:</strong> Titik pengumpulan tidak
                menerima plastik, kertas, kardus, besi, atau barang daur ulang lain.
              </li>
              <li>
                <strong>Murni Sedekah Warga:</strong> Warga tidak menerima
                pembayaran uang atau saldo finansial. Seluruh dana hasil penyerahan
                ke Dinas Kebersihan Kota Bekasi digunakan untuk membeli paket
                sembako seragam bagi satpam RW.
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

