import { createFileRoute } from "@tanstack/react-router";
import { VenuesPage } from "@/features/ticket/venues/VenuesPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/venues/")({
  component: () => (
    <TicketPermissionGate permission="ticket.venues.manage">
      <VenuesPage />
    </TicketPermissionGate>
  ),
});
