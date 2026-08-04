import { createFileRoute, Navigate } from "@tanstack/react-router";
import { resolveBusinessModules } from "@/lib/module-registry";
import { useOrganization } from "@/lib/organization-context";

export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/")({
  component: TicketOrganizationIndex,
});

function TicketOrganizationIndex() {
  const { organizationId } = Route.useParams();
  const { currentMembership } = useOrganization();
  const firstModule = resolveBusinessModules({
    businessType: "ticket",
    organizationId,
    membership: currentMembership,
  })[0];

  return (
    <Navigate to={firstModule?.to ?? `/business/dashboard/ticket/${organizationId}/help`} replace />
  );
}
