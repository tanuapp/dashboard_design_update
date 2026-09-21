/**
 * Public event lookup for the shared-link landing page.
 *
 * The TANU apps share `https://tanu.mn/event/<id>`. On a phone that link is
 * an Android App Link / iOS Universal Link and opens the app directly; on a
 * desktop, or where the app is not installed, it lands here instead. So this
 * page has to stand on its own: real event details, plus a way into the app.
 *
 * It reads the same public discovery endpoint the apps use, which needs no
 * authentication.
 */

const TICKET_API_URL = "https://api.tanusoft.mn/api/v1/ticket";
const UPLOAD_BASE_URL = "https://api.tanusoft.mn/uploads";

export const EVENT_DEEP_LINK_SCHEME = "tanu://tanu.mn/event";

export type EventTicketType = {
  id: string;
  name: string;
  priceMnt: number;
};

export type EventSession = {
  id: string;
  startsAt: string | null;
  endsAt: string | null;
  doorsOpenAt: string | null;
  venueName: string;
  venueCity: string;
  venueAddress: string;
  hallName: string;
  ticketTypes: EventTicketType[];
};

export type PublicEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  organizerName: string;
  sessions: EventSession[];
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function integer(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isoOrNull(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  return Number.isNaN(Date.parse(raw)) ? null : raw;
}

/** Turns a stored filename into a URL; absolute URLs pass through. */
export function eventImageUrl(image: string): string {
  const value = image.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${UPLOAD_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

function parseSession(raw: unknown): EventSession | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = text(row._id) || text(row.id);
  if (!id) return null;

  const ticketTypes = Array.isArray(row.ticketTypes)
    ? row.ticketTypes
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const type = entry as Record<string, unknown>;
          const typeId = text(type._id) || text(type.id);
          if (!typeId) return null;
          return {
            id: typeId,
            name: text(type.name) || "Тасалбар",
            priceMnt: integer(type.priceMnt),
          } satisfies EventTicketType;
        })
        .filter((value): value is EventTicketType => value !== null)
    : [];

  return {
    id,
    startsAt: isoOrNull(row.startsAt),
    endsAt: isoOrNull(row.endsAt),
    doorsOpenAt: isoOrNull(row.doorsOpenAt),
    venueName: text(row.venueName),
    venueCity: text(row.venueCity),
    venueAddress: text(row.venueAddress),
    hallName: text(row.hallName),
    ticketTypes,
  };
}

function parseEvent(raw: unknown): PublicEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = text(row._id) || text(row.id);
  if (!id) return null;

  return {
    id,
    title: text(row.title),
    description: text(row.description),
    category: text(row.category),
    coverImage: text(row.coverImage),
    organizerName: text(row.organizerName),
    sessions: Array.isArray(row.sessions)
      ? row.sessions.map(parseSession).filter((value): value is EventSession => value !== null)
      : [],
  };
}

/**
 * Fetches one public event.
 *
 * Returns null when the event does not exist or the response is not usable,
 * so the caller can render a proper "not found" state rather than a blank
 * page. Network failures throw, so a retry can be offered separately.
 */
export async function fetchPublicEvent(
  eventId: string,
  signal?: AbortSignal,
): Promise<PublicEvent | null> {
  const id = eventId.trim();
  if (!id) return null;

  const response = await fetch(`${TICKET_API_URL}/discover/events/${encodeURIComponent(id)}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Event request failed with status ${response.status}`);
  }

  const body = (await response.json()) as Record<string, unknown>;
  return parseEvent(body.data ?? body);
}

/** The next session that has not started, else the first one. */
export function nextSession(event: PublicEvent): EventSession | null {
  if (event.sessions.length === 0) return null;
  const now = Date.now();
  const upcoming = event.sessions
    .filter((session) => {
      if (!session.startsAt) return true;
      return Date.parse(session.startsAt) > now;
    })
    .sort((left, right) => {
      const a = left.startsAt ? Date.parse(left.startsAt) : 0;
      const b = right.startsAt ? Date.parse(right.startsAt) : 0;
      return a - b;
    });
  return upcoming[0] ?? event.sessions[0];
}

/**
 * Cheapest ticket price, or null when the session sells nothing.
 * `hasRange` is what decides whether "-с" is honest.
 */
export function sessionPricing(
  session: EventSession | null,
): { lowest: number; hasRange: boolean } | null {
  if (!session || session.ticketTypes.length === 0) return null;
  const prices = session.ticketTypes.map((type) => type.priceMnt).sort((a, b) => a - b);
  return { lowest: prices[0], hasRange: prices[0] !== prices[prices.length - 1] };
}

export function formatMnt(value: number): string {
  return `${value.toLocaleString("en-US")}₮`;
}

const MONTH_DAY = new Intl.DateTimeFormat("mn-MN", {
  month: "long",
  day: "numeric",
});
const TIME = new Intl.DateTimeFormat("mn-MN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatEventDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : MONTH_DAY.format(date);
}

export function formatEventTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : TIME.format(date);
}
