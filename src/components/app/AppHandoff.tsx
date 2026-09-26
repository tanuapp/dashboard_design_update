import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, Loader2, Smartphone } from "lucide-react";

import {
  arrivedFromOutside,
  detectPlatform,
  handedOffRecently,
  startHandoff,
  type Handoff,
  type MobilePlatform,
} from "@/lib/app-handoff";

type Phase = "idle" | "opening" | "done";

/**
 * Hands a visitor who arrived from a shared link (Facebook, a QR code, a
 * messenger) to the app, or to the store when the app is missing, as soon as
 * the page loads. Renders nothing on desktop and for people browsing within
 * the website.
 */
export function AppHandoff({ path, name }: { path: string; name: string }) {
  const [platform, setPlatform] = useState<MobilePlatform | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const handoff = useRef<Handoff | null>(null);
  const pendingStop = useRef<number | null>(null);
  const dismissed = useRef(false);

  const begin = (target: MobilePlatform) => {
    handoff.current?.cancel();
    setPhase("opening");
    handoff.current = startHandoff(target, path, {
      onAppOpened: () => setPhase("done"),
      onGiveUp: () => setPhase("done"),
    });
  };

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    // React may unmount and remount in development: keep the running handoff.
    if (pendingStop.current) {
      window.clearTimeout(pendingStop.current);
      pendingStop.current = null;
    }
    if (detected && !dismissed.current && !handoff.current) {
      if (arrivedFromOutside() && !handedOffRecently(path)) begin(detected);
    }
    return () => {
      pendingStop.current = window.setTimeout(() => {
        handoff.current?.cancel();
        handoff.current = null;
      }, 0);
    };
    // Starts once per page view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  if (phase !== "opening" || !platform) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
      role="dialog"
      aria-live="polite"
      aria-label="TANU апп руу шилжүүлж байна"
    >
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-surface/95 p-5 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-[var(--brand)]">
            <Smartphone className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">TANU апп руу шилжүүлж байна…</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{name}</p>
          </div>
          <Loader2 className="ml-auto h-5 w-5 shrink-0 animate-spin text-[var(--brand)]" />
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => begin(platform)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Аппаар нээх
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            Апп байхгүй бол {platform === "ios" ? "App Store" : "Google Play"} автоматаар нээгдэнэ
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            dismissed.current = true;
            handoff.current?.cancel();
            handoff.current = null;
            setPhase("done");
          }}
          className="mt-3 w-full text-center text-xs font-semibold text-muted-foreground underline"
        >
          Вэбээр үргэлжлүүлэх
        </button>
      </div>
    </div>
  );
}

/** The page's own buttons, for desktop and for anyone who stayed on the page. */
export function AppButtons({ path }: { path: string }) {
  const [platform, setPlatform] = useState<MobilePlatform | null>(null);
  useEffect(() => setPlatform(detectPlatform()), []);
  const getAppHref = `/get-app?path=${encodeURIComponent(path)}`;

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      {platform && (
        <button
          type="button"
          onClick={() => startHandoff(platform, path)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" />
          Аппаар нээх
        </button>
      )}
      <a
        href={getAppHref}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface"
      >
        <Download className="h-4 w-4" />
        Апп татах
      </a>
    </div>
  );
}
