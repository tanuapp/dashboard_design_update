import { categories as fallbackCategories, services as fallbackServices } from "@/lib/mock-data";

export const APP_STORE_URL = "https://apps.apple.com/us/app/tanu/id6737768604";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.tanusoft.tanubooking&hl=en";
export const APP_QR_SRC = "/brand/qr.svg";

const COMPANY_API_URL = "https://api.tanusoft.mn/api/v1/company";
const PACKAGE_API_URL = "https://api.tanusoft.mn/api/v1/option";
const UPLOAD_BASE_URL = "https://api.tanusoft.mn/uploads";

const categoryIcon: Record<string, string> = {
  "Гоо сайхан": "Sparkles",
  Эмнэлэг: "HeartPulse",
  Тасалбар: "Ticket",
  Сургалт: "GraduationCap",
  Хуульч: "Briefcase",
  Буудал: "Building2",
  "Төрийн алба": "Landmark",
  Бусад: "MoreHorizontal",
};

type ApiCategory = {
  name?: string;
  parent?: string | null;
  sortOrder?: number;
};

type ApiCompany = {
  _id?: string;
  id?: string;
  name?: string;
  logo?: string;
  cover?: string;
  photo?: string;
  address?: string;
  rating?: number;
  views?: number;
  category?: ApiCategory[];
};

type CompanyResponse = {
  success?: boolean;
  data?: ApiCompany[];
};

export type LandingCategory = {
  name: string;
  icon: string;
  count: number;
};

export type LandingService = {
  id: string;
  org: string;
  service: string;
  rating: number;
  reviews: number;
  location: string;
  price: number;
  time: string;
  tag: string;
  category: string;
  hue: number;
  image?: string;
};

type ApiPackage = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  color?: string;
  price?: number;
  description?: string;
  employeeCount?: number;
  homeBanner?: boolean;
  suggestion?: boolean;
  videoBanner?: boolean;
  story?: boolean;
  highlight?: boolean;
  chatbot?: boolean;
};

type PackageResponse = {
  success?: boolean;
  data?: ApiPackage[];
};

export type LandingPackage = {
  id: string;
  name: string;
  title: string;
  color: string;
  price: number;
  description: string;
  employeeCount: number;
  features: string[];
  badge?: string;
};

const packageFallbacks: Record<string, Pick<LandingPackage, "title" | "description" | "color" | "features">> = {
  free: {
    title: "Free багц",
    description: "Эхний хэрэглээнд тохиромжтой үндсэн багц.",
    color: "#00a8e5",
    features: ["Борлуулалтын цаг бүртгэл", "Хэрэглэгчийн дата үүсгэх", "Тайлан харах", "AI туслах"],
  },
  standart: {
    title: "Standard багц",
    description: "Өдөр тутмын захиалга, ажилтны урсгалд зориулсан багц.",
    color: "#15cfc5",
    features: [
      "Real-time захиалга хүлээн авах",
      "Нэгдсэн удирдлага",
      "Урьдчилгаа авах",
      "Ажилтан 5 хүртэл",
      "AI туслах",
    ],
  },
  standard: {
    title: "Standard багц",
    description: "Өдөр тутмын захиалга, ажилтны урсгалд зориулсан багц.",
    color: "#15cfc5",
    features: [
      "Real-time захиалга хүлээн авах",
      "Нэгдсэн удирдлага",
      "Урьдчилгаа авах",
      "Ажилтан 5 хүртэл",
      "AI туслах",
    ],
  },
  pro: {
    title: "Pro багц",
    description: "Салбар, сурталчилгаа, илүү өргөн удирдлагад зориулсан багц.",
    color: "#e5330f",
    features: [
      "Салбарын удирдлага",
      "Сурталчилгаа баннер",
      "Видео баннер",
      "Story байршуулалт",
      "Тайлан татах",
      "AI туслах",
    ],
  },
};

