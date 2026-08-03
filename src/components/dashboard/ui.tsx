import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Info, Loader2 } from "lucide-react";
import type { BookingStatus, PaymentState } from "@/lib/dashboard/types";
import { bookingStatusLabel, paymentStateLabel } from "@/lib/dashboard/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ================= Page header (title + breadcrumb + back + actions) =================

export function PageHeader({
  title,
  description,
  breadcrumb,
  backTo,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; to?: string }[];
  backTo?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {b.to ? (
                  <Link to={b.to} className="hover:text-foreground hover:underline">
                    {b.label}
                  </Link>
                ) : (
                  <span className={i === breadcrumb.length - 1 ? "text-foreground" : ""}>{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {backTo && (
            <Link
              to={backTo}
              aria-label="Буцах"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-surface/70 transition hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        </div>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ================= Stat card =================

export function StatCard({
  icon,
  label,
  value,
  delta,
  deltaTone = "up",
  tooltip,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  tooltip?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand-2)]">
          {icon}
        </span>
        <div className="flex items-center gap-1.5">
          {delta && (
            <span
              className={cn(
                "text-xs font-semibold",
                deltaTone === "up" && "text-[var(--success)]",
                deltaTone === "down" && "text-destructive",
                deltaTone === "neutral" && "text-muted-foreground",
              )}
            >
              {delta}
            </span>
          )}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${label} тайлбар`}
                  className="text-muted-foreground/60 hover:text-muted-foreground"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-56">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <p className="mt-4 text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ================= Empty state =================

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/40 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-[var(--brand-2)]">
        {icon}
      </span>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ================= Loading state =================

export function LoadingState({ label = "Ачаалж байна..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-surface/40 px-6 py-14 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// ================= Error / offline state =================

export function ErrorState({
  title = "Мэдээлэл ачаалахад алдаа гарлаа",
  description = "Сүлжээний асуудал байж болзошгүй. Дахин оролдоно уу.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-destructive/30 bg-destructive/[0.04] px-6 py-14 text-center">
      <p className="text-sm font-semibold text-destructive">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-1 rounded-lg" onClick={onRetry}>
          Дахин оролдох
        </Button>
      )}
    </div>
  );
}

// ================= Status badges =================

const bookingStatusTone: Record<BookingStatus, string> = {
  upcoming: "bg-[color-mix(in_oklch,var(--brand)_14%,transparent)] text-[var(--brand)]",
  arrived: "bg-[color-mix(in_oklch,var(--brand-2)_16%,transparent)] text-[var(--brand-2)]",
  "in-service": "bg-[color-mix(in_oklch,var(--warning)_18%,transparent)] text-[var(--warning)]",
  completed: "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]",
  cancelled: "bg-[color-mix(in_oklch,var(--destructive)_14%,transparent)] text-destructive",
  "no-show": "bg-secondary text-muted-foreground",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", bookingStatusTone[status])}>
      {bookingStatusLabel[status]}
    </span>
  );
}

const paymentStateTone: Record<PaymentState, string> = {
  paid: "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]",
  unpaid: "bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] text-destructive",
  partial: "bg-[color-mix(in_oklch,var(--warning)_18%,transparent)] text-[var(--warning)]",
  refunded: "bg-secondary text-muted-foreground",
};

export function PaymentStateBadge({ state }: { state: PaymentState }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", paymentStateTone[state])}>
      {paymentStateLabel[state]}
    </span>
  );
}

// ================= Confirm dialog =================

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Батлах",
  cancelLabel = "Болих",
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ================= Avatar initials =================

export function AvatarInitials({ name, className }: { name: string; className?: string }) {
  const initials = name.trim().charAt(0).toUpperCase();
  return (
    <div className={cn("grid shrink-0 place-items-center rounded-full bg-gradient-brand font-bold text-white", className)}>
      {initials}
    </div>
  );
}

// ================= Field wrapper for forms =================

export function FormRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

export function money(n: number) {
  return `₮${n.toLocaleString("mn-MN")}`;
}

export function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" });
}

export function formatDateShort(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("mn-MN", { month: "2-digit", day: "2-digit" });
}
