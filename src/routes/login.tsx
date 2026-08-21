import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Apple,
  Play,
  QrCode,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Moon,
  Sun,
  TrendingUp,
  CalendarClock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { useAuth, type AuthSession } from "@/lib/auth-context";
import { mockBusinessAccounts, bizStats, revenueSeries } from "@/lib/mock-data";
import { TanuUserLogo, TanuBusinessLogo, TanuMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Нэвтрэх — Tanu" }],
  }),
  component: LoginPage,
});

type Variant = "user" | "business";

function LoginPage() {
  const { theme, toggleTheme } = useApp();
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const [variant, setVariant] = useState<Variant>("business");

  // Already-authenticated business users skip the login screen.
  useEffect(() => {
    if (ready && session) navigate({ to: "/business/dashboard" });
  }, [ready, session, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Atmosphere variant={variant} />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:py-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Нүүр хуудас руу буцах
          </Link>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface/70 backdrop-blur transition hover:bg-secondary"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-6 flex justify-center sm:mt-10">
          <VariantSwitch variant={variant} onChange={setVariant} />
        </div>

        <div className="flex flex-1 items-center py-10">
          <AnimatePresence mode="wait">
            {variant === "user" ? (
              <motion.div
                key="user"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-10"
              >
                <UserPanel />
                <UserIllustration />
              </motion.div>
            ) : (
              <motion.div
                key="business"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-10"
              >
                <BusinessPanel />
                <BusinessIllustration />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Atmosphere({ variant }: { variant: Variant }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="wait">
        {variant === "user" ? (
          <motion.div
            key="user-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="absolute right-[-8%] top-[8%] h-[36rem] w-[36rem] rounded-full bg-[var(--brand)]/[0.14] blur-[130px] dark:bg-[var(--brand)]/[0.22]" />
            <div className="absolute left-[-10%] bottom-[-4%] h-[26rem] w-[26rem] rounded-full bg-[var(--brand-2)]/[0.1] blur-[110px] dark:bg-[var(--brand-2)]/[0.16]" />
          </motion.div>
        ) : (
          <motion.div
            key="business-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-x-0 top-0 h-[42rem] grid-bg opacity-[0.15] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div className="absolute right-[-6%] top-[14%] h-[32rem] w-[32rem] rounded-full bg-[var(--brand-2)]/[0.12] blur-[120px] dark:bg-[var(--brand-2)]/[0.18]" />
            <div className="absolute left-[-8%] bottom-[6%] h-[24rem] w-[24rem] rounded-full bg-[var(--brand)]/[0.08] blur-[110px] dark:bg-[var(--brand)]/[0.14]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VariantSwitch({
  variant,
  onChange,
}: {
  variant: Variant;
  onChange: (v: Variant) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Хэрэглэгч / Байгууллага"
      className="relative inline-grid min-h-11 grid-cols-2 items-center rounded-2xl border border-border/80 bg-surface/80 p-1 text-sm font-semibold shadow-sm backdrop-blur"
    >
      <span
        className={cn(
          "absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-xl bg-gradient-brand shadow-sm transition-transform duration-300",
          variant === "business" ? "translate-x-full" : "translate-x-0",
        )}
      />
      <button
        role="tab"
        aria-selected={variant === "user"}
        onClick={() => onChange("user")}
        className={cn(
          "relative z-10 rounded-xl px-5 py-2.5 transition-colors sm:px-7",
          variant === "user" ? "text-white" : "text-muted-foreground",
        )}
      >
        Хэрэглэгч
      </button>
      <button
        role="tab"
        aria-selected={variant === "business"}
        onClick={() => onChange("business")}
        className={cn(
          "relative z-10 rounded-xl px-5 py-2.5 transition-colors sm:px-7",
          variant === "business" ? "text-white" : "text-muted-foreground",
        )}
      >
        Байгууллага
      </button>
    </div>
  );
}

// ================= USER (customer) — app download only =================

function UserPanel() {
  return (
    <div className="mx-auto max-w-md lg:mx-0">
      <TanuUserLogo className="h-10" />
      <span className="mt-7 inline-flex rounded-full border border-[var(--brand)]/15 bg-[var(--brand)]/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
        Tanu апп
      </span>
      <h1 className="mt-4 text-3xl font-extrabold leading-[1.15] tracking-[-0.03em] md:text-[2.35rem]">
        Tanu үйлчилгээг апп-аас ашиглаарай
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        Үйлчилгээ хайх, цаг захиалах, захиалгаа хянах болон урамшууллаа ашиглахын тулд Tanu аппыг
        татаж аваарай.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => toast.info("App Store — удахгүй!")}
          className="flex items-center gap-2.5 rounded-2xl bg-foreground px-4 py-2.5 text-background shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
        >
          <Apple className="h-6 w-6 shrink-0" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-medium opacity-80">Download on the</span>
            <span className="text-[15px] font-semibold tracking-tight">App Store</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => toast.info("Google Play — удахгүй!")}
          className="flex items-center gap-2.5 rounded-2xl bg-foreground px-4 py-2.5 text-background shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
        >
          <Play className="h-5 w-5 shrink-0" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-medium opacity-80">GET IT ON</span>
            <span className="text-[15px] font-semibold tracking-tight">Google Play</span>
          </span>
        </button>
      </div>

      <div className="mt-4 flex max-w-xs items-center gap-4 rounded-2xl border border-border bg-surface/80 p-4 shadow-sm backdrop-blur">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-[var(--brand)]/[0.08] text-[var(--brand)]">
          <QrCode className="h-14 w-14" />
        </div>
        <p className="text-sm font-medium leading-snug text-foreground/80">
          QR-ээ уншуулж
          <br /> татаарай
        </p>
      </div>
    </div>
  );
}

function UserIllustration() {
  return (
    <div className="relative mx-auto flex justify-center py-4">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 m-auto h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand)_28%,transparent)_0%,transparent_70%)] blur-2xl"
      />
      <div className="relative rounded-[3rem] bg-gradient-to-b from-[var(--brand)]/[0.12] to-[var(--brand-2)]/[0.06] p-4 shadow-[0_50px_100px_-40px_color-mix(in_oklch,var(--brand)_45%,transparent)] ring-1 ring-[var(--brand)]/10">
        <div className="relative aspect-[9/18.5] w-[240px] overflow-hidden rounded-[2.4rem] border-[6px] border-white bg-surface shadow-[0_20px_60px_-20px_rgba(15,35,80,0.35)] dark:border-white/10 sm:w-[260px]">
          <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-foreground/90" />
          <div className="flex h-full flex-col bg-gradient-to-b from-[color-mix(in_oklch,var(--brand)_5%,var(--surface))] to-surface px-4 pb-6 pt-8">
            <div className="flex items-center gap-2">
              <TanuMark variant="gradient" className="h-7" />
              <span className="font-display text-sm font-extrabold tracking-[-0.05em] text-foreground">
                tanu
              </span>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">Сайн байна уу,</p>
            <p className="text-base font-bold">Тэмүүлэн 👋</p>
            <div className="mt-3 rounded-xl bg-surface-muted p-2.5 text-xs text-muted-foreground">
              Үйлчилгээ хайх...
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-[9px]">
              {["Гоо сайхан", "Эрүүл", "Спорт", "Сургалт"].map((c) => (
                <div key={c} className="flex flex-col items-center gap-1">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-white">
                    ✦
                  </div>
                  <span className="truncate text-muted-foreground">{c}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto rounded-xl bg-gradient-brand p-3 text-white shadow-glow">
              <p className="text-[10px] font-medium opacity-90">Санал болгож буй</p>
              <p className="mt-0.5 text-[11px] font-bold">Aura Beauty Studio · 4.9★</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= BUSINESS — login form =================

function BusinessPanel() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    // Demo mode: any input (or none) is accepted — falls back to the owner
    // account when it doesn't match one of the mock credentials below.
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 700));

    const value = identifier.trim();
    const account =
      mockBusinessAccounts.find(
        (a) =>
          (a.email === value || a.phone === value.replace(/\s/g, "")) && a.password === password,
      ) ??
      mockBusinessAccounts.find((a) => a.email === value || a.phone === value.replace(/\s/g, "")) ??
      mockBusinessAccounts[0];

    setStatus("success");
    const session: AuthSession = {
      role: account.role,
      name: account.name,
      email: account.email,
      org: account.org,
      organizationType: account.organizationType,
      permissionPreset: account.permissionPreset,
      memberships: account.memberships,
    };
    login(session, remember);
    setTimeout(() => navigate({ to: "/business/dashboard" }), 550);
  };

  return (
    <div className="mx-auto w-full max-w-md lg:mx-0">
      <TanuBusinessLogo className="h-10" />
      <h1 className="mt-7 text-3xl font-extrabold leading-[1.15] tracking-[-0.03em] md:text-[2.15rem]">
        Tanu Business-д нэвтрэх
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Захиалга, ажилтан, үйлчилгээ болон бизнесийн үйл ажиллагаагаа нэг дороос удирдаарай.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
        {status === "success" && (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--success)]/25 bg-[var(--success)]/[0.08] px-3.5 py-2.5 text-sm text-[var(--success)]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Амжилттай нэвтэрлээ. Шилжиж байна...
          </div>
        )}

        <FormField label="И-мэйл эсвэл утасны дугаар">
          <Input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="owner@tanu.mn"
            autoComplete="username"
            disabled={status !== "idle"}
          />
        </FormField>

        <FormField label="Нууц үг">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={status !== "idle"}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
              className="absolute inset-y-0 right-0 grid w-9 place-items-center text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 select-none text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-[var(--brand)]"
            />
            Намайг сана
          </label>
          <button
            type="button"
            onClick={() => toast.info("Нууц үг сэргээх холбоос удахгүй!")}
            className="font-medium text-[var(--brand)] hover:underline"
          >
            Нууц үгээ мартсан
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={status === "loading"}
          className="w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90"
        >
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "loading" ? "Нэвтэрч байна..." : "Нэвтрэх"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Шинэ байгууллага уу?{" "}
          <a
            href="https://admin.tanu.mn/auth/boxed-signup"
            className="font-semibold text-[var(--brand)] hover:underline"
          >
            Бүртгүүлэх
          </a>
        </p>
      </form>

      <p className="mt-6 rounded-xl border border-dashed border-border/80 px-3.5 py-2.5 text-center text-xs leading-relaxed text-muted-foreground">
        Хувийн: owner@tanu.mn · Төрийн: government@tanu.mn
        <br /> Ажилтан: gov.employee@tanu.mn · Нууц үг: tanu123
      </p>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function BusinessIllustration() {
  const max = Math.max(...revenueSeries);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative mx-auto w-full max-w-md"
    >
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-2)_24%,transparent),transparent_66%)] blur-2xl"
      />
      <div className="relative overflow-hidden rounded-[1.35rem] border border-border/80 bg-surface shadow-[0_38px_100px_-52px_color-mix(in_oklch,var(--brand)_80%,transparent)] ring-1 ring-white/10">
        <div className="flex items-center justify-between border-b border-border bg-surface-muted/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            </div>
            <span className="ml-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <TanuMark variant="navy" className="h-5" />
              Tanu Business
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">Өнөөдөр</div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            <MiniStat
              icon={<CalendarClock className="h-3.5 w-3.5" />}
              label={bizStats[0].label}
              value={bizStats[0].value}
            />
            <MiniStat
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label={bizStats[1].label}
              value={bizStats[1].value}
            />
            <MiniStat
              icon={<Users className="h-3.5 w-3.5" />}
              label={bizStats[2].label}
              value={bizStats[2].value}
            />
          </div>

          <div className="mt-3 rounded-xl border border-border bg-surface-muted p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold">Долоо хоногийн орлого</p>
              <span className="text-[10px] text-[var(--success)]">+18.2%</span>
            </div>
            <div className="mt-3 flex h-20 items-end gap-1.5">
              {revenueSeries.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / max) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.5 }}
                  className="flex-1 rounded-t bg-gradient-brand"
                />
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-border bg-surface-muted p-3">
            <p className="mb-2 text-xs font-semibold">Өнөөдрийн захиалга</p>
            <div className="space-y-1.5">
              {[
                { t: "10:00", n: "Б. Оюунтуяа", c: "confirmed" },
                { t: "11:30", n: "Ц. Мөнхзул", c: "pending" },
                { t: "14:30", n: "Д. Түвшин", c: "confirmed" },
              ].map((b) => (
                <div
                  key={b.t}
                  className="flex items-center justify-between rounded-md bg-surface px-2 py-1.5 text-[11px]"
                >
                  <span className="font-mono text-muted-foreground">{b.t}</span>
                  <span className="mx-2 flex-1 truncate">{b.n}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5",
                      b.c === "confirmed"
                        ? "bg-[color-mix(in_oklch,var(--success)_20%,transparent)] text-[var(--success)]"
                        : "bg-[color-mix(in_oklch,var(--warning)_20%,transparent)] text-[var(--warning)]",
                    )}
                  >
                    {b.c === "confirmed" ? "Батлагдсан" : "Хүлээгдэж"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
