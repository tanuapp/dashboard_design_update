/**
 * Sends a phone from a shared tanu.mn link into the TANU customer app.
 *
 *   App installed      -> the app opens on the same company / event.
 *   App not installed  -> straight to the App Store / Play Store, and the page
 *                         is remembered so the new app opens it on first launch
 *                         (deferred deep link, see /api/v1/deeplink/deferred).
 *
 * A web page cannot ask whether an app is installed, so it tries to open the
 * app and moves on to the store when the page is still showing a moment
 * later (when the app opens, the page goes to the background instead).
 *
 * Android: an `intent://` URL pinned to the customer package; Chrome opens the
 * app or, when it is missing, follows `browser_fallback_url` to /get-app ->
 * Play Store. In-app browsers (Facebook, Instagram, Messenger...) do not all
 * honour intents, so there the plain `tanu://` scheme is tried next.
 *
 * iOS: the `tanucustomer://` scheme, which only the customer app registers
 * (the older Business app claimed `tanu://`, so that one is never used on
 * iOS). This works in Safari, Chrome and in-app browsers alike, where
 * Universal Links often do not fire.
 */

export const ANDROID_PACKAGE = "com.tanusoft.tanubooking";
export const APP_STORE_ID = "6737768604";
export const APP_STORE_URL = `https://apps.apple.com/mn/app/tanu/id${APP_STORE_ID}`;
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const SITE_URL = "https://www.tanu.mn";
const DEFERRED_LINK_URL = "https://api.tanusoft.mn/api/v1/deeplink/deferred";
const HANDOFF_MEMORY_MS = 10 * 60 * 1000;

// How long the page waits for the app before giving up on it. Safari shows an
// "Open in Tanu?" prompt first, so it gets a little longer.
const IOS_SAFARI_WAIT_MS = 2500;
const IOS_IN_APP_WAIT_MS = 1600;
const ANDROID_SCHEME_AFTER_MS = 1200;
const ANDROID_IN_APP_STORE_AFTER_MS = 2800;
const ANDROID_GIVE_UP_MS = 2500;

// Same shape the API accepts: a company slug/id or an event id.
const APP_PATH = /^\/(?:company\/[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?|event\/[a-f0-9]{24})$/;

// Browsers built into other apps. Universal Links / App Links rarely fire in
// them, and some ignore Android intents.
const IN_APP_BROWSER =
  /FBAN|FBAV|FB_IAB|FBIOS|FBSS|Instagram|Messenger|Line\/|KAKAOTALK|Snapchat|musical_ly|BytedanceWebview|TikTok|Twitter|LinkedInApp|Pinterest|WhatsApp|; wv\)/i;

export type MobilePlatform = "ios" | "android";

export function isAppPath(path: string): boolean {
  return APP_PATH.test(path);
}

export function detectPlatform(): MobilePlatform | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  // iPadOS reports a Mac user agent, but has touch.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1))
    return "ios";
  return null;
}

export function isInAppBrowser(): boolean {
  return typeof navigator !== "undefined" && IN_APP_BROWSER.test(navigator.userAgent || "");
}

/**
 * True when the visitor came from outside tanu.mn: a QR code, Facebook, a
 * messenger or another site. Browsing between pages of the website never
 * bounces anyone to the app or a store. `?web=1` opts out, for previews.
 */
export function arrivedFromOutside(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).has("web")) return false;
  const referrer = document.referrer;
  if (!referrer) return true;
  try {
    const host = new URL(referrer).hostname;
    return host !== "tanu.mn" && host !== "www.tanu.mn";
  } catch {
    return true;
  }
}

function handoffKey(path: string) {
  return `tanu-app-handoff:${path}`;
}

/** Whether this page already sent the visitor away recently (back from the store). */
export function handedOffRecently(path: string): boolean {
  try {
    const at = Number(window.sessionStorage.getItem(handoffKey(path)) || 0);
    return Date.now() - at < HANDOFF_MEMORY_MS;
  } catch {
    return false;
  }
}

function markHandoff(path: string) {
  try {
    window.sessionStorage.setItem(handoffKey(path), String(Date.now()));
  } catch {
    // Private mode: the only cost is a repeat redirect on return.
  }
}

