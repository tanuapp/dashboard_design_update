import { useEffect, useRef, type ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { LoadingState } from "@/components/dashboard/ui";
import { useOrganization } from "@/lib/organization-context";
import type { TicketPermission } from "@/features/ticket/types";
import { PermissionDenied } from "@/features/ticket/components/TicketUI";

export function TicketOrganizationBoundary({ organizationId }: { organizationId: string }) {
  const { organizations, memberships, selectedOrganization, selectOrganization } =
    useOrganization();
  const organization = organizations.find((item) => item.id === organizationId);
  const membership = memberships.find((item) => item.organizationId === organizationId);
  const selectedOrganizationIdRef = useRef(selectedOrganization.id);
  selectedOrganizationIdRef.current = selectedOrganization.id;

  useEffect(() => {
    if (
      organization?.businessType === "ticket" &&
      membership &&
      selectedOrganizationIdRef.current !== organizationId
    ) {
      selectOrganization(organizationId);
    }
  }, [membership, organization, organizationId, selectOrganization]);

  if (!organization || !membership || organization.businessType !== "ticket") {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-border bg-surface/80 p-8 text-center shadow-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-[var(--brand)]">
            <Building2 className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-lg font-bold">Ticket байгууллага олдсонгүй</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Энэ байгууллагад гишүүнчлэлгүй эсвэл ticket төрлийн байгууллага биш байна.
          </p>
        </div>
      </div>
    );
  }

  if (selectedOrganization.id !== organizationId) {
    return <LoadingState label="Байгууллагын ажлын орчинд шилжиж байна..." />;
  }

  return <Outlet />;
}

export function TicketPermissionGate({
  permission,
  children,
}: {
  permission: TicketPermission;
  children: ReactNode;
}) {
  const { currentMembership } = useOrganization();
  const allowed =
    currentMembership.role === "owner" ||
    currentMembership.role === "admin" ||
    currentMembership.permissions.includes(permission);
  return allowed ? <>{children}</> : <PermissionDenied permission={permission} />;
}
