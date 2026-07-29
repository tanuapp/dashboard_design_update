import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { motion, AnimatePresence } from "motion/react";

/** Premium animated background: gradients, orbit rings, grid, floating dots. */
export function Background() {
  const { mode } = useApp();
  const [pos, setPos] = useState({ x: 0.5, y: 0.3 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    setIsDesktop(mq.matches);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isDesktop]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {mode === "user" ? <UserBg pos={pos} /> : <BusinessBg pos={pos} />}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 noise" />
    </div>
  );
}

function UserBg({ pos }: { pos: { x: number; y: number } }) {
  return (
    <>
      {/* Soft radial glows */}
      <div
        className="absolute h-[70vh] w-[70vh] rounded-full blur-3xl opacity-70"
        style={{
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, color-mix(in oklch, var(--brand) 45%, transparent), transparent 70%)",
          transition: "left 1200ms ease, top 1200ms ease",
        }}
      />
      <div
        className="absolute -top-40 -right-40 h-[60vh] w-[60vh] rounded-full blur-3xl opacity-60"
        style={{
          background: "radial-gradient(circle, color-mix(in oklch, var(--brand-2) 45%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 -left-20 h-[50vh] w-[50vh] rounded-full blur-3xl opacity-50"
        style={{
          background: "radial-gradient(circle, color-mix(in oklch, var(--brand) 35%, transparent), transparent 70%)",
        }}
      />
      {/* Floating dots */}
      <FloatingDots count={16} />
    </>
  );
}

function BusinessBg({ pos }: { pos: { x: number; y: number } }) {
  return (
    <>
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-60" />
      {/* Orbit rings */}
      <div className="absolute left-1/2 top-[10%] -translate-x-1/2">
        <div className="orbit-slow relative h-[80vh] w-[80vh] rounded-full border border-[color-mix(in_oklch,var(--foreground)_10%,transparent)]">
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--brand-2)] shadow-glow" />
        </div>
        <div className="orbit-slower absolute inset-0 m-auto h-[55vh] w-[55vh] rounded-full border border-[color-mix(in_oklch,var(--foreground)_8%,transparent)]">
          <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--brand)]" />
        </div>
      </div>
      {/* Glow */}
      <div
        className="absolute h-[60vh] w-[60vh] rounded-full blur-3xl opacity-50"
        style={{
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, color-mix(in oklch, var(--brand-2) 35%, transparent), transparent 70%)",
          transition: "left 1500ms ease, top 1500ms ease",
        }}
      />
      <FloatingDots count={10} muted />
    </>
  );
}

function FloatingDots({ count, muted = false }: { count: number; muted?: boolean }) {
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="absolute inset-0">
      {dots.map((i) => {
        const left = (i * 97) % 100;
        const top = (i * 53) % 100;
        const size = ((i * 7) % 5) + 3;
        const delay = (i % 8) * 0.6;
        return (
          <span
            key={i}
            className="absolute rounded-full float-y"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: muted
                ? "color-mix(in oklch, var(--foreground) 25%, transparent)"
                : "color-mix(in oklch, var(--brand) 55%, transparent)",
              animationDelay: `${delay}s`,
              boxShadow: muted ? "none" : "0 0 12px color-mix(in oklch, var(--brand) 40%, transparent)",
            }}
          />
        );
      })}
    </div>
  );
}