/** The app's own URL for `path` (an id-based path every released app understands). */
export function appSchemeUrl(platform: MobilePlatform, path: string): string {
  return platform === "ios" ? `tanucustomer://app.tanu.mn${path}` : `tanu://tanu.mn${path}`;
}

export function storeUrl(platform: MobilePlatform, path?: string, { inApp = false } = {}): string {
  if (platform === "ios") return APP_STORE_URL;
  const referrer = path
    ? `&referrer=${encodeURIComponent(`utm_source=tanu_web&utm_medium=deeplink&deeplink=${path}`)}`
    : "";
  // In-app browsers would load the https store page inside themselves; the
  // market: scheme hands over to the Play Store app.
  return inApp
    ? `market://details?id=${ANDROID_PACKAGE}${referrer}`
    : `${PLAY_STORE_URL}${referrer}`;
}

/**
 * Remembers `path` for the app installed next on this device. Never throws.
 * Not `keepalive`: some browsers refuse it for cross-origin JSON.
 */
export function rememberForInstall(path: string, platform: MobilePlatform): Promise<void> {
  if (!isAppPath(path)) return Promise.resolve();
  const body = JSON.stringify({
    path,
    platform,
    language: navigator.language || "",
    utcOffset: -new Date().getTimezoneOffset(),
    screenWidth: Math.round(window.screen?.width || 0),
    screenHeight: Math.round(window.screen?.height || 0),
  });
  return fetch(DEFERRED_LINK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  }).then(
    () => undefined,
    () => undefined,
  );
}

function waitAtMost(promise: Promise<unknown>, ms: number) {
  return Promise.race([promise, new Promise((resolve) => window.setTimeout(resolve, ms))]);
}

/**
 * Android: open the app on `path`; when the app is missing, Chrome continues
 * to /get-app, which remembers the page and opens Play Store.
 */
export function androidIntentUrl(path: string): string {
  const fallback = `${window.location.origin}/get-app?path=${encodeURIComponent(path)}`;
  return (
    `intent://tanu.mn${path}` +
    `#Intent;scheme=tanu;package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(fallback)};end`
  );
}

/** The /get-app hop: remember the page, then open the store. */
export async function goToStore(platform: MobilePlatform, path: string) {
  markHandoff(path);
  await waitAtMost(rememberForInstall(path, platform), 1200);
  window.location.href = storeUrl(platform, path, { inApp: isInAppBrowser() });
}

export type Handoff = { cancel: () => void };

/**
 * Opens the app on `path`, or the store (after remembering the page) when
 * the app does not take over. `onGiveUp` runs when a browser neither opened
 * the app nor left for the store, so the page can show its own buttons.
 */
export function startHandoff(
  platform: MobilePlatform,
  path: string,
  { onAppOpened, onGiveUp }: { onAppOpened?: () => void; onGiveUp?: () => void } = {},
): Handoff {
  const timers: number[] = [];
  let finished = false;
  const inApp = isInAppBrowser();

  const cleanup = () => {
    finished = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onHide);
  };
  // The app came to the front: never follow up with the store.
  function onHide() {
    if (finished || document.visibilityState !== "hidden") return;
    cleanup();
    onAppOpened?.();
  }
  const later = (ms: number, step: () => void) => {
    timers.push(
      window.setTimeout(() => {
        if (!finished && document.visibilityState === "visible") step();
      }, ms),
    );
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onHide);
  markHandoff(path);

  // Recorded up front so the store step does not wait on the network.
  const remembered =
    platform === "ios" || inApp ? rememberForInstall(path, platform) : Promise.resolve();
  const toStore = async () => {
    cleanup();
    await waitAtMost(remembered, 800);
    window.location.href = storeUrl(platform, path, { inApp });
  };

  if (platform === "android") {
    window.location.href = androidIntentUrl(path);
    if (inApp) {
      later(ANDROID_SCHEME_AFTER_MS, () => {
        window.location.href = appSchemeUrl("android", path);
      });
      later(ANDROID_IN_APP_STORE_AFTER_MS, () => void toStore());
    } else {
      later(ANDROID_GIVE_UP_MS, () => {
        cleanup();
        onGiveUp?.();
      });
    }
  } else {
    window.location.href = appSchemeUrl("ios", path);
    later(inApp ? IOS_IN_APP_WAIT_MS : IOS_SAFARI_WAIT_MS, () => void toStore());
  }

  return { cancel: cleanup };
}
