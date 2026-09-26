/**
 * Public company profile for the shared-link landing page.
 *
 * Companies share `https://www.tanu.mn/company/<slug>` (older links carry the
 * id instead). The TANU app opens that link directly when installed; this
 * page is what everyone else sees, and what link previews read.
 *
 * `/company/public/:slug` returns only public fields and resolves a slug, a
 * previous slug, an id, or `<id>-<slug>`.
 */

const PUBLIC_COMPANY_API_URL = "https://api.tanusoft.mn/api/v1/company/public";
const LEGACY_COMPANY_API_URL = "https://api.tanusoft.mn/api/v1/company";
const UPLOAD_BASE_URL = "https://api.tanusoft.mn/uploads";
const REQUEST_TIMEOUT_MS = 4000;

export type CompanyService = {
  id: string;
  name: string;
  priceMnt: number;
  durationMinutes: number;
};

export type PublicCompany = {
  id: string;
  slug: string;
  url: string;
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

export type CompanyLookup =
  | { status: "ready"; company: PublicCompany; canonical: boolean }
  | { status: "missing" }
  | { status: "error" };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function integer(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Turns a stored filename into a URL; absolute URLs pass through. */
export function companyImageUrl(image: string): string {
  const value = image.trim();
  if (!value || value === "no-logo.png" || value === "no user photo") return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${UPLOAD_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

function parseCompany(raw: unknown): PublicCompany | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = text(row.id);
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  const categories = Array.isArray(row.categories) ? row.categories.map(text) : [];
  const services = Array.isArray(row.services) ? row.services : [];

  return {
    id,
    slug: text(row.slug),
    url: text(row.url),
    name: text(row.name),
    description: text(row.description),
    address: text(row.address),
    // "Бүгд" is the catch-all bucket, not a real category.
    category: categories.find((name) => name && name !== "Бүгд") ?? "",
    logo: text(row.logo),
    cover: text(row.cover),
    open: text(row.open),
    close: text(row.close),
    services: services
      .map((entry): CompanyService | null => {
        if (!entry || typeof entry !== "object") return null;
        const service = entry as Record<string, unknown>;
        const serviceId = text(service.id);
        const name = text(service.name);
        if (!serviceId || !name) return null;
        return {
          id: serviceId,
          name,
          priceMnt: integer(service.price),
          durationMinutes: integer(service.duration),
        };
      })
      .filter((value): value is CompanyService => value !== null),
  };
}

/** Looks a company up by whatever the link carries. Never throws. */
export async function lookupPublicCompany(key: string): Promise<CompanyLookup> {
  const value = key.trim();
  if (!value) return { status: "missing" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${PUBLIC_COMPANY_API_URL}/${encodeURIComponent(value)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (response.status === 404) {
      // An API without the public route answers with a plain HTML 404.
      const routeMissing = !(response.headers.get("content-type") || "").includes("json");
      return routeMissing ? await legacyLookup(value, controller.signal) : { status: "missing" };
    }
    if (!response.ok) return { status: "error" };
    const body = (await response.json()) as { data?: unknown; matchedBy?: unknown };
    const company = parseCompany(body.data);
    if (!company) return { status: "missing" };
    return { status: "ready", company, canonical: body.matchedBy === "slug" };
  } catch {
    return { status: "error" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Id links through the older company endpoint, for an API that predates
 * `/company/public`. That response carries private fields, so only the
 * public ones are copied out; nothing else reaches the page.
 */
async function legacyLookup(key: string, signal: AbortSignal): Promise<CompanyLookup> {
  const id = key.match(/^([a-f\d]{24})(?:-.*)?$/i)?.[1];
  if (!id) return { status: "missing" };
  const response = await fetch(`${LEGACY_COMPANY_API_URL}/${id}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  // That endpoint answers an unknown id with a 400/500 instead of a 404.
  if (!response.ok) return { status: response.status === 429 ? "error" : "missing" };
  const body = (await response.json()) as Record<string, unknown>;
  const row = body.company as Record<string, unknown> | undefined;
  if (!row || typeof row !== "object") return { status: "missing" };

  const banners = Array.isArray(body.banner) ? (body.banner as Record<string, unknown>[]) : [];
  const cover = banners
    .filter((banner) => text(banner?.photo))
    .sort((a, b) => Date.parse(text(b.createdAt)) - Date.parse(text(a.createdAt)))[0];
  const categories = Array.isArray(row.category) ? (row.category as Record<string, unknown>[]) : [];

  const company = parseCompany({
    id,
    slug: "",
    url: `https://www.tanu.mn/company/${id}`,
    name: row.name,
    description: row.description,
    address: row.address,
    logo: row.logo,
    cover: cover ? cover.photo : "",
    open: row.open,
    close: row.close,
    categories: categories.map((category) => text(category?.name)),
    services: (Array.isArray(body.service) ? (body.service as Record<string, unknown>[]) : []).map(
      (service) => ({
        id: text(service?._id),
        name: text(service?.service_name),
        price: service?.price,
        duration: service?.duration,
      }),
    ),
  });
  return company ? { status: "ready", company, canonical: true } : { status: "missing" };
}

/** The key a company's link should carry: its slug, else its id. */
export function companyKey(company: PublicCompany): string {
  return company.slug || company.id;
}

export function formatMnt(amount: number): string {
  return `${new Intl.NumberFormat("mn-MN").format(amount)}₮`;
}
