"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui";
import { RTCode, UserAccount, UserRole } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  Delete,
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
  // Untuk layar HP: step 1 = buat PIN 6 digit, step 2 = konfirmasi ulang 6 digit
  const [mobileSetupStep, setMobileSetupStep] = useState<"CREATE" | "CONFIRM">(
    "CREATE"
  );
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

  const redirectByRole = useCallback(
    (role: UserRole) => {
      if (role === "WARGA") router.push("/warga");
      else if (role === "ADMIN_RT") router.push("/rt");
      else router.push("/rw");
    },
    [router]
  );

  // Fungsi eksekusi login (dipakai baik oleh form Laptop maupun auto-submit 6 digit di HP)
  const executeLogin = useCallback(
    async (targetUser: string, secretValue: string) => {
      setErrorMsg(null);
      setInfoMsg(null);
      setSubmitting(true);

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: targetUser.trim(),
            credential: secretValue.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(
            data.detail ||
              "Nomor Rumah / Username atau Password/PIN tidak sesuai."
          );
          if (boundAccount) {
            setCredential("");
          }
          return;
        }

        if (data.requires_pin_setup && data.setup_token) {
          setPendingSetupToken(data.setup_token);
          setPendingUser(data.user);
          setInfoMsg(data.message);
          setNewPin("");
          setConfirmPin("");
          setMobileSetupStep("CREATE");
          return;
        }

        if (data.access_token && data.user) {
          saveBoundAccount(data.user);
          const appUser = mapDbUserToAppUser(data.user, secretValue.trim());
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
    },
    [boundAccount, redirectByRole, setAuthenticatedSession]
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsername = boundAccount
      ? boundAccount.username
      : username.trim();
    await executeLogin(targetUsername, credential);
  };

  // Fungsi simpan PIN baru (dipakai oleh form Laptop maupun auto-submit 6 digit di HP)
  const executeSetupPin = useCallback(
    async (pin1: string, pin2: string) => {
      if (!pendingSetupToken || !pendingUser) return;

      setErrorMsg(null);

      if (!/^\d{6}$/.test(pin1.trim())) {
        setErrorMsg("PIN harus terdiri dari tepat 6 digit angka (0-9).");
        return;
      }

      if (pin1.trim() !== pin2.trim()) {
        setErrorMsg("Konfirmasi PIN 6 digit tidak cocok. Silakan ulangi.");
        setConfirmPin("");
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
            new_pin: pin1.trim(),
            confirm_pin: pin2.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.detail || "Gagal menyimpan PIN baru.");
          return;
        }

        if (data.access_token && data.user) {
          saveBoundAccount(data.user);
          const appUser = mapDbUserToAppUser(data.user, pin1.trim());
          setAuthenticatedSession(appUser, data.access_token);
          redirectByRole(data.user.role);
        }
      } catch {
        setErrorMsg("Gagal menghubungi server saat menyimpan PIN.");
      } finally {
        setSubmitting(false);
      }
    },
    [pendingSetupToken, pendingUser, redirectByRole, setAuthenticatedSession]
  );

  const handleSetupPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSetupPin(newPin, confirmPin);
  };

  // Handler Numpad Bank Jago untuk Layar HP (ketika akun sudah terikat / boundAccount)
  const handleMobileLoginDigit = (digit: string) => {
    if (submitting || !boundAccount) return;
    setErrorMsg(null);
    const nextVal = (credential + digit).slice(0, 6);
    setCredential(nextVal);
    if (nextVal.length === 6) {
      executeLogin(boundAccount.username, nextVal);
    }
  };

  const handleMobileLoginBackspace = () => {
    if (submitting) return;
    setCredential((prev) => prev.slice(0, -1));
  };

  // Handler Numpad Bank Jago untuk Layar HP saat Buat & Konfirmasi PIN 6 Digit
  const handleMobileSetupDigit = (digit: string) => {
    if (submitting) return;
    setErrorMsg(null);

    if (mobileSetupStep === "CREATE") {
      const nextVal = (newPin + digit).slice(0, 6);
      setNewPin(nextVal);
      if (nextVal.length === 6) {
        // Otomatis pindah ke langkah Konfirmasi PIN seperti Bank Jago
        setTimeout(() => {
          setMobileSetupStep("CONFIRM");
        }, 180);
      }
    } else {
      const nextVal = (confirmPin + digit).slice(0, 6);
      setConfirmPin(nextVal);
      if (nextVal.length === 6) {
        executeSetupPin(newPin, nextVal);
      }
    }
  };

  const handleMobileSetupBackspace = () => {
    if (submitting) return;
    if (mobileSetupStep === "CREATE") {
      setNewPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  // Komponen Numpad & Bulatan 6 Digit ala Bank Jago (Khusus Layar HP / Mobile < md)
  const renderBankJagoMobilePad = (
    currentValue: string,
    onDigitPress: (d: string) => void,
    onBackspace: () => void,
    subtitle: string
  ) => {
    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    return (
      <div className="md:hidden mt-5 flex flex-col items-center select-none">
        <p className="text-xs font-semibold text-ink-muted mb-4 text-center">
          {subtitle}
        </p>

        {/* 6 Bulatan Indikator PIN ala Bank Jago */}
        <div className="flex items-center justify-center gap-3.5 my-2">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const filled = idx < currentValue.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  filled
                    ? "bg-forest scale-110 shadow-sm"
                    : "bg-sage border-2 border-forest/40"
                }`}
              />
            );
          })}
        </div>

        {submitting && (
          <p className="text-xs font-semibold text-forest mt-2 animate-pulse">
            Memverifikasi PIN...
          </p>
        )}

        {/* Grid Tombol Angka Numpad Bank Jago */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-7 mt-6 w-full max-w-[270px]">
          {digits.map((d) => (
            <button
              key={d}
              type="button"
              disabled={submitting}
              onClick={() => onDigitPress(d)}
              className="w-16 h-16 mx-auto rounded-full bg-cream/60 hover:bg-sage/70 active:bg-forest active:text-white border border-line text-xl font-bold text-ink flex items-center justify-center transition shadow-sm"
            >
              {d}
            </button>
          ))}

          {/* Baris Bawah: Kosong / Ulang, 0, Hapus */}
          <div className="flex items-center justify-center">
            {pendingSetupToken && mobileSetupStep === "CONFIRM" ? (
              <button
                type="button"
                onClick={() => {
                  setMobileSetupStep("CREATE");
                  setNewPin("");
                  setConfirmPin("");
                  setErrorMsg(null);
                }}
                className="text-[11px] font-semibold text-forest underline"
              >
                Ulangi
              </button>
            ) : null}
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={() => onDigitPress("0")}
            className="w-16 h-16 mx-auto rounded-full bg-cream/60 hover:bg-sage/70 active:bg-forest active:text-white border border-line text-xl font-bold text-ink flex items-center justify-center transition shadow-sm"
          >
            0
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={onBackspace}
            aria-label="Hapus digit terakhir"
            className="w-16 h-16 mx-auto rounded-full hover:bg-sage/40 active:bg-sage text-ink flex items-center justify-center transition"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[82dvh] w-full flex items-center justify-center py-4 sm:py-6 px-2">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-sm">
          {/* Header Identitas Aplikasi */}
          <div className="flex flex-col items-center text-center pb-5 border-b border-line">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-forest text-white flex items-center justify-center shadow-sm mb-2.5 p-3">
              <Droplets className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-forest">
              Jelantah Berkah
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Platform Pengelolaan Minyak Jelantah & Program Sosial RW
            </p>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-sage/50 border border-forest/30 text-forest text-xs sm:text-sm font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ================================================================
              LAYAR 2: SET PIN 6 DIGIT (Saat Warga / Relawan Pertama Kali Aktif)
             ================================================================ */}
          {pendingSetupToken && pendingUser ? (
            <div>
              <div className="mt-5 p-3.5 rounded-xl bg-sage/30 border border-forest/20 flex items-start gap-2.5">
                <KeyRound className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-bold text-forest">
                    {mobileSetupStep === "CREATE"
                      ? "Buat PIN 6 Digit Anda"
                      : "Konfirmasi PIN 6 Digit Anda"}
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Akun <strong>{pendingUser.nama_lengkap}</strong> (
                    <code>{pendingUser.username}</code>) terverifikasi.
                  </p>
                </div>
              </div>

              {/* TAMPILAN HP (< md): Bulatan PIN + Numpad Angka ala Bank Jago */}
              {renderBankJagoMobilePad(
                mobileSetupStep === "CREATE" ? newPin : confirmPin,
                handleMobileSetupDigit,
                handleMobileSetupBackspace,
                mobileSetupStep === "CREATE"
                  ? "Tekan 6 angka untuk membuat PIN baru Anda"
                  : "Masukkan ulang 6 angka PIN yang baru saja Anda buat"
              )}

              {/* TAMPILAN LAPTOP (>= md): Form Input Standar Tanpa Bulatan */}
              <form
                onSubmit={handleSetupPinSubmit}
                className="hidden md:block mt-5 space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
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
                      placeholder="Ketik 6 digit angka"
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
                  <label className="block text-sm font-semibold text-ink mb-1.5">
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
            </div>
          ) : boundAccount ? (
            /* ================================================================
               LAYAR 1A: AKUN SUDAH TERIKAT DI PERANGKAT (1 Rumah 1 Akun)
               - Di HP (< md): Bulatan PIN + Numpad Bank Jago (Auto-Submit)
               - Di Laptop (>= md): Kotak Input Standar Tanpa Bulatan
               ================================================================ */
            <div className="mt-5">
              <div className="p-3.5 rounded-xl bg-cream/70 border border-line text-center">
                <p className="text-xs text-ink-muted">Selamat datang kembali,</p>
                <p className="text-base font-bold text-forest mt-0.5">
                  {boundAccount.nama_lengkap}
                </p>
                <p className="text-xs font-medium text-ink-muted mt-0.5">
                  Nomor Rumah / ID: <strong>{boundAccount.username}</strong>
                  {boundAccount.rt ? ` • ${boundAccount.rt}` : ""}
                </p>
              </div>

              {/* TAMPILAN HP (< md): Numpad Bank Jago Tanpa Ketik Keyboard */}
              {renderBankJagoMobilePad(
                credential,
                handleMobileLoginDigit,
                handleMobileLoginBackspace,
                "Masukkan 6 digit PIN Anda"
              )}

              {/* TAMPILAN LAPTOP (>= md): Kotak Input Standar */}
              <form
                onSubmit={handleLoginSubmit}
                className="hidden md:block mt-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">
                    PIN Anda
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                    <input
                      type={showCredential ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={credential}
                      onChange={(e) =>
                        setCredential(
                          e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                      }
                      placeholder="Ketik 6 digit PIN Anda"
                      className="w-full rounded-xl border border-line bg-white pl-10 pr-10 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCredential((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-ink-muted hover:text-ink"
                      tabIndex={-1}
                    >
                      {showCredential ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
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
            </div>
          ) : (
            /* ================================================================
               LAYAR 1B: PERTAMA KALI BUKA DI PERANGKAT (Input Nomor Rumah + Password Awal)
               ================================================================ */
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
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

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                  Password / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type={showCredential ? "text" : "password"}
                    required
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="Masukkan Nama Depan KK atau PIN"
                    className="w-full rounded-xl border border-line bg-white pl-10 pr-10 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredential((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-ink-muted hover:text-ink"
                    tabIndex={-1}
                    aria-label="Tampilkan atau sembunyikan Password"
                  >
                    {showCredential ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-ink-muted mt-1.5 leading-relaxed">
                  Pengguna baru: masukkan{" "}
                  <strong>Nama Depan Kepala Keluarga</strong> untuk lanjut
                  membuat PIN 6 digit.
                </p>
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
