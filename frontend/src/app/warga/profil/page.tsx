"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, RoleDeniedBanner } from "@/components/ui";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Save,
  Shield,
  User,
} from "lucide-react";

export default function ResidentProfilePage() {
  const { currentUser, updateResidentProfile, changeOwnPin } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [showInLeaderboard, setShowInLeaderboard] = useState(
    currentUser.privacyShowNameInLeaderboard ?? true
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  // State Ganti PIN (FR-01)
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  if (currentUser.role !== "WARGA") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Warga"
        switchHref={currentUser.role === "ADMIN_RT" ? "/rt" : "/rw"}
      />
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateResidentProfile({
      name,
      phone,
      privacyShowNameInLeaderboard: showInLeaderboard,
    });
    if (res.ok) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (newPin !== confirmPin) {
      setPinError("Konfirmasi PIN baru tidak cocok.");
      return;
    }
    const res = changeOwnPin(currentPin, newPin);
    if (!res.ok) {
      setPinError(res.message);
      return;
    }
    setFeedback(res.message);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Profil, Privasi & Pengaturan PIN Warga
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Kelola informasi profil, pengaturan privasi nama pada Leaderboard, dan
          ganti PIN pribadi Anda (Bab 5.1 & FR-01 PRD).
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <Card>
        <h2 className="text-base font-bold text-forest mb-4">
          Informasi Profil & Privasi
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                ID Akun Warga Terdaftar
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.id} (@${currentUser.username})`}
                className="w-full rounded-xl border border-line bg-cream/60 px-3.5 py-2 text-sm text-ink-muted"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Titik Pengumpulan RT Terkait (Ditetapkan Admin)
              </label>
              <input
                type="text"
                disabled
                value={currentUser.rt || "-"}
                className="w-full rounded-xl border border-line bg-cream/60 px-3.5 py-2 text-sm font-bold text-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-line pl-10 pr-4 py-2 text-sm text-ink"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">
              Nomor Telepon / WhatsApp (Opsional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm text-ink"
            />
          </div>

          <div className="p-4 rounded-xl bg-cream/60 border border-line">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showInLeaderboard}
                onChange={(e) => setShowInLeaderboard(e.target.checked)}
                className="mt-1 rounded border-line text-forest focus:ring-forest"
              />
              <div>
                <span className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-forest" />
                  Tampilkan nama saya pada Leaderboard Warga
                </span>
                <p className="text-xs text-ink-muted mt-0.5">
                  Jika dinonaktifkan, nama Anda pada tabel Leaderboard umum akan
                  disamarkan menjadi &ldquo;Hamba Allah / Warga {currentUser.rt}
                  &rdquo; untuk menjaga privasi.
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs sm:text-sm font-semibold transition"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Profil
          </button>
        </form>
      </Card>

      {/* Fitur Ganti PIN Warga (FR-01) */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="w-5 h-5 text-forest" />
          <div>
            <h2 className="text-base font-bold text-forest">
              Pengaturan / Ganti PIN Akun Warga (FR-01)
            </h2>
            <p className="text-xs text-ink-muted">
              Warga dapat membuat dan mengganti PIN sendiri (bebas kombinasi
              karakter & angka).
            </p>
          </div>
        </div>

        {pinError && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {pinError}
          </div>
        )}

        <form onSubmit={handleChangePin} className="space-y-3">
          {currentUser.pin && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                PIN Saat Ini <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan PIN saat ini..."
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                PIN Baru (Bebas Karakter & Angka){" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Masukkan PIN baru..."
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Konfirmasi PIN Baru <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Ulangi PIN baru..."
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs sm:text-sm font-semibold transition"
          >
            <KeyRound className="w-4 h-4" />
            Perbarui PIN Saya
          </button>
        </form>
      </Card>
      </div>
    </div>
  );
}
