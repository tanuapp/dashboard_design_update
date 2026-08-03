import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";
import { ReportsPage } from "@/components/dashboard/pages/ReportsPage";

export const Route = createFileRoute("/business/dashboard/reports")({
  head: () => ({ meta: [{ title: "Тайлан — Tanu Business" }] }),
  component: () => (
    <OwnerOnlyGuard>
      <ReportsPage />
    </OwnerOnlyGuard>
  ),
});
