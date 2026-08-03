import type { ComponentType } from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconSet = Icons as unknown as Record<string, ComponentType<{ className?: string }>>;

export function Categories({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <section id="categories" className="relative py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Ангилал"
          title="Түгээмэл ангиллаас сонго"
          desc="Хамгийн эрэлттэй үйлчилгээний ангилалаас хайлтаа эхлүүлээрэй."
        />
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {categories.map((c, i) => {
            const Icon = iconSet[c.icon] ?? Icons.Sparkles;
            const active = selected === c.name;
            return (
              <motion.button
                key={c.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                onClick={() => onSelect(active ? null : c.name)}
                className={cn(
                  "group relative min-h-40 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300",
                  active
                    ? "border-transparent bg-gradient-brand text-white shadow-glow"
                    : "border-border/80 bg-surface/75 shadow-sm backdrop-blur hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-soft",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute -right-10 -top-10 h-28 w-28 rounded-full transition-transform duration-500 group-hover:scale-125",
                    active ? "bg-white/10" : "bg-[var(--brand)]/[0.055]",
                  )}
                />
                <div
                  className={cn(
                    "relative h-12 w-12 rounded-2xl grid place-items-center transition",
                    active
                      ? "bg-white/20"
                      : "bg-brand-soft text-[var(--brand)] group-hover:bg-gradient-brand group-hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <Icons.ArrowUpRight
                  className={cn(
                    "absolute right-4 top-4 h-4 w-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                    active ? "text-white/80" : "text-muted-foreground/55",
                  )}
                />
                <p className="relative mt-6 font-semibold">{c.name}</p>
                <p
                  className={cn("text-xs mt-1", active ? "text-white/80" : "text-muted-foreground")}
                >
                  {c.count} байгууллага
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow && (
        <span className="inline-flex rounded-full border border-[var(--brand)]/15 bg-[var(--brand)]/[0.055] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-[-0.035em] md:text-[2.65rem]">
        {title}
      </h2>
      {desc && <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">{desc}</p>}
    </div>
  );
}
