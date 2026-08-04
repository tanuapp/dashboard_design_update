import { createFileRoute } from "@tanstack/react-router";
import { TicketDashboardPage } from "@/features/ticket/dashboard/TicketDashboardPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";

export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/dashboard")({
  head: () => ({ meta: [{ title: "Тасалбарын хяналтын самбар — Tanu Business" }] }),
  component: () => (
    <TicketPermissionGate permission="ticket.dashboard.view">
      <TicketDashboardPage />
    </TicketPermissionGate>
  ),
});
