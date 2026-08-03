import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { today } from "@/lib/dashboard/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormRow } from "./ui";

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${Math.floor(total / 60) % 24}`.padStart(2, "0") + ":" + `${total % 60}`.padStart(2, "0");
}

export function AddBookingModal({
  open,
  onOpenChange,
  defaults,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaults?: { date?: string; time?: string; employeeId?: string };
}) {
  const { customers, services, employees, branches, addBooking, viewRole } = useDashboardData();
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState(defaults?.employeeId ?? "");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [date, setDate] = useState(defaults?.date ?? today());
  const [time, setTime] = useState(defaults?.time ?? "10:00");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    if (open) {
      setDate(defaults?.date ?? today());
      setTime(defaults?.time ?? "10:00");
      setEmployeeId(defaults?.employeeId ?? "");
      setCustomerId("");
      setNewCustomerName("");
      setNewCustomerPhone("");
      setServiceId("");
      setNote("");
      setErrors({});
      setStatus("idle");
    }
  }, [open, defaults?.date, defaults?.time, defaults?.employeeId]);

  const service = services.find((s) => s.id === serviceId);
  const eligibleEmployees = service ? employees.filter((e) => e.serviceIds.includes(service.id)) : employees;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!customerId && !newCustomerName.trim()) next.customer = "Хэрэглэгч сонгох эсвэл нэр оруулна уу";
    if (!serviceId) next.service = "Үйлчилгээ сонгоно уу";
    if (!employeeId) next.employee = "Ажилтан сонгоно уу";
    if (!date) next.date = "Огноо сонгоно уу";
    if (!time) next.time = "Цаг сонгоно уу";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 600));

    const customer = customers.find((c) => c.id === customerId);
    const employee = employees.find((e) => e.id === employeeId)!;
    const branch = branches.find((b) => b.id === branchId) ?? branches[0];

    addBooking({
      date,
      startTime: time,
      endTime: addMinutes(time, service!.durationMin),
      durationMin: service!.durationMin,
      customerId: customer?.id ?? "walk-in",
      customerName: customer?.name ?? newCustomerName.trim(),
      customerPhone: customer?.phone ?? (newCustomerPhone.trim() || "—"),
      serviceId: service!.id,
      serviceName: service!.name,
      employeeId: employee.id,
      employeeName: employee.name,
      branchId: branch.id,
      branchName: branch.name,
      price: service!.price,
      paymentState: "unpaid",
      status: "upcoming",
      source: viewRole === "employee" ? "employee_manual" : "admin_manual",
      customerNote: note.trim() || undefined,
    });

    toast.success("Захиалга үүсгэгдлээ", { description: "Захиалга автоматаар календарьт нэмэгдлээ." });
    setStatus("idle");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Захиалга нэмэх</DialogTitle>
          <DialogDescription>Захиалга үүсгэмэгц автоматаар календарьт нэмэгдэнэ — батламж шаардлагагүй.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-2 grid gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormRow label="Хэрэглэгч" hint={errors.customer}>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className={errors.customer ? "border-destructive" : ""}>
                  <SelectValue placeholder="Байгаа хэрэглэгч сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} · {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
          </div>
          {!customerId && (
            <>
              <FormRow label="Шинэ хэрэглэгчийн нэр">
                <Input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Нэр" />
              </FormRow>
              <FormRow label="Утасны дугаар">
                <Input value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} placeholder="9911 2233" />
              </FormRow>
            </>
          )}

          <div className="sm:col-span-2">
            <FormRow label="Үйлчилгээ" hint={errors.service}>
              <Select value={serviceId} onValueChange={(v) => { setServiceId(v); setEmployeeId(""); }}>
                <SelectTrigger className={errors.service ? "border-destructive" : ""}>
                  <SelectValue placeholder="Үйлчилгээ сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {services.filter((s) => s.active).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.durationMin} мин · ₮{s.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
          </div>

          <FormRow label="Ажилтан" hint={errors.employee}>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className={errors.employee ? "border-destructive" : ""}>
                <SelectValue placeholder="Ажилтан сонгох" />
              </SelectTrigger>
              <SelectContent>
                {eligibleEmployees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} · {e.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <FormRow label="Огноо" hint={errors.date}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={errors.date ? "border-destructive" : ""} />
          </FormRow>
          <FormRow label="Цаг" hint={errors.time}>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={errors.time ? "border-destructive" : ""} />
          </FormRow>

          <div className="sm:col-span-2">
            <FormRow label="Хэрэглэгчийн тэмдэглэл (заавал биш)">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Жишээ: цонхны дэргэд суух хүсэлтэй" />
            </FormRow>
          </div>

          <div className="mt-1 flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              Захиалга үүсгэх
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
