import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ClipboardList,
  Wallet,
  UserPlus,
  CheckCircle2,
  Ban,
  CalendarDays,
  Plus,
  ChevronRight,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Repeat,
  Eye,
  Smartphone,
  PenLine,
  UserCog,
  Coffee,
  LogIn,
  LogOut,
  CalendarRange,
  List,
} from "lucide-react";
import type { AuthSession } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { TANU_PROFILE_ANALYTICS, today } from "@/lib/dashboard/mock-data";
import {
  attendanceStatusLabel,
  bookingSourceLabel,
  type AttendanceStatus,
  type Booking,
  type BookingSource,
} from "@/lib/dashboard/types";
import {
  aggregate,
  pctChange,
  previousSlice,
  sliceRange,
  type RangeKey,
} from "@/lib/dashboard/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  AvatarInitials,
  BookingStatusBadge,
  EmptyState,
  StatCard,
  formatDateShort,
  money,
} from "../ui";
import { BookingDrawer } from "../BookingDrawer";
import { AddBookingModal } from "../AddBookingModal";
import { CalendarMonthGrid, CalendarTimeGrid } from "./CalendarPage";

const sourceIcon: Record<BookingSource, typeof Smartphone> = {
  app: Smartphone,
  admin_manual: UserCog,
  employee_manual: PenLine,
};

type ScheduleRange = "today" | "3d" | "7d" | "month" | "date";
type ScheduleView = "list" | "calendar";

function localISO(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addISODate(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return localISO(date);
}

function scheduleBounds(baseDate: string, range: ScheduleRange) {
  if (range === "month") {
    const date = new Date(`${baseDate}T00:00:00`);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start: localISO(start), end: localISO(end) };
  }
  const days = range === "3d" ? 3 : range === "7d" ? 7 : 1;
  return { start: baseDate, end: addISODate(baseDate, days - 1) };
}

function isOpenNow(workingHours: string) {
  const [start, end] = workingHours.split("–");
  const now = new Date();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= sh * 60 + sm && minutesNow <= eh * 60 + em;
}

