import type { OrganizationType } from "@/lib/organization";

export type SettingsSectionKey =
  | "organization"
  | "profile"
  | "branches"
  | "employees"
  | "access"
  | "services"
  | "booking"
  | "schedule"
  | "attendance"
  | "notifications"
  | "qr"
  | "public-links"
  | "security"
  | "billing";

export type SettingsGroupKey = "main" | "operations" | "promotion" | "system";

export interface SettingsNavigationGroup {
  id: SettingsGroupKey;
  label: string;
  items: SettingsSectionKey[];
}

export interface QrTypeOption {
  value: string;
  label: string;
  defaultPath: string;
  relation?: "branch" | "employee" | "service";
}

interface OrganizationSettingsConfig {
  organizationId: string;
  terms: {
    organization: string;
    employee: string;
    branch: string;
    service: string;
    profile: string;
  };
  navigation: SettingsNavigationGroup[];
  qrTypes: QrTypeOption[];
  publicLinkLabel: string;
}

const sharedGroups = {
  promotion: {
    id: "promotion",
    label: "СУРТАЛЧИЛГАА БА ХОЛБООС",
    items: ["qr", "public-links"],
  },
  system: {
    id: "system",
    label: "СИСТЕМ",
    items: ["security", "billing"],
  },
} satisfies Record<"promotion" | "system", SettingsNavigationGroup>;

export const settingsOrganizationConfig: Record<OrganizationType, OrganizationSettingsConfig> = {
  private: {
    organizationId: "org-private-aura",
    terms: {
      organization: "Байгууллага",
      employee: "Ажилтан",
      branch: "Салбар",
      service: "Үйлчилгээ",
      profile: "Профайл",
    },
    navigation: [
      {
        id: "main",
        label: "ҮНДСЭН ТОХИРГОО",
        items: ["organization", "profile", "branches", "employees", "access"],
      },
      {
        id: "operations",
        label: "ҮЙЛ АЖИЛЛАГААНЫ ТОХИРГОО",
        items: ["services", "booking", "schedule", "attendance", "notifications"],
      },
      sharedGroups.promotion,
      sharedGroups.system,
    ],
    qrTypes: [
      {
        value: "organization_profile",
        label: "Байгууллагын нийтийн профайл",
        defaultPath: "/public/aura-beauty",
      },
      { value: "booking", label: "Цаг захиалгын хуудас", defaultPath: "/book/aura-beauty" },
      {
        value: "service",
        label: "Үйлчилгээний жагсаалт",
        defaultPath: "/public/aura-beauty/services",
        relation: "service",
      },
      {
        value: "employee_booking",
        label: "Ажилтнаар цаг захиалах",
        defaultPath: "/book/aura-beauty/employee",
        relation: "employee",
      },
      {
        value: "branch",
        label: "Салбарын хуудас",
        defaultPath: "/public/aura-beauty/branch",
        relation: "branch",
      },
      { value: "app_download", label: "Апп татах холбоос", defaultPath: "/app" },
      { value: "feedback", label: "Үнэлгээ, санал хүсэлт", defaultPath: "/feedback/aura-beauty" },
      { value: "custom_url", label: "Custom public URL", defaultPath: "" },
    ],
    publicLinkLabel: "Цаг захиалгын нийтийн холбоос",
  },
  government: {
    organizationId: "org-government-demo",
    terms: {
      organization: "Төрийн байгууллага",
      employee: "Албан хаагч",
      branch: "Газар, хэлтэс",
      service: "Нийтийн үйлчилгээ",
      profile: "Нийтийн мэдээлэл",
    },
    navigation: [
      {
        id: "main",
        label: "ҮНДСЭН ТОХИРГОО",
        items: ["organization", "profile", "branches", "employees", "access"],
      },
      {
        id: "operations",
        label: "ҮЙЛ АЖИЛЛАГААНЫ ТОХИРГОО",
        items: ["schedule", "attendance", "notifications"],
      },
      sharedGroups.promotion,
      {
        id: "system",
        label: "СИСТЕМ",
        items: ["security"],
      },
    ],
    qrTypes: [
      {
        value: "government_information",
        label: "Байгууллагын нийтийн мэдээлэл",
        defaultPath: "/government/public/information",
      },
      {
        value: "government_request",
        label: "Хүсэлт, өргөдлийн маягт",
        defaultPath: "/government/public/request",
      },
      {
        value: "employee_directory",
        label: "Албан хаагчдын лавлах",
        defaultPath: "/government/public/directory",
      },
      {
        value: "official_announcement",
        label: "Албан ёсны зарлал",
        defaultPath: "/government/public/announcements",
      },
      {
        value: "public_service",
        label: "Нийтийн үйлчилгээний холбоос",
        defaultPath: "/government/public/services",
      },
      { value: "custom_url", label: "Custom public URL", defaultPath: "" },
    ],
    publicLinkLabel: "Нийтийн мэдээллийн холбоос",
  },
};

export function normalizeSettingsSection(
  value: unknown,
  organizationType: OrganizationType,
): SettingsSectionKey {
  const visible = settingsOrganizationConfig[organizationType].navigation.flatMap(
    (group) => group.items,
  );
  return typeof value === "string" && visible.includes(value as SettingsSectionKey)
    ? (value as SettingsSectionKey)
    : "organization";
}
