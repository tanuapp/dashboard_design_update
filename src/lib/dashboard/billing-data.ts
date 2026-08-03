// Mock pricing/subscription data for the Tanu Business billing page.
// Frontend-only — no real prices are charged anywhere.

export type DurationKey = "1m" | "6m" | "1y";
export type PackageId = "free" | "standard" | "pro" | "enterprise";

export interface DurationOption {
  key: DurationKey;
  label: string;
  months: number;
  discountPct: number;
  badge?: string;
}

export const DURATIONS: DurationOption[] = [
  { key: "1m", label: "1 сар", months: 1, discountPct: 0 },
  { key: "6m", label: "6 сар", months: 6, discountPct: 10, badge: "-10%" },
  { key: "1y", label: "1 жил", months: 12, discountPct: 20, badge: "-20%" },
];

export const DEFAULT_DURATION: DurationKey = "6m";

// Monthly base price per paid package — every other duration is derived
// (months * monthly, then the duration's discount applied), which is exactly
// how the requested mock totals (648,000₮ / 1,152,000₮ etc.) were produced.
const PLAN_MONTHLY_PRICE: Record<"standard" | "pro", number> = {
  standard: 120000,
  pro: 180000,
};

export function planPrice(id: "standard" | "pro", duration: DurationKey) {
  const d = DURATIONS.find((x) => x.key === duration)!;
  const monthly = PLAN_MONTHLY_PRICE[id];
  const base = monthly * d.months;
  const final = Math.round((base * (1 - d.discountPct / 100)) / 1000) * 1000;
  return { base, final, hasDiscount: d.discountPct > 0, discountAmount: base - final };
}

export interface PackageAccent {
  text: string;
  solid: string;
  soft: string;
  border: string;
}

// Free: soft blue · Standard: turquoise/cyan · Pro: orange · Enterprise: deep navy/indigo
export const PACKAGE_ACCENT: Record<PackageId, PackageAccent> = {
  free: {
    text: "#3b82f6",
    solid: "#3b82f6",
    soft: "color-mix(in oklch, #3b82f6 12%, transparent)",
    border: "color-mix(in oklch, #3b82f6 35%, transparent)",
  },
  standard: {
    text: "#0891b2",
    solid: "#06b6d4",
    soft: "color-mix(in oklch, #06b6d4 12%, transparent)",
    border: "color-mix(in oklch, #06b6d4 45%, transparent)",
  },
  pro: {
    text: "#ea580c",
    solid: "#f97316",
    soft: "color-mix(in oklch, #f97316 12%, transparent)",
    border: "color-mix(in oklch, #f97316 35%, transparent)",
  },
  enterprise: {
    text: "#6366f1",
    solid: "#4338ca",
    soft: "color-mix(in oklch, #4338ca 12%, transparent)",
    border: "color-mix(in oklch, #4338ca 35%, transparent)",
  },
};

export interface PackageDef {
  id: PackageId;
  name: string;
  englishLabel: string;
  tagline: string;
  features: string[];
  limitedNote?: string;
}

