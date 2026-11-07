"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, RoleDeniedBanner } from "@/components/ui";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  MapPin,
  Save,
} from "lucide-react";

export default function RTAdminProfilePage() {
  const {
    currentUser,
    collectionPoints,
    updateCollectionPoint,
    changeOwnPin,
  } = useApp();

  const myPoint = collectionPoints.find((cp) => cp.rt === currentUser.rt);

  const [pointName, setPointName] = useState(myPoint?.pointName || "");
  const [address, setAddress] = useState(myPoint?.address || "");
  const [operatingHours, setOperatingHours] = useState(
    myPoint?.operatingHours || ""
  );
  const [instructions, setInstructions] = useState(myPoint?.instructions || "");
  const [coordinatorName, setCoordinatorName] = useState(
    myPoint?.coordinatorName || currentUser.name
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  // State Ganti PIN Admin RT (FR-01)
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  if (currentUser.role !== "ADMIN_RT" || !currentUser.rt) {
    return (
      <RoleDeniedBanner
        allowedRoleText="Admin RT (Relawan Pencatat RT)"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rw"}
      />
    );
  }

  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.rt) return;
    const res = updateCollectionPoint(currentUser.rt, {
      pointName,
      address,
      operatingHours,
      instructions,
      coordinatorName,
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
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Profil Relawan, PIN & Titik Pengumpulan {currentUser.rt}
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Kelola detail alamat titik pengumpulan tetap {currentUser.rt} (FR-02)
          serta kelola/ganti PIN pribadi Anda (FR-01).
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Ganti PIN Admin RT (FR-01) */}
      <Card>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-forest" />
            <div>
              <h2 className="text-base font-bold text-forest">
                Pengaturan / Ganti PIN Akun Admin {currentUser.rt} (FR-01)
              </h2>
              <p className="text-xs text-ink-muted">
                Admin RT membuat dan mengelola PIN sendiri (bebas campuran huruf
                & angka) untuk login ke aplikasi.
              </p>
            </div>
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
            Perbarui PIN Admin {currentUser.rt}
          </button>
        </form>
      </Card>

      {/* Form Informasi Titik Pengumpulan RT */}
      <Card>
        <h2 className="text-base font-bold text-forest mb-4">
          Informasi Titik Pengumpulan {currentUser.rt}
        </h2>
        <form onSubmit={handleSavePoint} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Akun Relawan Admin
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (@${currentUser.username})`}
                className="w-full rounded-xl border border-line bg-cream/60 px-3.5 py-2 text-sm text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Wilayah Penugasan RT
              </label>
              <input
                type="text"
                disabled
                value={currentUser.rt}
                className="w-full rounded-xl border border-line bg-cream/60 px-3.5 py-2 text-sm font-bold text-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">
              Nama Titik Pengumpulan {currentUser.rt}
            </label>
            <input
              type="text"
              required
              value={pointName}
              onChange={(e) => setPointName(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">
              Alamat Sebenarnya Titik Pengumpulan (Diisi Pengelola — FR-02)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Masukkan alamat nyata titik pengumpulan RT ini..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-line pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">
              Jam Operasional / Aturan Kunjungan (Tanpa Booking)
            </label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-ink mb-1">
              Petunjuk Penyerahan Minyak Jelantah
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs sm:text-sm font-semibold transition"
          >
            <Save className="w-4 h-4" />
            Simpan Informasi Titik {currentUser.rt}
          </button>
        </form>
      </Card>
    </div>
  );
}
