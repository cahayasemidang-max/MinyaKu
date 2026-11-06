"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui";
import { CheckCircle2, Droplets, Lock, ShieldCheck, UserCheck } from "lucide-react";

export default function LoginPage() {
  const { users, currentUser, setCurrentUserById, isIllustrativeMode, toggleDataMode } =
    useApp();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState(currentUser.id);
  const [pin, setPin] = useState("123456");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const target = users.find((u) => u.id === selectedUserId);
    if (!target) return;
    setCurrentUserById(target.id);
    if (target.role === "WARGA") router.push("/warga");
    else if (target.role === "ADMIN_RT") router.push("/rt");
    else router.push("/rw");
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-forest">
                Masuk ke Jelantah Berkah
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted">
                Platform Sedekah Minyak Jelantah & Program Sembako Lingkungan RW (7 RT)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage text-forest text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Akses Berbasis Peran (FR-01)
          </span>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
              Pilih Akun Terdaftar (Warga / 7 Admin RT / 1 Super Admin RW)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <optgroup label="Super Admin Tingkat RW (1 Akun)">
                {users
                  .filter((u) => u.role === "SUPER_ADMIN_RW")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Relawan Admin RT (7 Akun: RT 01 - RT 07)">
                {users
                  .filter((u) => u.role === "ADMIN_RT")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.rt}] {u.name} (@{u.username})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Warga Penyetor">
                {users
                  .filter((u) => u.role === "WARGA")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.rt}] {u.name} (@{u.username})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
              PIN / Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              Untuk prototipe frontend ini, PIN contoh sudah terisi otomatis.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            Masuk dan Buka Halaman Sesuai Peran
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink">
              Mode Data Saat Ini:{" "}
              <span className="text-forest">
                {isIllustrativeMode
                  ? "Data Contoh Ilustratif Berlabel"
                  : "Data Kosong (Tanpa Data Fiktif)"}
              </span>
            </p>
            <p className="text-[11px] text-ink-muted">
              Jika Mode Data Kosong dipilih, akun warga contoh dihapus dan hanya tersisa 1 Super Admin + 7 Admin RT.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleDataMode(!isIllustrativeMode)}
            className="px-3.5 py-2 rounded-xl border border-forest text-forest hover:bg-sage/50 text-xs font-semibold shrink-0"
          >
            {isIllustrativeMode
              ? "Gunakan Seed Kosong Murni"
              : "Gunakan Contoh Ilustratif"}
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-forest mb-2">
          Ringkasan Hak Akses Tiga Peran Pengguna (Bab 5 PRD)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="font-bold text-ink">1. Warga</p>
            <p className="text-ink-muted mt-1">
              Melihat lokasi titik pengumpulan RT terkait, panduan setor langsung tanpa booking, riwayat setoran pribadi, total liter terverifikasi, dan leaderboard. Tidak ada saldo uang.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="font-bold text-ink">2. Admin RT (7 Akun)</p>
            <p className="text-ink-muted mt-1">
              Mencatat setoran aktual (liter) + foto bukti wajib untuk RT yang ditugaskan. Langsung berstatus Terverifikasi saat dicatat. Tidak dapat mengakses RT lain atau dana.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="font-bold text-ink">3. Super Admin RW (1 Akun)</p>
            <p className="text-ink-muted mt-1">
              Memantau 7 RT, mencatat serah terima ke Dinas Kebersihan Kota Bekasi, dana diterima, pembelian sembako, 1 komposisi paket standar, distribusi ke satpam, dan laporan.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

