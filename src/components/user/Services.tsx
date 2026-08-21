import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Heart, MapPin, Star, Clock, Smartphone } from "lucide-react";
import { services as fallbackServices } from "@/lib/mock-data";
import {
  APP_STORE_URL,
  buildLandingServices,
  fetchLandingCompanies,
  type LandingService,
} from "@/lib/company-api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./Categories";
import { cn } from "@/lib/utils";

const TAB_KEYS = [
  { key: "featured", label: "Онцлох" },
  { key: "nearby", label: "Ойрхон" },
  { key: "today", label: "Өнөөдөр боломжтой" },
  { key: "new", label: "Шинээр нэмэгдсэн" },
];

export function Services({ categoryFilter }: { categoryFilter: string | null }) {
  const [tab, setTab] = useState("featured");
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [services, setServices] = useState<LandingService[]>(fallbackServices);

  useEffect(() => {
    let cancelled = false;

    fetchLandingCompanies()
      .then((companies) => {
        if (!cancelled) setServices(buildLandingServices(companies));
      })
      .catch(() => {
        if (!cancelled) setServices(fallbackServices);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    return services.filter((s) => {
      if (categoryFilter && s.category !== categoryFilter) return false;
      if (tab === "featured") return true;
      return s.tag === tab;
    });
  }, [services, tab, categoryFilter]);

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  return (
    <section
      id="services"
      className="relative border-y border-border/60 bg-surface-muted/35 py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Үйлчилгээ"
          title="Өөрт таарах үйлчилгээгээ нээ"
          desc="Онцлох, ойрхон болон өнөөдөр боломжтой үйлчилгээний сонголтуудыг харна уу."
        />
        {categoryFilter && (
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft text-[var(--brand)] px-3 py-1 text-xs font-medium">
              Ангилал: {categoryFilter}
            </span>
          </div>
        )}
        <Tabs value={tab} onValueChange={setTab} className="mt-10">
          <TabsList className="mx-auto flex h-auto flex-wrap justify-center rounded-2xl border border-border/80 bg-surface/70 p-1 shadow-sm backdrop-blur">
            {TAB_KEYS.map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="rounded-xl px-4 py-2 data-[state=active]:bg-gradient-brand data-[state=active]:text-white"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={tab} className="mt-8">
            {list.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">
                Одоогоор энэ ангилалд үйлчилгээ алга байна.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.slice(0, 6).map((s, i) => (
                  <ServiceCard
                    key={s.id}
                    s={s}
                    i={i}
                    fav={favs.has(s.id)}
                    onFav={() => toggleFav(s.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function ServiceCard({
  s,
  i,
  fav,
  onFav,
}: {
  s: LandingService;
  i: number;
  fav: boolean;
  onFav: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: i * 0.04 }}
      className="group overflow-hidden rounded-3xl border border-border/80 bg-surface/85 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-glow"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0.7 0.18 ${s.hue}), oklch(0.5 0.22 ${s.hue + 30}))`,
        }}
      >
        {s.image && (
          <img
            src={s.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,.18),transparent_46%,rgba(5,16,42,.22))]" />
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute bottom-0 right-5 font-display text-[7rem] font-black leading-none tracking-[-.09em] text-white/[0.13]">
          {s.org.slice(0, 1)}
        </div>
        <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/15 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          {s.category}
        </span>
        <button
          onClick={onFav}
          aria-label="Дуртай"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#0b1935] shadow-sm backdrop-blur transition hover:scale-110"
        >
          <Heart className={cn("h-4 w-4", fav && "fill-red-500 text-red-500")} />
        </button>
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur">
          <Clock className="h-3 w-3" /> {s.time} боломжтой
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--brand)]">
          {s.org}
        </p>
        <h3 className="mt-1.5 text-[1.05rem] font-bold leading-snug">{s.service}</h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-foreground">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> {s.rating}
            <span className="text-muted-foreground">({s.reviews})</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {s.location}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">Эхлэх үнэ</p>
            <p className="font-bold">{s.price > 0 ? `${s.price.toLocaleString()}₮` : "Аппаас харах"}</p>
          </div>
          <Button
            size="sm"
            asChild
            className="rounded-xl bg-gradient-brand px-4 text-white hover:opacity-90"
          >
            <a href={APP_STORE_URL}>
              <Smartphone className="mr-1.5 h-3.5 w-3.5" />
              Аппаар захиалах
            </a>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
