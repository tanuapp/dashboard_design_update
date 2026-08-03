import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import type { Branch } from "@/lib/dashboard/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormRow } from "./ui";

export function BranchFormModal({
  open,
  onOpenChange,
  branch,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  branch?: Branch;
}) {
  const { addBranch, updateBranch } = useDashboardData();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [workingHours, setWorkingHours] = useState("09:00–20:00");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    if (!open) return;
    setName(branch?.name ?? "");
    setAddress(branch?.address ?? "");
    setPhone(branch?.phone ?? "");
    setWorkingHours(branch?.workingHours ?? "09:00–20:00");
    setActive(branch?.active ?? true);
    setErrors({});
    setStatus("idle");
  }, [open, branch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Салбарын нэр оруулна уу";
    if (!address.trim()) next.address = "Хаяг оруулна уу";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 500));
    if (branch) {
      updateBranch(branch.id, { name, address, phone, workingHours, active });
      toast.success("Салбарын мэдээлэл шинэчлэгдлээ");
    } else {
      addBranch({ name, address, phone, workingHours, active, employeeIds: [], todayBookings: 0, monthlyRevenue: 0 });
      toast.success("Шинэ салбар нэмэгдлээ");
    }
    setStatus("idle");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{branch ? "Салбар засах" : "Салбар нэмэх"}</DialogTitle>
          <DialogDescription>Демо горим — мэдээлэл локалаар хадгалагдана.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-3.5">
          <FormRow label="Нэр" hint={errors.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? "border-destructive" : ""} />
          </FormRow>
          <FormRow label="Хаяг" hint={errors.address}>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className={errors.address ? "border-destructive" : ""} />
          </FormRow>
          <FormRow label="Утас">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormRow>
          <FormRow label="Ажиллах цаг">
            <Input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />
          </FormRow>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <span className="text-xs font-medium">Идэвхтэй салбар</span>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {branch ? "Хадгалах" : "Салбар нэмэх"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Болих</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
