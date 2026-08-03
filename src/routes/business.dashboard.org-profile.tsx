import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";
import { OrgProfilePage } from "@/components/dashboard/pages/OrgProfilePage";

export const Route = createFileRoute("/business/dashboard/org-profile")({
  head: () => ({ meta: [{ title: "Байгууллагын профайл — Tanu Business" }] }),
  component: () => (
    <OwnerOnlyGuard>
      <OrgProfilePage />
    </OwnerOnlyGuard>
  ),
});
