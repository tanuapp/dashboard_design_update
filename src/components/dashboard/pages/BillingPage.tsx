import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  Sparkles,
  Zap,
  Rocket,
  Building2,
  Check,
  X,
  ChevronDown,
  CalendarClock,
  Wallet,
  RefreshCw,
} from "lucide-react";
import {
  DURATIONS,
  DEFAULT_DURATION,
  PACKAGES,
  PACKAGE_ACCENT,
  COMPARISON_ROWS,
  CURRENT_SUBSCRIPTION,
  STANDARD_ONLY_FEATURES,
  planPrice,
  type DurationKey,
  type PackageId,
} from "@/lib/dashboard/billing-data";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, PageHeader, money } from "../ui";
import { ContactSalesModal } from "../ContactSalesModal";
import { CheckoutSummaryModal } from "../CheckoutSummaryModal";
import { cn } from "@/lib/utils";

const PACKAGE_ICON: Record<PackageId, typeof Sparkles> = {
  free: Sparkles,
  standard: Zap,
  pro: Rocket,
  enterprise: Building2,
};

const PACKAGE_BADGE: Partial<Record<PackageId, string>> = {
  standard: "ИДЭВХТЭЙ",
  pro: "САНАЛ БОЛГОХ",
  enterprise: "БАЙГУУЛЛАГАД",
};

const durationLabel = (key: DurationKey) => DURATIONS.find((d) => d.key === key)!.label;

