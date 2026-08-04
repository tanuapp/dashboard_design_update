export type OrganizationType = "private" | "government";

export type BusinessType = "service" | "ticket" | "government" | "other";

export interface BusinessOrganization {
  id: string;
  name: string;
  shortName: string;
  logoInitial: string;
  businessType: BusinessType;
  status: "active" | "inactive";
}

export interface OrganizationMembership {
  organizationId: string;
  role: string;
  permissions: string[];
  venueIds?: string[];
}

export const organizationTypeLabel: Record<OrganizationType, string> = {
  private: "Хувийн хэвшил",
  government: "Төрийн байгууллага",
};

export const businessTypeLabel: Record<BusinessType, string> = {
  service: "Үйлчилгээний байгууллага",
  ticket: "Тасалбар, арга хэмжээ",
  government: "Төрийн байгууллага",
  other: "Бусад байгууллага",
};

export function normalizeOrganizationType(value?: string): OrganizationType {
  return value === "government" ? "government" : "private";
}

export function businessTypeFromLegacy(value?: OrganizationType): BusinessType {
  return value === "government" ? "government" : "service";
}
