import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import type { Service } from "@/lib/dashboard/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormRow } from "./ui";

export function ServiceFormModal({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service?: Service;
}) {
  const { serviceCategories, employees, branches, addService, updateService } = useDashboardData();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(serviceCategories[0]?.id ?? "");
  const [duration, setDuration] = useState(45);
  const [price, setPrice] = useState(30000);
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [onlineBooking, setOnlineBooking] = useState(true);
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    if (!open) return;
    setName(service?.name ?? "");
    setCategoryId(service?.categoryId ?? serviceCategories[0]?.id ?? "");
    setDuration(service?.durationMin ?? 45);
    setPrice(service?.price ?? 30000);
    setEmployeeIds(service?.employeeIds ?? []);
    setBranchIds(service?.branchIds ?? [branches[0]?.id].filter(Boolean) as string[]);
    setOnlineBooking(service?.onlineBooking ?? true);
    setActive(service?.active ?? true);
    setErrors({});
    setStatus("idle");
  }, [open, service, serviceCategories, branches]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Үйлчилгээний нэр оруулна уу";
    if (duration <= 0) next.duration = "Хугацаа 0-ээс их байх ёстой";
    if (price <= 0) next.price = "Үнэ 0-ээс их байх ёстой";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 500));

    if (service) {
      updateService(service.id, { name, categoryId, durationMin: duration, price, employeeIds, branchIds, onlineBooking, active });
      toast.success("Үйлчилгээ шинэчлэгдлээ");
    } else {
      addService({
        name,
        categoryId,
        durationMin: duration,
        price,
        employeeIds,
        branchIds,
        onlineBooking,
        active,
        rating: 5,
        bookingCount: 0,
        revenue: 0,
        trend: 0,
      });
      toast.success("Шинэ үйлчилгээ нэмэгдлээ");
    }
    setStatus("idle");
    onOpenChange(false);
  };

  const toggle = (arr: string[], setArr: (v: string[]) => void, id: string) =>
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? "Үйлчилгээ засах" : "Үйлчилгээ нэмэх"}</DialogTitle>
          <DialogDescription>Демо горим — мэдээлэл локалаар хадгалагдана.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="mt-2 grid gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormRow label="Нэр" hint={errors.name}>
              <Input value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? "border-destructive" : ""} />
            </FormRow>
          </div>
          <FormRow label="Ангилал">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {serviceCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Үргэлжлэх хугацаа (мин)" hint={errors.duration}>
            <Input type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={errors.duration ? "border-destructive" : ""} />
          </FormRow>
          <FormRow label="Үнэ (₮)" hint={errors.price}>
            <Input type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={errors.price ? "border-destructive" : ""} />
          </FormRow>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <span className="text-xs font-medium">Online захиалга</span>
            <Switch checked={onlineBooking} onCheckedChange={setOnlineBooking} />
          </div>

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Гүйцэтгэх ажилтан</p>
            <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-border p-2.5">
              {employees.map((e) => (
                <label key={e.id} className="flex items-center gap-2 text-xs">
                  <Checkbox checked={employeeIds.includes(e.id)} onCheckedChange={() => toggle(employeeIds, setEmployeeIds, e.id)} />
                  {e.name}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Боломжтой салбар</p>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-2.5">
              {branches.map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-xs">
                  <Checkbox checked={branchIds.includes(b.id)} onCheckedChange={() => toggle(branchIds, setBranchIds, b.id)} />
                  {b.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 sm:col-span-2">
            <span className="text-xs font-medium">Идэвхтэй үйлчилгээ</span>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <div className="mt-1 flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {service ? "Хадгалах" : "Үйлчилгээ нэмэх"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Болих</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
