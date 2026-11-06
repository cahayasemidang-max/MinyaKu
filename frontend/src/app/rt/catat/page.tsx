"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  ProofUploadField,
  RoleDeniedBanner,
  StatusBadge,
  formatLiters,
} from "@/components/ui";
import { CheckCircle2, Droplets, Eye, PlusCircle, RotateCcw } from "lucide-react";

const QUICK_VOLUMES = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0];

export default function RecordDonationFormPage() {
  const { currentUser, users, recordDeposit } = useApp();

  const [residentId, setResidentId] = useState<string>("");
  const [volumeStr, setVolumeStr] = useState<string>("1.5");
  const [notes, setNotes] = useState<string>("");
  const [proofFileName, setProofFileName] = useState<string>("");
  const [reviewStep, setReviewStep] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [savedVolume, setSavedVolume] = useState<number>(0);

  if (currentUser.role !== "ADMIN_RT") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Admin RT (Relawan Pencatat RT)"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rw"}
      />
    );
  }

  // Warga yang terdaftar di RT tempat Admin ini ditugaskan
  const rtResidents = users.filter(
    (u) => u.role === "WARGA" && u.rt === currentUser.rt && u.active
  );

  const selectedResident = rtResidents.find((r) => r.id === residentId);

  const handleProceedReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const vol = parseFloat(volumeStr);
    if (!residentId) {
      setErrorMsg("Pilih warga penyetor terlebih dahulu.");
      return;
    }
    if (Number.isNaN(vol) || vol <= 0) {
      setErrorMsg("Masukkan volume aktual (liter) lebih dari 0.");
      return;
    }
    if (!proofFileName.trim()) {
      setErrorMsg("Foto bukti penakaran setoran wajib dilampirkan.");
      return;
    }
    setReviewStep(true);
  };

  const handleConfirmSubmit = () => {
    if (isSubmitting) return; // FR-03: Mencegah pengiriman formulir ganda yang tidak disengaja
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = recordDeposit({
      residentId,
      volumeLiters: parseFloat(volumeStr),
      notes,
      proofFileName,
      status: "Terverifikasi", // Keputusan A3: Admin RT langsung memverifikasi saat mencatat
    });

    setIsSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.message);
      setReviewStep(false);
      return;
    }

    setSavedRecordId(res.record?.id || null);
    setSavedVolume(res.record?.volumeLiters || 0);
    setReviewStep(false);
    setVolumeStr("1.0");
    setNotes("");
    setProofFileName("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest">
          Titik Pengumpulan Tetap • {currentUser.rt}
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-forest mt-0.5">
          Catat Setoran Minyak Jelantah
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Alur cepat untuk relawan {currentUser.rt} (FR-03): Pilih warga →
          Masukkan volume aktual (L) → Lampirkan foto bukti wajib → Tinjau &
          Simpan (Langsung Terverifikasi).
        </p>
      </div>

      {/* Feedback Konfirmasi Sukses */}
      {savedRecordId && (
        <Card className="border-2 border-forest bg-sage/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-forest shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-forest">
                  Setoran {savedRecordId} Berhasil Disimpan!
                </h2>
                <p className="text-xs text-ink mt-0.5">
                  Volume <strong>{formatLiters(savedVolume)}</strong> telah
                  tercatat atas nama{" "}
                  <strong>{selectedResident?.name || "Warga"}</strong> dengan
                  status <StatusBadge status="Terverifikasi" />.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSavedRecordId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest text-white text-xs font-semibold shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Catat Berikutnya
            </button>
          </div>
        </Card>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tahap Tinjau Data Sebelum Simpan (FR-03 Langkah 4 & 5 + Anti Double-Submit) */}
      {reviewStep ? (
        <Card className="border-2 border-forest space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-line">
            <Eye className="w-5 h-5 text-forest" />
            <h2 className="text-base font-bold text-forest">
              Tinjau Catatan Sebelum Disimpan (FR-03)
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-cream/70 border border-line space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Warga Penyetor:</span>
              <span className="font-bold text-ink">
                {selectedResident?.name} ({currentUser.rt})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Volume Aktual:</span>
              <span className="font-bold text-forest text-base">
                {formatLiters(parseFloat(volumeStr))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Pencatat & Waktu Otomatis:</span>
              <span className="font-medium text-ink">
                {currentUser.name} • Sekarang
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Status Saat Disimpan:</span>
              <StatusBadge status="Terverifikasi" />
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Foto Bukti Wajib:</span>
              <span className="font-medium text-forest">{proofFileName}</span>
            </div>
            {notes && (
              <div className="flex justify-between">
                <span className="text-ink-muted">Catatan:</span>
                <span className="font-medium text-ink">{notes}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-ink-muted">
            Catatan yang telah diverifikasi tidak dapat diubah tanpa alasan jejak
            audit.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmSubmit}
              className="flex-1 py-3 rounded-xl bg-forest hover:bg-forest-dark disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting
                ? "Menyimpan..."
                : "Konfirmasi & Simpan Setoran Terverifikasi"}
            </button>
            <button
              type="button"
              onClick={() => setReviewStep(false)}
              className="px-4 py-3 rounded-xl border border-line text-xs sm:text-sm font-semibold text-ink hover:bg-cream"
            >
              Kembali Ubah Input
            </button>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleProceedReview} className="space-y-5">
            {/* 1. Pilih Warga */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                1. Pilih Warga Penyetor ({currentUser.rt}){" "}
                <span className="text-red-600">*</span>
              </label>
              {rtResidents.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  Belum ada akun warga terdaftar di {currentUser.rt}. Super Admin
                  RW dapat menambahkan warga di menu Data Warga & Admin, atau Anda
                  dapat mengaktifkan Mode Contoh Ilustratif di bar atas.
                </div>
              ) : (
                <select
                  required
                  value={residentId}
                  onChange={(e) => setResidentId(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="">-- Pilih Nama Warga {currentUser.rt} --</option>
                  {rtResidents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (@{r.username})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. Volume Aktual dalam Liter + Tombol Cepat untuk Kemudahan di HP */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                2. Volume Aktual Minyak Jelantah (Liter){" "}
                <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Droplets className="w-5 h-5 text-forest absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={volumeStr}
                    onChange={(e) => setVolumeStr(e.target.value)}
                    className="w-full rounded-xl border border-line pl-11 pr-16 py-3 text-lg font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                  <span className="absolute right-4 top-3.5 text-sm font-bold text-ink-muted">
                    Liter
                  </span>
                </div>
              </div>

              <div className="mt-2.5">
                <p className="text-[11px] font-medium text-ink-muted mb-1.5">
                  Tombol Cepat Takaran (Meminimalkan pengetikan di HP):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_VOLUMES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVolumeStr(String(v))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        parseFloat(volumeStr) === v
                          ? "bg-forest text-white border-forest"
                          : "bg-cream/60 text-ink border-line hover:bg-sage/50"
                      }`}
                    >
                      {v} L
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Foto Bukti Wajib */}
            <ProofUploadField
              label="3. Foto Bukti Takaran Setoran (Wajib)"
              value={proofFileName}
              onChange={setProofFileName}
              helperText="Ambil foto wadah/jeriken minyak saat ditakar di titik pengumpulan RT"
            />

            {/* 4. Catatan Opsional & Info Otomatis */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
                4. Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 2 botol kemasan, minyak sudah disaring bersih"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink"
              />
            </div>

            <div className="p-3 rounded-xl bg-cream/70 border border-line text-xs text-ink-muted flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>
                Pencatat Otomatis: <strong>{currentUser.name}</strong> (
                {currentUser.rt})
              </span>
              <span>Status: Langsung Terverifikasi</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
              Tinjau & Simpan Catatan Setoran
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}

