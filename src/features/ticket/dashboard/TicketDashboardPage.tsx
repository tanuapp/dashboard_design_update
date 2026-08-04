import { Link } from "@tanstack/react-router";
import { Banknote, CheckCircle2, Clock3, ScanLine, ShoppingCart, Ticket } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { Progress } from "@/components/ui/progress";
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
import {
  DemoRepositoryNotice,
  orderStatusLabel,
  paymentStatusLabel,
  TicketPanel,
  TicketStatusBadge,
  ticketMoney,
} from "@/features/ticket/components/TicketUI";

export function TicketDashboardPage() {
  const { selectedOrganization } = useOrganization();
  const { events, orders, tickets } = useTicketData();
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const totalSales = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const usedTickets = tickets.filter((ticket) => ticket.status === "used").length;
  const soldTickets = tickets.filter((ticket) => ["active", "used"].includes(ticket.status)).length;
  const pendingPayments = orders.filter((order) =>
    ["unpaid", "checking"].includes(order.paymentStatus),
  ).length;
  const available = Math.max(0, 7240 - soldTickets - 184);
  const utilization = Math.round((soldTickets / (soldTickets + available + 184)) * 100);

  const metrics = [
    {
      label: "Нийт арга хэмжээ",
      value: events.length,
      icon: <Ticket className="h-4 w-4" />,
      to: "/business/dashboard/ticket/$organizationId/events" as const,
    },
    {
      label: "Нийт захиалга",
      value: orders.length,
      icon: <ShoppingCart className="h-4 w-4" />,
      to: "/business/dashboard/ticket/$organizationId/orders" as const,
    },
    {
      label: "Борлуулсан тасалбар",
      value: soldTickets,
      icon: <CheckCircle2 className="h-4 w-4" />,
      to: "/business/dashboard/ticket/$organizationId/orders" as const,
    },
    {
      label: "Нэвтэрсэн тасалбар",
      value: usedTickets,
      icon: <ScanLine className="h-4 w-4" />,
      to: "/business/dashboard/ticket/$organizationId/reports" as const,
    },
    {
      label: "Баталгаажсан борлуулалт",
      value: ticketMoney(totalSales),
      icon: <Banknote className="h-4 w-4" />,
      to: "/business/dashboard/ticket/$organizationId/reports" as const,
    },
    {
      label: "Хүлээгдэж буй төлбөр",
      value: pendingPayments,
      icon: <Clock3 className="h-4 w-4" />,
      to: "/business/dashboard/ticket/$organizationId/orders" as const,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Тасалбарын хяналтын самбар"
        description={`${selectedOrganization.name}-ийн арга хэмжээ, захиалга болон нэвтрэлтийн өнөөгийн тойм.`}
      />
      <DemoRepositoryNotice />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            to={metric.to}
            params={{ organizationId: selectedOrganization.id }}
            className="min-w-0"
          >
            <StatCard
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
              tooltip={`${metric.label} хэсгийг нээх`}
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <TicketPanel className="min-w-0 p-0 sm:p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-bold">Сүүлийн захиалгууд</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Хамгийн сүүлд үүссэн 5 захиалга
              </p>
            </div>
            <Link
              to="/business/dashboard/ticket/$organizationId/orders"
              params={{ organizationId: selectedOrganization.id }}
              className="text-xs font-semibold text-[var(--brand)] hover:underline"
            >
              Бүгдийг харах
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Захиалга</TableHead>
                  <TableHead>Захиалагч</TableHead>
                  <TableHead>Арга хэмжээ</TableHead>
                  <TableHead>Төлбөр</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead className="text-right">Нийт үнэ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => {
                  const event = events.find((item) => item.id === order.eventId);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell className="max-w-52 truncate">{event?.name}</TableCell>
                      <TableCell>
                        <TicketStatusBadge
                          value={order.paymentStatus}
                          label={paymentStatusLabel[order.paymentStatus]}
                        />
                      </TableCell>
                      <TableCell>
                        <TicketStatusBadge
                          value={order.orderStatus}
                          label={orderStatusLabel[order.orderStatus]}
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {ticketMoney(order.total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TicketPanel>

        <div className="space-y-6">
          <TicketPanel>
            <h2 className="text-sm font-bold">Суудлын ашиглалт</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Идэвхтэй арга хэмжээнүүдийн нэгдсэн төлөв
            </p>
            <div className="mt-5 flex items-end justify-between">
              <p className="text-3xl font-extrabold">{utilization}%</p>
              <p className="text-xs text-muted-foreground">
                {soldTickets.toLocaleString("mn-MN")} борлуулсан
              </p>
            </div>
            <Progress value={utilization} className="mt-3" />
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <SeatMetric label="Борлуулсан" value={soldTickets} tone="bg-[var(--success)]" />
              <SeatMetric label="Түр хадгалсан" value={37} tone="bg-[var(--warning)]" />
              <SeatMetric label="Боломжтой" value={available} tone="bg-[var(--brand)]" />
              <SeatMetric label="Хаалттай" value={184} tone="bg-destructive" />
            </div>
          </TicketPanel>

          <TicketPanel>
            <h2 className="text-sm font-bold">Борлуулалтын тойм</h2>
            <p className="mt-1 text-xs text-muted-foreground">Сүүлийн 7 өдрийн тасалбарын тоо</p>
            <div className="mt-5 flex h-32 items-end gap-2">
              {[38, 52, 46, 70, 62, 84, 76].map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md bg-gradient-brand"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{index + 1}</span>
                </div>
              ))}
            </div>
          </TicketPanel>
        </div>
      </div>
    </div>
  );
}

function SeatMetric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted/40 p-3">
      <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className={`h-2 w-2 rounded-full ${tone}`} /> {label}
      </p>
      <p className="mt-1 font-bold tabular-nums">{value.toLocaleString("mn-MN")}</p>
    </div>
  );
}
