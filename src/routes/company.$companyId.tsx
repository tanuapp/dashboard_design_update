import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Building2,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  Smartphone,
  Tag,
} from "lucide-react";

import { Background } from "@/components/effects/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/company-api";
import {
  COMPANY_ANDROID_DEEP_LINK_BASE_URL,
  companyIdFromParam,
  companyImageUrl,
  fetchPublicCompany,
  formatMnt,
  type PublicCompany,
} from "@/lib/company-page-api";

export const Route = createFileRoute("/company/$companyId")({
  head: ({ params }) => {
    const companyId = companyIdFromParam(params.companyId) ?? params.companyId;
    return {
      meta: [
        { title: "Байгууллага — TANU" },
        {
          name: "description",
          content: "TANU аппаар цагаа захиалаарай. Байгууллагын үйлчилгээ, хаяг, цагийн хуваарь.",
        },
        { property: "og:title", content: "Байгууллага — TANU" },
        {
          property: "og:description",
          content: "TANU аппаар цагаа захиалаарай. Байгууллагын үйлчилгээ, хаяг, цагийн хуваарь.",
        },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "TANU" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "apple-itunes-app",
          content: `app-id=6737768604, app-argument=https://www.tanu.mn/company/${encodeURIComponent(companyId)}`,
        },
      ],
    };
  },
  component: CompanyLandingPage,
});

/** Rough mobile check, used only to decide whether to try the app at all. */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function CompanyLandingPage() {
  const { companyId: rawCompanyId } = Route.useParams();
  const companyId = companyIdFromParam(rawCompanyId);
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [showIosOpenHint, setShowIosOpenHint] = useState(false);
  const autoOpenAttempted = useRef(false);

  useEffect(() => {
    if (!companyId) {
      setStatus("missing");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");

    fetchPublicCompany(companyId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setCompany(result);
        setStatus(result ? "ready" : "missing");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });

    return () => controller.abort();
  }, [companyId]);

  // Same handoff as the event page. Android has no scheme collision, so it
  // gets the fast automatic handoff. iOS stays on this page and shows Apple's
  // native Smart App Banner: its App Store ID selects TANU Customer even
  // while an old Business release still has the legacy `tanu://` scheme.
  useEffect(() => {
    if (!companyId || autoOpenAttempted.current || !isMobile() || isIos()) return;
    autoOpenAttempted.current = true;
    const timer = window.setTimeout(() => {
      window.location.href = `${COMPANY_ANDROID_DEEP_LINK_BASE_URL}/${companyId}`;
    }, 900);
    return () => window.clearTimeout(timer);
  }, [companyId]);

  const openInApp = () => {
    if (!companyId) return;
    if (isIos()) {
      // Safari has no JavaScript API that presses its Smart App Banner, and
      // the legacy scheme may open TANU Business; point at the OPEN control.
      setShowIosOpenHint(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.href = `${COMPANY_ANDROID_DEEP_LINK_BASE_URL}/${companyId}`;
  };

  const storeUrl = isIos() ? APP_STORE_URL : PLAY_STORE_URL;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Background />
      <Navbar
        onOpenBusinessSignup={() =>
          window.location.assign("https://admin.tanu.mn/auth/boxed-signup")
        }
      />

      <main className="relative mx-auto w-full max-w-3xl px-5 pb-16 pt-28 sm:px-6 lg:px-8">
        {status === "loading" && <CompanySkeleton />}

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
            icon={<Building2 className="h-6 w-6" />}
            title="Байгууллага олдсонгүй"
            body="Энэ холбоос хуучирсан эсвэл байгууллага идэвхгүй болсон байж болзошгүй."
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

        {status === "ready" && company && (
          <article className="overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-sm backdrop-blur">
            <CompanyCover company={company} />

            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <CompanyLogo company={company} />
                <div className="min-w-0">
                  {company.category && (
                    <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                      {company.category}
                    </span>
                  )}
                  <h1 className="mt-2 break-words text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
                    {company.name || "Байгууллага"}
                  </h1>
                </div>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                {company.address && (
                  <Fact
                    icon={<MapPin className="h-4 w-4" />}
                    label="Хаяг"
                    value={company.address}
                  />
                )}
                {company.open && company.close && (
                  <Fact
                    icon={<Clock className="h-4 w-4" />}
                    label="Ажиллах цаг"
                    value={`${company.open} – ${company.close}`}
                  />
                )}
              </dl>

              {company.description && (
                <p className="mt-6 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {company.description}
                </p>
              )}

              {company.services.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-sm font-bold text-foreground">Үйлчилгээ</h2>
                  <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-background/60">
                    {company.services.map((service) => (
                      <li
                        key={service.id}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-foreground">
                            {service.name}
                          </p>
                          {service.durationMinutes > 0 && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {service.durationMinutes} минут
                            </p>
                          )}
                        </div>
                        {service.priceMnt > 0 && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
                            <Tag className="h-3.5 w-3.5 text-[var(--brand)]" />
                            {formatMnt(service.priceMnt)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-8 rounded-2xl border border-[var(--brand)]/20 bg-brand-soft/60 p-5">
                <div className="flex items-start gap-3">
                  <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Цагаа TANU аппаар захиалаарай
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Апп суулгасан бол шууд энэ байгууллагын хуудас руу нэвтэрнэ.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={openInApp}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Аппаар нээх
                  </button>
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface"
                  >
                    <Download className="h-4 w-4" />
                    Апп татах
                  </a>
                </div>

                {showIosOpenHint && (
                  <p
                    role="status"
                    className="mt-3 rounded-xl border border-[var(--brand)]/20 bg-background/80 px-4 py-3 text-center text-sm font-semibold text-foreground"
                  >
                    Дэлгэцийн дээд хэсэгт байгаа OPEN товчийг дарж TANU апп руу орно уу.
                  </p>
                )}
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}

function CompanyCover({ company }: { company: PublicCompany }) {
  const [failed, setFailed] = useState(false);
  const url = companyImageUrl(company.cover);

  if (!url || failed) {
    return (
      <div className="h-28 w-full bg-gradient-to-br from-[var(--brand)]/25 to-[var(--brand)]/5 sm:h-36" />
    );
  }

  return (
    <img
      src={url}
      alt={company.name}
      className="aspect-[16/7] w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function CompanyLogo({ company }: { company: PublicCompany }) {
  const [failed, setFailed] = useState(false);
  const url = companyImageUrl(company.logo);

  if (!url || failed) {
    return (
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-border bg-brand-soft text-[var(--brand)]">
        <Building2 className="h-7 w-7" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="h-16 w-16 shrink-0 rounded-2xl border border-border bg-white object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
      <span className="mt-0.5 text-[var(--brand)]">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 break-words text-sm font-semibold text-foreground">{value}</dd>
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

/** Matches the loaded layout so nothing jumps when the data arrives. */
function CompanySkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-sm backdrop-blur">
      <div className="aspect-[16/7] w-full animate-pulse bg-muted" />
      <div className="space-y-4 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-muted" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-3 pt-4 sm:grid-cols-2">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
