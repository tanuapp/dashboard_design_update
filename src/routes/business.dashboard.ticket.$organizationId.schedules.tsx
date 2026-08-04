import { createFileRoute } from "@tanstack/react-router";
import { SchedulesPage } from "@/features/ticket/schedules/SchedulesPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";

export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/schedules")({
  component: () => (
    <TicketPermissionGate permission="ticket.schedules.manage">
      <SchedulesPage />
    </TicketPermissionGate>
  ),
});
