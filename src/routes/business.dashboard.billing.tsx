import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";
import { BillingPage } from "@/components/dashboard/pages/BillingPage";

export const Route = createFileRoute("/business/dashboard/billing")({
  head: () => ({ meta: [{ title: "Багц, төлбөр — Tanu Business" }] }),
  component: () => (
    <OwnerOnlyGuard>
      <BillingPage />
    </OwnerOnlyGuard>
  ),
});
