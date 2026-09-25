/**
 * Public company lookup for the shared-link landing page.
 *
 * Company links are shared as `https://www.tanu.mn/company/<id>`. On a phone
 * that link opens the TANU customer app (Universal Link / `tanu://` handoff);
 * on a desktop, or where the app is not installed, it lands here instead. So
 * this page stands on its own: real company details plus a way into the app.
 *
 * The company endpoint returns far more than a public page may show
 * (employees, contracts, tokens). Only the fields parsed below ever leave
 * this module.
 */

const COMPANY_API_URL = "https://api.tanusoft.mn/api/v1/company";
const UPLOAD_BASE_URL = "https://api.tanusoft.mn/uploads";

// Same scheme the event page uses on Android: TANU Business does not claim
// it there, and every released customer build routes /company/<id>.
export const COMPANY_ANDROID_DEEP_LINK_BASE_URL = "tanu://tanu.mn/company";

export type CompanyService = {
  id: string;
  name: string;
  priceMnt: number;
  durationMinutes: number;
};

export type PublicCompany = {
  id: string;
  name: string;
  description: string;
  address: string;
  category: string;
  logo: string;
  cover: string;
  open: string;
  close: string;
  services: CompanyService[];
};

const OBJECT_ID = /^[a-f\d]{24}$/i;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function integer(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Accepts `<id>` and the legacy `<id>-<name-slug>` QR shape. */
export function companyIdFromParam(param: string): string | null {
  const value = param.trim();
  const id = value.slice(0, 24);
  if (!OBJECT_ID.test(id)) return null;
  if (value.length > 24 && value[24] !== "-") return null;
  return id.toLowerCase();
}

/** Turns a stored filename into a URL; absolute URLs pass through. */
export function companyImageUrl(image: string): string {
  const value = image.trim();
  if (!value || value === "no user photo") return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${UPLOAD_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

function primaryCategory(raw: unknown): string {
  if (!Array.isArray(raw)) return "";
  const rows = raw.filter(
    (entry): entry is Record<string, unknown> => !!entry && typeof entry === "object",
  );
  const root = rows.find((row) => !row.parent) ?? rows[0];
  const name = root ? text(root.name) : "";
  // "Бүгд" is the catch-all bucket, not a real category.
  return name === "Бүгд" ? "" : name;
}

function parseService(raw: unknown): CompanyService | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = text(row._id) || text(row.id);
  const name = text(row.service_name) || text(row.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    priceMnt: integer(row.price),
    durationMinutes: integer(row.duration),
  };
}

function latestBannerPhoto(raw: unknown): string {
  if (!Array.isArray(raw)) return "";
  let best = "";
  let bestTime = -Infinity;
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const photo = text(row.photo);
    if (!photo) continue;
    const time = Date.parse(text(row.createdAt)) || 0;
    if (time > bestTime) {
      best = photo;
      bestTime = time;
    }
  }
  return best;
}

export async function fetchPublicCompany(
  companyId: string,
  signal?: AbortSignal,
): Promise<PublicCompany | null> {
  const id = companyIdFromParam(companyId);
  if (!id) return null;

  const response = await fetch(`${COMPANY_API_URL}/${id}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  // An unknown id currently comes back as a 500 with success:false, so the
  // body decides "missing", not only the status code.
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const company = body?.company;
  if (!company || typeof company !== "object") {
    if (response.status === 404 || body?.success === false) return null;
    throw new Error(`Company request failed with status ${response.status}`);
  }

  const row = company as Record<string, unknown>;
  return {
    id,
    name: text(row.name),
    description: text(row.description),
    address: text(row.address),
    category: primaryCategory(row.category),
    logo: text(row.logo),
    cover: latestBannerPhoto(body?.banner),
    open: text(row.open),
    close: text(row.close),
    services: Array.isArray(body?.service)
      ? (body.service as unknown[])
          .map(parseService)
          .filter((value): value is CompanyService => value !== null)
      : [],
  };
}

export function formatMnt(amount: number): string {
  return `${new Intl.NumberFormat("mn-MN").format(amount)}₮`;
}
