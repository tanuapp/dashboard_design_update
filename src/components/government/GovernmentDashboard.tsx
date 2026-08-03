import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BellRing,
  Building2,
  CalendarDays,
  CheckCircle2,
  CheckSquare2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  HelpCircle,
  Link2,
  LogOut,
  MessageSquareMore,
  Network,
  NotebookPen,
  Plus,
  Save,
  ShieldCheck,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import type { AuthSession } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import { useGovernmentData } from "@/lib/government/store";
import type {
  GovernmentActivity,
  GovernmentActivityType,
  GovernmentTask,
} from "@/lib/government/types";
import { governmentPermissionLabel } from "@/lib/government/types";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GovernmentRequestModal } from "./GovernmentRequestModal";

const activityIcons: Record<GovernmentActivityType, React.ElementType> = {
  "document-received": FileText,
  "task-assigned": CheckSquare2,
  "task-updated": Activity,
  "meeting-changed": CalendarDays,
  announcement: BellRing,
  "petition-received": MessageSquareMore,
  "petition-resolved": CheckCircle2,
  attendance: UserCheck,
  "document-decision": FileCheck2,
};

const activityTone: Record<GovernmentActivityType, string> = {
  "document-received": "bg-brand-soft text-[var(--brand)]",
  "task-assigned": "bg-[color-mix(in_oklch,var(--brand-2)_15%,transparent)] text-[var(--brand-2)]",
  "task-updated": "bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[var(--warning)]",
  "meeting-changed": "bg-[color-mix(in_oklch,var(--brand)_12%,transparent)] text-[var(--brand)]",
  announcement: "bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[var(--warning)]",
  "petition-received":
    "bg-[color-mix(in_oklch,var(--brand-2)_15%,transparent)] text-[var(--brand-2)]",
  "petition-resolved":
    "bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-[var(--success)]",
  attendance: "bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-[var(--success)]",
  "document-decision":
    "bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-[var(--success)]",
};

const taskStatusLabel: Record<GovernmentTask["status"], string> = {
  new: "Шинэ",
  "in-progress": "Хийгдэж буй",
  blocked: "Саатсан",
  completed: "Дууссан",
};

const priorityLabel: Record<GovernmentTask["priority"], string> = {
  low: "Бага",
  normal: "Хэвийн",
  high: "Өндөр",
  urgent: "Яаралтай",
};

