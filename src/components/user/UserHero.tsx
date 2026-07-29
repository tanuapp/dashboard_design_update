import { motion, AnimatePresence } from "motion/react";
import { Search, MapPin, CalendarDays, Sparkles, Star, ShieldCheck, Zap, Download, Apple, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UserHero({ onSearch, onOpenBooking }: { onSearch: () => void; onOpenBooking: () => void }) {
  return (
    <section id="top" className="relative pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-5 grid gap-12 lg:grid-cols-[1.05fr,1fr] items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
            Үйлчилгээг илүү хялбар захиалаарай
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
            Өөрт хэрэгтэй үйлчилгээг
            <br />
            <span className="text-gradient-brand">нэг дороос</span> олоорой
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-muted-foreground">
            Гоо сайхан, эрүүл мэнд, сургалт, спорт болон өдөр тутмын үйлчилгээг хайж,
            тохирох цагаа сонгон хялбар захиалаарай.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={onSearch} className="bg-gradient-brand text-white shadow-glow hover:opacity-90">
              <Search className="mr-1.5 h-4 w-4" /> Үйлчилгээ хайх
            </Button>
            <Button size="lg" variant="outline" className="gap-1.5">
              <Download className="h-4 w-4" /> Tanu апп татах
            </Button>
          </div>

          <SearchBar onSearch={onSearch} />

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Trust icon={<ShieldCheck className="h-4 w-4 text-[var(--brand)]" />} text="Баталгаажсан байгууллагууд" />
            <Trust icon={<Zap className="h-4 w-4 text-[var(--brand)]" />} text="Хурдан цаг захиалга" />
            <Trust icon={<Star className="h-4 w-4 text-[var(--brand)]" />} text="Бодит үнэлгээ, сэтгэгдэл" />
          </div>
        </motion.div>

        <HeroVisual onOpenBooking={onOpenBooking} />
      </div>
    </section>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">{icon}{text}</span>
  );
}

function SearchBar({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="mt-8 glass rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-soft">
      <Field icon={<Search className="h-4 w-4" />} placeholder="Үйлчилгээ эсвэл байгууллага" />
      <Field icon={<MapPin className="h-4 w-4" />} placeholder="Байршил" />
      <Field icon={<CalendarDays className="h-4 w-4" />} placeholder="Огноо" />
      <Button size="lg" onClick={onSearch} className="bg-gradient-brand text-white md:w-auto">
        Хайх
      </Button>
    </div>
  );
}

function Field({ icon, placeholder }: { icon: React.ReactNode; placeholder: string }) {
  return (
    <label className="flex items-center gap-2 rounded-xl px-3 py-2 bg-surface flex-1 min-w-0 border border-transparent focus-within:border-border">
      <span className="text-muted-foreground">{icon}</span>
      <Input placeholder={placeholder} className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 h-8" />
    </label>
  );
}

function HeroVisual({ onOpenBooking }: { onOpenBooking: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* Phone frame */}
      <div className="relative mx-auto aspect-[9/17] w-[280px] md:w-[320px] rounded-[42px] border-[10px] border-foreground/10 bg-surface shadow-glow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_oklch,var(--brand)_18%,var(--surface))] to-surface" />
        <div className="relative p-4 h-full flex flex-col gap-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>9:41</span>
            <span>••••</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Сайн байна уу,</p>
            <p className="text-base font-bold">Тэмүүлэн 👋</p>
          </div>
          <div className="rounded-xl bg-surface-muted p-2.5 flex items-center gap-2 text-xs">
            <Search className="h-3.5 w-3.5" /> <span className="text-muted-foreground">Үйлчилгээ хайх...</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[9px]">
            {["Гоо сайхан", "Эрүүл", "Спорт", "Сургалт"].map((c) => (
              <div key={c} className="flex flex-col items-center gap-1">
                <div className="h-9 w-9 rounded-lg bg-gradient-brand grid place-items-center text-white">✦</div>
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
            <button onClick={onOpenBooking} className="mt-2 w-full rounded-md bg-gradient-brand text-white text-[11px] py-1.5 font-medium">
              Цаг захиалах
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
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
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
            <span key={t} className={`rounded-md px-1.5 py-1 text-center border ${i === 2 ? "bg-gradient-brand text-white border-transparent" : "border-border bg-surface-muted"}`}>{t}</span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
