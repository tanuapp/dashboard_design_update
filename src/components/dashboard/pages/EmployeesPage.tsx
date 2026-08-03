import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useDashboardData } from "@/lib/dashboard/store";
import type { Employee, EmployeeLeave } from "@/lib/dashboard/types";
import { employeeStatusLabel } from "@/lib/dashboard/types";
import type { BusinessRole } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EmployeeFormModal } from "../EmployeeFormModal";
import { AvatarInitials, ConfirmDialog, EmptyState, PageHeader, formatDate } from "../ui";

type RequestStatus = EmployeeLeave["status"] | "all";

type TimeRequest = EmployeeLeave & {
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  branchId: string;
};

const statusTone: Record<Employee["status"], string> = {
  busy: "bg-[color-mix(in_oklch,var(--warning)_18%,transparent)] text-[var(--warning)]",
  available: "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]",
  break: "bg-secondary text-muted-foreground",
  off: "bg-[color-mix(in_oklch,var(--brand)_14%,transparent)] text-[var(--brand)]",
  "not-working": "bg-secondary text-muted-foreground",
};

const leaveStatusLabel: Record<EmployeeLeave["status"], string> = {
  pending: "Хүлээгдэж буй",
  approved: "Батлагдсан",
  declined: "Татгалзсан",
};

const leaveStatusTone: Record<EmployeeLeave["status"], string> = {
  pending: "bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[var(--warning)]",
  approved: "bg-[color-mix(in_oklch,var(--success)_16%,transparent)] text-[var(--success)]",
  declined: "bg-destructive/10 text-destructive",
};

const roleLabel: Record<BusinessRole, string> = {
  owner: "Эзэмшигч",
  admin: "Админ",
  employee: "Ажилтан",
};

