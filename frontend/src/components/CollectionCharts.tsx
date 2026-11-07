"use client";

import React, { useMemo, useState } from "react";
import { OilDeposit, RTCode } from "@/lib/types";
import { RT_LIST } from "@/lib/mockData";
import { Card, EmptyState, formatLiters } from "./ui";
import { BarChart3, Calendar, RotateCcw, TrendingUp } from "lucide-react";

type Granularity = "HARIAN" | "MINGGUAN" | "BULANAN";

function getWeekLabel(dateStr: string): { key: string; label: string } {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = d.getDate();
  const weekOfMonth = Math.ceil(day / 7);
  return {
    key: `${year}-${month}-W${weekOfMonth}`,
    label: `Minggu ${weekOfMonth} (${year}-${month})`,
  };
}

export function OilTrendChart({
  title,
  subtitle,
  deposits,
  allowRTFilter = false,
}: {
  title: string;
  subtitle: string;
  deposits: OilDeposit[];
  allowRTFilter?: boolean;
}) {
  const [granularity, setGranularity] = useState<Granularity>("HARIAN");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [rtFilter, setRtFilter] = useState<string>("SEMUA");

  // FR-15: Grafik menampilkan volume minyak jelantah dalam satuan liter (L)
  // dari setoran yang telah Terverifikasi, tanpa mencampur volume penyerahan ke dinas.
  const verifiedFiltered = useMemo(() => {
    return deposits.filter((d) => {
      if (d.status !== "Terverifikasi") return false;
      if (allowRTFilter && rtFilter !== "SEMUA" && d.rt !== rtFilter) {
        return false;
      }
      const dateOnly = d.recordedAt.slice(0, 10);
      if (startDate && dateOnly < startDate) return false;
      if (endDate && dateOnly > endDate) return false;
      return true;
    });
  }, [deposits, allowRTFilter, rtFilter, startDate, endDate]);

  const series = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; liters: number; count: number }
    >();

    verifiedFiltered.forEach((d) => {
      const dateOnly = d.recordedAt.slice(0, 10);
      let key = dateOnly;
      let label = dateOnly;

      if (granularity === "HARIAN") {
        key = dateOnly;
        label = new Date(d.recordedAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } else if (granularity === "MINGGUAN") {
        const wk = getWeekLabel(d.recordedAt);
        key = wk.key;
        label = wk.label;
      } else {
        key = d.recordedAt.slice(0, 7);
        const [y, m] = key.split("-");
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ];
        label = `${monthNames[parseInt(m, 10) - 1] || m} ${y}`;
      }

      const existing = map.get(key) || { key, label, liters: 0, count: 0 };
      existing.liters = Number((existing.liters + d.volumeLiters).toFixed(2));
      existing.count += 1;
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [verifiedFiltered, granularity]);

  const maxLiters = Math.max(...series.map((s) => s.liters), 1);
  const totalInChart = series.reduce((acc, s) => acc + s.liters, 0);

  // Perhitungan koordinat SVG Line Chart (FR-15 Baris 436)
  const svgWidth = Math.max(540, series.length * 110);
  const svgHeight = 230;
  const padLeft = 48;
  const padRight = 36;
  const padTop = 34;
  const padBottom = 46;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const points = series.map((item, idx) => {
    const x =
      series.length === 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (series.length - 1)) * plotW;
    const y = padTop + plotH - (item.liters / maxLiters) * plotH;
    return { x, y, ...item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `M ${points[0].x} ${padTop + plotH} ` +
        points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
        ` L ${points[points.length - 1].x} ${padTop + plotH} Z`
      : "";

  return (
    <Card className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest" />
            <h2 className="text-sm sm:text-base font-bold text-forest">
              {title}
            </h2>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>
        </div>

        {/* Pilihan Granularitas: Harian, Mingguan, Bulanan */}
        <div className="flex flex-wrap items-center gap-1.5 bg-cream p-1 rounded-xl border border-line self-start lg:self-auto">
          {(["HARIAN", "MINGGUAN", "BULANAN"] as Granularity[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                granularity === g
                  ? "bg-forest text-white shadow-sm"
                  : "text-ink-muted hover:text-forest"
              }`}
            >
              {g === "HARIAN"
                ? "Harian"
                : g === "MINGGUAN"
                ? "Mingguan"
                : "Bulanan"}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Rentang Tanggal & Filter RT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-cream/50 p-3 rounded-xl border border-line">
        <div>
          <label className="block text-[11px] font-semibold text-ink-muted mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Dari Tanggal
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-ink-muted mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Sampai Tanggal
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink"
          />
        </div>

        {allowRTFilter && (
          <div>
            <label className="block text-[11px] font-semibold text-ink-muted mb-1">
              Filter Wilayah RT
            </label>
            <select
              value={rtFilter}
              onChange={(e) => setRtFilter(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink"
            >
              <option value="SEMUA">Seluruh RW (7 RT)</option>
              {RT_LIST.map((rt: RTCode) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-end justify-between sm:justify-end gap-2">
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-ink-muted uppercase font-semibold">
              Total Periode Ini
            </p>
            <p className="text-sm font-bold text-forest">
              {formatLiters(totalInChart)}
            </p>
          </div>
          {(startDate || endDate || rtFilter !== "SEMUA") && (
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setRtFilter("SEMUA");
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-line bg-white text-xs font-semibold text-ink hover:bg-sage/40"
              title="Reset Filter Grafik"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Area Line Chart Visual (FR-15 Baris 436) */}
      {series.length === 0 ? (
        <EmptyState
          title="Belum Ada Data Setoran Terverifikasi pada Rentang Ini"
          description="Line chart tren hanya menampilkan setoran minyak jelantah yang telah berstatus Terverifikasi dalam satuan Liter (L). Silakan sesuaikan rentang tanggal atau catat setoran baru."
        />
      ) : (
        <div className="space-y-3 pt-1">
          <div className="w-full overflow-x-auto rounded-xl border border-line bg-cream/25 p-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-60 min-w-[480px]"
              role="img"
              aria-label={title}
            >
              <defs>
                <linearGradient
                  id="oilLineAreaGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#244D38" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#244D38" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Garis Bantu Horizontal (Gridlines) */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const y = padTop + plotH - ratio * plotH;
                const val = (maxLiters * ratio).toFixed(1);
                return (
                  <g key={idx}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#E3E8DF"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#68766B"
                      fontWeight="600"
                    >
                      {val} L
                    </text>
                  </g>
                );
              })}

              {/* Area di Bawah Line Chart */}
              {points.length > 1 && (
                <path d={areaPath} fill="url(#oilLineAreaGrad)" />
              )}

              {/* Garis Utama Line Chart */}
              {points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#244D38"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
              )}

              {/* Titik Koordinat & Label Nilai Liter */}
              {points.map((pt) => (
                <g key={pt.key}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5.5"
                    fill="#FFFFFF"
                    stroke="#244D38"
                    strokeWidth="3"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#244D38"
                  >
                    {formatLiters(pt.liters)}
                  </text>
                  <text
                    x={pt.x}
                    y={padTop + plotH + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#24352B"
                  >
                    {pt.label}
                  </text>
                  <text
                    x={pt.x}
                    y={padTop + plotH + 33}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#68766B"
                  >
                    ({pt.count} setoran)
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <p className="text-[11px] text-ink-muted">
            * Keterangan FR-15: Line chart dihitung murni dari catatan setoran
            berstatus <strong>Terverifikasi</strong> dalam satuan Liter (L) dan
            tidak dicampur dengan volume penyerahan ke dinas.
          </p>
        </div>
      )}
    </Card>
  );
}

export function RTComparisonChart({ deposits }: { deposits: OilDeposit[] }) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const rtData = useMemo(() => {
    return RT_LIST.map((rt) => {
      const rtDeps = deposits.filter((d) => {
        if (d.rt !== rt) return false;
        const dateOnly = d.recordedAt.slice(0, 10);
        if (startDate && dateOnly < startDate) return false;
        if (endDate && dateOnly > endDate) return false;
        return true;
      });

      const verifiedLiters = rtDeps
        .filter((d) => d.status === "Terverifikasi")
        .reduce((acc, d) => acc + d.volumeLiters, 0);

      const needCheckCount = rtDeps.filter(
        (d) => d.status === "Perlu diperiksa"
      ).length;

      return {
        rt,
        verifiedLiters: Number(verifiedLiters.toFixed(2)),
        totalRecords: rtDeps.length,
        needCheckCount,
      };
    });
  }, [deposits, startDate, endDate]);

  const maxRtLiters = Math.max(...rtData.map((r) => r.verifiedLiters), 1);
  const totalAnyVerified = rtData.some((r) => r.verifiedLiters > 0);

  return (
    <Card className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-forest" />
            <h2 className="text-sm sm:text-base font-bold text-forest">
              Grafik Perbandingan Volume Pengumpulan Antar-7 RT (Liter)
            </h2>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Membandingkan capaian volume minyak jelantah terverifikasi dari RT
            01 hingga RT 07 sesuai rentang tanggal (FR-15).
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted mb-0.5">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-ink-muted mb-0.5">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs"
            />
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="px-2.5 py-1.5 rounded-lg border border-line bg-cream text-xs font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {!totalAnyVerified ? (
        <EmptyState
          title="Belum Ada Volume Terverifikasi pada Rentang Tanggal Ini"
          description="Grafik perbandingan 7 RT akan tampil ketika terdapat minimal satu RT yang memiliki setoran terverifikasi pada rentang tanggal yang dipilih."
        />
      ) : (
        <div className="space-y-3">
          {rtData.map((row) => {
            const pct = Math.min(
              100,
              Math.round((row.verifiedLiters / maxRtLiters) * 100)
            );
            return (
              <div key={row.rt} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink w-14">{row.rt}</span>
                    <span className="text-xs text-ink-muted">
                      ({row.totalRecords} catatan)
                    </span>
                    {row.needCheckCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold">
                        {row.needCheckCount} perlu diperiksa
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-forest">
                    {formatLiters(row.verifiedLiters)}
                  </span>
                </div>
                <div className="w-full h-3.5 bg-cream rounded-full overflow-hidden border border-line">
                  <div
                    className="h-full bg-forest rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
