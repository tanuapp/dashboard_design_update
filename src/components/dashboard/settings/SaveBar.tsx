import { Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
  saveLabel = "Өөрчлөлт хадгалах",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="sticky bottom-3 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/95 p-3 shadow-[0_18px_50px_-25px_rgba(8,24,55,0.5)] backdrop-blur-xl sm:px-4">
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`h-2 w-2 rounded-full ${dirty ? "bg-[var(--warning)]" : "bg-[var(--success)]"}`}
        />
        <span className="font-semibold">
          {dirty ? "Хадгалаагүй өөрчлөлт байна" : "Бүх өөрчлөлт хадгалагдсан"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" disabled={!dirty || saving} onClick={onReset}>
          <RotateCcw /> Цуцлах
        </Button>
        <Button size="sm" className="rounded-lg" disabled={!dirty || saving} onClick={onSave}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {saving ? "Хадгалж байна..." : saveLabel}
        </Button>
      </div>
    </div>
  );
}
