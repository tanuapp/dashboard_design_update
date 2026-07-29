import { useApp } from "@/lib/app-context";
import { BrandLogo } from "@/components/brand/Logo";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Apple, Play } from "lucide-react";

export function Footer() {
  const { mode, theme } = useApp();
  const cols = mode === "business"
    ? [
        { title: "Бүтээгдэхүүн", links: ["Захиалгын систем", "Календарь", "Ажилтны удирдлага", "Тайлан", "Marketplace"] },
        { title: "Шийдэл", links: ["Гоо сайхан", "Эмнэлэг", "Спорт", "Сургалт", "Авто үйлчилгээ"] },
        { title: "Дэмжлэг", links: ["Гарын авлага", "Тусламж", "API баримт", "Статус", "Холбоо барих"] },
      ]
    : [
        { title: "Хэрэглэгчид", links: ["Үйлчилгээ хайх", "Ангилал", "Урамшуулал", "Гишүүнчлэл", "Апп татах"] },
        { title: "Байгууллагад", links: ["Tanu Business", "Бүртгүүлэх", "Онцлог боломж", "Үнийн санал", "Demo"] },
        { title: "Дэмжлэг", links: ["Тусламж", "Асуулт хариулт", "Санал хүсэлт", "Холбоо барих", "Хамтын ажиллагаа"] },
      ];

  return (
    <footer className="mt-10 border-t border-border bg-surface/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 py-14 grid gap-10 lg:grid-cols-[1.2fr,2fr,1fr]">
        <div>
          <BrandLogo mode={mode} invert={theme === "dark"} />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            {mode === "business"
              ? "Tanu Business — бизнесээ хялбар, боловсронгуй удирдах нэгдсэн платформ."
              : "Tanu — өдөр тутмын үйлчилгээгээ нэг дороос захиалдаг ухаалаг платформ."}
          </p>
          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> hello@tanu.mn</p>
            <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> +976 7000 0000</p>
            <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Улаанбаатар, Монгол</p>
          </div>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Twitter, Youtube].map((I, i) => (
              <a key={i} href="#" aria-label="social" className="h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-secondary">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-semibold">{c.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {c.links.map((l) => <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-semibold">Апп татах</p>
          <div className="mt-3 flex flex-col gap-2">
            <a href="#" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
              <Apple className="h-4 w-4" /> App Store
            </a>
            <a href="#" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
              <Play className="h-4 w-4" /> Google Play
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-5 flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Tanu. Бүх эрх хуулиар хамгаалагдсан.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Нууцлалын бодлого</a>
            <a href="#" className="hover:text-foreground">Үйлчилгээний нөхцөл</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
