import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarCheck2,
  CheckCircle2,
  IdCard,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  XCircle,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState, PageHeader, formatDateShort, money } from "../ui";
import { CustomerDrawer } from "../CustomerDrawer";
import { AddCustomerModal } from "../AddCustomerModal";

type CustomerFilter = "all" | "frequent" | "high-spend" | "recent" | "high-points";
type CustomerSort = "lastVisit" | "totalBookings" | "totalSpend" | "loyaltyPoints" | "name";
type SortDirection = "asc" | "desc";

const CUSTOMER_FILTER_LABELS: Record<CustomerFilter, string> = {
  all: "Бүх хэрэглэгч",
  frequent: "10+ захиалгатай",
  "high-spend": "₮500,000+ зарцуулсан",
  recent: "Сүүлийн 7 хоногт ирсэн",
  "high-points": "300+ оноотой",
};

const CUSTOMER_SORT_LABELS: Record<CustomerSort, string> = {
  lastVisit: "Сүүлд үйлчлүүлсэн",
  totalBookings: "Захиалгын тоо",
  totalSpend: "Зарцуулсан мөнгө",
  loyaltyPoints: "Хэрэглэгчийн оноо",
  name: "Нэр",
};

export function CustomersPage() {
  const { customers } = useDashboardData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [sortBy, setSortBy] = useState<CustomerSort>("lastVisit");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const bookingSummary = useMemo(
    () =>
      customers.reduce(
        (summary, customer) => ({
          total: summary.total + customer.totalBookings,
          completed: summary.completed + customer.completedBookings,
          cancelled: summary.cancelled + customer.cancelledBookings,
        }),
        { total: 0, completed: 0, cancelled: 0 },
      ),
    [customers],
  );

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("mn-MN");
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString().slice(0, 10);
    const todayISO = today.toISOString().slice(0, 10);

    const result = customers.filter((customer) => {
      const matchesSearch = `${customer.name} ${customer.phone} ${customer.email}`
        .toLocaleLowerCase("mn-MN")
        .includes(normalizedSearch);

      if (!matchesSearch) return false;
      if (filter === "frequent") return customer.totalBookings >= 10;
      if (filter === "high-spend") return customer.totalSpend >= 500_000;
      if (filter === "recent")
        return customer.lastVisit >= sevenDaysAgoISO && customer.lastVisit <= todayISO;
      if (filter === "high-points") return customer.loyaltyPoints >= 300;
      return true;
    });

    return result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") comparison = a.name.localeCompare(b.name, "mn-MN");
      if (sortBy === "lastVisit") comparison = a.lastVisit.localeCompare(b.lastVisit);
      if (sortBy === "totalBookings") comparison = a.totalBookings - b.totalBookings;
      if (sortBy === "totalSpend") comparison = a.totalSpend - b.totalSpend;
      if (sortBy === "loyaltyPoints") comparison = a.loyaltyPoints - b.loyaltyPoints;

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [customers, filter, search, sortBy, sortDirection]);

  const hasActiveControls =
    search.trim().length > 0 ||
    filter !== "all" ||
    sortBy !== "lastVisit" ||
    sortDirection !== "desc";

  const resetControls = () => {
    setSearch("");
    setFilter("all");
    setSortBy("lastVisit");
    setSortDirection("desc");
  };

  const completedPercentage = bookingSummary.total
    ? Math.round((bookingSummary.completed / bookingSummary.total) * 100)
    : 0;
  const cancelledPercentage = bookingSummary.total
    ? Math.round((bookingSummary.cancelled / bookingSummary.total) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Хэрэглэгчид"
        description="Үйлчлүүлэгчдийн мэдээлэл, захиалгын түүх, урамшууллыг удирдана."
        actions={
          <Button onClick={() => setAddOpen(true)} className="gap-1.5 rounded-lg">
            <Plus className="h-4 w-4" /> Хэрэглэгч нэмэх
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<CalendarCheck2 className="h-4 w-4" />}
          label="Нийт захиалга"
          value={bookingSummary.total}
          detail={`${customers.length} хэрэглэгчийн захиалга`}
          tone="brand"
        />
        <SummaryCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Дууссан захиалга"
          value={bookingSummary.completed}
          detail={`Нийт захиалгын ${completedPercentage}%`}
          tone="success"
        />
        <SummaryCard
          icon={<XCircle className="h-4 w-4" />}
          label="Цуцалсан захиалга"
          value={bookingSummary.cancelled}
          detail={`Нийт захиалгын ${cancelledPercentage}%`}
          tone="danger"
        />
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/70 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Нэр, утас, и-мэйлээр хайх"
              className="h-9 pl-8 text-sm"
            />
          </div>

          <Select value={filter} onValueChange={(value) => setFilter(value as CustomerFilter)}>
            <SelectTrigger className="h-9 w-full gap-2 text-xs sm:w-52">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Хэрэглэгч шүүх" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(CUSTOMER_FILTER_LABELS) as [CustomerFilter, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as CustomerSort)}>
            <SelectTrigger className="h-9 w-full text-xs sm:w-48">
              <SelectValue placeholder="Эрэмбэлэх" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(CUSTOMER_SORT_LABELS) as [CustomerSort, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            onClick={() => setSortDirection((current) => (current === "desc" ? "asc" : "desc"))}
            className="h-9 min-w-28 gap-1.5 rounded-lg text-xs"
          >
            {sortDirection === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" />
            )}
            {sortDirection === "desc" ? "Ихээс бага" : "Багаас их"}
          </Button>

          {hasActiveControls && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={resetControls}
              aria-label="Шүүлт цэвэрлэх"
              className="h-9 w-9 rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <p className="mt-2 px-0.5 text-[11px] text-muted-foreground">
          {filtered.length} хэрэглэгч харагдаж байна
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IdCard className="h-6 w-6" />}
          title={customers.length === 0 ? "Хэрэглэгч алга байна" : "Илэрц олдсонгүй"}
          description="Хайлт эсвэл шүүлтээ өөрчилж дахин оролдоно уу."
          action={
            hasActiveControls ? (
              <Button variant="outline" onClick={resetControls} className="gap-1.5 rounded-lg">
                <RotateCcw className="h-3.5 w-3.5" />
                Шүүлт цэвэрлэх
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border/80 bg-surface/80 shadow-sm lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Нэр</TableHead>
                  <TableHead>Утас</TableHead>
                  <TableHead>Захиалга</TableHead>
                  <TableHead>Дууссан</TableHead>
                  <TableHead>Цуцалсан</TableHead>
                  <TableHead>Зарцуулсан</TableHead>
                  <TableHead>Сүүлд ирсэн</TableHead>
                  <TableHead>Оноо</TableHead>
                  <TableHead>Шошго</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => setDrawerId(customer.id)}
                  >
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                    <TableCell>{customer.totalBookings}</TableCell>
                    <TableCell>{customer.completedBookings}</TableCell>
                    <TableCell>{customer.cancelledBookings}</TableCell>
                    <TableCell>{money(customer.totalSpend)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateShort(customer.lastVisit)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        {customer.loyaltyPoints}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2.5 lg:hidden">
            {filtered.map((customer) => (
              <button
                key={customer.id}
                onClick={() => setDrawerId(customer.id)}
                className="block w-full rounded-xl border border-border/80 bg-surface/80 p-3.5 text-left shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold">{customer.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{customer.phone}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <MobileMetric label="Захиалга" value={customer.totalBookings} />
                  <MobileMetric label="Зарцуулсан" value={money(customer.totalSpend)} />
                  <MobileMetric label="Сүүлд ирсэн" value={formatDateShort(customer.lastVisit)} />
                  <MobileMetric
                    label="Оноо"
                    value={
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {customer.loyaltyPoints}
                      </span>
                    }
                  />
                </div>
                {customer.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <CustomerDrawer customerId={drawerId} onOpenChange={setDrawerId} />
      <AddCustomerModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  tone: "brand" | "success" | "danger";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface/80 p-4 shadow-sm">
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          tone === "brand" && "bg-brand-soft text-[var(--brand-2)]",
          tone === "success" &&
            "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]",
          tone === "danger" && "bg-destructive/10 text-destructive",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xl font-extrabold tabular-nums">{value.toLocaleString("mn-MN")}</p>
        <p className="text-xs font-semibold">{label}</p>
        <p className="truncate text-[10px] text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function MobileMetric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-surface-muted/50 px-2.5 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <div className="mt-0.5 font-semibold text-foreground">{value}</div>
    </div>
  );
}
