import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Background } from "@/components/effects/Background";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  detectPlatform,
  goToStore,
  isAppPath,
  type MobilePlatform,
} from "@/lib/app-handoff";

/**
 * Store hop for shared links: Android lands here when the app is not
 * installed (the intent's fallback URL), and the "download" buttons link
 * here. It remembers the company/event for the app's first launch, then opens
 * the right store. Desktop visitors get both store links.
 */
export const Route = createFileRoute("/get-app")({
  validateSearch: (search: Record<string, unknown>) => ({
    path: typeof search.path === "string" ? search.path : undefined,
  }),
  head: () => ({
    meta: [
      { title: "TANU апп татах" },
      { name: "robots", content: "noindex" },
      { name: "apple-itunes-app", content: "app-id=6737768604" },
    ],
  }),
  component: GetAppPage,
});

function GetAppPage() {
  const { path } = Route.useSearch();
  const [platform, setPlatform] = useState<MobilePlatform | null | undefined>(undefined);
  const sent = useRef(false);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    if (!detected || sent.current) return;
    sent.current = true;
    void goToStore(detected, path && isAppPath(path) ? path : "");
  }, [path]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-5 py-16 text-foreground">
      <Background />
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-surface/85 p-8 text-center shadow-sm backdrop-blur">
        <img
          src="/brand/qr.svg"
          alt="TANU апп татах QR"
          className="mx-auto hidden h-40 w-40 rounded-2xl bg-white p-2 sm:block"
        />
        <h1 className="mt-5 text-xl font-bold">TANU апп татах</h1>
        {platform ? (
          <p className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {platform === "ios" ? "App Store" : "Google Play"} руу шилжүүлж байна…
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Утасныхаа камераар QR-ыг уншуулж эсвэл дэлгүүрээс татна уу.
          </p>
        )}
        <div className="mt-6 grid gap-3">
          {platform !== "android" && (
            <a
              href={APP_STORE_URL}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" />
              App Store
            </a>
          )}
          {platform !== "ios" && (
            <a
              href={PLAY_STORE_URL}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold"
            >
              <Download className="h-4 w-4" />
              Google Play
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
