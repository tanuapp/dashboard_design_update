import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PageHeader, formatDateShort, money } from "../ui";

const WEEKDAYS = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"];

export function ReportsPage() {
  const { revenueHistory, bookings, services, employees, branches, customers } = useDashboardData();
  const [dateFrom, setDateFrom] = useState(revenueHistory[Math.max(0, revenueHistory.length - 30)]?.date ?? "");
  const [dateTo, setDateTo] = useState(revenueHistory[revenueHistory.length - 1]?.date ?? "");
  const [branchFilter, setBranchFilter] = useState("all");

  const exportMock = (label: string) => toast.success(`${label} экспортлогдлоо`, { description: "Демо горим — жинхэнэ файл татагдаагүй." });

  const rangeHistory = useMemo(() => revenueHistory.filter((p) => (!dateFrom || p.date >= dateFrom) && (!dateTo || p.date <= dateTo)), [revenueHistory, dateFrom, dateTo]);
  const scopedBookings = useMemo(
    () => bookings.filter((b) => (!dateFrom || b.date >= dateFrom) && (!dateTo || b.date <= dateTo) && (branchFilter === "all" || b.branchId === branchFilter)),
    [bookings, dateFrom, dateTo, branchFilter],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Тайлан" description="Дэлгэрэнгүй, шинжилгээт тайлангууд." />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-surface/80 p-3">
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 w-auto text-xs" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 w-auto text-xs" />
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Салбар" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх салбар</SelectItem>
            {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="flex-wrap">
          <TabsTrigger value="sales">Борлуулалт</TabsTrigger>
          <TabsTrigger value="bookings">Захиалга</TabsTrigger>
          <TabsTrigger value="services">Үйлчилгээ</TabsTrigger>
          <TabsTrigger value="customers">Хэрэглэгч</TabsTrigger>
          <TabsTrigger value="employees">Ажилтан</TabsTrigger>
          <TabsTrigger value="branches">Салбар</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <ReportCard title="Орлогын түүх" onExport={() => exportMock("Борлуулалтын тайлан")}>
            {rangeHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">Сонгосон хугацаанд өгөгдөл алга.</p>
            ) : (
              <ChartContainer config={{ revenue: { label: "Орлого", color: "var(--brand)" } }} className="aspect-auto h-64 w-full">
                <BarChart data={rangeHistory}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDateShort} tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => formatDateShort(String(v))} formatter={(v) => [money(Number(v)), "Орлого"]} />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </ReportCard>
          <ReportCard title="Өдрөөр нэгтгэсэн орлого" onExport={() => exportMock("Өдрийн орлогын тайлан")}>
            <Table>
              <TableHeader><TableRow><TableHead>Огноо</TableHead><TableHead>Захиалга</TableHead><TableHead>Орлого</TableHead></TableRow></TableHeader>
              <TableBody>
                {rangeHistory.slice(-10).reverse().map((p) => (
                  <TableRow key={p.date}><TableCell>{formatDateShort(p.date)}</TableCell><TableCell>{p.bookings}</TableCell><TableCell>{money(p.revenue)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <ReportCard title="Төлөвөөр хуваарилалт" onExport={() => exportMock("Захиалгын тайлан")}>
            <StatusBreakdown bookings={scopedBookings} />
          </ReportCard>
          <ReportCard title="Гарагаар захиалгын идэвх">
            <WeekdayBreakdown bookings={scopedBookings} />
          </ReportCard>
        </TabsContent>

        <TabsContent value="services">
          <ReportCard title="Үйлчилгээ тус бүрийн гүйцэтгэл" onExport={() => exportMock("Үйлчилгээний тайлан")}>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Үйлчилгээ</TableHead><TableHead>Захиалга</TableHead><TableHead>Орлого</TableHead><TableHead>Үнэлгээ</TableHead><TableHead>Чиг хандлага</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {[...services].sort((a, b) => b.revenue - a.revenue).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.bookingCount}</TableCell>
                    <TableCell>{money(s.revenue)}</TableCell>
                    <TableCell>{s.rating} ★</TableCell>
                    <TableCell className={s.trend >= 0 ? "text-[var(--success)]" : "text-destructive"}>{s.trend >= 0 ? "+" : ""}{s.trend}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <ReportCard title="Топ хэрэглэгчид (зарцуулгаар)" onExport={() => exportMock("Хэрэглэгчийн тайлан")}>
            <Table>
              <TableHeader><TableRow><TableHead>Нэр</TableHead><TableHead>Захиалга</TableHead><TableHead>Зарцуулсан</TableHead><TableHead>Оноо</TableHead></TableRow></TableHeader>
              <TableBody>
                {[...customers].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 8).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.totalBookings}</TableCell>
                    <TableCell>{money(c.totalSpend)}</TableCell>
                    <TableCell>{c.loyaltyPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="employees">
          <ReportCard title="Ажилтны гүйцэтгэл" onExport={() => exportMock("Ажилтны тайлан")}>
            <Table>
              <TableHeader><TableRow><TableHead>Ажилтан</TableHead><TableHead>Захиалга</TableHead><TableHead>Орлого</TableHead><TableHead>Үнэлгээ</TableHead></TableRow></TableHeader>
              <TableBody>
                {employees.map((e) => {
                  const mine = bookings.filter((b) => b.employeeId === e.id && b.status === "completed");
                  const revenue = mine.reduce((s, b) => s + b.price, 0);
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{mine.length}</TableCell>
                      <TableCell>{money(revenue)}</TableCell>
                      <TableCell>{e.rating} ★</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>

        <TabsContent value="branches">
          <ReportCard title="Салбарын харьцуулалт" onExport={() => exportMock("Салбарын тайлан")}>
            <Table>
              <TableHeader><TableRow><TableHead>Салбар</TableHead><TableHead>Өнөөдрийн захиалга</TableHead><TableHead>Сарын орлого</TableHead><TableHead>Ажилтан</TableHead></TableRow></TableHeader>
              <TableBody>
                {branches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.todayBookings}</TableCell>
                    <TableCell>{money(b.monthlyRevenue)}</TableCell>
                    <TableCell>{b.employeeIds.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportCard({ title, onExport, children }: { title: string; onExport?: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {onExport && (
          <Button size="sm" variant="outline" className="h-7 gap-1 rounded-md text-xs" onClick={onExport}>
            <Download className="h-3 w-3" /> Экспорт
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

function StatusBreakdown({ bookings }: { bookings: ReturnType<typeof useDashboardData>["bookings"] }) {
  const statuses = ["upcoming", "arrived", "in-service", "completed", "cancelled", "no-show"] as const;
  const labels: Record<string, string> = { upcoming: "Удахгүй", arrived: "Ирсэн", "in-service": "Эхэлсэн", completed: "Дууссан", cancelled: "Цуцлагдсан", "no-show": "Ирээгүй" };
  const total = bookings.length || 1;
  return (
    <div className="space-y-2.5">
      {statuses.map((s) => {
        const count = bookings.filter((b) => b.status === s).length;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={s}>
            <div className="mb-1 flex justify-between text-xs"><span>{labels[s]}</span><span className="text-muted-foreground">{count} · {pct}%</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

function WeekdayBreakdown({ bookings }: { bookings: ReturnType<typeof useDashboardData>["bookings"] }) {
  const counts = new Array(7).fill(0);
  bookings.forEach((b) => {
    const day = new Date(`${b.date}T00:00:00`).getDay();
    counts[day] += 1;
  });
  const max = Math.max(1, ...counts);
  return (
    <div className="flex h-40 items-end gap-2">
      {counts.map((c, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-32 w-full items-end">
            <div className="w-full rounded-t bg-gradient-brand" style={{ height: `${(c / max) * 100}%`, minHeight: c > 0 ? 4 : 0 }} />
          </div>
          <span className="text-[10px] text-muted-foreground">{WEEKDAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}
