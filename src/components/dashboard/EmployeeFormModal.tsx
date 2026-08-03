import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import type { Employee, EmployeeWorkDay } from "@/lib/dashboard/types";
import { createDefaultWeeklySchedule } from "@/lib/business-onboarding";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormRow } from "./ui";

const weekDays = [
  { value: 1, label: "Даваа" },
  { value: 2, label: "Мягмар" },
  { value: 3, label: "Лхагва" },
  { value: 4, label: "Пүрэв" },
  { value: 5, label: "Баасан" },
  { value: 6, label: "Бямба" },
  { value: 0, label: "Ням" },
];

export function EmployeeFormModal({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee?: Employee;
}) {
  const { branches, services, addEmployee, updateEmployee } = useDashboardData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [workingHours, setWorkingHours] = useState("09:00–18:00");
  const [weeklySchedule, setWeeklySchedule] = useState<EmployeeWorkDay[]>(() =>
    createDefaultWeeklySchedule(),
  );
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    if (!open) return;
    setName(employee?.name ?? "");
    setPhone(employee?.phone ?? "");
    setEmail(employee?.email ?? "");
    setPosition(employee?.position ?? "");
    setSpecialty(employee?.specialty ?? "");
    setBranchId(employee?.branchId ?? branches[0]?.id ?? "");
    setWorkingHours(employee?.workingHours ?? "09:00–18:00");
    const [startTime, endTime] = (employee?.workingHours ?? "09:00–18:00").split("–");
    setWeeklySchedule(employee?.weeklySchedule ?? createDefaultWeeklySchedule(startTime, endTime));
    setServiceIds(employee?.serviceIds ?? []);
    setErrors({});
    setStatus("idle");
  }, [open, employee, branches]);

  const toggleService = (id: string) =>
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Нэр оруулна уу";
    if (!phone.trim()) next.phone = "Утасны дугаар оруулна уу";
    if (!position.trim()) next.position = "Албан тушаал оруулна уу";
    if (!weeklySchedule.some((day) => day.enabled)) {
      next.weeklySchedule = "Дор хаяж нэг ажиллах өдөр сонгоно уу";
    } else if (
      weeklySchedule.some(
        (day) => day.enabled && (!day.startTime || !day.endTime || day.startTime >= day.endTime),
      )
    ) {
      next.weeklySchedule = "Эхлэх, дуусах цагийг зөв тохируулна уу";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 500));

    if (employee) {
      updateEmployee(employee.id, {
        name,
        phone,
        email,
        position,
        specialty,
        branchId,
        workingHours,
        weeklySchedule,
        serviceIds,
      });
      toast.success("Ажилтны мэдээлэл шинэчлэгдлээ");
    } else {
      addEmployee({
        name,
        phone,
        email,
        initials: name.trim().charAt(0).toUpperCase(),
        position,
        specialty,
        branchId,
        workingHours,
        weeklySchedule,
        status: "available",
        todayBookings: 0,
        rating: 5,
        serviceIds,
        role: "employee",
        accessEnabled: true,
        hireDate: new Date().toISOString().slice(0, 10),
        leave: [],
        attendance: [],
      });
      toast.success("Шинэ ажилтан нэмэгдлээ");
    }
    setStatus("idle");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{employee ? "Ажилтны мэдээлэл засах" : "Ажилтан нэмэх"}</DialogTitle>
          <DialogDescription>Мэдээлэл зөвхөн демо горимд, локалаар хадгалагдана.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="mt-2 grid gap-3.5 sm:grid-cols-2">
          <FormRow label="Нэр" hint={errors.name}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
          </FormRow>
          <FormRow label="Утас" hint={errors.phone}>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={errors.phone ? "border-destructive" : ""}
            />
          </FormRow>
          <FormRow label="И-мэйл">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormRow>
          <FormRow label="Албан тушаал" hint={errors.position}>
            <Input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className={errors.position ? "border-destructive" : ""}
            />
          </FormRow>
          <FormRow label="Мэргэшил">
            <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          </FormRow>
          <FormRow label="Салбар">
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow label="Ажлын цаг" hint="Жишээ: 09:00–18:00">
              <Input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />
            </FormRow>
          </div>
          <details className="rounded-lg border border-border sm:col-span-2">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-[var(--brand)]" />
                Өдөр тус бүрийн ажлын цаг
              </span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {weeklySchedule.filter((day) => day.enabled).length} өдөр ажиллана
              </span>
            </summary>
            <div className="border-t border-border">
              {weekDays.map((weekDay) => {
                const day = weeklySchedule.find((item) => item.day === weekDay.value);
                if (!day) return null;
                const updateDay = (patch: Partial<EmployeeWorkDay>) =>
                  setWeeklySchedule((current) =>
                    current.map((item) => (item.day === day.day ? { ...item, ...patch } : item)),
                  );
                return (
                  <div
                    key={day.day}
                    className="grid grid-cols-[88px_1fr_1fr] items-center gap-2 border-b border-border/60 px-3 py-1.5 last:border-b-0"
                  >
                    <label className="flex items-center gap-2 text-[11px] font-medium">
                      <Checkbox
                        checked={day.enabled}
                        onCheckedChange={(checked) => updateDay({ enabled: checked === true })}
                      />
                      {weekDay.label}
                    </label>
                    <Input
                      type="time"
                      value={day.startTime}
                      disabled={!day.enabled}
                      onChange={(event) => updateDay({ startTime: event.target.value })}
                      className="h-8 text-xs"
                      aria-label={`${weekDay.label} эхлэх цаг`}
                    />
                    <Input
                      type="time"
                      value={day.endTime}
                      disabled={!day.enabled}
                      onChange={(event) => updateDay({ endTime: event.target.value })}
                      className="h-8 text-xs"
                      aria-label={`${weekDay.label} дуусах цаг`}
                    />
                  </div>
                );
              })}
            </div>
          </details>
          {errors.weeklySchedule && (
            <p className="-mt-2 text-[11px] text-destructive sm:col-span-2">
              {errors.weeklySchedule}
            </p>
          )}
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Хариуцах үйлчилгээ</p>
            <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-border p-2.5">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={serviceIds.includes(s.id)}
                    onCheckedChange={() => toggleService(s.id)}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <div className="mt-1 flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {employee ? "Хадгалах" : "Ажилтан нэмэх"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Болих
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
