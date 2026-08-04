import { createFileRoute } from "@tanstack/react-router";
import { HallDetailPage } from "@/features/ticket/venues/HallDetailPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/halls/$hallId")({
  component: HallDetailRoute,
});
function HallDetailRoute() {
  const { hallId } = Route.useParams();
  return (
    <TicketPermissionGate permission="ticket.venues.manage">
      <HallDetailPage hallId={hallId} />
    </TicketPermissionGate>
  );
}
