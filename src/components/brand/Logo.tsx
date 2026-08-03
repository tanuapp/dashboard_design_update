import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  invert?: boolean;
};

type MarkProps = LogoProps & {
  variant?: "gradient" | "navy" | "light";
};

/**
 * The supplied Tanu mark, cleaned onto a transparent canvas.
 * `variant` only changes its presentation; the logo geometry stays untouched.
 */
export function TanuMark({ className, invert = false, variant = "navy" }: MarkProps) {
  const whiteMark = variant === "gradient" || variant === "light" || invert;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative inline-grid aspect-square shrink-0 select-none place-items-center overflow-hidden rounded-[28%]",
        variant === "gradient" &&
          "bg-[linear-gradient(145deg,#3455a9_0%,#2d7fc5_50%,#42c8e9_100%)] shadow-[0_10px_28px_-10px_rgba(35,137,214,.85)]",
        variant === "navy" &&
          (invert
            ? "bg-[#0b1935] shadow-[0_10px_28px_-12px_rgba(2,9,26,.9)]"
            : "border border-[#0b1935]/10 bg-white shadow-[0_8px_24px_-14px_rgba(11,25,53,.55)]"),
        variant === "light" && "bg-white/10 ring-1 ring-white/15",
        className,
      )}
    >
      <img
        src="/brand/tanu-mark-navy.png"
        alt=""
        className={cn(
          "h-full w-full scale-[1.18] object-contain",
          whiteMark && "brightness-0 invert",
        )}
      />
      {variant === "gradient" && (
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(94,224,247,.42),transparent_52%)]" />
      )}
    </span>
  );
}

export function TanuUserLogo({ className }: LogoProps) {
  return (
    <span
      className={cn("inline-flex h-10 w-auto items-center gap-2.5 text-foreground", className)}
      aria-label="Tanu"
    >
      <TanuMark variant="gradient" className="h-full" />
      <span className="font-display text-[1.28em] font-extrabold leading-none tracking-[-0.06em]">
        tanu
      </span>
    </span>
  );
}

export function TanuBusinessLogo({ className, invert = false }: LogoProps) {
  return (
    <span
      className={cn("inline-flex h-10 w-auto items-center gap-2.5 text-foreground", className)}
      aria-label="Tanu Business"
    >
      <TanuMark variant="navy" invert={invert} className="h-full" />
      <span className="flex flex-col justify-center leading-none">
        <span className="font-display text-[1.08em] font-extrabold tracking-[-0.055em]">tanu</span>
        <span className="mt-1 text-[0.42em] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Business
        </span>
      </span>
    </span>
  );
}

/** Auto-switching logo for the current Tanu product mode. */
export function BrandLogo({ mode, className, invert }: LogoProps & { mode: "user" | "business" }) {
  return mode === "business" ? (
    <TanuBusinessLogo className={className} invert={invert} />
  ) : (
    <TanuUserLogo className={className} invert={invert} />
  );
}
