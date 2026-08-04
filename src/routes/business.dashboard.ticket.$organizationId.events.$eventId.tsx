import { createFileRoute } from "@tanstack/react-router";
import { EventDetailPage } from "@/features/ticket/events/EventDetailPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";

export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/events/$eventId")({
  component: EventDetailRoute,
});

function EventDetailRoute() {
  const { eventId } = Route.useParams();
  return (
    <TicketPermissionGate permission="ticket.events.manage">
      <EventDetailPage eventId={eventId} />
    </TicketPermissionGate>
  );
}
