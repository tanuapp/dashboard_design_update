import { CalendarClock, Eye, MapPin, Plus, Ticket, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganization } from "@/lib/organization-context";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import {
  eventStatusLabel,
  formatTicketDateTime,
  TicketPanel,
  TicketStatusBadge,
  ticketMoney,
} from "@/features/ticket/components/TicketUI";
import { useState } from "react";

export function EventsPage() {
  const { selectedOrganization } = useOrganization();
  const data = useTicketData();
  const [search, setSearch] = useState("");
  const filtered = data.events.filter((event) =>
    `${event.name} ${event.category}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Арга хэмжээ"
        description="Арга хэмжээний мэдээлэл, борлуулалтын төлөв болон хуваарийг удирдана."
        actions={
          data.can("ticket.events.manage") && (
            <Button asChild>
              <Link
                to="/business/dashboard/ticket/$organizationId/events/new"
                params={{ organizationId: selectedOrganization.id }}
              >
                <Plus /> Шинэ арга хэмжээ
              </Link>
            </Button>
          )
        }
      />
      <TicketPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Арга хэмжээний жагсаалт</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{filtered.length} арга хэмжээ</p>
          </div>
          <Input
            className="w-full sm:w-72"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Нэр, ангиллаар хайх..."
          />
        </div>
      </TicketPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-6 w-6" />}
          title={data.events.length ? "Илэрц олдсонгүй" : "Арга хэмжээ алга байна"}
          description="Шинэ арга хэмжээ үүсгэснээр энд харагдана."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((event) => {
            const venue = data.venues.find((item) => item.id === event.venueId);
            const hall = data.halls.find((item) => item.id === event.hallId);
            const schedule = data.schedules.find((item) => item.eventId === event.id);
            const types = data.ticketTypes.filter((item) => item.eventId === event.id);
            const sold = types.reduce((sum, type) => sum + type.soldQuantity, 0);
            const sales = types.reduce((sum, type) => sum + type.soldQuantity * type.price, 0);
            return (
              <TicketPanel key={event.id} className="overflow-hidden p-0 sm:p-0">
                <div
                  className="h-28 p-4 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${event.imageColor}, color-mix(in srgb, ${event.imageColor} 60%, #071b3d))`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold backdrop-blur">
                      {event.category}
                    </span>
                    <TicketStatusBadge
                      value={event.status}
                      label={eventStatusLabel[event.status]}
                    />
                  </div>
                  <h2 className="mt-6 line-clamp-1 text-lg font-extrabold">{event.name}</h2>
                </div>
                <div className="space-y-3 p-4">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {venue?.name} · {hall?.name}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />{" "}
                    {schedule ? formatTicketDateTime(schedule.startAt) : "Хуваарьгүй"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-muted/45 p-3 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Борлуулсан</p>
                      <p className="font-bold">{sold.toLocaleString("mn-MN")} тасалбар</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Борлуулалт</p>
                      <p className="font-bold">{ticketMoney(sales)}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      to="/business/dashboard/ticket/$organizationId/events/$eventId"
                      params={{ organizationId: selectedOrganization.id, eventId: event.id }}
                    >
                      <Eye /> Дэлгэрэнгүй
                    </Link>
                  </Button>
                </div>
              </TicketPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