export async function fetchLandingCompanies() {
  const response = await fetch(COMPANY_API_URL);
  if (!response.ok) throw new Error(`Company API failed: ${response.status}`);
  const payload = (await response.json()) as CompanyResponse;
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchLandingPackages() {
  const response = await fetch(PACKAGE_API_URL);
  if (!response.ok) throw new Error(`Package API failed: ${response.status}`);
  const payload = (await response.json()) as PackageResponse;
  return buildLandingPackages(Array.isArray(payload.data) ? payload.data : []);
}

export function buildLandingPackages(packages: ApiPackage[]): LandingPackage[] {
  const normalized = packages.map((item, index) => {
    const name = String(item.name || `package-${index}`).toLowerCase();
    const fallback = packageFallbacks[name] ?? packageFallbacks.standard;
    const featureFlags = [
      item.homeBanner ? "Нүүр хуудасны баннер" : null,
      item.suggestion ? "Санал болгох хэсэг" : null,
      item.videoBanner ? "Видео баннер" : null,
      item.story ? "Story байршуулалт" : null,
      item.highlight ? "Онцлох байрлал" : null,
      item.chatbot ? "AI туслах" : null,
    ].filter(Boolean) as string[];

    return {
      id: item._id ?? item.id ?? `package-${index}`,
      name,
      title: item.title || fallback.title,
      color: item.color || fallback.color,
      price: Number(item.price || 0),
      description: item.description || fallback.description,
      employeeCount: Number(item.employeeCount || 0),
      features: Array.from(new Set([...fallback.features, ...featureFlags])).slice(0, 7),
      badge: name === "pro" ? "Санал болгох" : name === "standart" || name === "standard" ? "Идэвхтэй" : undefined,
    };
  });

  if (normalized.length > 0) {
    return normalized.sort((a, b) => packageOrder(a.name) - packageOrder(b.name));
  }

  return Object.entries(packageFallbacks)
    .filter(([name]) => name !== "standard")
    .map(([name, fallback], index) => ({
      id: `fallback-${name}`,
      name,
      title: fallback.title,
      color: fallback.color,
      price: 0,
      description: fallback.description,
      employeeCount: name === "pro" ? 10 : 5,
      features: fallback.features,
      badge: index === 1 ? "Идэвхтэй" : name === "pro" ? "Санал болгох" : undefined,
    }));
}

export function buildLandingCategories(companies: ApiCompany[]): LandingCategory[] {
  const counts = new Map<string, number>();

  for (const company of companies) {
    const categoryName = getPrimaryCategory(company);
    counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1);
  }

  return fallbackCategories.map((category) => ({
    ...category,
    icon: categoryIcon[category.name] ?? category.icon,
    count: counts.get(category.name) ?? 0,
  }));
}

export function buildLandingServices(companies: ApiCompany[]): LandingService[] {
  if (companies.length === 0) return fallbackServices;

  return companies.map((company, index) => {
    const category = getPrimaryCategory(company);
    return {
      id: company._id ?? company.id ?? `company-${index}`,
      org: company.name?.trim() || "Tanu байгууллага",
      service: `${category} үйлчилгээ`,
      rating: Number(company.rating || 0),
      reviews: Number(company.views || 0),
      location: company.address?.trim() || "Улаанбаатар, Монгол",
      price: 0,
      time: "Өнөөдөр",
      tag: index < 6 ? "featured" : index % 3 === 0 ? "today" : index % 3 === 1 ? "nearby" : "new",
      category,
      hue: 185 + ((index * 23) % 90),
      image: toAssetUrl(company.logo || company.cover || company.photo),
    };
  });
}

function getPrimaryCategory(company: ApiCompany) {
  const categories = Array.isArray(company.category) ? company.category : [];
  return (
    categories.find((category) => !category.parent)?.name ||
    categories[0]?.name ||
    "Бусад"
  );
}

function toAssetUrl(file?: string) {
  if (!file) return undefined;
  if (/^https?:\/\//i.test(file) || file.startsWith("data:")) return file;
  return `${UPLOAD_BASE_URL}/${encodeURIComponent(file)}`;
}

function packageOrder(name: string) {
  if (name === "free") return 0;
  if (name === "standart" || name === "standard") return 1;
  if (name === "pro") return 2;
  return 10;
}
