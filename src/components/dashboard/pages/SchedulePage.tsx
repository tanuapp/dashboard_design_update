import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "../ui";
import { LeaveRequestModal } from "../LeaveRequestModal";

const weekdays = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"];

export function SchedulePage() {
  const { session } = useAuth();
  const { employees } = useDashboardData();
  const me = employees.find((e) => e.name === session?.name) ?? employees[0];
  const [leaveOpen, setLeaveOpen] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Чөлөө, хуваарь"
        description="Таны долоо хоногийн ажлын хуваарь болон чөлөөний хүсэлтүүд."
        actions={<Button onClick={() => setLeaveOpen(true)} className="gap-1.5 rounded-lg">Чөлөө хүсэх</Button>}
      />

      <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Долоо хоногийн ажлын цаг</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {weekdays.map((d, i) => (
            <div key={d} className="rounded-lg border border-border/70 bg-surface-muted/40 p-2.5 text-center text-xs">
              <p className="font-semibold">{d}</p>
              <p className="mt-1 text-muted-foreground">{i < 6 ? me.workingHours : "Амарна"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Чөлөөний хүсэлтүүд</h2>
        {me.leave.length === 0 ? (
          <EmptyState icon={<CalendarClock className="h-6 w-6" />} title="Одоогоор чөлөөний хүсэлт алга" action={<Button size="sm" onClick={() => setLeaveOpen(true)}>Чөлөө хүсэх</Button>} />
        ) : (
          <div className="space-y-2">
            {me.leave.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface-muted/40 p-3 text-sm">
                <div>
                  <p className="font-medium">{l.from} – {l.to}</p>
                  <p className="text-xs text-muted-foreground">{l.reason}</p>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    l.status === "approved"
                      ? "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]"
                      : l.status === "declined"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-[color-mix(in_oklch,var(--warning)_18%,transparent)] text-[var(--warning)]"
                  }`}
                >
                  {l.status === "approved" ? "Батлагдсан" : l.status === "declined" ? "Татгалзсан" : "Хүлээгдэж буй"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <LeaveRequestModal open={leaveOpen} onOpenChange={setLeaveOpen} employeeId={me.id} />
    </div>
  );
}
