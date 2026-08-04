import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { OwnerDashboardHome } from "@/components/dashboard/pages/DashboardHome";
import { EmployeeHome } from "@/components/dashboard/pages/EmployeeHome";
import { GovernmentDashboard } from "@/components/government/GovernmentDashboard";
import { normalizeOrganizationType } from "@/lib/organization";
import { useOrganization } from "@/lib/organization-context";

export const Route = createFileRoute("/business/dashboard/")({
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const { session } = useAuth();
  const { viewRole } = useDashboardData();
  const { businessType, currentMembership, selectedOrganization } = useOrganization();
  if (!session) return null;

  if (businessType === "government") {
    return <GovernmentDashboard session={session} />;
  }

  if (businessType === "ticket") {
    const dashboardAllowed =
      currentMembership.role === "owner" ||
      currentMembership.role === "admin" ||
      currentMembership.permissions.includes("ticket.dashboard.view");
    return (
      <Navigate
        to={
          dashboardAllowed
            ? "/business/dashboard/ticket/$organizationId/dashboard"
            : "/business/dashboard/ticket/$organizationId/scanner"
        }
        params={{ organizationId: selectedOrganization.id }}
        replace
      />
    );
  }

  void normalizeOrganizationType(session.organizationType);

  return viewRole === "employee" ? (
    <EmployeeHome session={session} />
  ) : (
    <OwnerDashboardHome session={session} />
  );
}
