import { useApp } from "@/lib/app-context";
import { BrandLogo } from "@/components/brand/Logo";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Apple,
  Play,
} from "lucide-react";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/company-api";

export function Footer() {
  const { mode, theme } = useApp();
  const cols =
    mode === "business"
      ? [
          {
            title: "Бүтээгдэхүүн",
            links: ["AI туслах", "Заавар", "Цаг захиалга", "Tanu Business", "Тасалбар"],
          },
          {
            title: "Ангилал",
            links: [
              "Гоо сайхан",
              "Эмнэлэг",
              "Тасалбар",
              "Сургалт",
              "Хуульч",
              "Буудал",
              "Төрийн алба",
              "Бусад",
            ],
          },
          {
            title: "Хууль",
            links: [
              "Системийн бүтэц",
              "Үйлчилгээний нөхцөл",
              "Нууцлалын бодлого",
              "Бидний тухай",
              "Холбоо барих",
            ],
          },
        ]
      : [
          {
            title: "Бүтээгдэхүүн",
            links: ["AI туслах", "Заавар", "Апп татах", "Цаг захиалга", "Tanu Business"],
          },
          {
            title: "Ангилал",
            links: [
              "Гоо сайхан",
              "Эмнэлэг",
              "Тасалбар",
              "Сургалт",
              "Хуульч",
              "Буудал",
              "Төрийн алба",
              "Бусад",
            ],
          },
          {
            title: "Хууль",
            links: [
              "Системийн бүтэц",
              "Үйлчилгээний нөхцөл",
              "Нууцлалын бодлого",
              "Бидний тухай",
              "Холбоо барих",
            ],
          },
        ];

  return (
    <footer className="relative mt-10 overflow-hidden border-t border-[color-mix(in_oklch,var(--brand)_16%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--surface)_86%,var(--brand-soft)),color-mix(in_oklch,var(--background)_92%,var(--brand-soft)))]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-2)]/70 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--brand)_7%,transparent),transparent_42%,color-mix(in_oklch,var(--brand-2)_6%,transparent))]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_2fr_1.15fr]">
        <div>
          <BrandLogo mode={mode} className="h-12" invert={theme === "dark"} />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            ТАНУСОФТ ХХК нь вэб, апп хөгжүүлэх, техник технологийн шинэ бүтээгдэхүүнийг зах зээлд
            гаргах эрхэм зорилготойгоор 2020 оноос эхлэн ажиллаж байгаа старт-ап компани юм.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/15 bg-brand-soft/70 px-3 py-1.5 text-xs font-semibold text-[var(--brand)] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_10px_var(--success)]" />
            Хялбар, хурдан, найдвартай
          </div>
          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> info@tanusoft.mn
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> +976 7570 1005
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Улаанбаатар, Монгол
            </p>
          </div>
          <div className="mt-5 flex gap-2">
            {[
              { Icon: Facebook, href: "https://www.facebook.com/tanu.mn", label: "Фэйсбүүк" },
              { Icon: Youtube, href: "https://www.youtube.com/@tanusoft", label: "Юүтүб" },
              { Icon: Instagram, href: "https://instagram.com/tanu.mn", label: "Инстаграм" },
              { Icon: Twitter, href: "https://www.tanu.mn/", label: "Tanu" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="h-10 w-10 grid place-items-center rounded-xl border border-border bg-surface/65 text-muted-foreground transition hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:bg-brand-soft hover:text-[var(--brand)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-bold">{c.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href={footerHref(l)}
                      className="inline-block transition hover:translate-x-0.5 hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-semibold">Апп татах</p>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href={APP_STORE_URL}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/65 px-3 py-2.5 text-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:bg-brand-soft hover:text-[var(--brand)]"
            >
              <Apple className="h-4 w-4" /> App Store
            </a>
            <a
              href={PLAY_STORE_URL}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/65 px-3 py-2.5 text-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:bg-brand-soft hover:text-[var(--brand)]"
            >
              <Play className="h-4 w-4" /> Google Play
            </a>
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--brand)]/15 bg-surface/75 p-3 shadow-sm backdrop-blur">
            <div className="rounded-xl bg-white p-2 shadow-inner">
              <img
                src="/brand/qr.svg"
                alt="Tanu app QR"
                className="aspect-square w-full rounded-lg object-contain"
              />
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-[var(--brand)]">
              QR уншуулж апп татах
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70 bg-background/25">
        <div className="mx-auto max-w-7xl px-5 py-5 flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} TanuSoft LLC. Бүх эрх хуулиар хамгаалагдсан.</span>
          <div className="flex gap-5">
            <a href={footerHref("Нууцлалын бодлого")} className="hover:text-foreground">
              Нууцлалын бодлого
            </a>
            <a href={footerHref("Үйлчилгээний нөхцөл")} className="hover:text-foreground">
              Үйлчилгээний нөхцөл
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function footerHref(label: string) {
  const hrefs: Record<string, string> = {
    "AI туслах": "https://admin.tanu.mn/",
    Заавар: "https://www.tanu.mn/",
    "Апп татах": APP_STORE_URL,
    "Цаг захиалга": "https://www.tanu.mn/",
    "Tanu Business": "https://admin.tanu.mn/auth/boxed-signup",
    "Системийн бүтэц": "https://www.tanu.mn/",
    "Үйлчилгээний нөхцөл": "https://www.tanu.mn/terms",
    "Нууцлалын бодлого": "/privacy",
    "Бидний тухай": "https://www.tanu.mn/about",
    "Холбоо барих": "/contact",
  };

  return hrefs[label] ?? "#categories";
}
