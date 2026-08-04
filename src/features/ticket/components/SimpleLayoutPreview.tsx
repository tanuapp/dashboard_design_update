import { Armchair, Mic2, Users } from "lucide-react";
import type { LayoutType } from "@/features/ticket/types";
import { cn } from "@/lib/utils";

export function SimpleLayoutPreview({
  layoutType,
  capacity,
  compact = false,
}: {
  layoutType: LayoutType;
  capacity: number;
  compact?: boolean;
}) {
  const seated = layoutType === "seated" || layoutType === "mixed" || layoutType === "table";
  const standing =
    layoutType === "standing" || layoutType === "mixed" || layoutType === "free-layout";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface-muted/45 p-4",
        compact ? "min-h-40" : "min-h-72",
      )}
    >
      <div className="mx-auto flex max-w-[78%] items-center justify-center gap-2 rounded-b-[45%] bg-[var(--brand)] px-5 py-2 text-[10px] font-bold text-white shadow-sm">
        <Mic2 className="h-3.5 w-3.5" /> ТАЙЗ
      </div>
      {seated && (
        <div className="mx-auto mt-5 grid max-w-md grid-cols-10 gap-1.5">
          {Array.from({ length: compact ? 40 : 70 }, (_, index) => (
            <span
              key={index}
              className={cn(
                "grid aspect-square place-items-center rounded-[4px] border text-[6px]",
                index % 17 === 0
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-[var(--brand)]/20 bg-brand-soft text-[var(--brand)]",
              )}
            >
              <Armchair className="h-2.5 w-2.5" />
            </span>
          ))}
        </div>
      )}
      {standing && (
        <div
          className={cn(
            "mx-auto rounded-xl border border-dashed border-[var(--brand)]/35 bg-brand-soft/45 text-center",
            seated ? "mt-4 max-w-sm p-3" : "mt-8 max-w-md p-10",
          )}
        >
          <Users className="mx-auto h-5 w-5 text-[var(--brand)]" />
          <p className="mt-1 text-[10px] font-semibold">Зогсоолын бүс</p>
        </div>
      )}
      <p className="absolute bottom-2.5 right-3 text-[9px] text-muted-foreground">
        Нийт багтаамж: {capacity.toLocaleString("mn-MN")}
      </p>
    </div>
  );
}