export const PACKAGES: PackageDef[] = [
  {
    id: "free",
    name: "FREE багц",
    englishLabel: "FREE",
    tagline: "Дөнгөж эхэлж буй бизнест",
    features: [
      "Борлуулалтын цаг бүртгэл",
      "Хэрэглэгчийн дата үүсгэх",
      "Тайлан харах",
      "24 цагийн AI туслах",
    ],
    limitedNote: "Сард 50 захиалга хүртэл — хязгаарлагдмал ашиглалт",
  },
  {
    id: "standard",
    name: "Standard багц",
    englishLabel: "STANDARD",
    tagline: "Тогтмол ажилладаг багт зориулсан",
    features: [
      "Борлуулалтын цаг бүртгэл",
      "Real-time захиалга хүлээн авах",
      "Хэрэглэгчийн дата үүсгэх",
      "Нэгдсэн удирдлага",
      "Урьдчилгаа төлбөр хүлээн авах",
      "5 хүртэл ажилтан",
      "Тайлан татах",
      "24 цагийн AI туслах",
    ],
  },
  {
    id: "pro",
    name: "Pro багц",
    englishLabel: "PRO",
    tagline: "Олон салбар, ажилтантай бизнест",
    features: [
      "Standard багцын бүх боломж",
      "1–3 салбар",
      "10 хүртэл ажилтан",
      "Ажилтны цаг бүртгэл",
      "Сурталчилгааны баннер",
      "Нарийвчилсан тайлан",
      "Борлуулалтын аналитик",
      "Priority support",
      "24 цагийн AI туслах",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise багц",
    englishLabel: "ENTERPRISE",
    tagline: "Танай байгууллагын хэрэгцээнд тохируулна",
    features: [
      "Борлуулалтын цаг бүртгэл",
      "Real-time захиалга хүлээн авах",
      "Хэрэглэгчийн дата үүсгэх",
      "Нэгдсэн удирдлага",
      "Урьдчилгаа төлбөр хүлээн авах",
      "Хязгааргүй салбар",
      "Хязгааргүй ажилтан",
      "Ажилтны цаг бүртгэл",
      "Нарийвчилсан тайлан, аналитик",
      "Эрх, хандалтын нарийн тохиргоо",
      "API болон ERP холболтын боломж",
      "Custom branding",
      "Өгөгдөл шилжүүлэх тусламж",
      "Тусгай сургалт, нэвтрүүлэлт",
      "Priority support",
      "24 цагийн AI туслах",
    ],
  },
];

// ===== Comparison table =====

export type ComparisonCell = string | boolean;

export interface ComparisonRow {
  label: string;
  values: Record<PackageId, ComparisonCell>;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Real-time захиалга", values: { free: false, standard: true, pro: true, enterprise: true } },
  { label: "Ажилтны тоо", values: { free: "1", standard: "5 хүртэл", pro: "10 хүртэл", enterprise: "Хязгааргүй" } },
  { label: "Салбарын тоо", values: { free: "1", standard: "1", pro: "1–3", enterprise: "Хязгааргүй" } },
  { label: "Урьдчилгаа төлбөр", values: { free: false, standard: true, pro: true, enterprise: true } },
  { label: "Тайлан татах", values: { free: "Зөвхөн харах", standard: true, pro: "Дэлгэрэнгүй", enterprise: "Дэлгэрэнгүй" } },
  { label: "Нарийвчилсан аналитик", values: { free: false, standard: false, pro: true, enterprise: true } },
  { label: "Ажилтны цаг бүртгэл", values: { free: false, standard: false, pro: true, enterprise: true } },
  { label: "Сурталчилгааны баннер", values: { free: false, standard: false, pro: true, enterprise: true } },
  { label: "Эрх, хандалтын тохиргоо", values: { free: "Үндсэн", standard: "Үндсэн", pro: "Дунд зэрэг", enterprise: "Нарийвчилсан" } },
  { label: "API холболт", values: { free: false, standard: false, pro: false, enterprise: true } },
  { label: "Custom branding", values: { free: false, standard: false, pro: false, enterprise: true } },
  { label: "Support level", values: { free: "Стандарт", standard: "Стандарт", pro: "Priority", enterprise: "Priority + 24/7" } },
];

export interface CurrentSubscription {
  packageId: PackageId;
  expiresAt: string;
  nextPaymentAmount: number;
  autoRenew: boolean;
}

export const CURRENT_SUBSCRIPTION: CurrentSubscription = {
  packageId: "standard",
  expiresAt: "2026 оны 8-р сарын 28-ны өдөр 12:25",
  nextPaymentAmount: 648000,
  autoRenew: true,
};

// Standard-only features a downgrade to FREE would lose — shown in the downgrade confirm dialog.
export const STANDARD_ONLY_FEATURES = [
  "Real-time захиалга хүлээн авах",
  "Нэгдсэн удирдлага",
  "Урьдчилгаа төлбөр хүлээн авах",
  "5 хүртэл ажилтан",
  "Тайлан татах",
];
