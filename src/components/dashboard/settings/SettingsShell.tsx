import type { ComponentType, ReactNode } from "react";
import {
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  CreditCard,
  Globe2,
  IdCard,
  LayoutList,
  Link2,
  LockKeyhole,
  Megaphone,
  QrCode,
  ShieldCheck,
  Store,
  UserRoundCog,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationType } from "@/lib/organization";
import { settingsOrganizationConfig, type SettingsSectionKey } from "@/lib/settings/config";
import { cn } from "@/lib/utils";

const settingsIcons: Record<SettingsSectionKey, ComponentType<{ className?: string }>> = {
  organization: Building2,
  profile: IdCard,
  branches: Store,
  employees: Users,
  access: ShieldCheck,
  services: LayoutList,
  booking: CalendarDays,
  schedule: CalendarClock,
  attendance: UserRoundCog,
  notifications: Bell,
  qr: QrCode,
  "promotional-materials": Megaphone,
  "public-links": Link2,
  security: LockKeyhole,
  billing: CreditCard,
};

function settingsLabel(section: SettingsSectionKey, organizationType: OrganizationType) {
  const terms = settingsOrganizationConfig[organizationType].terms;
  const labels: Record<SettingsSectionKey, string> = {
    organization: terms.organization,
    profile: terms.profile,
    branches: terms.branch,
    employees: terms.employee,
    access: "Эрх, хандалт",
    services: terms.service,
    booking: "Захиалга",
    schedule: "Хуваарь",
    attendance: "Ирц, цаг бүртгэл",
    notifications: "Мэдэгдэл",
    qr: "QR код",
    "promotional-materials": "Сурталчилгааны материал",
    "public-links": "Нийтийн холбоос",
    security: "Аюулгүй байдал",
    billing: "Төлбөр, багц",
  };
  return labels[section];
}

export function SettingsShell({
  organizationType,
  activeSection,
  onSectionChange,
  hasUnsavedChanges,
  children,
}: {
  organizationType: OrganizationType;
  activeSection: SettingsSectionKey;
  onSectionChange: (section: SettingsSectionKey) => void;
  hasUnsavedChanges: boolean;
  children: ReactNode;
}) {
  const config = settingsOrganizationConfig[organizationType];
  const activeLabel = settingsLabel(activeSection, organizationType);

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100dvh-61px)] sm:-mx-6 sm:-my-8">
      <div className="grid min-h-full min-w-0 lg:grid-cols-[250px_minmax(0,1fr)] 2xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border/80 bg-surface/55 px-3 py-5 lg:block">
          <div className="sticky top-0 max-h-[calc(100dvh-82px)] overflow-y-auto pr-1">
            <div className="px-3 pb-4">
              <p className="font-display text-base font-extrabold">Тохиргоо</p>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                Байгууллагын удирдлага, үйл ажиллагаа болон системийн тохиргоо.
              </p>
              {hasUnsavedChanges && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] px-2 py-1 text-[10px] font-semibold text-[var(--warning)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> Өөрчлөлт хадгалаагүй
                </span>
              )}
            </div>

            <nav className="space-y-5" aria-label="Тохиргооны дэд цэс">
              {config.navigation.map((group) => (
                <div key={group.id}>
                  <p className="mb-1.5 px-3 text-[9px] font-extrabold tracking-[0.13em] text-muted-foreground/75">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((section) => {
                      const Icon = settingsIcons[section];
                      const active = activeSection === section;
                      return (
                        <button
                          key={section}
                          type="button"
                          onClick={() => onSectionChange(section)}
                          className={cn(
                            "relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition",
                            active
                              ? "bg-[var(--brand)] text-white shadow-sm"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">
                            {settingsLabel(section, organizationType)}
                          </span>
                          {active && <span className="h-4 w-0.5 rounded-full bg-white/80" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-7">
          <div className="mb-5 rounded-2xl border border-border/80 bg-surface/80 p-3 shadow-sm lg:hidden">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold">Тохиргоо</p>
                <p className="text-[10px] text-muted-foreground">{activeLabel}</p>
              </div>
              {hasUnsavedChanges && (
                <span className="rounded-full bg-[color-mix(in_oklch,var(--warning)_14%,transparent)] px-2 py-1 text-[9px] font-semibold text-[var(--warning)]">
                  Хадгалаагүй
                </span>
              )}
            </div>
            <Select
              value={activeSection}
              onValueChange={(value) => onSectionChange(value as SettingsSectionKey)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.navigation.map((group) => (
                  <div key={group.id}>
                    <p className="px-2 pb-1 pt-2 text-[9px] font-bold tracking-wider text-muted-foreground">
                      {group.label}
                    </p>
                    {group.items.map((section) => (
                      <SelectItem key={section} value={section}>
                        {settingsLabel(section, organizationType)}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <main className="mx-auto min-w-0 max-w-[1180px]">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function SettingsHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand-2)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SettingsCard({
  icon,
  title,
  description,
  actions,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-surface/85 p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-[var(--brand)] [&_svg]:h-4 [&_svg]:w-4">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function SettingsGateway({
  icon,
  title,
  description,
  stats,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
  action: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <SettingsHeader title={title} description={description} />
      <SettingsCard icon={icon} title="Одоогийн төлөв" description="Existing мэдээллийн товч тойм">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/70 bg-surface-muted/35 p-4"
            >
              <p className="text-[10px] font-semibold text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-lg font-extrabold">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-border/70 pt-5">{action}</div>
      </SettingsCard>
    </div>
  );
}
