import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DashboardDataProvider } from "@/lib/dashboard/store";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GovernmentShell } from "@/components/government/GovernmentShell";
import { GovernmentDataProvider } from "@/lib/government/store";
import { normalizeOrganizationType } from "@/lib/organization";
import { OrganizationProvider, useOrganization } from "@/lib/organization-context";
import { TicketDataProvider } from "@/features/ticket/data/TicketDataProvider";

export const Route = createFileRoute("/business/dashboard")({
  head: () => ({
    meta: [
      { title: "TANU Business — Хяналтын самбар" },
      { name: "robots", content: "noindex, nofollow" },
    ],
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
        <OrganizationProvider>
          <TicketDataProvider>
            <SelectedOrganizationShell session={session} />
          </TicketDataProvider>
        </OrganizationProvider>
      </GovernmentDataProvider>
    </DashboardDataProvider>
  );
}

function SelectedOrganizationShell({
  session,
}: {
  session: NonNullable<ReturnType<typeof useAuth>["session"]>;
}) {
  const { businessType } = useOrganization();

  // Keep the legacy value readable for old persisted sessions. The selected
  // organization context is the workspace source of truth after login.
  void normalizeOrganizationType(session.organizationType);

  return businessType === "government" ? (
    <GovernmentShell session={session} />
  ) : (
    <DashboardShell session={session} />
  );
}
