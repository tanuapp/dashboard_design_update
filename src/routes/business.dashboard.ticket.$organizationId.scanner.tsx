import { createFileRoute } from "@tanstack/react-router";
import { QrScannerPage } from "@/features/ticket/scanner/QrScannerPage";
import { TicketPermissionGate } from "@/features/ticket/components/TicketRouteBoundary";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/scanner")({
  component: () => (
    <TicketPermissionGate permission="ticket.scan">
      <QrScannerPage />
    </TicketPermissionGate>
  ),
});
