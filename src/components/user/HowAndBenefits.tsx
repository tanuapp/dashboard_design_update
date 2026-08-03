import { motion } from "motion/react";
import {
  Search,
  CalendarCheck,
  CheckCircle2,
  Star,
  Bell,
  Gift,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { SectionHeader } from "./Categories";

const steps = [
  {
    icon: Search,
    title: "Үйлчилгээгээ хайх",
    desc: "Ангилал, байршил, үнэлгээгээр хайлт хийж, тохирох үйлчилгээгээ ол.",
  },
  {
    icon: CalendarCheck,
    title: "Цагаа сонгох",
    desc: "Боломжит цагийн хуваарийг харж, өөрт тохиромжтой цагаа сонго.",
  },
  {
    icon: CheckCircle2,
    title: "Апп дээр баталгаажуулах",
    desc: "Tanu апп-аар захиалгаа баталгаажуулан, сануулга хүлээн ав.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Tanu апп хэрхэн ажилладаг вэ?" title="Гурван энгийн алхмаар" />
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            aria-hidden
            className="hidden md:block absolute top-9 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[var(--brand)]/40 to-transparent"
          />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-border/80 bg-surface/75 p-7 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-soft"
            >
              <span
                aria-hidden
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--brand)]/[0.055] transition-transform duration-500 group-hover:scale-125"
              />
              <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                <s.icon className="h-6 w-6" />
                <span className="absolute -bottom-2 -right-2 h-6 w-6 grid place-items-center rounded-full bg-surface border border-border text-xs font-bold">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-center text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const benefits = [
  {
    icon: Layers,
    title: "Нэг дор олон үйлчилгээ",
    desc: "Ганц апп-аас олон салбарын үйлчилгээг захиалах боломжтой.",
  },
  {
    icon: ShieldCheck,
    title: "Баталгаажсан байгууллагууд",
    desc: "Tanu-д бүртгэлтэй байгууллагууд албан ёсны баталгаажилттай.",
  },
  {
    icon: CalendarCheck,
    title: "Аппаар цаг захиалах",
    desc: "Tanu апп дээр цагаа сонгож, шууд баталгаажуулна.",
  },
  { icon: Bell, title: "Захиалгын сануулга", desc: "SMS болон push мэдэгдлээр цагаа мартахгүй." },
  {
    icon: Star,
    title: "Үнэлгээ, сэтгэгдэл",
    desc: "Бодит үнэлгээ уншиж, сонголтоо илүү зөв хийнэ.",
  },
  {
    icon: Gift,
    title: "Урамшуулал",
    desc: "Тогтмол урамшуулалт хөнгөлөлт, оноо цуглуулах боломж.",
  },
];

export function Benefits() {
  return (
    <section className="relative border-y border-border/60 bg-surface-muted/35 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader eyebrow="Яагаад Tanu?" title="Tanu-г сонгох 6 шалтгаан" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              className="group rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-soft"
            >
              <div className="h-12 w-12 rounded-2xl grid place-items-center bg-brand-soft text-[var(--brand)] transition group-hover:bg-gradient-brand group-hover:text-white group-hover:shadow-glow">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
