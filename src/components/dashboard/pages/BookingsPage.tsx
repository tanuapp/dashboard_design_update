import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  ArrowUpDown,
  MoreHorizontal,
  ClipboardList,
  CalendarRange,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import type { Booking, BookingStatus } from "@/lib/dashboard/types";
import { bookingStatusLabel } from "@/lib/dashboard/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookingStatusBadge,
  EmptyState,
  PageHeader,
  PaymentStateBadge,
  formatDateShort,
  money,
} from "../ui";
import { BookingDrawer } from "../BookingDrawer";

const PAGE_SIZE = 8;

type SortKey = "date" | "price" | "customer";

export function BookingsPage() {
  const { session } = useAuth();
  const { bookings, employees, services, selectedBranchId, setSelectedBranchId, cancelBooking } =
    useDashboardData();
  const isEmployee = session?.role === "employee";
  const me = isEmployee ? employees.find((e) => e.name === session?.name) : undefined;

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState(me?.id ?? "all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [page, setPage] = useState(1);
  const [drawerBookingId, setDrawerBookingId] = useState<string | null>(null);

  const hasActiveFilters =
    search.length > 0 ||
    dateFrom.length > 0 ||
    dateTo.length > 0 ||
    selectedBranchId !== "all" ||
    employeeFilter !== (me?.id ?? "all") ||
    serviceFilter !== "all" ||
    statusFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSelectedBranchId("all");
    setEmployeeFilter(me?.id ?? "all");
    setServiceFilter("all");
    setStatusFilter("all");
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  const base = useMemo(
    () => (isEmployee && me ? bookings.filter((b) => b.employeeId === me.id) : bookings),
    [bookings, isEmployee, me],
  );

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: base.length,
      today: base.filter((b) => b.date === today).length,
      upcoming: base.filter((b) => b.status === "upcoming").length,
      completed: base.filter((b) => b.status === "completed").length,
      cancelled: base.filter((b) => b.status === "cancelled").length,
      noShow: base.filter((b) => b.status === "no-show").length,
    };
  }, [base]);

  const filtered = useMemo(() => {
    return base.filter((b) => {
      if (
        search &&
        !`${b.code} ${b.customerName} ${b.customerPhone}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      if (dateFrom && b.date < dateFrom) return false;
      if (dateTo && b.date > dateTo) return false;
      if (selectedBranchId !== "all" && b.branchId !== selectedBranchId) return false;
      if (employeeFilter !== "all" && b.employeeId !== employeeFilter) return false;
      if (serviceFilter !== "all" && b.serviceId !== serviceFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      return true;
    });
  }, [
    base,
    search,
    dateFrom,
    dateTo,
    selectedBranchId,
    employeeFilter,
    serviceFilter,
    statusFilter,
  ]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sort.key === "date") cmp = (a.date + a.startTime).localeCompare(b.date + b.startTime);
      else if (sort.key === "price") cmp = a.price - b.price;
      else cmp = a.customerName.localeCompare(b.customerName);
      return cmp * sort.dir;
    });
    return arr;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(
    () => setPage(1),
    [search, dateFrom, dateTo, selectedBranchId, employeeFilter, serviceFilter, statusFilter],
  );

  const toggleSort = (key: SortKey) =>
    setSort((p) => (p.key === key ? { key, dir: p.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const exportCsv = () => {
    const header = [
      "Захиалгын дугаар",
      "Огноо",
      "Цаг",
      "Хэрэглэгч",
      "Үйлчилгээ",
      "Ажилтан",
      "Салбар",
      "Үнэ",
      "Төлбөр",
      "Төлөв",
    ];
    const rows = sorted.map((b) => [
      b.code,
      b.date,
      b.startTime,
      b.customerName,
      b.serviceName,
      b.employeeName,
      b.branchName,
      String(b.price),
      b.paymentState,
      b.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tanu-zahialguud-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chips: { label: string; value: number; onClick: () => void }[] = [
    { label: "Нийт", value: summary.total, onClick: () => setStatusFilter("all") },
    {
      label: "Өнөөдөр",
      value: summary.today,
      onClick: () => {
        setDateFrom(new Date().toISOString().slice(0, 10));
        setDateTo(new Date().toISOString().slice(0, 10));
      },
    },
    { label: "Удахгүй", value: summary.upcoming, onClick: () => setStatusFilter("upcoming") },
    { label: "Дууссан", value: summary.completed, onClick: () => setStatusFilter("completed") },
    { label: "Цуцлагдсан", value: summary.cancelled, onClick: () => setStatusFilter("cancelled") },
    { label: "Ирээгүй", value: summary.noShow, onClick: () => setStatusFilter("no-show") },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={isEmployee ? "Миний захиалгууд" : "Захиалгууд"}
        description="Бүх захиалгыг нэг дороос хайж, шүүж, удирдана."
        actions={
          <Button variant="outline" className="gap-1.5 rounded-lg" onClick={exportCsv}>
            <Download className="h-4 w-4" /> CSV татах
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="rounded-xl border border-border/80 bg-surface/80 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)]/25"
          >
            <p className="text-lg font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/80 p-3 shadow-sm">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft text-[var(--brand-2)]">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-xs font-semibold">Хайлт ба шүүлтүүр</p>
              <p className="text-[10px] text-muted-foreground">{sorted.length} захиалга олдлоо</p>
            </div>
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Цэвэрлэх
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block min-w-0">
            <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Search className="h-3 w-3" />
              Нэр, дугаар, утсаар хайх
            </span>
            <div className="relative min-w-0">
              <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Нэр, дугаар, утас"
                className="h-9 w-full pl-8 text-xs"
              />
            </div>
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <CalendarRange className="h-3 w-3" />
              Эхлэх огноо
            </span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-9 w-full min-w-0 px-2 text-xs"
              aria-label="Эхлэх огноо"
              title="Эхлэх огноо"
            />
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <CalendarRange className="h-3 w-3" />
              Дуусах огноо
            </span>
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="h-9 w-full min-w-0 px-2 text-xs"
              aria-label="Дуусах огноо"
              title="Дуусах огноо"
            />
          </label>

          {!isEmployee && (
            <div className="min-w-0">
              <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                Ажилтан
              </span>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue placeholder="Ажилтан" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх ажилтан</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
              Үйлчилгээ
            </span>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue placeholder="Үйлчилгээ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх үйлчилгээ</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0">
            <span className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
              Захиалгын төлөв
            </span>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
            >
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue placeholder="Төлөв" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх төлөв</SelectItem>
                {(Object.keys(bookingStatusLabel) as BookingStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {bookingStatusLabel[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 rounded-2xl border border-border/80 bg-surface/80 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title={base.length === 0 ? "Захиалга алга байна" : "Илэрц олдсонгүй"}
          description={
            base.length === 0
              ? "Шинэ захиалга нэмэгдмэгц энд харагдана."
              : "Шүүлтүүрээ өөрчлөөд дахин оролдоно уу."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border/80 bg-surface/80 shadow-sm lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Захиалгын дугаар</TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort("date")}
                      className="inline-flex items-center gap-1"
                    >
                      Огноо, цаг <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort("customer")}
                      className="inline-flex items-center gap-1"
                    >
                      Хэрэглэгч <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Үйлчилгээ</TableHead>
                  <TableHead>Ажилтан</TableHead>
                  <TableHead>Салбар</TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort("price")}
                      className="inline-flex items-center gap-1"
                    >
                      Үнэ <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Төлбөр</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead className="text-right">Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((b) => (
                  <TableRow
                    key={b.id}
                    className="cursor-pointer"
                    onClick={() => setDrawerBookingId(b.id)}
                  >
                    <TableCell className="font-mono text-xs">{b.code}</TableCell>
                    <TableCell className="text-xs">
                      {formatDateShort(b.date)} · {b.startTime}
                    </TableCell>
                    <TableCell className="font-medium">{b.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">{b.serviceName}</TableCell>
                    <TableCell className="text-muted-foreground">{b.employeeName}</TableCell>
                    <TableCell className="text-muted-foreground">{b.branchName}</TableCell>
                    <TableCell>{money(b.price)}</TableCell>
                    <TableCell>
                      <PaymentStateBadge state={b.paymentState} />
                    </TableCell>
                    <TableCell>
                      <BookingStatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="grid h-7 w-7 place-items-center rounded-md hover:bg-secondary"
                            aria-label="Нэмэлт үйлдэл"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDrawerBookingId(b.id)}>
                            Дэлгэрэнгүй харах
                          </DropdownMenuItem>
                          {b.status !== "cancelled" && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => cancelBooking(b.id)}
                            >
                              Цуцлах
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2.5 lg:hidden">
            {pageRows.map((b) => (
              <button
                key={b.id}
                onClick={() => setDrawerBookingId(b.id)}
                className="block w-full rounded-xl border border-border/80 bg-surface/80 p-3.5 text-left shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{b.code}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="mt-1.5 font-semibold">{b.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {b.serviceName} · {b.employeeName}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span>
                    {formatDateShort(b.date)} · {b.startTime}
                  </span>
                  <span className="font-semibold">{money(b.price)}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {sorted.length} захиалгаас {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, sorted.length)}-г харуулж байна
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-md px-2 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Өмнөх
              </Button>
              <span>
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-md px-2 text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Дараах
              </Button>
            </div>
          </div>
        </>
      )}

      <BookingDrawer bookingId={drawerBookingId} onOpenChange={setDrawerBookingId} />
    </div>
  );
}
