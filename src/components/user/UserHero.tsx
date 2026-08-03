import { motion } from "motion/react";
import {
  Search,
  MapPin,
  CalendarDays,
  Sparkles,
  Star,
  ShieldCheck,
  Zap,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TanuMark } from "@/components/brand/Logo";

const scrollToApp = () =>
  document.getElementById("app")?.scrollIntoView({ behavior: "smooth", block: "start" });

export function UserHero({ onSearch }: { onSearch: () => void }) {
  return (
    <section id="top" className="relative isolate overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
      <div
        aria-hidden
        className="absolute left-[8%] top-24 -z-10 h-72 w-72 rounded-full bg-[var(--brand)]/10 blur-[100px]"
      />
      <div
        aria-hidden
        className="absolute right-[4%] top-36 -z-10 h-[34rem] w-[34rem] rounded-full border border-[var(--brand)]/10 bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand)_18%,transparent),transparent_66%)]"
      />
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-[1.08fr_.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/20 bg-surface/70 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
            Үйлчилгээгээ web-ээр хялбар олоорой
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.03] tracking-[-0.045em] sm:text-5xl lg:text-[4.15rem]">
            Өөрт хэрэгтэй үйлчилгээг
            <br />
            <span className="relative text-gradient-brand">
              нэг дороос
              <span className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-[var(--brand)]/0 via-[var(--brand)]/70 to-[var(--brand-2)]/0" />
            </span>{" "}
            олоорой
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Гоо сайхан, эрүүл мэнд, сургалт, спорт болон өдөр тутмын үйлчилгээг web-ээр хайж,
            харьцуулаад Tanu апп-аар цагаа захиалаарай.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={onSearch}
              className="h-12 rounded-xl bg-gradient-brand px-6 text-white shadow-glow hover:-translate-y-0.5 hover:opacity-95"
            >
              <Search className="mr-1.5 h-4 w-4" /> Үйлчилгээ хайх
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-1.5 rounded-xl border-border/80 bg-surface/60 px-6 backdrop-blur hover:-translate-y-0.5"
              onClick={scrollToApp}
            >
              <Download className="h-4 w-4" /> Tanu апп татах
            </Button>
          </div>

          <SearchBar onSearch={onSearch} />

          <div className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <Trust
              icon={<ShieldCheck className="h-4 w-4 text-[var(--brand)]" />}
              text="Баталгаажсан байгууллагууд"
            />
            <Trust
              icon={<Zap className="h-4 w-4 text-[var(--brand)]" />}
              text="Аппаар хурдан захиалга"
            />
            <Trust
              icon={<Star className="h-4 w-4 text-[var(--brand)]" />}
              text="Бодит үнэлгээ, сэтгэгдэл"
            />
          </div>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border/70 bg-surface/55 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur">
      {icon}
      {text}
    </span>
  );
}

function SearchBar({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="glass mt-8 flex flex-col gap-2 rounded-2xl p-2 shadow-[0_18px_50px_-30px_rgba(17,82,179,.65)] md:flex-row">
      <Field icon={<Search className="h-4 w-4" />} placeholder="Үйлчилгээ эсвэл байгууллага" />
      <Field icon={<MapPin className="h-4 w-4" />} placeholder="Байршил" />
      <Field icon={<CalendarDays className="h-4 w-4" />} placeholder="Огноо" />
      <Button
        size="lg"
        onClick={onSearch}
        className="rounded-xl bg-gradient-brand px-6 text-white md:w-auto"
      >
        Хайх
      </Button>
    </div>
  );
}

