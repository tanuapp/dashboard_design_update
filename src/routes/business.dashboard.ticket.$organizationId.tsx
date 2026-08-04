import { createFileRoute } from "@tanstack/react-router";
import { TicketOrganizationBoundary } from "@/features/ticket/components/TicketRouteBoundary";

export const Route = createFileRoute("/business/dashboard/ticket/$organizationId")({
  component: TicketOrganizationLayout,
});

function TicketOrganizationLayout() {
  const { organizationId } = Route.useParams();
  return <TicketOrganizationBoundary organizationId={organizationId} />;
}
