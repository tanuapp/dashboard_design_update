import { useState } from "react";
import { toast } from "sonner";
import { Star, Phone, Mail, CheckCircle2, XCircle } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import type { AttendanceStatus } from "@/lib/dashboard/types";
import { attendanceStatusLabel } from "@/lib/dashboard/types";
import {
  PageHeader,
  EmptyState,
  BookingStatusBadge,
  money,
  formatDateShort,
  formatDate,
} from "../ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeFormModal } from "../EmployeeFormModal";
import type { BusinessRole } from "@/lib/mock-data";

const roleLabel: Record<BusinessRole, string> = {
  owner: "Эзэмшигч",
  admin: "Админ",
  employee: "Ажилтан",
};
const weekdays = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];
const weekdayNumbers = [1, 2, 3, 4, 5, 6, 0];

const attendanceTone: Record<AttendanceStatus, string> = {
  present: "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]",
  late: "bg-[color-mix(in_oklch,var(--warning)_18%,transparent)] text-[var(--warning)]",
  absent: "bg-destructive/10 text-destructive",
  leave: "bg-[color-mix(in_oklch,var(--brand)_14%,transparent)] text-[var(--brand)]",
};

export function EmployeeDetailPage({ employeeId }: { employeeId: string }) {
  const { employees, services, bookings, updateEmployee, setEmployeeLeave } = useDashboardData();
  const [formOpen, setFormOpen] = useState(false);
  const employee = employees.find((e) => e.id === employeeId);

  if (!employee) {
    return <EmptyState icon={<XCircle className="h-6 w-6" />} title="Ажилтан олдсонгүй" />;
  }

  const myBookings = bookings
    .filter((b) => b.employeeId === employee.id)
    .sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? 1 : -1));
  const completed = myBookings.filter((b) => b.status === "completed");
  const revenue = completed.reduce((s, b) => s + b.price, 0);

  const attendanceCounts = employee.attendance.reduce(
    (acc, a) => ({ ...acc, [a.status]: acc[a.status] + 1 }),
    { present: 0, late: 0, absent: 0, leave: 0 } as Record<AttendanceStatus, number>,
  );

  const toggleService = (id: string) => {
    const next = employee.serviceIds.includes(id)
      ? employee.serviceIds.filter((s) => s !== id)
      : [...employee.serviceIds, id];
    updateEmployee(employee.id, { serviceIds: next });
  };

  const decideLeave = (leaveId: string, decision: "approved" | "declined") => {
    setEmployeeLeave(
      employee.id,
      employee.leave.map((l) => (l.id === leaveId ? { ...l, status: decision } : l)),
    );
    toast.success(decision === "approved" ? "Чөлөө батлагдлаа" : "Чөлөө татгалзлаа");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={employee.name}
        description={employee.position}
        backTo="/business/dashboard/employees"
        breadcrumb={[
          { label: "Ажилтнууд", to: "/business/dashboard/employees" },
          { label: employee.name },
        ]}
        actions={
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            Засах
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">Ерөнхий мэдээлэл</TabsTrigger>
          <TabsTrigger value="schedule">Хуваарь</TabsTrigger>
          <TabsTrigger value="bookings">Захиалга</TabsTrigger>
          <TabsTrigger value="services">Үйлчилгээ</TabsTrigger>
          <TabsTrigger value="performance">Гүйцэтгэл</TabsTrigger>
          <TabsTrigger value="leave">Чөлөө</TabsTrigger>
          <TabsTrigger value="access">Нэвтрэх эрх</TabsTrigger>
        </TabsList>

        <TabsContent
          value="general"
          className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Утас" value={employee.phone} icon={<Phone className="h-3.5 w-3.5" />} />
            <Field label="И-мэйл" value={employee.email} icon={<Mail className="h-3.5 w-3.5" />} />
            <Field label="Мэргэшил" value={employee.specialty} />
            <Field label="Ажилд орсон огноо" value={formatDateShort(employee.hireDate)} />
            <Field label="Үнэлгээ" value={`${employee.rating} ★`} />
            <Field label="Өнөөдрийн захиалга" value={String(employee.todayBookings)} />
          </div>
          <p className="mt-4 rounded-lg bg-surface-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Энэ долоо хоногт: {attendanceCounts.present} ирсэн, {attendanceCounts.late} хоцорсон,{" "}
            {attendanceCounts.absent} ирээгүй, {attendanceCounts.leave} чөлөөтэй.
          </p>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <p className="mb-3 text-sm font-medium">Долоо хоногийн ажлын цаг</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {weekdays.map((d, i) => (
                <div
                  key={d}
                  className="rounded-lg border border-border/70 bg-surface-muted/40 p-2.5 text-center text-xs"
                >
                  <p className="font-semibold">{d}</p>
                  <p className="mt-1 text-muted-foreground">
                    {employee.weeklySchedule
                      ? (() => {
                          const day = employee.weeklySchedule.find(
                            (item) => item.day === weekdayNumbers[i],
                          );
                          return day?.enabled ? `${day.startTime}–${day.endTime}` : "Амарна";
                        })()
                      : i < 6
                        ? employee.workingHours
                        : "Амарна"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
            <p className="mb-3 text-sm font-medium">Сүүлийн 7 хоногийн ирц</p>
            <div className="space-y-1.5">
              {employee.attendance.map((a) => (
                <div
                  key={a.date}
                  className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-muted/40 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{formatDate(a.date)}</span>
                  <div className="flex items-center gap-2">
                    {a.checkIn && (
                      <span className="text-xs text-muted-foreground">
                        {a.checkIn}–{a.checkOut}
                      </span>
                    )}
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${attendanceTone[a.status]}`}
                    >
                      {attendanceStatusLabel[a.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-2">
          {myBookings.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="Захиалга алга байна" />
          ) : (
            myBookings.slice(0, 12).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/80 p-3 text-sm shadow-sm"
              >
                <div>
                  <p className="font-medium">
                    {b.customerName} · {b.serviceName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(b.date)} · {b.startTime}
                  </p>
                </div>
                <BookingStatusBadge status={b.status} />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent
          value="services"
          className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm"
        >
          <p className="mb-3 text-sm text-muted-foreground">
            Ажилтны хариуцах үйлчилгээг сонгоно уу.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-muted/40 px-3 py-2 text-sm"
              >
                <Checkbox
                  checked={employee.serviceIds.includes(s.id)}
                  onCheckedChange={() => toggleService(s.id)}
                />
                {s.name}
                <span className="ml-auto text-xs text-muted-foreground">{money(s.price)}</span>
              </label>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Дуусгасан захиалга</p>
              <p className="mt-1 text-2xl font-bold">{completed.length}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Бүтээсэн орлого</p>
              <p className="mt-1 text-2xl font-bold">{money(revenue)}</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Дундаж үнэлгээ</p>
              <p className="mt-1 text-2xl font-bold">{employee.rating} ★</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="leave"
          className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm"
        >
          {employee.leave.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="Чөлөөний хүсэлт алга" />
          ) : (
            <div className="space-y-2">
              {employee.leave.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface-muted/40 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {l.from} – {l.to}
                    </p>
                    <p className="text-xs text-muted-foreground">{l.reason}</p>
                  </div>
                  {l.status === "pending" ? (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => decideLeave(l.id, "approved")}
                      >
                        Батлах
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg text-destructive hover:text-destructive"
                        onClick={() => decideLeave(l.id, "declined")}
                      >
                        Татгалзах
                      </Button>
                    </div>
                  ) : (
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${l.status === "approved" ? "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]" : "bg-destructive/10 text-destructive"}`}
                    >
                      {l.status === "approved" ? "Батлагдсан" : "Татгалзсан"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="access"
          className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm"
        >
          <div className="max-w-sm space-y-4">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Эрх</p>
              <Select
                value={employee.role}
                onValueChange={(v) => updateEmployee(employee.id, { role: v as BusinessRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["owner", "admin", "employee"] as BusinessRole[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-muted/40 p-3">
              <div>
                <p className="text-sm font-medium">Системд нэвтрэх эрх</p>
                <p className="text-xs text-muted-foreground">
                  {employee.accessEnabled ? "Идэвхтэй" : "Идэвхгүй"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className={employee.accessEnabled ? "text-destructive hover:text-destructive" : ""}
                onClick={() => {
                  updateEmployee(employee.id, { accessEnabled: !employee.accessEnabled });
                  toast.success(
                    employee.accessEnabled ? "Нэвтрэх эрх хаагдлаа" : "Нэвтрэх эрх нээгдлээ",
                  );
                }}
              >
                {employee.accessEnabled ? "Хаах" : "Нээх"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <EmployeeFormModal open={formOpen} onOpenChange={setFormOpen} employee={employee} />
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
        {icon}
        {value}
      </p>
    </div>
  );
}
