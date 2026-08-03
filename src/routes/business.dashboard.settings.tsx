import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";
import { SettingsPage } from "@/components/dashboard/pages/SettingsPage";

export const Route = createFileRoute("/business/dashboard/settings")({
  head: () => ({ meta: [{ title: "Тохиргоо — Tanu Business" }] }),
  component: () => (
    <OwnerOnlyGuard>
      <SettingsPage />
    </OwnerOnlyGuard>
  ),
});
