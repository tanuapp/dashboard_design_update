import type { ComponentType } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  LayoutList,
  IdCard,
  Wallet,
  BarChart3,
  Building2,
  Bell,
  Building,
  Settings,
  UserCheck,
  TrendingUp,
  CalendarClock,
  UserCircle,
  CreditCard,
  QrCode,
} from "lucide-react";
import type { BusinessRole } from "@/lib/dashboard/types";

export interface DashboardNavItem {
  key: string;
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  roles: BusinessRole[];
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    key: "overview",
    label: "Хяналтын самбар",
    to: "/business/dashboard",
    icon: LayoutDashboard,
    roles: ["owner", "admin"],
  },
  {
    key: "calendar",
    label: "Календарь",
    to: "/business/dashboard/calendar",
    icon: CalendarDays,
    roles: ["owner", "admin"],
  },
  {
    key: "bookings",
    label: "Захиалгууд",
    to: "/business/dashboard/bookings",
    icon: ClipboardList,
    roles: ["owner", "admin"],
  },
  {
    key: "employees",
    label: "Ажилтнууд",
    to: "/business/dashboard/employees",
    icon: Users,
    roles: ["owner", "admin"],
  },
  {
    key: "employee-schedule",
    label: "Ажилтны хуваарь",
    to: "/business/dashboard/employee-schedule",
    icon: CalendarClock,
    roles: ["owner", "admin"],
  },
  {
    key: "services",
    label: "Үйлчилгээнүүд",
    to: "/business/dashboard/services",
    icon: LayoutList,
    roles: ["owner", "admin"],
  },
  {
    key: "qr-promotion",
    label: "QR сурталчилгаа",
    to: "/business/dashboard/qr-promotion",
    icon: QrCode,
    roles: ["owner", "admin"],
  },
  {
    key: "customers",
    label: "Хэрэглэгчид",
    to: "/business/dashboard/customers",
    icon: IdCard,
    roles: ["owner", "admin"],
  },
  {
    key: "finance",
    label: "Санхүү",
    to: "/business/dashboard/finance",
    icon: Wallet,
    roles: ["owner", "admin"],
  },
  {
    key: "reports",
    label: "Тайлан",
    to: "/business/dashboard/reports",
    icon: BarChart3,
    roles: ["owner", "admin"],
  },
  {
    key: "branches",
    label: "Салбарууд",
    to: "/business/dashboard/branches",
    icon: Building2,
    roles: ["owner", "admin"],
  },
  {
    key: "notifications-oa",
    label: "Мэдэгдэл",
    to: "/business/dashboard/notifications",
    icon: Bell,
    roles: ["owner", "admin"],
  },
  {
    key: "org-profile",
    label: "Байгууллагын профайл",
    to: "/business/dashboard/org-profile",
    icon: Building,
    roles: ["owner", "admin"],
  },
  {
    key: "billing",
    label: "Багц, төлбөр",
    to: "/business/dashboard/billing",
    icon: CreditCard,
    roles: ["owner", "admin"],
  },
  {
    key: "settings",
    label: "Тохиргоо",
    to: "/business/dashboard/settings",
    icon: Settings,
    roles: ["owner", "admin"],
  },

  {
    key: "my-overview",
    label: "Миний хяналтын самбар",
    to: "/business/dashboard",
    icon: LayoutDashboard,
    roles: ["employee"],
  },
  {
    key: "my-calendar",
    label: "Миний календарь",
    to: "/business/dashboard/calendar",
    icon: CalendarDays,
    roles: ["employee"],
  },
  {
    key: "my-bookings",
    label: "Миний захиалгууд",
    to: "/business/dashboard/bookings",
    icon: ClipboardList,
    roles: ["employee"],
  },
  {
    key: "today-clients",
    label: "Өнөөдрийн үйлчлүүлэгчид",
    to: "/business/dashboard/today-clients",
    icon: UserCheck,
    roles: ["employee"],
  },
  {
    key: "performance",
    label: "Миний гүйцэтгэл",
    to: "/business/dashboard/performance",
    icon: TrendingUp,
    roles: ["employee"],
  },
  {
    key: "schedule",
    label: "Чөлөө, хуваарь",
    to: "/business/dashboard/schedule",
    icon: CalendarClock,
    roles: ["employee"],
  },
  {
    key: "notifications-emp",
    label: "Мэдэгдэл",
    to: "/business/dashboard/notifications",
    icon: Bell,
    roles: ["employee"],
  },
  {
    key: "my-profile",
    label: "Миний профайл",
    to: "/business/dashboard/profile",
    icon: UserCircle,
    roles: ["employee"],
  },
];

export const roleLabel: Record<BusinessRole, string> = {
  owner: "Эзэмшигч",
  admin: "Админ",
  employee: "Ажилтан",
};
