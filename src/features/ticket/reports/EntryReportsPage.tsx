import { BarChart3, CheckCircle2, Clock3, ScanLine, Ticket } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import { TicketPanel, ticketMoney } from "@/features/ticket/components/TicketUI";

export function EntryReportsPage() {
  const data = useTicketData();
  const sold = data.tickets.filter((ticket) => ["active", "used"].includes(ticket.status)).length;
  const used = data.tickets.filter((ticket) => ticket.status === "used").length;
  const revenue = data.orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Нэвтрэлтийн тайлан"
        description="Тасалбарын борлуулалт, нэвтрэлт болон хаалганы гүйцэтгэлийг нэгтгэн харна."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Ticket className="h-4 w-4" />} label="Борлуулсан тасалбар" value={sold} />
        <StatCard icon={<ScanLine className="h-4 w-4" />} label="Нэвтэрсэн" value={used} />
        <StatCard
          icon={<Clock3 className="h-4 w-4" />}
          label="Нэвтрээгүй"
          value={Math.max(0, sold - used)}
        />
        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Баталгаажсан орлого"
          value={ticketMoney(revenue)}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TicketPanel className="p-0 sm:p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold">Хаалганы гүйцэтгэл</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Хаалга</TableHead>
                  <TableHead>Байршил</TableHead>
                  <TableHead>Төхөөрөмж</TableHead>
                  <TableHead>Өнөөдөр шалгасан</TableHead>
                  <TableHead>Дундаж ачаалал</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.gates.map((gate) => {
                  const venue = data.venues.find((item) => item.id === gate.venueId);
                  return (
                    <TableRow key={gate.id}>
                      <TableCell className="font-semibold">{gate.name}</TableCell>
                      <TableCell>{venue?.name}</TableCell>
                      <TableCell>{gate.deviceCount}</TableCell>
                      <TableCell>{gate.scannedToday.toLocaleString("mn-MN")}</TableCell>
                      <TableCell>
                        {gate.deviceCount ? Math.round(gate.scannedToday / gate.deviceCount) : 0} /
                        төхөөрөмж
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TicketPanel>
        <TicketPanel>
          <h2 className="text-sm font-bold">Арга хэмжээний нэвтрэлт</h2>
          <div className="mt-4 space-y-4">
            {data.events.map((event) => {
              const eventOrders = data.orders.filter((order) => order.eventId === event.id);
              const ticketIds = new Set(eventOrders.flatMap((order) => order.ticketIds));
              const eventTickets = data.tickets.filter((ticket) => ticketIds.has(ticket.id));
              const eventUsed = eventTickets.filter((ticket) => ticket.status === "used").length;
              const percent = eventTickets.length
                ? Math.round((eventUsed / eventTickets.length) * 100)
                : 0;
              return (
                <div key={event.id}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-semibold">{event.name}</span>
                    <span className="text-muted-foreground">
                      {eventUsed}/{eventTickets.length}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-[10px] text-[var(--brand)]">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Тайлан local demo өгөгдлөөс тооцоологдож
            байна.
          </div>
        </TicketPanel>
      </div>
    </div>
  );
}
