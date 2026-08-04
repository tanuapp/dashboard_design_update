import { createFileRoute } from "@tanstack/react-router";
import { VenueDetailPage } from "@/features/ticket/venues/VenueDetailPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/venues/$venueId")({
  component: VenueDetailRoute,
});
function VenueDetailRoute() {
  const { venueId } = Route.useParams();
  return (
    <TicketPermissionGate permission="ticket.venues.manage">
      <VenueDetailPage venueId={venueId} />
    </TicketPermissionGate>
  );
}
