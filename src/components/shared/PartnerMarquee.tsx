import { partners } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";

export function PartnerMarquee() {
  const { mode } = useApp();
  const label =
    mode === "business"
      ? "Tanu Business ашиглаж буй байгууллагууд"
      : "Tanu-тай хамтран ажилладаг байгууллагууд";
  return (
    <section id="partners" className="relative py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
        </div>
        <div className="mt-8 space-y-4">
          <MarqueeRow reverse={false} />
          <MarqueeRow reverse />
        </div>
      </div>
    </section>
  );
}

function MarqueeRow({ reverse }: { reverse: boolean }) {
  const items = reverse ? [...partners].reverse() : partners;
  // Duplicate the list so translateX(-50%) produces a seamless loop.
  const doubled = [...items, ...items];
  return (
    <div className="marquee-wrap overflow-hidden">
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        {doubled.map((name, i) => (
          <div
            key={i}
            aria-hidden={i >= items.length ? true : undefined}
            className="group flex h-14 min-w-[164px] shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-surface/55 px-6 shadow-sm backdrop-blur transition hover:border-[var(--brand)]/25 hover:bg-surface hover:shadow-soft"
          >
            <span className="font-display font-bold text-lg text-muted-foreground/70 group-hover:text-gradient-brand transition-colors">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
