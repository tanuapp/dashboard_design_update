export type OrganizationType = "private" | "government";

export const organizationTypeLabel: Record<OrganizationType, string> = {
  private: "Хувийн хэвшил",
  government: "Төрийн байгууллага",
};

export function normalizeOrganizationType(value?: string): OrganizationType {
  return value === "government" ? "government" : "private";
}
