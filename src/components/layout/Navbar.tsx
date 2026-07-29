import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Moon, Sun, X, LogIn } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { BrandLogo } from "@/components/brand/Logo";
import { userNav, businessNav } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenBusinessSignup: () => void;
  onOpenBooking: () => void;
}

export function Navbar({ onOpenBusinessSignup, onOpenBooking }: NavbarProps) {
  const { mode, setMode, theme, toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const nav = mode === "business" ? businessNav : userNav;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "backdrop-blur-md bg-[color-mix(in_oklch,var(--background)_75%,transparent)] border-b border-border shadow-soft"
          : "bg-transparent",
      )}
    >
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-all",
        scrolled ? "h-14" : "h-18 py-3")}
      >
        <a href="#top" className="flex items-center gap-2 shrink-0" aria-label="Tanu home">
          <AnimatePresence mode="wait">
            <motion.span
              key={mode}
              initial={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 6, filter: "blur(6px)" }}
              transition={{ duration: 0.35 }}
              className="flex items-center"
            >
              <BrandLogo mode={mode} className="h-7 md:h-8" invert={theme === "dark"} />
            </motion.span>
          </AnimatePresence>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:bg-secondary"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeSwitch />
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-1.5" aria-label="Нэвтрэх">
            <LogIn className="h-4 w-4" />
            <span>Нэвтрэх</span>
          </Button>
          {mode === "user" ? (
            <Button
              size="sm"
              onClick={onOpenBooking}
              className="hidden sm:inline-flex bg-gradient-brand text-white hover:opacity-90 shadow-glow"
            >
              Цаг захиалах
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onOpenBusinessSignup}
              className="hidden sm:inline-flex bg-primary text-primary-foreground hover:opacity-90"
            >
              Байгууллага бүртгүүлэх
            </Button>
          )}
          <button
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface"
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
              className="fixed inset-y-0 right-0 z-50 w-[86vw] max-w-sm bg-background border-l border-border p-5 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <BrandLogo mode={mode} invert={theme === "dark"} />
                <button className="h-9 w-9 grid place-items-center rounded-md border border-border" onClick={() => setOpen(false)} aria-label="Close menu">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6"><ModeSwitch /></div>
              <nav className="mt-4 flex flex-col gap-1">
                {nav.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium hover:bg-secondary"
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto grid gap-2">
                <Button variant="outline" className="w-full gap-2">
                  <LogIn className="h-4 w-4" /> Нэвтрэх
                </Button>
                {mode === "user" ? (
                  <Button onClick={() => { setOpen(false); onOpenBooking(); }} className="w-full bg-gradient-brand text-white">
                    Цаг захиалах
                  </Button>
                ) : (
                  <Button onClick={() => { setOpen(false); onOpenBusinessSignup(); }} className="w-full">
                    Байгууллага бүртгүүлэх
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
      className="relative inline-flex items-center rounded-full border border-border bg-surface/60 backdrop-blur p-0.5 text-xs font-medium"
    >
      <span
        className={cn(
          "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-gradient-brand transition-transform duration-300",
          mode === "business" ? "translate-x-full" : "translate-x-0",
        )}
      />
      <button
        role="tab"
        aria-selected={mode === "user"}
        onClick={() => setMode("user")}
        className={cn(
          "relative z-10 px-3 py-1.5 rounded-full transition-colors",
          mode === "user" ? "text-white" : "text-muted-foreground",
        )}
      >
        Хэрэглэгч
      </button>
      <button
        role="tab"
        aria-selected={mode === "business"}
        onClick={() => setMode("business")}
        className={cn(
          "relative z-10 px-3 py-1.5 rounded-full transition-colors",
          mode === "business" ? "text-white" : "text-muted-foreground",
        )}
      >
        Байгууллага
      </button>
    </div>
  );
}

function ThemeToggle({ theme, toggle }: { theme: "light" | "dark"; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface/60 backdrop-blur transition hover:bg-secondary"
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
