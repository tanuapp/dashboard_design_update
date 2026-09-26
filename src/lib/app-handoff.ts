/**
 * Sends a phone from a shared tanu.mn link into the TANU customer app.
 *
 *   App installed      -> the app opens on the same company / event.
 *   App not installed  -> straight to the App Store / Play Store, and the page
 *                         is remembered so the new app opens it on first launch
 *                         (deferred deep link, see /api/v1/deeplink/deferred).
 *
 * Android: an `intent://` URL pinned to the customer package. Chrome opens the
 * app when it is installed and otherwise follows `browser_fallback_url` to
 * /get-app, which remembers the page and continues to Play Store.
 *
 * iOS: the installed app claims tanu.mn links as Universal Links, so this page
 * only loads when the app is missing (or a messenger's in-app browser ignored
 * the link). It forwards to the App Store; the "open" button points at another
 * domain the app claims (see universalLink), because a tap across domains is
 * the one thing Safari always hands to the app.
 */

export const ANDROID_PACKAGE = "com.tanusoft.tanubooking";
export const APP_STORE_ID = "6737768604";
export const APP_STORE_URL = `https://apps.apple.com/mn/app/tanu/id${APP_STORE_ID}`;
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const SITE_URL = "https://www.tanu.mn";
const UNIVERSAL_LINK_ORIGIN = "https://deeplink.tanu.mn";
const APEX_ORIGIN = "https://tanu.mn";
const DEFERRED_LINK_URL = "https://api.tanusoft.mn/api/v1/deeplink/deferred";
const HANDOFF_MEMORY_MS = 10 * 60 * 1000;

// Same shape the API accepts: a company slug/id or an event id.
const APP_PATH = /^\/(?:company\/[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?|event\/[a-f0-9]{24})$/;

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

/**
 * True when the visitor came from outside tanu.mn: a QR code, a messenger or
 * another site. Browsing between pages of the website never bounces anyone
 * to a store. `?web=1` opts out, for previews and testing.
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

/**
 * A link on another domain the app claims, for the iOS "open" button (a tap
 * across domains is what Safari hands to the app).
 *
 * Events use the bare tanu.mn: every released app claims it and Apple already
 * serves its /event/* association. Companies use deeplink.tanu.mn/<id>, the
 * shape every deployment of that host understands (older ones included).
 */
export function universalLink(path: string): string {
  if (path.startsWith("/event/")) return `${APEX_ORIGIN}${path}`;
  const companyId = path.match(/^\/company\/([a-f\d]{24})$/i)?.[1];
  return companyId ? `${UNIVERSAL_LINK_ORIGIN}/${companyId}` : `${UNIVERSAL_LINK_ORIGIN}${path}`;
}

export function storeUrl(platform: MobilePlatform, path?: string): string {
  if (platform === "ios") return APP_STORE_URL;
  if (!path) return PLAY_STORE_URL;
  const referrer = `utm_source=tanu_web&utm_medium=deeplink&deeplink=${path}`;
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(referrer)}`;
}

/**
 * Remembers `path` for the app installed next on this device. Never throws
 * and never waits long: a slow network must not hold up the store. Awaited
 * rather than `keepalive`, which some browsers refuse for cross-origin JSON.
 */
export async function rememberForInstall(path: string, platform: MobilePlatform): Promise<void> {
  if (!isAppPath(path)) return;
  const body = JSON.stringify({
    path,
    platform,
    language: navigator.language || "",
    utcOffset: -new Date().getTimezoneOffset(),
    screenWidth: Math.round(window.screen?.width || 0),
    screenHeight: Math.round(window.screen?.height || 0),
  });
  const request = fetch(DEFERRED_LINK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  }).catch(() => undefined);
  await Promise.race([request, new Promise((resolve) => window.setTimeout(resolve, 1200))]);
}

/**
 * Android: open the app on `appPath` (an id-based path every released app
 * version understands); when the app is missing, Chrome continues to
 * /get-app, which remembers `deferredPath` and opens Play Store.
 */
export function androidIntentUrl(appPath: string, deferredPath: string): string {
  const fallback = `${window.location.origin}/get-app?path=${encodeURIComponent(deferredPath)}`;
  return (
    `intent://tanu.mn${appPath}` +
    `#Intent;scheme=tanu;package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(fallback)};end`
  );
}

/** Android handoff: the app if installed, otherwise the store via /get-app. */
export function openAndroidApp(appPath: string, deferredPath: string) {
  markHandoff(deferredPath);
  window.location.href = androidIntentUrl(appPath, deferredPath);
}

/** iOS (and the /get-app hop): remember the page, then go to the store. */
export async function goToStore(platform: MobilePlatform, deferredPath: string) {
  markHandoff(deferredPath);
  await rememberForInstall(deferredPath, platform);
  window.location.href = storeUrl(platform, deferredPath);
}
