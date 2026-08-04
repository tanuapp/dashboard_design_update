import type { BusinessRole } from "@/lib/dashboard/types";
import { businessModules, type ResolvedBusinessModule } from "@/lib/module-registry";

export type DashboardNavItem = ResolvedBusinessModule;

// Compatibility export for existing service-only consumers. The active shell
// resolves navigation through the centralized module registry.
export const DASHBOARD_NAV: DashboardNavItem[] = businessModules.service.map((module) => ({
  ...module,
  key: module.id,
  to: module.route("org-aura-beauty"),
}));

export const roleLabel: Record<BusinessRole, string> = {
  owner: "Эзэмшигч",
  admin: "Админ",
  employee: "Ажилтан",
};
