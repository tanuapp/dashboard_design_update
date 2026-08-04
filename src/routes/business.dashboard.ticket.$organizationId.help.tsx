import { createFileRoute } from "@tanstack/react-router";
import { TicketHelpPage } from "@/features/ticket/help/TicketHelpPage";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/help")({
  component: TicketHelpPage,
});
