"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Card,
  RoleDeniedBanner,
  StatusBadge,
  formatLiters,
  formatRp,
} from "@/components/ui";
import { RT_LIST } from "@/lib/mockData";
import { Download, FileSpreadsheet } from "lucide-react";

type ReportTab =
  | "PENGUMPULAN_RT"
  | "SERAH_TERIMA_DINAS"
  | "DANA_PROGRAM"
  | "PEMBELIAN_SEMBAKO"
  | "INVENTARIS_SEMBAKO"
  | "DISTRIBUSI_PAKET";

export default function ReportsPage() {
  const {
    currentUser,
    deposits,
    handovers,
    financeTransactions,
    purchases,
    metrics,
    distributions,
  } = useApp();

  const [activeReport, setActiveReport] =
    useState<ReportTab>("PENGUMPULAN_RT");
  const [rtFilter, setRtFilter] = useState("SEMUA");

  if (currentUser.role !== "SUPER_ADMIN_RW") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Super Admin RW"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rt"}
      />
    );
  }

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csvContent = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrentReport = () => {
    if (activeReport === "PENGUMPULAN_RT") {
      const rows = [
        [
          "ID Setoran",
          "Waktu",
          "RT",
          "Warga",
          "Volume (Liter)",
          "Status",
          "Pencatat",
          "Bukti",
        ],
        ...deposits
          .filter((d) => rtFilter === "SEMUA" || d.rt === rtFilter)
          .map((d) => [
            d.id,
            d.recordedAt,
            d.rt,
            d.residentName,
            String(d.volumeLiters),
            d.status,
            d.recordedByName,
            d.proofFileName,
          ]),
      ];
      downloadCsv("laporan_pengumpulan_jelantah.csv", rows);
    } else if (activeReport === "SERAH_TERIMA_DINAS") {
      const rows = [
        [
          "ID Transaksi",
          "Tanggal",
          "Instansi",
          "Volume (Liter)",
          "Status Dana",
          "Dana Diterima (Rp)",
          "Bukti",
        ],
        ...handovers.map((h) => [
          h.id,
          h.handoverDate,
          h.agencyName,
          String(h.volumeLiters),
          h.fundStatus,
          String(h.fundReceivedRp),
          h.proofFileName,
        ]),
      ];
      downloadCsv("laporan_penyerahan_dinas.csv", rows);
    } else if (activeReport === "DANA_PROGRAM") {
      const rows = [
        [
          "ID",
          "Tanggal",
          "Jenis",
          "Kategori",
          "Nominal (Rp)",
          "Deskripsi",
          "Bukti",
        ],
        ...financeTransactions.map((t) => [
          t.id,
          t.date,
          t.type,
          t.category,
          String(t.amountRp),
          t.description,
          t.proofFileName,
        ]),
      ];
      downloadCsv("laporan_dana_program.csv", rows);
    } else if (activeReport === "PEMBELIAN_SEMBAKO") {
      const rows = [
        [
          "ID Pembelian",
          "Tanggal",
          "Pemasok",
          "Total (Rp)",
          "Status Diterima",
          "Nota",
        ],
        ...purchases.map((p) => [
          p.id,
          p.purchaseDate,
          p.supplierName,
          String(p.totalTransactionRp),
          p.receivedConfirmed ? "Sudah Diterima" : "Belum Diterima",
          p.proofFileName,
        ]),
      ];
      downloadCsv("laporan_pembelian_sembako.csv", rows);
    } else if (activeReport === "INVENTARIS_SEMBAKO") {
      const rows = [
        [
          "Nama Barang",
          "Satuan",
          "Dibeli Terkonfirmasi",
          "Didistribusikan",
          "Stok Tersedia",
          "Kebutuhan / Paket",
        ],
        ...metrics.inventorySummary.map((i) => [
          i.itemName,
          i.unit,
          String(i.totalPurchasedConfirmed),
          String(i.totalDistributed),
          String(i.availableStock),
          String(i.requiredPerPackage),
        ]),
      ];
      downloadCsv("laporan_inventaris_sembako.csv", rows);
    } else {
      const rows = [
        [
          "ID Distribusi",
          "Tanggal",
          "Lokasi",
          "Jumlah Paket",
          "Penerima Satpam",
          "Bukti",
        ],
        ...distributions.map((d) => [
          d.id,
          d.distributionDate,
          d.location,
          String(d.packageCount),
          d.recipientNote,
          d.proofFileName,
        ]),
      ];
      downloadCsv("laporan_distribusi_paket_satpam.csv", rows);
    }
  };

  const reportTabs: { id: ReportTab; label: string }[] = [
    { id: "PENGUMPULAN_RT", label: "1. Pengumpulan per RT" },
    { id: "SERAH_TERIMA_DINAS", label: "2. Penyerahan ke Dinas" },
    { id: "DANA_PROGRAM", label: "3. Dana Masuk & Pengeluaran" },
    { id: "PEMBELIAN_SEMBAKO", label: "4. Pembelian Sembako" },
    { id: "INVENTARIS_SEMBAKO", label: "5. Inventaris Sembako" },
    { id: "DISTRIBUSI_PAKET", label: "6. Distribusi Paket Satpam" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-forest">
            Pusat Laporan Terpisah & Ekspor Data (FR-14)
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Enam jenis laporan operasional dan keuangan terpisah yang dapat
            ditelusuri dan diekspor ke CSV/Spreadsheet.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCurrentReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs sm:text-sm font-bold shrink-0"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV Laporan Ini
        </button>
      </div>

      {/* Pilihan 6 Jenis Laporan Terpisah (FR-14) */}
      <div className="flex flex-wrap gap-2">
        {reportTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveReport(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeReport === t.id
                ? "bg-forest text-white shadow-sm"
                : "bg-white border border-line text-ink hover:bg-sage/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-forest" />
            <h2 className="text-sm sm:text-base font-bold text-forest">
              {reportTabs.find((r) => r.id === activeReport)?.label}
            </h2>
          </div>

          {activeReport === "PENGUMPULAN_RT" && (
            <select
              value={rtFilter}
              onChange={(e) => setRtFilter(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-medium"
            >
              <option value="SEMUA">Seluruh 7 RT</option>
              {RT_LIST.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="overflow-x-auto">
          {activeReport === "PENGUMPULAN_RT" && (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase font-bold text-ink-muted">
                  <th className="py-3 px-4">ID Setoran</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">RT</th>
                  <th className="py-3 px-4">Warga</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {deposits
                  .filter((d) => rtFilter === "SEMUA" || d.rt === rtFilter)
                  .map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 px-4 font-bold text-forest">
                        {d.id}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(d.recordedAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-4 font-bold">{d.rt}</td>
                      <td className="py-3 px-4">{d.residentName}</td>
                      <td className="py-3 px-4 font-bold text-forest">
                        {formatLiters(d.volumeLiters)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={d.status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeReport === "SERAH_TERIMA_DINAS" && (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase font-bold text-ink-muted">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Instansi</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Status Dana</th>
                  <th className="py-3 px-4">Dana Diterima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {handovers.map((h) => (
                  <tr key={h.id}>
                    <td className="py-3 px-4 font-bold text-forest">{h.id}</td>
                    <td className="py-3 px-4">{h.handoverDate}</td>
                    <td className="py-3 px-4">{h.agencyName}</td>
                    <td className="py-3 px-4 font-bold">
                      {formatLiters(h.volumeLiters)}
                    </td>
                    <td className="py-3 px-4">{h.fundStatus}</td>
                    <td className="py-3 px-4 font-bold text-forest">
                      {formatRp(h.fundReceivedRp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === "DANA_PROGRAM" && (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase font-bold text-ink-muted">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {financeTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 px-4 font-bold text-forest">{t.id}</td>
                    <td className="py-3 px-4">{t.date}</td>
                    <td className="py-3 px-4 font-semibold">{t.type}</td>
                    <td className="py-3 px-4">{t.category}</td>
                    <td className="py-3 px-4">{t.description}</td>
                    <td className="py-3 px-4 font-bold text-forest">
                      {formatRp(t.amountRp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === "PEMBELIAN_SEMBAKO" && (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase font-bold text-ink-muted">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pemasok</th>
                  <th className="py-3 px-4">Rincian Barang</th>
                  <th className="py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-bold text-forest">{p.id}</td>
                    <td className="py-3 px-4">{p.purchaseDate}</td>
                    <td className="py-3 px-4">{p.supplierName}</td>
                    <td className="py-3 px-4">
                      {p.items
                        .map((i) => `${i.itemName} (${i.quantity} ${i.unit})`)
                        .join(", ")}
                    </td>
                    <td className="py-3 px-4 font-bold text-forest">
                      {formatRp(p.totalTransactionRp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === "INVENTARIS_SEMBAKO" && (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase font-bold text-ink-muted">
                  <th className="py-3 px-4">Barang</th>
                  <th className="py-3 px-4">Masuk (Terkonfirmasi)</th>
                  <th className="py-3 px-4">Keluar (Distribusi)</th>
                  <th className="py-3 px-4">Stok Tersedia</th>
                  <th className="py-3 px-4">Kebutuhan / Paket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {metrics.inventorySummary.map((i) => (
                  <tr key={`${i.itemName}-${i.unit}`}>
                    <td className="py-3 px-4 font-bold">{i.itemName}</td>
                    <td className="py-3 px-4">
                      {i.totalPurchasedConfirmed} {i.unit}
                    </td>
                    <td className="py-3 px-4">
                      {i.totalDistributed} {i.unit}
                    </td>
                    <td className="py-3 px-4 font-bold text-forest">
                      {i.availableStock} {i.unit}
                    </td>
                    <td className="py-3 px-4">
                      {i.requiredPerPackage} {i.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === "DISTRIBUSI_PAKET" && (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase font-bold text-ink-muted">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4">Jumlah Paket</th>
                  <th className="py-3 px-4">Keterangan Penerima Satpam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {distributions.map((d) => (
                  <tr key={d.id}>
                    <td className="py-3 px-4 font-bold text-forest">{d.id}</td>
                    <td className="py-3 px-4">{d.distributionDate}</td>
                    <td className="py-3 px-4">{d.location}</td>
                    <td className="py-3 px-4 font-bold text-forest">
                      {d.packageCount} Paket
                    </td>
                    <td className="py-3 px-4">{d.recipientNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

