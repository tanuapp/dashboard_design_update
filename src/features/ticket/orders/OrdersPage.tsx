import { useMemo, useState } from "react";
import {
  Ban,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileClock,
  MoreHorizontal,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  ShoppingCart,
  Ticket,
  UserRound,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  StatCard,
  ConfirmDialog,
  EmptyState,
  FormRow,
} from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import type { OrderStatus, PaymentStatus, TicketOrder } from "@/features/ticket/types";
import {
  formatTicketDateTime,
  issuedTicketStatusLabel,
  orderStatusLabel,
  paymentStatusLabel,
  TicketPanel,
  TicketStatusBadge,
  ticketMoney,
} from "@/features/ticket/components/TicketUI";

type DangerousAction = "cancel" | "refund" | "void";

export function OrdersPage() {
  const data = useTicketData();
  const [orderSearch, setOrderSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [eventId, setEventId] = useState("all");
  const [scheduleId, setScheduleId] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [ticketStatus, setTicketStatus] = useState("all");
  const [salesChannel, setSalesChannel] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>();
  const [manualOpen, setManualOpen] = useState(false);
  const [dangerous, setDangerous] = useState<{ type: DangerousAction; orderId: string }>();

  const filtered = useMemo(
    () =>
      data.orders.filter((order) => {
        const orderTickets = data.tickets.filter((ticket) => ticket.orderId === order.id);
        return (
          order.orderNumber.toLowerCase().includes(orderSearch.trim().toLowerCase()) &&
          order.customer.name.toLowerCase().includes(customerSearch.trim().toLowerCase()) &&
          order.customer.phone.replaceAll(" ", "").includes(phoneSearch.replaceAll(" ", "")) &&
          (eventId === "all" || order.eventId === eventId) &&
          (scheduleId === "all" || order.scheduleId === scheduleId) &&
          (paymentStatus === "all" || order.paymentStatus === paymentStatus) &&
          (orderStatus === "all" || order.orderStatus === orderStatus) &&
          (salesChannel === "all" || order.salesChannel === salesChannel) &&
          (ticketStatus === "all" ||
            orderTickets.some((ticket) => ticket.status === ticketStatus)) &&
          (!dateFrom || order.createdAt.slice(0, 10) >= dateFrom) &&
          (!dateTo || order.createdAt.slice(0, 10) <= dateTo)
        );
      }),
    [
      customerSearch,
      data.orders,
      data.tickets,
      dateFrom,
      dateTo,
      eventId,
      orderSearch,
      orderStatus,
      paymentStatus,
      phoneSearch,
      salesChannel,
      scheduleId,
      ticketStatus,
    ],
  );
  const selectedOrder = data.orders.find((order) => order.id === selectedOrderId);

  const clearFilters = () => {
    setOrderSearch("");
    setCustomerSearch("");
    setPhoneSearch("");
    setEventId("all");
    setScheduleId("all");
    setPaymentStatus("all");
    setOrderStatus("all");
    setTicketStatus("all");
    setSalesChannel("all");
    setDateFrom("");
    setDateTo("");
  };

  const applyDangerousAction = () => {
    if (!dangerous) return;
    try {
      if (dangerous.type === "cancel") data.cancelOrder(dangerous.orderId);
      if (dangerous.type === "refund") data.refundOrder(dangerous.orderId);
      if (dangerous.type === "void") data.voidOrderTickets(dangerous.orderId);
      toast.success(
        dangerous.type === "cancel"
          ? "Захиалга цуцлагдлаа"
          : dangerous.type === "refund"
            ? "Төлбөр буцаагдлаа"
            : "Тасалбарууд хүчингүй боллоо",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Үйлдэл амжилтгүй боллоо");
    }
    setDangerous(undefined);
  };

  const totalSales = data.orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);
  const summaries = [
    {
      label: "Нийт захиалга",
      value: data.orders.length,
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      label: "Төлбөр амжилттай",
      value: data.orders.filter((order) => order.paymentStatus === "paid").length,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      label: "Хүлээгдэж буй",
      value: data.orders.filter((order) => order.orderStatus === "pending").length,
      icon: <Clock3 className="h-4 w-4" />,
    },
    {
      label: "Цуцлагдсан",
      value: data.orders.filter((order) => order.orderStatus === "cancelled").length,
      icon: <XCircle className="h-4 w-4" />,
    },
    {
      label: "Буцаалт хийгдсэн",
      value: data.orders.filter((order) => order.paymentStatus === "refunded").length,
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      label: "Нийт борлуулалт",
      value: ticketMoney(totalSales),
      icon: <Banknote className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Захиалга"
        description="Бүх арга хэмжээний захиалга, төлбөр болон тасалбарыг нэг дор удирдана."
        actions={
          data.can("ticket.orders.create") && (
            <Button onClick={() => setManualOpen(true)}>
              <Plus className="h-4 w-4" /> Захиалга үүсгэх
            </Button>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {summaries.map((summary) => (
          <StatCard
            key={summary.label}
            icon={summary.icon}
            label={summary.label}
            value={summary.value}
          />
        ))}
      </div>

      <TicketPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Хайлт ба шүүлтүүр</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {filtered.length} захиалга олдлоо
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Цэвэрлэх
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FilterInput
            icon={<Search />}
            placeholder="Захиалгын дугаар"
            value={orderSearch}
            onChange={setOrderSearch}
          />
          <FilterInput
            icon={<UserRound />}
            placeholder="Захиалагчийн нэр"
            value={customerSearch}
            onChange={setCustomerSearch}
          />
          <FilterInput
            icon={<Search />}
            placeholder="Утасны дугаар"
            value={phoneSearch}
            onChange={setPhoneSearch}
          />
          <FilterSelect
            value={eventId}
            onChange={setEventId}
            placeholder="Арга хэмжээ"
            options={data.events.map((event) => ({ value: event.id, label: event.name }))}
          />
          <FilterSelect
            value={scheduleId}
            onChange={setScheduleId}
            placeholder="Хуваарь"
            options={data.schedules.map((schedule) => ({
              value: schedule.id,
              label: formatTicketDateTime(schedule.startAt),
            }))}
          />
          <FilterSelect
            value={paymentStatus}
            onChange={setPaymentStatus}
            placeholder="Төлбөрийн төлөв"
            options={(Object.keys(paymentStatusLabel) as PaymentStatus[]).map((status) => ({
              value: status,
              label: paymentStatusLabel[status],
            }))}
          />
          <FilterSelect
            value={orderStatus}
            onChange={setOrderStatus}
            placeholder="Захиалгын төлөв"
            options={(Object.keys(orderStatusLabel) as OrderStatus[]).map((status) => ({
              value: status,
              label: orderStatusLabel[status],
            }))}
          />
          <FilterSelect
            value={ticketStatus}
            onChange={setTicketStatus}
            placeholder="Тасалбарын төлөв"
            options={Object.entries(issuedTicketStatusLabel).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <FilterSelect
            value={salesChannel}
            onChange={setSalesChannel}
            placeholder="Борлуулалтын суваг"
            options={[
              { value: "online", label: "Онлайн" },
              { value: "box-office", label: "Касс" },
              { value: "phone", label: "Утас" },
              { value: "complimentary", label: "Үнэгүй" },
            ]}
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="Эхлэх огноо"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="Дуусах огноо"
          />
        </div>
      </TicketPanel>

      <TicketPanel className="min-w-0 p-0 sm:p-0">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Ticket className="h-6 w-6" />}
            title={
              data.orders.length ? "Шүүлтүүрт тохирох захиалга олдсонгүй" : "Захиалга алга байна"
            }
            description="Шүүлтүүрээ цэвэрлэх эсвэл шинэ гар захиалга үүсгэнэ үү."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[1420px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Захиалгын дугаар</TableHead>
                  <TableHead>Захиалагч</TableHead>
                  <TableHead>Арга хэмжээ</TableHead>
                  <TableHead>Хуваарь</TableHead>
                  <TableHead>Тасалбар</TableHead>
                  <TableHead>Суудал / бүс</TableHead>
                  <TableHead className="text-right">Нийт үнэ</TableHead>
                  <TableHead>Төлбөр</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Захиалсан огноо</TableHead>
                  <TableHead className="w-12">Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => {
                  const event = data.events.find((item) => item.id === order.eventId);
                  const schedule = data.schedules.find((item) => item.id === order.scheduleId);
                  const orderTickets = data.tickets.filter((ticket) => ticket.orderId === order.id);
                  const firstTicket = orderTickets[0];
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                      <TableCell>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-[10px] text-muted-foreground">{order.customer.phone}</p>
                      </TableCell>
                      <TableCell className="max-w-56 truncate">{event?.name}</TableCell>
                      <TableCell>
                        {schedule ? formatTicketDateTime(schedule.startAt) : "—"}
                      </TableCell>
                      <TableCell>{orderTickets.length} ш</TableCell>
                      <TableCell>
                        {firstTicket
                          ? `${firstTicket.section}${firstTicket.row ? ` · ${firstTicket.row}-${firstTicket.seat}` : ""}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {ticketMoney(order.total)}
                      </TableCell>
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
                      <TableCell>{formatTicketDateTime(order.createdAt)}</TableCell>
                      <TableCell>
                        <OrderActions
                          order={order}
                          onDetail={() => setSelectedOrderId(order.id)}
                          onDanger={(type) => setDangerous({ type, orderId: order.id })}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </TicketPanel>

      <OrderDetailSheet
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrderId(undefined)}
      />
      <ManualOrderDialog open={manualOpen} onOpenChange={setManualOpen} />
      <ConfirmDialog
        open={Boolean(dangerous)}
        onOpenChange={(open) => !open && setDangerous(undefined)}
        title={
          dangerous?.type === "cancel"
            ? "Захиалга цуцлах уу?"
            : dangerous?.type === "refund"
              ? "Төлбөр буцаах уу?"
              : "Тасалбар хүчингүй болгох уу?"
        }
        description="Энэ үйлдэл захиалгын түүхэнд бүртгэгдэнэ. Үргэлжлүүлэхийн өмнө мэдээллийг шалгана уу."
        confirmLabel="Үргэлжлүүлэх"
        destructive
        onConfirm={applyDangerousAction}
      />
    </div>
  );
}

function FilterInput({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      {" "}
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
      </span>
      <Input
        className="pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}: Бүгд</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function OrderActions({
  order,
  onDetail,
  onDanger,
}: {
  order: TicketOrder;
  onDetail: () => void;
  onDanger: (type: DangerousAction) => void;
}) {
  const { can } = useTicketData();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Үйлдэл">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onDetail}>
          <ReceiptText /> Дэлгэрэнгүй
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            toast.success("Тасалбар дахин илгээгдлээ", { description: "Local demo мэдэгдэл" })
          }
        >
          <Send /> Тасалбар дахин илгээх
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()}>
          <Printer /> Баримт хэвлэх
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDetail}>
          <FileClock /> Захиалгын түүх харах
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {can("ticket.orders.cancel") && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDanger("cancel")}
            disabled={["cancelled", "refunded"].includes(order.orderStatus)}
          >
            <XCircle /> Захиалга цуцлах
          </DropdownMenuItem>
        )}
        {can("ticket.orders.refund") && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDanger("refund")}
            disabled={order.paymentStatus !== "paid"}
          >
            <RefreshCw /> Төлбөр буцаах
          </DropdownMenuItem>
        )}
        {can("ticket.orders.cancel") && (
          <DropdownMenuItem className="text-destructive" onClick={() => onDanger("void")}>
            <Ban /> Тасалбар хүчингүй болгох
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: {
  order?: TicketOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = useTicketData();
  const [note, setNote] = useState("");
  if (!order) return null;
  const event = data.events.find((item) => item.id === order.eventId);
  const schedule = data.schedules.find((item) => item.id === order.scheduleId);
  const venue = data.venues.find((item) => item.id === event?.venueId);
  const hall = data.halls.find((item) => item.id === event?.hallId);
  const orderTickets = data.tickets.filter((ticket) => ticket.orderId === order.id);
  const saveNote = () => {
    try {
      data.addOrderNote(order.id, note);
      toast.success("Дотоод тэмдэглэл хадгалагдлаа");
      setNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Тэмдэглэл хадгалсангүй");
    }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle>{order.orderNumber}</SheetTitle>
            <TicketStatusBadge
              value={order.orderStatus}
              label={orderStatusLabel[order.orderStatus]}
            />
            <TicketStatusBadge
              value={order.paymentStatus}
              label={paymentStatusLabel[order.paymentStatus]}
            />
          </div>
          <SheetDescription>Үүсгэсэн: {formatTicketDateTime(order.createdAt)}</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 py-5">
          <DetailSection title="Захиалагчийн мэдээлэл">
            <DetailGrid
              items={[
                ["Овог нэр", order.customer.name],
                ["Утас", order.customer.phone],
                ["И-мэйл", order.customer.email],
                ["Байгууллага", order.customer.company ?? "—"],
              ]}
            />
          </DetailSection>
          <DetailSection title="Арга хэмжээ">
            <div className="flex gap-3">
              <div
                className="h-20 w-28 shrink-0 rounded-xl"
                style={{ backgroundColor: event?.imageColor ?? "#3157A4" }}
              />
              <DetailGrid
                items={[
                  ["Арга хэмжээ", event?.name ?? "—"],
                  ["Байршил", venue?.name ?? "—"],
                  ["Танхим", hall?.name ?? "—"],
                  ["Эхлэх хугацаа", schedule ? formatTicketDateTime(schedule.startAt) : "—"],
                ]}
              />
            </div>
          </DetailSection>
          <DetailSection title={`Тасалбар (${orderTickets.length})`}>
            <div className="space-y-2">
              {orderTickets.map((ticket) => {
                const type = data.ticketTypes.find((item) => item.id === ticket.ticketTypeId);
                const gate = data.gates.find((item) => item.id === ticket.scannedGateId);
                return (
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-border bg-surface-muted/35 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs font-bold">{ticket.ticketCode}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {type?.name} · {ticket.section}{" "}
                          {ticket.row
                            ? `· ${ticket.row} эгнээ · ${ticket.seat} суудал`
                            : ticket.standingZone
                              ? `· ${ticket.standingZone}`
                              : ""}
                        </p>
                      </div>
                      <TicketStatusBadge
                        value={ticket.status}
                        label={issuedTicketStatusLabel[ticket.status]}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                      <span>
                        {ticket.scannedAt
                          ? `${formatTicketDateTime(ticket.scannedAt)} · ${gate?.name ?? "Хаалга"}`
                          : "Уншуулаагүй"}
                      </span>
                      <strong className="text-foreground">{ticketMoney(ticket.price)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </DetailSection>
          <DetailSection title="Төлбөр">
            <DetailGrid
              items={[
                ["Үндсэн үнэ", ticketMoney(order.subtotal)],
                ["Хөнгөлөлт", ticketMoney(order.discount)],
                ["Үйлчилгээний шимтгэл", ticketMoney(order.serviceFee)],
                ["Нийт", ticketMoney(order.total)],
                ["Төлбөрийн арга", order.paymentMethod],
                ["Гүйлгээний дугаар", order.transactionId ?? "—"],
                ["Төлсөн огноо", order.paymentDate ? formatTicketDateTime(order.paymentDate) : "—"],
                ["Буцаалтын дүн", ticketMoney(order.refundAmount)],
              ]}
            />
          </DetailSection>
          <DetailSection title="Үйл ажиллагааны түүх">
            <div className="space-y-0">
              {order.activity
                .slice()
                .reverse()
                .map((activity, index) => (
                  <div key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">
                    <span className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--brand)] ring-4 ring-brand-soft" />
                    {index < order.activity.length - 1 && (
                      <span className="absolute bottom-0 left-[4px] top-3 w-px bg-border" />
                    )}
                    <div>
                      <p className="text-xs font-semibold">{activity.action}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatTicketDateTime(activity.createdAt)} · {activity.actor}
                      </p>
                      {activity.note && (
                        <p className="mt-1 text-xs text-muted-foreground">{activity.note}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </DetailSection>
          <DetailSection title="Админ тэмдэглэл">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={order.adminNote || "Дотоод тэмдэглэл бичих..."}
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={saveNote} disabled={!note.trim()}>
                Тэмдэглэл хадгалах
              </Button>
            </div>
          </DetailSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
function DetailGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <p className="text-[10px] text-muted-foreground">{label}</p>
          <p className="truncate text-xs font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ManualOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = useTicketData();
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [eventId, setEventId] = useState(data.events[0]?.id ?? "");
  const availableSchedules = data.schedules.filter((schedule) => schedule.eventId === eventId);
  const availableTypes = data.ticketTypes.filter((type) => type.eventId === eventId && type.active);
  const [scheduleId, setScheduleId] = useState(availableSchedules[0]?.id ?? "");
  const [ticketTypeId, setTicketTypeId] = useState(availableTypes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Картын терминал");
  const [salesChannel, setSalesChannel] = useState<"box-office" | "phone" | "complimentary">(
    "box-office",
  );
  const [reason, setReason] = useState("");
  const selectedEvent = data.events.find((event) => event.id === eventId);
  const selectedSchedule = data.schedules.find((schedule) => schedule.id === scheduleId);
  const selectedType = data.ticketTypes.find((type) => type.id === ticketTypeId);
  const next = () => {
    if (step === 1 && (!eventId || !scheduleId))
      return toast.error("Арга хэмжээ болон хуваарь сонгоно уу");
    if (step === 2 && (!ticketTypeId || quantity < 1))
      return toast.error("Тасалбарын төрөл, тоог шалгана уу");
    if (step === 3 && (!name.trim() || !phone.trim()))
      return toast.error("Захиалагчийн нэр, утас шаардлагатай");
    if (step === 4 && salesChannel === "complimentary" && !reason.trim())
      return toast.error("Үнэгүй тасалбарын шалтгаан шаардлагатай");
    setStep((current) => Math.min(5, current + 1));
  };
  const submit = () => {
    try {
      data.createManualOrder({
        eventId,
        scheduleId,
        ticketTypeId,
        quantity,
        customer: { name, phone, email },
        paymentMethod: salesChannel === "complimentary" ? "Үнэгүй тасалбар" : paymentMethod,
        salesChannel,
        complimentaryReason: reason,
        createdBy: session?.name ?? "Админ",
      });
      toast.success("Гар захиалга амжилттай үүслээ");
      onOpenChange(false);
      setStep(1);
      setName("");
      setPhone("");
      setEmail("");
      setReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Захиалга үүссэнгүй");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Гар захиалга үүсгэх</DialogTitle>
          <DialogDescription>
            Касс болон утсаар ирсэн захиалгыг 5 алхмаар бүртгэнэ.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-1.5">
          {["Арга хэмжээ", "Тасалбар", "Захиалагч", "Төлбөр", "Хянах"].map((label, index) => (
            <div key={label} className="text-center">
              <div
                className={`h-1.5 rounded-full ${index + 1 <= step ? "bg-[var(--brand)]" : "bg-secondary"}`}
              />
              <p className="mt-1 truncate text-[9px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="min-h-64 rounded-2xl border border-border bg-surface-muted/25 p-4">
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Арга хэмжээ">
                <Select
                  value={eventId}
                  onValueChange={(value) => {
                    setEventId(value);
                    const schedule = data.schedules.find((item) => item.eventId === value);
                    const type = data.ticketTypes.find(
                      (item) => item.eventId === value && item.active,
                    );
                    setScheduleId(schedule?.id ?? "");
                    setTicketTypeId(type?.id ?? "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.events
                      .filter((event) => event.status !== "cancelled")
                      .map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label="Хуваарь">
                <Select value={scheduleId} onValueChange={setScheduleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Хуваарь сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSchedules.map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {formatTicketDateTime(schedule.startAt)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Тасалбарын төрөл">
                <Select value={ticketTypeId} onValueChange={setTicketTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Төрөл сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} · {ticketMoney(type.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label="Тоо ширхэг">
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
              </FormRow>
              <div className="sm:col-span-2 rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
                Суудалтай төрөлд demo repository дараагийн боломжтой дугаарыг онооно. Production
                суудал сонголт, hold энэ phase-д байхгүй.
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Захиалагчийн нэр">
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </FormRow>
              <FormRow label="Утас">
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </FormRow>
              <FormRow label="И-мэйл">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FormRow>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow label="Борлуулалтын суваг">
                  <Select
                    value={salesChannel}
                    onValueChange={(value) => setSalesChannel(value as typeof salesChannel)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="box-office">Касс</SelectItem>
                      <SelectItem value="phone">Утас</SelectItem>
                      {data.can("ticket.complimentary.create") && (
                        <SelectItem value="complimentary">Үнэгүй тасалбар</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormRow>
                <FormRow label="Төлбөрийн арга">
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    disabled={salesChannel === "complimentary"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Бэлэн мөнгө">Бэлэн мөнгө</SelectItem>
                      <SelectItem value="Банкны шилжүүлэг">Банкны шилжүүлэг</SelectItem>
                      <SelectItem value="Картын терминал">Картын терминал</SelectItem>
                    </SelectContent>
                  </Select>
                </FormRow>
              </div>
              {salesChannel === "complimentary" && (
                <FormRow label="Үнэгүй тасалбарын шалтгаан">
                  <Textarea value={reason} onChange={(event) => setReason(event.target.value)} />
                </FormRow>
              )}
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <DetailGrid
                items={[
                  ["Арга хэмжээ", selectedEvent?.name ?? "—"],
                  [
                    "Хуваарь",
                    selectedSchedule ? formatTicketDateTime(selectedSchedule.startAt) : "—",
                  ],
                  ["Тасалбар", `${selectedType?.name ?? "—"} × ${quantity}`],
                  ["Захиалагч", `${name} · ${phone}`],
                  ["Төлбөр", salesChannel === "complimentary" ? "Үнэгүй тасалбар" : paymentMethod],
                  [
                    "Нийт",
                    ticketMoney(
                      salesChannel === "complimentary" ? 0 : (selectedType?.price ?? 0) * quantity,
                    ),
                  ],
                ]}
              />
              {salesChannel === "complimentary" && (
                <p className="rounded-xl bg-brand-soft p-3 text-xs text-[var(--brand)]">
                  Шалтгаан: {reason}
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => (step === 1 ? onOpenChange(false) : setStep((current) => current - 1))}
          >
            {step === 1 ? (
              "Болих"
            ) : (
              <>
                <ChevronLeft /> Өмнөх
              </>
            )}
          </Button>
          {step < 5 ? (
            <Button onClick={next}>
              Дараах <ChevronRight />
            </Button>
          ) : (
            <Button onClick={submit}>Захиалга баталгаажуулах</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
