"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, RoleDeniedBanner } from "@/components/ui";
import { CheckCircle2, MapPin, Save } from "lucide-react";

export default function RTAdminProfilePage() {
  const { currentUser, collectionPoints, updateCollectionPoint } = useApp();

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

  if (currentUser.role !== "ADMIN_RT" || !currentUser.rt) {
    return (
      <RoleDeniedBanner
        allowedRoleText="Admin RT (Relawan Pencatat RT)"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rw"}
      />
    );
  }

  const handleSave = (e: React.FormEvent) => {
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

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Profil Relawan & Informasi Titik Pengumpulan {currentUser.rt}
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Kelola detail alamat sebenarnya dan petunjuk titik pengumpulan tetap{" "}
          {currentUser.rt} agar dapat dilihat oleh warga (FR-02).
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      <Card>
        <form onSubmit={handleSave} className="space-y-4">
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

