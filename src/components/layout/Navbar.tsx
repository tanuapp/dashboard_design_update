import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Menu, Moon, Sun, X, LogIn } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { BrandLogo } from "@/components/brand/Logo";
import { userNav, businessNav } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenBusinessSignup: () => void;
}

function smoothScrollTo(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id || id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar({ onOpenBusinessSignup }: NavbarProps) {
  const { mode, theme, toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const nav = mode === "business" ? businessNav : userNav;
  const isUser = mode === "user";
  const signinUrl = "https://admin.tanu.mn/auth/boxed-signin";
  const signupUrl = "https://admin.tanu.mn/auth/boxed-signup";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => smoothScrollTo(href), 50);
  };

  const openAppSection = () => {
    setOpen(false);
    setTimeout(() => smoothScrollTo("#app"), 50);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-all duration-300",
        scrolled
          ? "border-border/70 bg-[color-mix(in_oklch,var(--background)_88%,transparent)] shadow-[0_10px_30px_-26px_rgba(8,20,55,.5)] backdrop-blur-xl"
          : "border-border/35 bg-[color-mix(in_oklch,var(--background)_68%,transparent)] backdrop-blur-md",
        isUser &&
          (scrolled
            ? "border-[color-mix(in_oklch,var(--brand)_18%,var(--border))] shadow-[0_18px_44px_-34px_color-mix(in_oklch,var(--brand)_75%,transparent)]"
            : "border-[color-mix(in_oklch,var(--brand)_12%,transparent)]"),
      )}
    >
      {isUser && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-2)]/55 to-transparent"
        />
      )}
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-all duration-300 sm:px-5",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <a
          href="#top"
          onClick={(e) => handleNav(e, "#top")}
          className="shrink-0 rounded-xl focus-visible:outline-offset-4"
          aria-label="Tanu home"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={mode}
              initial={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 6, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className="flex items-center"
            >
              <BrandLogo
                mode={mode}
                className="h-8 [&>span:last-child]:hidden sm:[&>span:last-child]:flex"
                invert={theme === "dark"}
              />
            </motion.span>
          </AnimatePresence>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={(e) => handleNav(e, n.href)}
              className={cn(
                "rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground",
                isUser && "hover:bg-brand-soft/55 hover:text-[var(--brand)]",
              )}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ModeSwitch />
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <a
            href={signinUrl}
            className="hidden items-center gap-1.5 rounded-lg border border-border bg-surface/70 px-3.5 py-2 text-[13px] font-medium text-foreground transition hover:bg-secondary lg:inline-flex"
          >
            <LogIn className="h-3.5 w-3.5" /> Нэвтрэх
          </a>
          {mode === "user" ? (
            <Button
              size="sm"
              onClick={openAppSection}
              className="hidden rounded-lg bg-gradient-brand px-3.5 text-white shadow-glow hover:opacity-90 xl:inline-flex"
            >
              <Download className="h-3.5 w-3.5" />
              Апп татах
            </Button>
          ) : (
            <Button
              size="sm"
              asChild
              className="hidden rounded-lg bg-primary px-3.5 text-primary-foreground shadow-sm hover:opacity-90 xl:inline-flex"
            >
              <a href={signupUrl}>Бүртгүүлэх</a>
            </Button>
          )}
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface/70 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 right-0 z-50 w-[86vw] max-w-sm bg-background border-l border-border p-5 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <BrandLogo mode={mode} invert={theme === "dark"} />
                <button
                  className="h-9 w-9 grid place-items-center rounded-md border border-border"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6">
                <ModeSwitch />
              </div>
              <nav className="mt-4 flex flex-col gap-1">
                {nav.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={(e) => handleNav(e, n.href)}
                    className="rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 pt-6">
                <Button variant="outline" className="w-full gap-2" asChild onClick={() => setOpen(false)}>
                  <a href={signinUrl}>
                    <LogIn className="h-4 w-4" /> Нэвтрэх
                  </a>
                </Button>
                {mode === "user" ? (
                  <Button
                    onClick={() => {
                      openAppSection();
                    }}
                    className="w-full bg-gradient-brand text-white shadow-glow"
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    Апп татах
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full"
                  >
                    <a href={signupUrl} onClick={() => setOpen(false)}>
                      Байгууллага бүртгүүлэх
                    </a>
                  </Button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function ModeSwitch() {
  const { mode, setMode } = useApp();
  return (
    <div
      role="tablist"
      aria-label="Хэрэглэгч / Байгууллага"
      className="relative inline-grid min-h-10 grid-cols-2 items-center rounded-xl border border-border/80 bg-surface/75 p-1 text-xs font-semibold shadow-sm backdrop-blur"
    >
      <span
        className={cn(
          "absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-lg bg-gradient-brand shadow-sm transition-transform duration-300",
          mode === "business" ? "translate-x-full" : "translate-x-0",
        )}
      />
      <button
        role="tab"
        aria-selected={mode === "user"}
        onClick={() => setMode("user")}
        className={cn(
          "relative z-10 rounded-lg px-3 py-2 transition-colors sm:px-4",
          mode === "user" ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        Хэрэглэгч
      </button>
      <button
        role="tab"
        aria-selected={mode === "business"}
        onClick={() => setMode("business")}
        className={cn(
          "relative z-10 rounded-lg px-3 py-2 transition-colors sm:px-4",
          mode === "business" ? "text-primary-foreground" : "text-muted-foreground",
        )}
      >
        Бизнес
      </button>
    </div>
  );
}

function ThemeToggle({ theme, toggle }: { theme: "light" | "dark"; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface/65 text-[var(--brand)] backdrop-blur transition hover:border-[var(--brand)]/30 hover:bg-secondary"
      aria-label={theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -60, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 60, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 grid place-items-center"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
