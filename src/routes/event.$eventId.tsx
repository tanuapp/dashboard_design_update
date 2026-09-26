import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Clock, MapPin, Smartphone, Ticket } from "lucide-react";

import { AppButtons, AppHandoff } from "@/components/app/AppHandoff";
import { Background } from "@/components/effects/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { APP_STORE_ID, SITE_URL } from "@/lib/app-handoff";
import {
  eventImageUrl,
  fetchPublicEvent,
  formatEventDate,
  formatEventTime,
  formatMnt,
  nextSession,
  sessionPricing,
  type PublicEvent,
} from "@/lib/event-api";

const FALLBACK_DESCRIPTION =
  "TANU аппаар тасалбараа аваарай. Арга хэмжээний огноо, байршил, үнийн мэдээлэл.";

type EventLookup =
  { status: "ready"; event: PublicEvent } | { status: "missing" } | { status: "error" };

export const Route = createFileRoute("/event/$eventId")({
  // Server-side, so link previews show the real title and poster.
  loader: async ({ params }): Promise<EventLookup> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const event = await fetchPublicEvent(params.eventId, controller.signal);
      return event ? { status: "ready", event } : { status: "missing" };
    } catch {
      return { status: "error" };
    } finally {
      clearTimeout(timer);
    }
  },
  head: ({ loaderData, params }) => {
    const event = loaderData?.status === "ready" ? loaderData.event : null;
    const url = `${SITE_URL}/event/${encodeURIComponent(params.eventId)}`;
    const title = event?.title ? `${event.title} — TANU` : "Арга хэмжээ — TANU";
    const description = event?.description?.slice(0, 180) || FALLBACK_DESCRIPTION;
    const image = event ? eventImageUrl(event.coverImage) : "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: event?.title || title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "TANU" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "apple-itunes-app", content: `app-id=${APP_STORE_ID}, app-argument=${url}` },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: EventLandingPage,
});

function EventLandingPage() {
  const lookup = Route.useLoaderData();
  const status = lookup.status;
  const event = lookup.status === "ready" ? lookup.event : null;
  const session = useMemo(() => (event ? nextSession(event) : null), [event]);
  const pricing = useMemo(() => sessionPricing(session), [session]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Background />
      <Navbar
        onOpenBusinessSignup={() =>
          window.location.assign("https://admin.tanu.mn/auth/boxed-signup")
        }
      />

      <main className="relative mx-auto w-full max-w-3xl px-5 pb-16 pt-28 sm:px-6 lg:px-8">
        {status === "error" && (
          <StateCard
            icon={<AlertCircle className="h-6 w-6" />}
            title="Мэдээлэл ачаалж чадсангүй"
            body="Сүлжээгээ шалгаад дахин оролдоно уу."
            action={
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Дахин оролдох
              </button>
            }
          />
        )}

        {status === "missing" && (
          <StateCard
            icon={<Ticket className="h-6 w-6" />}
            title="Арга хэмжээ олдсонгүй"
            body="Энэ холбоос хуучирсан эсвэл арга хэмжээ хаагдсан байж болзошгүй."
            action={
              <a
                href="https://www.tanu.mn"
                className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Нүүр хуудас
              </a>
            }
          />
        )}

        {status === "ready" && event && (
          <>
            <AppHandoff path={`/event/${event.id}`} name={event.title} />
            <article className="overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-sm backdrop-blur">
              <EventPoster event={event} />

              <div className="p-6 sm:p-8">
                {event.category && (
                  <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                    {event.category}
                  </span>
                )}

                <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {event.title || "Арга хэмжээ"}
                </h1>

                {event.organizerName && (
                  <p className="mt-2 text-sm text-muted-foreground">{event.organizerName}</p>
                )}

                {session && (
                  <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                    {session.startsAt && (
                      <Fact
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Огноо"
                        value={formatEventDate(session.startsAt)}
                      />
                    )}
                    {session.startsAt && (
                      <Fact
                        icon={<Clock className="h-4 w-4" />}
                        label="Эхлэх"
                        value={formatEventTime(session.startsAt)}
                      />
                    )}
                    {session.venueName && (
                      <Fact
                        icon={<MapPin className="h-4 w-4" />}
                        label="Байршил"
                        value={[session.venueName, session.venueCity].filter(Boolean).join(", ")}
                      />
                    )}
                    {pricing && (
                      <Fact
                        icon={<Ticket className="h-4 w-4" />}
                        label="Тасалбар"
                        value={`${formatMnt(pricing.lowest)}${pricing.hasRange ? "-с" : ""}`}
                      />
                    )}
                  </dl>
                )}

                {event.description && (
                  <p className="mt-6 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {event.description}
                  </p>
                )}

                <div className="mt-8 rounded-2xl border border-[var(--brand)]/20 bg-brand-soft/60 p-5">
                  <div className="flex items-start gap-3">
                    <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Тасалбараа TANU аппаар аваарай
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Апп суулгасан бол шууд энэ арга хэмжээ рүү нэвтэрнэ. Шинээр татсан ч апп
                        нээгдэхдээ энэ арга хэмжээг харуулна.
                      </p>
                    </div>
                  </div>

                  <AppButtons path={`/event/${event.id}`} />
                </div>
              </div>
            </article>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function EventPoster({ event }: { event: PublicEvent }) {
  const [failed, setFailed] = useState(false);
  const url = eventImageUrl(event.coverImage);

  if (!url || failed) {
    return (
      <div className="grid aspect-[16/10] w-full place-items-center bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand)]/5">
        <Ticket className="h-12 w-12 text-[var(--brand)]/60" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={event.title}
      className="aspect-[16/10] w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
      <span className="mt-0.5 text-[var(--brand)]">{icon}</span>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-semibold text-foreground">{value}</dd>
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
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface/80 p-10 text-center shadow-sm backdrop-blur">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[var(--brand)]/15 bg-brand-soft text-[var(--brand)]">
        {icon}
      </div>
      <h1 className="mt-5 text-xl font-bold text-foreground">{title}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p>
      <div className="mt-6 flex justify-center">{action}</div>
    </div>
  );
}
