import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { Background } from "@/components/effects/Background";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { privacyData, type PrivacySection } from "@/lib/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Нууцлалын бодлого — TANU" },
      {
        name: "description",
        content:
          "TANU үйлчилгээний нууцлалын бодлого. Хувийн мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалдаг талаарх албан ёсны мэдээлэл.",
      },
      { property: "og:title", content: "Нууцлалын бодлого — TANU" },
      {
        property: "og:description",
        content:
          "TANU үйлчилгээний нууцлалын бодлого. Хувийн мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалдаг талаарх албан ёсны мэдээлэл.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "TANU" },
      { property: "og:url", content: "https://www.tanu.mn/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.tanu.mn/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Background />
      <Navbar
        onOpenBusinessSignup={() =>
          window.location.assign("https://admin.tanu.mn/auth/boxed-signup")
        }
      />

      <main className="relative mx-auto w-full max-w-5xl px-5 pb-16 pt-28 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[var(--brand)]/15 bg-brand-soft text-[var(--brand)] shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
            TanuSoft
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            Нууцлалын бодлого / Privacy Policy
          </h1>
        </header>

        <section className="mb-7 rounded-2xl border border-border bg-surface/80 p-5 shadow-sm backdrop-blur sm:p-7">
          <div className="space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">
            <p>
              “Танусофт” ХХК (“бид”, “манай”) нь www.tanu.mn веб хуудас болон Tanu гар утасны
              аппликэйшнаар дамжуулан үйлчилгээ (“Үйлчилгээ”) үзүүлдэг компани юм.
            </p>
            <p>
              Энэхүү Нууцлалын бодлогоор Үйлчилгээг ашиглах үед таны хувийн мэдээллийг хэрхэн
              бүртгэх, ашиглах, хамгаалах, нээлттэй болгох болон тэдгээр мэдээллийг таны
              оролцоотойгоор хэрхэн удирдахтай холбоотой бидний баримтлах бодлогыг тодорхойлно.
            </p>
          </div>
        </section>

        <div className="rounded-2xl border border-border bg-surface/86 px-5 py-2 shadow-sm backdrop-blur sm:px-7">
          {privacyData.map((section) => (
            <PolicySection key={section.title} section={section} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PolicySection({ section }: { section: PrivacySection }) {
  return (
    <section className="border-b border-border/80 py-6 last:border-b-0">
      <PolicyTitle>{section.title}</PolicyTitle>

      {section.subsection?.length ? (
        <div className="mt-5 space-y-5 sm:pl-5">
          {section.subsection.map((subsection) => (
            <div key={subsection.title}>
              <PolicyTitle nested>{subsection.title}</PolicyTitle>
              <PolicyText>{subsection.description}</PolicyText>
            </div>
          ))}
        </div>
      ) : section.isList ? (
        <ul className="mt-4 list-disc space-y-3 pl-6 text-muted-foreground marker:text-[var(--brand)]">
          {(section.listItems || []).map((item) => (
            <li key={item}>
              <span className="text-base leading-8 sm:text-lg">{item}</span>
            </li>
          ))}
        </ul>
      ) : section.description ? (
        <PolicyText>{section.description}</PolicyText>
      ) : null}
    </section>
  );
}

function PolicyTitle({ children, nested = false }: { children: string; nested?: boolean }) {
  return (
    <h2
      className={`${nested ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"} font-bold text-foreground`}
    >
      {children}
    </h2>
  );
}

function PolicyText({ children }: { children: string }) {
  return <p className="mt-3 text-base leading-8 text-muted-foreground sm:text-lg">{children}</p>;
}
