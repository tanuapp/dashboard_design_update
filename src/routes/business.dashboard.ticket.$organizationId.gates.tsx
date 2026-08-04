import { createFileRoute } from "@tanstack/react-router";
import { EntryGatesPage } from "@/features/ticket/gates/EntryGatesPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/gates")({
  component: () => (
    <TicketPermissionGate permission="ticket.gates.manage">
      <EntryGatesPage />
    </TicketPermissionGate>
  ),
});
