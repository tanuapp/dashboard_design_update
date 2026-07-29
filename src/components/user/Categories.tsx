import { useState } from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Categories({ selected, onSelect }: { selected: string | null; onSelect: (name: string | null) => void }) {
  return (
    <section id="categories" className="py-16">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Ангилал"
          title="Түгээмэл ангиллаас сонго"
          desc="Хамгийн эрэлттэй үйлчилгээний ангилалаас хайлтаа эхлүүлээрэй."
        />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((c, i) => {
            const Icon = (Icons as any)[c.icon] ?? Icons.Sparkles;
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
                  "group relative text-left rounded-2xl border p-4 transition-all",
                  active
                    ? "border-transparent bg-gradient-brand text-white shadow-glow"
                    : "border-border bg-surface hover:-translate-y-0.5 hover:shadow-soft",
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl grid place-items-center transition",
                  active ? "bg-white/20" : "bg-brand-soft text-[var(--brand)] group-hover:bg-gradient-brand group-hover:text-white",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-semibold">{c.name}</p>
                <p className={cn("text-xs mt-1", active ? "text-white/80" : "text-muted-foreground")}>
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

export function SectionHeader({ eyebrow, title, desc, align = "center" }: { eyebrow?: string; title: string; desc?: string; align?: "center" | "left" }) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "")}>
      {eyebrow && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">{title}</h2>
      {desc && <p className="mt-3 text-muted-foreground">{desc}</p>}
    </div>
  );
}
