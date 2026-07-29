import { cn } from "@/lib/utils";

/**
 * Placeholder brand logos. Both are self-contained SVGs designed to match the
 * described Tanu brand. Replace the SVG contents with real supplied assets when
 * available — the component API stays stable.
 */

export function TanuUserLogo({ className, invert = false }: { className?: string; invert?: boolean }) {
  const from = invert ? "#ffffff" : "#3b82f6";
  const to = invert ? "#c7d7ff" : "#22d3ee";
  return (
    <svg viewBox="0 0 148 40" className={cn("h-8 w-auto", className)} aria-label="Tanu">
      <defs>
        <linearGradient id="tanu-user-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <g fill="url(#tanu-user-g)">
        {/* Mark */}
        <path d="M4 8h28v6H21v18h-6V14H4z" />
        {/* Wordmark */}
        <text x="40" y="27" fontFamily="Manrope, Inter, sans-serif" fontWeight="800" fontSize="22" letterSpacing="-1">
          tanu
        </text>
        <circle cx="140" cy="10" r="3" />
      </g>
    </svg>
  );
}

export function TanuBusinessLogo({ className, invert = false }: { className?: string; invert?: boolean }) {
  const fill = invert ? "#ffffff" : "#0f1a3a";
  const accent = invert ? "#c7d7ff" : "#3b82f6";
  return (
    <svg viewBox="0 0 168 40" className={cn("h-8 w-auto", className)} aria-label="Tanu Business">
      {/* Triangular icon */}
      <g>
        <path d="M4 34 L20 6 L36 34 Z" fill={fill} />
        <path d="M14 34 L20 22 L26 34 Z" fill={accent} />
      </g>
      <text
        x="46"
        y="24"
        fontFamily="Manrope, Inter, sans-serif"
        fontWeight="800"
        fontSize="17"
        letterSpacing="-0.5"
        fill={fill}
      >
        tanu
      </text>
      <text
        x="82"
        y="24"
        fontFamily="Manrope, Inter, sans-serif"
        fontWeight="500"
        fontSize="17"
        letterSpacing="0.5"
        fill={fill}
        opacity="0.7"
      >
        business
      </text>
    </svg>
  );
}

/** Auto-switching logo. */
export function BrandLogo({ mode, className, invert }: { mode: "user" | "business"; className?: string; invert?: boolean }) {
  return mode === "business" ? (
    <TanuBusinessLogo className={className} invert={invert} />
  ) : (
    <TanuUserLogo className={className} invert={invert} />
  );
}
