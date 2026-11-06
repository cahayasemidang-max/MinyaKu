"use client";

import React from "react";
import { DepositStatus } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileImage,
  Info,
  ShieldAlert,
} from "lucide-react";

export function StatusBadge({ status }: { status: DepositStatus }) {
  if (status === "Terverifikasi") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sage text-forest border border-forest/20">
        <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
        Terverifikasi
      </span>
    );
  }
  if (status === "Perlu diperiksa") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
        Perlu diperiksa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
      <Clock className="w-3.5 h-3.5 text-slate-600" />
      Baru dicatat
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-card border border-line shadow-soft p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-card border p-4 sm:p-5 shadow-soft transition-all ${
        highlight
          ? "bg-forest text-white border-forest"
          : "bg-white text-ink border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-xs sm:text-sm font-medium ${
              highlight ? "text-sage" : "text-ink-muted"
            }`}
          >
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
            {value}
          </p>
          {subtext && (
            <p
              className={`text-xs mt-1.5 ${
                highlight ? "text-cream/90" : "text-ink-muted"
              }`}
            >
              {subtext}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              highlight ? "bg-white/15 text-white" : "bg-sage/60 text-forest"
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-card border border-dashed border-line p-6 sm:p-10 text-center">
      <div className="w-11 h-11 rounded-full bg-sage/60 text-forest flex items-center justify-center mx-auto mb-3">
        <Info className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto mt-1">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProofUploadField({
  label = "Foto Bukti (Wajib)",
  value,
  onChange,
  helperText = "Unggah foto bukti takaran / nota / berita acara (JPG/PNG/PDF)",
}: {
  label?: string;
  value: string;
  onChange: (fileName: string) => void;
  helperText?: string;
}) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-ink mb-1.5">
        {label} <span className="text-red-600">*</span>
      </label>
      <div className="border-2 border-dashed border-line rounded-xl p-3.5 bg-cream/40 hover:bg-cream/80 transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-sage text-forest shrink-0">
              <FileImage className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-ink truncate">
                {value ? value : "Belum ada berkas foto bukti dipilih"}
              </p>
              <p className="text-[11px] text-ink-muted">{helperText}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-forest text-white hover:bg-forest-dark transition">
              Pilih Foto / Berkas
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(file.name);
                  }
                }}
              />
            </label>
            {!value && (
              <button
                type="button"
                onClick={() =>
                  onChange(
                    `bukti_foto_${new Date()
                      .toISOString()
                      .slice(0, 10)}_${Math.floor(Math.random() * 900 + 100)}.jpg`
                  )
                }
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-line text-ink hover:bg-sage/40 transition"
              >
                Gunakan Contoh Foto
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoleDeniedBanner({
  allowedRoleText,
  switchHref,
}: {
  allowedRoleText: string;
  switchHref?: string;
}) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-card p-5 text-amber-950">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm sm:text-base">
            Otorisasi Ditolak oleh Sistem (FR-01 & Aturan Bisnis #15)
          </h3>
          <p className="text-xs sm:text-sm mt-1">
            Halaman dan operasi ini hanya diizinkan untuk peran{" "}
            <strong>{allowedRoleText}</strong>. Hak akses dibatasi berdasarkan
            peran dan penugasan RT.
          </p>
          {switchHref && (
            <a
              href={switchHref}
              className="inline-block mt-3 px-3.5 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold"
            >
              Kembali ke Beranda Peran Anda
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function formatLiters(liters: number): string {
  return `${Number(liters).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} L`;
}

