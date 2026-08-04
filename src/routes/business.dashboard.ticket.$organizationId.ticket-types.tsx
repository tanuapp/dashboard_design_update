import { createFileRoute } from "@tanstack/react-router";
import { TicketTypesPage } from "@/features/ticket/ticket-types/TicketTypesPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/ticket-types")({
  component: () => (
    <TicketPermissionGate permission="ticket.pricing.manage">
      <TicketTypesPage />
    </TicketPermissionGate>
  ),
});
