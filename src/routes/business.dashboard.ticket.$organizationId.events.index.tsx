import { createFileRoute } from "@tanstack/react-router";
import { EventsPage } from "@/features/ticket/events/EventsPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";

export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/events/")({
  head: () => ({ meta: [{ title: "Арга хэмжээ — Tanu Business" }] }),
  component: () => (
    <TicketPermissionGate permission="ticket.events.manage">
      <EventsPage />
    </TicketPermissionGate>
  ),
});
