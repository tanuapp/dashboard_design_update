import type { ReactNode } from "react";
import { AlertCircle, Database, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EventStatus,
  IssuedTicketStatus,
  LayoutType,
  OrderStatus,
  PaymentStatus,
} from "@/features/ticket/types";

export const orderStatusLabel: Record<OrderStatus, string> = {
  new: "Шинэ",
  pending: "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  cancelled: "Цуцлагдсан",
  expired: "Хугацаа дууссан",
  refunded: "Буцаалт хийгдсэн",
  "partially-refunded": "Хэсэгчлэн буцаасан",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  unpaid: "Төлөгдөөгүй",
  checking: "Төлбөр шалгаж байна",
  paid: "Төлөгдсөн",
  failed: "Амжилтгүй",
  refunded: "Буцаагдсан",
  "partially-refunded": "Хэсэгчлэн буцаасан",
};

export const issuedTicketStatusLabel: Record<IssuedTicketStatus, string> = {
  active: "Идэвхтэй",
  used: "Ашиглагдсан",
  cancelled: "Цуцлагдсан",
  void: "Хүчингүй",
};

export const eventStatusLabel: Record<EventStatus, string> = {
  draft: "Ноорог",
  published: "Нийтэлсэн",
  "on-sale": "Борлуулж буй",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
};

export const layoutTypeLabel: Record<LayoutType, string> = {
  seated: "Суудалтай",
  standing: "Зогсоолтой",
  mixed: "Холимог",
  table: "Ширээтэй",
  "free-layout": "Чөлөөт зохион байгуулалт",
};

const statusTone = {
  positive: "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]",
  warning: "bg-[color-mix(in_oklch,var(--warning)_16%,transparent)] text-[var(--warning)]",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-brand-soft text-[var(--brand)]",
  neutral: "bg-secondary text-muted-foreground",
};

function toneFor(value: string): keyof typeof statusTone {
  if (["paid", "confirmed", "active", "on-sale", "published", "used", "open"].includes(value))
    return "positive";
  if (["pending", "checking", "new", "scheduled", "draft"].includes(value)) return "warning";
  if (["cancelled", "failed", "void", "expired", "closed"].includes(value)) return "danger";
  if (["refunded", "partially-refunded", "archived"].includes(value)) return "neutral";
  return "info";
}

export function TicketStatusBadge({ value, label }: { value: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold",
        statusTone[toneFor(value)],
      )}
    >
      {label}
    </span>
  );
}

export function DemoRepositoryNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[var(--brand)]/15 bg-brand-soft/55 px-3.5 py-3 text-xs text-muted-foreground">
      <Database className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
      <p>
        Энэ ажлын орчин local demo repository ашиглаж байна. Төлбөр, суудал түгжих болон бодит QR
        баталгаажуулалт production backend-д холбогдоогүй.
      </p>
    </div>
  );
}

export function PermissionDenied({ permission }: { permission?: string }) {
  return (
    <div className="grid min-h-[55vh] place-items-center">
      <div className="max-w-md rounded-2xl border border-border bg-surface/80 p-8 text-center shadow-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-lg font-bold">Хандах эрхгүй</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Энэ хэсгийг харах эсвэл өөрчлөх эрх таны гишүүнчлэлд олгогдоогүй байна.
        </p>
        {permission && (
          <code className="mt-3 block text-[10px] text-muted-foreground">{permission}</code>
        )}
      </div>
    </div>
  );
}

export function TicketPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function TicketFormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5" /> {message}
    </p>
  );
}

export function formatTicketDateTime(value: string) {
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ticketMoney(value: number) {
  return `${value.toLocaleString("mn-MN")}₮`;
}
