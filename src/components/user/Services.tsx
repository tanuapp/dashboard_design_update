import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Heart, MapPin, Star, Clock } from "lucide-react";
import { services } from "@/lib/mock-data";
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
  const list = useMemo(() => {
    return services.filter((s) => {
      if (categoryFilter && s.category !== categoryFilter) return false;
      if (tab === "featured") return true;
      return s.tag === tab;
    });
  }, [tab, categoryFilter]);

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <section id="services" className="py-16">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Үйлчилгээ" title="Өөрт таарах үйлчилгээгээ нээ" desc="Онцлох, ойрхон болон өнөөдөр боломжтой үйлчилгээний сонголтуудыг харна уу." />
        {categoryFilter && (
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft text-[var(--brand)] px-3 py-1 text-xs font-medium">
              Ангилал: {categoryFilter}
            </span>
          </div>
        )}
        <Tabs value={tab} onValueChange={setTab} className="mt-8">
          <TabsList className="mx-auto flex flex-wrap justify-center bg-surface/60 backdrop-blur border border-border">
            {TAB_KEYS.map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="data-[state=active]:bg-gradient-brand data-[state=active]:text-white">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={tab} className="mt-8">
            {list.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">Одоогоор энэ ангилалд үйлчилгээ алга байна.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s, i) => (
                  <ServiceCard key={s.id} s={s} i={i} fav={favs.has(s.id)} onFav={() => toggleFav(s.id)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function ServiceCard({ s, i, fav, onFav }: any) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: i * 0.04 }}
      className="group rounded-2xl overflow-hidden border border-border bg-surface hover:shadow-glow transition-all"
    >
      <div
        className="relative aspect-[16/10]"
        style={{ background: `linear-gradient(135deg, oklch(0.7 0.18 ${s.hue}), oklch(0.5 0.22 ${s.hue + 30}))` }}
      >
        <button
          onClick={onFav}
          aria-label="Дуртай"
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-white/90 backdrop-blur text-foreground hover:scale-110 transition"
        >
          <Heart className={cn("h-4 w-4", fav && "fill-red-500 text-red-500")} />
        </button>
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-white/95 text-[11px] font-medium bg-black/25 backdrop-blur px-2 py-1 rounded-full">
          <Clock className="h-3 w-3" /> {s.time} боломжтой
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{s.org}</p>
        <h3 className="mt-0.5 font-semibold leading-snug">{s.service}</h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-foreground">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> {s.rating}
            <span className="text-muted-foreground">({s.reviews})</span>
          </span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">Эхлэх үнэ</p>
            <p className="font-bold">{s.price.toLocaleString()}₮</p>
          </div>
          <Button size="sm" className="bg-gradient-brand text-white hover:opacity-90">Захиалах</Button>
        </div>
      </div>
    </motion.article>
  );
}
