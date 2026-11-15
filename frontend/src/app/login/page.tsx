"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui";
import { RTCode, UserAccount, UserRole } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  Droplets,
  Home,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DbUserPublic {
  id: number;
  username: string;
  nama_lengkap: string;
  role: UserRole;
  rt?: RTCode | null;
  no_hp?: string | null;
  is_first_login: boolean;
  saldo_rupiah: number;
  total_liter: number;
  active: boolean;
}

export default function LoginPage() {
  const { setAuthenticatedSession } = useApp();
  const router = useRouter();

  const [dbUsers, setDbUsers] = useState<DbUserPublic[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("B713");
  const [credential, setCredential] = useState<string>("");

  // State khusus tahap 2 (Pembuatan PIN perdana setelah verifikasi Nama Depan KK)
  const [pendingSetupToken, setPendingSetupToken] = useState<string | null>(
    null
  );
  const [pendingUser, setPendingUser] = useState<DbUserPublic | null>(null);
  const [newPin, setNewPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const fetchDbUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (res.ok) {
        const data: DbUserPublic[] = await res.json();
        setDbUsers(data);
      }
    } catch {
      // Backend might not be running yet
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchDbUsers();
  }, []);

  const matchedAccount = dbUsers.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );

  const mapDbUserToAppUser = (u: DbUserPublic, pinVal?: string): UserAccount => ({
    id: `DB-${u.id}`,
    username: u.username,
    name: u.nama_lengkap,
    role: u.role,
    rt: u.rt ?? undefined,
    phone: u.no_hp || "-",
    active: u.active,
    pin: pinVal || "terautentikasi-jwt",
    privacyShowNameInLeaderboard: true,
    createdAt: new Date().toISOString(),
  });

  const redirectByRole = (role: UserRole) => {
    if (role === "WARGA") router.push("/warga");
    else if (role === "ADMIN_RT") router.push("/rt");
    else router.push("/rw");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          credential: credential.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Gagal melakukan login.");
        return;
      }

      if (data.requires_pin_setup && data.setup_token) {
        setPendingSetupToken(data.setup_token);
        setPendingUser(data.user);
        setInfoMsg(data.message);
        setNewPin("");
        setConfirmPin("");
        return;
      }

      if (data.access_token && data.user) {
        const appUser = mapDbUserToAppUser(data.user, credential.trim());
        setAuthenticatedSession(appUser, data.access_token);
        redirectByRole(data.user.role);
      }
    } catch {
      setErrorMsg(
        "Tidak dapat terhubung ke server Backend FastAPI (http://localhost:8000). Pastikan backend sedang berjalan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetupPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSetupToken || !pendingUser) return;

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/setup-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pendingSetupToken}`,
        },
        body: JSON.stringify({
          new_pin: newPin.trim(),
          confirm_pin: confirmPin.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Gagal menyimpan PIN baru.");
        return;
      }

      if (data.access_token && data.user) {
        const appUser = mapDbUserToAppUser(data.user, newPin.trim());
        setAuthenticatedSession(appUser, data.access_token);
        redirectByRole(data.user.role);
      }
    } catch {
      setErrorMsg("Gagal menghubungi server Backend saat menyimpan PIN.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full py-2 sm:py-4 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <Card className="p-6 sm:p-8 xl:col-span-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-forest">
                Masuk ke MinyaKu (Jelantah Berkah)
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted">
                Terhubung langsung ke tabel <code>public.users</code> Supabase +
                Autentikasi JWT
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage text-forest text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            JWT Auth + Supabase Live
          </span>
        </div>

        {errorMsg && (
          <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mt-5 p-3.5 rounded-xl bg-sage/50 border border-forest/30 text-forest text-xs sm:text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {infoMsg}
          </div>
        )}

        {/* TAHAP 2: Form Buat PIN Baru (Khusus Warga & Relawan saat Login Pertama) */}
        {pendingSetupToken && pendingUser ? (
          <form onSubmit={handleSetupPinSubmit} className="mt-6 space-y-5">
            <div className="p-4 rounded-xl bg-sage/40 border border-forest/30 space-y-3">
              <div className="flex items-start gap-2.5">
                <KeyRound className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-forest">
                    Tahap 2: Buat PIN Pribadi Anda ({pendingUser.nama_lengkap})
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Verifikasi login pertama untuk akun{" "}
                    <strong>{pendingUser.username}</strong> (
                    {pendingUser.role === "WARGA"
                      ? `Warga ${pendingUser.rt}`
                      : `Relawan ${pendingUser.rt}`}
                    ) berhasil. Silakan buat PIN pribadi Anda untuk digunakan
                    pada login berikutnya.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    PIN Baru <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={3}
                    placeholder="Minimal 3 karakter/angka"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Konfirmasi PIN Baru <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={3}
                    placeholder="Ulangi PIN baru..."
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setPendingSetupToken(null);
                  setPendingUser(null);
                  setInfoMsg(null);
                  setErrorMsg(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-line text-ink-muted hover:text-ink text-xs font-semibold"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60"
              >
                <UserCheck className="w-4 h-4" />
                {submitting
                  ? "Menyimpan PIN ke Supabase..."
                  : "Simpan PIN & Masuk ke Aplikasi"}
              </button>
            </div>
          </form>
        ) : (
          /* TAHAP 1: Form Login Utama */
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                1. Nomor Rumah / Username Akun
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: B713, ADMIN_RT02, atau SUPERADMIN_RW"
                  className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              {matchedAccount && (
                <div className="mt-2 p-2.5 rounded-xl bg-cream/70 border border-line flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-forest">
                      {matchedAccount.nama_lengkap}
                    </span>{" "}
                    <span className="text-ink-muted">
                      ({matchedAccount.role}
                      {matchedAccount.rt ? ` — ${matchedAccount.rt}` : ""})
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                      matchedAccount.role === "SUPER_ADMIN_RW"
                        ? "bg-forest text-white"
                        : matchedAccount.is_first_login
                        ? "bg-amber-100 text-amber-900"
                        : "bg-sage text-forest"
                    }`}
                  >
                    {matchedAccount.role === "SUPER_ADMIN_RW"
                      ? "Super Admin (Tanpa Setup PIN)"
                      : matchedAccount.is_first_login
                      ? "Login Pertama: Gunakan Nama Depan KK"
                      : "Sudah Aktif: Gunakan PIN Pribadi"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                2.{" "}
                {matchedAccount?.role === "SUPER_ADMIN_RW"
                  ? "Password Super Admin RW"
                  : matchedAccount?.is_first_login
                  ? "Password Awal (Nama Depan Kepala Keluarga)"
                  : "PIN Pribadi / Password Awal"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder={
                    matchedAccount?.is_first_login
                      ? "Masukkan Nama Depan KK (misal: Budi)"
                      : "Masukkan PIN atau Password..."
                  }
                  className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
              <p className="text-[11px] text-ink-muted mt-1">
                {matchedAccount?.role === "SUPER_ADMIN_RW"
                  ? "Super Admin RW langsung masuk tanpa perlu membuat PIN baru."
                  : matchedAccount?.is_first_login
                  ? "Karena akun ini baru pertama kali login, masukkan Nama Depan Kepala Keluarga (tidak peka huruf besar/kecil)."
                  : "Masukkan PIN pribadi yang sudah Anda buat (atau Nama Depan KK jika belum pernah login)."}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60"
            >
              <UserCheck className="w-4 h-4" />
              {submitting
                ? "Memverifikasi ke Server..."
                : matchedAccount?.is_first_login &&
                  matchedAccount?.role !== "SUPER_ADMIN_RW"
                ? "Verifikasi Nama Depan KK & Lanjut Buat PIN"
                : "Masuk dengan JWT"}
            </button>
          </form>
        )}
      </Card>

      {/* Panel Daftar Akun Live dari Tabel public.users Supabase untuk Kemudahan Uji Coba */}
      <Card className="xl:col-span-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-forest">
              Daftar Akun di Supabase (<code>public.users</code>)
            </h2>
            <p className="text-[11px] text-ink-muted">
              Klik salah satu akun di bawah untuk mengisi Nomor Rumah/Username
              secara cepat
            </p>
          </div>
          <button
            type="button"
            onClick={fetchDbUsers}
            className="p-2 rounded-lg border border-line hover:bg-cream text-forest"
            title="Muat ulang dari Supabase"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingUsers ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 text-xs">
          {dbUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setPendingSetupToken(null);
                setPendingUser(null);
                setErrorMsg(null);
                setInfoMsg(null);
                setUsername(u.username);
                setCredential("");
              }}
              className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                username.toLowerCase() === u.username.toLowerCase()
                  ? "bg-sage/50 border-forest"
                  : "bg-cream/40 border-line hover:bg-cream"
              }`}
            >
              <div>
                <div className="font-bold text-ink flex items-center gap-1.5">
                  <code>{u.username}</code>
                  <span>— {u.nama_lengkap}</span>
                </div>
                <div className="text-[11px] text-ink-muted mt-0.5">
                  Role: <strong>{u.role}</strong>{" "}
                  {u.rt ? `(${u.rt})` : "(Tingkat RW)"} | Liter:{" "}
                  <strong>{u.total_liter} L</strong> | Saldo:{" "}
                  <strong>Rp {u.saldo_rupiah.toLocaleString("id-ID")}</strong>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                  u.role === "SUPER_ADMIN_RW"
                    ? "bg-forest text-white"
                    : u.is_first_login
                    ? "bg-amber-100 text-amber-900"
                    : "bg-sage text-forest"
                }`}
              >
                {u.role === "SUPER_ADMIN_RW"
                  ? "Tetap"
                  : u.is_first_login
                  ? "Login Pertama"
                  : "Sudah Punya PIN"}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
