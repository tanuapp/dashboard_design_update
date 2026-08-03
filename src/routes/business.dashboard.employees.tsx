import { createFileRoute, Outlet } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";

export const Route = createFileRoute("/business/dashboard/employees")({
  component: () => (
    <OwnerOnlyGuard>
      <Outlet />
    </OwnerOnlyGuard>
  ),
});
