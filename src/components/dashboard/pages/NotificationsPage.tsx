import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  BellRing,
  CalendarClock,
  CalendarX2,
  CalendarCheck2,
  Users,
  Settings2,
  Star,
  Trash2,
  Check,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import type { NotificationType } from "@/lib/dashboard/types";
import { notificationTypeLabel } from "@/lib/dashboard/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader } from "../ui";
import { cn } from "@/lib/utils";

const typeIcon: Record<NotificationType, typeof Bell> = {
  "new-booking": CalendarCheck2,
  "booking-changed": CalendarClock,
  "booking-cancelled": CalendarX2,
  upcoming: BellRing,
  "schedule-update": Users,
  system: Settings2,
  review: Star,
};

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useDashboardData();
  const [typeFilter, setTypeFilter] = useState<"all" | NotificationType>("all");
  const [prefs, setPrefs] = useState({ email: true, sms: true, push: true });

  const filtered = useMemo(
    () => (typeFilter === "all" ? notifications : notifications.filter((n) => n.type === typeFilter)),
    [notifications, typeFilter],
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Мэдэгдэл"
        description={`${unreadCount} уншаагүй мэдэгдэл байна.`}
        actions={
          <Button variant="outline" className="gap-1.5 rounded-lg" onClick={markAllNotificationsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4" /> Бүгдийг уншсан
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="h-9 w-56 text-sm"><SelectValue placeholder="Бүх төрөл" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх төрөл</SelectItem>
            {Object.entries(notificationTypeLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {filtered.length === 0 ? (
          <EmptyState icon={<Bell className="h-6 w-6" />} title="Мэдэгдэл алга байна" description="Шинэ мэдэгдэл ирэхэд энд харагдана." />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((n) => {
              const Icon = typeIcon[n.type];
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 shadow-sm transition",
                    n.read ? "border-border/70 bg-surface/70" : "border-[var(--brand)]/25 bg-[color-mix(in_oklch,var(--brand)_5%,var(--surface))]",
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-[var(--brand-2)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => markNotificationRead(n.id)}>
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.at).toLocaleString("mn-MN")}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!n.read && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        aria-label="Уншсан гэж тэмдэглэх"
                        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => { deleteNotification(n.id); toast.success("Мэдэгдэл устгагдлаа"); }}
                      aria-label="Устгах"
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-fit rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Мэдэгдлийн тохиргоо</h2>
          <div className="space-y-3">
            <PrefRow label="И-мэйл мэдэгдэл" checked={prefs.email} onCheckedChange={(v) => setPrefs((p) => ({ ...p, email: v }))} />
            <PrefRow label="SMS мэдэгдэл" checked={prefs.sms} onCheckedChange={(v) => setPrefs((p) => ({ ...p, sms: v }))} />
            <PrefRow label="Push мэдэгдэл" checked={prefs.push} onCheckedChange={(v) => setPrefs((p) => ({ ...p, push: v }))} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
