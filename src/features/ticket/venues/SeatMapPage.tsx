import { Copy, Eye, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import { SimpleLayoutPreview } from "@/features/ticket/components/SimpleLayoutPreview";
import {
  layoutTypeLabel,
  TicketPanel,
  TicketStatusBadge,
} from "@/features/ticket/components/TicketUI";

export function SeatMapPage({ layoutId }: { layoutId: string }) {
  const data = useTicketData();
  const layout = data.layouts.find((item) => item.id === layoutId);
  if (!layout)
    return (
      <EmptyState
        icon={<Settings2 className="h-6 w-6" />}
        title="Зураглал олдсонгүй"
        description="Зураглал өөр байгууллага эсвэл хандах эрхгүй байршилд харьяалагдаж байна."
      />
    );
  const hall = data.halls.find((item) => item.id === layout.hallId);
  const venue = data.venues.find((item) => item.id === hall?.venueId);
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={layout.name}
        description={`${venue?.name} · ${hall?.name} · ${layoutTypeLabel[layout.layoutType]}`}
        backTo={
          hall ? `/business/dashboard/ticket/${layout.organizationId}/halls/${hall.id}` : undefined
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => toast.success("Зураглалын шинэ version local draft-аар бэлдлээ")}
            >
              <Copy /> Шинэ хувилбар хуулах
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Хэрэглэгчийн preview горим идэвхжлээ")}
            >
              <Eye /> Урьдчилан харах
            </Button>
            <Button
              onClick={() => toast.success("Зураглалын ноорог local repository-д хадгалагдлаа")}
            >
              <Save /> Ноорог хадгалах
            </Button>
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <TicketPanel>
          <h2 className="text-xs font-bold uppercase text-muted-foreground">Зураглалын бүтэц</h2>
          <div className="mt-4 space-y-2">
            {[
              "Тайз",
              "A сектор",
              "B сектор",
              layout.layoutType === "mixed" ? "Зогсоолын бүс" : "Балкон",
              "Орох хаалга",
              "Гарц",
            ].map((item) => (
              <button
                key={item}
                className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs hover:bg-secondary"
                onClick={() => toast.info(`${item} сонгогдлоо`)}
              >
                {item}
              </button>
            ))}
          </div>
        </TicketPanel>
        <TicketPanel>
          <SimpleLayoutPreview layoutType={layout.layoutType} capacity={layout.totalCapacity} />
        </TicketPanel>
        <TicketPanel>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Зураглалын мэдээлэл</h2>
            <TicketStatusBadge
              value={layout.status}
              label={
                layout.status === "active"
                  ? "Идэвхтэй"
                  : layout.status === "draft"
                    ? "Ноорог"
                    : "Архив"
              }
            />
          </div>
          <div className="mt-5 space-y-3 text-xs">
            <Metric label="Хувилбар" value={`v${layout.version}`} />
            <Metric label="Нийт багтаамж" value={layout.totalCapacity.toLocaleString("mn-MN")} />
            <Metric label="Суудал" value={layout.seatedCapacity.toLocaleString("mn-MN")} />
            <Metric label="Зогсоол" value={layout.standingCapacity.toLocaleString("mn-MN")} />
            <Metric label="Хаалттай" value={layout.blockedSeats.toLocaleString("mn-MN")} />
          </div>
          <p className="mt-5 rounded-xl border border-[var(--warning)]/20 bg-[color-mix(in_oklch,var(--warning)_8%,transparent)] p-3 text-[10px] leading-4 text-muted-foreground">
            Энэ phase-д энгийн preview болон version architecture бэлэн. Drag-and-drop canvas editor
            дараагийн phase-д repository contract дээр нэмэгдэнэ.
          </p>
        </TicketPanel>
      </div>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
