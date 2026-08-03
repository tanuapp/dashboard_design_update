import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Wallet, CircleCheck, CircleDollarSign, Undo2 } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, StatCard, money } from "../ui";

const PAYMENT_METHODS = ["Бэлэн", "Карт", "QPay", "Дансаар шилжүүлэх"];
function methodFor(id: string) {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return PAYMENT_METHODS[sum % PAYMENT_METHODS.length];
}

export function FinancePage() {
  const { bookings, branches, services, employees } = useDashboardData();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");

  const scoped = useMemo(
    () =>
      bookings.filter((b) => {
        if (dateFrom && b.date < dateFrom) return false;
        if (dateTo && b.date > dateTo) return false;
        if (branchFilter !== "all" && b.branchId !== branchFilter) return false;
        return true;
      }),
    [bookings, dateFrom, dateTo, branchFilter],
  );

  const real = scoped.filter((b) => b.status !== "cancelled" && b.status !== "no-show");
  const totalRevenue = real.reduce((s, b) => s + b.price, 0);
  const paid = scoped.filter((b) => b.paymentState === "paid").reduce((s, b) => s + b.price, 0);
  const unpaid = scoped.filter((b) => b.paymentState === "unpaid").reduce((s, b) => s + b.price, 0);
  const partial = scoped.filter((b) => b.paymentState === "partial").reduce((s, b) => s + b.price, 0);
  const refunded = scoped.filter((b) => b.paymentState === "refunded").reduce((s, b) => s + b.price, 0);
  const avg = real.length ? Math.round(totalRevenue / real.length) : 0;

  const byBranch = useMemo(() => {
    const map = new Map<string, number>();
    real.forEach((b) => map.set(b.branchName, (map.get(b.branchName) ?? 0) + b.price));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [real]);

  const byService = useMemo(() => [...services].sort((a, b) => b.revenue - a.revenue).slice(0, 6), [services]);

  const byEmployee = useMemo(() => {
    const map = new Map<string, number>();
    real.forEach((b) => map.set(b.employeeName, (map.get(b.employeeName) ?? 0) + b.price));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [real]);

  const byMethod = useMemo(() => {
    const map = new Map<string, number>();
    real.forEach((b) => {
      const m = methodFor(b.id);
      map.set(m, (map.get(m) ?? 0) + b.price);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [real]);

  const maxBranch = Math.max(1, ...byBranch.map(([, v]) => v));
  const maxEmployee = Math.max(1, ...byEmployee.map(([, v]) => v));
  const maxMethod = Math.max(1, ...byMethod.map(([, v]) => v));

  const exportMock = (label: string) => toast.success(`${label} экспорт хийгдлээ`, { description: "Демо горим — жинхэнэ файл татагдаагүй." });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Санхүү"
        description="Орлого, төлбөрийн байдал, буцаалтыг хянана."
        actions={
          <Button variant="outline" className="gap-1.5 rounded-lg" onClick={() => exportMock("Санхүүгийн тайлан")}>
            <Download className="h-4 w-4" /> Экспорт
          </Button>
        }
      />

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={<Wallet className="h-4 w-4" />} label="Нийт орлого" value={money(totalRevenue)} tooltip="Цуцлагдаагүй захиалгуудын нийт дүн." />
        <StatCard icon={<CircleCheck className="h-4 w-4" />} label="Төлөгдсөн" value={money(paid)} tooltip="Бүрэн төлөгдсөн захиалгын дүн." />
        <StatCard icon={<CircleDollarSign className="h-4 w-4" />} label="Төлөгдөөгүй" value={money(unpaid)} tooltip="Төлбөр хараахан хийгдээгүй захиалга." />
        <StatCard icon={<CircleDollarSign className="h-4 w-4" />} label="Хэсэгчлэн төлсөн" value={money(partial)} tooltip="Урьдчилгаа төлсөн боловч дуусаагүй захиалга." />
        <StatCard icon={<Undo2 className="h-4 w-4" />} label="Буцаалт" value={money(refunded)} tooltip="Цуцлагдсанаас үүссэн буцаалтын дүн." />
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
        <p className="text-xs text-muted-foreground">Дундаж захиалгын дүн</p>
        <p className="mt-1 text-2xl font-bold">{money(avg)}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BreakdownCard title="Салбараар орлого" data={byBranch} max={maxBranch} onExport={() => exportMock("Салбарын тайлан")} />
        <BreakdownCard title="Ажилтнаар орлого" data={byEmployee} max={maxEmployee} onExport={() => exportMock("Ажилтны тайлан")} />
        <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Үйлчилгээгээр орлого</h2>
            <Button size="sm" variant="outline" className="h-7 gap-1 rounded-md text-xs" onClick={() => exportMock("Үйлчилгээний тайлан")}>
              <Download className="h-3 w-3" /> Экспорт
            </Button>
          </div>
          <div className="space-y-2">
            {byService.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{s.name}</span>
                <span className="font-semibold">{money(s.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <BreakdownCard title="Төлбөрийн хэрэгслээр" data={byMethod} max={maxMethod} onExport={() => exportMock("Төлбөрийн тайлан")} />
      </div>
    </div>
  );
}

function BreakdownCard({ title, data, max, onExport }: { title: string; data: [string, number][]; max: number; onExport: () => void }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Button size="sm" variant="outline" className="h-7 gap-1 rounded-md text-xs" onClick={onExport}>
          <Download className="h-3 w-3" /> Экспорт
        </Button>
      </div>
      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground">Өгөгдөл алга байна.</p>
      ) : (
        <div className="space-y-3">
          {data.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{label}</span>
                <span className="text-muted-foreground">{money(value)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-gradient-brand" style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
