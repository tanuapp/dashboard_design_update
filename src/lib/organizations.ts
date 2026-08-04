import type {
  BusinessOrganization,
  OrganizationMembership,
  OrganizationType,
} from "@/lib/organization";

export const ORGANIZATIONS: BusinessOrganization[] = [
  {
    id: "org-aura-beauty",
    name: "Aura Beauty Studio",
    shortName: "Aura Beauty",
    logoInitial: "A",
    businessType: "service",
    status: "active",
  },
  {
    id: "org-tanu-events",
    name: "Tanu Events Mongolia",
    shortName: "Tanu Events",
    logoInitial: "T",
    businessType: "ticket",
    status: "active",
  },
  {
    id: "org-city-digital",
    name: "Нийслэлийн Цахим хөгжил, мэдээллийн технологийн газар",
    shortName: "НЦХМТГ",
    logoInitial: "Н",
    businessType: "government",
    status: "active",
  },
];

const allTicketPermissions = [
  "ticket.dashboard.view",
  "ticket.orders.view",
  "ticket.orders.create",
  "ticket.orders.cancel",
  "ticket.orders.refund",
  "ticket.complimentary.create",
  "ticket.events.manage",
  "ticket.schedules.manage",
  "ticket.venues.manage",
  "ticket.layouts.manage",
  "ticket.pricing.manage",
  "ticket.gates.manage",
  "ticket.scan",
  "ticket.reports.view",
  "ticket.settings.manage",
];

export function ticketPermissionsForRole(role: string): string[] {
  if (role === "owner" || role === "admin") return allTicketPermissions;
  if (role === "event_manager")
    return [
      "ticket.dashboard.view",
      "ticket.orders.view",
      "ticket.orders.create",
      "ticket.events.manage",
      "ticket.schedules.manage",
      "ticket.pricing.manage",
      "ticket.reports.view",
    ];
  if (role === "venue_manager")
    return [
      "ticket.dashboard.view",
      "ticket.orders.view",
      "ticket.venues.manage",
      "ticket.layouts.manage",
      "ticket.gates.manage",
      "ticket.reports.view",
    ];
  if (role === "gate_staff")
    return ["ticket.dashboard.view", "ticket.orders.view", "ticket.gates.manage", "ticket.scan"];
  if (role === "scanner_staff") return ["ticket.scan"];
  if (role === "report_viewer") return ["ticket.dashboard.view", "ticket.reports.view"];
  return [];
}

export function buildLegacyMemberships(input: {
  email: string;
  role: string;
  organizationType?: OrganizationType;
}): OrganizationMembership[] {
  if (input.organizationType === "government") {
    return [
      {
        organizationId: "org-city-digital",
        role: input.role === "employee" ? "employee" : "organization-admin",
        permissions: ["government.workspace"],
      },
    ];
  }

  const serviceMembership: OrganizationMembership = {
    organizationId: "org-aura-beauty",
    role: input.role,
    permissions: input.role === "employee" ? ["service.employee"] : ["service.manage"],
  };

  if (input.role === "employee") return [serviceMembership];

  return [
    serviceMembership,
    {
      organizationId: "org-tanu-events",
      role: input.role,
      permissions: ticketPermissionsForRole(input.role),
    },
  ];
}

export function getOrganizationById(id: string) {
  return ORGANIZATIONS.find((organization) => organization.id === id);
}
