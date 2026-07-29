import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { bizTypes } from "@/lib/mock-data";

export function BusinessSignupModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState({ name: "", type: bizTypes[0].name, phone: "", email: "" });
  const [done, setDone] = useState(false);
  const close = (v: boolean) => { onOpenChange(v); if (!v) setTimeout(() => setDone(false), 300); };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-[color-mix(in_oklch,var(--success)_20%,transparent)] text-[var(--success)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Бүртгэл хүлээн авлаа!</h3>
              <p className="mt-1 text-sm text-muted-foreground">Манай баг тантай удахгүй холбогдох болно.</p>
              <Button className="mt-6 w-full" onClick={() => close(false)}>Хаах</Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DialogHeader>
                <DialogTitle>Байгууллага бүртгүүлэх</DialogTitle>
                <DialogDescription>Демо зорилгоор — ямар ч мэдээлэл серверт илгээгдэхгүй.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); setDone(true); }}
                className="mt-4 space-y-3"
              >
                <Field label="Байгууллагын нэр"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aura Beauty" required /></Field>
                <Field label="Үйл ажиллагааны чиглэл">
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-10 w-full rounded-md border border-input bg-surface px-3 text-sm">
                    {bizTypes.map((t) => <option key={t.name}>{t.name}</option>)}
                  </select>
                </Field>
                <Field label="Утас"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9911 2233" required /></Field>
                <Field label="И-мэйл"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.mn" required /></Field>
                <Button type="submit" className="w-full bg-primary text-primary-foreground">Үргэлжлүүлэх</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