export function EmployeesPage() {
  const { branches, employees, setEmployeeLeave, toggleEmployeeAccess } = useDashboardData();
  const [search, setSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | undefined>();
  const [confirmDisable, setConfirmDisable] = useState<Employee | null>(null);

  const branchById = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch.name])),
    [branches],
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("mn-MN");
    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.name,
        employee.position,
        employee.specialty,
        employee.phone,
        employee.email,
        branchById.get(employee.branchId) ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("mn-MN")
        .includes(query),
    );
  }, [branchById, employees, search]);

  const timeRequests = useMemo<TimeRequest[]>(
    () =>
      employees
        .flatMap((employee) =>
          employee.leave.map((request) => ({
            ...request,
            employeeId: employee.id,
            employeeName: employee.name,
            employeePosition: employee.position,
            branchId: employee.branchId,
          })),
        )
        .sort((a, b) => b.from.localeCompare(a.from)),
    [employees],
  );

  const filteredRequests = useMemo(() => {
    const query = requestSearch.trim().toLocaleLowerCase("mn-MN");

    return timeRequests.filter((request) => {
      const matchesStatus = requestStatus === "all" || request.status === requestStatus;
      const matchesSearch =
        !query ||
        [
          request.employeeName,
          request.employeePosition,
          request.reason,
          branchById.get(request.branchId) ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase("mn-MN")
          .includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [branchById, requestSearch, requestStatus, timeRequests]);

  const requestCounts = useMemo(
    () => ({
      total: timeRequests.length,
      pending: timeRequests.filter((request) => request.status === "pending").length,
      approved: timeRequests.filter((request) => request.status === "approved").length,
      declined: timeRequests.filter((request) => request.status === "declined").length,
    }),
    [timeRequests],
  );

  const summary = {
    total: employees.length,
    workingToday: employees.filter(
      (employee) => employee.status === "busy" || employee.status === "available",
    ).length,
    available: employees.filter((employee) => employee.status === "available").length,
    off: employees.filter(
      (employee) => employee.status === "off" || employee.status === "not-working",
    ).length,
  };

  const decideRequest = (
    request: TimeRequest,
    decision: Extract<EmployeeLeave["status"], "approved" | "declined">,
  ) => {
    const employee = employees.find((item) => item.id === request.employeeId);
    if (!employee) return;

    setEmployeeLeave(
      employee.id,
      employee.leave.map((item) => (item.id === request.id ? { ...item, status: decision } : item)),
    );
    toast.success(decision === "approved" ? "Хүсэлт батлагдлаа" : "Хүсэлт татгалзагдлаа", {
      description: `${employee.name} · ${formatRequestRange(request.from, request.to)}`,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ажилтнууд"
        description="Ажилтны мэдээлэл, ажлын эрх болон цагийн хүсэлтүүдийг нэг дор удирдана."
        actions={
          <>
            <Button variant="outline" asChild className="gap-1.5 rounded-lg">
              <Link to="/business/dashboard/employee-schedule">
                <CalendarClock className="h-4 w-4" /> Цагийн хуваарь
              </Link>
            </Button>
            <Button
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
              className="gap-1.5 rounded-lg"
            >
              <Plus className="h-4 w-4" /> Ажилтан нэмэх
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={<Users />} label="Нийт ажилтан" value={summary.total} />
        <SummaryCard
          icon={<Clock3 />}
          label="Өнөөдөр ажиллаж байгаа"
          value={summary.workingToday}
          tone="brand"
        />
        <SummaryCard
          icon={<UserRound />}
          label="Одоо сул"
          value={summary.available}
          tone="success"
        />
        <SummaryCard
          icon={<CalendarClock />}
          label="Ажиллахгүй байгаа"
          value={summary.off}
          tone="muted"
        />
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-border/70 bg-surface-muted/50 p-1.5 sm:w-auto">
          <TabsTrigger value="employees" className="h-9 gap-2 rounded-lg px-4">
            <Users className="h-4 w-4" />
            Ажилтны мэдээлэл
            <CountBadge>{employees.length}</CountBadge>
          </TabsTrigger>
          <TabsTrigger value="requests" className="h-9 gap-2 rounded-lg px-4">
            <Clock3 className="h-4 w-4" />
            Цагийн хүсэлтүүд
            <CountBadge attention={requestCounts.pending > 0}>{requestCounts.pending}</CountBadge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface/70 p-3 shadow-sm">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Нэр, утас, албан тушаалаар хайх"
                className="h-9 pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredEmployees.length} ажилтны мэдээлэл
            </p>
          </div>

          {filteredEmployees.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="Ажилтан олдсонгүй"
              description="Хайлтын үгээ өөрчлөөд дахин оролдоно уу."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-surface-muted/65 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Ажилтан</th>
                      <th className="px-4 py-3 font-medium">Холбоо барих</th>
                      <th className="px-4 py-3 font-medium">Салбар</th>
                      <th className="px-4 py-3 font-medium">Өнөөдрийн хуваарь</th>
                      <th className="px-4 py-3 font-medium">Төлөв</th>
                      <th className="px-4 py-3 font-medium">Эрх</th>
                      <th className="px-4 py-3 text-right font-medium">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="transition-colors hover:bg-surface-muted/35">
                        <td className="px-4 py-3">
                          <Link
                            to="/business/dashboard/employees/$employeeId"
                            params={{ employeeId: employee.id }}
                            className="group flex items-center gap-3"
                          >
                            <AvatarInitials name={employee.name} className="h-9 w-9 text-xs" />
                            <span className="min-w-0">
                              <span className="flex items-center gap-1 font-semibold group-hover:text-[var(--brand)]">
                                {employee.name}
                                <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {employee.position} · {employee.specialty}
                              </span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1 text-xs">
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {employee.phone || "—"}
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              {employee.email || "И-мэйл бүртгээгүй"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {branchById.get(employee.branchId) ?? "Салбаргүй"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium tabular-nums">{todayWorkHours(employee)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {employee.todayBookings} захиалга
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-md px-2 py-1 text-xs font-medium",
                              statusTone[employee.status],
                            )}
                          >
                            {employeeStatusLabel[employee.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="inline-flex items-center gap-1 text-xs font-medium">
                              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                              {roleLabel[employee.role]}
                            </p>
                            <p
                              className={cn(
                                "text-[11px]",
                                employee.accessEnabled
                                  ? "text-[var(--success)]"
                                  : "text-destructive",
                              )}
                            >
                              {employee.accessEnabled ? "Нэвтрэх эрхтэй" : "Эрх хаалттай"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <EmployeeActions
                            employee={employee}
                            onEdit={() => {
                              setEditing(employee);
                              setFormOpen(true);
                            }}
                            onToggleAccess={() => setConfirmDisable(employee)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-0 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <RequestSummaryCard label="Нийт хүсэлт" value={requestCounts.total} status="all" />
            <RequestSummaryCard
              label="Хүлээгдэж буй"
              value={requestCounts.pending}
              status="pending"
            />
            <RequestSummaryCard
              label="Батлагдсан"
              value={requestCounts.approved}
              status="approved"
            />
            <RequestSummaryCard
              label="Татгалзсан"
              value={requestCounts.declined}
              status="declined"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-surface/70 p-3 shadow-sm">
            <div className="relative min-w-0 flex-1 basis-64 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={requestSearch}
                onChange={(event) => setRequestSearch(event.target.value)}
                placeholder="Ажилтан эсвэл шалтгаанаар хайх"
                className="h-9 pl-9"
              />
            </div>
            <Select
              value={requestStatus}
              onValueChange={(value) => setRequestStatus(value as RequestStatus)}
            >
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх төлөв</SelectItem>
                <SelectItem value="pending">Хүлээгдэж буй</SelectItem>
                <SelectItem value="approved">Батлагдсан</SelectItem>
                <SelectItem value="declined">Татгалзсан</SelectItem>
              </SelectContent>
            </Select>
            <p className="ml-auto text-xs text-muted-foreground">
              {filteredRequests.length} хүсэлт
            </p>
          </div>

          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={<Clock3 className="h-6 w-6" />}
              title="Цагийн хүсэлт олдсонгүй"
              description="Сонгосон төлөв болон хайлтад тохирох хүсэлт алга байна."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="bg-surface-muted/65 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Ажилтан</th>
                      <th className="px-4 py-3 font-medium">Хүсэлтийн төрөл</th>
                      <th className="px-4 py-3 font-medium">Хугацаа</th>
                      <th className="px-4 py-3 font-medium">Нийт</th>
                      <th className="px-4 py-3 font-medium">Шалтгаан</th>
                      <th className="px-4 py-3 font-medium">Төлөв</th>
                      <th className="px-4 py-3 text-right font-medium">Шийдвэр</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredRequests.map((request) => (
                      <tr
                        key={`${request.employeeId}-${request.id}`}
                        className="transition-colors hover:bg-surface-muted/35"
                      >
                        <td className="px-4 py-3">
                          <Link
                            to="/business/dashboard/employees/$employeeId"
                            params={{ employeeId: request.employeeId }}
                            className="flex items-center gap-3"
                          >
                            <AvatarInitials
                              name={request.employeeName}
                              className="h-9 w-9 text-xs"
                            />
                            <span>
                              <span className="block font-semibold hover:text-[var(--brand)]">
                                {request.employeeName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {request.employeePosition}
                              </span>
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <CalendarClock className="h-4 w-4 text-[var(--brand)]" />
                            Чөлөөний хүсэлт
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">
                            {formatRequestRange(request.from, request.to)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {branchById.get(request.branchId) ?? "Салбаргүй"}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-medium tabular-nums">
                          {requestDayCount(request.from, request.to)} өдөр
                        </td>
                        <td className="max-w-[260px] px-4 py-3">
                          <p className="line-clamp-2 text-muted-foreground">{request.reason}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-md px-2 py-1 text-xs font-medium",
                              leaveStatusTone[request.status],
                            )}
                          >
                            {leaveStatusLabel[request.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {request.status === "pending" ? (
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 rounded-lg text-[var(--success)] hover:text-[var(--success)]"
                                onClick={() => decideRequest(request, "approved")}
                              >
                                <Check className="h-3.5 w-3.5" /> Батлах
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 rounded-lg text-destructive hover:text-destructive"
                                onClick={() => decideRequest(request, "declined")}
                              >
                                <X className="h-3.5 w-3.5" /> Татгалзах
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Шийдвэрлэсэн</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EmployeeFormModal open={formOpen} onOpenChange={setFormOpen} employee={editing} />
      <ConfirmDialog
        open={!!confirmDisable}
        onOpenChange={(open) => !open && setConfirmDisable(null)}
        title={
          confirmDisable?.accessEnabled ? "Нэвтрэх эрхийг хаах уу?" : "Нэвтрэх эрхийг нээх үү?"
        }
        description={`${confirmDisable?.name} ${
          confirmDisable?.accessEnabled
            ? "цаашид системд нэвтрэх боломжгүй болно."
            : "дахин системд нэвтрэх боломжтой болно."
        }`}
        confirmLabel={confirmDisable?.accessEnabled ? "Хаах" : "Нээх"}
        destructive={!!confirmDisable?.accessEnabled}
        onConfirm={() => {
          if (confirmDisable) {
            toggleEmployeeAccess(confirmDisable.id);
            toast.success(
              confirmDisable.accessEnabled ? "Нэвтрэх эрх хаагдлаа" : "Нэвтрэх эрх нээгдлээ",
            );
          }
          setConfirmDisable(null);
        }}
      />
    </div>
  );
}

function EmployeeActions({
  employee,
  onEdit,
  onToggleAccess,
}: {
  employee: Employee;
  onEdit: () => void;
  onToggleAccess: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label={`${employee.name} нэмэлт үйлдэл`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/business/dashboard/employees/$employeeId" params={{ employeeId: employee.id }}>
            Дэлгэрэнгүй мэдээлэл
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>Мэдээлэл засах</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>Хуваарь тохируулах</DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={onToggleAccess}
        >
          {employee.accessEnabled ? "Нэвтрэх эрх хаах" : "Нэвтрэх эрх нээх"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactElement;
  label: string;
  value: number;
  tone?: "default" | "brand" | "success" | "muted";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface/80 p-3.5 shadow-sm">
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl [&>svg]:h-4.5 [&>svg]:w-4.5",
          tone === "default" && "bg-secondary text-foreground",
          tone === "brand" && "bg-brand-soft text-[var(--brand)]",
          tone === "success" &&
            "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]",
          tone === "muted" && "bg-secondary text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-bold tabular-nums">{value}</span>
        <span className="block truncate text-xs text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

function RequestSummaryCard({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: RequestStatus;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-surface/80 p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            status === "all" && "bg-[var(--brand)]",
            status === "pending" && "bg-[var(--warning)]",
            status === "approved" && "bg-[var(--success)]",
            status === "declined" && "bg-destructive",
          )}
        />
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function CountBadge({ children, attention = false }: { children: number; attention?: boolean }) {
  return (
    <span
      className={cn(
        "inline-grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
        attention
          ? "bg-[color-mix(in_oklch,var(--warning)_20%,transparent)] text-[var(--warning)]"
          : "bg-secondary text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function todayWorkHours(employee: Employee) {
  const todaySchedule = employee.weeklySchedule?.find((day) => day.day === new Date().getDay());
  if (!todaySchedule) return employee.workingHours;
  return todaySchedule.enabled
    ? `${todaySchedule.startTime}–${todaySchedule.endTime}`
    : "Өнөөдөр амарна";
}

function requestDayCount(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

function formatRequestRange(from: string, to: string) {
  if (from === to) return formatDate(from);
  return `${formatDate(from)} – ${formatDate(to)}`;
}
