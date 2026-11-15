"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function HomePage() {
  const { currentUser, jwtToken } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!jwtToken) {
      router.replace("/login");
      return;
    }
    if (currentUser.role === "WARGA") {
      router.replace("/warga");
    } else if (currentUser.role === "ADMIN_RT") {
      router.replace("/rt");
    } else {
      router.replace("/rw");
    }
  }, [currentUser, jwtToken, router]);

  return (
    <div className="p-8 text-center text-sm text-ink-muted">
      Mengarahkan ke halaman login...
    </div>
  );
}
