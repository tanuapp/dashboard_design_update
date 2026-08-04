import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Archive,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  FileClock,
  FileText,
  Filter,
  GraduationCap,
  History,
  MapPin,
  MessageSquareMore,
  Network,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGovernmentData } from "@/lib/government/store";
import {
  governmentPermissionLabel,
  hasGovernmentModuleAccess,
  type GovernmentEmployee,
  type GovernmentModuleKey,
  type GovernmentTask,
} from "@/lib/government/types";
import { cn } from "@/lib/utils";
import { GovernmentRequestModal } from "./GovernmentRequestModal";
import { governmentModuleDescription, governmentModuleTitle } from "./government-nav";

const documentStatusLabel = {
  received: "Хүлээн авсан",
  "in-review": "Хянагдаж буй",
  approved: "Батлагдсан",
  rejected: "Татгалзсан",
  archived: "Архивласан",
} as const;

const petitionStatusLabel = {
  submitted: "Илгээсэн",
  received: "Хүлээн авсан",
  "in-review": "Хянагдаж буй",
  resolved: "Шийдвэрлэсэн",
  closed: "Хаасан",
} as const;

const taskStatusLabel: Record<GovernmentTask["status"], string> = {
  new: "Шинэ",
  "in-progress": "Хийгдэж буй",
  blocked: "Саатсан",
  completed: "Дууссан",
};

