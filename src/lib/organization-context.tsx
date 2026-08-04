import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { buildLegacyMemberships, getOrganizationById, ORGANIZATIONS } from "@/lib/organizations";
import { businessModules } from "@/lib/module-registry";
import type { BusinessOrganization, OrganizationMembership } from "@/lib/organization";

interface OrganizationContextValue {
  organizations: BusinessOrganization[];
  memberships: OrganizationMembership[];
  selectedOrganizationId: string;
  selectedOrganization: BusinessOrganization;
  currentMembership: OrganizationMembership;
  businessType: BusinessOrganization["businessType"];
  permissions: string[];
  availableModules: string[];
  selectOrganization: (organizationId: string) => void;
  hasPermission: (permission: string) => boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) throw new Error("OrganizationProvider requires an authenticated session");

  const memberships = useMemo(
    () =>
      session.memberships?.length
        ? session.memberships
        : buildLegacyMemberships({
            email: session.email,
            role: session.role,
            organizationType: session.organizationType,
          }),
    [session],
  );
  const organizations = useMemo(
    () =>
      memberships
        .map((membership) => getOrganizationById(membership.organizationId))
        .filter((organization): organization is BusinessOrganization => Boolean(organization)),
    [memberships],
  );
  const storageKey = `tanu-selected-organization:${session.email}`;
  const fallbackId = organizations[0]?.id ?? ORGANIZATIONS[0].id;
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(fallbackId);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && memberships.some((membership) => membership.organizationId === saved)) {
        setSelectedOrganizationId(saved);
      } else {
        setSelectedOrganizationId(fallbackId);
      }
    } catch {
      setSelectedOrganizationId(fallbackId);
    }
  }, [fallbackId, memberships, storageKey]);

  const selectedOrganization =
    organizations.find((organization) => organization.id === selectedOrganizationId) ??
    organizations[0] ??
    ORGANIZATIONS[0];
  const currentMembership =
    memberships.find((membership) => membership.organizationId === selectedOrganization.id) ??
    memberships[0];

  const selectOrganization = useCallback(
    (organizationId: string) => {
      if (!memberships.some((membership) => membership.organizationId === organizationId)) return;
      setSelectedOrganizationId(organizationId);
      try {
        localStorage.setItem(storageKey, organizationId);
      } catch {
        // Local persistence is optional; in-memory switching still works.
      }
    },
    [memberships, storageKey],
  );

  const value = useMemo<OrganizationContextValue>(
    () => ({
      organizations,
      memberships,
      selectedOrganizationId: selectedOrganization.id,
      selectedOrganization,
      currentMembership,
      businessType: selectedOrganization.businessType,
      permissions: currentMembership.permissions,
      availableModules: businessModules[selectedOrganization.businessType].map(
        (module) => module.id,
      ),
      selectOrganization,
      hasPermission: (permission) =>
        currentMembership.role === "owner" ||
        currentMembership.role === "admin" ||
        currentMembership.permissions.includes(permission),
    }),
    [currentMembership, memberships, organizations, selectOrganization, selectedOrganization],
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const value = useContext(OrganizationContext);
  if (!value) throw new Error("useOrganization must be used within OrganizationProvider");
  return value;
}