export function OwnerDashboardHome({ session }: { session: AuthSession }) {
  const { bookings, employees, services, customers, branches, revenueHistory, selectedBranchId } =
    useDashboardData();
  const navigate = useNavigate();

  const [drawerBookingId, setDrawerBookingId] = useState<string | null>(null);
  const [addBookingOpen, setAddBookingOpen] = useState(false);
  const [range, setRange] = useState<RangeKey>("7d");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [scheduleRange, setScheduleRange] = useState<ScheduleRange>("today");
  const [scheduleView, setScheduleView] = useState<ScheduleView>("list");
  const [scheduleDate, setScheduleDate] = useState(today());

  const branch =
    selectedBranchId === "all" ? null : (branches.find((b) => b.id === selectedBranchId) ?? null);
  const branchLabel = branch?.name ?? "Бүх салбар";
  const open = isOpenNow(branch?.workingHours ?? "09:00–20:00");

  const scoped = useMemo(
    () => (branch ? bookings.filter((b) => b.branchId === branch.id) : bookings),
    [bookings, branch],
  );

  const todaysBookings = useMemo(
    () =>
      scoped
        .filter((b) => b.date === today())
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [scoped],
  );
  const yesterdayISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const yesterdaysBookings = useMemo(
    () => scoped.filter((b) => b.date === yesterdayISO),
    [scoped, yesterdayISO],
  );

  const kpis = useMemo(() => {
    const revenueToday = todaysBookings
      .filter((b) => b.status !== "cancelled" && b.status !== "no-show")
      .reduce((s, b) => s + b.price, 0);
    const revenueYesterday = yesterdaysBookings
      .filter((b) => b.status !== "cancelled" && b.status !== "no-show")
      .reduce((s, b) => s + b.price, 0);
    const newCustomersToday = customers.filter((c) => c.joinedAt === today()).length;
    const newCustomersYesterday = customers.filter((c) => c.joinedAt === yesterdayISO).length;
    const completedToday = todaysBookings.filter((b) => b.status === "completed").length;
    const completedYesterday = yesterdaysBookings.filter((b) => b.status === "completed").length;
    const lostToday = todaysBookings.filter(
      (b) => b.status === "cancelled" || b.status === "no-show",
    ).length;
    const lostYesterday = yesterdaysBookings.filter(
      (b) => b.status === "cancelled" || b.status === "no-show",
    ).length;
    return {
      bookingsCount: {
        value: todaysBookings.length,
        delta: todaysBookings.length - yesterdaysBookings.length,
      },
      revenue: { value: revenueToday, delta: pctChange(revenueToday, revenueYesterday) },
      newCustomers: { value: newCustomersToday, delta: newCustomersToday - newCustomersYesterday },
      completed: { value: completedToday, delta: completedToday - completedYesterday },
      lost: { value: lostToday, delta: lostToday - lostYesterday },
    };
  }, [todaysBookings, yesterdaysBookings, customers, yesterdayISO]);

  const scheduleWindow = useMemo(
    () => scheduleBounds(scheduleDate, scheduleRange),
    [scheduleDate, scheduleRange],
  );

  const scheduleBookings = useMemo(
    () =>
      scoped
        .filter(
          (booking) => booking.date >= scheduleWindow.start && booking.date <= scheduleWindow.end,
        )
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [scoped, scheduleWindow],
  );

  const scheduleGroups = useMemo(
    () =>
      scheduleBookings.reduce<{ date: string; bookings: Booking[] }[]>((groups, booking) => {
        const currentGroup = groups.at(-1);
        if (currentGroup?.date === booking.date) {
          currentGroup.bookings.push(booking);
        } else {
          groups.push({ date: booking.date, bookings: [booking] });
        }
        return groups;
      }, []),
    [scheduleBookings],
  );

  const scheduleDescription =
    scheduleRange === "today"
      ? "Өнөөдрийн бүх захиалга"
      : scheduleRange === "3d"
        ? "Өнөөдрөөс эхлэх 3 өдрийн захиалга"
        : scheduleRange === "7d"
          ? "Өнөөдрөөс эхлэх 7 хоногийн захиалга"
          : scheduleRange === "month"
            ? new Date(`${scheduleDate}T00:00:00`).toLocaleDateString("mn-MN", {
                year: "numeric",
                month: "long",
              })
            : new Date(`${scheduleDate}T00:00:00`).toLocaleDateString("mn-MN", {
                month: "long",
                day: "numeric",
                weekday: "long",
              });

  const employeeList = useMemo(
    () => (branch ? employees.filter((e) => e.branchId === branch.id) : employees),
    [employees, branch],
  );

  const attendanceRows = useMemo(
    () =>
      employeeList.map((employee) => ({
        employee,
        attendance: employee.attendance.find((record) => record.date === today()),
      })),
    [employeeList],
  );

  const attendanceSummary = useMemo(
    () =>
      attendanceRows.reduce(
        (summary, row) => {
          const status = row.attendance?.status ?? "absent";
          if (status === "present" || status === "late") summary.arrived += 1;
          if (status === "late") summary.late += 1;
          if (status === "absent") summary.absent += 1;
          if (status === "leave") summary.leave += 1;
          return summary;
        },
        { arrived: 0, late: 0, absent: 0, leave: 0 },
      ),
    [attendanceRows],
  );

  const revenueSlice = sliceRange(revenueHistory, range, customRange);
  const revenuePrev = previousSlice(revenueHistory, range, customRange);
  const agg = aggregate(revenueSlice);
  const aggPrev = aggregate(revenuePrev);
  const growth = pctChange(agg.totalRevenue, aggPrev.totalRevenue);

  const bookingSourceBreakdown = useMemo(() => {
    const counts: Record<BookingSource, number> = { app: 0, admin_manual: 0, employee_manual: 0 };
    scoped.forEach((b) => (counts[b.source] += 1));
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return (Object.entries(counts) as [BookingSource, number][])
      .map(([source, count]) => ({ source, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [scoped]);

  const popularServices = useMemo(
    () => [...services].sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5),
    [services],
  );

  const customerSummary = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString().slice(0, 10);
    const newThisWeek = customers.filter((c) => c.joinedAt >= weekAgoISO).length;
    const returning = customers.filter((c) => c.totalBookings > 1).length;
    const withUpcoming = new Set(
      scoped.filter((b) => b.status === "upcoming").map((b) => b.customerId),
    ).size;
    const recent = [...customers].sort((a, b) => (a.lastVisit < b.lastVisit ? 1 : -1)).slice(0, 5);
    return { newThisWeek, returning, withUpcoming, recent };
  }, [customers, scoped]);

  const alerts = useMemo(() => {
    const list: { text: string; to: string }[] = [];
    const pendingLeave = employees.filter((e) =>
      e.leave.some((l) => l.status === "pending"),
    ).length;
    if (pendingLeave > 0)
      list.push({
        text: `${pendingLeave} ажилтны чөлөөний хүсэлт хүлээгдэж байна`,
        to: "/business/dashboard/employees",
      });
    const staleServices = services.filter((s) => s.active && s.rating < 4.6).length;
    if (staleServices > 0)
      list.push({
        text: `${staleServices} үйлчилгээний мэдээлэл шинэчлэх шаардлагатай`,
        to: "/business/dashboard/services",
      });
    const repeatCancellers = customers.filter((c) => c.cancelledBookings >= 2);
    if (repeatCancellers.length > 0)
      list.push({
        text: `${repeatCancellers[0].name} олон удаа цаг цуцалсан байна`,
        to: "/business/dashboard/customers",
      });
    const thisWeek = revenueHistory.slice(-7).reduce((s, p) => s + p.revenue, 0);
    const lastWeek = revenueHistory.slice(-14, -7).reduce((s, p) => s + p.revenue, 0);
    if (thisWeek < lastWeek)
      list.push({
        text: "Энэ долоо хоногийн орлого өмнөх долоо хоногоос буурсан",
        to: "/business/dashboard/finance",
      });
    const tomorrowFree = Math.max(
      0,
      employeeList.length * 3 - scoped.filter((b) => b.date > today()).length,
    );
    if (tomorrowFree > 0)
      list.push({
        text: `Маргааш ${tomorrowFree} сул цаг байна`,
        to: "/business/dashboard/calendar",
      });
    return list;
  }, [employees, services, customers, revenueHistory, employeeList, scoped]);

  const quickActions = [
    { label: "Захиалга нэмэх", icon: Plus, action: () => setAddBookingOpen(true) },
    {
      label: "Ажилтан нэмэх",
      icon: UserPlus,
      action: () => navigate({ to: "/business/dashboard/employees" }),
    },
    {
      label: "Үйлчилгээ нэмэх",
      icon: ClipboardList,
      action: () => navigate({ to: "/business/dashboard/services" }),
    },
    {
      label: "Хэрэглэгч нэмэх",
      icon: Users,
      action: () => navigate({ to: "/business/dashboard/customers" }),
    },
    {
      label: "Хуваарь тохируулах",
      icon: CalendarDays,
      action: () => navigate({ to: "/business/dashboard/calendar" }),
    },
    {
      label: "Тайлан харах",
      icon: TrendingUp,
      action: () => navigate({ to: "/business/dashboard/reports" }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Welcome header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Өдрийн мэнд, {session.org.replace(/\s*Studio$/, "")}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                open
                  ? "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${open ? "bg-[var(--success)]" : "bg-muted-foreground"}`}
              />
              {open ? "Одоо ажиллаж байна" : "Одоо хаалттай"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Өнөөдрийн захиалга болон үйл ажиллагааны тойм
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date().toLocaleDateString("mn-MN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}{" "}
            · {branchLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setAddBookingOpen(true)}
            className="gap-1.5 rounded-xl bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Захиалга нэмэх
          </Button>
          <Button variant="outline" asChild className="gap-1.5 rounded-xl">
            <Link to="/business/dashboard/calendar">
              <CalendarDays className="h-4 w-4" /> Календарь харах
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="Өнөөдрийн захиалга"
          value={kpis.bookingsCount.value}
          delta={`${kpis.bookingsCount.delta >= 0 ? "+" : ""}${kpis.bookingsCount.delta} өчигдрөөс`}
          deltaTone={kpis.bookingsCount.delta >= 0 ? "up" : "down"}
          tooltip="Өнөөдрийн нийт захиалгын тоо (бүх төлөвөөр)."
        />
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Өнөөдрийн орлого"
          value={money(kpis.revenue.value)}
          delta={
            kpis.revenue.delta === null
              ? undefined
              : `${kpis.revenue.delta >= 0 ? "+" : ""}${kpis.revenue.delta}%`
          }
          deltaTone={
            kpis.revenue.delta === null ? "neutral" : kpis.revenue.delta >= 0 ? "up" : "down"
          }
          tooltip="Цуцлагдаагүй захиалгуудын нийт үнийн дүн."
        />
        <StatCard
          icon={<UserPlus className="h-4 w-4" />}
          label="Шинэ хэрэглэгч"
          value={kpis.newCustomers.value}
          delta={`${kpis.newCustomers.delta >= 0 ? "+" : ""}${kpis.newCustomers.delta} өчигдрөөс`}
          deltaTone={kpis.newCustomers.delta >= 0 ? "up" : "down"}
          tooltip="Өнөөдөр анх удаа бүртгүүлсэн хэрэглэгчдийн тоо."
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Дууссан үйлчилгээ"
          value={kpis.completed.value}
          delta={`${kpis.completed.delta >= 0 ? "+" : ""}${kpis.completed.delta} өчигдрөөс`}
          deltaTone={kpis.completed.delta >= 0 ? "up" : "down"}
          tooltip="Өнөөдөр амжилттай дуусгасан захиалгын тоо."
        />
        <StatCard
          icon={<Ban className="h-4 w-4" />}
          label="Цуцлагдсан / ирээгүй"
          value={kpis.lost.value}
          delta={`${kpis.lost.delta >= 0 ? "+" : ""}${kpis.lost.delta} өчигдрөөс`}
          deltaTone={kpis.lost.delta <= 0 ? "up" : "down"}
          tooltip="Цуцлагдсан болон үйлчлүүлэгч ирээгүй захиалгын нийлбэр."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* 3. Booking schedule */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklch,var(--brand)_12%,transparent)] text-[var(--brand)]">
                  <CalendarDays className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">Захиалгын хуваарь</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {scheduleDescription} · {scheduleBookings.length} захиалга
                  </p>
                </div>
              </div>
              <div className="inline-flex rounded-lg bg-secondary p-0.5">
                <button
                  type="button"
                  onClick={() => setScheduleView("list")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition ${
                    scheduleView === "list"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <List className="h-3 w-3" /> Жагсаалт
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView("calendar")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition ${
                    scheduleView === "calendar"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <CalendarRange className="h-3 w-3" /> Календарь
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-surface-muted/45 p-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[260px]">
                  <span className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
                    Хугацаа сонгох
                  </span>
                  <div className="inline-grid grid-cols-4 gap-1 rounded-lg bg-surface p-1 shadow-sm">
                    {(
                      [
                        ["today", "Өдөр"],
                        ["3d", "3 өдөр"],
                        ["7d", "7 хоног"],
                        ["month", "Сар"],
                      ] as [ScheduleRange, string][]
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setScheduleRange(key);
                          setScheduleDate(today());
                        }}
                        className={`whitespace-nowrap rounded-md px-2 py-2 text-[10px] font-medium transition ${
                          scheduleRange === key
                            ? "bg-gradient-brand text-white"
                            : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="ml-auto w-[158px] shrink-0">
                  <span className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
                    Өдөр сонгох
                  </span>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(event) => {
                      if (!event.target.value) return;
                      setScheduleDate(event.target.value);
                      setScheduleRange("date");
                    }}
                    className={`h-9 w-full bg-surface px-2.5 text-[11px] ${
                      scheduleRange === "date"
                        ? "border-[var(--brand)] ring-1 ring-[var(--brand)]/15"
                        : ""
                    }`}
                    aria-label="Өдөр сонгох"
                  />
                </label>
              </div>
            </div>

            {scheduleView === "calendar" ? (
              scheduleRange === "month" ? (
                <CalendarMonthGrid
                  date={scheduleDate}
                  bookings={scoped}
                  onPickDay={(date) => {
                    setScheduleDate(date);
                    setScheduleRange("date");
                  }}
                  onOpenBooking={setDrawerBookingId}
                />
              ) : (
                <div className="max-h-[520px] overflow-y-auto rounded-2xl">
                  <CalendarTimeGrid
                    view={scheduleRange === "3d" ? "3day" : scheduleRange === "7d" ? "week" : "day"}
                    date={scheduleDate}
                    columns={
                      scheduleRange === "3d" || scheduleRange === "7d"
                        ? Array.from({ length: scheduleRange === "3d" ? 3 : 7 }, (_, index) => {
                            const date = addISODate(scheduleDate, index);
                            return {
                              key: date,
                              label: new Date(`${date}T00:00:00`).toLocaleDateString("mn-MN", {
                                weekday: "short",
                                day: "numeric",
                              }),
                              dateIso: date,
                            };
                          })
                        : employeeList.map((employee) => ({
                            key: employee.id,
                            label: employee.name,
                            employeeId: employee.id,
                          }))
                    }
                    mode={scheduleRange === "3d" || scheduleRange === "7d" ? "date" : "employee"}
                    bookings={scoped}
                    now={new Date()}
                    onSlotClick={() => setAddBookingOpen(true)}
                    onBookingClick={setDrawerBookingId}
                    onDragStart={() => undefined}
                    onDrop={() => undefined}
                    draggingId={null}
                  />
                </div>
              )
            ) : scheduleBookings.length === 0 ? (
              <EmptyState
                icon={<CalendarDays className="h-6 w-6" />}
                title="Сонгосон хугацаанд захиалга алга"
                description="Өөр өдөр сонгох эсвэл шинэ захиалга нэмнэ үү."
                action={
                  <Button
                    size="sm"
                    onClick={() => setAddBookingOpen(true)}
                    className="gap-1.5 rounded-lg"
                  >
                    <Plus className="h-3.5 w-3.5" /> Захиалга нэмэх
                  </Button>
                }
              />
            ) : (
              <div className="max-h-[500px] space-y-4 overflow-y-auto pr-1">
                {scheduleGroups.map((group) => (
                  <section key={group.date}>
                    <div className="mb-1.5 flex items-center justify-between px-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-xs font-semibold">
                          {scheduleGroupDateLabel(group.date)}
                        </h3>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateShort(group.date)}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {group.bookings.length} захиалга
                      </span>
                    </div>
                    <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70">
                      {group.bookings.map((booking) => (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => setDrawerBookingId(booking.id)}
                          className="grid w-full grid-cols-[68px_minmax(0,1fr)_auto] items-center gap-3 bg-surface-muted/20 px-3 py-2.5 text-left transition hover:bg-surface-muted/60"
                        >
                          <div className="border-r border-border/60 pr-3">
                            <p className="font-mono text-xs font-bold">{booking.startTime}</p>
                            <p className="text-[9px] text-muted-foreground">
                              {booking.endTime} хүртэл
                            </p>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{booking.customerName}</p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {booking.serviceName} · {booking.employeeName}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="hidden text-xs font-semibold md:block">
                              {money(booking.price)}
                            </span>
                            <BookingStatusBadge status={booking.status} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* 6. Revenue overview */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Орлогын тойм</h2>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    ["7d", "7 хоног"],
                    ["30d", "30 хоног"],
                    ["3m", "3 сар"],
                  ] as [RangeKey, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setRange(key)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      range === key
                        ? "bg-gradient-brand text-white"
                        : "border border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setRange("custom")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    range === "custom"
                      ? "bg-gradient-brand text-white"
                      : "border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Custom
                </button>
                {range === "custom" && (
                  <>
                    <Input
                      type="date"
                      value={customRange.from}
                      onChange={(e) => setCustomRange((p) => ({ ...p, from: e.target.value }))}
                      className="h-8 w-auto text-xs"
                    />
                    <Input
                      type="date"
                      value={customRange.to}
                      onChange={(e) => setCustomRange((p) => ({ ...p, to: e.target.value }))}
                      className="h-8 w-auto text-xs"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Нийт орлого</p>
                <p className="text-lg font-bold">{money(agg.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Захиалгын тоо</p>
                <p className="text-lg font-bold">{agg.totalBookings}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Дундаж захиалга</p>
                <p className="text-lg font-bold">{money(agg.avgBookingValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Өсөлт</p>
                <p
                  className={`flex items-center gap-1 text-lg font-bold ${growth !== null && growth < 0 ? "text-destructive" : "text-[var(--success)]"}`}
                >
                  {growth === null ? (
                    "—"
                  ) : (
                    <>
                      {growth >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {growth >= 0 ? "+" : ""}
                      {growth}%
                    </>
                  )}
                </p>
              </div>
            </div>

            {revenueSlice.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="h-6 w-6" />}
                title="Энэ хугацаанд өгөгдөл алга"
                description="Өөр хугацааны интервал сонгоно уу."
              />
            ) : (
              <ChartContainer
                config={{ revenue: { label: "Орлого", color: "var(--brand)" } }}
                className="aspect-auto h-56 w-full"
              >
                <AreaChart data={revenueSlice}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateShort}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(v) => formatDateShort(String(v))}
                        formatter={(value) => [money(Number(value)), "Орлого"]}
                      />
                    }
                  />
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    stroke="var(--color-revenue)"
                    fill="url(#revFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>

          {/* 8. Popular services */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 font-semibold">Түгээмэл үйлчилгээ</h2>
            <div className="space-y-2.5">
              {popularServices.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-surface-muted/40 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.bookingCount} захиалга · {money(s.revenue)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> {s.rating}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${s.trend >= 0 ? "text-[var(--success)]" : "text-destructive"}`}
                  >
                    {s.trend >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {s.trend >= 0 ? "+" : ""}
                    {s.trend}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 5. Today's employee attendance */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
            <div className="mb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Өнөөдрийн ажилтны ирц</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Ирсэн, явсан цаг болон завсарлага
                  </p>
                </div>
                <Link
                  to="/business/dashboard/employees"
                  className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[var(--brand)] hover:underline"
                >
                  Дэлгэрэнгүй <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                <span className="rounded-full bg-[color-mix(in_oklch,var(--success)_12%,transparent)] px-2 py-0.5 font-medium text-[var(--success)]">
                  Ирсэн {attendanceSummary.arrived}
                </span>
                {attendanceSummary.late > 0 && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700">
                    Хоцорсон {attendanceSummary.late}
                  </span>
                )}
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive">
                  Ирээгүй {attendanceSummary.absent}
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">
                  Чөлөөтэй {attendanceSummary.leave}
                </span>
              </div>
            </div>
            <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/70 bg-surface-muted/30">
              {attendanceRows.map(({ employee, attendance }) => {
                const status = attendance?.status ?? "absent";
                return (
                  <div key={employee.id} className="px-2.5 py-2">
                    <div className="flex items-center gap-2.5">
                      <AvatarInitials name={employee.name} className="h-7 w-7 text-[10px]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">{employee.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {employee.position}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${attendanceStatusTone[status]}`}
                      >
                        {attendanceStatusLabel[status]}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-9 text-[10px]">
                      <AttendanceTime
                        icon={<LogIn className="h-3 w-3" />}
                        label="Ирсэн"
                        value={attendance?.checkIn ?? "—"}
                      />
                      <AttendanceTime
                        icon={<LogOut className="h-3 w-3" />}
                        label="Явсан"
                        value={attendance?.checkOut ?? "—"}
                      />
                      <span className="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
                        <Coffee className="h-3 w-3 shrink-0" />
                        <span className="shrink-0">Завсарлага</span>
                        <strong className="truncate font-medium text-foreground">
                          {attendance?.breaks?.length
                            ? attendance.breaks
                                .map((item) => `${item.startTime}–${item.endTime}`)
                                .join(", ")
                            : "—"}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7. Booking source */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Захиалгын эх сурвалж</h2>
            <div className="space-y-3">
              {bookingSourceBreakdown.map(({ source, pct, count }) => {
                const Icon = sourceIcon[source];
                return (
                  <div key={source}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        {bookingSourceLabel[source]}
                      </span>
                      <span className="text-muted-foreground">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-brand"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 9. Customer summary */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Хэрэглэгчийн тойм</h2>
            <div className="mb-3 grid grid-cols-2 gap-2 text-center">
              <MiniStat
                icon={<UserPlus className="h-3.5 w-3.5" />}
                value={customerSummary.newThisWeek}
                label="Шинэ (7 хоног)"
              />
              <MiniStat
                icon={<Repeat className="h-3.5 w-3.5" />}
                value={customerSummary.returning}
                label="Давтан үйлчлүүлэгч"
              />
              <MiniStat
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                value={customerSummary.withUpcoming}
                label="Удахгүй захиалгатай"
              />
              <MiniStat
                icon={<Eye className="h-3.5 w-3.5" />}
                value={TANU_PROFILE_ANALYTICS.uniqueProfileViews.toLocaleString("mn-MN")}
                label="Tanu профайл үзсэн"
              />
            </div>
            <div className="space-y-1.5">
              {customerSummary.recent.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg bg-surface-muted/40 px-2.5 py-1.5 text-xs"
                >
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="text-muted-foreground">{money(c.totalSpend)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Alerts */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-4 w-4 text-[var(--warning)]" /> Анхаарах зүйлс
            </h2>
            {alerts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Одоогоор анхаарах зүйл алга — бүгд сайхан байна!
              </p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((a, i) => (
                  <li key={i}>
                    <Link
                      to={a.to}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/[0.06] px-3 py-2 text-xs font-medium transition hover:bg-[var(--warning)]/[0.1]"
                    >
                      {a.text}
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 11. Quick actions */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Түргэн үйлдэл</h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((qa) => (
                <button
                  key={qa.label}
                  onClick={qa.action}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3 text-center text-xs font-medium transition hover:-translate-y-0.5 hover:border-[var(--brand)]/25 hover:shadow-sm"
                >
                  <qa.icon className="h-4 w-4 text-[var(--brand)]" />
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BookingDrawer bookingId={drawerBookingId} onOpenChange={setDrawerBookingId} />
      <AddBookingModal open={addBookingOpen} onOpenChange={setAddBookingOpen} />
    </div>
  );
}

const attendanceStatusTone: Record<AttendanceStatus, string> = {
  present: "bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-[var(--success)]",
  late: "bg-amber-500/10 text-amber-700",
  absent: "bg-destructive/10 text-destructive",
  leave: "bg-secondary text-muted-foreground",
};

function scheduleGroupDateLabel(date: string) {
  if (date === today()) return "Өнөөдөр";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0"),
  ].join("-");
  if (date === tomorrowISO) return "Маргааш";
  return new Date(`${date}T00:00:00`).toLocaleDateString("mn-MN", { weekday: "long" });
}

function AttendanceTime({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      {icon}
      {label}
      <strong className="font-mono font-semibold text-foreground">{value}</strong>
    </span>
  );
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface-muted/40 p-2.5">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">{icon}</div>
      <p className="mt-1 text-sm font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
