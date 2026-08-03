import type { ComponentType } from "react";
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarDays,
  CheckSquare2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquareMore,
  Network,
  UsersRound,
} from "lucide-react";
import type { GovernmentModuleKey } from "@/lib/government/types";

export interface GovernmentNavItem {
  key: GovernmentModuleKey;
  label: string;
  shortLabel: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  group: "Үндсэн" | "Бичиг хэрэг" | "Хүний нөөц" | "Харилцаа";
}

export const GOVERNMENT_NAV: GovernmentNavItem[] = [
  {
    key: "dashboard",
    label: "Хяналтын самбар",
    shortLabel: "Самбар",
    to: "/business/dashboard",
    icon: LayoutDashboard,
    group: "Үндсэн",
  },
  {
    key: "documents",
    label: "Албан бичиг",
    shortLabel: "Албан бичиг",
    to: "/business/dashboard/government/documents",
    icon: FileText,
    group: "Бичиг хэрэг",
  },
  {
    key: "tasks",
    label: "Үүрэг, даалгавар",
    shortLabel: "Даалгавар",
    to: "/business/dashboard/government/tasks",
    icon: CheckSquare2,
    group: "Үндсэн",
  },
  {
    key: "meetings",
    label: "Хурал, арга хэмжээ",
    shortLabel: "Хурал",
    to: "/business/dashboard/government/meetings",
    icon: CalendarDays,
    group: "Үндсэн",
  },
  {
    key: "petitions",
    label: "Өргөдөл, гомдол",
    shortLabel: "Өргөдөл",
    to: "/business/dashboard/government/petitions",
    icon: MessageSquareMore,
    group: "Бичиг хэрэг",
  },
  {
    key: "resolutions",
    label: "Тогтоол, шийдвэр",
    shortLabel: "Шийдвэр",
    to: "/business/dashboard/government/resolutions",
    icon: FileCheck2,
    group: "Бичиг хэрэг",
  },
  {
    key: "hr",
    label: "Хүний нөөц",
    shortLabel: "Хүний нөөц",
    to: "/business/dashboard/government/hr",
    icon: Network,
    group: "Хүний нөөц",
  },
  {
    key: "attendance",
    label: "Ирц бүртгэл",
    shortLabel: "Ирц",
    to: "/business/dashboard/government/attendance",
    icon: Clock3,
    group: "Хүний нөөц",
  },
  {
    key: "directory",
    label: "Ажилтны лавлах",
    shortLabel: "Лавлах",
    to: "/business/dashboard/government/directory",
    icon: UsersRound,
    group: "Хүний нөөц",
  },
  {
    key: "training",
    label: "Сургалт, хөгжил",
    shortLabel: "Сургалт",
    to: "/business/dashboard/government/training",
    icon: GraduationCap,
    group: "Хүний нөөц",
  },
  {
    key: "surveys",
    label: "Судалгаа",
    shortLabel: "Судалгаа",
    to: "/business/dashboard/government/surveys",
    icon: ClipboardCheck,
    group: "Харилцаа",
  },
  {
    key: "reports",
    label: "Тайлан, шинжилгээ",
    shortLabel: "Тайлан",
    to: "/business/dashboard/government/reports",
    icon: BarChart3,
    group: "Бичиг хэрэг",
  },
  {
    key: "notifications",
    label: "Мэдэгдэл",
    shortLabel: "Мэдэгдэл",
    to: "/business/dashboard/government/notifications",
    icon: Bell,
    group: "Харилцаа",
  },
];

export const GOVERNMENT_GROUPS = ["Үндсэн", "Бичиг хэрэг", "Хүний нөөц", "Харилцаа"] as const;

export const governmentModuleTitle: Record<GovernmentModuleKey, string> = {
  dashboard: "Төрийн байгууллагын хяналтын самбар",
  documents: "Албан бичиг",
  tasks: "Үүрэг, даалгавар",
  meetings: "Хурал, арга хэмжээ",
  petitions: "Өргөдөл, гомдол",
  hr: "Хүний нөөц",
  attendance: "Ирц бүртгэл",
  resolutions: "Тогтоол, шийдвэр",
  surveys: "Судалгаа",
  reports: "Тайлан, шинжилгээ",
  directory: "Ажилтны лавлах",
  training: "Сургалт, хөгжил",
  notifications: "Мэдэгдэл",
};

export const governmentModuleDescription: Record<GovernmentModuleKey, string> = {
  dashboard: "Байгууллагын сүүлийн үйл ажиллагаа, шийдвэрлэх ажил болон өнөөдрийн мэдээлэл.",
  documents: "Ирсэн, явсан албан бичиг, хяналт, баталгаажуулалт болон архив.",
  tasks: "Байгууллага, хэлтэс, ажилтанд оноосон үүрэг даалгаврын гүйцэтгэл.",
  meetings: "Хурал, зөвлөгөөн, арга хэмжээний тов, оролцогч болон тэмдэглэл.",
  petitions: "Иргэдийн өргөдөл, гомдлыг хүлээн авах, хуваарилах, шийдвэрлэх урсгал.",
  hr: "Бүтэц, орон тоо, томилгоо, шилжилт хөдөлгөөн болон ажил эрхлэлтийн түүх.",
  attendance: "Цахим ирц, ажлын цаг, чөлөө, томилолт болон хяналтын мэдээлэл.",
  resolutions: "Тогтоол, тушаал, шийдвэрийн бүртгэл, хэрэгжилт болон хяналт.",
  surveys: "Дотоод болон иргэдийн судалгаа, санал асуулга, үр дүнгийн нэгтгэл.",
  reports: "Удирдлагын тайлан, гүйцэтгэлийн үзүүлэлт болон аудитын мэдээлэл.",
  directory: "Албан хаагчдын холбоо барих мэдээлэл, албан тушаал, харьяалал.",
  training: "Сургалтын төлөвлөгөө, бүртгэл, хамрагдалт болон хөгжлийн түүх.",
  notifications: "Системийн болон байгууллагын мэдэгдэл, зарлал, сануулга.",
};

export function isGovernmentModule(value: string): value is GovernmentModuleKey {
  return GOVERNMENT_NAV.some((item) => item.key === value && item.key !== "dashboard");
}
