import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDashboardData } from "@/lib/dashboard/store";

/** Redirects employees away from owner/admin-only pages (finance, reports, branches, settings, org profile). */
export function OwnerOnlyGuard({ children }: { children: ReactNode }) {
  const { viewRole } = useDashboardData();
  const navigate = useNavigate();

  useEffect(() => {
    if (viewRole === "employee") navigate({ to: "/business/dashboard" });
  }, [viewRole, navigate]);

  if (viewRole === "employee") return null;
  return <>{children}</>;
}
