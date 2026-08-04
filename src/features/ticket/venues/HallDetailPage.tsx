import { Building2, DoorOpen, Ruler, Users } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { useOrganization } from "@/lib/organization-context";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import { SimpleLayoutPreview } from "@/features/ticket/components/SimpleLayoutPreview";
import { layoutTypeLabel, TicketPanel } from "@/features/ticket/components/TicketUI";

export function HallDetailPage({ hallId }: { hallId: string }) {
  const data = useTicketData();
  const { selectedOrganization } = useOrganization();
  const hall = data.halls.find((item) => item.id === hallId);
  if (!hall)
    return <EmptyState icon={<Building2 className="h-6 w-6" />} title="Танхим олдсонгүй" />;
  const venue = data.venues.find((item) => item.id === hall.venueId);
  const layout = data.layouts.find((item) => item.hallId === hall.id);
  const base = `/business/dashboard/ticket/${selectedOrganization.id}`;
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={hall.name}
        description={`${venue?.name} · ${layoutTypeLabel[hall.layoutType]}`}
        backTo={`${base}/venues/${hall.venueId}`}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <TicketPanel>
          <SimpleLayoutPreview layoutType={hall.layoutType} capacity={hall.capacity} />
        </TicketPanel>
        <TicketPanel>
          <h2 className="text-sm font-bold">Танхимын үзүүлэлт</h2>
          <div className="mt-4 space-y-3">
            <Row
              icon={<Users />}
              label="Нийт багтаамж"
              value={`${hall.capacity.toLocaleString("mn-MN")}`}
            />
            <Row icon={<Ruler />} label="Хэмжээ" value={`${hall.width} × ${hall.height} м`} />
            <Row icon={<Building2 />} label="Давхар" value={hall.floor} />
            <Row
              icon={<DoorOpen />}
              label="Орох / гарах"
              value={`${hall.entranceCount} / ${hall.exitCount}`}
            />
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">{hall.description}</p>
        </TicketPanel>
      </div>
    </div>
  );
}
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-xs">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}
