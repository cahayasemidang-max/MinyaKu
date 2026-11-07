"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, RoleDeniedBanner } from "@/components/ui";
import { RT_LIST } from "@/lib/mockData";
import { RTCode, UserRole } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  MapPin,
  PlusCircle,
  Shield,
  UserPlus,
} from "lucide-react";

export default function ResidentsAndAdminManagementPage() {
  const {
    currentUser,
    users,
    collectionPoints,
    auditLogs,
    upsertUserAccount,
    updateCollectionPoint,
    changeOwnPin,
  } = useApp();

  const [tab, setTab] = useState<
    "WARGA" | "ADMIN_RT" | "TITIK_RT" | "PIN_RW" | "AUDIT"
  >("WARGA");

  // Form tambah pengguna
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("WARGA");
  const [rt, setRt] = useState<RTCode>("RT 01");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // State ganti PIN Super Admin RW sendiri (FR-01)
  const [rwCurrentPin, setRwCurrentPin] = useState("");
  const [rwNewPin, setRwNewPin] = useState("");
  const [rwConfirmPin, setRwConfirmPin] = useState("");
  const [rwPinError, setRwPinError] = useState<string | null>(null);

  // State edit titik pengumpulan RT
  const [selectedRtPoint, setSelectedRtPoint] = useState<RTCode>("RT 01");
  const activePoint = collectionPoints.find((c) => c.rt === selectedRtPoint);
  const [pointAddress, setPointAddress] = useState(activePoint?.address || "");
  const [pointHours, setPointHours] = useState(
    activePoint?.operatingHours || ""
  );

  if (currentUser.role !== "SUPER_ADMIN_RW") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Super Admin RW"
        switchHref={currentUser.role === "WARGA" ? "/warga" : "/rt"}
      />
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const res = upsertUserAccount(
      {
        username,
        name,
        role,
        rt: role === "SUPER_ADMIN_RW" ? undefined : rt,
        phone,
        active: true,
        pin: "", // FR-01: Warga & Admin RT membuat PIN sendiri untuk akun yang telah terdaftar
        privacyShowNameInLeaderboard: true,
      },
      reason
    );
    if (!res.ok) {
      alert(res.message);
      return;
    }
    setFeedback(res.message);
    setUsername("");
    setName("");
    setPhone("");
    setReason("");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleActive = (userId: string, currentActive: boolean) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const res = upsertUserAccount(
      {
        ...target,
        active: !currentActive,
      },
      `Mengubah status aktif akun ${target.username}`
    );
    if (res.ok) setFeedback(res.message);
  };

  const handleChangeRwPin = (e: React.FormEvent) => {
    e.preventDefault();
    setRwPinError(null);
    if (rwNewPin !== rwConfirmPin) {
      setRwPinError("Konfirmasi PIN baru Super Admin tidak cocok.");
      return;
    }
    const res = changeOwnPin(rwCurrentPin, rwNewPin);
    if (!res.ok) {
      setRwPinError(res.message);
      return;
    }
    setFeedback(res.message);
    setRwCurrentPin("");
    setRwNewPin("");
    setRwConfirmPin("");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePoint) return;
    const res = updateCollectionPoint(selectedRtPoint, {
      pointName: activePoint.pointName,
      address: pointAddress,
      operatingHours: pointHours,
      instructions: activePoint.instructions,
      coordinatorName: activePoint.coordinatorName,
    });
    if (res.ok) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-forest">
          Manajemen Warga, 7 Admin RT, PIN & Titik Pengumpulan (FR-01 & FR-13)
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Kelola akun warga terdaftar, penugasan 7 Admin RT, alamat titik
          pengumpulan, PIN Super Admin RW, serta jejak audit.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-sage text-forest text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Navigasi Tab */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTab("WARGA");
            setRole("WARGA");
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            tab === "WARGA"
              ? "bg-forest text-white"
              : "bg-white border border-line text-ink"
          }`}
        >
          Akun Warga ({users.filter((u) => u.role === "WARGA").length})
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("ADMIN_RT");
            setRole("ADMIN_RT");
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            tab === "ADMIN_RT"
              ? "bg-forest text-white"
              : "bg-white border border-line text-ink"
          }`}
        >
          7 Akun Admin RT ({users.filter((u) => u.role === "ADMIN_RT").length})
        </button>
        <button
          type="button"
          onClick={() => setTab("TITIK_RT")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            tab === "TITIK_RT"
              ? "bg-forest text-white"
              : "bg-white border border-line text-ink"
          }`}
        >
          Alamat 7 Titik Pengumpulan RT
        </button>
        <button
          type="button"
          onClick={() => setTab("PIN_RW")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            tab === "PIN_RW"
              ? "bg-forest text-white"
              : "bg-white border border-line text-ink"
          }`}
        >
          PIN Super Admin RW
        </button>
        <button
          type="button"
          onClick={() => setTab("AUDIT")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            tab === "AUDIT"
              ? "bg-forest text-white"
              : "bg-white border border-line text-ink"
          }`}
        >
          Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* Form Tambah Pengguna Baru (Warga / Admin RT) */}
      {(tab === "WARGA" || tab === "ADMIN_RT") && (
        <Card>
          <h2 className="text-base font-bold text-forest mb-1 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Daftarkan Akun {role === "WARGA" ? "Warga" : "Admin RT"} di Database
            (FR-01)
          </h2>
          <p className="text-xs text-ink-muted mb-3">
            Ketentuan FR-01: Seluruh akun didaftarkan di database oleh pengurus.
            Baik Warga maupun Admin RT akan membuat PIN pribadinya sendiri saat
            pertama kali login ke aplikasi.
          </p>

          <form
            onSubmit={handleAddUser}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div>
              <label className="block text-xs font-semibold mb-1">
                Username Akun <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: warga_rt04_budi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Nama Lengkap <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nama lengkap..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Peran Pengguna
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm bg-white"
              >
                <option value="WARGA">Warga Penyetor (Buat PIN Sendiri)</option>
                <option value="ADMIN_RT">
                  Relawan Admin RT (Buat PIN Sendiri)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Penugasan / Domisili RT
              </label>
              <select
                value={rt}
                onChange={(e) => setRt(e.target.value as RTCode)}
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm bg-white"
              >
                {RT_LIST.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Alasan Penambahan (Audit Log){" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pendaftaran akun warga RT 04"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-line px-3 py-2 text-xs sm:text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-forest text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Simpan Akun Terdaftar
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Daftar Warga atau 7 Admin RT */}
      {(tab === "WARGA" || tab === "ADMIN_RT") && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/70 border-b border-line text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                  <th className="py-3 px-4">ID & Username</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Penugasan RT</th>
                  <th className="py-3 px-4">Status PIN Mandiri (FR-01)</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {users
                  .filter((u) => u.role === tab)
                  .map((u) => (
                    <tr key={u.id}>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-forest">{u.id}</p>
                        <p className="text-xs text-ink-muted">@{u.username}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        {u.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-sage text-forest text-xs font-bold">
                          {u.rt}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.pin ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-sage text-forest text-xs font-semibold">
                            Sudah Membuat PIN Pribadi
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                            Belum Buat PIN (Dibuat mandiri saat login)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.active ? (
                          <span className="text-forest font-bold text-xs">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold text-xs">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id, u.active)}
                          className="px-3 py-1 rounded-lg border border-line text-xs font-semibold hover:bg-cream"
                        >
                          {u.active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Kelola Alamat 7 Titik Pengumpulan RT */}
      {tab === "TITIK_RT" && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-forest" />
            <h2 className="text-base font-bold text-forest">
              Pengaturan Alamat Nyata 7 Titik Pengumpulan RT (FR-02)
            </h2>
          </div>
          <form onSubmit={handleSavePoint} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Pilih RT
                </label>
                <select
                  value={selectedRtPoint}
                  onChange={(e) => {
                    const nextRt = e.target.value as RTCode;
                    setSelectedRtPoint(nextRt);
                    const found = collectionPoints.find(
                      (c) => c.rt === nextRt
                    );
                    setPointAddress(found?.address || "");
                    setPointHours(found?.operatingHours || "");
                  }}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm bg-white font-bold"
                >
                  {RT_LIST.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">
                  Alamat Sebenarnya Titik Pengumpulan {selectedRtPoint}
                </label>
                <input
                  type="text"
                  placeholder="Isi alamat resmi titik pengumpulan RT..."
                  value={pointAddress}
                  onChange={(e) => setPointAddress(e.target.value)}
                  className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Jam Operasional / Petunjuk Kunjungan
              </label>
              <input
                type="text"
                value={pointHours}
                onChange={(e) => setPointHours(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs sm:text-sm font-bold"
            >
              Simpan Alamat Titik {selectedRtPoint}
            </button>
          </form>
        </Card>
      )}

      {/* Pengaturan / Ganti PIN Super Admin RW (FR-01) */}
      {tab === "PIN_RW" && (
        <Card className="max-w-xl space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-forest" />
            <div>
              <h2 className="text-base font-bold text-forest">
                Pengaturan PIN Super Admin RW (FR-01)
              </h2>
              <p className="text-xs text-ink-muted">
                Super Admin membuat dan mengelola PIN sendiri (bebas campuran
                karakter & angka) untuk mengakses seluruh fitur pengelolaan RW.
              </p>
            </div>
          </div>

          {rwPinError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {rwPinError}
            </div>
          )}

          <form onSubmit={handleChangeRwPin} className="space-y-3">
            {currentUser.pin && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  PIN Super Admin Saat Ini{" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={rwCurrentPin}
                  onChange={(e) => setRwCurrentPin(e.target.value)}
                  className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1">
                PIN Baru Super Admin (Bebas Karakter & Angka){" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                value={rwNewPin}
                onChange={(e) => setRwNewPin(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Konfirmasi PIN Baru Super Admin{" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                value={rwConfirmPin}
                onChange={(e) => setRwConfirmPin(e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-xs sm:text-sm font-bold"
            >
              <KeyRound className="w-4 h-4" />
              Perbarui PIN Super Admin RW
            </button>
          </form>
        </Card>
      )}

      {/* Audit Log */}
      {tab === "AUDIT" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-line flex items-center gap-2">
            <Shield className="w-4 h-4 text-forest" />
            <h2 className="text-sm font-bold text-forest">
              Jejak Audit Sistem (Bab 11 PRD — Auditabilitas)
            </h2>
          </div>
          <div className="divide-y divide-line text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">
                    {log.action}{" "}
                    <span className="text-forest">({log.targetId})</span>
                  </p>
                  <p className="text-ink-muted mt-0.5">Alasan: {log.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-ink">{log.actorName}</p>
                  <p className="text-ink-muted">
                    {new Date(log.timestamp).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
