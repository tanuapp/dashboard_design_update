import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertCircle, CalendarDays, MapPin, Ticket } from "lucide-react";
import {
  eventDateParts,
  eventImageUrl,
  fetchPublicEvent,
  fetchPublicEvents,
  formatEventTime,
  formatMnt,
  nextSession,
  sessionPricing,
  type PublicEvent,
  type PublicEventSummary,
} from "@/lib/event-api";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./Categories";

/** The backend's page-size cap, so a busy catalog cannot page GUYS out. */
const LIST_LIMIT = 50;
const MAX_EVENTS = 3;
const GUYS_PATTERN = /(^|[^\p{L}\p{N}])guys(?=$|[^\p{L}\p{N}])/iu;

type Pricing = ReturnType<typeof sessionPricing>;

/** Price lookup per event; a missing entry means it is still loading. */
type Offer = { state: "ready"; pricing: Pricing } | { state: "failed" };

/**
 * The list endpoint already returns only approved/published public events
 * that still have an upcoming active session. On top of that: GUYS only,
 * de-duplicated, soonest first, at most three.
 */
function pickGuysEvents(events: PublicEventSummary[], now: number): PublicEventSummary[] {
  const byId = new Map<string, { event: PublicEventSummary; startsAt: number }>();
  for (const event of events) {
    if (byId.has(event.id)) continue;
    if (!GUYS_PATTERN.test(event.title) && !GUYS_PATTERN.test(event.organizerName)) continue;
    const startsAt = event.nextSession?.startsAt ? Date.parse(event.nextSession.startsAt) : NaN;
    if (!(startsAt > now)) continue;
    byId.set(event.id, { event, startsAt });
  }
  return [...byId.values()]
    .sort((left, right) => left.startsAt - right.startsAt)
    .slice(0, MAX_EVENTS)
    .map((entry) => entry.event);
}

/** Prices the session the list advertised, which is the one the card shows. */
function pricingFor(detail: PublicEvent, summary: PublicEventSummary): Pricing {
  const session =
    detail.sessions.find((entry) => entry.id === summary.nextSession?.id) ?? nextSession(detail);
  return sessionPricing(session);
}

/**
 * Titles follow "GUYS — ЭМЗЭГХЭН ХАЙР / Баянхонгор". The three tour stops
 * share everything but the region, so it is pulled out to be shown loudly.
 * Anything that does not fit the pattern is shown as-is.
 */
function splitTitle(title: string): { artist: string; show: string; region: string } {
  const match = /^(.+?)\s+[—–-]\s+(.+?)(?:\s*\/\s*(.+))?$/.exec(title);
  if (!match) return { artist: "", show: title, region: "" };
  return { artist: match[1].trim(), show: match[2].trim(), region: (match[3] ?? "").trim() };
}

