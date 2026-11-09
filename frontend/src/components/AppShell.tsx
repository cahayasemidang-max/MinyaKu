"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Coins,
  Droplets,
  FileSpreadsheet,
  HeartHandshake,
  History,
  Home,
  Layers,
  LogOut,
  MapPin,
  Menu,
  Package,
  PlusCircle,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  User,
  Users,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: React.ReactNode;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    users,
    setCurrentUserById,
    isIllustrativeMode,
    toggleDataMode,
  } = useApp();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Bab 7.1 PRD: Navigasi Warga (termasuk Dana Program)
  const wargaNav: NavItem[] = [
    {
      href: "/warga",
      label: "Beranda",
      shortLabel: "Beranda",
      icon: <Home className="w-4 h-4" />,
    },
    {
      href: "/warga/setor",
      label: "Setor Minyak Jelantah",
      shortLabel: "Titik RT",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      href: "/warga/riwayat",
      label: "Riwayat Setoran",
      shortLabel: "Riwayat",
      icon: <History className="w-4 h-4" />,
    },
    {
      href: "/warga/kontribusi",
      label: "Kontribusi Saya",
      shortLabel: "Kontribusi",
      icon: <Droplets className="w-4 h-4" />,
    },
    {
      href: "/warga/leaderboard",
      label: "Leaderboard",
      shortLabel: "Peringkat",
      icon: <Award className="w-4 h-4" />,
    },
    {
      href: "/warga/dana",
      label: "Dana Program",
      shortLabel: "Dana",
      icon: <Coins className="w-4 h-4" />,
    },
    {
      href: "/warga/profil",
      label: "Profil",
      shortLabel: "Profil",
      icon: <User className="w-4 h-4" />,
    },
  ];

  // Bab 7.2 PRD: Navigasi Admin RT (termasuk Dana Program)
  const rtNav: NavItem[] = [
    {
      href: "/rt",
      label: "Dashboard RT",
      shortLabel: "Dashboard",
      icon: <Home className="w-4 h-4" />,
    },
    {
      href: "/rt/catat",
      label: "Catat Setoran",
      shortLabel: "Catat",
      icon: <PlusCircle className="w-4 h-4" />,
    },
    {
      href: "/rt/riwayat",
      label: "Riwayat Pengumpulan",
      shortLabel: "Riwayat",
      icon: <ClipboardCheck className="w-4 h-4" />,
    },
    {
      href: "/rt/rekap",
      label: "Rekap RT",
      shortLabel: "Rekap",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      href: "/rt/dana",
      label: "Dana Program",
      shortLabel: "Dana",
      icon: <Coins className="w-4 h-4" />,
    },
    {
      href: "/rt/profil",
      label: "Profil",
      shortLabel: "Profil",
      icon: <User className="w-4 h-4" />,
    },
  ];

  // Bab 7.3 PRD: Navigasi Super Admin RW
  const rwNav: NavItem[] = [
    {
      href: "/rw",
      label: "Dashboard RW",
      shortLabel: "Dashboard",
      icon: <Home className="w-4 h-4" />,
    },
    {
      href: "/rw/pengumpulan",
      label: "Pengumpulan 7 RT",
      shortLabel: "Pengumpulan",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      href: "/rw/penyerahan",
      label: "Penyerahan ke Dinas",
      shortLabel: "Dinas",
      icon: <Truck className="w-4 h-4" />,
    },
    {
      href: "/rw/dana",
      label: "Dana Program",
      shortLabel: "Dana",
      icon: <Coins className="w-4 h-4" />,
    },
    {
      href: "/rw/pembelian",
      label: "Pembelian Sembako",
      shortLabel: "Pembelian",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      href: "/rw/paket-inventaris",
      label: "Paket Standar & Stok",
      shortLabel: "Inventaris",
      icon: <Package className="w-4 h-4" />,
    },
    {
      href: "/rw/distribusi",
      label: "Distribusi Sembako",
      shortLabel: "Distribusi",
      icon: <HeartHandshake className="w-4 h-4" />,
    },
    {
      href: "/rw/pengguna",
      label: "Data Warga & Admin",
      shortLabel: "Pengguna",
      icon: <Users className="w-4 h-4" />,
    },
    {
      href: "/rw/laporan",
      label: "Laporan & Audit",
      shortLabel: "Laporan",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  const activeNav =
    currentUser.role === "WARGA"
      ? wargaNav
      : currentUser.role === "ADMIN_RT"
      ? rtNav
      : rwNav;

  const handleSwitchUser = (userId: string) => {
    const selected = users.find((u) => u.id === userId);
    if (!selected) return;
    setCurrentUserById(userId);
    if (selected.role === "WARGA") router.push("/warga");
    else if (selected.role === "ADMIN_RT") router.push("/rt");
    else router.push("/rw");
  };

  const roleBadgeLabel =
    currentUser.role === "WARGA"
      ? `Warga • ${currentUser.rt}`
      : currentUser.role === "ADMIN_RT"
      ? `Admin Relawan • ${currentUser.rt}`
      : "Super Admin RW (7 RT)";

  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden w-full flex flex-col bg-cream text-ink overflow-x-hidden">
      {/* Banner Prototipe & Switcher Peran (Full-Width) */}
      <div className="w-full shrink-0 bg-forest-dark text-white text-xs border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-ink font-bold text-[11px] shrink-0">
              <SlidersHorizontal className="w-3 h-3" />
              {isIllustrativeMode
                ? "MODE DATA ILUSTRATIF (PROTOTIPE)"
                : "MODE DATA KOSONG (TANPA DATA FIKTIF)"}
            </span>
            <span className="text-cream/85 hidden sm:inline truncate">
              Sesuai Aturan Bisnis #14 PRD: Data contoh diberi label ilustratif.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-[11px] text-sage font-medium">
              Simulasi Peran Aktif:
            </label>
            <select
              aria-label="Pilih Peran Pengguna"
              value={currentUser.id}
              onChange={(e) => handleSwitchUser(e.target.value)}
              className="max-w-full bg-forest text-white border border-sage/40 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.role === "SUPER_ADMIN_RW"
                    ? `[Super Admin RW] ${u.name}`
                    : u.role === "ADMIN_RT"
                    ? `[Admin ${u.rt}] ${u.name}`
                    : `[Warga ${u.rt}] ${u.name}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => toggleDataMode(!isIllustrativeMode)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition shrink-0"
            >
              {isIllustrativeMode
                ? "Ubah ke Seed Kosong"
                : "Muat Contoh Ilustratif"}
            </button>
          </div>
        </div>
      </div>

      {/* Top Header Bar (Full-Width) */}
      <header className="sticky top-0 z-30 w-full shrink-0 bg-white/95 backdrop-blur border-b border-line px-3 sm:px-6 lg:px-8 py-3">
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-line text-ink hover:bg-sage/40 shrink-0"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href={
                currentUser.role === "WARGA"
                  ? "/warga"
                  : currentUser.role === "ADMIN_RT"
                  ? "/rt"
                  : "/rw"
              }
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg text-forest tracking-tight truncate">
                    Jelantah Berkah
                  </span>
                  <span className="hidden md:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sage text-forest shrink-0">
                    Sedekah Minyak Jelantah & Sembako
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted hidden sm:block truncate">
                  Program Sosial Lingkungan RW (7 RT) • Tanpa Transaksi Uang ke
                  Warga
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="text-right">
              <p className="text-xs sm:text-sm font-semibold text-ink leading-tight max-w-[140px] sm:max-w-none truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] font-medium text-forest">
                {roleBadgeLabel}
              </p>
            </div>
            <Link
              href="/login"
              className="p-2 rounded-xl border border-line text-ink-muted hover:text-forest hover:bg-sage/40 transition"
              title="Halaman Masuk / Ganti Akun"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Full-Screen Layout Container (Bab 10.4 PRD: Full-Width & Full-Height Viewport) */}
      <div className="flex-1 w-full min-h-0 flex flex-col lg:flex-row">
        {/* Sidebar Desktop Full-Height */}
        <aside className="hidden lg:flex lg:flex-col lg:justify-between lg:w-64 xl:w-72 shrink-0 bg-white border-r border-line overflow-y-auto p-4">
          <div className="space-y-1">
            <div className="px-3 py-2 border-b border-line mb-2">
              <p className="text-[11px] uppercase tracking-wider font-bold text-ink-muted">
                Menu Navigasi
              </p>
              <p className="text-xs font-semibold text-forest mt-0.5">
                {roleBadgeLabel}
              </p>
            </div>

            {activeNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-forest text-white shadow-sm"
                      : "text-ink hover:bg-sage/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 mt-4 border-t border-line px-3.5 py-3 bg-cream/60 rounded-xl">
            <p className="text-[11px] font-semibold text-forest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Prinsip Program
            </p>
            <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
              Hanya mengelola sedekah minyak jelantah (Liter). Hasil penyerahan
              ke Dinas Kebersihan Kota Bekasi disalurkan menjadi paket sembako
              seragam bagi satpam.
            </p>
          </div>
        </aside>

        {/* Drawer Navigasi Mobile & Tablet */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-72 max-w-[82vw] bg-white h-full shadow-xl p-4 flex flex-col justify-between z-10 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div>
                    <p className="font-bold text-forest">Jelantah Berkah</p>
                    <p className="text-xs text-ink-muted">{roleBadgeLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg border border-line"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="mt-3 space-y-1">
                  {activeNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive
                            ? "bg-forest text-white"
                            : "text-ink hover:bg-sage/50"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-line">
                <Link
                  href="/login"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-line text-xs font-semibold text-ink hover:bg-sage/40"
                >
                  <LogOut className="w-4 h-4" />
                  Halaman Login / Ganti Peran
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Area Konten Utama Full-Width & Viewport-Scrollable */}
        <main className="flex-1 min-w-0 w-full lg:overflow-y-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8 space-y-5">
          {children}
        </main>
      </div>

      {/* Bottom Navigation Bar untuk Layar HP/Mobile & Tablet */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-line px-1.5 py-1.5">
        <div className="grid grid-cols-6 gap-1 w-full">
          {activeNav.slice(0, 6).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-medium transition ${
                  isActive
                    ? "bg-forest text-white"
                    : "text-ink-muted hover:text-forest"
                }`}
              >
                {item.icon}
                <span className="mt-1 truncate max-w-full">
                  {item.shortLabel || item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
