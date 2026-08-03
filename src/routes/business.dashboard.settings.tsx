import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";
import { SettingsPage } from "@/components/dashboard/pages/SettingsPage";
import type { SettingsSectionKey } from "@/lib/settings/config";

export const Route = createFileRoute("/business/dashboard/settings")({
  head: () => ({ meta: [{ title: "Тохиргоо — Tanu Business" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    section:
      typeof search.section === "string"
        ? (search.section as SettingsSectionKey)
        : ("organization" as SettingsSectionKey),
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  const { section } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <OwnerOnlyGuard>
      <SettingsPage
        activeSection={section}
        onSectionChange={(nextSection) =>
          navigate({ search: { section: nextSection }, replace: true })
        }
      />
    </OwnerOnlyGuard>
  );
}
