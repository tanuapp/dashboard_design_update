import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";
import { EmployeeSchedulePage } from "@/components/dashboard/pages/EmployeeSchedulePage";

export const Route = createFileRoute("/business/dashboard/employee-schedule")({
  head: () => ({ meta: [{ title: "Ажилтны цагийн хуваарь — Tanu Business" }] }),
  component: () => (
    <OwnerOnlyGuard>
      <EmployeeSchedulePage />
    </OwnerOnlyGuard>
  ),
});
