"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function HomePage() {
  const { currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (currentUser.role === "WARGA") {
      router.replace("/warga");
    } else if (currentUser.role === "ADMIN_RT") {
      router.replace("/rt");
    } else {
      router.replace("/rw");
    }
  }, [currentUser, router]);

  return (
    <div className="p-8 text-center text-sm text-ink-muted">
      Mengarahkan ke beranda sesuai peran pengguna...
    </div>
  );
}

