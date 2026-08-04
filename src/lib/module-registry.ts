import type { ComponentType } from "react";
import {
  BarChart3,
  Bell,
  Building,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  CreditCard,
  DoorOpen,
  HelpCircle,
  IdCard,
  LayoutDashboard,
  LayoutList,
  MapPinned,
  PlusCircle,
  QrCode,
  ScanLine,
  Settings,
  Ticket,
  TrendingUp,
  UserCheck,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import type { BusinessRole } from "@/lib/dashboard/types";
import type { BusinessType, OrganizationMembership } from "@/lib/organization";

export interface BusinessModuleDefinition {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  route: (organizationId: string) => string;
  requiredPermission?: string;
  roles?: BusinessRole[];
  businessTypes: BusinessType[];
}

const service = (item: Omit<BusinessModuleDefinition, "businessTypes">) => ({
  ...item,
  businessTypes: ["service"] as BusinessType[],
});

const ticket = (item: Omit<BusinessModuleDefinition, "businessTypes">) => ({
  ...item,
  businessTypes: ["ticket"] as BusinessType[],
});

const government = (item: Omit<BusinessModuleDefinition, "businessTypes">) => ({
  ...item,
  businessTypes: ["government"] as BusinessType[],
});

const serviceModules: BusinessModuleDefinition[] = [
  service({
    id: "overview",
    label: "Хяналтын самбар",
    route: () => "/business/dashboard",
    icon: LayoutDashboard,
    roles: ["owner", "admin"],
  }),
  service({
    id: "calendar",
    label: "Календарь",
    route: () => "/business/dashboard/calendar",
    icon: CalendarDays,
    roles: ["owner", "admin"],
  }),
  service({
    id: "bookings",
    label: "Захиалгууд",
    route: () => "/business/dashboard/bookings",
    icon: ClipboardList,
    roles: ["owner", "admin"],
  }),
  service({
    id: "employees",
    label: "Ажилтнууд",
    route: () => "/business/dashboard/employees",
    icon: Users,
    roles: ["owner", "admin"],
  }),
  service({
    id: "employee-schedule",
    label: "Ажилтны хуваарь",
    route: () => "/business/dashboard/employee-schedule",
    icon: CalendarClock,
    roles: ["owner", "admin"],
  }),
  service({
    id: "services",
    label: "Үйлчилгээнүүд",
    route: () => "/business/dashboard/services",
    icon: LayoutList,
    roles: ["owner", "admin"],
  }),
  service({
    id: "qr-promotion",
    label: "QR сурталчилгаа",
    route: () => "/business/dashboard/qr-promotion",
    icon: QrCode,
    roles: ["owner", "admin"],
  }),
  service({
    id: "customers",
    label: "Хэрэглэгчид",
    route: () => "/business/dashboard/customers",
    icon: IdCard,
    roles: ["owner", "admin"],
  }),
  service({
    id: "finance",
    label: "Санхүү",
    route: () => "/business/dashboard/finance",
    icon: Wallet,
    roles: ["owner", "admin"],
  }),
  service({
    id: "reports",
    label: "Тайлан",
    route: () => "/business/dashboard/reports",
    icon: BarChart3,
    roles: ["owner", "admin"],
  }),
  service({
    id: "branches",
    label: "Салбарууд",
    route: () => "/business/dashboard/branches",
    icon: Building2,
    roles: ["owner", "admin"],
  }),
  service({
    id: "notifications-oa",
    label: "Мэдэгдэл",
    route: () => "/business/dashboard/notifications",
    icon: Bell,
    roles: ["owner", "admin"],
  }),
  service({
    id: "org-profile",
    label: "Байгууллагын профайл",
    route: () => "/business/dashboard/org-profile",
    icon: Building,
    roles: ["owner", "admin"],
  }),
  service({
    id: "billing",
    label: "Багц, төлбөр",
    route: () => "/business/dashboard/billing",
    icon: CreditCard,
    roles: ["owner", "admin"],
  }),
  service({
    id: "settings",
    label: "Тохиргоо",
    route: () => "/business/dashboard/settings",
    icon: Settings,
    roles: ["owner", "admin"],
  }),
  service({
    id: "my-overview",
    label: "Миний хяналтын самбар",
    route: () => "/business/dashboard",
    icon: LayoutDashboard,
    roles: ["employee"],
  }),
  service({
    id: "my-calendar",
    label: "Миний календарь",
    route: () => "/business/dashboard/calendar",
    icon: CalendarDays,
    roles: ["employee"],
  }),
  service({
    id: "my-bookings",
    label: "Миний захиалгууд",
    route: () => "/business/dashboard/bookings",
    icon: ClipboardList,
    roles: ["employee"],
  }),
  service({
    id: "today-clients",
    label: "Өнөөдрийн үйлчлүүлэгчид",
    route: () => "/business/dashboard/today-clients",
    icon: UserCheck,
    roles: ["employee"],
  }),
  service({
    id: "performance",
    label: "Миний гүйцэтгэл",
    route: () => "/business/dashboard/performance",
    icon: TrendingUp,
    roles: ["employee"],
  }),
  service({
    id: "schedule",
    label: "Чөлөө, хуваарь",
    route: () => "/business/dashboard/schedule",
    icon: CalendarClock,
    roles: ["employee"],
  }),
  service({
    id: "notifications-emp",
    label: "Мэдэгдэл",
    route: () => "/business/dashboard/notifications",
    icon: Bell,
    roles: ["employee"],
  }),
  service({
    id: "my-profile",
    label: "Миний профайл",
    route: () => "/business/dashboard/profile",
    icon: UserCircle,
    roles: ["employee"],
  }),
];

const ticketModules: BusinessModuleDefinition[] = [
  ticket({
    id: "ticket-dashboard",
    label: "Хяналтын самбар",
    route: (id) => `/business/dashboard/ticket/${id}/dashboard`,
    icon: LayoutDashboard,
    requiredPermission: "ticket.dashboard.view",
  }),
  ticket({
    id: "ticket-orders",
    label: "Захиалга",
    route: (id) => `/business/dashboard/ticket/${id}/orders`,
    icon: ClipboardList,
    requiredPermission: "ticket.orders.view",
  }),
  ticket({
    id: "ticket-events",
    label: "Арга хэмжээ",
    route: (id) => `/business/dashboard/ticket/${id}/events`,
    icon: Ticket,
    requiredPermission: "ticket.events.manage",
  }),
  ticket({
    id: "ticket-event-new",
    label: "Шинэ арга хэмжээ",
    route: (id) => `/business/dashboard/ticket/${id}/events/new`,
    icon: PlusCircle,
    requiredPermission: "ticket.events.manage",
  }),
  ticket({
    id: "ticket-schedules",
    label: "Хуваарь",
    route: (id) => `/business/dashboard/ticket/${id}/schedules`,
    icon: CalendarDays,
    requiredPermission: "ticket.schedules.manage",
  }),
  ticket({
    id: "ticket-venues",
    label: "Байршил ба суудал",
    route: (id) => `/business/dashboard/ticket/${id}/venues`,
    icon: MapPinned,
    requiredPermission: "ticket.venues.manage",
  }),
  ticket({
    id: "ticket-types",
    label: "Тасалбар ба үнэ",
    route: (id) => `/business/dashboard/ticket/${id}/ticket-types`,
    icon: Ticket,
    requiredPermission: "ticket.pricing.manage",
  }),
  ticket({
    id: "ticket-gates",
    label: "Нэвтрэх хаалга",
    route: (id) => `/business/dashboard/ticket/${id}/gates`,
    icon: DoorOpen,
    requiredPermission: "ticket.gates.manage",
  }),
  ticket({
    id: "ticket-scanner",
    label: "QR шалгах",
    route: (id) => `/business/dashboard/ticket/${id}/scanner`,
    icon: ScanLine,
    requiredPermission: "ticket.scan",
  }),
  ticket({
    id: "ticket-reports",
    label: "Нэвтрэлтийн тайлан",
    route: (id) => `/business/dashboard/ticket/${id}/reports`,
    icon: BarChart3,
    requiredPermission: "ticket.reports.view",
  }),
  ticket({
    id: "ticket-settings",
    label: "Тохиргоо",
    route: (id) => `/business/dashboard/ticket/${id}/settings`,
    icon: Settings,
    requiredPermission: "ticket.settings.manage",
  }),
  ticket({
    id: "ticket-help",
    label: "Тусламж",
    route: (id) => `/business/dashboard/ticket/${id}/help`,
    icon: HelpCircle,
  }),
];

const governmentModules: BusinessModuleDefinition[] = [
  government({
    id: "government-dashboard",
    label: "Хяналтын самбар",
    route: () => "/business/dashboard",
    icon: LayoutDashboard,
  }),
  government({
    id: "government-employees",
    label: "Албан хаагч",
    route: () => "/business/dashboard/government/hr",
    icon: Users,
  }),
  government({
    id: "government-attendance",
    label: "Ирц",
    route: () => "/business/dashboard/government/attendance",
    icon: UserCheck,
  }),
  government({
    id: "government-departments",
    label: "Газар, хэлтэс",
    route: () => "/business/dashboard/government/directory",
    icon: Building2,
  }),
  government({
    id: "government-reports",
    label: "Тайлан",
    route: () => "/business/dashboard/government/reports",
    icon: BarChart3,
  }),
  government({
    id: "government-settings",
    label: "Тохиргоо",
    route: () => "/business/dashboard/settings",
    icon: Settings,
  }),
];

export const businessModules: Record<BusinessType, BusinessModuleDefinition[]> = {
  service: serviceModules,
  ticket: ticketModules,
  government: governmentModules,
  other: [],
};

export interface ResolvedBusinessModule extends Omit<BusinessModuleDefinition, "route"> {
  to: string;
  key: string;
}

export function resolveBusinessModules(input: {
  businessType: BusinessType;
  organizationId: string;
  membership: OrganizationMembership;
  serviceRole?: BusinessRole;
}): ResolvedBusinessModule[] {
  return businessModules[input.businessType]
    .filter((module) => {
      if (input.businessType === "service")
        return !module.roles || module.roles.includes(input.serviceRole ?? "employee");
      if (!module.requiredPermission) return true;
      return (
        input.membership.role === "owner" ||
        input.membership.role === "admin" ||
        input.membership.permissions.includes(module.requiredPermission)
      );
    })
    .map((module) => ({
      ...module,
      key: module.id,
      to: module.route(input.organizationId),
    }));
}

export function defaultOrganizationRoute(businessType: BusinessType, organizationId: string) {
  if (businessType === "ticket") return `/business/dashboard/ticket/${organizationId}/dashboard`;
  return "/business/dashboard";
}
