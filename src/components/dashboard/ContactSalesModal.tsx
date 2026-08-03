import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormRow } from "./ui";

const initialForm = {
  orgName: "",
  contactName: "",
  phone: "",
  email: "",
  branchCount: "",
  employeeCount: "",
  notes: "",
};

export function ContactSalesModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setTimeout(() => {
        setStatus("idle");
        setForm(initialForm);
        setErrors({});
      }, 300);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.orgName.trim()) next.orgName = "Байгууллагын нэрээ оруулна уу";
    if (!form.contactName.trim()) next.contactName = "Холбоо барих хүний нэрээ оруулна уу";
    if (!/^\d{4}\s?\d{4}$/.test(form.phone.trim())) next.phone = "Утасны дугаар буруу байна";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "И-мэйл хаяг буруу байна";
    if (!form.branchCount.trim() || Number(form.branchCount) <= 0) next.branchCount = "Салбарын тоогоо оруулна уу";
    if (!form.employeeCount.trim() || Number(form.employeeCount) <= 0) next.employeeCount = "Ажилтны тоогоо оруулна уу";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 700));
    setStatus("done");
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <AnimatePresence mode="wait">
          {status === "done" ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color-mix(in_oklch,var(--success)_20%,transparent)] text-[var(--success)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Таны хүсэлтийг амжилттай хүлээн авлаа.</h3>
              <p className="mt-1 text-sm text-muted-foreground">Манай зөвлөх тантай холбогдох болно.</p>
              <Button className="mt-6 w-full" onClick={() => close(false)}>Хаах</Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DialogHeader>
                <DialogTitle>Үнийн санал авах</DialogTitle>
                <DialogDescription>Таны хэрэгцээнд тохирсон Enterprise багцын саналыг манай зөвлөх бэлдэж өгнө.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} noValidate className="mt-3 grid gap-3.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormRow label="Байгууллагын нэр" hint={errors.orgName}>
                    <Input value={form.orgName} onChange={(e) => setForm((p) => ({ ...p, orgName: e.target.value }))} placeholder="Aura Beauty Studio" className={errors.orgName ? "border-destructive" : ""} />
                  </FormRow>
                </div>
                <FormRow label="Холбоо барих хүний нэр" hint={errors.contactName}>
                  <Input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} className={errors.contactName ? "border-destructive" : ""} />
                </FormRow>
                <FormRow label="Утасны дугаар" hint={errors.phone}>
                  <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="9911 2233" className={errors.phone ? "border-destructive" : ""} />
                </FormRow>
                <div className="sm:col-span-2">
                  <FormRow label="И-мэйл" hint={errors.email}>
                    <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@company.mn" className={errors.email ? "border-destructive" : ""} />
                  </FormRow>
                </div>
                <FormRow label="Салбарын тоо" hint={errors.branchCount}>
                  <Input type="number" min={1} value={form.branchCount} onChange={(e) => setForm((p) => ({ ...p, branchCount: e.target.value }))} className={errors.branchCount ? "border-destructive" : ""} />
                </FormRow>
                <FormRow label="Ажилтны тоо" hint={errors.employeeCount}>
                  <Input type="number" min={1} value={form.employeeCount} onChange={(e) => setForm((p) => ({ ...p, employeeCount: e.target.value }))} className={errors.employeeCount ? "border-destructive" : ""} />
                </FormRow>
                <div className="sm:col-span-2">
                  <FormRow label="Нэмэлт шаардлага (заавал биш)">
                    <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Жишээ: ERP системтэй холбох шаардлагатай" />
                  </FormRow>
                </div>
                <div className="mt-1 flex gap-2 sm:col-span-2">
                  <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
                    {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                    Хүсэлт илгээх
                  </Button>
                  <Button type="button" variant="outline" onClick={() => close(false)}>Болих</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
