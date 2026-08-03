export type GovernmentPermissionPreset =
  | "system-admin"
  | "organization-admin"
  | "executive"
  | "department-head"
  | "records-officer"
  | "hr-officer"
  | "petition-officer"
  | "employee"
  | "auditor"
  | "read-only";

export type GovernmentModuleKey =
  | "dashboard"
  | "documents"
  | "tasks"
  | "meetings"
  | "petitions"
  | "hr"
  | "attendance"
  | "resolutions"
  | "surveys"
  | "reports"
  | "directory"
  | "training"
  | "notifications";

export const governmentPermissionLabel: Record<GovernmentPermissionPreset, string> = {
  "system-admin": "Системийн админ",
  "organization-admin": "Байгууллагын админ",
  executive: "Удирдлага",
  "department-head": "Хэлтсийн дарга",
  "records-officer": "Бичиг хэргийн ажилтан",
  "hr-officer": "Хүний нөөцийн ажилтан",
  "petition-officer": "Өргөдөл, гомдол хариуцсан ажилтан",
  employee: "Ажилтан",
  auditor: "Аудитор",
  "read-only": "Зөвхөн харах",
};

const ALL_MODULES: GovernmentModuleKey[] = [
  "dashboard",
  "documents",
  "tasks",
  "meetings",
  "petitions",
  "hr",
  "attendance",
  "resolutions",
  "surveys",
  "reports",
  "directory",
  "training",
  "notifications",
];

export const governmentPermissionModules: Record<
  GovernmentPermissionPreset,
  GovernmentModuleKey[]
> = {
  "system-admin": ALL_MODULES,
  "organization-admin": ALL_MODULES,
  executive: ALL_MODULES,
  "department-head": [
    "dashboard",
    "documents",
    "tasks",
    "meetings",
    "petitions",
    "attendance",
    "resolutions",
    "surveys",
    "reports",
    "directory",
    "training",
    "notifications",
  ],
  "records-officer": [
    "dashboard",
    "documents",
    "tasks",
    "meetings",
    "resolutions",
    "reports",
    "directory",
    "notifications",
  ],
  "hr-officer": [
    "dashboard",
    "tasks",
    "meetings",
    "hr",
    "attendance",
    "reports",
    "directory",
    "training",
    "notifications",
  ],
  "petition-officer": [
    "dashboard",
    "documents",
    "tasks",
    "meetings",
    "petitions",
    "reports",
    "directory",
    "notifications",
  ],
  employee: [
    "dashboard",
    "documents",
    "tasks",
    "meetings",
    "attendance",
    "surveys",
    "directory",
    "training",
    "notifications",
  ],
  auditor: [
    "dashboard",
    "documents",
    "tasks",
    "meetings",
    "petitions",
    "hr",
    "attendance",
    "resolutions",
    "surveys",
    "reports",
    "directory",
    "training",
    "notifications",
  ],
  "read-only": [
    "dashboard",
    "documents",
    "meetings",
    "resolutions",
    "reports",
    "directory",
    "notifications",
  ],
};

export function hasGovernmentModuleAccess(
  preset: GovernmentPermissionPreset,
  module: GovernmentModuleKey,
) {
  return governmentPermissionModules[preset].includes(module);
}

export type GovernmentActivityType =
  | "document-received"
  | "task-assigned"
  | "task-updated"
  | "meeting-changed"
  | "announcement"
  | "petition-received"
  | "petition-resolved"
  | "attendance"
  | "document-decision";

export interface GovernmentActivity {
  id: string;
  type: GovernmentActivityType;
  title: string;
  description: string;
  actor: string;
  at: string;
  department?: string;
}

export interface GovernmentDepartment {
  id: string;
  name: string;
  parentId?: string;
  level: "organization" | "department" | "division" | "unit";
  headEmployeeId?: string;
  employeeCount: number;
}

export interface GovernmentEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  positionClassification: string;
  permissionPreset: GovernmentPermissionPreset;
  online: boolean;
  attendanceStatus: "present" | "remote" | "away" | "offline";
  checkIn?: string;
  checkOut?: string;
  appointmentDate: string;
}

export type OfficialDocumentStatus =
  "received" | "in-review" | "approved" | "rejected" | "archived";

export interface OfficialDocument {
  id: string;
  number: string;
  title: string;
  sender: string;
  receivedAt: string;
  dueDate?: string;
  responsibleDepartmentId: string;
  status: OfficialDocumentStatus;
  confidentiality: "public" | "internal" | "restricted";
}

export type GovernmentTaskStatus = "new" | "in-progress" | "blocked" | "completed";

export interface GovernmentTask {
  id: string;
  title: string;
  assigneeId: string;
  departmentId: string;
  dueDate: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: GovernmentTaskStatus;
  progress: number;
}

export interface GovernmentMeeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  attendeeCount: number;
  type: "meeting" | "event" | "training";
}

export type PetitionStatus = "submitted" | "received" | "in-review" | "resolved" | "closed";

export interface GovernmentPetition {
  id: string;
  number: string;
  subject: string;
  citizenName: string;
  receivedAt: string;
  dueDate: string;
  departmentId: string;
  status: PetitionStatus;
  channel: "web" | "email" | "paper" | "phone";
}

export type GovernmentRequestStatus =
  "draft" | "submitted" | "received" | "in-review" | "resolved" | "closed";

export interface GovernmentRequest {
  id: string;
  type: string;
  subtype: string;
  title: string;
  departmentId: string;
  responsibleEmployeeId: string;
  priority: "low" | "normal" | "high" | "urgent";
  dueDate: string;
  description: string;
  attachments: string[];
  relatedDocumentId?: string;
  reviewingManagerId: string;
  status: GovernmentRequestStatus;
  createdAt: string;
  createdBy: string;
}

export interface GovernmentNewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: string;
}
