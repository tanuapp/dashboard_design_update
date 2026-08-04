import { createFileRoute } from "@tanstack/react-router";
import { CreateEventPage } from "@/features/ticket/events/CreateEventPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";

export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/events/new")({
  head: () => ({ meta: [{ title: "Шинэ арга хэмжээ — Tanu Business" }] }),
  component: () => (
    <TicketPermissionGate permission="ticket.events.manage">
      <CreateEventPage />
    </TicketPermissionGate>
  ),
});
