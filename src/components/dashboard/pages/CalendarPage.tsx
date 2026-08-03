import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import type { Booking, BookingStatus } from "@/lib/dashboard/types";
import { bookingStatusLabel } from "@/lib/dashboard/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState } from "../ui";
import { BookingDrawer } from "../BookingDrawer";
import { AddBookingModal } from "../AddBookingModal";

export type CalendarViewKey = "day" | "3day" | "week" | "month";

const TIME_START = 8 * 60;
const TIME_END = 21 * 60;
const SLOT = 30;
const ROWS = (TIME_END - TIME_START) / SLOT;

const statusCardTone: Record<BookingStatus, string> = {
  upcoming: "border-l-[var(--brand)] bg-[color-mix(in_oklch,var(--brand)_10%,var(--surface))]",
  arrived: "border-l-[var(--brand-2)] bg-[color-mix(in_oklch,var(--brand-2)_10%,var(--surface))]",
  "in-service":
    "border-l-[var(--warning)] bg-[color-mix(in_oklch,var(--warning)_12%,var(--surface))]",
  completed: "border-l-[var(--success)] bg-[color-mix(in_oklch,var(--success)_10%,var(--surface))]",
  cancelled:
    "border-l-destructive bg-[color-mix(in_oklch,var(--destructive)_8%,var(--surface))] opacity-60",
  "no-show": "border-l-muted-foreground bg-surface-muted opacity-70",
};

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
}
function minutesOf(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function CalendarPage() {
  const { session } = useAuth();
  const {
    bookings,
    employees,
    services,
    selectedBranchId,
    branches,
    reassignBookingEmployee,
    rescheduleBooking,
  } = useDashboardData();
  const isEmployee = session?.role === "employee";
  const me = isEmployee ? employees.find((e) => e.name === session?.name) : undefined;

  const [view, setView] = useState<CalendarViewKey>("day");
  const [date, setDate] = useState(toISO(new Date()));
  const [employeeFilter, setEmployeeFilter] = useState<string>(me?.id ?? "all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [drawerBookingId, setDrawerBookingId] = useState<string | null>(null);
  const [addModal, setAddModal] = useState<{
    open: boolean;
    date?: string;
    time?: string;
    employeeId?: string;
  }>({ open: false });
  const [now, setNow] = useState(new Date());
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const scoped = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedBranchId !== "all" && b.branchId !== selectedBranchId) return false;
      if (employeeFilter !== "all" && b.employeeId !== employeeFilter) return false;
      if (serviceFilter !== "all" && b.serviceId !== serviceFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      return true;
    });
  }, [bookings, selectedBranchId, employeeFilter, serviceFilter, statusFilter]);

  const employeeColumns = useMemo(
    () =>
      employeeFilter === "all"
        ? employees.filter((e) =>
            selectedBranchId === "all" ? true : e.branchId === selectedBranchId,
          )
        : employees.filter((e) => e.id === employeeFilter),
    [employees, employeeFilter, selectedBranchId],
  );

  const dayLabel = new Date(`${date}T00:00:00`).toLocaleDateString("mn-MN", {
    month: "long",
    day: "numeric",
    year: "numeric",
    weekday: "long",
  });

  const shiftView = (dir: 1 | -1) => {
    const step = view === "day" ? 1 : view === "3day" ? 3 : view === "week" ? 7 : 30;
    setDate((d) => addDays(d, dir * step));
  };

  const openSlot = (isoDate: string, time: string, employeeId?: string) => {
    setAddModal({ open: true, date: isoDate, time, employeeId });
  };

  const handleDrop = (isoDate: string, time: string, employeeId?: string) => {
    if (!dragId) return;
    rescheduleBooking(dragId, isoDate, time);
    if (employeeId) {
      const emp = employees.find((e) => e.id === employeeId);
      if (emp) reassignBookingEmployee(dragId, emp.id, emp.name);
    }
    setDragId(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={isEmployee ? "Миний календарь" : "Календарь"}
        description="Захиалгуудыг өдөр, долоо хоног, сараар харж, шинээр нэмэх, цагийг чирж өөрчлөх боломжтой."
        actions={
          <Button onClick={() => openSlot(date, "10:00")} className="gap-1.5 rounded-lg">
            <Plus className="h-4 w-4" /> Захиалга нэмэх
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/80 p-3">
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={() => setDate(toISO(new Date()))}
          >
            Өнөөдөр
          </Button>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"
            onClick={() => shiftView(-1)}
            aria-label="Өмнөх"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"
            onClick={() => shiftView(1)}
            aria-label="Дараах"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 w-auto text-xs"
          />
          <span className="hidden text-sm font-medium sm:inline">{dayLabel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-border text-xs">
            {(
              [
                ["day", "Өдөр"],
                ["3day", "3 өдөр"],
                ["week", "7 хоног"],
                ["month", "Сар"],
              ] as [CalendarViewKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-3 py-1.5 font-medium transition ${view === key ? "bg-gradient-brand text-white" : "hover:bg-secondary"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {!isEmployee && (
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Бүх ажилтан" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх ажилтан</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Бүх үйлчилгээ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх үйлчилгээ</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Бүх төлөв" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх төлөв</SelectItem>
              {(Object.keys(bookingStatusLabel) as BookingStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {bookingStatusLabel[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {branches.length === 0 ? (
        <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="Салбар олдсонгүй" />
      ) : view === "month" ? (
        <CalendarMonthGrid
          date={date}
          bookings={scoped}
          onPickDay={(iso) => {
            setDate(iso);
            setView("day");
          }}
          onOpenBooking={setDrawerBookingId}
        />
      ) : (
        <CalendarTimeGrid
          view={view}
          date={date}
          columns={
            view === "day"
              ? employeeColumns.map((e) => ({ key: e.id, label: e.name, employeeId: e.id }))
              : Array.from({ length: view === "3day" ? 3 : 7 }, (_, i) => ({
                  key: addDays(date, i),
                  label: new Date(`${addDays(date, i)}T00:00:00`).toLocaleDateString("mn-MN", {
                    weekday: "short",
                    day: "numeric",
                  }),
                  dateIso: addDays(date, i),
                }))
          }
          mode={view === "day" ? "employee" : "date"}
          bookings={scoped}
          now={now}
          onSlotClick={openSlot}
          onBookingClick={setDrawerBookingId}
          onDragStart={setDragId}
          onDrop={handleDrop}
          draggingId={dragId}
        />
      )}

      <BookingDrawer bookingId={drawerBookingId} onOpenChange={setDrawerBookingId} />
      <AddBookingModal
        open={addModal.open}
        onOpenChange={(v) => setAddModal((p) => ({ ...p, open: v }))}
        defaults={{ date: addModal.date, time: addModal.time, employeeId: addModal.employeeId }}
      />
    </div>
  );
}

export function CalendarTimeGrid({
  view,
  date,
  columns,
  mode,
  bookings,
  now,
  onSlotClick,
  onBookingClick,
  onDragStart,
  onDrop,
  draggingId,
}: {
  view: CalendarViewKey;
  date: string;
  columns: { key: string; label: string; employeeId?: string; dateIso?: string }[];
  mode: "employee" | "date";
  bookings: Booking[];
  now: Date;
  onSlotClick: (date: string, time: string, employeeId?: string) => void;
  onBookingClick: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (date: string, time: string, employeeId?: string) => void;
  draggingId: string | null;
}) {
  const slots = Array.from({ length: ROWS }, (_, i) => TIME_START + i * SLOT);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= TIME_START && nowMinutes <= TIME_END;

  if (columns.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-6 w-6" />}
        title="Ажилтан олдсонгүй"
        description="Шүүлтүүрээ өөрчилж үзнэ үү."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
      <div
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `72px repeat(${columns.length}, minmax(140px, 1fr))` }}
      >
        <div className="sticky top-0 z-10 border-b border-r border-border bg-surface-muted/60" />
        {columns.map((c) => (
          <div
            key={c.key}
            className="sticky top-0 z-10 truncate border-b border-border bg-surface-muted/60 px-2 py-2 text-center text-xs font-semibold"
          >
            {c.label}
          </div>
        ))}

        <div
          className="relative col-span-full grid"
          style={{
            gridTemplateColumns: `72px repeat(${columns.length}, minmax(140px, 1fr))`,
            gridColumn: "1 / -1",
          }}
        >
          {/* time labels */}
          <div className="relative border-r border-border">
            {slots.map((m) => (
              <div
                key={m}
                className="flex h-12 items-start justify-end pr-2 text-[11px] text-muted-foreground"
              >
                {m % 60 === 0 ? `${Math.floor(m / 60)}:00` : ""}
              </div>
            ))}
          </div>

          {columns.map((col) => {
            const colDate = mode === "date" ? col.dateIso! : date;
            const colBookings = bookings.filter(
              (b) =>
                b.date === colDate &&
                (mode === "employee" ? b.employeeId === col.employeeId : true),
            );
            return (
              <div key={col.key} className="relative border-r border-border/70 last:border-r-0">
                {slots.map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      onSlotClick(
                        colDate,
                        `${Math.floor(m / 60)}`.padStart(2, "0") +
                          ":" +
                          `${m % 60}`.padStart(2, "0"),
                        mode === "employee" ? col.employeeId : undefined,
                      )
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() =>
                      onDrop(
                        colDate,
                        `${Math.floor(m / 60)}`.padStart(2, "0") +
                          ":" +
                          `${m % 60}`.padStart(2, "0"),
                        mode === "employee" ? col.employeeId : undefined,
                      )
                    }
                    className="block h-12 w-full border-b border-border/40 transition hover:bg-[var(--brand)]/[0.05]"
                    aria-label="Хоосон цаг — захиалга нэмэх"
                  />
                ))}

                {showNowLine && colDate === new Date().toISOString().slice(0, 10) && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-destructive"
                    style={{ top: `${((nowMinutes - TIME_START) / SLOT) * 48}px` }}
                  >
                    <span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-destructive" />
                  </div>
                )}

                {colBookings.map((b) => {
                  const startM = minutesOf(b.startTime);
                  const rowStart = Math.max(0, Math.round((startM - TIME_START) / SLOT));
                  const span = Math.max(1, Math.round(b.durationMin / SLOT));
                  return (
                    <div
                      key={b.id}
                      draggable
                      onDragStart={() => onDragStart(b.id)}
                      onClick={() => onBookingClick(b.id)}
                      className={`absolute inset-x-1 cursor-pointer overflow-hidden rounded-lg border-l-4 p-1.5 text-[11px] shadow-sm transition hover:shadow-md ${statusCardTone[b.status]} ${draggingId === b.id ? "opacity-40" : ""}`}
                      style={{ top: `${rowStart * 48 + 2}px`, height: `${span * 48 - 4}px` }}
                    >
                      <p className="truncate font-semibold">
                        {b.startTime} {b.customerName}
                      </p>
                      <p className="truncate text-muted-foreground">
                        {b.serviceName}
                        {mode === "date" ? ` · ${b.employeeName}` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CalendarMonthGrid({
  date,
  bookings,
  onPickDay,
  onOpenBooking,
}: {
  date: string;
  bookings: Booking[];
  onPickDay: (iso: string) => void;
  onOpenBooking: (id: string) => void;
}) {
  const base = new Date(`${date}T00:00:00`);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISO(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = toISO(new Date());

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
      <div className="grid grid-cols-7 border-b border-border bg-surface-muted/60 text-center text-xs font-semibold">
        {["Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям", "Ням"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((iso, i) => {
          const dayBookings = iso ? bookings.filter((b) => b.date === iso) : [];
          return (
            <div
              key={i}
              className={`min-h-28 border-b border-r border-border/60 p-1.5 ${!iso ? "bg-surface-muted/20" : "cursor-pointer hover:bg-surface-muted/40"}`}
              onClick={() => iso && onPickDay(iso)}
            >
              {iso && (
                <>
                  <span
                    className={`text-xs font-semibold ${iso === todayISO ? "flex h-5 w-5 items-center justify-center rounded-full bg-gradient-brand text-white" : ""}`}
                  >
                    {Number(iso.slice(-2))}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBooking(b.id);
                        }}
                        className={`truncate rounded border-l-2 px-1 py-0.5 text-[10px] ${statusCardTone[b.status]}`}
                      >
                        {b.startTime} {b.customerName}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">
                        +{dayBookings.length - 3} илүү
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
