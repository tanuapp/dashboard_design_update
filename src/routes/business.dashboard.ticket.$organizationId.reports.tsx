import { createFileRoute } from "@tanstack/react-router";
import { EntryReportsPage } from "@/features/ticket/reports/EntryReportsPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/reports")({
  component: () => (
    <TicketPermissionGate permission="ticket.reports.view">
      <EntryReportsPage />
    </TicketPermissionGate>
  ),
});
