import { Check, ChevronDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganization } from "@/lib/organization-context";
import { businessTypeLabel } from "@/lib/organization";
import { defaultOrganizationRoute } from "@/lib/module-registry";
import { resolveBusinessModules } from "@/lib/module-registry";
import { useDashboardData } from "@/lib/dashboard/store";
import type { BusinessRole } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function OrganizationSwitcher({ compact = false }: { compact?: boolean }) {
  const { organizations, selectedOrganization, memberships, selectOrganization } =
    useOrganization();
  const { viewRole } = useDashboardData();
  const navigate = useNavigate();

  const changeOrganization = (organizationId: string) => {
    const organization = organizations.find((item) => item.id === organizationId);
    if (!organization) return;
    const membership = memberships.find((item) => item.organizationId === organizationId);
    if (!membership) return;
    selectOrganization(organizationId);
    const serviceRole = ["owner", "admin", "employee"].includes(membership.role)
      ? (membership.role as BusinessRole)
      : viewRole;
    const firstAllowed = resolveBusinessModules({
      businessType: organization.businessType,
      organizationId: organization.id,
      membership,
      serviceRole,
    })[0]?.to;
    navigate({
      to: firstAllowed ?? defaultOrganizationRoute(organization.businessType, organization.id),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 min-w-0 items-center gap-2 rounded-lg border border-border bg-surface/75 px-2 text-left shadow-sm transition hover:bg-secondary",
            compact ? "w-9 justify-center px-0" : "max-w-[230px]",
          )}
          aria-label="Байгууллага солих"
        >
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gradient-brand text-[10px] font-extrabold text-white">
            {selectedOrganization.logoInitial}
          </span>
          {!compact && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold">
                {selectedOrganization.shortName}
              </span>
              <span className="block truncate text-[9px] text-muted-foreground">
                {businessTypeLabel[selectedOrganization.businessType]}
              </span>
            </span>
          )}
          {!compact && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>
          <p className="text-xs font-semibold">Байгууллага сонгох</p>
          <p className="mt-0.5 text-[10px] font-normal text-muted-foreground">
            Сонгосон байгууллагын ажлын орчин нээгдэнэ.
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((organization) => (
          <DropdownMenuItem
            key={organization.id}
            className="gap-2.5 py-2.5"
            onSelect={() => changeOrganization(organization.id)}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-extrabold text-[var(--brand)]">
              {organization.logoInitial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{organization.name}</span>
              <span className="block text-[10px] text-muted-foreground">
                {businessTypeLabel[organization.businessType]}
              </span>
            </span>
            {selectedOrganization.id === organization.id && (
              <Check className="h-4 w-4 shrink-0 text-[var(--brand)]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
