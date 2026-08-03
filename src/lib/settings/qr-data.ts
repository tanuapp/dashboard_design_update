import type { OrganizationType } from "@/lib/organization";

export type SettingsQrStatus = "active" | "inactive";
export type SettingsQrFrame = "none" | "rounded" | "label" | "scan";

export interface SettingsQrRecord {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  destinationUrl: string;
  description: string;
  branchId?: string;
  employeeId?: string;
  serviceId?: string;
  foregroundColor: string;
  backgroundColor: string;
  logoEnabled: boolean;
  frameStyle: SettingsQrFrame;
  cta: string;
  expiresAt?: string;
  status: SettingsQrStatus;
  scanCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function createInitialQrRecords(
  organizationType: OrganizationType,
  organizationId: string,
  organizationName: string,
): SettingsQrRecord[] {
  const government = organizationType === "government";
  return [
    {
      id: "qr-primary",
      organizationId,
      name: government ? "Нийтийн мэдээллийн QR" : "Үндсэн цаг захиалгын QR",
      type: government ? "government_information" : "booking",
      destinationUrl: government
        ? "https://tanu.mn/government/public/information"
        : "https://tanu.mn/book/aura-beauty",
      description: `${organizationName}-ийн үндсэн public QR`,
      foregroundColor: "#071B3D",
      backgroundColor: "#FFFFFF",
      logoEnabled: true,
      frameStyle: "label",
      cta: government ? "Мэдээлэл авах" : "Цаг захиалах",
      status: "active",
      scanCount: government ? 846 : 1284,
      createdBy: "current-user",
      createdAt: "2026-07-18",
      updatedAt: "2026-08-03",
    },
    {
      id: "qr-secondary",
      organizationId,
      name: government ? "Хүсэлт илгээх QR" : "Үнэлгээ өгөх QR",
      type: government ? "government_request" : "feedback",
      destinationUrl: government
        ? "https://tanu.mn/government/public/request"
        : "https://tanu.mn/feedback/aura-beauty",
      description: government ? "Иргэдийн хүсэлт, өргөдөл" : "Үйлчилгээний дараах үнэлгээ",
      foregroundColor: "#175CD3",
      backgroundColor: "#FFFFFF",
      logoEnabled: false,
      frameStyle: "scan",
      cta: government ? "Хүсэлт илгээх" : "Санал өгөх",
      status: "active",
      scanCount: government ? 312 : 429,
      createdBy: "current-user",
      createdAt: "2026-07-24",
      updatedAt: "2026-08-01",
    },
    {
      id: "qr-other-organization",
      organizationId: "org-outside-workspace",
      name: "Өөр байгууллагын QR",
      type: "custom_url",
      destinationUrl: "https://example.com",
      description: "Энэ record UI-д хэзээ ч харагдахгүй.",
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF",
      logoEnabled: false,
      frameStyle: "none",
      cta: "Нээх",
      status: "active",
      scanCount: 999,
      createdBy: "other-user",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
  ];
}