export function GuysEvents() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [events, setEvents] = useState<PublicEventSummary[]>([]);
  const [offers, setOffers] = useState<Record<string, Offer>>({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setStatus("loading");

    fetchPublicEvents({ limit: LIST_LIMIT, signal })
      .then((list) => {
        if (signal.aborted) return;
        const picked = pickGuysEvents(list, Date.now());
        setEvents(picked);
        setOffers({});
        setStatus("ready");

        // The list has no prices, so each card fills its own in afterwards.
        for (const event of picked) {
          fetchPublicEvent(event.id, signal)
            .then((detail) => {
              if (signal.aborted) return;
              setOffers((prev) => ({
                ...prev,
                [event.id]: detail
                  ? { state: "ready", pricing: pricingFor(detail, event) }
                  : { state: "failed" },
              }));
            })
            .catch(() => {
              if (signal.aborted) return;
              setOffers((prev) => ({ ...prev, [event.id]: { state: "failed" } }));
            });
        }
      })
      .catch(() => {
        if (!signal.aborted) setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    // Keeps the "services" anchor: the navbar link, hero search and category
    // cards still scroll to this slot of the page.
    <section
      id="services"
      className="relative border-y border-border/60 bg-surface-muted/35 py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          eyebrow="Тасалбар"
          title="GUYS хамтлагийн тоглолтууд"
          desc="Орон нутгийн тоглолтын тасалбараа TANU-аас аваарай."
        />

        <div className="mx-auto mt-12 max-w-5xl">
          {status === "loading" && (
            <CardRow>
              {Array.from({ length: MAX_EVENTS }, (_, i) => (
                <CardSlot key={i}>
                  <EventCardSkeleton />
                </CardSlot>
              ))}
            </CardRow>
          )}

          {status === "error" && (
            <StateCard
              icon={<AlertCircle className="h-5 w-5" />}
              title="Тоглолтын мэдээлэл ачаалж чадсангүй"
              body="Сүлжээгээ шалгаад дахин оролдоно уу."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-5 rounded-xl px-4"
                  onClick={() => setAttempt((value) => value + 1)}
                >
                  Дахин оролдох
                </Button>
              }
            />
          )}

          {status === "ready" && events.length === 0 && (
            <StateCard
              icon={<Ticket className="h-5 w-5" />}
              title="Одоогоор тоглолтын мэдээлэл байхгүй байна."
            />
          )}

          {status === "ready" && events.length > 0 && (
            <CardRow>
              {events.map((event, i) => (
                <CardSlot key={event.id}>
                  <motion.div
                    className="h-full"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <EventCard event={event} offer={offers[event.id]} />
                  </motion.div>
                </CardSlot>
              ))}
            </CardRow>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Swipeable row on phones; from `sm` it wraps, so three cards sit 2 + 1
 * (centred) on tablets and in one row on desktop.
 */
function CardRow({ children }: { children: React.ReactNode }) {
  return (
    <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 pt-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-0 [&::-webkit-scrollbar]:hidden">
      {children}
    </ul>
  );
}

function CardSlot({ children }: { children: React.ReactNode }) {
  return (
    <li className="w-[82%] max-w-[340px] shrink-0 snap-start sm:w-[calc(50%-12px)] sm:max-w-none lg:w-[calc((100%-48px)/3)]">
      {children}
    </li>
  );
}

function EventCard({ event, offer }: { event: PublicEventSummary; offer: Offer | undefined }) {
  const { artist, show, region } = splitTitle(event.title);
  const session = event.nextSession;
  const startsAt = session?.startsAt ?? null;
  const date = eventDateParts(startsAt);
  const time = formatEventTime(startsAt);
  const place = region || session?.city || "";
  const label = [artist, show, place].filter(Boolean).join(" — ");
  const onSale = offer?.state === "ready" && offer.pricing !== null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-surface/85 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/25 hover:shadow-glow">
      <EventPoster image={event.coverImage} alt={label || event.title} />

      <div className="flex flex-1 flex-col p-5">
        {(artist || onSale) && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
              {artist}
            </p>
            {onSale && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Худалдаанд
              </span>
            )}
          </div>
        )}
        <h3 className="mt-1.5 text-[1.05rem] font-bold leading-snug">
          <Link
            to="/event/$eventId"
            params={{ eventId: event.id }}
            className="outline-none after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-[var(--brand)]"
          >
            {show}
            {place && (
              <>
                {" — "}
                <span className="text-[var(--brand)]">{place}</span>
              </>
            )}
          </Link>
        </h3>

        {session && (
          <div className="mt-4 flex items-stretch gap-3">
            {date && (
              <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-[var(--brand)]/15 bg-brand-soft px-1 py-2 text-center text-[var(--brand)]">
                <span className="text-[10px] font-semibold leading-tight">{date.month}</span>
                <span className="mt-0.5 font-display text-2xl font-extrabold leading-none">
                  {date.day}
                </span>
              </div>
            )}
            <div className="min-w-0 space-y-1.5 text-sm">
              {date && (
                <p className="flex items-center gap-1.5 font-semibold text-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
                  <span className="truncate">
                    {date.weekday}
                    {time && ` · ${time}`}
                  </span>
                </p>
              )}
              {session.venueName && (
                <p className="flex items-center gap-1.5 font-semibold text-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
                  <span className="truncate">{session.venueName}</span>
                </p>
              )}
              {session.city && (
                <p className="truncate pl-5 text-xs text-muted-foreground">{session.city}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-dashed border-border pt-4">
            <PriceBlock offer={offer} />
            <Button
              size="sm"
              asChild
              className="relative z-10 shrink-0 rounded-xl bg-gradient-brand px-4 text-white hover:opacity-90"
            >
              <Link
                to="/event/$eventId"
                params={{ eventId: event.id }}
                aria-label={label ? `${label}: тасалбар авах` : undefined}
              >
                <Ticket className="mr-1.5 h-3.5 w-3.5" />
                Тасалбар авах
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function PriceBlock({ offer }: { offer: Offer | undefined }) {
  if (!offer) {
    return (
      <div aria-hidden className="space-y-1.5">
        <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (offer.state === "ready" && offer.pricing) {
    const { lowest, hasRange } = offer.pricing;
    return (
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">
          {hasRange ? "Эхлэх үнэ" : "Тасалбарын үнэ"}
        </p>
        <p className="font-bold">
          {formatMnt(lowest)}
          {hasRange && "-с"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <p className="text-[10px] text-muted-foreground">Тасалбар</p>
      <p className="text-sm font-semibold text-muted-foreground">
        {offer.state === "ready" ? "Одоогоор худалдаалахгүй" : "Дэлгэрэнгүйд"}
      </p>
    </div>
  );
}

/**
 * Posters are portrait (2:3) with the date and venue printed along the
 * bottom, so they are shown whole and left uncovered.
 */
function EventPoster({ image, alt }: { image: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const url = eventImageUrl(image);

  return (
    <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand)]/5">
      {url && !failed ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <Ticket className="h-12 w-12 text-[var(--brand)]/60" />
        </div>
      )}
    </div>
  );
}

/** Same footprint as a loaded card, so nothing jumps when data arrives. */
function EventCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-surface/85 shadow-sm backdrop-blur"
    >
      <div className="aspect-[2/3] animate-pulse bg-muted" />
      <div className="p-5">
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        <div className="mt-2.5 h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-4 flex gap-3">
          <div className="h-[4.25rem] w-16 animate-pulse rounded-2xl bg-muted" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-dashed border-border pt-4">
          <div className="space-y-1.5">
            <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-32 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

function StateCard({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border/80 bg-surface/85 p-8 text-center shadow-sm backdrop-blur">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-[var(--brand)]/15 bg-brand-soft text-[var(--brand)]">
        {icon}
      </div>
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      {body && <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{body}</p>}
      {action}
    </div>
  );
}
