import { motion } from "motion/react";
import {
  CalendarDays,
  Download,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
            Гоо сайхан, эмнэлэг, сургалт, тасалбар болон өдөр тутмын үйлчилгээг web-ээр хайж,
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
        className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
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
      className="relative mx-auto min-h-[620px] w-full max-w-xl lg:translate-x-4"
    >
      <div
        aria-hidden
        className="absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-2)_28%,transparent),transparent_68%)] blur-2xl"
      />
      <div
        aria-hidden
        className="absolute inset-x-4 top-20 -z-10 h-[72%] rotate-3 rounded-[4rem] border border-[var(--brand)]/15 bg-gradient-to-b from-[var(--brand)]/10 to-transparent"
      />

      <div className="hero-phone-scene relative h-[620px] w-full">
        <PhoneScreenshot
          src="/detail.PNG"
          alt="Tanu аппын байгууллагын дэлгэрэнгүй дэлгэц"
          className="absolute left-[54%] top-8 z-0 w-[205px] sm:w-[225px] md:w-[245px]"
          delay={0.2}
          variant="detail"
        />
        <PhoneScreenshot
          src="/home.PNG"
          alt="Tanu аппын нүүр дэлгэц"
          className="absolute left-[5%] top-28 z-10 w-[225px] sm:w-[250px] md:w-[270px]"
          delay={0}
          variant="home"
        />
      </div>
    </motion.div>
  );
}

function PhoneScreenshot({
  src,
  alt,
  className,
  delay,
  variant,
}: {
  src: string;
  alt: string;
  className: string;
  delay: number;
  variant: "home" | "detail";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 12, rotateY: variant === "home" ? -28 : 22 }}
      animate={{ opacity: 1, y: 0, rotateX: 8, rotateY: variant === "home" ? -18 : 18 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "hero-phone-shell group rounded-[2.4rem] border-[8px] border-[#101426] bg-[#101426] p-1 shadow-[0_42px_90px_-42px_rgba(16,23,52,0.85)] ring-1 ring-white/20",
        variant === "home" ? "hero-phone-home" : "hero-phone-detail",
        className,
      )}
    >
      <span className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-[#101426]" />
      <span className="hero-phone-glare absolute inset-1 z-10 rounded-[2rem]" />
      <span className="pointer-events-none absolute -inset-3 -z-10 rounded-[2.7rem] bg-[var(--brand)]/15 blur-2xl" />
      <img
        src={src}
        alt={alt}
        className="block aspect-[9/19.4] w-full rounded-[1.85rem] object-cover"
        loading="eager"
      />
    </motion.div>
  );
}
