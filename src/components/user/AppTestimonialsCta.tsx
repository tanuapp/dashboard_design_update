import { motion } from "motion/react";
import { Apple, Play, QrCode, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { testimonials } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./Categories";
import { TanuMark } from "@/components/brand/Logo";

const notifyDownload = (store: string) =>
  toast.info(`${store} — удахгүй!`, {
    description: "Tanu апп-ын албан ёсны хувилбар удахгүй нээгдэнэ.",
  });

const appBenefits = [
  "Хурдан цаг захиалга",
  "Бодит цагийн сануулга",
  "Урамшуулал, оноо",
  "Дуртай байгууллагаа хадгалах",
];

const appBookings = [
  { time: "10:00", name: "Aura Beauty" },
  { time: "14:30", name: "Peak Fitness" },
  { time: "18:00", name: "Lingua Center" },
];

export function MobileAppSection() {
  return (
    <section
      id="app"
      className="relative overflow-hidden bg-[color-mix(in_oklch,var(--brand)_4%,var(--surface))] py-20 md:py-28 dark:bg-[color-mix(in_oklch,var(--brand)_7%,var(--background))]"
    >
      {/* soft vignette + radial glow atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,color-mix(in_oklch,var(--background)_55%,transparent)_100%)]" />
        <div className="absolute right-[-10%] top-1/2 h-[38rem] w-[38rem] -translate-y-1/2 rounded-full bg-[var(--brand)]/[0.14] blur-[130px] dark:bg-[var(--brand)]/[0.22]" />
        <div className="absolute left-[-10%] bottom-0 h-[26rem] w-[26rem] rounded-full bg-[var(--brand-2)]/[0.09] blur-[110px] dark:bg-[var(--brand-2)]/[0.15]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex rounded-full border border-[var(--brand)]/15 bg-[var(--brand)]/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
            Tanu апп
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-[1.14] tracking-[-0.035em] md:text-[2.75rem]">
            Tanu апптай бүх үйлчилгээг
            <br className="hidden sm:block" /> <span className="text-gradient-brand">илүү ойр</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Захиалга хянах, шинэ санал хүлээн авах, дуртай үйлчилгээгээ хадгалах — бүх зүйл нэг апп
            дотор.
          </p>

          <ul className="mt-7 space-y-3.5">
            {appBenefits.map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15px] font-medium">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-[var(--brand)] shadow-[0_2px_8px_-2px_color-mix(in_oklch,var(--brand)_35%,transparent)]">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          {/* download CTA row */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => notifyDownload("App Store")}
              className="group flex items-center gap-2.5 rounded-2xl bg-foreground px-4 py-2.5 text-background shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:opacity-100"
            >
              <Apple className="h-6 w-6 shrink-0" />
              <span className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-medium opacity-80">Download on the</span>
                <span className="text-[15px] font-semibold tracking-tight">App Store</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => notifyDownload("Google Play")}
              className="group flex items-center gap-2.5 rounded-2xl bg-foreground px-4 py-2.5 text-background shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:opacity-100"
            >
              <Play className="h-5 w-5 shrink-0" />
              <span className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-medium opacity-80">GET IT ON</span>
                <span className="text-[15px] font-semibold tracking-tight">Google Play</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => toast.info("QR код удахгүй!", { description: "Tanu апп-ыг QR-ээр татах боломж удахгүй нээгдэнэ." })}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-surface/80 px-3.5 py-2.5 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)]/25 hover:shadow-soft active:translate-y-0"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--brand)]/[0.08] text-[var(--brand)] transition-transform duration-200 group-hover:scale-105">
                <QrCode className="h-6 w-6" />
              </span>
              <span className="text-left text-xs font-medium leading-tight text-foreground/80">
                QR-ээ уншуулж
                <br /> татаарай
              </span>
            </button>
          </div>
        </motion.div>

        {/* phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center py-4"
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 m-auto h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand)_28%,transparent)_0%,transparent_70%)] blur-2xl"
          />

          {/* soft blue frame around the phone */}
          <div className="relative rounded-[3rem] bg-gradient-to-b from-[var(--brand)]/[0.12] to-[var(--brand-2)]/[0.06] p-4 shadow-[0_50px_100px_-40px_color-mix(in_oklch,var(--brand)_45%,transparent)] ring-1 ring-[var(--brand)]/10">
            <div className="relative aspect-[9/18.5] w-[250px] overflow-hidden rounded-[2.4rem] border-[6px] border-white bg-surface shadow-[0_20px_60px_-20px_rgba(15,35,80,0.35)] dark:border-white/10 sm:w-[270px]">
              {/* notch */}
              <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-foreground/90" />

              <div className="flex h-full flex-col bg-gradient-to-b from-[color-mix(in_oklch,var(--brand)_5%,var(--surface))] to-surface px-4 pb-6 pt-8">
                <div className="flex items-center gap-2">
                  <TanuMark variant="gradient" className="h-7" />
                  <span className="font-display text-sm font-extrabold tracking-[-0.05em] text-foreground">
                    tanu
                  </span>
                </div>

                <p className="mt-7 text-[13px] font-bold tracking-[-0.01em] text-foreground">
                  Миний захиалгууд
                </p>

                <div className="mt-3 space-y-2.5">
                  {appBookings.map((b) => (
                    <div
                      key={b.name}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-2.5 shadow-sm"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-[10px] font-bold text-[var(--brand)]">
                        {b.time.slice(0, 2)}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-[11px] font-semibold text-foreground">
                          {b.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{b.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto rounded-xl bg-gradient-brand p-3 text-white shadow-glow">
                  <p className="text-[10px] font-medium opacity-90">Дараагийн санал</p>
                  <p className="mt-0.5 text-[11px] font-bold">-20% Aura Beauty spa</p>
                </div>
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
    <section className="relative border-y border-border/60 bg-surface-muted/35 py-20 md:py-24">
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
              className="group rounded-3xl border border-border/80 bg-surface/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-soft"
            >
              <div className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center text-white text-xs font-bold shadow-glow">
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

export function UserCta() {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-5xl px-5">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-brand p-10 text-white shadow-[0_35px_90px_-45px_color-mix(in_oklch,var(--brand)_90%,transparent)] md:p-16">
          <div className="absolute inset-0 opacity-30 grid-bg" />
          <TanuMark
            variant="light"
            className="absolute -right-10 -top-10 h-56 rotate-6 opacity-20"
          />
          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Дараагийн үйлчилгээгээ Tanu апп-аар захиалаарай
            </h2>
            <p className="mt-3 text-white/85 max-w-xl mx-auto">
              Web дээр үйлчилгээгээ хайж, харьцуулаад мобайл апп-аар цагаа баталгаажуулна.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={() => notifyDownload("App Store")}
                className="rounded-xl bg-white px-6 text-[var(--brand)] hover:-translate-y-0.5 hover:opacity-90"
              >
                <Apple className="mr-1.5 h-4 w-4" />
                App Store
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-white/40 bg-white/10 px-6 text-white hover:-translate-y-0.5 hover:bg-white/20"
                onClick={() => notifyDownload("Google Play")}
              >
                <Play className="mr-1.5 h-4 w-4" />
                Google Play
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
