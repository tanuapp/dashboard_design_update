import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { today } from "@/lib/dashboard/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormRow } from "./ui";

export function AddCustomerModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addCustomer } = useDashboardData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Нэр оруулна уу";
    if (!/^\d{4}\s?\d{4}$/.test(phone.trim())) next.phone = "Утасны дугаар буруу байна";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 500));
    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalSpend: 0,
      lastVisit: today(),
      loyaltyPoints: 0,
      tags: ["Шинэ"],
      favoriteServiceIds: [],
      notificationOptIn: true,
      joinedAt: today(),
    });
    toast.success("Шинэ хэрэглэгч нэмэгдлээ");
    setStatus("idle");
    setName("");
    setPhone("");
    setEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Хэрэглэгч нэмэх</DialogTitle>
          <DialogDescription>Демо горим — мэдээлэл локалаар хадгалагдана.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-3.5">
          <FormRow label="Нэр" hint={errors.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? "border-destructive" : ""} />
          </FormRow>
          <FormRow label="Утас" hint={errors.phone}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9911 2233" className={errors.phone ? "border-destructive" : ""} />
          </FormRow>
          <FormRow label="И-мэйл">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormRow>
          <div className="flex gap-2">
            <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              Хэрэглэгч нэмэх
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Болих</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
