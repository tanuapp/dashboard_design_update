import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Building2, Check, Rocket, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/user/Categories";
import {
  fetchLandingPackages,
  buildLandingPackages,
  type LandingPackage,
} from "@/lib/company-api";

const currency = new Intl.NumberFormat("mn-MN");
const signupUrl = "https://admin.tanu.mn/auth/boxed-signup";

const packageIcon = {
  free: Sparkles,
  standart: Zap,
  standard: Zap,
  pro: Rocket,
  enterprise: Building2,
} as const;

export function BusinessPackages() {
  const [packages, setPackages] = useState<LandingPackage[]>(() => buildLandingPackages([]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchLandingPackages()
      .then((items) => {
        if (!cancelled) setPackages(items);
      })
      .catch(() => {
        if (!cancelled) setPackages(buildLandingPackages([]));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="packages" className="relative border-y border-border/60 bg-surface-muted/35 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Багц"
          title="Байгууллагынхаа өсөлтөд тохирсон багцаа сонго"
          desc="Tanu Business-ийн багцууд серверийн бодит мэдээллээр шинэчлэгдэж, захиалга, ажилтан, сурталчилгаа болон AI туслах боломжуудыг нэгтгэнэ."
        />

        <div className="mt-6 flex justify-center">
          <div className="inline-grid grid-cols-3 gap-1 rounded-2xl border border-border/80 bg-surface/80 p-1 text-sm font-semibold shadow-sm">
            <span className="rounded-xl bg-gradient-brand px-4 py-2 text-center text-white">1 сар</span>
            <span className="rounded-xl px-4 py-2 text-center text-muted-foreground">6 сар -10%</span>
            <span className="rounded-xl px-4 py-2 text-center text-muted-foreground">1 жил -20%</span>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.id} pkg={pkg} index={index} loading={loading} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({
  pkg,
  index,
  loading,
}: {
  pkg: LandingPackage;
  index: number;
  loading: boolean;
}) {
  const Icon = packageIcon[pkg.name as keyof typeof packageIcon] ?? Sparkles;
  const isFree = pkg.price === 0 || pkg.name === "free";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="relative flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-surface/85 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
      style={{ boxShadow: `0 24px 70px -52px ${pkg.color}` }}
    >
      <div
        aria-hidden
        className="absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-10 blur-2xl"
        style={{ background: pkg.color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
          style={{ background: `${pkg.color}18`, color: pkg.color }}
        >
          <Icon className="h-5 w-5" />
        </span>
        {pkg.badge && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ background: pkg.color }}
          >
            {pkg.badge}
          </span>
        )}
      </div>

      <h3 className="relative mt-5 text-xl font-extrabold tracking-tight text-foreground">{pkg.title}</h3>
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {pkg.name}
      </p>
      <p className="relative mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
        {pkg.description}
      </p>

      <div className="relative mt-5">
        {loading ? (
          <div className="h-10 w-36 animate-pulse rounded-xl bg-secondary" />
        ) : isFree ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold">0₮</span>
            <span className="text-xs text-muted-foreground">эхлэх</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold">{currency.format(pkg.price)}₮</span>
            <span className="text-xs text-muted-foreground">/ сар</span>
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Ажилтан: {pkg.employeeCount > 0 ? `${pkg.employeeCount} хүртэл` : "уян хатан"}
        </p>
      </div>

      <ul className="relative mt-6 flex-1 space-y-3">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <span
              className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full"
              style={{ background: `${pkg.color}18`, color: pkg.color }}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        className="relative mt-7 h-11 rounded-xl text-white hover:opacity-90"
        style={{ background: pkg.color }}
      >
        <a href={`${signupUrl}?package=${encodeURIComponent(pkg.name)}`}>
          {isFree ? "Үнэгүй эхлэх" : "Багц сонгох"}
        </a>
      </Button>
    </motion.article>
  );
}
