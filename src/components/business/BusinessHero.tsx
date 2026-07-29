import { motion } from "motion/react";
import { LayoutDashboard, TrendingUp, Users, CalendarClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bizStats, revenueSeries } from "@/lib/mock-data";

export function BusinessHero({ onOpenSignup }: { onOpenSignup: () => void }) {
  return (
    <section id="top" className="relative pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-5 grid gap-12 lg:grid-cols-[1fr,1.15fr] items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tanu Business
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
            Бизнесийн бүх үйл ажиллагааг
            <br />
            <span className="text-gradient-brand">нэг дороос</span> удирд
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-muted-foreground">
            Захиалга, ажилтан, үйлчилгээ, хуваарь, хэрэглэгч болон тайлангаа
            нэг системээс хялбар удирдаарай.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={onOpenSignup} className="bg-primary text-primary-foreground hover:opacity-90 shadow-soft">
              Байгууллага бүртгүүлэх <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" /> Dashboard үзэх
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 max-w-md">
            {bizStats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold">{s.value}</span>
                  <span className="text-[11px] text-[var(--success)]">{s.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <DashboardMockup />
      </div>
    </section>
  );
}

function DashboardMockup() {
  const max = Math.max(...revenueSeries);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative"
    >
      <div className="relative rounded-2xl border border-border bg-surface shadow-glow overflow-hidden">
        {/* Dashboard header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            </div>
            <span className="ml-2 text-xs text-muted-foreground">Tanu Business · Dashboard</span>
          </div>
          <div className="text-[10px] text-muted-foreground">Өнөөдөр · 09:12</div>
        </div>

        <div className="p-4 grid grid-cols-3 gap-3">
          {/* Sidebar */}
          <div className="hidden sm:flex flex-col gap-2 text-xs">
            {[
              { label: "Хяналт", active: true },
              { label: "Захиалга" },
              { label: "Ажилтан" },
              { label: "Үйлчилгээ" },
              { label: "Хэрэглэгч" },
              { label: "Тайлан" },
            ].map((i) => (
              <div key={i.label} className={`rounded-md px-2.5 py-1.5 ${i.active ? "bg-gradient-brand text-white" : "text-muted-foreground hover:bg-secondary"}`}>
                {i.label}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="col-span-3 sm:col-span-2 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <MiniStat icon={<CalendarClock className="h-3.5 w-3.5" />} label="Захиалга" value="48" />
              <MiniStat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Орлого" value="2.4M₮" />
              <MiniStat icon={<Users className="h-3.5 w-3.5" />} label="Хэрэглэгч" value="24" />
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-border bg-surface-muted p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Долоо хоногийн орлого</p>
                <span className="text-[10px] text-[var(--success)]">+18.2%</span>
              </div>
              <div className="mt-3 h-24 flex items-end gap-1.5">
                {revenueSeries.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / max) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.03, duration: 0.5 }}
                    className="flex-1 rounded-t bg-gradient-brand"
                  />
                ))}
              </div>
            </div>

            {/* Booking list */}
            <div className="rounded-xl border border-border bg-surface-muted p-3">
              <p className="text-xs font-semibold mb-2">Өнөөдрийн захиалга</p>
              <div className="space-y-1.5">
                {[
                  { t: "10:00", n: "Б. Оюунтуяа", s: "Signature", c: "confirmed" },
                  { t: "11:30", n: "Ц. Мөнхзул", s: "Gel маникюр", c: "pending" },
                  { t: "14:30", n: "Д. Түвшин", s: "Массаж", c: "confirmed" },
                ].map((b) => (
                  <div key={b.t} className="flex items-center justify-between text-[11px] rounded-md px-2 py-1.5 bg-surface">
                    <span className="font-mono text-muted-foreground">{b.t}</span>
                    <span className="flex-1 ml-2 truncate">{b.n}</span>
                    <span className="text-muted-foreground truncate mx-2">{b.s}</span>
                    <span className={`px-1.5 py-0.5 rounded ${b.c === "confirmed" ? "bg-[color-mix(in_oklch,var(--success)_20%,transparent)] text-[var(--success)]" : "bg-[color-mix(in_oklch,var(--warning)_20%,transparent)] text-[var(--warning)]"}`}>
                      {b.c === "confirmed" ? "Батлагдсан" : "Хүлээгдэж" }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating widgets */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="hidden md:block absolute -top-6 -right-4 w-52 rounded-xl border border-border bg-surface p-3 shadow-glow float-y"
      >
        <p className="text-[10px] text-muted-foreground">Ажилтны идэвх</p>
        <div className="mt-2 space-y-1.5">
          {[
            { n: "Э. Наран", p: 92 },
            { n: "Б. Сараа", p: 78 },
            { n: "Т. Билгүүн", p: 64 },
          ].map((e) => (
            <div key={e.n} className="text-[11px]">
              <div className="flex justify-between"><span>{e.n}</span><span className="text-muted-foreground">{e.p}%</span></div>
              <div className="h-1 rounded-full bg-secondary overflow-hidden mt-0.5">
                <div className="h-full bg-gradient-brand" style={{ width: `${e.p}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">{icon}{label}</div>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
