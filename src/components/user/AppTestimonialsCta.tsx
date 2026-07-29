import { motion } from "motion/react";
import { Apple, Play, QrCode, CheckCircle2 } from "lucide-react";
import { testimonials } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./Categories";
import { Star } from "lucide-react";

export function MobileAppSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-5 grid gap-10 lg:grid-cols-2 items-center">
        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">Tanu апп</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">
            Tanu апптай бүх үйлчилгээ илүү <span className="text-gradient-brand">ойр</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Захиалгаа хянах, шинэ санал хүлээн авах, дуртай үйлчилгээгээ хадгалах — бүх зүйл нэг апп дотор.</p>
          <ul className="mt-6 space-y-2">
            {[
              "Хурдан цаг захиалга",
              "Бодит цагийн сануулга",
              "Урамшуулал, оноо",
              "Дуртай байгууллагаа хадгалах",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-[var(--brand)]" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="bg-foreground text-background hover:opacity-90 gap-2">
              <Apple className="h-4 w-4" /> App Store
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Play className="h-4 w-4" /> Google Play
            </Button>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs">
              <QrCode className="h-8 w-8" /> QR-ээ уншуулж татаарай
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
          <div className="mx-auto aspect-[9/17] w-[260px] rounded-[38px] border-[10px] border-foreground/10 bg-gradient-to-b from-[color-mix(in_oklch,var(--brand)_25%,var(--surface))] to-surface shadow-glow overflow-hidden">
            <div className="p-4 h-full">
              <p className="text-xs text-white/80">Миний захиалгууд</p>
              <div className="mt-3 space-y-2">
                {["10:00 Aura Beauty", "14:30 Peak Fitness", "18:00 Lingua Center"].map((t, i) => (
                  <div key={i} className="rounded-lg bg-white/10 backdrop-blur text-white/95 p-2 text-[11px]">{t}</div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Сэтгэгдэл" title="Хэрэглэгчид Tanu-г ингэж үнэлдэг" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-3 text-sm">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-brand grid place-items-center text-white text-xs font-bold">
                  {t.name.split(" ")[0][0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UserCta({ onOpenBooking }: { onOpenBooking: () => void }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 md:p-14 text-white shadow-glow">
          <div className="absolute inset-0 opacity-30 grid-bg" />
          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold">Дараагийн үйлчилгээгээ Tanu-аас захиалаарай</h2>
            <p className="mt-3 text-white/85 max-w-xl mx-auto">Гоо сайхан, эрүүл мэнд, спорт, сургалт — хэрэгтэй бүгд нэг дор.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={onOpenBooking} className="bg-white text-[var(--brand)] hover:opacity-90">Үйлчилгээ хайх</Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20">Апп татах</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
