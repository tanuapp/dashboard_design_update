import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { OwnerDashboardHome } from "@/components/dashboard/pages/DashboardHome";
import { EmployeeHome } from "@/components/dashboard/pages/EmployeeHome";
import { GovernmentDashboard } from "@/components/government/GovernmentDashboard";
import { normalizeOrganizationType } from "@/lib/organization";

export const Route = createFileRoute("/business/dashboard/")({
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const { session } = useAuth();
  const { viewRole } = useDashboardData();
  if (!session) return null;

  if (normalizeOrganizationType(session.organizationType) === "government") {
    return <GovernmentDashboard session={session} />;
  }

  return viewRole === "employee" ? (
    <EmployeeHome session={session} />
  ) : (
    <OwnerDashboardHome session={session} />
  );
}
