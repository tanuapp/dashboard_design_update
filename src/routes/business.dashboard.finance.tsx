import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";
import { FinancePage } from "@/components/dashboard/pages/FinancePage";

export const Route = createFileRoute("/business/dashboard/finance")({
  head: () => ({ meta: [{ title: "Санхүү — Tanu Business" }] }),
  component: () => (
    <OwnerOnlyGuard>
      <FinancePage />
    </OwnerOnlyGuard>
  ),
});
