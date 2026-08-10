import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  BellRing,
  CalendarClock,
  CalendarX2,
  CalendarCheck2,
  Check,
  RefreshCw,
  Settings2,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "../ui";
import { cn } from "@/lib/utils";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ServerNotification,
} from "@/lib/dashboard/notification-api";

const filterOptions = [
  { value: "all", label: "Бүх мэдэгдэл" },
  { value: "unread", label: "Уншаагүй" },
  { value: "attendanceRequest", label: "Ирцийн хүсэлт" },
  { value: "system", label: "Систем" },
  { value: "other", label: "Бусад" },
] as const;

const typeLabel: Record<string, string> = {
  attendanceRequest: "Ирцийн хүсэлт",
  "new-booking": "Шинэ захиалга",
  "booking-changed": "Захиалга өөрчлөгдсөн",
  "booking-cancelled": "Захиалга цуцлагдсан",
  upcoming: "Сануулга",
  "schedule-update": "Хуваарь шинэчлэгдсэн",
  system: "Систем",
  review: "Үнэлгээ",
  other: "Мэдэгдэл",
};

const typeIcon: Record<string, typeof Bell> = {
  attendanceRequest: CalendarClock,
  "new-booking": CalendarCheck2,
  "booking-changed": CalendarClock,
  "booking-cancelled": CalendarX2,
  upcoming: BellRing,
  "schedule-update": Users,
  system: Settings2,
  review: Star,
  other: BellRing,
};

type FilterValue = (typeof filterOptions)[number]["value"];

function getNotificationType(item: ServerNotification) {
  return item.data?.type || item.type || "other";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<ServerNotification[]>([]);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "other") {
      return notifications.filter((n) => !["attendanceRequest", "system"].includes(getNotificationType(n)));
    }
    return notifications.filter((n) => getNotificationType(n) === filter);
  }, [filter, notifications]);

  const load = async () => {
    try {
      setError("");
      const items = await fetchNotifications();
      setNotifications(items);
    } catch {
      setError("Мэдэгдэл татахад алдаа гарлаа.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markOneRead = async (id: string) => {
    setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
    await markNotificationRead(id).catch(() => load());
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    await markAllNotificationsRead().catch(() => load());
  };

  const removeOne = async (id: string) => {
    const previous = notifications;
    setNotifications((prev) => prev.filter((item) => item._id !== id));
    try {
      await deleteNotification(id);
      toast.success("Мэдэгдэл устгагдлаа");
    } catch {
      setNotifications(previous);
      toast.error("Мэдэгдэл устгах боломжгүй байна");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Мэдэгдэл"
        description={
          loading
            ? "Серверээс мэдэгдэл татаж байна."
            : `${unreadCount} уншаагүй мэдэгдэл байна.`
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1.5 rounded-lg" onClick={() => load()}>
              <RefreshCw className="h-4 w-4" /> Шинэчлэх
            </Button>
            <Button variant="outline" className="gap-1.5 rounded-lg" onClick={markAllRead} disabled={unreadCount === 0}>
              <Check className="h-4 w-4" /> Бүгдийг уншсан
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "h-9 rounded-lg border px-3 text-sm font-medium transition",
              filter === item.value
                ? "border-[var(--brand)] bg-brand-soft text-[var(--brand-2)]"
                : "border-border bg-surface/70 text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-h-80">
          {loading ? (
            <LoadingList />
          ) : error ? (
            <EmptyState icon={<Bell className="h-6 w-6" />} title={error} description="Backend server болон нэвтрэх token-оо шалгаад дахин шинэчилнэ үү." />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Bell className="h-6 w-6" />} title="Мэдэгдэл алга байна" description="Сервер дээр мэдэгдэл байхгүй үед энэ хэсэг хоосон харагдана." />
          ) : (
            <div className="space-y-2.5">
              {filtered.map((n) => {
                const type = getNotificationType(n);
                const Icon = typeIcon[type] || BellRing;
                return (
                  <div
                    key={n._id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 shadow-sm transition",
                      n.read ? "border-border/70 bg-surface/70" : "border-[var(--brand)]/25 bg-[color-mix(in_oklch,var(--brand)_5%,var(--surface))]",
                    )}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-[var(--brand-2)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => markOneRead(n._id)}>
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {typeLabel[type] || "Мэдэгдэл"} · {formatDate(n.createdAt)}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      {!n.read && (
                        <button
                          onClick={() => markOneRead(n._id)}
                          aria-label="Уншсан гэж тэмдэглэх"
                          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeOne(n._id)}
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
        </div>

        <div className="h-fit rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Мэдэгдлийн тойм</h2>
          <div className="space-y-3">
            <SummaryRow label="Нийт" value={notifications.length} />
            <SummaryRow label="Уншаагүй" value={unreadCount} />
            <SummaryRow label="Ирцийн хүсэлт" value={notifications.filter((n) => getNotificationType(n) === "attendanceRequest").length} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value.toLocaleString("mn-MN")}</span>
    </div>
  );
}

function LoadingList() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-xl border border-border/70 bg-surface/70" />
      ))}
    </div>
  );
}