function Field({ icon, placeholder }: { icon: React.ReactNode; placeholder: string }) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-transparent bg-surface/90 px-3 py-2 transition focus-within:border-[var(--brand)]/35 focus-within:shadow-sm">
      <span className="text-muted-foreground">{icon}</span>
      <Input
        placeholder={placeholder}
        className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 h-8"
      />
    </label>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative mx-auto w-full max-w-md lg:translate-x-4"
    >
      <div
        aria-hidden
        className="absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-2)_28%,transparent),transparent_68%)] blur-2xl"
      />
      <div
        aria-hidden
        className="absolute inset-x-4 top-16 -z-10 h-[72%] rotate-3 rounded-[4rem] border border-[var(--brand)]/15 bg-gradient-to-b from-[var(--brand)]/10 to-transparent"
      />
      {/* Phone frame */}
      <div className="relative mx-auto aspect-[9/17] w-[280px] overflow-hidden rounded-[42px] border-[9px] border-foreground/10 bg-surface shadow-[0_40px_90px_-42px_color-mix(in_oklch,var(--brand)_75%,transparent)] ring-1 ring-white/20 md:w-[320px]">
        <div className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_oklch,var(--brand)_18%,var(--surface))] to-surface" />
        <div className="relative p-4 h-full flex flex-col gap-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>9:41</span>
            <span>••••</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface/55 p-2 backdrop-blur">
            <TanuMark variant="gradient" className="h-7" />
            <span className="font-display text-sm font-extrabold tracking-[-0.05em]">tanu</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_12px_var(--success)]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Сайн байна уу,</p>
            <p className="text-base font-bold">Тэмүүлэн 👋</p>
          </div>
          <div className="rounded-xl bg-surface-muted p-2.5 flex items-center gap-2 text-xs">
            <Search className="h-3.5 w-3.5" />{" "}
            <span className="text-muted-foreground">Үйлчилгээ хайх...</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[9px]">
            {["Гоо сайхан", "Эрүүл", "Спорт", "Сургалт"].map((c) => (
              <div key={c} className="flex flex-col items-center gap-1">
                <div className="h-9 w-9 rounded-lg bg-gradient-brand grid place-items-center text-white">
                  ✦
                </div>
                <span className="text-muted-foreground truncate">{c}</span>
              </div>
            ))}
          </div>
          <div className="mt-1 rounded-xl bg-surface p-3 shadow-soft border border-border">
            <p className="text-[10px] text-muted-foreground">Санал болгож буй</p>
            <p className="text-sm font-semibold mt-0.5">Aura Beauty Studio</p>
            <div className="mt-1 flex items-center gap-1 text-[10px]">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> 4.9 · 312 үнэлгээ
            </div>
            <button
              onClick={scrollToApp}
              className="mt-2 w-full rounded-md bg-gradient-brand text-white text-[11px] py-1.5 font-medium"
            >
              Аппаар захиалах
            </button>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute -left-2 md:-left-16 top-24 w-52 rounded-2xl bg-surface border border-border p-3 shadow-glow float-y"
      >
        <p className="text-[11px] text-muted-foreground">Цаг захиалга</p>
        <p className="text-sm font-semibold mt-0.5">Өнөөдөр · 14:30</p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <div className="h-7 w-7 rounded-full bg-gradient-brand" />
          <div>
            <p className="font-medium">Nordic Nail Bar</p>
            <p className="text-muted-foreground text-[10px]">Gel маникюр</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        style={{ animationDelay: "1.4s" }}
        className="absolute -right-2 md:-right-10 top-8 w-44 rounded-2xl bg-surface border border-border p-3 shadow-soft float-y"
      >
        <div className="flex items-center gap-1 text-yellow-500 text-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        <p className="text-xs mt-1.5">"Хайж байсан үйлчилгээгээ маш хурдан оллоо."</p>
        <p className="text-[10px] text-muted-foreground mt-1">— Оюунтуяа Б.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{ animationDelay: "2.2s" }}
        className="absolute right-4 md:-right-6 bottom-6 w-48 rounded-2xl bg-surface border border-border p-3 shadow-soft float-y"
      >
        <p className="text-[11px] text-muted-foreground">Боломжтой цаг</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
          {["10:00", "13:00", "14:30", "16:00", "18:00", "19:30"].map((t, i) => (
            <span
              key={t}
              className={`rounded-md px-1.5 py-1 text-center border ${i === 2 ? "bg-gradient-brand text-white border-transparent" : "border-border bg-surface-muted"}`}
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