export function GovernmentDashboard({ session }: { session: AuthSession }) {
  const {
    activePermission,
    activities,
    departments,
    documents,
    employees,
    meetings,
    news,
    petitions,
    quickNote,
    setQuickNote,
    tasks,
    toggleAttendance,
  } = useGovernmentData();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [requestOpen, setRequestOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const currentEmployee =
    employees.find((employee) => employee.name === session.name) ?? employees[0];
  const onlineEmployees = employees.filter((employee) => employee.online);

  const summary = useMemo(() => {
    const now = new Date(`${today}T00:00:00`).getTime();
    const soon = now + 3 * 86_400_000;
    const activeTasks = tasks.filter((task) => task.status !== "completed");
    return {
      incomingDocuments: documents.filter((document) => document.status === "received").length,
      pendingApprovals: documents.filter((document) => document.status === "in-review").length,
      activeTasks: activeTasks.length,
      dueSoon: activeTasks.filter((task) => {
        const due = new Date(`${task.dueDate}T00:00:00`).getTime();
        return due >= now && due <= soon;
      }).length,
      overdue: activeTasks.filter((task) => new Date(`${task.dueDate}T00:00:00`).getTime() < now)
        .length,
      todayMeetings: meetings.filter((meeting) => meeting.date === today).length,
      newPetitions: petitions.filter((petition) =>
        ["submitted", "received"].includes(petition.status),
      ).length,
      employeesPresent: employees.filter((employee) =>
        ["present", "remote"].includes(employee.attendanceStatus),
      ).length,
    };
  }, [documents, employees, meetings, petitions, tasks, today]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[var(--brand)]">
            {new Date().toLocaleDateString("mn-MN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Өдрийн мэнд, {firstName(session.name)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Байгууллагын өнөөдрийн үйл ажиллагаа, шийдвэрлэх ажлын нэгдсэн тойм.
          </p>
        </div>
        <Button onClick={() => setRequestOpen(true)} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Шинэ хүсэлт
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-8">
        <SummaryCard
          icon={FileText}
          label="Ирсэн бичиг"
          value={summary.incomingDocuments}
          tone="brand"
        />
        <SummaryCard
          icon={FileCheck2}
          label="Батлах хүлээгдэж буй"
          value={summary.pendingApprovals}
          tone="warning"
        />
        <SummaryCard
          icon={CheckSquare2}
          label="Идэвхтэй даалгавар"
          value={summary.activeTasks}
          tone="blue"
        />
        <SummaryCard icon={Clock3} label="Хугацаа ойртсон" value={summary.dueSoon} tone="warning" />
        <SummaryCard
          icon={CircleAlert}
          label="Хугацаа хэтэрсэн"
          value={summary.overdue}
          tone="danger"
        />
        <SummaryCard
          icon={CalendarDays}
          label="Өнөөдрийн хурал"
          value={summary.todayMeetings}
          tone="brand"
        />
        <SummaryCard
          icon={MessageSquareMore}
          label="Шинэ өргөдөл"
          value={summary.newPetitions}
          tone="blue"
        />
        <SummaryCard
          icon={UserCheck}
          label="Өнөөдөр ирсэн"
          value={summary.employeesPresent}
          tone="success"
        />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
            <Tabs defaultValue="activities">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
                <div>
                  <h2 className="font-semibold">Байгууллагын сүүлийн мэдээлэл</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Бодит цагийн үйл ажиллагааны урсгал
                  </p>
                </div>
                <TabsList className="h-9">
                  <TabsTrigger value="activities" className="gap-1.5 text-xs">
                    Үйл ажиллагаа
                  </TabsTrigger>
                  <TabsTrigger value="meetings" className="gap-1.5 text-xs">
                    Хурал
                    <TabCount>{summary.todayMeetings}</TabCount>
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="gap-1.5 text-xs">
                    Даалгавар
                    <TabCount>{summary.activeTasks}</TabCount>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="activities" className="m-0">
                <div className="divide-y divide-border/60">
                  {activities.slice(0, 8).map((item, index) => (
                    <ActivityRow key={item.id} activity={item} last={index === 7} />
                  ))}
                </div>
                <Link
                  to="/business/dashboard/government/notifications"
                  className="flex items-center justify-center gap-1 border-t border-border px-4 py-3 text-xs font-medium text-[var(--brand)] hover:bg-surface-muted/40"
                >
                  Бүх үйл ажиллагааг харах <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </TabsContent>

              <TabsContent value="meetings" className="m-0 divide-y divide-border/60">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="flex gap-3 px-4 py-3.5 sm:px-5">
                    <div className="w-14 shrink-0 rounded-xl bg-brand-soft px-2 py-2 text-center">
                      <p className="text-[10px] font-medium uppercase text-[var(--brand)]">
                        {new Date(`${meeting.date}T00:00:00`).toLocaleDateString("mn-MN", {
                          month: "short",
                        })}
                      </p>
                      <p className="text-lg font-bold text-[var(--brand)]">
                        {new Date(`${meeting.date}T00:00:00`).getDate()}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{meeting.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {meeting.startTime}–{meeting.endTime} · {meeting.location} ·{" "}
                        {meeting.attendeeCount} оролцогч
                      </p>
                    </div>
                    <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="tasks" className="m-0 divide-y divide-border/60">
                {tasks
                  .filter((task) => task.status !== "completed")
                  .map((task) => (
                    <TaskRow key={task.id} task={task} employees={employees} />
                  ))}
              </TabsContent>
            </Tabs>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-semibold">
                    <UserCheck className="h-4 w-4 text-[var(--brand)]" /> Цахим ирц
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Өнөөдрийн ирэх, гарах цагийн бүртгэл
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium",
                    currentEmployee.attendanceStatus === "present"
                      ? "bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-[var(--success)]"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {currentEmployee.attendanceStatus === "present" ? "Ажил дээр" : "Бүртгэлгүй"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <AttendanceTime label="Ирсэн цаг" value={currentEmployee.checkIn ?? "--:--"} />
                <AttendanceTime label="Гарсан цаг" value={currentEmployee.checkOut ?? "--:--"} />
              </div>
              <Button
                variant={currentEmployee.attendanceStatus === "present" ? "outline" : "default"}
                className={cn(
                  "mt-4 w-full gap-2 rounded-xl",
                  currentEmployee.attendanceStatus === "present" &&
                    "text-destructive hover:text-destructive",
                )}
                onClick={() => {
                  toggleAttendance(currentEmployee.id);
                  toast.success(
                    currentEmployee.attendanceStatus === "present"
                      ? "Гарсан цаг бүртгэгдлээ"
                      : "Ирсэн цаг бүртгэгдлээ",
                  );
                }}
              >
                <Clock3 className="h-4 w-4" />
                {currentEmployee.attendanceStatus === "present"
                  ? "Гарах цаг бүртгэх"
                  : "Ирэх цаг бүртгэх"}
              </Button>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-5">
                <div>
                  <h2 className="font-semibold">Сүүлийн үеийн мэдээ</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Засгийн газар ба байгууллага
                  </p>
                </div>
                <BellRing className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <div className="divide-y divide-border/60">
                {news.map((item) => (
                  <article key={item.id} className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="rounded bg-brand-soft px-1.5 py-0.5 font-medium text-[var(--brand)]">
                        {item.category}
                      </span>
                      {formatShortDate(item.publishedAt)}
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-medium leading-5">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground">{item.source}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">Өргөдөл, гомдлын статистик</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Энэ сарын шийдвэрлэлтийн явц</p>
                </div>
                <Link
                  to="/business/dashboard/government/petitions"
                  className="text-xs font-medium text-[var(--brand)] hover:underline"
                >
                  Дэлгэрэнгүй
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-[116px_1fr] items-center gap-5">
                <PetitionDonut resolved={68} />
                <div className="space-y-3">
                  <PetitionLegend label="Шинээр ирсэн" value={24} color="bg-[var(--brand)]" />
                  <PetitionLegend label="Хянагдаж буй" value={17} color="bg-[var(--warning)]" />
                  <PetitionLegend label="Шийдвэрлэсэн" value={88} color="bg-[var(--success)]" />
                  <PetitionLegend label="Хугацаа хэтэрсэн" value={3} color="bg-destructive" />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-[var(--brand)]" />
                <h2 className="font-semibold">Шуурхай тэмдэглэл</h2>
              </div>
              <Textarea
                value={quickNote}
                onChange={(event) => setQuickNote(event.target.value)}
                placeholder="Сануулах зүйл, хурлын тэмдэглэл..."
                className="mt-3 min-h-[126px] resize-none bg-surface-muted/35"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[10px] text-muted-foreground">Зөвхөн танд харагдана</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 rounded-lg"
                  onClick={() => toast.success("Тэмдэглэл хадгалагдлаа")}
                >
                  <Save className="h-3.5 w-3.5" /> Хадгалах
                </Button>
              </div>
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[var(--brand)]" />
                <h2 className="font-semibold">Түгээмэл асуулт</h2>
              </div>
              <Accordion type="single" collapsible className="mt-2">
                <FaqItem
                  value="faq-1"
                  title="Албан бичгийг хэрхэн хариуцсан нэгжид шилжүүлэх вэ?"
                  answer="Албан бичгийн дэлгэрэнгүйгээс “Хуваарилах” үйлдлийг сонгож, хариуцах нэгж, ажилтан болон хугацааг тохируулна."
                />
                <FaqItem
                  value="faq-2"
                  title="Өргөдлийн шийдвэрлэх хугацааг хаанаас харах вэ?"
                  answer="Өргөдөл, гомдлын хүснэгтийн хугацаа багана болон dashboard-ийн хугацаа ойртсон үзүүлэлтээс хянана."
                />
                <FaqItem
                  value="faq-3"
                  title="Цахим ирцийн алдааг хэн засах боломжтой вэ?"
                  answer="Хүний нөөцийн ажилтан болон байгууллагын админ аудитын тэмдэглэлтэйгээр засварлана."
                />
              </Accordion>
            </section>

            <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[var(--brand)]" />
                <h2 className="font-semibold">Шуурхай холбоос</h2>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <QuickLink
                  to="/business/dashboard/government/documents"
                  icon={FileText}
                  label="Албан бичиг бүртгэх"
                />
                <QuickLink
                  to="/business/dashboard/government/tasks"
                  icon={CheckSquare2}
                  label="Даалгавар үүсгэх"
                />
                <QuickLink
                  to="/business/dashboard/government/meetings"
                  icon={CalendarDays}
                  label="Хурал товлох"
                />
                <QuickLink
                  to="/business/dashboard/government/directory"
                  icon={UsersRound}
                  label="Ажилтан хайх"
                />
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-[82px] xl:self-start">
          <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-white">
                {session.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{session.name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentEmployee.position}</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
            </div>
            <div className="mt-3 rounded-lg bg-surface-muted/45 px-3 py-2 text-xs">
              <p className="font-medium">{governmentPermissionLabel[activePermission]}</p>
              <p className="mt-0.5 truncate text-muted-foreground">
                {departmentName(currentEmployee.departmentId, departments)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/[0.05] hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> Системээс гарах
            </button>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Идэвхтэй ажилтнууд</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {onlineEmployees.length} онлайн · {employees.length - onlineEmployees.length}{" "}
                  офлайн
                </p>
              </div>
              <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_0_4px_color-mix(in_oklch,var(--success)_12%,transparent)]" />
            </div>
            <div className="max-h-56 divide-y divide-border/50 overflow-y-auto">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-[var(--brand)]">
                    {employee.name.charAt(0)}
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface",
                        employee.online ? "bg-[var(--success)]" : "bg-muted-foreground/45",
                      )}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{employee.name}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {employee.position}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Network className="h-4 w-4 text-[var(--brand)]" /> Хэлтэс ба нэгж
            </h2>
            <div className="mt-3 space-y-1.5">
              {departments
                .filter((department) => department.level === "department")
                .slice(0, 3)
                .map((department) => (
                  <div
                    key={department.id}
                    className="flex items-center gap-2 rounded-lg bg-surface-muted/40 px-2.5 py-2"
                  >
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                      {department.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {department.employeeCount}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        </aside>
      </div>

      <GovernmentRequestModal open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: "brand" | "blue" | "success" | "warning" | "danger";
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/80 bg-surface/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            tone === "brand" && "bg-brand-soft text-[var(--brand)]",
            tone === "blue" &&
              "bg-[color-mix(in_oklch,var(--brand-2)_14%,transparent)] text-[var(--brand-2)]",
            tone === "success" &&
              "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]",
            tone === "warning" &&
              "bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] text-[var(--warning)]",
            tone === "danger" && "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xl font-bold tabular-nums">{value}</span>
      </div>
      <p className="mt-2 truncate text-[10px] leading-4 text-muted-foreground" title={label}>
        {label}
      </p>
    </div>
  );
}

function ActivityRow({ activity: item }: { activity: GovernmentActivity; last?: boolean }) {
  const Icon = activityIcons[item.type];
  return (
    <div className="flex gap-3 px-4 py-3.5 transition hover:bg-surface-muted/30 sm:px-5">
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          activityTone[item.type],
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-semibold">{item.title}</p>
          <time className="shrink-0 text-[10px] text-muted-foreground">
            {relativeTime(item.at)}
          </time>
        </div>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p>
        <p className="mt-1 text-[10px] text-muted-foreground/80">
          {item.actor}
          {item.department && ` · ${item.department}`}
        </p>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  employees,
}: {
  task: GovernmentTask;
  employees: ReturnType<typeof useGovernmentData>["employees"];
}) {
  const employee = employees.find((item) => item.id === task.assigneeId);
  return (
    <div className="px-4 py-3.5 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{task.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {employee?.name ?? "Хариуцагчгүй"} · {formatShortDate(task.dueDate)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-[10px] font-medium",
            task.priority === "urgent" && "bg-destructive/10 text-destructive",
            task.priority === "high" &&
              "bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[var(--warning)]",
            (task.priority === "normal" || task.priority === "low") &&
              "bg-secondary text-muted-foreground",
          )}
        >
          {priorityLabel[task.priority]}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-brand"
            style={{ width: `${task.progress}%` }}
          />
        </div>
        <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
          {task.progress}%
        </span>
        <span className="text-[10px] text-muted-foreground">{taskStatusLabel[task.status]}</span>
      </div>
    </div>
  );
}

function TabCount({ children }: { children: number }) {
  return (
    <span className="grid min-w-4 place-items-center rounded-full bg-secondary px-1 py-0.5 text-[9px] leading-none text-muted-foreground">
      {children}
    </span>
  );
}

function AttendanceTime({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface-muted/35 p-3 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function PetitionDonut({ resolved }: { resolved: number }) {
  return (
    <div
      className="grid aspect-square place-items-center rounded-full"
      style={{
        background: `conic-gradient(var(--success) ${resolved * 3.6}deg, color-mix(in oklch, var(--muted-foreground) 14%, transparent) 0deg)`,
      }}
    >
      <div className="grid h-[78%] w-[78%] place-items-center rounded-full bg-surface text-center">
        <div>
          <p className="text-xl font-bold">{resolved}%</p>
          <p className="text-[9px] text-muted-foreground">шийдвэрлэсэн</p>
        </div>
      </div>
    </div>
  );
}

function PetitionLegend({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function FaqItem({ value, title, answer }: { value: string; title: string; answer: string }) {
  return (
    <AccordionItem value={value} className="border-border/70">
      <AccordionTrigger className="py-3 text-left text-xs font-medium hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent className="text-xs leading-5 text-muted-foreground">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border/70 bg-surface-muted/30 p-3 transition hover:border-[var(--brand)]/25 hover:bg-brand-soft/45"
    >
      <Icon className="h-4 w-4 text-[var(--brand)]" />
      <span className="mt-2 flex items-end justify-between gap-2 text-xs font-medium">
        {label}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function firstName(name: string) {
  return name.split(" ").at(-1) ?? name;
}

function departmentName(
  id: string,
  departments: ReturnType<typeof useGovernmentData>["departments"],
) {
  return departments.find((department) => department.id === id)?.name ?? "Нэгж тодорхойгүй";
}

function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("mn-MN", {
    month: "short",
    day: "numeric",
  });
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return "Дөнгөж сая";
  if (minutes < 60) return `${minutes} минутын өмнө`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} цагийн өмнө`;
  return `${Math.floor(hours / 24)} өдрийн өмнө`;
}
