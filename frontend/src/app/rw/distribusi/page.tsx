"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  ProofUploadField,
  RoleDeniedBanner,
  StatCard,
} from "@/components/ui";
import {
  CheckCircle2,
  FileImage,
  HeartHandshake,
  Package,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

export default function GroceryDistributionPage() {
  const {
    currentUser,
    distributions,
    packageComposition,
    metrics,
    recordGroceryDistribution,
  } = useApp();

  const [distributionDate, setDistributionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [location, setLocation] = useState("Pos Keamanan Utama RW");
  const [packageCountStr, setPackageCountStr] = useState("1");
  const [recipientNote, setRecipientNote] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (currentUser.role !== "SUPER_ADMIN_RW") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Super Admin RW"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rt"}
      />
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const count = parseInt(packageCountStr, 10);
    if (Number.isNaN(count) || count <= 0) {
      setErrorMsg("Jumlah paket harus minimal 1 paket.");
      return;
    }

    const res = recordGroceryDistribution({
      distributionDate,
      location,
      packageCount: count,
      recipientNote,
      proofFileName,
      notes,
    });

    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    setFeedback(res.message);
    setPackageCountStr("1");
    setRecipientNote("");
    setProofFileName("");
    setNotes("");
    setTimeout(() => setFeedback(null), 4000);
  };

  const totalPreparedLifetime =
    metrics.maxCompletePackagesAvailable + metrics.totalPackagesDistributed;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Distribusi Paket Sembako Seragam kepada Satpam (FR-12)
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Setiap satpam menerima 1 paket sembako dengan komposisi yang sama
          (Aturan Bisnis #9 & #10). Jumlah distribusi tidak boleh melebihi paket
          lengkap yang tersedia.
        </p>
      </div>

      {/* Ringkasan Paket Disiapkan, Didistribusikan, dan Tersisa (FR-12) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          label="Total Paket Lengkap Pernah Disiapkan"
          value={`${totalPreparedLifetime} Paket`}
          subtext="Akumulasi kapasitas paket dari stok"
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          label="Total Paket Sudah Didistribusikan"
          value={`${metrics.totalPackagesDistributed} Paket`}
          subtext={`Diserahkan kepada ${metrics.totalPackagesDistributed} satpam`}
          icon={<HeartHandshake className="w-5 h-5" />}
        />
        <StatCard
          highlight
          label="Paket Lengkap Tersisa (Siap Salur)"
          value={`${metrics.maxCompletePackagesAvailable} Paket`}
          subtext="Batas maksimum yang dapat didistribusikan saat ini"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Form Pencatatan Distribusi Sembako */}
      <Card>
        <h2 className="text-base font-bold text-forest mb-2">
          Catat Distribusi Paket Sembako kepada Satpam
        </h2>
        <div className="p-3 rounded-xl bg-cream/70 border border-line text-xs mb-4">
          <span className="font-bold text-forest">
            Komposisi Standar Aktif (1 Paket = 1 Satpam):{" "}
          </span>
          {packageComposition.length === 0 ? (
            <span className="text-amber-800">
              Belum ditetapkan. Atur terlebih dahulu di menu Paket Standar &
              Stok.
            </span>
          ) : (
            <span>
              {packageComposition
                .map(
                  (c) => `${c.itemName} (${c.quantityPerPackage} ${c.unit})`
                )
                .join(" + ")}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Tanggal Distribusi <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={distributionDate}
                onChange={(e) => setDistributionDate(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Lokasi Penyerahan <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Jumlah Paket / Jumlah Satpam Penerima (Maks:{" "}
                {metrics.maxCompletePackagesAvailable}){" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={Math.max(1, metrics.maxCompletePackagesAvailable)}
                required
                value={packageCountStr}
                onChange={(e) => setPackageCountStr(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm font-bold text-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Keterangan Penerima Satpam / Regu Jaga{" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 2 petugas satpam regu jaga malam RW (masing-masing 1 paket seragam)"
              value={recipientNote}
              onChange={(e) => setRecipientNote(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
            />
          </div>

          <ProofUploadField
            label="Foto Bukti Penyerahan Paket Sembako ke Satpam (Wajib)"
            value={proofFileName}
            onChange={setProofFileName}
          />

          <div>
            <label className="block text-xs font-semibold mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={metrics.maxCompletePackagesAvailable <= 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition"
          >
            <PlusCircle className="w-4 h-4" />
            Simpan Distribusi Paket Sembako
          </button>
        </form>
      </Card>

      {/* Riwayat Distribusi Historis */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line">
          <h2 className="text-sm sm:text-base font-bold text-forest">
            Riwayat Distribusi Paket Sembako kepada Satpam
          </h2>
        </div>

        {distributions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Belum Ada Catatan Distribusi"
              description="Distribusi paket sembako seragam kepada satpam akan tercatat di sini."
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {distributions.map((d) => (
              <div key={d.id} className="p-4 sm:p-5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-forest text-sm">
                      {d.id}
                    </span>
                    <span className="text-xs text-ink-muted ml-2">
                      • {d.distributionDate} • {d.location}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-ink mt-1">
                      Penerima: {d.recipientNote}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-sage text-forest text-xs font-bold">
                      {d.packageCount} Paket Seragam ({d.recipientCount} Satpam)
                    </span>
                    <p className="text-xs text-forest font-medium mt-1 flex items-center sm:justify-end gap-1">
                      <FileImage className="w-3.5 h-3.5" />
                      {d.proofFileName}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-ink-muted">
                  Snapshot komposisi saat diserahkan:{" "}
                  {d.compositionSnapshot
                    .map(
                      (c) =>
                        `${c.itemName} (${c.quantityPerPackage} ${c.unit}/paket)`
                    )
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

