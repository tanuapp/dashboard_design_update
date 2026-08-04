import { createFileRoute } from "@tanstack/react-router";
import { OrdersPage } from "@/features/ticket/orders/OrdersPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";

export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/orders")({
  head: () => ({ meta: [{ title: "Захиалга — Tanu Business" }] }),
  component: () => (
    <TicketPermissionGate permission="ticket.orders.view">
      <OrdersPage />
    </TicketPermissionGate>
  ),
});