export function BillingPage() {
  const [duration, setDuration] = useState<DurationKey>(DEFAULT_DURATION);
  const [autoRenew, setAutoRenew] = useState(CURRENT_SUBSCRIPTION.autoRenew);
  const [pendingAutoRenew, setPendingAutoRenew] = useState<boolean | null>(null);
  const [downgradeOpen, setDowngradeOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [mobileCompareTab, setMobileCompareTab] = useState<PackageId>("standard");

  const standardPrice = useMemo(() => planPrice("standard", duration), [duration]);
  const proPrice = useMemo(() => planPrice("pro", duration), [duration]);

  return (
    <div className="space-y-6">
      <PageHeader title="Багц, төлбөр" description="Байгууллагынхаа багцыг удирдаж, төлбөрийн мэдээллээ хянана." />

      {/* Current subscription summary */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryField label="Одоогийн багц" value="Standard багц" icon={<Zap className="h-4 w-4" />} />
          <SummaryField label="Дуусах хугацаа" value={CURRENT_SUBSCRIPTION.expiresAt} icon={<CalendarClock className="h-4 w-4" />} />
          <SummaryField label="Дараагийн төлбөр" value={money(CURRENT_SUBSCRIPTION.nextPaymentAmount)} icon={<Wallet className="h-4 w-4" />} />
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" /> Автомат сунгалт
            </p>
            <div className="flex items-center gap-2.5">
              <Switch
                checked={autoRenew}
                onCheckedChange={(v) => {
                  setPendingAutoRenew(v);
                }}
              />
              <span className={cn("text-sm font-semibold", autoRenew ? "text-[var(--success)]" : "text-muted-foreground")}>
                {autoRenew ? "Идэвхтэй" : "Идэвхгүй"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Duration selector */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Багцын хугацаа"
          className="inline-grid grid-cols-3 gap-1 rounded-2xl border border-border/80 bg-surface/80 p-1 shadow-sm"
        >
          {DURATIONS.map((d) => (
            <button
              key={d.key}
              role="tab"
              aria-selected={duration === d.key}
              onClick={() => setDuration(d.key)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition",
                duration === d.key ? "bg-gradient-brand text-white shadow-sm" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {d.label}
              {d.badge && (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                    duration === d.key ? "bg-white/20 text-white" : "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]",
                  )}
                >
                  {d.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Package cards */}
      <div className="grid grid-cols-1 gap-5 sm:max-3xl:grid-cols-2 3xl:grid-cols-4">
        {PACKAGES.map((pkg) => {
          const accent = PACKAGE_ACCENT[pkg.id];
          const Icon = PACKAGE_ICON[pkg.id];
          const isCurrent = pkg.id === "standard";
          const badge = PACKAGE_BADGE[pkg.id];
          const orderClass =
            pkg.id === "standard"
              ? "order-1 sm:order-2"
              : pkg.id === "free"
                ? "order-2 sm:order-1"
                : pkg.id === "pro"
                  ? "order-3"
                  : "order-4";

          return (
            <div
              key={pkg.id}
              className={cn(
                "flex h-full flex-col rounded-3xl border bg-surface/85 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-soft",
                orderClass,
                isCurrent ? "border-2 shadow-[0_18px_50px_-30px_color-mix(in_oklch,var(--brand)_50%,transparent)]" : "border-border/80",
              )}
              style={isCurrent ? { borderColor: accent.border } : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                  style={{ background: accent.soft, color: accent.text }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {badge && (
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white"
                    style={{ background: accent.solid }}
                  >
                    {badge}
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-lg font-bold">{pkg.name}</h3>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{pkg.englishLabel}</p>
              <p className="mt-2 text-sm text-muted-foreground">{pkg.tagline}</p>

              <div className="mt-5">
                <PriceBlock pkg={pkg.id} duration={duration} standardPrice={standardPrice} proPrice={proPrice} />
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span
                      className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full"
                      style={{ background: accent.soft, color: accent.text }}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>

              {pkg.limitedNote && (
                <div className="mt-4 rounded-lg bg-surface-muted/60 p-3">
                  <Progress value={62} className="h-1.5" />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{pkg.limitedNote}</p>
                </div>
              )}

              <div className="mt-6">
                {pkg.id === "free" && (
                  <Button variant="outline" className="w-full rounded-xl" onClick={() => setDowngradeOpen(true)}>
                    Багц бууруулах
                  </Button>
                )}
                {pkg.id === "standard" && (
                  <Button disabled className="w-full cursor-not-allowed rounded-xl bg-secondary text-muted-foreground opacity-100 disabled:opacity-100">
                    <Check className="h-4 w-4" /> Одоогийн багц
                  </Button>
                )}
                {pkg.id === "pro" && (
                  <Button className="w-full rounded-xl text-white hover:opacity-90" style={{ background: accent.solid }} onClick={() => setCheckoutOpen(true)}>
                    Үргэлжлүүлэх
                  </Button>
                )}
                {pkg.id === "enterprise" && (
                  <Button className="w-full rounded-xl text-white hover:opacity-90" style={{ background: accent.solid }} onClick={() => setContactOpen(true)}>
                    Үнийн санал авах
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison */}
      <Collapsible open={comparisonOpen} onOpenChange={setComparisonOpen}>
        <div className="rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold">
              Багцуудыг дэлгэрэнгүй харьцуулах
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", comparisonOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border/70 p-5">
              {/* Desktop / tablet table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Боломж</th>
                      {PACKAGES.map((p) => (
                        <th key={p.id} className="pb-3 pr-4 text-center font-semibold" style={{ color: PACKAGE_ACCENT[p.id].text }}>
                          {p.englishLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map((row) => (
                      <tr key={row.label} className="border-t border-border/60">
                        <td className="py-3 pr-4 text-muted-foreground">{row.label}</td>
                        {PACKAGES.map((p) => (
                          <td key={p.id} className="py-3 pr-4 text-center">
                            <ComparisonCell value={row.values[p.id]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: package tabs + stacked rows */}
              <div className="sm:hidden">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {PACKAGES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setMobileCompareTab(p.id)}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                        mobileCompareTab === p.id ? "text-white" : "border border-border text-muted-foreground",
                      )}
                      style={mobileCompareTab === p.id ? { background: PACKAGE_ACCENT[p.id].solid } : undefined}
                    >
                      {p.englishLabel}
                    </button>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  {COMPARISON_ROWS.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-lg bg-surface-muted/40 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <ComparisonCell value={row.values[mobileCompareTab]} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Auto-renew confirm */}
      <ConfirmDialog
        open={pendingAutoRenew !== null}
        onOpenChange={(v) => !v && setPendingAutoRenew(null)}
        title={pendingAutoRenew ? "Автомат сунгалтыг идэвхжүүлэх үү?" : "Автомат сунгалтыг унтраах уу?"}
        description={
          pendingAutoRenew
            ? "Багц дуусахад төлбөрийг автоматаар суутгаж, тасралтгүй үргэлжлүүлнэ."
            : "Багцын хугацаа дуусмагц автоматаар сунгагдахгүй болно."
        }
        confirmLabel={pendingAutoRenew ? "Идэвхжүүлэх" : "Унтраах"}
        onConfirm={() => {
          setAutoRenew(!!pendingAutoRenew);
          toast.success(pendingAutoRenew ? "Автомат сунгалт идэвхжлээ" : "Автомат сунгалт унтарлаа");
          setPendingAutoRenew(null);
        }}
      />

      {/* Downgrade confirm */}
      <ConfirmDialog
        open={downgradeOpen}
        onOpenChange={setDowngradeOpen}
        title="FREE багц руу буурах уу?"
        description={`Та Standard багцаас FREE багц руу шилжвэл дараах боломжуудыг ашиглах эрхгүй болно: ${STANDARD_ONLY_FEATURES.join(", ")}.`}
        confirmLabel="Багц бууруулах"
        destructive
        onConfirm={() => {
          toast.success("Хүсэлт бүртгэгдлээ", { description: "Одоогийн үйлчилгээний хугацаа дуусахад багц FREE болно." });
          setDowngradeOpen(false);
        }}
      />

      <CheckoutSummaryModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        packageName="Pro багц"
        durationLabel={durationLabel(duration)}
        base={proPrice.base}
        discountAmount={proPrice.discountAmount}
        final={proPrice.final}
      />

      <ContactSalesModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}

function SummaryField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function PriceBlock({
  pkg,
  duration,
  standardPrice,
  proPrice,
}: {
  pkg: PackageId;
  duration: DurationKey;
  standardPrice: ReturnType<typeof planPrice>;
  proPrice: ReturnType<typeof planPrice>;
}) {
  if (pkg === "free") {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold">0₮</span>
        <span className="text-xs text-muted-foreground">хугацаагүй</span>
      </div>
    );
  }

  if (pkg === "enterprise") {
    return (
      <div>
        <p className="text-2xl font-extrabold">Үнийн санал авах</p>
        <p className="mt-1 text-xs text-muted-foreground">Танай байгууллагын хэрэгцээнд тохируулна</p>
      </div>
    );
  }

  const price = pkg === "standard" ? standardPrice : proPrice;

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${pkg}-${duration}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-baseline gap-2"
        >
          <span className="text-3xl font-extrabold">{money(price.final)}</span>
          {price.hasDiscount && <span className="text-sm text-muted-foreground line-through">{money(price.base)}</span>}
        </motion.div>
      </AnimatePresence>
      <p className="mt-1 text-xs text-muted-foreground">{durationLabel(duration)}-ийн хугацаанд</p>
    </div>
  );
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-[var(--success)]" />
    ) : (
      <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
    );
  }
  return <span className="font-medium">{value}</span>;
}
