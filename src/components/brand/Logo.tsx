import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  invert?: boolean;
};

type MarkProps = LogoProps & {
  variant?: "gradient" | "navy" | "light";
};

const officialTanuLogo = "/brand/logowhite.png";
const businessTanuMark = "/brand/tanu-mark-navy.png";

/** The supplied TANU mark is the single public-facing logo source. */
function OfficialTanuLogo({ className, alt }: { className?: string; alt: string }) {
  return (
    <img
      src={officialTanuLogo}
      alt={alt}
      className={cn("aspect-square w-auto shrink-0 object-contain rounded-md", className)}
    />
  );
}

/** Decorative use of the official TANU mark. */
export function TanuMark({ className }: MarkProps) {
  return <OfficialTanuLogo className={className} alt="" />;
}

export function TanuUserLogo({ className }: LogoProps) {
  return <OfficialTanuLogo className={className} alt="TANU" />;
}

/** The established navy mark used throughout the Business product. */
export function TanuBusinessMark({ className, invert = false }: LogoProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid aspect-square shrink-0 place-items-center overflow-hidden rounded-[28%]",
        invert ? "bg-[#0b1935]" : "border border-[#0b1935]/10 bg-white",
        className,
      )}
    >
      <img
        src={businessTanuMark}
        alt=""
        className={cn("h-full w-full scale-[1.18] object-contain", invert && "brightness-0 invert")}
      />
    </span>
  );
}

export function TanuBusinessLogo({ className, invert = false }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-auto items-center gap-2.5",
        invert ? "text-white" : "text-foreground",
        className,
      )}
      aria-label="TANU Business"
    >
      <TanuBusinessMark className="h-full" invert={invert} />
      <span className="flex flex-col justify-center leading-none">
        <span className="font-display text-[1.08em] font-extrabold tracking-[-0.055em]">tanu</span>
        <span className="mt-1 text-[0.42em] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Business
        </span>
      </span>
    </span>
  );
}

/** Auto-switching logo for the current TANU product mode. */
export function BrandLogo({ mode, className, invert }: LogoProps & { mode: "user" | "business" }) {
  return mode === "business" ? (
    <TanuBusinessLogo className={className} invert={invert} />
  ) : (
    <OfficialTanuLogo className={className} alt="TANU" />
  );
}
