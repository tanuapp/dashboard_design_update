import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, Loader2, Smartphone } from "lucide-react";

import {
  arrivedFromOutside,
  detectPlatform,
  goToStore,
  handedOffRecently,
  openAndroidApp,
  universalLink,
  type MobilePlatform,
} from "@/lib/app-handoff";

// Long enough to tap "open" when the app is installed but a messenger's
// in-app browser swallowed the Universal Link; short enough to feel direct.
const IOS_STORE_DELAY_MS = 1500;
const ANDROID_GIVE_UP_MS = 2500;

type Phase = "idle" | "opening" | "done";

/**
 * Hands a visitor who arrived from a shared link to the app (or the store) as
 * soon as the page loads. Renders nothing for desktop visitors and for people
 * browsing within the website.
 */
export function AppHandoff({ path, name }: { path: string; name: string }) {
  const [platform, setPlatform] = useState<MobilePlatform | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const timer = useRef<number | null>(null);
  // The handoff starts once per page view; a re-run of the effect (React
  // remounting in development, a re-render) only re-arms the timer.
  const started = useRef<string | null>(null);
  const dismissed = useRef(false);

  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    if (!detected || dismissed.current) return;

    if (started.current !== path) {
      if (!arrivedFromOutside() || handedOffRecently(path)) return;
      started.current = path;
      setPhase("opening");
      if (detected === "android") openAndroidApp(path, path);
    }

    if (detected === "android") {
      // Still here: the app did not open and the store hop did not happen
      // (some in-app browsers block intents). Show the page and its buttons.
      timer.current = window.setTimeout(() => setPhase("done"), ANDROID_GIVE_UP_MS);
    } else {
      timer.current = window.setTimeout(() => {
        timer.current = null;
        if (document.visibilityState === "visible") void goToStore("ios", path);
      }, IOS_STORE_DELAY_MS);
    }

    // The app took over: never follow up with a store redirect.
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        dismissed.current = true;
        cancel();
        setPhase("done");
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      cancel();
      document.removeEventListener("visibilitychange", onHide);
    };
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

        {platform === "ios" && (
          <div className="mt-4 grid gap-2">
            <a
              href={universalLink(path)}
              onClick={cancel}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Апп суусан бол энд дарж нээнэ үү
            </a>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              Апп байхгүй бол App Store автоматаар нээгдэнэ
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            dismissed.current = true;
            cancel();
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
        <a
          href={platform === "ios" ? universalLink(path) : undefined}
          onClick={(event) => {
            if (platform !== "android") return;
            event.preventDefault();
            openAndroidApp(path, path);
          }}
          role={platform === "android" ? "button" : undefined}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <ExternalLink className="h-4 w-4" />
          Аппаар нээх
        </a>
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
