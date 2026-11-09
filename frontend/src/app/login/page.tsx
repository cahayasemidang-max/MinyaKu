"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui";
import {
  AlertCircle,
  Droplets,
  KeyRound,
  Lock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function LoginPage() {
  const {
    users,
    currentUser,
    authenticateWithPin,
    createSelfPin,
    isIllustrativeMode,
    toggleDataMode,
  } = useApp();
  const router = useRouter();

  const [selectedUserId, setSelectedUserId] = useState(currentUser.id);
  const [pinInput, setPinInput] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedAccount =
    users.find((u) => u.id === selectedUserId) || users[0];

  // FR-01: Warga, Admin RT, dan Super Admin membuat PIN sendiri untuk akun yang telah terdaftar
  const needsSelfPinCreation = selectedAccount && !selectedAccount.pin;

  useEffect(() => {
    setErrorMsg(null);
    if (selectedAccount?.pin) {
      setPinInput(selectedAccount.pin);
    } else {
      setPinInput("");
      setConfirmNewPin("");
    }
  }, [selectedUserId, selectedAccount?.pin]);

  const handleLoginOrCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedAccount) return;

    if (needsSelfPinCreation) {
      if (!pinInput.trim()) {
        setErrorMsg(
          "Masukkan PIN baru Anda (bebas kombinasi karakter dan angka)."
        );
        return;
      }
      if (pinInput !== confirmNewPin) {
        setErrorMsg("Konfirmasi PIN baru tidak cocok.");
        return;
      }
      const res = createSelfPin(selectedAccount.id, pinInput);
      if (!res.ok) {
        setErrorMsg(res.message);
        return;
      }
      if (selectedAccount.role === "WARGA") router.push("/warga");
      else if (selectedAccount.role === "ADMIN_RT") router.push("/rt");
      else router.push("/rw");
      return;
    }

    const res = authenticateWithPin(selectedAccount.id, pinInput);
    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    if (selectedAccount.role === "WARGA") router.push("/warga");
    else if (selectedAccount.role === "ADMIN_RT") router.push("/rt");
    else router.push("/rw");
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
                Masuk ke Jelantah Berkah
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted">
                Seluruh akun telah terdaftar di database (Tanpa registrasi
                publik — FR-01)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage text-forest text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Autentikasi PIN per Role (FR-01)
          </span>
        </div>

        {errorMsg && (
          <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginOrCreatePin} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-2">
              1. Pilih Identitas Akun Terdaftar (Warga / 7 Admin RT / 1 Super
              Admin RW)
            </label>
            <select
              value={selectedAccount?.id || ""}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <optgroup label="Super Admin Tingkat RW (1 Akun)">
                {users
                  .filter((u) => u.role === "SUPER_ADMIN_RW")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username}){" "}
                      {!u.pin ? "— [Belum Buat PIN Sendiri]" : ""}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Relawan Admin RT (7 Akun: RT 01 - RT 07)">
                {users
                  .filter((u) => u.role === "ADMIN_RT")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.rt}] {u.name} (@{u.username}){" "}
                      {!u.pin ? "— [Belum Buat PIN Sendiri]" : ""}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Warga Terdaftar">
                {users
                  .filter((u) => u.role === "WARGA")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.rt}] {u.name} (@{u.username}){" "}
                      {!u.pin ? "— [Belum Buat PIN Sendiri]" : ""}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Kondisi FR-01: Jika Warga, Admin RT, atau Super Admin belum membuat PIN */}
          {needsSelfPinCreation ? (
            <div className="p-4 rounded-xl bg-sage/40 border border-forest/30 space-y-4">
              <div className="flex items-start gap-2.5">
                <KeyRound className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-forest">
                    Buat PIN Pribadi Anda (FR-01)
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Akun <strong>{selectedAccount.name}</strong> telah terdaftar
                    di database tetapi belum memiliki PIN. Sesuai ketentuan{" "}
                    <strong>
                      {selectedAccount.role === "WARGA"
                        ? "Warga"
                        : selectedAccount.role === "ADMIN_RT"
                        ? `Admin ${selectedAccount.rt}`
                        : "Super Admin RW"}
                    </strong>
                    , silakan buat PIN pribadi Anda sendiri (bebas kombinasi
                    huruf, angka, atau karakter).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Buat PIN Baru <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: BerkahRT01#"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Konfirmasi PIN Baru <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ulangi PIN baru..."
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-ink">
                  2. Masukkan PIN Akun (Bebas Karakter & Angka)
                </label>
                {selectedAccount?.pin && (
                  <span className="text-[11px] text-forest font-semibold">
                    PIN Aktif Saat Ini: <code>{selectedAccount.pin}</code>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  required
                  placeholder="Masukkan PIN akun..."
                  className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
              <p className="text-[11px] text-ink-muted mt-1">
                Untuk kemudahan simulasi prototipe, PIN akun yang dipilih sudah
                terisi otomatis. Anda juga dapat memilih akun bertanda{" "}
                <strong>[Belum Buat PIN Sendiri]</strong> untuk menguji alur
                pembuatan PIN perdana.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            {needsSelfPinCreation
              ? "Simpan PIN Pribadi & Masuk ke Aplikasi"
              : "Validasi PIN & Masuk Sesuai Peran"}
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
              Jika Mode Data Kosong dipilih, akun warga contoh dihapus dan hanya
              tersisa 1 Super Admin + 7 Admin RT.
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

      {/* Ringkasan Ketentuan PIN FR-01 */}
      <Card className="xl:col-span-5">
        <h2 className="text-sm font-bold text-forest mb-2">
          Ketentuan Autentikasi PIN Berdasarkan Peran (FR-01 PRD)
        </h2>
        <div className="grid grid-cols-1 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="font-bold text-ink">1. Warga</p>
            <p className="text-ink-muted mt-1">
              Warga membuat PIN sendiri untuk akun yang telah terdaftar di
              database, digunakan untuk login, dan dapat diganti kapan saja di
              halaman Profil.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="font-bold text-ink">2. Admin RT (7 Akun)</p>
            <p className="text-ink-muted mt-1">
              Admin RT membuat PIN sendiri untuk akun yang telah terdaftar di
              database, digunakan untuk login, dan dapat diganti di menu Profil.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-cream/60 border border-line">
            <p className="font-bold text-ink">3. Super Admin RW (1 Akun)</p>
            <p className="text-ink-muted mt-1">
              Super Admin membuat PIN sendiri untuk akun yang telah terdaftar
              dan digunakan untuk mengakses seluruh fitur pengelolaan RW.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
