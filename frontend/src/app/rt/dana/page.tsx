"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { RoleDeniedBanner } from "@/components/ui";
import { ProgramFinanceSummaryView } from "@/components/ProgramFinanceSummaryView";

export default function RTAdminProgramFinancePage() {
  const { currentUser } = useApp();

  if (currentUser.role !== "ADMIN_RT") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Admin RT"
        switchHref={currentUser.role === "WARGA" ? "/warga/dana" : "/rw/dana"}
      />
    );
  }

  return (
    <ProgramFinanceSummaryView
      viewerRoleLabel={`Admin Relawan ${currentUser.rt || ""}`}
    />
  );
}

