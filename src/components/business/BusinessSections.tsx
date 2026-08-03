import { Fragment, useState, type ComponentType } from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { bizFeatures, bizTypes, revenueSeries } from "@/lib/mock-data";
import { SectionHeader } from "@/components/user/Categories";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { TanuMark } from "@/components/brand/Logo";

const iconSet = Icons as unknown as Record<string, ComponentType<{ className?: string }>>;

export function BusinessFeatures() {
  return (
    <section id="features" className="relative py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Боломжууд"
          title="Бизнесээ өсгөх бүх хэрэгсэл"
          desc="Захиалгаас эхлээд тайлан хүртэл нэг платформ дээр."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bizFeatures.map((f, i) => {
            const Icon = iconSet[f.icon] ?? Icons.Sparkles;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="group rounded-2xl border border-border/80 bg-surface/75 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-soft"
              >
                <div className="h-12 w-12 rounded-2xl grid place-items-center bg-brand-soft text-[var(--brand-2)] transition group-hover:bg-gradient-brand group-hover:text-white group-hover:shadow-glow">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BookingCalendar() {
  const [view, setView] = useState<"day" | "week">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const employees = ["Э. Наран", "Б. Сараа", "Т. Билгүүн"];
  const days = ["Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям", "Ням"];
  const bookings = [
    { d: 0, e: 0, t: "10:00", n: "Оюунтуяа", s: "Signature" },
    { d: 0, e: 1, t: "13:00", n: "Мөнхзул", s: "Gel маникюр" },
    { d: 1, e: 2, t: "11:30", n: "Билгүүн", s: "Массаж" },
    { d: 2, e: 0, t: "14:00", n: "Түвшин", s: "Signature" },
    { d: 3, e: 1, t: "16:00", n: "Даваа", s: "Хумсны загвар" },
    { d: 4, e: 2, t: "18:00", n: "Сүрэн", s: "Массаж" },
    { d: 5, e: 0, t: "10:30", n: "Ариунаа", s: "Signature" },
  ];

  return (
    <section
      id="solutions"
      className="relative border-y border-border/60 bg-surface-muted/35 py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Захиалгын календарь"
          title="Бүх захиалгаа нэг дэлгэцээс"
          desc="Өдөр, долоо хоногийн харагдац, ажилтны багана, шүүлтүүр — бүгд бэлэн."
        />
        <div className="mt-12 overflow-hidden rounded-3xl border border-border/80 bg-surface/85 shadow-[0_25px_80px_-48px_rgba(9,29,71,.55)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/50 p-4">
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 grid place-items-center rounded-lg border border-border bg-surface"
                onClick={() => setWeekOffset((w) => w - 1)}
                aria-label="Өмнөх"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-sm font-semibold">
                {new Date(Date.now() + weekOffset * 7 * 86400000).toLocaleDateString("mn-MN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg border border-border bg-surface"
                onClick={() => setWeekOffset((w) => w + 1)}
                aria-label="Дараа"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface p-0.5 text-xs">
                <button
                  onClick={() => setView("day")}
                  className={`px-3 py-1.5 ${view === "day" ? "bg-gradient-brand text-white" : ""}`}
                >
                  Өдөр
                </button>
                <button
                  onClick={() => setView("week")}
                  className={`px-3 py-1.5 ${view === "week" ? "bg-gradient-brand text-white" : ""}`}
                >
                  Долоо хоног
                </button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-xl"
                onClick={() => toast.info("Шүүлтүүр удахгүй нээгдэнэ")}
              >
                <Filter className="h-3.5 w-3.5" /> Шүүх
              </Button>
              <Button
                size="sm"
                className="bg-gradient-brand text-white gap-1.5 rounded-xl"
                onClick={() => toast.success("Шинэ захиалга нэмэх маягт удахгүй нээгдэнэ")}
              >
                <Plus className="h-3.5 w-3.5" /> Захиалга нэмэх
              </Button>
            </div>
          </div>
          <div className="p-4 overflow-x-auto">
            {view === "week" ? (
              <div className="min-w-[720px] grid grid-cols-[80px_repeat(7,1fr)] gap-2 text-xs">
                <div />
                {days.map((d, i) => (
                  <div
                    key={d}
                    className="text-center font-semibold py-2 border border-border rounded-md bg-surface-muted"
                  >
                    {d} <span className="text-muted-foreground">{i + 12}</span>
                  </div>
                ))}
                {employees.map((emp, ei) => (
                  <Fragment key={`emp-${ei}`}>
                    <div className="flex items-center justify-end pr-2 font-medium text-muted-foreground">
                      {emp}
                    </div>
                    {days.map((_, di) => {
                      const b = bookings.find((x) => x.d === di && x.e === ei);
                      return (
                        <div
                          key={`${ei}-${di}`}
                          className="min-h-[64px] rounded-md border border-border bg-surface-muted p-1.5"
                        >
                          {b && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded bg-gradient-brand text-white px-2 py-1.5 text-[10px]"
                            >
                              <div className="font-mono">{b.t}</div>
                              <div className="font-semibold truncate">{b.n}</div>
                              <div className="opacity-80 truncate">{b.s}</div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="min-w-[520px] grid grid-cols-[80px_repeat(3,1fr)] gap-2 text-xs">
                <div />
                {employees.map((e) => (
                  <div
                    key={e}
                    className="text-center font-semibold py-2 border border-border rounded-md bg-surface-muted"
                  >
                    {e}
                  </div>
                ))}
                {[
                  "09:00",
                  "10:00",
                  "11:00",
                  "12:00",
                  "13:00",
                  "14:00",
                  "15:00",
                  "16:00",
                  "17:00",
                  "18:00",
                ].map((t, ti) => (
                  <Fragment key={t}>
                    <div className="text-right pr-2 py-3 text-muted-foreground font-mono">{t}</div>
                    {employees.map((_, ei) => {
                      const has = (ti + ei) % 4 === 0;
                      return (
                        <div
                          key={`${t}-${ei}`}
                          className="min-h-[44px] rounded-md border border-border bg-surface-muted p-1"
                        >
                          {has && (
                            <div className="rounded bg-gradient-brand text-white px-2 py-1 text-[10px]">
                              <b>{t}</b> · Захиалга
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BusinessAnalytics() {
  const max = Math.max(...revenueSeries);
  const stats = [
    { icon: CalendarClock, label: "Өнөөдрийн захиалга", value: "48", delta: "+12%" },
    { icon: Wallet, label: "Орлого", value: "2.4M₮", delta: "+8.4%" },
    { icon: Users, label: "Шинэ хэрэглэгч", value: "24", delta: "+5" },
    { icon: XCircle, label: "Цуцлагдсан", value: "3", delta: "-2" },
  ];
  const popular = [
    { n: "Signature цогц", pct: 92 },
    { n: "Gel маникюр", pct: 78 },
    { n: "Массаж", pct: 65 },
    { n: "Хумсны загвар", pct: 42 },
  ];
  return (
    <section className="relative py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Тайлан"
          title="Мэдээлэлд суурилсан шийдвэр"
          desc="Орлого, ачаалал, ажилтны идэвх — бүх мэдээллийг бодит цагт."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="h-10 w-10 grid place-items-center rounded-xl bg-brand-soft text-[var(--brand-2)]">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="text-xs text-[var(--success)] font-semibold">{s.delta}</span>
              </div>
              <p className="mt-4 text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-border/80 bg-surface/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Долоо хоногийн орлого</h3>
              <span className="text-xs text-[var(--success)] inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +18.2%
              </span>
            </div>
            <div className="mt-6 h-40 flex items-end gap-2">
              {revenueSeries.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(v / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03, duration: 0.5 }}
                  className="flex-1 rounded-t bg-gradient-brand"
                />
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/80 bg-surface/80 p-6 shadow-sm">
            <h3 className="font-semibold">Түгээмэл үйлчилгээ</h3>
            <div className="mt-4 space-y-3">
              {popular.map((p) => (
                <div key={p.n}>
                  <div className="flex justify-between text-sm">
                    <span>{p.n}</span>
                    <span className="text-muted-foreground">{p.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-gradient-brand"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BusinessWorkflow() {
  const steps = [
    {
      title: "Байгууллагаа бүртгүүлэх",
      desc: "Хэдхэн минутанд Tanu Business дээр бүртгэлээ үүсгээрэй.",
    },
    {
      title: "Үйлчилгээ, ажилтнаа нэмэх",
      desc: "Үйлчилгээний жагсаалт, үнэ, ажилтны хуваарь тохируулна.",
    },
    {
      title: "Захиалгаа хүлээн авах",
      desc: "Tanu хэрэглэгчид таны үйлчилгээг олж захиалж эхэлнэ.",
    },
    { title: "Үр дүнгээ хянах", desc: "Бодит цагийн тайлангаар үр дүнгээ хянан, оновчилно." },
  ];
  return (
    <section
      id="pricing"
      className="relative border-y border-border/60 bg-surface-muted/35 py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Ажлын урсгал" title="4 алхамтай нэвтрүүлэлт" />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-soft"
            >
              <span className="text-4xl font-extrabold text-gradient-brand leading-none">
                0{i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BusinessTypes() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Ямар бизнест тохиромжтой вэ?"
          title="Олон салбарын байгууллагууд Tanu-г ашигладаг"
        />
        <div className="mt-10 grid gap-3 grid-cols-2 md:grid-cols-4">
          {bizTypes.map((t, i) => {
            const Icon = iconSet[t.icon] ?? Icons.Sparkles;
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="group rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-glow"
              >
                <div className="h-11 w-11 rounded-2xl grid place-items-center bg-brand-soft text-[var(--brand-2)] group-hover:bg-gradient-brand group-hover:text-white transition">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-semibold">{t.name}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BusinessCta({ onOpenSignup }: { onOpenSignup: () => void }) {
  return (
    <section id="biz-cta" className="py-20 md:py-24">
      <div className="mx-auto max-w-5xl px-5">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface/85 p-10 shadow-[0_35px_90px_-48px_color-mix(in_oklch,var(--brand)_85%,transparent)] md:p-16">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklch, var(--brand-2) 40%, transparent), transparent 70%)",
            }}
          />
          <TanuMark
            variant="navy"
            className="absolute -right-8 -top-8 h-48 rotate-6 opacity-[0.08]"
          />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Бизнесээ Tanu-тай хамт <span className="text-gradient-brand">өсгөөрэй</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Хуваарь, захиалга, ажилтан болон хэрэглэгчээ нэг системээс удирдаж, шинэ хэрэглэгчдэд
              хүрээрэй.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={onOpenSignup}
                className="rounded-xl bg-primary px-6 text-primary-foreground hover:-translate-y-0.5"
              >
                Үнэгүй эхлүүлэх
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl bg-surface/60 px-6 hover:-translate-y-0.5"
                onClick={() =>
                  document
                    .getElementById("solutions")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Demo үзэх
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
