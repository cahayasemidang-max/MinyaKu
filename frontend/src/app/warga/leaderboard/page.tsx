"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, EmptyState, StatCard, formatLiters } from "@/components/ui";
import { Award, ShieldCheck, Users } from "lucide-react";

export default function LeaderboardPage() {
  const { users, deposits, currentUser } = useApp();
  const [periodFilter, setPeriodFilter] = useState<string>("SEMUA");
  const [rtFilter, setRtFilter] = useState<string>("SEMUA");

  // FR-05 & Aturan Bisnis #13: Leaderboard hanya menghitung setoran Terverifikasi
  const verifiedDeposits = deposits.filter((d) => {
    if (d.status !== "Terverifikasi") return false;
    if (periodFilter !== "SEMUA" && !d.recordedAt.startsWith(periodFilter)) {
      return false;
    }
    if (rtFilter !== "SEMUA" && d.rt !== rtFilter) {
      return false;
    }
    return true;
  });

  const tallyMap = new Map<
    string,
    {
      residentId: string;
      displayName: string;
      rt: string;
      totalLiters: number;
      depositCount: number;
      isMe: boolean;
    }
  >();

  verifiedDeposits.forEach((dep) => {
    const userObj = users.find((u) => u.id === dep.residentId);
    const showName = userObj?.privacyShowNameInLeaderboard ?? true;
    const isMe = dep.residentId === currentUser.id;

    // Kebijakan privasi (Bab 5.1 & FR-05): Samarkan nama warga lain jika mereka memilih privasi
    const maskedName = showName
      ? dep.residentName
      : `Hamba Allah / Warga ${dep.rt}`;

    const existing = tallyMap.get(dep.residentId) || {
      residentId: dep.residentId,
      displayName: isMe ? `${dep.residentName} (Anda)` : maskedName,
      rt: dep.rt,
      totalLiters: 0,
      depositCount: 0,
      isMe,
    };

    existing.totalLiters = Number(
      (existing.totalLiters + dep.volumeLiters).toFixed(2)
    );
    existing.depositCount += 1;
    tallyMap.set(dep.residentId, existing);
  });

  const rankings = Array.from(tallyMap.values()).sort(
    (a, b) => b.totalLiters - a.totalLiters
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-forest">
            Leaderboard Kontribusi Sedekah Jelantah
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Berdasarkan total liter setoran yang telah{" "}
            <strong>Terverifikasi</strong> dan menghormati pengaturan privasi
            warga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={rtFilter}
            onChange={(e) => setRtFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-3 py-2 text-xs sm:text-sm"
          >
            <option value="SEMUA">Seluruh RT (RW)</option>
            <option value="RT 01">RT 01</option>
            <option value="RT 02">RT 02</option>
            <option value="RT 03">RT 03</option>
            <option value="RT 04">RT 04</option>
            <option value="RT 05">RT 05</option>
            <option value="RT 06">RT 06</option>
            <option value="RT 07">RT 07</option>
          </select>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-3 py-2 text-xs sm:text-sm"
          >
            <option value="SEMUA">Sepanjang Waktu</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-10">Oktober 2026</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <StatCard
          highlight
          label="Total Warga Berkontribusi (Filter Aktif)"
          value={`${rankings.length} Warga`}
          subtext="Hanya menghitung setoran berstatus Terverifikasi"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Perlindungan Privasi Warga"
          value="Aktif"
          subtext="Warga dapat menyamarkan nama di halaman Profil"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
      </div>

      {rankings.length === 0 ? (
        <EmptyState
          title="Belum Ada Data Kontribusi Terverifikasi"
          description="Peringkat kontribusi akan muncul setelah terdapat setoran warga yang berstatus Terverifikasi pada periode ini."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-line">
            {rankings.map((row, idx) => (
              <div
                key={row.residentId}
                className={`p-4 flex items-center justify-between gap-3 ${
                  row.isMe ? "bg-sage/40" : "hover:bg-cream/40"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      idx === 0
                        ? "bg-amber-400 text-ink"
                        : idx === 1
                        ? "bg-slate-300 text-ink"
                        : idx === 2
                        ? "bg-amber-700 text-white"
                        : "bg-cream text-ink-muted border border-line"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-ink">
                        {row.displayName}
                      </p>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sage text-forest">
                        {row.rt}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {row.depositCount} kali setoran terverifikasi
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base sm:text-lg font-bold text-forest flex items-center gap-1 justify-end">
                    <Award className="w-4 h-4 text-forest" />
                    {formatLiters(row.totalLiters)}
                  </p>
                  <p className="text-[11px] text-ink-muted">Terverifikasi</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