export function GovernmentModulePage({ module }: { module: GovernmentModuleKey }) {
  const { activePermission } = useGovernmentData();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [requestOpen, setRequestOpen] = useState(false);
  const canWrite = !["auditor", "read-only"].includes(activePermission);

  if (!hasGovernmentModuleAccess(activePermission, module)) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-border/80 bg-surface/80 p-8 text-center shadow-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-lg font-bold">Хандах эрх хүрэлцэхгүй байна</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {governmentPermissionLabel[activePermission]} эрхэд “{governmentModuleTitle[module]}”
            модуль нээлттэй биш байна.
          </p>
          <Button asChild className="mt-5">
            <Link to="/business/dashboard">Хяналтын самбарт буцах</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/business/dashboard" className="hover:text-foreground">
              Хяналтын самбар
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{governmentModuleTitle[module]}</span>
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {governmentModuleTitle[module]}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {governmentModuleDescription[module]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {module !== "attendance" && (
            <Button
              variant="outline"
              className="gap-2 rounded-lg"
              onClick={() => toast.success("Тайлан татахад бэлэн боллоо")}
            >
              <Download className="h-4 w-4" /> Экспорт
            </Button>
          )}
          {canWrite && !["reports", "notifications"].includes(module) && (
            <Button className="gap-2 rounded-lg" onClick={() => setRequestOpen(true)}>
              <Plus className="h-4 w-4" /> {primaryActionLabel(module)}
            </Button>
          )}
        </div>
      </div>

      <ModuleSummary module={module} />

      {!["hr", "reports", "attendance"].includes(module) && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-surface/75 p-3 shadow-sm">
          <div className="relative min-w-0 flex-1 basis-64 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`${governmentModuleTitle[module]}-ээс хайх`}
              className="h-9 pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-full sm:w-44">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх төлөв</SelectItem>
              <SelectItem value="active">Идэвхтэй</SelectItem>
              <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
              <SelectItem value="completed">Шийдвэрлэсэн</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <ModuleContent module={module} query={search.trim().toLocaleLowerCase("mn-MN")} />
      <GovernmentRequestModal open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}

function ModuleSummary({ module }: { module: GovernmentModuleKey }) {
  const { documents, tasks, meetings, petitions, employees, requests, activities } =
    useGovernmentData();
  const summary = useMemo(() => {
    switch (module) {
      case "documents":
        return [
          ["Нийт бичиг", documents.length, FileText, "brand"],
          [
            "Шинээр ирсэн",
            documents.filter((item) => item.status === "received").length,
            FileClock,
            "blue",
          ],
          [
            "Хянагдаж буй",
            documents.filter((item) => item.status === "in-review").length,
            Clock3,
            "warning",
          ],
          [
            "Батлагдсан",
            documents.filter((item) => item.status === "approved").length,
            CheckCircle2,
            "success",
          ],
        ];
      case "tasks":
        return [
          ["Нийт даалгавар", tasks.length, CheckSquare2, "brand"],
          [
            "Хийгдэж буй",
            tasks.filter((item) => item.status === "in-progress").length,
            Activity,
            "blue",
          ],
          [
            "Саатсан",
            tasks.filter((item) => item.status === "blocked").length,
            CircleAlert,
            "danger",
          ],
          [
            "Дууссан",
            tasks.filter((item) => item.status === "completed").length,
            CheckCircle2,
            "success",
          ],
        ];
      case "meetings":
        return [
          ["Нийт тов", meetings.length, CalendarDays, "brand"],
          [
            "Өнөөдөр",
            meetings.filter((item) => item.date === new Date().toISOString().slice(0, 10)).length,
            Clock3,
            "blue",
          ],
          ["Хурал", meetings.filter((item) => item.type === "meeting").length, Users, "warning"],
          [
            "Сургалт",
            meetings.filter((item) => item.type === "training").length,
            GraduationCap,
            "success",
          ],
        ];
      case "petitions":
        return [
          ["Нийт өргөдөл", petitions.length, MessageSquareMore, "brand"],
          [
            "Шинэ",
            petitions.filter((item) => item.status === "received").length,
            FileClock,
            "blue",
          ],
          [
            "Хянагдаж буй",
            petitions.filter((item) => item.status === "in-review").length,
            Clock3,
            "warning",
          ],
          [
            "Шийдвэрлэсэн",
            petitions.filter((item) => item.status === "resolved").length,
            CheckCircle2,
            "success",
          ],
        ];
      case "attendance":
        return [];
      case "hr":
      case "directory":
      case "training":
        return [
          ["Нийт албан хаагч", 86, UsersRound, "brand"],
          [
            "Өнөөдөр ирсэн",
            employees.filter((item) => item.attendanceStatus === "present").length,
            UserCheck,
            "success",
          ],
          ["Онлайн", employees.filter((item) => item.online).length, Activity, "blue"],
          ["Хэлтэс, нэгж", 5, Building2, "warning"],
        ];
      case "reports":
        return [
          ["Бэлэн тайлан", 12, BarChart3, "brand"],
          ["Энэ сард", 8, CalendarDays, "blue"],
          ["Хугацаа дөхсөн", 2, Clock3, "warning"],
          ["Баталгаажсан", 6, CheckCircle2, "success"],
        ];
      case "notifications":
        return [
          ["Нийт мэдэгдэл", activities.length, Activity, "brand"],
          ["Шинэ", 5, FileClock, "blue"],
          ["Сануулга", 3, Clock3, "warning"],
          ["Уншсан", activities.length - 5, CheckCircle2, "success"],
        ];
      default:
        return [
          ["Нийт бүртгэл", requests.length + 12, FileText, "brand"],
          ["Идэвхтэй", 7, Activity, "blue"],
          ["Хүлээгдэж буй", 3, Clock3, "warning"],
          ["Дууссан", 5, CheckCircle2, "success"],
        ];
    }
  }, [
    activities.length,
    documents,
    employees,
    meetings,
    module,
    petitions,
    requests.length,
    tasks,
  ]);

  if (summary.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {summary.map(([label, value, Icon, tone]) => {
        const SummaryIcon = Icon as React.ElementType;
        return (
          <div
            key={String(label)}
            className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface/80 p-3.5 shadow-sm"
          >
            <span
              className={cn(
                "grid h-10 w-10 place-items-center rounded-xl",
                summaryTone(String(tone)),
              )}
            >
              <SummaryIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xl font-bold tabular-nums">{String(value)}</p>
              <p className="text-xs text-muted-foreground">{String(label)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModuleContent({ module, query }: { module: GovernmentModuleKey; query: string }) {
  switch (module) {
    case "documents":
      return <DocumentsTable query={query} />;
    case "tasks":
      return <TasksTable query={query} />;
    case "meetings":
      return <MeetingsView query={query} />;
    case "petitions":
      return <PetitionsTable query={query} />;
    case "hr":
      return <HumanResourcesView />;
    case "attendance":
      return <AttendanceTable query={query} />;
    case "directory":
      return <DirectoryView query={query} />;
    case "reports":
      return <ReportsView />;
    case "training":
      return <TrainingView query={query} />;
    case "notifications":
      return <NotificationsView query={query} />;
    case "resolutions":
      return <ResolutionsView query={query} />;
    case "surveys":
      return <SurveysView query={query} />;
    default:
      return <GenericRegistry module={module} />;
  }
}

function DocumentsTable({ query }: { query: string }) {
  const { documents, departments } = useGovernmentData();
  const rows = documents.filter((item) =>
    `${item.number} ${item.title} ${item.sender}`.toLocaleLowerCase("mn-MN").includes(query),
  );
  return (
    <DataTable
      headers={[
        "Дугаар",
        "Албан бичгийн утга",
        "Илгээгч",
        "Хариуцах нэгж",
        "Хүлээн авсан",
        "Хугацаа",
        "Төлөв",
      ]}
    >
      {rows.map((document) => (
        <tr
          key={document.id}
          className="border-b border-border/60 last:border-0 hover:bg-surface-muted/35"
        >
          <Cell>
            <span className="font-mono text-xs font-semibold text-[var(--brand)]">
              {document.number}
            </span>
          </Cell>
          <Cell>
            <p className="max-w-sm font-medium">{document.title}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {document.confidentiality === "restricted"
                ? "Хязгаарлагдмал"
                : document.confidentiality === "internal"
                  ? "Дотоод"
                  : "Нээлттэй"}
            </p>
          </Cell>
          <Cell>{document.sender}</Cell>
          <Cell>
            {departments.find((item) => item.id === document.responsibleDepartmentId)?.name}
          </Cell>
          <Cell>{formatDate(document.receivedAt)}</Cell>
          <Cell>{document.dueDate ? formatDate(document.dueDate) : "—"}</Cell>
          <Cell>
            <StatusBadge status={document.status} label={documentStatusLabel[document.status]} />
          </Cell>
        </tr>
      ))}
    </DataTable>
  );
}

function TasksTable({ query }: { query: string }) {
  const { tasks, employees, departments } = useGovernmentData();
  const rows = tasks.filter((task) => task.title.toLocaleLowerCase("mn-MN").includes(query));
  return (
    <DataTable
      headers={[
        "Үүрэг, даалгавар",
        "Хариуцагч",
        "Хэлтэс",
        "Эцсийн хугацаа",
        "Ач холбогдол",
        "Гүйцэтгэл",
        "Төлөв",
      ]}
    >
      {rows.map((task) => (
        <tr
          key={task.id}
          className="border-b border-border/60 last:border-0 hover:bg-surface-muted/35"
        >
          <Cell>
            <p className="max-w-sm font-medium">{task.title}</p>
          </Cell>
          <Cell>{employees.find((item) => item.id === task.assigneeId)?.name}</Cell>
          <Cell>{departments.find((item) => item.id === task.departmentId)?.name}</Cell>
          <Cell>{formatDate(task.dueDate)}</Cell>
          <Cell>
            <PriorityBadge priority={task.priority} />
          </Cell>
          <Cell>
            <div className="flex min-w-28 items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-brand"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-[10px]">{task.progress}%</span>
            </div>
          </Cell>
          <Cell>
            <StatusBadge status={task.status} label={taskStatusLabel[task.status]} />
          </Cell>
        </tr>
      ))}
    </DataTable>
  );
}

function MeetingsView({ query }: { query: string }) {
  const { meetings } = useGovernmentData();
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {meetings
        .filter((item) =>
          `${item.title} ${item.location}`.toLocaleLowerCase("mn-MN").includes(query),
        )
        .map((meeting) => (
          <article
            key={meeting.id}
            className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 shrink-0 rounded-xl bg-brand-soft p-2 text-center text-[var(--brand)]">
                <p className="text-[10px] font-medium uppercase">
                  {new Date(`${meeting.date}T00:00:00`).toLocaleDateString("mn-MN", {
                    month: "short",
                  })}
                </p>
                <p className="text-xl font-bold">
                  {new Date(`${meeting.date}T00:00:00`).getDate()}
                </p>
              </div>
              <div>
                <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                  {meeting.type === "training" ? "Сургалт" : "Хурал"}
                </span>
                <h2 className="mt-2 font-semibold leading-5">{meeting.title}</h2>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5" /> {meeting.startTime}–{meeting.endTime}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {meeting.location}
              </p>
              <p className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> {meeting.attendeeCount} оролцогч ·{" "}
                {meeting.organizer}
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full rounded-lg">
              Дэлгэрэнгүй харах
            </Button>
          </article>
        ))}
    </div>
  );
}

function PetitionsTable({ query }: { query: string }) {
  const { petitions, departments } = useGovernmentData();
  return (
    <DataTable
      headers={[
        "Бүртгэлийн дугаар",
        "Өргөдлийн утга",
        "Иргэн",
        "Суваг",
        "Хариуцах нэгж",
        "Хугацаа",
        "Төлөв",
      ]}
    >
      {petitions
        .filter((item) =>
          `${item.number} ${item.subject} ${item.citizenName}`
            .toLocaleLowerCase("mn-MN")
            .includes(query),
        )
        .map((petition) => (
          <tr
            key={petition.id}
            className="border-b border-border/60 last:border-0 hover:bg-surface-muted/35"
          >
            <Cell>
              <span className="font-mono text-xs font-semibold text-[var(--brand)]">
                {petition.number}
              </span>
            </Cell>
            <Cell>
              <p className="max-w-sm font-medium">{petition.subject}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Ирсэн: {formatDate(petition.receivedAt)}
              </p>
            </Cell>
            <Cell>{petition.citizenName}</Cell>
            <Cell>
              {petition.channel === "web"
                ? "Цахим"
                : petition.channel === "paper"
                  ? "Цаас"
                  : petition.channel}
            </Cell>
            <Cell>{departments.find((item) => item.id === petition.departmentId)?.name}</Cell>
            <Cell>{formatDate(petition.dueDate)}</Cell>
            <Cell>
              <StatusBadge status={petition.status} label={petitionStatusLabel[petition.status]} />
            </Cell>
          </tr>
        ))}
    </DataTable>
  );
}

function HumanResourcesView() {
  const { departments, employees } = useGovernmentData();
  const lifecycle = [
    ["Томилгоо", "3 шинэ", UserPlus],
    ["Шилжилт хөдөлгөөн", "2 хүсэлт", ArrowRight],
    ["Чөлөөлөлт", "1 төлөвлөсөн", UserMinus],
    ["Чөлөө", "6 хүсэлт", CalendarDays],
    ["Томилолт", "4 идэвхтэй", Plane],
    ["Сургалт", "12 хөтөлбөр", GraduationCap],
    ["Ирц", "82%", UserCheck],
    ["Аудитын түүх", "148 бичлэг", History],
  ] as const;
  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold">
          <Network className="h-4 w-4 text-[var(--brand)]" /> Байгууллагын бүтэц
        </h2>
        <div className="mt-4 space-y-2">
          {departments.map((department) => (
            <div
              key={department.id}
              className={cn(
                "rounded-lg border border-border/60 px-3 py-2.5",
                department.level === "organization" ? "bg-brand-soft" : "bg-surface-muted/30",
                department.level === "division" && "ml-4",
                department.level === "unit" && "ml-4",
              )}
            >
              <p className="text-xs font-medium">{department.name}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {department.employeeCount} албан хаагч · {structureLabel(department.level)}
              </p>
            </div>
          ))}
        </div>
      </section>
      <div className="min-w-0 space-y-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {lifecycle.map(([label, value, Icon]) => (
            <div
              key={label}
              className="rounded-xl border border-border/80 bg-surface/80 p-3 shadow-sm"
            >
              <Icon className="h-4 w-4 text-[var(--brand)]" />
              <p className="mt-3 text-sm font-semibold">{value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <DataTable
          headers={[
            "Албан хаагч",
            "Албан тушаал",
            "Ангилал",
            "Харьяалах нэгж",
            "Томилогдсон",
            "Эрхийн preset",
          ]}
        >
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className="border-b border-border/60 last:border-0 hover:bg-surface-muted/35"
            >
              <Cell>
                <p className="font-medium">{employee.name}</p>
                <p className="text-[10px] text-muted-foreground">{employee.email}</p>
              </Cell>
              <Cell>
                {employee.position}
                <p className="mt-1 text-[10px] text-[var(--brand)]">Ажлын байрны тодорхойлолт</p>
              </Cell>
              <Cell>
                <span className="rounded bg-secondary px-2 py-1 text-xs font-medium">
                  {employee.positionClassification}
                </span>
              </Cell>
              <Cell>{departments.find((item) => item.id === employee.departmentId)?.name}</Cell>
              <Cell>{formatDate(employee.appointmentDate)}</Cell>
              <Cell>{governmentPermissionLabel[employee.permissionPreset]}</Cell>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}

type GovernmentAttendancePeriod = "today" | "week" | "month";
type GovernmentAttendanceStatus =
  "present" | "late" | "remote" | "away" | "absent" | "off" | "pending";

interface GovernmentAttendanceRow {
  employee: GovernmentEmployee;
  date: string;
  departmentName: string;
  status: GovernmentAttendanceStatus;
  scheduleStart: string;
  scheduleEnd: string;
  checkIn?: string;
  checkOut?: string;
  plannedMinutes: number;
  workedMinutes: number;
  lateMinutes: number;
  earlyMinutes: number;
  overtimeMinutes: number;
  breakMinutes: number;
  source: string;
  location: string;
}

const governmentAttendanceStatusLabel: Record<GovernmentAttendanceStatus, string> = {
  present: "Хэвийн",
  late: "Хоцорсон",
  remote: "Зайнаас",
  away: "Түр гарсан",
  absent: "Тасалсан",
  off: "Амралт",
  pending: "Хүлээгдэж буй",
};

const governmentAttendanceStatusTone: Record<GovernmentAttendanceStatus, string> = {
  present:
    "border-[color-mix(in_oklch,var(--success)_24%,transparent)] bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]",
  late: "border-[color-mix(in_oklch,var(--warning)_24%,transparent)] bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] text-[var(--warning)]",
  remote:
    "border-[color-mix(in_oklch,var(--brand-2)_24%,transparent)] bg-[color-mix(in_oklch,var(--brand-2)_14%,transparent)] text-[var(--brand-2)]",
  away: "border-[color-mix(in_oklch,var(--warning)_24%,transparent)] bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] text-[var(--warning)]",
  absent: "border-destructive/25 bg-destructive/10 text-destructive",
  off: "border-border bg-secondary text-muted-foreground",
  pending: "border-border bg-surface-muted text-muted-foreground",
};

function AttendanceTable({ query }: { query: string }) {
  const { employees, departments } = useGovernmentData();
  const [period, setPeriod] = useState<GovernmentAttendancePeriod>("week");
  const [selectedDate, setSelectedDate] = useState(() => attendanceLocalIso(new Date()));
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | GovernmentAttendanceStatus>("all");

  const dates = useMemo(() => {
    if (period === "today") return [selectedDate];
    const start =
      period === "week" ? attendanceAddDays(selectedDate, -6) : `${selectedDate.slice(0, 7)}-01`;
    return attendanceInclusiveDates(start, selectedDate);
  }, [period, selectedDate]);

  const allRows = useMemo(
    () =>
      dates.flatMap((date) =>
        employees.map((employee, employeeIndex) =>
          buildGovernmentAttendanceRow(
            employee,
            employeeIndex,
            date,
            departments.find((department) => department.id === employee.departmentId)?.name ?? "—",
          ),
        ),
      ),
    [dates, departments, employees],
  );

  const rows = useMemo(() => {
    const normalizedSearch = `${query} ${search}`.trim().toLocaleLowerCase("mn-MN");
    return allRows.filter((row) => {
      if (departmentFilter !== "all" && row.employee.departmentId !== departmentFilter)
        return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (
        normalizedSearch &&
        !`${row.employee.name} ${row.employee.position} ${row.departmentName}`
          .toLocaleLowerCase("mn-MN")
          .includes(normalizedSearch)
      )
        return false;
      return true;
    });
  }, [allRows, departmentFilter, query, search, statusFilter]);

  const totals = useMemo(
    () => ({
      planned: rows.reduce((total, row) => total + row.plannedMinutes, 0),
      worked: rows.reduce((total, row) => total + row.workedMinutes, 0),
      present: rows.filter((row) => row.status === "present").length,
      late: rows.filter((row) => row.lateMinutes > 0).length,
      lateMinutes: rows.reduce((total, row) => total + row.lateMinutes, 0),
      overtime: rows.reduce((total, row) => total + row.overtimeMinutes, 0),
      absent: rows.filter((row) => row.status === "absent").length,
      remote: rows.filter((row) => row.status === "remote").length,
    }),
    [rows],
  );

  const exportAttendance = () => {
    const header = [
      "Огноо",
      "Албан хаагч",
      "Албан тушаал",
      "Хэлтэс",
      "Ирцийн төлөв",
      "Хуваарь",
      "Ирсэн",
      "Гарсан",
      "Төлөвлөсөн",
      "Ажилласан",
      "Хоцролт",
      "Эрт гарсан",
      "Илүү цаг",
      "Завсарлага",
      "Бүртгэлийн суваг",
      "Байршил",
    ];
    const data = rows.map((row) => [
      row.date,
      row.employee.name,
      row.employee.position,
      row.departmentName,
      governmentAttendanceStatusLabel[row.status],
      row.plannedMinutes ? `${row.scheduleStart}-${row.scheduleEnd}` : "—",
      row.checkIn ?? "—",
      row.checkOut ?? "—",
      attendanceDuration(row.plannedMinutes),
      attendanceDuration(row.workedMinutes),
      attendanceDuration(row.lateMinutes),
      attendanceDuration(row.earlyMinutes),
      attendanceDuration(row.overtimeMinutes),
      attendanceDuration(row.breakMinutes),
      row.source,
      row.location,
    ]);
    const csv = [header, ...data]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `turiin-albanii-irts-${dates[0]}-${dates.at(-1)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Ирцийн дэлгэрэнгүй тайлан татагдлаа");
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-grid grid-cols-3 rounded-xl bg-secondary/80 p-1 text-xs font-semibold">
            {(
              [
                ["today", "Өнөөдөр"],
                ["week", "7 хоног"],
                ["month", "Сар"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={cn(
                  "rounded-lg px-3 py-2 transition",
                  period === value
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => event.target.value && setSelectedDate(event.target.value)}
              className="h-9 w-[150px] text-xs"
              aria-label="Ирцийн огноо"
            />
            <Button size="sm" variant="outline" className="rounded-lg" onClick={exportAttendance}>
              <Download className="h-4 w-4" /> CSV экспорт
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <AttendanceMetric
            icon={<CalendarDays />}
            label="Төлөвлөсөн"
            value={attendanceDuration(totals.planned)}
          />
          <AttendanceMetric
            icon={<Clock3 />}
            label="Ажилласан"
            value={attendanceDuration(totals.worked)}
            tone="success"
          />
          <AttendanceMetric
            icon={<UserCheck />}
            label="Хэвийн ирсэн"
            value={`${totals.present} бүртгэл`}
            tone="success"
          />
          <AttendanceMetric
            icon={<CircleAlert />}
            label="Хоцролт"
            value={`${totals.late} · ${attendanceDuration(totals.lateMinutes)}`}
            tone="warning"
          />
          <AttendanceMetric
            icon={<Activity />}
            label="Илүү цаг"
            value={attendanceDuration(totals.overtime)}
          />
          <AttendanceMetric
            icon={<UserMinus />}
            label="Тасалсан / зайнаас"
            value={`${totals.absent} / ${totals.remote}`}
            tone="danger"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/80 p-4">
          <div>
            <h2 className="text-sm font-bold">Албан хаагчдын ирцийн дэлгэрэнгүй</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {dates[0]} — {dates.at(-1)} · {rows.length} бүртгэл
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Албан хаагч хайх..."
                className="h-9 w-[210px] pl-9 text-xs"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="h-9 w-[210px] text-xs">
                <SelectValue placeholder="Бүх хэлтэс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх хэлтэс, нэгж</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
            >
              <SelectTrigger className="h-9 w-[165px] text-xs">
                <SelectValue placeholder="Бүх төлөв" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх төлөв</SelectItem>
                {(Object.keys(governmentAttendanceStatusLabel) as GovernmentAttendanceStatus[]).map(
                  (attendanceStatus) => (
                    <SelectItem key={attendanceStatus} value={attendanceStatus}>
                      {governmentAttendanceStatusLabel[attendanceStatus]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <UserMinus className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Ирцийн бүртгэл олдсонгүй</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Огноо эсвэл шүүлтүүрээ өөрчилнө үү.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [scrollbar-gutter:stable]">
            <table className="w-full min-w-[1760px] border-separate border-spacing-0 text-xs">
              <thead className="sticky top-0 z-20 bg-surface-muted/95 text-left text-[11px] text-muted-foreground backdrop-blur">
                <tr>
                  <AttendanceHead className="sticky left-0 z-30 w-[115px] min-w-[115px] bg-surface-muted">
                    Огноо
                  </AttendanceHead>
                  <AttendanceHead className="sticky left-[115px] z-30 w-[220px] min-w-[220px] border-r bg-surface-muted">
                    Албан хаагч
                  </AttendanceHead>
                  <AttendanceHead className="min-w-[190px]">Хэлтэс, нэгж</AttendanceHead>
                  <AttendanceHead className="min-w-[115px]">Төлөв</AttendanceHead>
                  <AttendanceHead className="min-w-[120px]">Хуваарь</AttendanceHead>
                  <AttendanceHead className="min-w-[85px]">Ирсэн</AttendanceHead>
                  <AttendanceHead className="min-w-[85px]">Гарсан</AttendanceHead>
                  <AttendanceHead className="min-w-[105px]">Төлөвлөсөн</AttendanceHead>
                  <AttendanceHead className="min-w-[105px]">Ажилласан</AttendanceHead>
                  <AttendanceHead className="min-w-[95px]">Хоцролт</AttendanceHead>
                  <AttendanceHead className="min-w-[105px]">Эрт гарсан</AttendanceHead>
                  <AttendanceHead className="min-w-[95px]">Илүү цаг</AttendanceHead>
                  <AttendanceHead className="min-w-[100px]">Завсарлага</AttendanceHead>
                  <AttendanceHead className="min-w-[150px]">Бүртгэлийн суваг</AttendanceHead>
                  <AttendanceHead className="min-w-[200px]">Байршил</AttendanceHead>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.date}-${row.employee.id}`}
                    className="group hover:bg-secondary/35"
                  >
                    <AttendanceCell className="sticky left-0 z-10 bg-surface font-semibold group-hover:bg-secondary">
                      {formatDate(row.date)}
                    </AttendanceCell>
                    <AttendanceCell className="sticky left-[115px] z-10 border-r bg-surface group-hover:bg-secondary">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
                          {row.employee.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{row.employee.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {row.employee.position}
                          </p>
                        </div>
                      </div>
                    </AttendanceCell>
                    <AttendanceCell>{row.departmentName}</AttendanceCell>
                    <AttendanceCell>
                      <span
                        className={cn(
                          "inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-semibold",
                          governmentAttendanceStatusTone[row.status],
                        )}
                      >
                        {governmentAttendanceStatusLabel[row.status]}
                      </span>
                    </AttendanceCell>
                    <AttendanceCell className="font-mono font-semibold">
                      {row.plannedMinutes ? `${row.scheduleStart}–${row.scheduleEnd}` : "—"}
                    </AttendanceCell>
                    <AttendanceCell className="font-mono">{row.checkIn ?? "—"}</AttendanceCell>
                    <AttendanceCell className="font-mono">{row.checkOut ?? "—"}</AttendanceCell>
                    <AttendanceCell>
                      {row.plannedMinutes ? attendanceDuration(row.plannedMinutes) : "—"}
                    </AttendanceCell>
                    <AttendanceCell className="font-semibold">
                      {row.workedMinutes
                        ? attendanceDuration(row.workedMinutes)
                        : row.checkIn && !row.checkOut
                          ? row.status === "away"
                            ? "Түр гарсан"
                            : "Үргэлжилж байна"
                          : "—"}
                    </AttendanceCell>
                    <AttendanceCell
                      className={row.lateMinutes ? "font-semibold text-[var(--warning)]" : ""}
                    >
                      {row.lateMinutes ? attendanceDuration(row.lateMinutes) : "—"}
                    </AttendanceCell>
                    <AttendanceCell className={row.earlyMinutes ? "text-destructive" : ""}>
                      {row.earlyMinutes ? attendanceDuration(row.earlyMinutes) : "—"}
                    </AttendanceCell>
                    <AttendanceCell
                      className={row.overtimeMinutes ? "font-semibold text-[var(--success)]" : ""}
                    >
                      {row.overtimeMinutes ? attendanceDuration(row.overtimeMinutes) : "—"}
                    </AttendanceCell>
                    <AttendanceCell>
                      {row.breakMinutes ? attendanceDuration(row.breakMinutes) : "—"}
                    </AttendanceCell>
                    <AttendanceCell>{row.source}</AttendanceCell>
                    <AttendanceCell>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1.5 text-[10px] font-medium">
                        <MapPin className="h-3 w-3 text-muted-foreground" /> {row.location}
                      </span>
                    </AttendanceCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function AttendanceMetric({
  icon,
  label,
  value,
  tone = "brand",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "brand" | "success" | "warning" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface-muted/30 p-3">
      <div className={cn("mb-2 [&_svg]:h-4 [&_svg]:w-4", summaryTone(tone))}>{icon}</div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

function AttendanceHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("border-b border-border/80 px-3 py-3 font-medium", className)}>{children}</th>
  );
}

function AttendanceCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("border-b border-border/55 px-3 py-3 align-middle", className)}>
      {children}
    </td>
  );
}

function buildGovernmentAttendanceRow(
  employee: GovernmentEmployee,
  employeeIndex: number,
  date: string,
  departmentName: string,
): GovernmentAttendanceRow {
  const today = attendanceLocalIso(new Date());
  const day = new Date(`${date}T00:00:00`).getDay();
  const scheduleStart = "09:00";
  const scheduleEnd = "18:00";
  const off = day === 0 || day === 6;
  const future = date > today;
  const seed = attendanceSeed(`${employee.id}-${date}`) + employeeIndex * 11;

  let status: GovernmentAttendanceStatus = off ? "off" : future ? "pending" : "present";
  let checkIn: string | undefined;
  let checkOut: string | undefined;

  if (!off && !future && date === today) {
    status =
      employee.attendanceStatus === "remote"
        ? "remote"
        : employee.attendanceStatus === "away"
          ? "away"
          : employee.attendanceStatus === "offline"
            ? "absent"
            : "present";
    checkIn = employee.checkIn;
    checkOut = employee.checkOut;
  } else if (!off && !future) {
    if (seed % 17 === 0) {
      status = "absent";
    } else {
      checkIn = attendanceClock(8 * 60 + 42 + (seed % 36));
      checkOut = attendanceClock(17 * 60 + 42 + ((seed * 3) % 55));
      status =
        seed % 11 === 0 ? "remote" : attendanceMinutes(checkIn) > 9 * 60 ? "late" : "present";
    }
  }

  const plannedMinutes = off ? 0 : 8 * 60;
  const breakMinutes = checkIn && checkOut ? (seed % 3 === 0 ? 45 : 60) : 0;
  const workedMinutes = Math.max(0, attendanceBetween(checkIn, checkOut) - breakMinutes);
  const lateMinutes = checkIn
    ? Math.max(0, attendanceMinutes(checkIn) - attendanceMinutes(scheduleStart))
    : 0;
  const earlyMinutes = checkOut
    ? Math.max(0, attendanceMinutes(scheduleEnd) - attendanceMinutes(checkOut))
    : 0;
  const overtimeMinutes = checkOut
    ? Math.max(0, attendanceMinutes(checkOut) - attendanceMinutes(scheduleEnd))
    : 0;

  if (status === "present" && lateMinutes > 0) status = "late";

  return {
    employee,
    date,
    departmentName,
    status,
    scheduleStart,
    scheduleEnd,
    checkIn,
    checkOut,
    plannedMinutes,
    workedMinutes,
    lateMinutes,
    earlyMinutes,
    overtimeMinutes,
    breakMinutes,
    source:
      status === "remote"
        ? "VPN / Web бүртгэл"
        : checkIn
          ? seed % 2
            ? "Нүүр танилт"
            : "Карт уншигч"
          : "—",
    location: status === "remote" ? "Зайнаас" : checkIn ? `Төв байр · ${departmentName}` : "—",
  };
}

function attendanceLocalIso(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function attendanceAddDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return attendanceLocalIso(date);
}

function attendanceInclusiveDates(start: string, end: string) {
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor);
    cursor = attendanceAddDays(cursor, 1);
  }
  return dates;
}

function attendanceSeed(value: string) {
  return Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);
}

function attendanceClock(totalMinutes: number) {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function attendanceMinutes(time?: string) {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function attendanceBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  return Math.max(0, attendanceMinutes(end) - attendanceMinutes(start));
}

function attendanceDuration(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  return `${Math.floor(safeMinutes / 60)}ц ${safeMinutes % 60}м`;
}

function DirectoryView({ query }: { query: string }) {
  const { employees, departments } = useGovernmentData();
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {employees
        .filter((item) =>
          `${item.name} ${item.position}`.toLocaleLowerCase("mn-MN").includes(query),
        )
        .map((employee) => (
          <article
            key={employee.id}
            className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-white">
                {employee.name.charAt(0)}
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface",
                    employee.online ? "bg-[var(--success)]" : "bg-muted-foreground/50",
                  )}
                />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{employee.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {employee.position} · {employee.positionClassification}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <p className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                {departments.find((item) => item.id === employee.departmentId)?.name}
              </p>
              <p className="text-muted-foreground">
                {employee.email} · {employee.phone}
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full rounded-lg">
              Дэлгэрэнгүй мэдээлэл
            </Button>
          </article>
        ))}
    </div>
  );
}

function ReportsView() {
  const reports = [
    ["Албан бичгийн сарын тайлан", "Ирсэн, явсан бичиг ба шийдвэрлэлтийн хугацаа", FileText],
    ["Үүрэг даалгаврын гүйцэтгэл", "Хэлтэс, ажилтны гүйцэтгэл ба хугацааны хяналт", CheckSquare2],
    ["Өргөдөл, гомдлын тайлан", "Суваг, төрөл, шийдвэрлэлт ба хугацаа", MessageSquareMore],
    ["Хүний нөөцийн хөдөлгөөн", "Томилгоо, шилжилт, чөлөөлөлтийн нэгдсэн мэдээ", UsersRound],
    ["Ирц, ажлын цагийн тайлан", "Ирц, хоцролт, чөлөө, томилолтын мэдээлэл", Clock3],
    ["Аудитын үйл ажиллагааны түүх", "Өөрчлөлт, хандалт, баталгаажуулалтын мөр", History],
  ] as const;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reports.map(([title, desc, Icon]) => (
        <article
          key={title}
          className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="mt-4 font-semibold">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{desc}</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 rounded-lg">
              Харах
            </Button>
            <Button size="sm" className="gap-1.5 rounded-lg">
              <Download className="h-3.5 w-3.5" /> Татах
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function TrainingView({ query }: { query: string }) {
  const training = [
    ["Төрийн албан хаагчийн ёс зүй", "2026-08-04", "64 бүртгэл", "Танхим"],
    ["Мэдээллийн аюулгүй байдлын суурь", "2026-08-08", "38 бүртгэл", "Цахим"],
    ["Албан хэрэг хөтлөлтийн стандарт", "2026-08-14", "24 бүртгэл", "Танхим"],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {training
        .filter((item) => item.join(" ").toLocaleLowerCase("mn-MN").includes(query))
        .map(([title, date, count, type]) => (
          <article
            key={title}
            className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="rounded bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                {type}
              </span>
            </div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDate(date)} · {count}
            </p>
            <div className="mt-4 h-1.5 rounded-full bg-secondary">
              <div className="h-full w-2/3 rounded-full bg-gradient-brand" />
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              Дэлгэрэнгүй
            </Button>
          </article>
        ))}
    </div>
  );
}

function NotificationsView({ query }: { query: string }) {
  const { activities } = useGovernmentData();
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm divide-y divide-border/60">
      {activities
        .filter((item) =>
          `${item.title} ${item.description}`.toLocaleLowerCase("mn-MN").includes(query),
        )
        .map((item) => (
          <div key={item.id} className="flex gap-3 px-5 py-4 hover:bg-surface-muted/35">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3">
                <p className="font-medium">{item.title}</p>
                <time className="shrink-0 text-[10px] text-muted-foreground">
                  {new Date(item.at).toLocaleString("mn-MN")}
                </time>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {item.actor}
                {item.department && ` · ${item.department}`}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}

function ResolutionsView({ query }: { query: string }) {
  const rows = [
    [
      "Тогтоол",
      "НИТХ-2026/42",
      "Нийслэлийн цахим үйлчилгээний хүртээмжийг нэмэгдүүлэх тухай",
      "2026-07-28",
      "Хэрэгжиж буй",
    ],
    [
      "Тушаал",
      "А/128",
      "Мэдээллийн аюулгүй байдлын ажлын хэсэг байгуулах тухай",
      "2026-07-31",
      "Батлагдсан",
    ],
    [
      "Шийдвэр",
      "Ш-2026/18",
      "Албан хэрэг хөтлөлтийн журмыг шинэчлэн батлах тухай",
      "2026-08-01",
      "Хяналтад",
    ],
  ];
  return (
    <DataTable headers={["Төрөл", "Дугаар", "Нэр", "Огноо", "Хэрэгжилт"]}>
      {rows
        .filter((row) => row.join(" ").toLocaleLowerCase("mn-MN").includes(query))
        .map((row) => (
          <tr key={row[1]} className="border-b border-border/60 last:border-0">
            <Cell>{row[0]}</Cell>
            <Cell>
              <span className="font-mono text-xs font-semibold text-[var(--brand)]">{row[1]}</span>
            </Cell>
            <Cell>
              <p className="max-w-lg font-medium">{row[2]}</p>
            </Cell>
            <Cell>{formatDate(row[3])}</Cell>
            <Cell>
              <StatusBadge status="active" label={row[4]} />
            </Cell>
          </tr>
        ))}
    </DataTable>
  );
}

function SurveysView({ query }: { query: string }) {
  const rows = [
    ["Албан хаагчдын ажлын орчны сэтгэл ханамж", "126 оролцогч", 74, "2026-08-08"],
    ["Цахим үйлчилгээний хэрэглэгчийн үнэлгээ", "842 оролцогч", 58, "2026-08-15"],
    ["Сургалтын хэрэгцээ тодорхойлох судалгаа", "64 оролцогч", 91, "2026-08-05"],
  ] as const;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {rows
        .filter((row) => row.join(" ").toLocaleLowerCase("mn-MN").includes(query))
        .map(([title, count, progress, due]) => (
          <article
            key={title}
            className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-semibold leading-5">{title}</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              {count} · Дуусах {formatDate(due)}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-brand"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold">{progress}%</span>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              Үр дүн харах
            </Button>
          </article>
        ))}
    </div>
  );
}

function GenericRegistry({ module }: { module: GovernmentModuleKey }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/80 p-8 text-center shadow-sm">
      <Archive className="mx-auto h-8 w-8 text-[var(--brand)]" />
      <h2 className="mt-3 font-semibold">{governmentModuleTitle[module]} бүртгэл</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Бүртгэл, төлөв, хариуцагч болон аудитын түүхийг нэг дор удирдах суурь модуль идэвхтэй байна.
      </p>
    </div>
  );
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-surface-muted/65 text-xs text-muted-foreground">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-xs text-foreground/90">{children}</td>;
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium",
        ["approved", "resolved", "completed", "present"].includes(status) &&
          "bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-[var(--success)]",
        ["in-review", "blocked", "away"].includes(status) &&
          "bg-[color-mix(in_oklch,var(--warning)_15%,transparent)] text-[var(--warning)]",
        ["rejected", "overdue"].includes(status) && "bg-destructive/10 text-destructive",
        ![
          "approved",
          "resolved",
          "completed",
          "present",
          "in-review",
          "blocked",
          "away",
          "rejected",
          "overdue",
        ].includes(status) && "bg-brand-soft text-[var(--brand)]",
      )}
    >
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: GovernmentTask["priority"] }) {
  const label = { low: "Бага", normal: "Хэвийн", high: "Өндөр", urgent: "Яаралтай" }[priority];
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 text-[10px] font-medium",
        priority === "urgent"
          ? "bg-destructive/10 text-destructive"
          : priority === "high"
            ? "bg-[color-mix(in_oklch,var(--warning)_15%,transparent)] text-[var(--warning)]"
            : "bg-secondary text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

function primaryActionLabel(module: GovernmentModuleKey) {
  return (
    {
      documents: "Бичиг бүртгэх",
      tasks: "Даалгавар үүсгэх",
      meetings: "Хурал товлох",
      petitions: "Хүсэлт бүртгэх",
      hr: "HR бүртгэл",
      attendance: "Ирц бүртгэх",
      resolutions: "Шийдвэр бүртгэх",
      surveys: "Судалгаа үүсгэх",
      directory: "Ажилтан нэмэх",
      training: "Сургалт үүсгэх",
      dashboard: "Шинэ хүсэлт",
      reports: "Тайлан үүсгэх",
      notifications: "Мэдэгдэл үүсгэх",
    } as Record<GovernmentModuleKey, string>
  )[module];
}
function summaryTone(tone: string) {
  return tone === "success"
    ? "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]"
    : tone === "warning"
      ? "bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] text-[var(--warning)]"
      : tone === "danger"
        ? "bg-destructive/10 text-destructive"
        : tone === "blue"
          ? "bg-[color-mix(in_oklch,var(--brand-2)_14%,transparent)] text-[var(--brand-2)]"
          : "bg-brand-soft text-[var(--brand)]";
}
function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
function structureLabel(level: string) {
  return (
    (
      {
        organization: "Байгууллага",
        department: "Хэлтэс",
        division: "Тасаг",
        unit: "Нэгж",
      } as Record<string, string>
    )[level] ?? level
  );
}
