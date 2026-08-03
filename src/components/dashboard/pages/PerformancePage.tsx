import { useMemo } from "react";
import { Star, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { PageHeader, StatCard, money } from "../ui";

export function PerformancePage() {
  const { session } = useAuth();
  const { employees, bookings, services } = useDashboardData();
  const me = employees.find((e) => e.name === session?.name) ?? employees[0];

  const mine = bookings.filter((b) => b.employeeId === me.id);
  const completed = mine.filter((b) => b.status === "completed");
  const cancelled = mine.filter((b) => b.status === "cancelled" || b.status === "no-show");
  const revenue = completed.reduce((s, b) => s + b.price, 0);

  const last30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const iso = d.toISOString().slice(0, 10);
      const count = mine.filter((b) => b.date === iso && b.status === "completed").length;
      return { iso, count };
    });
  }, [mine]);
  const max = Math.max(1, ...last30.map((d) => d.count));

  const byService = useMemo(() => {
    const map = new Map<string, number>();
    completed.forEach((b) => map.set(b.serviceName, (map.get(b.serviceName) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [completed]);
  const maxService = Math.max(1, ...byService.map(([, v]) => v));

  const retentionRate = mine.length ? Math.round((completed.length / mine.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Миний гүйцэтгэл" description="Хувийн ажлын үр дүнгийн дэлгэрэнгүй." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Нийт дуусгасан" value={completed.length} tooltip="Таны амжилттай дуусгасан захиалгын нийт тоо." />
        <StatCard icon={<Wallet className="h-4 w-4" />} label="Бүтээсэн орлого" value={money(revenue)} tooltip="Таны дуусгасан захиалгуудын нийт үнийн дүн." />
        <StatCard icon={<Star className="h-4 w-4" />} label="Дундаж үнэлгээ" value={me.rating} tooltip="Үйлчлүүлэгчдийн өгсөн дундаж үнэлгээ." />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Гүйцэтгэлийн хувь" value={`${retentionRate}%`} tooltip="Амжилттай дуусгасан захиалгын харьцаа." deltaTone="up" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Сүүлийн 30 хоногийн идэвх</h2>
        <div className="flex h-32 items-end gap-1">
          {last30.map((d) => (
            <div key={d.iso} className="flex-1 rounded-t bg-gradient-brand" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 1 }} title={d.iso} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Үйлчилгээгээр хуваарилалт</h2>
        {byService.length === 0 ? (
          <p className="text-xs text-muted-foreground">Дуусгасан захиалга алга байна.</p>
        ) : (
          <div className="space-y-2.5">
            {byService.map(([name, count]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-xs"><span>{name}</span><span className="text-muted-foreground">{count}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-brand" style={{ width: `${(count / maxService) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cancelled.length > 0 && (
        <p className="text-xs text-muted-foreground">Цуцлагдсан/ирээгүй захиалга: {cancelled.length} · Нийт хариуцсан үйлчилгээ: {me.serviceIds.map((id) => services.find((s) => s.id === id)?.name).filter(Boolean).join(", ")}</p>
      )}
    </div>
  );
}
