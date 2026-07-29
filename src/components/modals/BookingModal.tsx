import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CalendarDays, Building2 } from "lucide-react";
import { bookingSlots } from "@/lib/mock-data";
import { motion, AnimatePresence } from "motion/react";

export function BookingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [slot, setSlot] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(() => { setDone(false); setSlot(null); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-[color-mix(in_oklch,var(--success)_20%,transparent)] text-[var(--success)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Захиалга амжилттай!</h3>
              <p className="mt-1 text-sm text-muted-foreground">Aura Beauty Studio · {slot} · Маргааш</p>
              <p className="mt-4 text-xs text-muted-foreground">Танд сануулга илгээгдэнэ.</p>
              <Button className="mt-6 w-full bg-gradient-brand text-white" onClick={() => close(false)}>Хаах</Button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DialogHeader>
                <DialogTitle>Цаг захиалах</DialogTitle>
                <DialogDescription>Боломжтой цагаа сонгоод захиалгаа баталгаажуулна уу.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-border p-4 bg-surface-muted">
                  <div className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-[var(--brand)]" /> Aura Beauty Studio</div>
                  <div className="mt-1 text-sm text-muted-foreground">Signature гоо сайхны цогц үйлчилгээ</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Маргааш · {new Date(Date.now() + 86400000).toLocaleDateString("mn-MN")}</div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Боломжтой цаг</p>
                  <div className="grid grid-cols-3 gap-2">
                    {bookingSlots.map((t) => (
                      <button key={t} onClick={() => setSlot(t)} className={`rounded-md px-3 py-2 text-sm border transition ${slot === t ? "bg-gradient-brand text-white border-transparent" : "border-border hover:bg-secondary"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <Button disabled={!slot} onClick={() => setDone(true)} className="w-full bg-gradient-brand text-white disabled:opacity-40">Баталгаажуулах</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
