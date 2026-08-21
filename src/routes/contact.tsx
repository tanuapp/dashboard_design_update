import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { Background } from "@/components/effects/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Холбоо барих - TanuSoft" },
      {
        name: "description",
        content:
          "TanuSoft ХХК-тай цахим шуудан, утас болон оффисын байршлаар холбогдох албан ёсны мэдээлэл.",
      },
      { property: "og:title", content: "Холбоо барих - TanuSoft" },
      {
        property: "og:description",
        content: "TanuSoft багтай холбогдох утас, цахим шуудан болон оффисын байршлын мэдээлэл.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const contactInfo = [
  {
    label: "Цахим хаяг",
    value: "info.tanusoft@gmail.com",
    caption: "Асуулт, санал хүсэлтээ илгээгээрэй",
    href: "mailto:info.tanusoft@gmail.com",
    action: "И-мэйл бичих",
    Icon: Mail,
  },
  {
    label: "Холбоо барих",
    value: "7570-1005",
    caption: "Ажлын өдрүүдэд шуурхай хариулна",
    href: "tel:+97675701005",
    action: "Залгах",
    Icon: Phone,
  },
  {
    label: "Байршил",
    value: "Монголын залуучуудын холбоо, 210 тоот\nУлаанбаатар хот, Монгол Улс",
    caption: "TanuSoft оффис",
    href: "https://www.google.com/maps/search/?api=1&query=%D0%9C%D0%BE%D0%BD%D0%B3%D0%BE%D0%BB%D1%8B%D0%BD%20%D0%B7%D0%B0%D0%BB%D1%83%D1%83%D1%87%D1%83%D1%83%D0%B4%D1%8B%D0%BD%20%D1%85%D0%BE%D0%BB%D0%B1%D0%BE%D0%BE%20210%20%D1%82%D0%BE%D0%BE%D1%82%20%D0%A3%D0%BB%D0%B0%D0%B0%D0%BD%D0%B1%D0%B0%D0%B0%D1%82%D0%B0%D1%80",
    action: "Газрын зураг",
    Icon: MapPin,
  },
];

const quickFacts = [
  { label: "Ажиллах цаг", value: "09:00 - 18:00", Icon: Clock3 },
  { label: "Хариу өгөх", value: "1 ажлын өдөр", Icon: MessageCircle },
  { label: "Байршил", value: "Улаанбаатар", Icon: Building2 },
];

function ContactPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Background />
      <Navbar
        onOpenBusinessSignup={() =>
          window.location.assign("https://admin.tanu.mn/auth/boxed-signup")
        }
      />

      <main id="top" className="relative overflow-hidden">
        <HeroSection />
        <ContactCards />
        <VisitSection />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-12 pt-28 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-16 lg:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/15 bg-brand-soft/75 px-3 py-1.5 text-xs font-semibold text-[var(--brand)] shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_12px_var(--success)]" />
          TanuSoft support
        </div>

        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
          Бидэнтэй холбогдох мэдээлэл
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          Tanu үйлчилгээ, байгууллагын бүртгэл, хамтын ажиллагаа болон техникийн асуултаа бидэнд
          илгээгээрэй. Бид таны хүсэлтийг зөв багт нь хурдан хүргэж хариу өгнө.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl bg-gradient-brand text-white shadow-glow">
            <a href="tel:+97675701005">
              <Phone className="mr-2 h-4 w-4" />
              7570-1005
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-[var(--brand)]/20 bg-surface/70 text-foreground backdrop-blur hover:bg-brand-soft"
          >
            <a href="mailto:info.tanusoft@gmail.com">
              <Mail className="mr-2 h-4 w-4" />
              И-мэйл бичих
            </a>
          </Button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {quickFacts.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-border/80 bg-surface/70 p-4 shadow-sm backdrop-blur"
            >
              <Icon className="h-5 w-5 text-[var(--brand)]" />
              <p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <ContactShowcase />
    </section>
  );
}

function ContactShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto min-h-[430px] w-full max-w-[360px] overflow-hidden sm:min-h-[520px] sm:max-w-[560px] lg:min-h-[600px]"
    >
      <div className="absolute left-4 right-4 top-8 h-[82%] rounded-[1.75rem] border border-[var(--brand)]/15 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--surface)_84%,transparent),color-mix(in_oklch,var(--brand-soft)_82%,transparent))] shadow-[0_30px_80px_-46px_color-mix(in_oklch,var(--brand)_60%,transparent)] backdrop-blur sm:left-6 sm:right-6 sm:rounded-[2rem]" />

      <img
        src="/home.PNG"
        alt="Tanu аппын нүүр дэлгэц"
        className="absolute left-2 top-0 w-[54%] max-w-[230px] rounded-[1.4rem] border border-white/70 shadow-[0_24px_70px_-34px_rgba(38,32,110,.55)] sm:left-0 sm:w-[46%] sm:rounded-[1.8rem]"
      />
      <img
        src="/detail.PNG"
        alt="Tanu аппын байгууллагын дэлгэрэнгүй дэлгэц"
        className="absolute bottom-8 right-2 w-[54%] max-w-[240px] rounded-[1.4rem] border border-white/70 shadow-[0_26px_76px_-34px_rgba(38,32,110,.65)] sm:bottom-4 sm:right-0 sm:w-[48%] sm:rounded-[1.8rem]"
      />

      <div className="absolute left-10 right-2 top-[36%] rounded-2xl border border-[var(--brand)]/15 bg-surface/90 p-4 shadow-soft backdrop-blur sm:left-[31%] sm:right-6 sm:top-[24%] sm:rounded-3xl sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow sm:h-12 sm:w-12">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">TanuSoft</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Хэрэглэгч болон байгууллагын багт тань тохирох хариуг өгнө.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2 text-sm">
          {["Баталгаажсан мэдээлэл", "Шуурхай холболт", "Найдвартай үйлчилгээ"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ContactCards() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
      {contactInfo.map(({ label, value, caption, href, action, Icon }, index) => (
        <a
          key={label}
          href={href}
          target={label === "Байршил" ? "_blank" : undefined}
          rel={label === "Байршил" ? "noreferrer" : undefined}
          className="group flex min-h-[230px] flex-col rounded-2xl border border-border/80 bg-surface/82 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-[var(--brand)]/28 hover:bg-surface hover:shadow-glow"
          style={{ transitionDelay: `${index * 35}ms` }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--brand)]/15 bg-brand-soft text-[var(--brand)]">
              <Icon className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-[var(--brand)]">{label}</p>
            <p className="mt-2 whitespace-pre-line text-lg font-bold leading-7 text-foreground">
              {value}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{caption}</p>
          </div>

          <span className="mt-auto pt-5 text-sm font-semibold text-[var(--brand)]">{action}</span>
        </a>
      ))}
    </section>
  );
}

function VisitSection() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
      <div className="rounded-3xl border border-[var(--brand)]/15 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--surface)_88%,transparent),color-mix(in_oklch,var(--brand-soft)_64%,transparent))] p-6 shadow-soft backdrop-blur sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
          TanuSoft ХХК
        </h2>
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          ТАНУСОФТ ХХК нь вэб, апп хөгжүүлэх, техник технологийн шинэ бүтээгдэхүүнийг зах зээлд
          гаргах эрхэм зорилготойгоор 2020 оноос эхлэн ажиллаж байгаа старт-ап компани юм.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl bg-gradient-brand text-white shadow-glow">
            <a href="https://admin.tanu.mn/auth/boxed-signup">
              Байгууллага бүртгүүлэх
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-[var(--brand)]/20 bg-surface/70 hover:bg-brand-soft"
          >
            <a href="https://www.tanu.mn/" target="_blank" rel="noreferrer">
              Нүүр хуудас
            </a>
          </Button>
        </div>
      </div>

      <a
        href={contactInfo[2].href}
        target="_blank"
        rel="noreferrer"
        className="group relative min-h-[360px] overflow-hidden rounded-3xl border border-border bg-surface/78 shadow-soft backdrop-blur"
        aria-label="TanuSoft оффисын байршлыг газрын зураг дээр нээх"
      >
        <div className="absolute inset-0 grid-bg opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_45%,color-mix(in_oklch,var(--brand)_22%,transparent),transparent_28%),linear-gradient(135deg,color-mix(in_oklch,var(--brand-soft)_66%,transparent),transparent_55%)]" />
        <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-brand text-white shadow-[0_20px_60px_-18px_color-mix(in_oklch,var(--brand)_90%,transparent)] transition group-hover:scale-105">
          <MapPin className="h-8 w-8" />
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/55 bg-surface/88 p-5 shadow-soft backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--brand)]">Оффисын байршил</p>
              <p className="mt-2 whitespace-pre-line text-base font-bold leading-7 text-foreground">
                {contactInfo[2].value}
              </p>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--brand)]/15 bg-brand-soft text-[var(--brand)]">
              <Navigation className="h-4 w-4" />
            </span>
          </div>
        </div>
      </a>
    </section>
  );
}
