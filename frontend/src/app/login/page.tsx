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
  Eye,
  EyeOff,
  HelpCircle,
  Home,
  KeyRound,
  Lock,
  UserCheck,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const BOUND_ACCOUNT_STORAGE_KEY = "minyaku_bound_account";

interface BoundAccountInfo {
  username: string;
  nama_lengkap: string;
  role: UserRole;
  rt?: RTCode | null;
}

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

  const [boundAccount, setBoundAccount] = useState<BoundAccountInfo | null>(
    null
  );
  const [username, setUsername] = useState<string>("");
  const [credential, setCredential] = useState<string>("");
  const [showCredential, setShowCredential] = useState<boolean>(false);

  // State khusus Tahap 2 (Set PIN 6 Digit ala Bank Jago saat pertama kali aktif)
  const [pendingSetupToken, setPendingSetupToken] = useState<string | null>(
    null
  );
  const [pendingUser, setPendingUser] = useState<DbUserPublic | null>(null);
  const [newPin, setNewPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [showNewPin, setShowNewPin] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedBound = localStorage.getItem(BOUND_ACCOUNT_STORAGE_KEY);
      if (savedBound) {
        const parsed: BoundAccountInfo = JSON.parse(savedBound);
        if (parsed?.username) {
          setBoundAccount(parsed);
          setUsername(parsed.username);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveBoundAccount = (user: DbUserPublic) => {
    const info: BoundAccountInfo = {
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      rt: user.rt,
    };
    setBoundAccount(info);
    try {
      localStorage.setItem(BOUND_ACCOUNT_STORAGE_KEY, JSON.stringify(info));
    } catch {
      // ignore storage errors
    }
  };

  const mapDbUserToAppUser = (
    u: DbUserPublic,
    pinVal?: string
  ): UserAccount => ({
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

    const targetUsername = boundAccount
      ? boundAccount.username
      : username.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetUsername,
          credential: credential.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.detail || "Nomor Rumah / Username atau Password/PIN tidak sesuai."
        );
        return;
      }

      // Jika Warga / Relawan baru pertama kali login (pakai Nama Depan KK) -> Lanjut Set PIN
      if (data.requires_pin_setup && data.setup_token) {
        setPendingSetupToken(data.setup_token);
        setPendingUser(data.user);
        setInfoMsg(data.message);
        setNewPin("");
        setConfirmPin("");
        return;
      }

      // Login berhasil -> Simpan sesi JWT & ikat perangkat ke akun ini
      if (data.access_token && data.user) {
        saveBoundAccount(data.user);
        const appUser = mapDbUserToAppUser(data.user, credential.trim());
        setAuthenticatedSession(appUser, data.access_token);
        redirectByRole(data.user.role);
      }
    } catch {
      setErrorMsg(
        "Tidak dapat terhubung ke server. Pastikan layanan backend sedang berjalan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetupPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSetupToken || !pendingUser) return;

    setErrorMsg(null);

    if (!/^\d{6}$/.test(newPin.trim())) {
      setErrorMsg("PIN harus terdiri dari tepat 6 digit angka (0-9).");
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setErrorMsg("Konfirmasi PIN 6 digit tidak cocok.");
      return;
    }

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
        saveBoundAccount(data.user);
        const appUser = mapDbUserToAppUser(data.user, newPin.trim());
        setAuthenticatedSession(appUser, data.access_token);
        redirectByRole(data.user.role);
      }
    } catch {
      setErrorMsg("Gagal menghubungi server saat menyimpan PIN.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[82dvh] w-full flex items-center justify-center py-6 px-2">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-sm">
          {/* Header Identitas Aplikasi */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-line">
            <div className="w-14 h-14 rounded-2xl bg-forest text-white flex items-center justify-center shadow-sm mb-3">
              <Droplets className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-forest">
              Jelantah Berkah
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Platform Pengelolaan Minyak Jelantah & Program Sosial RW
            </p>
          </div>

          {errorMsg && (
            <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mt-5 p-3.5 rounded-xl bg-sage/50 border border-forest/30 text-forest text-xs sm:text-sm font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* LAYAR 2: Set PIN 6 Digit (Khusus Warga & Relawan saat Pertama Kali Masuk) */}
          {pendingSetupToken && pendingUser ? (
            <form onSubmit={handleSetupPinSubmit} className="mt-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-sage/30 border border-forest/20 flex items-start gap-2.5">
                <KeyRound className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-bold text-forest">
                    Buat PIN 6 Digit Anda
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Akun <strong>{pendingUser.nama_lengkap}</strong> (
                    <code>{pendingUser.username}</code>) berhasil diverifikasi.
                    Tetapkan 6 digit angka PIN untuk masuk ke aplikasi
                    selanjutnya.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                  PIN 6 Digit Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type={showNewPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="Masukkan 6 digit angka"
                    className="w-full rounded-xl border border-line bg-white pl-10 pr-10 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-ink-muted hover:text-ink"
                    tabIndex={-1}
                  >
                    {showNewPin ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                  Konfirmasi PIN 6 Digit
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type={showNewPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="Ketik ulang 6 digit angka"
                    className="w-full rounded-xl border border-line bg-white pl-10 pr-10 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60"
              >
                <UserCheck className="w-4 h-4" />
                {submitting ? "Menyimpan PIN..." : "Simpan PIN & Masuk"}
              </button>
            </form>
          ) : (
            /* LAYAR 1: Form Login Utama */
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              {boundAccount ? (
                /* Tampilan jika perangkat sudah terikat ke 1 akun rumah (Gaya Bank Jago) */
                <div className="p-4 rounded-xl bg-cream/70 border border-line text-center">
                  <p className="text-xs text-ink-muted">Selamat datang kembali,</p>
                  <p className="text-base font-bold text-forest mt-0.5">
                    {boundAccount.nama_lengkap}
                  </p>
                  <p className="text-xs font-medium text-ink-muted mt-0.5">
                    ID / Nomor Rumah: <strong>{boundAccount.username}</strong>
                    {boundAccount.rt ? ` • ${boundAccount.rt}` : ""}
                  </p>
                </div>
              ) : (
                /* Tampilan jika pertama kali buka di perangkat ini */
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                    Nomor Rumah / Username
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Contoh: B713"
                      className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                  {boundAccount ? "PIN Anda" : "PIN / Password"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type={showCredential ? "text" : "password"}
                    required
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder={
                      boundAccount
                        ? "Masukkan 6 digit PIN Anda"
                        : "Masukkan PIN atau Password awal"
                    }
                    className="w-full rounded-xl border border-line bg-white pl-10 pr-10 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredential((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-ink-muted hover:text-ink"
                    tabIndex={-1}
                    aria-label="Tampilkan atau sembunyikan PIN/Password"
                  >
                    {showCredential ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {!boundAccount && (
                  <p className="text-[11px] text-ink-muted mt-1.5 leading-relaxed">
                    Bagi pengguna yang baru pertama kali masuk, gunakan{" "}
                    <strong>Nama Depan Kepala Keluarga</strong> sebagai password
                    awal untuk membuat PIN.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60"
              >
                <UserCheck className="w-4 h-4" />
                {submitting ? "Memproses..." : "Masuk"}
              </button>
            </form>
          )}

          {/* Informasi Bantuan Lupa PIN */}
          <div className="mt-6 pt-4 border-t border-line flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
            <HelpCircle className="w-3.5 h-3.5 text-forest shrink-0" />
            <span>Lupa PIN? Hubungi Admin RT atau Pengurus RW.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
