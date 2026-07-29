import { partners } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";

export function PartnerMarquee() {
  const { mode } = useApp();
  const label = mode === "business"
    ? "Tanu Business ашиглаж буй байгууллагууд"
    : "Tanu-тай хамтран ажилладаг байгууллагууд";
  return (
    <section id="partners" className="py-16">
      <div className="mx-auto max-w-7xl px-5">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
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
            className="group shrink-0 flex items-center justify-center h-14 min-w-[160px] rounded-xl border border-border bg-surface/60 backdrop-blur px-6"
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
