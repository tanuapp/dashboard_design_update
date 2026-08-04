import { Link } from "@tanstack/react-router";
import { CalendarClock, DoorOpen, Edit3, MapPin, Settings, Ticket } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganization } from "@/lib/organization-context";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import { SimpleLayoutPreview } from "@/features/ticket/components/SimpleLayoutPreview";
import {
  eventStatusLabel,
  formatTicketDateTime,
  orderStatusLabel,
  TicketPanel,
  TicketStatusBadge,
  ticketMoney,
} from "@/features/ticket/components/TicketUI";

export function EventDetailPage({ eventId }: { eventId: string }) {
  const data = useTicketData();
  const { selectedOrganization } = useOrganization();
  const event = data.events.find((item) => item.id === eventId);
  const base = `/business/dashboard/ticket/${selectedOrganization.id}`;
  if (!event)
    return (
      <EmptyState
        icon={<Ticket className="h-6 w-6" />}
        title="Арга хэмжээ олдсонгүй"
        description="Энэ арга хэмжээ устсан эсвэл өөр байгууллагад харьяалагдаж байна."
      />
    );
  const venue = data.venues.find((item) => item.id === event.venueId);
  const hall = data.halls.find((item) => item.id === event.hallId);
  const layout = data.layouts.find((item) => item.id === event.layoutId);
  const schedules = data.schedules.filter((item) => item.eventId === event.id);
  const types = data.ticketTypes.filter((item) => item.eventId === event.id);
  const orders = data.orders.filter((item) => item.eventId === event.id);
  const sold = types.reduce((sum, type) => sum + type.soldQuantity, 0);
  const capacity = layout?.totalCapacity ?? 0;
  const used = data.tickets.filter(
    (ticket) => orders.some((order) => order.id === ticket.orderId) && ticket.status === "used",
  ).length;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={event.name}
        description={`${event.category} · ${venue?.name ?? "Байршилгүй"}`}
        backTo={`${base}/events`}
        actions={<TicketStatusBadge value={event.status} label={eventStatusLabel[event.status]} />}
      />
      <Tabs defaultValue="overview" className="space-y-5">
        <div className="overflow-x-auto">
          <TabsList className="h-auto min-w-max justify-start">
            <TabsTrigger value="overview">Ерөнхий</TabsTrigger>
            <TabsTrigger value="schedules">Хуваарь</TabsTrigger>
            <TabsTrigger value="venue">Байршил ба суудал</TabsTrigger>
            <TabsTrigger value="pricing">Тасалбар ба үнэ</TabsTrigger>
            <TabsTrigger value="orders">Захиалга</TabsTrigger>
            <TabsTrigger value="gates">Нэвтрэх хаалга</TabsTrigger>
            <TabsTrigger value="reports">Тайлан</TabsTrigger>
            <TabsTrigger value="settings">Тохиргоо</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <TicketPanel>
              <h2 className="text-base font-bold">Арга хэмжээний мэдээлэл</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{event.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Info icon={<MapPin />} label="Байршил" value={`${venue?.name} · ${hall?.name}`} />
                <Info
                  icon={<CalendarClock />}
                  label="Хуваарь"
                  value={schedules[0] ? formatTicketDateTime(schedules[0].startAt) : "Хуваарьгүй"}
                />
                <Info
                  icon={<Ticket />}
                  label="Борлуулсан"
                  value={`${sold.toLocaleString("mn-MN")} / ${capacity.toLocaleString("mn-MN")}`}
                />
                <Info
                  icon={<DoorOpen />}
                  label="Нэвтэрсэн"
                  value={`${used.toLocaleString("mn-MN")} тасалбар`}
                />
              </div>
            </TicketPanel>
            <TicketPanel>
              <h2 className="text-sm font-bold">Борлуулалтын явц</h2>
              <p className="mt-4 text-3xl font-extrabold">
                {capacity ? Math.round((sold / capacity) * 100) : 0}%
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-brand"
                  style={{ width: `${capacity ? Math.min(100, (sold / capacity) * 100) : 0}%` }}
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Баталгаажсан орлого</p>
              <p className="text-lg font-bold">
                {ticketMoney(
                  orders
                    .filter((order) => order.paymentStatus === "paid")
                    .reduce((sum, order) => sum + order.total, 0),
                )}
              </p>
            </TicketPanel>
          </div>
        </TabsContent>
        <TabsContent value="schedules">
          <TicketPanel>
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                >
                  <div>
                    <p className="font-semibold">{formatTicketDateTime(schedule.startAt)}</p>
                    <p className="text-xs text-muted-foreground">
                      Хаалга нээх: {formatTicketDateTime(schedule.doorsOpenAt)} · Hold:{" "}
                      {schedule.holdDurationMinutes} минут
                    </p>
                  </div>
                  <TicketStatusBadge
                    value={schedule.status}
                    label={schedule.status === "on-sale" ? "Борлуулж буй" : "Товлосон"}
                  />
                </div>
              ))}
            </div>
          </TicketPanel>
        </TabsContent>
        <TabsContent value="venue">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <TicketPanel>
              <SimpleLayoutPreview
                layoutType={layout?.layoutType ?? "seated"}
                capacity={capacity}
              />
            </TicketPanel>
            <TicketPanel>
              <h2 className="text-sm font-bold">Багтаамжийн төлөв</h2>
              <div className="mt-4 space-y-3">
                <Metric label="Нийт багтаамж" value={capacity} />
                <Metric label="Борлуулсан" value={sold} />
                <Metric label="Түр хадгалсан" value={18} />
                <Metric
                  label="Боломжтой"
                  value={Math.max(0, capacity - sold - (layout?.blockedSeats ?? 0) - 18)}
                />
                <Metric label="Хаалттай" value={layout?.blockedSeats ?? 0} />
                <Metric label="Зогсоолын багтаамж" value={layout?.standingCapacity ?? 0} />
              </div>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link
                  to="/business/dashboard/ticket/$organizationId/seat-maps/$layoutId"
                  params={{
                    organizationId: selectedOrganization.id,
                    layoutId: layout?.id ?? "missing",
                  }}
                >
                  <Edit3 /> Зураглал харах
                </Link>
              </Button>
            </TicketPanel>
          </div>
        </TabsContent>
        <TabsContent value="pricing">
          <TicketPanel className="p-0 sm:p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Төрөл</TableHead>
                    <TableHead>Код</TableHead>
                    <TableHead>Хэсэг / бүс</TableHead>
                    <TableHead>Үнэ</TableHead>
                    <TableHead>Багтаамж</TableHead>
                    <TableHead>Борлуулсан</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {types.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-semibold">{type.name}</TableCell>
                      <TableCell>{type.code}</TableCell>
                      <TableCell>{type.sectionOrZone}</TableCell>
                      <TableCell>{ticketMoney(type.price)}</TableCell>
                      <TableCell>{type.capacity}</TableCell>
                      <TableCell>{type.soldQuantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TicketPanel>
        </TabsContent>
        <TabsContent value="orders">
          <TicketPanel className="p-0 sm:p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дугаар</TableHead>
                    <TableHead>Захиалагч</TableHead>
                    <TableHead>Төлөв</TableHead>
                    <TableHead>Нийт</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>
                        <TicketStatusBadge
                          value={order.orderStatus}
                          label={orderStatusLabel[order.orderStatus]}
                        />
                      </TableCell>
                      <TableCell>{ticketMoney(order.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TicketPanel>
        </TabsContent>
        <TabsContent value="gates">
          <TicketPanel>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.gates
                .filter((gate) => gate.venueId === venue?.id)
                .map((gate) => (
                  <div key={gate.id} className="rounded-xl border border-border p-4">
                    <p className="font-semibold">{gate.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {gate.code} · {gate.deviceCount} төхөөрөмж
                    </p>
                  </div>
                ))}
            </div>
          </TicketPanel>
        </TabsContent>
        <TabsContent value="reports">
          <TicketPanel>
            <h2 className="font-bold">Арга хэмжээний тайлан</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Захиалга: {orders.length} · Борлуулсан: {sold} · Нэвтэрсэн: {used}
            </p>
            <Button asChild className="mt-4">
              <Link
                to="/business/dashboard/ticket/$organizationId/reports"
                params={{ organizationId: selectedOrganization.id }}
              >
                Нэгдсэн тайлан нээх
              </Link>
            </Button>
          </TicketPanel>
        </TabsContent>
        <TabsContent value="settings">
          <TicketPanel>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
                <Settings />
              </span>
              <div>
                <h2 className="font-bold">Арга хэмжээний тохиргоо</h2>
                <p className="text-xs text-muted-foreground">
                  Hold хугацаа, борлуулалтын дүрэм болон мэдэгдлийг дараагийн API phase-д удирдана.
                </p>
              </div>
            </div>
          </TicketPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-muted/30 p-3">
      <span className="text-[var(--brand)] [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value.toLocaleString("mn-MN")}</strong>
    </div>
  );
}
