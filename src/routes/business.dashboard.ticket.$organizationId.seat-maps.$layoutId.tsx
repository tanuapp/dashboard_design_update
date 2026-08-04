import { createFileRoute } from "@tanstack/react-router";
import { SeatMapPage } from "@/features/ticket/venues/SeatMapPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute(
  "/business/dashboard/ticket/$organizationId/seat-maps/$layoutId",
)({ component: SeatMapRoute });
function SeatMapRoute() {
  const { layoutId } = Route.useParams();
  return (
    <TicketPermissionGate permission="ticket.layouts.manage">
      <SeatMapPage layoutId={layoutId} />
    </TicketPermissionGate>
  );
}
