import { useMemo, useState } from "react";
import {
  AlarmClock,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileSpreadsheet,
  MapPin,
  Search,
  TimerReset,
  UserCheck,
  UserX,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import type { AttendanceRecord, Employee, EmployeeWorkDay } from "@/lib/dashboard/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarInitials, EmptyState, PageHeader } from "../ui";
import { cn } from "@/lib/utils";

const weekdayNames = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

type ViewMode = "hours" | "count";
type PeriodMode = "week" | "month" | "custom";
type AttendanceViewStatus = "present" | "late" | "absent" | "leave" | "off" | "pending";

interface AttendanceRow {
  employee: Employee;
  date: string;
  schedule: EmployeeWorkDay;
  attendance?: AttendanceRecord;
  status: AttendanceViewStatus;
  plannedMinutes: number;
  workedMinutes: number;
  scheduledWorkedMinutes: number;
  unworkedMinutes: number;
  lateMinutes: number;
  earlyMinutes: number;
  overtimeMinutes: number;
  breakMinutes: number;
  bookedMinutes: number;
  bookingCount: number;
  branchName: string;
}

const statusLabel: Record<AttendanceViewStatus, string> = {
  present: "Хэвийн",
  late: "Хоцорсон",
  absent: "Тасалсан",
  leave: "Чөлөөтэй",
  off: "Амарна",
  pending: "Хүлээгдэж буй",
};

const statusTone: Record<AttendanceViewStatus, string> = {
  present:
    "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)] border-[color-mix(in_oklch,var(--success)_24%,transparent)]",
  late: "bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] text-[var(--warning)] border-[color-mix(in_oklch,var(--warning)_24%,transparent)]",
  absent:
    "bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] text-destructive border-[color-mix(in_oklch,var(--destructive)_22%,transparent)]",
  leave: "bg-secondary text-muted-foreground border-border",
  off: "bg-secondary text-muted-foreground border-border",
  pending:
    "bg-[color-mix(in_oklch,var(--brand)_10%,transparent)] text-[var(--brand)] border-[color-mix(in_oklch,var(--brand)_20%,transparent)]",
};

function localISO(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return localISO(date);
}

function startOfWeek(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return localISO(date);
}

function startOfMonth(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}

function endOfMonth(iso: string) {
  const date = new Date(`${startOfMonth(iso)}T00:00:00`);
  date.setMonth(date.getMonth() + 1, 0);
  return localISO(date);
}

function addMonths(iso: string, months: number) {
  const date = new Date(`${iso}T00:00:00`);
  const originalDay = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(originalDay, lastDay));
  return localISO(date);
}

