import { createFileRoute } from "@tanstack/react-router";
import { TicketSettingsPage } from "@/features/ticket/settings/TicketSettingsPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/settings")({
  component: () => (
    <TicketPermissionGate permission="ticket.settings.manage">
      <TicketSettingsPage />
    </TicketPermissionGate>
  ),
});
