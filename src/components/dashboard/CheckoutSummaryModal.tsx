import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { money } from "./ui";

export function CheckoutSummaryModal({
  open,
  onOpenChange,
  packageName,
  durationLabel,
  base,
  discountAmount,
  final,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  packageName: string;
  durationLabel: string;
  base: number;
  discountAmount: number;
  final: number;
}) {
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    onOpenChange(false);
    toast.success("Энэ бол демо горим", { description: "Жинхэнэ төлбөр хийгдээгүй болно." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Төлбөрийн тойм</DialogTitle>
          <DialogDescription>Демо горим — жинхэнэ төлбөр хийгдэхгүй.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-4 text-sm">
          <Row label="Сонгосон багц" value={packageName} />
          <Row label="Сонгосон хугацаа" value={durationLabel} />
          <Row label="Үндсэн үнэ" value={money(base)} />
          <Row label="Хөнгөлөлт" value={discountAmount > 0 ? `-${money(discountAmount)}` : "—"} tone={discountAmount > 0 ? "text-[var(--success)]" : ""} />
          <div className="my-1 border-t border-border/70" />
          <Row label="Нийт төлбөр" value={money(final)} bold />
        </div>
        <div className="mt-2 flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Буцах
          </Button>
          <Button type="button" className="flex-1 gap-2" disabled={loading} onClick={handleContinue}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Төлбөр үргэлжлүүлэх
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "text-base font-bold" : "font-medium"} ${tone ?? ""}`}>{value}</span>
    </div>
  );
}
