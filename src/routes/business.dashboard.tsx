import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DashboardDataProvider } from "@/lib/dashboard/store";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GovernmentShell } from "@/components/government/GovernmentShell";
import { GovernmentDataProvider } from "@/lib/government/store";
import { normalizeOrganizationType } from "@/lib/organization";

export const Route = createFileRoute("/business/dashboard")({
  head: () => ({
    meta: [{ title: "Tanu Business — Хяналтын самбар" }],
  }),
  component: BusinessDashboardLayout,
});

function BusinessDashboardLayout() {
  const { session, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !session) navigate({ to: "/login" });
  }, [ready, session, navigate]);

  if (!ready || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DashboardDataProvider initialRole={session.role}>
      <GovernmentDataProvider initialPermission={session.permissionPreset}>
        {normalizeOrganizationType(session.organizationType) === "government" ? (
          <GovernmentShell session={session} />
        ) : (
          <DashboardShell session={session} />
        )}
      </GovernmentDataProvider>
    </DashboardDataProvider>
  );
}
