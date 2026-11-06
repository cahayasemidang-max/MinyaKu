"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  ProofUploadField,
  RoleDeniedBanner,
  StatCard,
  formatLiters,
  formatRp,
} from "@/components/ui";
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  FileImage,
  PlusCircle,
  Truck,
} from "lucide-react";

export default function AgencyHandoverRecordsPage() {
  const {
    currentUser,
    handovers,
    metrics,
    recordAgencyHandover,
    confirmHandoverFundReceived,
  } = useApp();

  const [handoverDate, setHandoverDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [volumeStr, setVolumeStr] = useState("");
  const [fundStatus, setFundStatus] = useState<
    "Belum Diterima" | "Sudah Diterima"
  >("Sudah Diterima");
  const [fundReceivedStr, setFundReceivedStr] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [stockWarningModal, setStockWarningModal] = useState(false);

  // State konfirmasi dana susulan jika saat penyerahan dana belum diterima (FR-08)
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmAmountStr, setConfirmAmountStr] = useState("");
  const [confirmDate, setConfirmDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [confirmProof, setConfirmProof] = useState("");
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

  const submitHandover = (forceOverride: boolean) => {
    setErrorMsg(null);
    const vol = parseFloat(volumeStr);
    const rp = fundStatus === "Sudah Diterima" ? parseFloat(fundReceivedStr) : 0;

    if (Number.isNaN(vol) || vol <= 0) {
      setErrorMsg("Masukkan volume penyerahan aktual (liter) lebih dari 0.");
      return;
    }

    if (vol > metrics.remainingRecordedVolume && !forceOverride) {
      setStockWarningModal(true);
      return;
    }

    const res = recordAgencyHandover({
      handoverDate,
      volumeLiters: vol,
      fundStatus,
      fundReceivedRp: Number.isNaN(rp) ? 0 : rp,
      proofFileName,
      notes,
      forceOverrideStockWarning: forceOverride,
    });

    setStockWarningModal(false);
    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    setFeedback(res.message);
    setVolumeStr("");
    setFundReceivedStr("");
    setProofFileName("");
    setNotes("");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleConfirmFund = (id: string) => {
    const amount = parseFloat(confirmAmountStr);
    const res = confirmHandoverFundReceived(
      id,
      amount,
      confirmDate,
      confirmProof
    );
    if (!res.ok) {
      alert(res.message);
      return;
    }
    setFeedback(res.message);
    setConfirmingId(null);
    setConfirmAmountStr("");
    setConfirmProof("");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Penyerahan Minyak ke Dinas Kebersihan Kota Bekasi
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Catat volume aktual yang diserahkan ke Dinas Kebersihan Kota Bekasi
          dan dana yang benar-benar diterima (FR-08 & Aturan Bisnis #8).
        </p>
      </div>

      {/* Ringkasan Stok & Serah Terima */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          highlight
          label="Sisa Stok Minyak Siap Diserahkan"
          value={formatLiters(metrics.remainingRecordedVolume)}
          subtext={`Dari total ${formatLiters(
            metrics.totalVerifiedVolumeAllRT
          )} terverifikasi`}
          icon={<Truck className="w-5 h-5" />}
        />
        <StatCard
          label="Total Volume Telah Diserahkan"
          value={formatLiters(metrics.totalHandedOverVolume)}
          subtext={`${handovers.length} transaksi berita acara dinas`}
        />
        <StatCard
          label="Total Dana Diterima dari Dinas"
          value={formatRp(
            handovers
              .filter((h) => h.fundStatus === "Sudah Diterima")
              .reduce((acc, h) => acc + h.fundReceivedRp, 0)
          )}
          subtext="Hanya menghitung yang berstatus Sudah Diterima"
          icon={<Coins className="w-5 h-5" />}
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

      {/* Peringatan Konfirmasi Berwenang bila Volume Melebihi Stok (FR-08) */}
      {stockWarningModal && (
        <Card className="border-2 border-amber-500 bg-amber-50 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Peringatan Validasi Stok Minyak (FR-08)
              </h3>
              <p className="text-xs text-amber-900 mt-1">
                Volume penyerahan yang Anda masukkan ({volumeStr} L) melebihi
                sisa stok tercatat saat ini (
                {formatLiters(metrics.remainingRecordedVolume)}). Pastikan
                seluruh setoran RT sudah tercatat. Apakah Anda sebagai Super
                Admin RW mengonfirmasi tetap menyimpan transaksi ini?
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setStockWarningModal(false)}
              className="px-3.5 py-2 rounded-xl border border-amber-400 bg-white text-xs font-semibold"
            >
              Batal & Periksa Stok
            </button>
            <button
              type="button"
              onClick={() => submitHandover(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold"
            >
              Konfirmasi Otorisasi Super Admin
            </button>
          </div>
        </Card>
      )}

      {/* Form Pencatatan Penyerahan ke Dinas */}
      <Card>
        <h2 className="text-base font-bold text-forest mb-4">
          Catat Penyerahan Baru ke Dinas Kebersihan Kota Bekasi
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitHandover(false);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tanggal Penyerahan <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                required
                value={handoverDate}
                onChange={(e) => setHandoverDate(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Volume Aktual Diserahkan (Liter){" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                placeholder={`Maks stok: ${metrics.remainingRecordedVolume} L`}
                value={volumeStr}
                onChange={(e) => setVolumeStr(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm font-bold text-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Status Penerimaan Dana (FR-08)
              </label>
              <select
                value={fundStatus}
                onChange={(e) =>
                  setFundStatus(
                    e.target.value as "Belum Diterima" | "Sudah Diterima"
                  )
                }
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm bg-white font-medium"
              >
                <option value="Sudah Diterima">
                  Dana Sudah Diterima Saat Serah Terima
                </option>
                <option value="Belum Diterima">
                  Dana Belum Diterima (Catat Terpisah Nanti)
                </option>
              </select>
            </div>
          </div>

          {fundStatus === "Sudah Diterima" && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Nominal Dana yang Benar-Benar Diterima (Rp){" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="Masukkan nominal Rupiah sesuai bukti penerimaan..."
                value={fundReceivedStr}
                onChange={(e) => setFundReceivedStr(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm font-bold text-forest"
              />
            </div>
          )}

          <ProofUploadField
            label="Foto Berita Acara Serah Terima / Bukti Transaksi Dinas (Wajib)"
            value={proofFileName}
            onChange={setProofFileName}
          />

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Catatan Serah Terima
            </label>
            <input
              type="text"
              placeholder="Contoh: Diserahkan kepada petugas penjemput Dinas Kebersihan Kota Bekasi"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs sm:text-sm font-bold transition"
          >
            <PlusCircle className="w-4 h-4" />
            Simpan Catatan Penyerahan ke Dinas
          </button>
        </form>
      </Card>

      {/* Riwayat Transaksi Penyerahan */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line">
          <h2 className="text-sm sm:text-base font-bold text-forest">
            Riwayat Penyerahan ke Dinas Kebersihan Kota Bekasi
          </h2>
        </div>

        {handovers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Belum Ada Catatan Penyerahan ke Dinas"
              description="Catat transaksi penyerahan minyak jelantah beserta berita acara di formulir atas."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                  <th className="py-3 px-4">ID & Tanggal</th>
                  <th className="py-3 px-4">Instansi Penerima</th>
                  <th className="py-3 px-4">Volume Diserahkan</th>
                  <th className="py-3 px-4">Status & Nominal Dana</th>
                  <th className="py-3 px-4">Bukti & Catatan</th>
                  <th className="py-3 px-4 text-right">Aksi Dana Susulan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {handovers.map((h) => (
                  <React.Fragment key={h.id}>
                    <tr className="hover:bg-cream/30">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-forest">{h.id}</p>
                        <p className="text-xs text-ink-muted">
                          {h.handoverDate}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        {h.agencyName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest whitespace-nowrap">
                        {formatLiters(h.volumeLiters)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {h.fundStatus === "Sudah Diterima" ? (
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-sage text-forest text-xs font-bold">
                              Sudah Diterima
                            </span>
                            <p className="font-bold text-forest mt-1">
                              {formatRp(h.fundReceivedRp)}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                            Belum Diterima (Rp 0)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-forest">
                          <FileImage className="w-3.5 h-3.5" />
                          {h.proofFileName}
                        </span>
                        {h.notes && (
                          <p className="text-xs text-ink-muted mt-0.5">
                            {h.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {h.fundStatus === "Belum Diterima" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmingId(
                                confirmingId === h.id ? null : h.id
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold"
                          >
                            Catat Dana Masuk
                          </button>
                        ) : (
                          <span className="text-xs text-ink-muted">
                            Tercatat di Dana Program
                          </span>
                        )}
                      </td>
                    </tr>
                    {confirmingId === h.id && (
                      <tr className="bg-cream/70">
                        <td colSpan={6} className="p-4 space-y-3">
                          <p className="text-xs font-bold text-forest">
                            Catat Penerimaan Dana Susulan untuk {h.id} (
                            {formatLiters(h.volumeLiters)})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-semibold mb-1">
                                Tanggal Dana Diterima
                              </label>
                              <input
                                type="date"
                                value={confirmDate}
                                onChange={(e) => setConfirmDate(e.target.value)}
                                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1">
                                Nominal Diterima (Rp)
                              </label>
                              <input
                                type="number"
                                placeholder="Nominal Rp..."
                                value={confirmAmountStr}
                                onChange={(e) =>
                                  setConfirmAmountStr(e.target.value)
                                }
                                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1">
                                Nama Berkas Bukti Transfer/Kwitansi
                              </label>
                              <input
                                type="text"
                                placeholder="bukti_dana_dinas.jpg"
                                value={confirmProof}
                                onChange={(e) =>
                                  setConfirmProof(e.target.value)
                                }
                                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              className="px-3 py-1.5 rounded-lg border border-line bg-white text-xs font-semibold"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmFund(h.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold"
                            >
                              Simpan Dana Masuk
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