function inclusiveDates(start: string, end: string) {
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function inclusiveDayCount(start: string, end: string) {
  const from = new Date(`${start}T00:00:00`).getTime();
  const to = new Date(`${end}T00:00:00`).getTime();
  return Math.max(1, Math.round((to - from) / 86_400_000) + 1);
}

function minutesOf(time?: string) {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  return Math.max(0, minutesOf(end) - minutesOf(start));
}

function durationLabel(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours}ц ${minutes}м`;
}

function compactDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function scheduleForDate(employee: Employee, date: string): EmployeeWorkDay {
  const dayNumber = new Date(`${date}T00:00:00`).getDay();
  const configured = employee.weeklySchedule?.find((day) => day.day === dayNumber);
  if (configured) return configured;
  const [startTime = "09:00", endTime = "18:00"] = employee.workingHours.split(/[–-]/);
  return {
    day: dayNumber,
    enabled: dayNumber !== 0,
    startTime,
    endTime,
  };
}

function approvedLeave(employee: Employee, date: string) {
  return employee.leave.some(
    (leave) => leave.status === "approved" && date >= leave.from && date <= leave.to,
  );
}

function getViewStatus(
  schedule: EmployeeWorkDay,
  attendance: AttendanceRecord | undefined,
  onLeave: boolean,
): AttendanceViewStatus {
  if (onLeave || attendance?.status === "leave") return "leave";
  if (!schedule.enabled) return "off";
  return attendance?.status ?? "pending";
}

export function EmployeeSchedulePage() {
  const { employees, bookings, branches, selectedBranchId } = useDashboardData();
  const [date, setDate] = useState(localISO(new Date()));
  const [periodMode, setPeriodMode] = useState<PeriodMode>("week");
  const [customStart, setCustomStart] = useState(startOfWeek(localISO(new Date())));
  const [customEnd, setCustomEnd] = useState(addDays(startOfWeek(localISO(new Date())), 6));
  const [viewMode, setViewMode] = useState<ViewMode>("hours");
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AttendanceViewStatus>("all");

  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);
  const rangeStart =
    periodMode === "week" ? weekStart : periodMode === "month" ? startOfMonth(date) : customStart;
  const rangeEnd =
    periodMode === "week" ? weekEnd : periodMode === "month" ? endOfMonth(date) : customEnd;
  const periodDates = useMemo(() => inclusiveDates(rangeStart, rangeEnd), [rangeStart, rangeEnd]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const branchEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => selectedBranchId === "all" || employee.branchId === selectedBranchId,
      ),
    [employees, selectedBranchId],
  );

  const allRows = useMemo<AttendanceRow[]>(
    () =>
      periodDates.flatMap((rowDate) =>
        branchEmployees.map((employee) => {
          const schedule = scheduleForDate(employee, rowDate);
          const attendance = employee.attendance.find((record) => record.date === rowDate);
          const onLeave = approvedLeave(employee, rowDate);
          const status = getViewStatus(schedule, attendance, onLeave);
          const plannedMinutes =
            schedule.enabled && !onLeave ? minutesBetween(schedule.startTime, schedule.endTime) : 0;
          const breakMinutes =
            attendance?.breaks?.reduce(
              (total, item) => total + minutesBetween(item.startTime, item.endTime),
              0,
            ) ?? 0;
          const workedMinutes = Math.max(
            0,
            minutesBetween(attendance?.checkIn, attendance?.checkOut) - breakMinutes,
          );
          const lateMinutes = attendance?.checkIn
            ? Math.max(0, minutesOf(attendance.checkIn) - minutesOf(schedule.startTime))
            : 0;
          const earlyMinutes = attendance?.checkOut
            ? Math.max(0, minutesOf(schedule.endTime) - minutesOf(attendance.checkOut))
            : 0;
          const overtimeMinutes = attendance?.checkOut
            ? Math.max(0, minutesOf(attendance.checkOut) - minutesOf(schedule.endTime))
            : 0;
          const employeeBookings = bookings.filter(
            (booking) =>
              booking.date === rowDate &&
              booking.employeeId === employee.id &&
              booking.status !== "cancelled",
          );
          const bookedMinutes = employeeBookings.reduce(
            (total, booking) => total + booking.durationMin,
            0,
          );
          const branchName =
            branches.find((branch) => branch.id === employee.branchId)?.name ?? "—";

          return {
            employee,
            date: rowDate,
            schedule,
            attendance,
            status,
            plannedMinutes,
            workedMinutes,
            scheduledWorkedMinutes: Math.min(plannedMinutes, workedMinutes),
            unworkedMinutes:
              status === "absent"
                ? plannedMinutes
                : status === "present" || status === "late"
                  ? Math.max(0, plannedMinutes - workedMinutes)
                  : 0,
            lateMinutes,
            earlyMinutes,
            overtimeMinutes,
            breakMinutes,
            bookedMinutes,
            bookingCount: employeeBookings.length,
            branchName,
          };
        }),
      ),
    [branchEmployees, periodDates, bookings, branches],
  );

  const rows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return allRows.filter((row) => {
      if (employeeFilter !== "all" && row.employee.id !== employeeFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (
        normalizedSearch &&
        !`${row.employee.name} ${row.employee.position} ${row.employee.phone}`
          .toLowerCase()
          .includes(normalizedSearch)
      )
        return false;
      return true;
    });
  }, [allRows, employeeFilter, statusFilter, search]);

  const totals = useMemo(
    () => ({
      plannedMinutes: rows.reduce((total, row) => total + row.plannedMinutes, 0),
      plannedCount: rows.filter((row) => row.plannedMinutes > 0).length,
      absentMinutes: rows
        .filter((row) => row.status === "absent")
        .reduce((total, row) => total + row.plannedMinutes, 0),
      absentCount: rows.filter((row) => row.status === "absent").length,
      lateMinutes: rows.reduce((total, row) => total + row.lateMinutes, 0),
      lateCount: rows.filter((row) => row.lateMinutes > 0).length,
      unworkedMinutes: rows.reduce((total, row) => total + row.unworkedMinutes, 0),
      unworkedCount: rows.filter((row) => row.unworkedMinutes > 0).length,
      scheduledWorkedMinutes: rows.reduce((total, row) => total + row.scheduledWorkedMinutes, 0),
      workedCount: rows.filter((row) => row.workedMinutes > 0).length,
      workedMinutes: rows.reduce((total, row) => total + row.workedMinutes, 0),
      bookedMinutes: rows.reduce((total, row) => total + row.bookedMinutes, 0),
      bookingCount: rows.reduce((total, row) => total + row.bookingCount, 0),
      overtimeMinutes: rows.reduce((total, row) => total + row.overtimeMinutes, 0),
      overtimeCount: rows.filter((row) => row.overtimeMinutes > 0).length,
    }),
    [rows],
  );

  const metric = (minutes: number, count: number) =>
    viewMode === "hours" ? durationLabel(minutes) : `${count} бүртгэл`;

  const movePeriod = (direction: -1 | 1) => {
    if (periodMode === "week") {
      setDate((current) => addDays(current, direction * 7));
      return;
    }
    if (periodMode === "month") {
      setDate((current) => addMonths(current, direction));
      return;
    }
    const offset = inclusiveDayCount(customStart, customEnd) * direction;
    const nextStart = addDays(customStart, offset);
    const nextEnd = addDays(customEnd, offset);
    setCustomStart(nextStart);
    setCustomEnd(nextEnd);
    setDate(nextStart);
  };

  const exportExcel = () => {
    const header = [
      "Огноо",
      "Ажилтан",
      "Албан тушаал",
      "Ирцийн төлөв",
      "Хуваарь",
      "Ирсэн",
      "Явсан",
      "Төлөвлөсөн цаг",
      "Ажилласан цаг",
      "Хоцролт",
      "Эрт явсан",
      "Илүү цаг",
      "Үйлчилгээний цаг",
      "Салбар",
    ];
    const data = rows.map((row) => [
      row.date,
      row.employee.name,
      row.employee.position,
      statusLabel[row.status],
      row.schedule.enabled ? `${row.schedule.startTime}-${row.schedule.endTime}` : "—",
      row.attendance?.checkIn ?? "—",
      row.attendance?.checkOut ?? "—",
      durationLabel(row.plannedMinutes),
      durationLabel(row.workedMinutes),
      durationLabel(row.lateMinutes),
      durationLabel(row.earlyMinutes),
      durationLabel(row.overtimeMinutes),
      durationLabel(row.bookedMinutes),
      row.branchName,
    ]);
    const csv = [header, ...data]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ajiltnii-irts-${rangeStart}-${rangeEnd}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const formatLongDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const selectedPeriodLabel = `${formatLongDate(rangeStart)} — ${formatLongDate(rangeEnd)}`;
  const uniqueEmployeeCount = new Set(rows.map((row) => row.employee.id)).size;

  const selectPeriodMode = (mode: PeriodMode) => {
    setPeriodMode(mode);
    if (mode === "custom" && customEnd < customStart) setCustomEnd(customStart);
  };

  const resetToToday = () => {
    const today = localISO(new Date());
    setDate(today);
    if (periodMode === "custom") {
      setCustomStart(today);
      setCustomEnd(today);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Ажилтны цагийн хуваарь"
        description="Ажилтнуудын хуваарь, ирц, ажилласан цаг болон хоцролтыг нэг дор хянана."
        actions={
          <Button variant="outline" className="gap-2 rounded-lg" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4 text-[var(--success)]" />
            Excel экспорт
          </Button>
        }
      />

      <section className="sticky top-[61px] z-20 -mx-1 bg-background/95 px-1 pb-2 backdrop-blur-xl lg:top-0">
        <div className="rounded-2xl border border-border/80 bg-surface/95 p-4 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-grid grid-cols-3 rounded-xl bg-secondary/80 p-1 text-xs font-semibold">
                  {(
                    [
                      ["week", "7 хоног"],
                      ["month", "Сар"],
                      ["custom", "Заасан хугацаа"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => selectPeriodMode(mode)}
                      className={cn(
                        "rounded-lg px-3 py-2 transition",
                        periodMode === mode
                          ? "bg-[var(--brand)] text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => movePeriod(-1)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary"
                  aria-label="Өмнөх хугацаа"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {periodMode === "month" ? (
                  <Input
                    type="month"
                    value={date.slice(0, 7)}
                    onChange={(event) => event.target.value && setDate(`${event.target.value}-01`)}
                    className="h-9 w-[150px] text-xs"
                    aria-label="Сар сонгох"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={rangeStart}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        if (periodMode === "week") setDate(event.target.value);
                        else {
                          setCustomStart(event.target.value);
                          setDate(event.target.value);
                          if (event.target.value > customEnd) setCustomEnd(event.target.value);
                        }
                      }}
                      className="h-9 w-[145px] text-xs"
                      aria-label="Эхлэх огноо"
                    />
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                      type="date"
                      value={rangeEnd}
                      min={periodMode === "custom" ? customStart : undefined}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        if (periodMode === "week") setDate(addDays(event.target.value, -6));
                        else setCustomEnd(event.target.value);
                      }}
                      className="h-9 w-[145px] text-xs"
                      aria-label="Дуусах огноо"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => movePeriod(1)}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary"
                  aria-label="Дараагийн хугацаа"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {selectedPeriodLabel} · {periodDates.length} өдөр
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-lg" onClick={resetToToday}>
                Өнөөдөр
              </Button>
              <div className="inline-grid grid-cols-2 rounded-xl bg-secondary/80 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode("hours")}
                  className={cn(
                    "rounded-lg px-4 py-2 transition",
                    viewMode === "hours"
                      ? "bg-[var(--success)] text-white shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  Цагаар
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("count")}
                  className={cn(
                    "rounded-lg px-4 py-2 transition",
                    viewMode === "count"
                      ? "bg-[var(--success)] text-white shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  Тоогоор
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            <MetricCard
              icon={<CalendarCheck2 />}
              label="Төлөвлөсөн"
              value={metric(totals.plannedMinutes, totals.plannedCount)}
              tone="blue"
            />
            <MetricCard
              icon={<UserX />}
              label="Тасалсан"
              value={metric(totals.absentMinutes, totals.absentCount)}
              tone="red"
            />
            <MetricCard
              icon={<AlarmClock />}
              label="Хоцролт"
              value={metric(totals.lateMinutes, totals.lateCount)}
              tone="orange"
            />
            <MetricCard
              icon={<CalendarOff />}
              label="Нийт ажиллаагүй"
              value={metric(totals.unworkedMinutes, totals.unworkedCount)}
              tone="red"
            />
            <MetricCard
              icon={<UserCheck />}
              label="Хуваарийн дагуу"
              value={metric(totals.scheduledWorkedMinutes, totals.workedCount)}
              tone="green"
            />
            <MetricCard
              icon={<Clock3 />}
              label="Нийт ажилласан"
              value={metric(totals.workedMinutes, totals.workedCount)}
              tone="green"
            />
            <MetricCard
              icon={<CalendarDays />}
              label="Үйлчилгээний цаг"
              value={metric(totals.bookedMinutes, totals.bookingCount)}
              tone="amber"
            />
            <MetricCard
              icon={<TimerReset />}
              label="Илүү цаг"
              value={metric(totals.overtimeMinutes, totals.overtimeCount)}
              tone="blue"
            />
          </div>
        </div>
      </section>

      {periodMode === "week" && (
        <section className="overflow-x-auto rounded-2xl border border-border/80 bg-surface/80 p-3 shadow-sm">
          <div className="grid min-w-[760px] grid-cols-7 gap-2">
            {weekDates.map((weekDate) => {
              const parsed = new Date(`${weekDate}T00:00:00`);
              const active = weekDate === date;
              const workingEmployees = branchEmployees.filter((employee) => {
                const schedule = scheduleForDate(employee, weekDate);
                return schedule.enabled && !approvedLeave(employee, weekDate);
              }).length;
              return (
                <button
                  key={weekDate}
                  type="button"
                  onClick={() => setDate(weekDate)}
                  className={cn(
                    "rounded-xl border px-3 py-3.5 text-center transition",
                    active
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm"
                      : "border-transparent bg-surface-muted/45 hover:border-border hover:bg-secondary",
                  )}
                >
                  <p
                    className={cn("text-[10px] font-semibold", !active && "text-muted-foreground")}
                  >
                    {weekdayNames[parsed.getDay()]}
                  </p>
                  <p className="mt-0.5 text-xs font-bold">{weekDate}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-[9px]",
                      active ? "text-white/75" : "text-muted-foreground",
                    )}
                  >
                    {workingEmployees} ажиллах
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/80 p-4 sm:p-5">
          <div>
            <h2 className="text-sm font-bold">{selectedPeriodLabel}</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {uniqueEmployeeCount} ажилтан · {rows.length} ирцийн бүртгэл
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ажилтнаар хайх..."
                className="h-9 w-[210px] rounded-lg pl-9 text-xs"
              />
            </label>
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="h-9 w-[190px] text-xs">
                <SelectValue placeholder="Бүх ажилтан" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх ажилтан</SelectItem>
                {branchEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} · {employee.position}
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
                {(Object.keys(statusLabel) as AttendanceViewStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabel[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<UserX className="h-6 w-6" />}
            title="Ажилтан олдсонгүй"
            description="Хайлт эсвэл ирцийн төлвөө өөрчилнө үү."
          />
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [scrollbar-gutter:stable]">
            <table className="w-full min-w-[1620px] border-separate border-spacing-0 text-xs">
              <thead className="sticky top-0 z-30 bg-surface">
                <tr className="text-left text-[11px] text-muted-foreground">
                  <TableHead className="sticky left-0 z-40 w-[132px] min-w-[132px] bg-surface">
                    Огноо
                  </TableHead>
                  <TableHead className="sticky left-[132px] z-40 w-[220px] min-w-[220px] border-r bg-surface">
                    Ажилтан
                  </TableHead>
                  <TableHead className="min-w-[130px]">Ирцийн төлөв</TableHead>
                  <TableHead className="min-w-[125px]">Хуваарь</TableHead>
                  <TableHead className="min-w-[95px]">Ирсэн</TableHead>
                  <TableHead className="min-w-[95px]">Явсан</TableHead>
                  <TableHead className="min-w-[125px]">Төлөвлөсөн</TableHead>
                  <TableHead className="min-w-[125px]">Ажилласан</TableHead>
                  <TableHead className="min-w-[110px]">Хоцролт</TableHead>
                  <TableHead className="min-w-[110px]">Эрт явсан</TableHead>
                  <TableHead className="min-w-[105px]">Илүү цаг</TableHead>
                  <TableHead className="min-w-[130px]">Завсарлага</TableHead>
                  <TableHead className="min-w-[145px]">Үйлчилгээ</TableHead>
                  <TableHead className="min-w-[180px]">Салбар / Байршил</TableHead>
                  <TableHead className="min-w-[180px]">Ажлын тайлан</TableHead>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.date}-${row.employee.id}`}
                    className="group hover:bg-secondary/35"
                  >
                    <TableCell className="sticky left-0 z-20 bg-surface group-hover:bg-secondary/35">
                      <p className="font-semibold">{compactDate(row.date)}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {weekdayNames[new Date(`${row.date}T00:00:00`).getDay()]}
                      </p>
                    </TableCell>
                    <TableCell className="sticky left-[132px] z-20 border-r bg-surface group-hover:bg-secondary/35">
                      <div className="flex items-center gap-2.5">
                        <AvatarInitials name={row.employee.name} className="h-8 w-8 text-[10px]" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{row.employee.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {row.employee.position}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold",
                          statusTone[row.status],
                        )}
                      >
                        {statusLabel[row.status]}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {row.schedule.enabled
                        ? `${row.schedule.startTime}–${row.schedule.endTime}`
                        : "—"}
                    </TableCell>
                    <TableCell className="font-mono">{row.attendance?.checkIn ?? "—"}</TableCell>
                    <TableCell className="font-mono">{row.attendance?.checkOut ?? "—"}</TableCell>
                    <TableCell>
                      {row.plannedMinutes ? durationLabel(row.plannedMinutes) : "—"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {row.workedMinutes ? durationLabel(row.workedMinutes) : "—"}
                    </TableCell>
                    <TableCell
                      className={row.lateMinutes ? "font-semibold text-[var(--warning)]" : ""}
                    >
                      {row.lateMinutes ? durationLabel(row.lateMinutes) : "—"}
                    </TableCell>
                    <TableCell className={row.earlyMinutes ? "text-destructive" : ""}>
                      {row.earlyMinutes ? durationLabel(row.earlyMinutes) : "—"}
                    </TableCell>
                    <TableCell
                      className={row.overtimeMinutes ? "font-semibold text-[var(--success)]" : ""}
                    >
                      {row.overtimeMinutes ? durationLabel(row.overtimeMinutes) : "—"}
                    </TableCell>
                    <TableCell>
                      {row.breakMinutes ? durationLabel(row.breakMinutes) : "—"}
                    </TableCell>
                    <TableCell>
                      {row.bookingCount > 0 ? (
                        <div>
                          <p className="font-semibold">{row.bookingCount} захиалга</p>
                          <p className="text-[10px] text-muted-foreground">
                            {durationLabel(row.bookedMinutes)}
                          </p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1.5 text-[10px] font-medium">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {row.branchName}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.status === "absent"
                        ? "Ирээгүй"
                        : row.bookingCount > 0
                          ? `${row.bookingCount} үйлчилгээ гүйцэтгэсэн`
                          : "Тайлан бүртгэгдээгүй"}
                    </TableCell>
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

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "blue" | "red" | "orange" | "green" | "amber";
}) {
  const tones = {
    blue: "text-[var(--brand)]",
    red: "text-destructive",
    orange: "text-[var(--warning)]",
    green: "text-[var(--success)]",
    amber: "text-[color-mix(in_oklch,var(--warning)_78%,var(--foreground))]",
  } as const;

  return (
    <div className="min-h-[68px] min-w-0 rounded-xl border border-border/70 bg-surface-muted/35 p-3">
      <div className="flex items-start gap-1.5 text-[10px] font-semibold leading-4 text-muted-foreground">
        <span className={cn("[&_svg]:h-3.5 [&_svg]:w-3.5", tones[tone])}>{icon}</span>
        <span>{label}</span>
      </div>
      <p className={cn("mt-1.5 whitespace-nowrap text-base font-extrabold", tones[tone])}>
        {value}
      </p>
    </div>
  );
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("h-14 border-b border-border px-4 font-semibold", className)}>{children}</th>
  );
}

function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("h-[72px] border-b border-border/70 px-4 align-middle", className)}>
      {children}
    </td>
  );
}
