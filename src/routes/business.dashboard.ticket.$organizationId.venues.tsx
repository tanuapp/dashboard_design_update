import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/business/dashboard/ticket/$organizationId/venues")({
  component: Outlet,
});
