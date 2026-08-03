import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Coffee,
  Phone,
  StickyNote,
  TrendingUp,
  UserRound,
  UserX,
  DoorOpen,
  PlayCircle,
  Bell,
} from "lucide-react";
import type { AuthSession } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { today } from "@/lib/dashboard/mock-data";
import { notificationTypeLabel } from "@/lib/dashboard/types";
import { Button } from "@/components/ui/button";
import { AvatarInitials, BookingStatusBadge, EmptyState, StatCard, money } from "../ui";
import { BookingDrawer } from "../BookingDrawer";
import { LeaveRequestModal } from "../LeaveRequestModal";

export function EmployeeHome({ session }: { session: AuthSession }) {
  const { employees, bookings, notifications, changeBookingStatus } = useDashboardData();
  const employee = employees.find((e) => e.name === session.name) ?? employees[0];

  const [drawerBookingId, setDrawerBookingId] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const myToday = useMemo(
    () =>
      bookings
        .filter((b) => b.employeeId === employee.id && b.date === today())
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings, employee.id],
  );

  const completed = myToday.filter((b) => b.status === "completed").length;
  const current = myToday.find((b) => b.status === "in-service");
  const next = myToday.find((b) => b.status === "upcoming" || b.status === "arrived");

  const weeklyPerf = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().slice(0, 10);
      const count = bookings.filter((b) => b.employeeId === employee.id && b.date === iso && b.status === "completed").length;
      return { iso, count };
    });
    return days;
  }, [bookings, employee.id]);
  const maxPerf = Math.max(1, ...weeklyPerf.map((d) => d.count));

  const activeBooking = current ?? next ?? myToday.find((b) => b.status !== "completed" && b.status !== "cancelled" && b.status !== "no-show");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Өдрийн мэнд, {employee.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Таны өнөөдрийн хуваарь</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<ClipboardList className="h-4 w-4" />} label="Өнөөдрийн нийт захиалга" value={myToday.length} tooltip="Танд өнөөдөр оноогдсон нийт захиалга." />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Дууссан үйлчилгээ" value={completed} tooltip="Өнөөдөр дуусгасан захиалгын тоо." />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Дараагийн захиалга" value={next ? next.startTime : "—"} tooltip="Таны дараагийн хуваарьт захиалгын цаг." />
        <StatCard icon={<CalendarClock className="h-4 w-4" />} label="Өнөөдрийн ажиллах цаг" value={employee.workingHours} tooltip="Таны өнөөдрийн ажлын цагийн хуваарь." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Next appointment highlight */}
          <div className="rounded-2xl border border-[var(--brand)]/25 bg-[color-mix(in_oklch,var(--brand)_6%,var(--surface))] p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 font-semibold">
              <Bell className="h-4 w-4 text-[var(--brand)]" /> Миний дараагийн захиалга
            </h2>
            {next ? (
              <div className="flex flex-wrap items-center gap-3">
                <AvatarInitials name={next.customerName} className="h-10 w-10" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{next.customerName}</p>
                  <p className="text-sm text-muted-foreground">{next.serviceName} · {next.startTime}–{next.endTime}</p>
                </div>
                <BookingStatusBadge status={next.status} />
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setDrawerBookingId(next.id)}>
                  Дэлгэрэнгүй
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Өнөөдөр цаашид товлогдсон захиалга алга байна.</p>
            )}
          </div>

          {/* Today's schedule */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Өнөөдрийн хуваарь</h2>
            {myToday.length === 0 ? (
              <EmptyState icon={<CalendarClock className="h-6 w-6" />} title="Өнөөдөр танд захиалга алга байна" />
            ) : (
              <div className="space-y-2">
                {myToday.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setDrawerBookingId(b.id)}
                    className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-surface-muted/40 p-3 text-left transition hover:border-[var(--brand)]/25"
                  >
                    <span className="w-12 shrink-0 font-mono text-sm font-semibold">{b.startTime}</span>
                    <AvatarInitials name={b.customerName} className="h-8 w-8 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{b.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">{b.serviceName}</p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current customer + quick status change */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Одоогийн үйлчлүүлэгч</h2>
            {activeBooking ? (
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <AvatarInitials name={activeBooking.customerName} className="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{activeBooking.customerName}</p>
                    <p className="text-sm text-muted-foreground">{activeBooking.serviceName} · {activeBooking.startTime}</p>
                  </div>
                  <BookingStatusBadge status={activeBooking.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => changeBookingStatus(activeBooking.id, "arrived")}>
                    <DoorOpen className="h-3.5 w-3.5" /> Ирсэн
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => changeBookingStatus(activeBooking.id, "in-service")}>
                    <PlayCircle className="h-3.5 w-3.5" /> Эхлүүлэх
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => changeBookingStatus(activeBooking.id, "completed")}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Дуусгах
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-destructive hover:text-destructive" onClick={() => changeBookingStatus(activeBooking.id, "no-show")}>
                    <UserX className="h-3.5 w-3.5" /> Ирээгүй
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => setDrawerBookingId(activeBooking.id)}>
                    <StickyNote className="h-3.5 w-3.5" /> Тэмдэглэл нэмэх
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" asChild>
                    <a href={`tel:${activeBooking.customerPhone.replace(/\s/g, "")}`}>
                      <Phone className="h-3.5 w-3.5" /> Утасны дугаар
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Одоогоор идэвхтэй үйлчлүүлэгч алга байна.</p>
            )}
          </div>

          {/* Weekly performance */}
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-1.5 font-semibold">
              <TrendingUp className="h-4 w-4 text-[var(--brand)]" /> Долоо хоногийн гүйцэтгэл
            </h2>
            <div className="flex h-32 items-end gap-2">
              {weeklyPerf.map((d) => (
                <div key={d.iso} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-24 w-full items-end">
                    <div
                      className="w-full rounded-t bg-gradient-brand transition-all"
                      style={{ height: `${(d.count / maxPerf) * 100}%`, minHeight: d.count > 0 ? 6 : 0 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(`${d.iso}T00:00:00`).toLocaleDateString("mn-MN", { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 font-semibold">
              <UserRound className="h-4 w-4" /> Миний сул цагууд
            </h2>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {["09:00", "11:00", "15:30", "16:15", "17:00", "17:45"].map((t) => (
                <span key={t} className="rounded-md border border-border bg-surface-muted px-2 py-1.5 text-center">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 font-semibold">
              <Coffee className="h-4 w-4" /> Завсарлагын цаг
            </h2>
            <p className="text-sm text-muted-foreground">13:00 – 13:30</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Чөлөө</h2>
            {employee.leave.length === 0 ? (
              <p className="mb-3 text-xs text-muted-foreground">Одоогоор чөлөөний хүсэлт алга.</p>
            ) : (
              <ul className="mb-3 space-y-1.5 text-xs">
                {employee.leave.map((l) => (
                  <li key={l.id} className="flex items-center justify-between rounded-lg bg-surface-muted/40 px-2.5 py-1.5">
                    <span>{l.from} – {l.to}</span>
                    <span className="text-muted-foreground">{l.status === "pending" ? "Хүлээгдэж буй" : l.status === "approved" ? "Батлагдсан" : "Татгалзсан"}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button size="sm" variant="outline" className="w-full rounded-lg" onClick={() => setLeaveOpen(true)}>
              Чөлөө хүсэх
            </Button>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Сүүлийн мэдэгдэл</h2>
            <div className="space-y-2">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="rounded-lg bg-surface-muted/40 px-2.5 py-2 text-xs">
                  <p className="font-medium">{notificationTypeLabel[n.type]}</p>
                  <p className="text-muted-foreground">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BookingDrawer bookingId={drawerBookingId} onOpenChange={setDrawerBookingId} />
      <LeaveRequestModal open={leaveOpen} onOpenChange={setLeaveOpen} employeeId={employee.id} />
    </div>
  );
}
