"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  EmptyState,
  ProofUploadField,
  RoleDeniedBanner,
  StatCard,
  formatRp,
} from "@/components/ui";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  FileImage,
  Info,
  PlusCircle,
  Wallet,
} from "lucide-react";

export default function ProgramFinancePage() {
  const {
    currentUser,
    financeTransactions,
    metrics,
    recordManualFinanceTransaction,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<"DANA_MASUK" | "PENGELUARAN">("PENGELUARAN");
  const [category, setCategory] = useState<
    | "Penerimaan Dinas Kebersihan"
    | "Pembelian Sembako"
    | "Operasional Penunjang"
    | "Koreksi Tercatat"
  >("Operasional Penunjang");
  const [amountStr, setAmountStr] = useState("");
  const [description, setDescription] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [periodFilter, setPeriodFilter] = useState("SEMUA");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (currentUser.role !== "SUPER_ADMIN_RW") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Super Admin RW"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rt"}
      />
    );
  }

  const filtered = financeTransactions.filter((t) => {
    if (periodFilter !== "SEMUA" && !t.date.startsWith(periodFilter)) {
      return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = recordManualFinanceTransaction({
      date,
      type,
      category,
      amountRp: parseFloat(amountStr),
      description,
      proofFileName,
      correctionReason:
        category === "Koreksi Tercatat" ? correctionReason : undefined,
    });
    if (!res.ok) {
      alert(res.message);
      return;
    }
    setFeedback(res.message);
    setShowForm(false);
    setAmountStr("");
    setDescription("");
    setCorrectionReason("");
    setProofFileName("");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-forest">
            Pengelolaan Dana Program (FR-09)
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Dana diterima, total pengeluaran, dan saldo dana tercatat
            ditampilkan secara terpisah. Saldo bukan label
            &ldquo;keuntungan&rdquo; (Aturan Bisnis #12).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs sm:text-sm font-bold shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Catat Transaksi / Koreksi Dana
        </button>
      </div>

      {/* Rumus Dasar FR-09 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          label="Total Dana Masuk Tercatat"
          value={formatRp(metrics.totalFundsReceivedRp)}
          subtext="Hanya dana yang benar-benar sudah diterima"
          icon={<Coins className="w-5 h-5" />}
        />
        <StatCard
          label="Total Pengeluaran Tercatat"
          value={formatRp(metrics.totalProgramExpensesRp)}
          subtext="Pembelian sembako & operasional program"
          icon={<ArrowUpRight className="w-5 h-5" />}
        />
        <StatCard
          highlight
          label="Saldo Dana Program Tercatat"
          value={formatRp(metrics.recordedFundBalanceRp)}
          subtext="Dana masuk tercatat − pengeluaran tercatat"
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      <div className="p-3.5 rounded-xl bg-cream/80 border border-line text-xs text-ink-muted flex items-center gap-2.5">
        <Info className="w-4 h-4 text-forest shrink-0" />
        <span>
          <strong>Catatan Akuntabilitas (FR-09):</strong> Saldo dana tercatat
          dihitung dari transaksi yang tercatat di sistem dan bukan pengganti
          rekonsiliasi kas/rekening nyata. Dana tidak pernah dibagikan sebagai
          uang tunai kepada satpam maupun warga.
        </span>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {showForm && (
        <Card className="border-2 border-forest space-y-4">
          <h2 className="text-base font-bold text-forest">
            Catat Transaksi Keuangan / Koreksi Tercatat
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Jenis Arus Dana
                </label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "DANA_MASUK" | "PENGELUARAN")
                  }
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm bg-white"
                >
                  <option value="PENGELUARAN">Pengeluaran Program</option>
                  <option value="DANA_MASUK">Dana Masuk</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Kategori Transaksi
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as
                        | "Penerimaan Dinas Kebersihan"
                        | "Pembelian Sembako"
                        | "Operasional Penunjang"
                        | "Koreksi Tercatat"
                    )
                  }
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm bg-white"
                >
                  <option value="Operasional Penunjang">
                    Operasional Penunjang
                  </option>
                  <option value="Koreksi Tercatat">
                    Koreksi Transaksi (Wajib Alasan Audit)
                  </option>
                  <option value="Penerimaan Dinas Kebersihan">
                    Penerimaan Dinas Kebersihan
                  </option>
                  <option value="Pembelian Sembako">Pembelian Sembako</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Nominal (Rp) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full rounded-xl border border-line px-3.5 py-2 text-sm font-bold text-forest"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Deskripsi Transaksi <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            {category === "Koreksi Tercatat" && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Alasan Koreksi (Wajib untuk Jejak Audit — FR-09){" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jelaskan alasan koreksi nominal..."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
                />
              </div>
            )}

            <ProofUploadField
              label="Foto Bukti Transaksi / Nota (Wajib)"
              value={proofFileName}
              onChange={setProofFileName}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-line text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold"
              >
                Simpan Transaksi
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabel Riwayat Transaksi Dana Program */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-bold text-forest">
            Buku Besar Transaksi Dana Program
          </h2>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium"
          >
            <option value="SEMUA">Semua Periode</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-10">Oktober 2026</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Belum Ada Catatan Transaksi Keuangan"
              description="Transaksi dana masuk dari dinas dan pengeluaran pembelian sembako akan tampil di sini."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                  <th className="py-3 px-4">ID & Tanggal</th>
                  <th className="py-3 px-4">Jenis & Kategori</th>
                  <th className="py-3 px-4">Deskripsi & Referensi</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-cream/30">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-forest">{t.id}</p>
                      <p className="text-xs text-ink-muted">{t.date}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          t.type === "DANA_MASUK"
                            ? "bg-sage text-forest"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {t.type === "DANA_MASUK" ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {t.type === "DANA_MASUK" ? "Dana Masuk" : "Pengeluaran"}
                      </span>
                      <p className="text-xs text-ink-muted mt-1">
                        {t.category}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-ink">{t.description}</p>
                      {t.referenceId && (
                        <p className="text-xs text-forest font-semibold mt-0.5">
                          Ref: {t.referenceId}
                        </p>
                      )}
                      {t.correctionReason && (
                        <p className="text-xs text-amber-800 mt-0.5">
                          Alasan Koreksi: {t.correctionReason}
                        </p>
                      )}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-bold whitespace-nowrap ${
                        t.type === "DANA_MASUK"
                          ? "text-forest"
                          : "text-amber-900"
                      }`}
                    >
                      {t.type === "DANA_MASUK" ? "+" : "-"}
                      {formatRp(t.amountRp)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-forest">
                        <FileImage className="w-3.5 h-3.5" />
                        {t.proofFileName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

