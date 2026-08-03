import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { today } from "@/lib/dashboard/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormRow } from "./ui";

export function LeaveRequestModal({
  open,
  onOpenChange,
  employeeId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employeeId: string;
}) {
  const { employees, setEmployeeLeave } = useDashboardData();
  const employee = employees.find((e) => e.id === employeeId);
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    const next: Record<string, string> = {};
    if (!from) next.from = "Эхлэх огноог сонгоно уу";
    if (!to) next.to = "Дуусах огноог сонгоно уу";
    if (to && from && to < from) next.to = "Дуусах огноо эхлэх огнооноос өмнө байж болохгүй";
    if (!reason.trim()) next.reason = "Шалтгаанаа бичнэ үү";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 600));
    setEmployeeLeave(employee.id, [
      ...employee.leave,
      { id: `lv-${Date.now()}`, from, to, reason: reason.trim(), status: "pending" },
    ]);
    toast.success("Чөлөөний хүсэлт илгээгдлээ", { description: "Удирдлагын баталгаажуулалтыг хүлээнэ үү." });
    setStatus("idle");
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Чөлөө хүсэх</DialogTitle>
          <DialogDescription>Таны хүсэлт удирдлагад мэдэгдэл болон очно (демо горим).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="mt-2 grid gap-3.5 sm:grid-cols-2">
          <FormRow label="Эхлэх огноо" hint={errors.from}>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={errors.from ? "border-destructive" : ""} />
          </FormRow>
          <FormRow label="Дуусах огноо" hint={errors.to}>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={errors.to ? "border-destructive" : ""} />
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow label="Шалтгаан" hint={errors.reason}>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Жишээ: Гэр бүлийн шалтгаан" className={errors.reason ? "border-destructive" : ""} />
            </FormRow>
          </div>
          <div className="mt-1 flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              Хүсэлт илгээх
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
