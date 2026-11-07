"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { RoleDeniedBanner } from "@/components/ui";
import { ProgramFinanceSummaryView } from "@/components/ProgramFinanceSummaryView";

export default function ResidentProgramFinancePage() {
  const { currentUser } = useApp();

  if (currentUser.role !== "WARGA") {
    return (
      <RoleDeniedBanner
        allowedRoleText="Warga"
        switchHref={currentUser.role === "ADMIN_RT" ? "/rt/dana" : "/rw/dana"}
      />
    );
  }

  return (
    <ProgramFinanceSummaryView
      viewerRoleLabel={`Warga ${currentUser.rt || ""}`}
    />
  );
}

