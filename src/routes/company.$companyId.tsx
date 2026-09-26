import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Building2, Clock, MapPin, Smartphone, Tag } from "lucide-react";

import { AppButtons, AppHandoff } from "@/components/app/AppHandoff";
import { Background } from "@/components/effects/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { APP_STORE_ID, SITE_URL } from "@/lib/app-handoff";
import {
  companyImageUrl,
  companyKey,
  formatMnt,
  lookupPublicCompany,
  type PublicCompany,
} from "@/lib/company-page-api";

const FALLBACK_DESCRIPTION =
  "TANU аппаар цагаа захиалаарай. Байгууллагын үйлчилгээ, хаяг, цагийн хуваарь.";

export const Route = createFileRoute("/company/$companyId")({
  // Server-side, so link previews (Messenger, Facebook) show the real name
  // and picture, and ids / old slugs redirect to the readable slug URL.
  loader: async ({ params }) => {
    const lookup = await lookupPublicCompany(params.companyId);
    if (lookup.status === "ready") {
      const key = companyKey(lookup.company);
      if (key !== params.companyId.toLowerCase()) {
        throw redirect({ to: "/company/$companyId", params: { companyId: key }, statusCode: 301 });
      }
    }
    return lookup;
  },
  head: ({ loaderData, params }) => {
    const company = loaderData?.status === "ready" ? loaderData.company : null;
    const url = `${SITE_URL}/company/${company ? companyKey(company) : encodeURIComponent(params.companyId)}`;
    const title = company?.name ? `${company.name} — TANU` : "Байгууллага — TANU";
    const description = company?.description?.slice(0, 180) || FALLBACK_DESCRIPTION;
    const image = company ? companyImageUrl(company.cover) || companyImageUrl(company.logo) : "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: company?.name || title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "TANU" },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
        { name: "apple-itunes-app", content: `app-id=${APP_STORE_ID}, app-argument=${url}` },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CompanyLandingPage,
});

function CompanyLandingPage() {
  const lookup = Route.useLoaderData();
  const router = useRouter();
  const company = lookup.status === "ready" ? lookup.company : null;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Background />
      <Navbar
        onOpenBusinessSignup={() =>
          window.location.assign("https://admin.tanu.mn/auth/boxed-signup")
        }
      />

      <main className="relative mx-auto w-full max-w-3xl px-5 pb-16 pt-28 sm:px-6 lg:px-8">
        {lookup.status === "error" && (
          <StateCard
            icon={<AlertCircle className="h-6 w-6" />}
            title="Мэдээлэл ачаалж чадсангүй"
            body="Сүлжээгээ шалгаад дахин оролдоно уу."
            action={
              <button
                type="button"
                onClick={() => void router.invalidate()}
                className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Дахин оролдох
              </button>
            }
          />
        )}

        {lookup.status === "missing" && (
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

        {company && (
          <>
            <AppHandoff path={`/company/${company.id}`} name={company.name} />
            <CompanyProfile company={company} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function CompanyProfile({ company }: { company: PublicCompany }) {
  return (
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
            <Fact icon={<MapPin className="h-4 w-4" />} label="Хаяг" value={company.address} />
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
                <li key={service.id} className="flex items-center justify-between gap-4 px-4 py-3">
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
              <p className="text-sm font-semibold text-foreground">Цагаа TANU аппаар захиалаарай</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Апп суулгасан бол шууд энэ байгууллагын хуудас руу нэвтэрнэ. Шинээр татсан ч апп
                нээгдэхдээ энэ хуудсыг харуулна.
              </p>
            </div>
          </div>
          <AppButtons path={`/company/${company.id}`} />
        </div>
      </div>
    </article>
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
