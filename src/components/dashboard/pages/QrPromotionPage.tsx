import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import QRCode from "qrcode";
import {
  Building2,
  CalendarClock,
  Check,
  Copy,
  Download,
  Eye,
  FileDown,
  Files,
  Globe2,
  ImagePlus,
  Link2,
  MapPin,
  Palette,
  Phone,
  Plus,
  Printer,
  QrCode as QrCodeIcon,
  RefreshCw,
  Save,
  ScanLine,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardData } from "@/lib/dashboard/store";
import { cn } from "@/lib/utils";
import { FormRow, PageHeader } from "../ui";

type QrPosition = "center-bottom" | "bottom-right" | "middle-right" | "lower-center";
type ThemeStyle = "modern" | "elegant" | "editorial" | "bold";

interface PromotionForm {
  materialName: string;
  organizationName: string;
  headline: string;
  subtitle: string;
  cta: string;
  phone: string;
  address: string;
  branch: string;
  website: string;
  qrLink: string;
  accentColor: string;
  themeStyle: ThemeStyle;
  qrPosition: QrPosition;
}

interface TemplateConfig {
  id: string;
  name: string;
  label: string;
  description: string;
  defaultAccent: string;
  surface: string;
  ink: string;
  muted: string;
  chip: string;
  visual:
    "minimal" | "premium" | "beauty" | "medical" | "education" | "brochure" | "stand" | "poster";
}

const templates: TemplateConfig[] = [
  {
    id: "minimal-light",
    name: "Minimal light",
    label: "Цэвэр · Минимал",
    description: "Өргөн цагаан зайтай, бүх төрлийн үйлчилгээнд тохиромжтой.",
    defaultAccent: "#175CD3",
    surface: "#F9FBFF",
    ink: "#102A56",
    muted: "#5C6B82",
    chip: "#EAF1FF",
    visual: "minimal",
  },
  {
    id: "premium-dark",
    name: "Premium dark",
    label: "Премиум · Dark",
    description: "Гүн хөх суурь, алтлаг өнгийн тансаг шийдэл.",
    defaultAccent: "#D7B56D",
    surface: "#081A36",
    ink: "#FFFFFF",
    muted: "#B9C5D7",
    chip: "#132A4D",
    visual: "premium",
  },
  {
    id: "beauty-style",
    name: "Beauty style",
    label: "Зөөлөн · Elegant",
    description: "Салон, спа, гоо сайхны бизнест зориулсан зөөлөн төрх.",
    defaultAccent: "#C6607B",
    surface: "#FFF7F8",
    ink: "#4C2531",
    muted: "#896873",
    chip: "#F9E4E9",
    visual: "beauty",
  },
  {
    id: "medical-style",
    name: "Medical style",
    label: "Итгэлтэй · Clinical",
    description: "Эмнэлэг, клиник, зөвлөгөөний төвд зориулсан загвар.",
    defaultAccent: "#168A9C",
    surface: "#F2FBFC",
    ink: "#153D4A",
    muted: "#5F7D84",
    chip: "#DDF4F6",
    visual: "medical",
  },
  {
    id: "education-style",
    name: "Education style",
    label: "Эрч хүчтэй · Smart",
    description: "Сургалтын төв, курс, зөвлөх үйлчилгээний шийдэл.",
    defaultAccent: "#E68A2E",
    surface: "#FFF9EE",
    ink: "#182B49",
    muted: "#667085",
    chip: "#FFF0D7",
    visual: "education",
  },
  {
    id: "brochure-style",
    name: "Brochure style",
    label: "Мэдээлэлтэй · Split",
    description: "Үйлчилгээний мэдээллийг QR-тэй хослуулсан бүтэц.",
    defaultAccent: "#3157A4",
    surface: "#F7F8FC",
    ink: "#17284D",
    muted: "#667085",
    chip: "#E7ECF7",
    visual: "brochure",
  },
  {
    id: "table-stand",
    name: "Table stand style",
    label: "Ширээний · Compact",
    description: "Ресепшн болон үйлчилгээний ширээн дээр байрлуулах загвар.",
    defaultAccent: "#0E7490",
    surface: "#F8FCFD",
    ink: "#123C48",
    muted: "#64777D",
    chip: "#DDF3F6",
    visual: "stand",
  },
  {
    id: "clean-poster",
    name: "Clean poster style",
    label: "Тод · Poster",
    description: "Холоос уншигдах том гарчигтай, орчин үеийн постер.",
    defaultAccent: "#6941C6",
    surface: "#FBFAFF",
    ink: "#26184D",
    muted: "#6F6684",
    chip: "#EEE9FF",
    visual: "poster",
  },
];

const qrPositionLabels: Record<QrPosition, string> = {
  "center-bottom": "Доод төв",
  "bottom-right": "Баруун доод",
  "middle-right": "Баруун дунд",
  "lower-center": "Доод хэсгийн төв",
};

const themeStyleLabels: Record<ThemeStyle, string> = {
  modern: "Modern",
  elegant: "Elegant",
  editorial: "Editorial",
  bold: "Bold",
};

function initialForm(organizationName: string, phone: string, address: string): PromotionForm {
  return {
    materialName: "Цаг захиалгын A5 постер",
    organizationName,
    headline: "Таны гоо үзэсгэлэн, бидний ур чадвар",
    subtitle: "Өөрт тохирох үйлчилгээгээ сонгоод хүссэн цагаа хэдхэн секундэд захиалаарай.",
    cta: "QR уншуулж цаг захиалаарай",
    phone,
    address,
    branch: "",
    website: "aurabeauty.mn",
    qrLink: "https://tanu.mn/book/aura-beauty",
    accentColor: "#175CD3",
    themeStyle: "modern",
    qrPosition: "center-bottom",
  };
}

export function QrPromotionPage() {
  const { orgProfile, branches, selectedBranchId } = useDashboardData();
  const defaultBranch = branches.find((branch) => branch.id === selectedBranchId) ?? branches[0];
  const baseForm = useMemo(
    () => initialForm(orgProfile.name, orgProfile.phone, orgProfile.address),
    [orgProfile.address, orgProfile.name, orgProfile.phone],
  );
  const [form, setForm] = useState<PromotionForm>(() => ({
    ...baseForm,
    branch: defaultBranch?.name ?? "Үндсэн салбар",
  }));
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const [logoData, setLogoData] = useState("");
  const [logoName, setLogoName] = useState("");
  const [coverData, setCoverData] = useState("");
  const [coverName, setCoverName] = useState("");
  const [qrPng, setQrPng] = useState("");
  const [qrSvg, setQrSvg] = useState("");
  const [qrVersion, setQrVersion] = useState(1);
  const [lastUpdated, setLastUpdated] = useState("2026.08.03 14:32");
  const [scanCount, setScanCount] = useState(1284);
  const [savedAt, setSavedAt] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0];
  const qrPayload = `${form.qrLink}${form.qrLink.includes("?") ? "&" : "?"}qr=${qrVersion}`;

  useEffect(() => {
    let active = true;
    void Promise.all([
      QRCode.toDataURL(qrPayload, {
        width: 720,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#071B3D", light: "#FFFFFF" },
      }),
      QRCode.toString(qrPayload, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#071B3D", light: "#FFFFFF" },
      }),
    ]).then(([png, svg]) => {
      if (!active) return;
      setQrPng(png);
      setQrSvg(svg);
    });
    return () => {
      active = false;
    };
  }, [qrPayload]);

  const updateField = <K extends keyof PromotionForm>(key: K, value: PromotionForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    if (!dataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = filename;
    anchor.click();
    toast.success(`${filename} татагдлаа`);
  };

  const downloadSvg = () => {
    if (!qrSvg) return;
    const url = URL.createObjectURL(new Blob([qrSvg], { type: "image/svg+xml" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tanu-booking-qr.svg";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("QR код SVG форматаар татагдлаа");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(form.qrLink);
      toast.success("QR холбоос хуулагдлаа");
    } catch {
      toast.error("Холбоос хуулах боломжгүй байна");
    }
  };

  const refreshQr = () => {
    setQrVersion((current) => current + 1);
    setLastUpdated(
      new Intl.DateTimeFormat("mn-MN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    );
    setScanCount(0);
    toast.success("QR код шинэчлэгдлээ", {
      description: "Энэ нь зөвхөн тухайн browser-ийн demo төлөвт хадгалагдана.",
    });
  };

  const loadImage = (
    file: File | undefined,
    setData: (value: string) => void,
    setName: (value: string) => void,
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Зөвхөн зураг сонгоно уу");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setData(String(reader.result ?? ""));
      setName(file.name);
      toast.success(`${file.name} сонгогдлоо`);
    };
    reader.readAsDataURL(file);
  };

  const resetMaterial = () => {
    setForm({ ...baseForm, branch: defaultBranch?.name ?? "Үндсэн салбар" });
    setSelectedTemplateId(templates[0].id);
    setLogoData("");
    setLogoName("");
    setCoverData("");
    setCoverName("");
    setSavedAt("");
    toast.success("Шинэ материалын талбар бэлэн боллоо");
  };

  const selectTemplate = (template: TemplateConfig, showPreview = false) => {
    setSelectedTemplateId(template.id);
    updateField("accentColor", template.defaultAccent);
    toast.success(`${template.name} загвар сонгогдлоо`);
    if (showPreview) {
      requestAnimationFrame(() => previewRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  };

  const mockMaterialDownload = (type: "PNG" | "PDF") => {
    toast.success(`${form.materialName}.${type.toLowerCase()} бэлтгэгдлээ`, {
      description: "Frontend demo — жинхэнэ файл боловсруулах хэсэг холбогдоогүй.",
    });
  };

  const printPreview = () => {
    toast.info("A5 print preview нээгдэж байна");
    window.setTimeout(() => window.print(), 100);
  };

  const duplicateMaterial = () => {
    updateField("materialName", `${form.materialName} — Хуулбар`);
    toast.success("Материалын хуулбар үүслээ");
  };

  const saveDraft = () => {
    const saved = new Intl.DateTimeFormat("mn-MN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    setSavedAt(saved);
    toast.success("Ноорог local state-д хадгалагдлаа");
  };

  return (
    <div className="space-y-6 pb-12">
      <style>{`
        @media print {
          @page { size: A5 portrait; margin: 0; }
          body * { visibility: hidden !important; }
          #qr-promo-print-area, #qr-promo-print-area * { visibility: visible !important; }
          #qr-promo-print-area {
            position: fixed !important;
            inset: 0 auto auto 0 !important;
            width: 148mm !important;
            height: 210mm !important;
            max-width: none !important;
            box-shadow: none !important;
            border: 0 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>

      <PageHeader
        title="QR сурталчилгаа"
        description="Байгууллагынхаа цаг захиалгын QR кодыг ашиглан A5 хэмжээтэй сурталчилгааны материал бэлтгээрэй."
        actions={
          <>
            <Button variant="outline" className="rounded-lg" onClick={resetMaterial}>
              <Plus className="h-4 w-4" /> Шинэ материал үүсгэх
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => downloadDataUrl(qrPng, "tanu-booking-qr.png")}
            >
              <Download className="h-4 w-4" /> QR татах
            </Button>
            <Button className="rounded-lg" onClick={printPreview}>
              <Printer className="h-4 w-4" /> Хэвлэх
            </Button>
          </>
        }
      />

      <section className="rounded-2xl border border-border/80 bg-surface/85 p-4 shadow-sm sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-center">
          <div className="mx-auto rounded-2xl border border-border bg-white p-3 shadow-sm lg:mx-0">
            {qrPng ? (
              <img src={qrPng} alt="Байгууллагын цаг захиалгын QR код" className="h-28 w-28" />
            ) : (
              <div className="grid h-28 w-28 place-items-center text-muted-foreground">
                <QrCodeIcon className="h-9 w-9 animate-pulse" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-bold">{form.organizationName}</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_oklch,var(--success)_28%,transparent)] bg-[color-mix(in_oklch,var(--success)_12%,transparent)] px-2 py-1 text-[10px] font-semibold text-[var(--success)]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> Идэвхтэй
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" /> {form.branch || "Салбар сонгоогүй"}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <InfoValue icon={<Link2 />} label="QR холбоос" value={form.qrLink} />
              <InfoValue icon={<CalendarClock />} label="Сүүлд шинэчилсэн" value={lastUpdated} />
              <InfoValue
                icon={<ScanLine />}
                label="Уншуулсан тоо"
                value={`${scanCount.toLocaleString("mn-MN")} удаа`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:w-[220px] lg:flex-col">
            <Button
              size="sm"
              variant="outline"
              className="justify-start rounded-lg"
              onClick={() => downloadDataUrl(qrPng, "tanu-booking-qr.png")}
            >
              <Download /> PNG татах
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="justify-start rounded-lg"
              onClick={downloadSvg}
            >
              <FileDown /> SVG татах
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="justify-start rounded-lg"
              onClick={copyLink}
            >
              <Copy /> Link хуулах
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="justify-start rounded-lg"
              onClick={refreshQr}
            >
              <RefreshCw /> QR шинэчлэх
            </Button>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(430px,1.08fr)]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-border/80 bg-surface/85 p-5 shadow-sm">
            <SectionHeading
              icon={<Palette />}
              title="Сурталчилгааны агуулга"
              description="Талбаруудыг өөрчлөх бүрд A5 preview шууд шинэчлэгдэнэ."
            />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormRow label="Материалын нэр">
                <Input
                  value={form.materialName}
                  onChange={(event) => updateField("materialName", event.target.value)}
                />
              </FormRow>
              <FormRow label="Байгууллагын нэр">
                <Input
                  value={form.organizationName}
                  onChange={(event) => updateField("organizationName", event.target.value)}
                />
              </FormRow>
              <div className="sm:col-span-2">
                <FormRow label="Гарчиг">
                  <Input
                    value={form.headline}
                    onChange={(event) => updateField("headline", event.target.value)}
                  />
                </FormRow>
              </div>
              <div className="sm:col-span-2">
                <FormRow label="Дэд тайлбар">
                  <Textarea
                    value={form.subtitle}
                    onChange={(event) => updateField("subtitle", event.target.value)}
                    className="min-h-24 resize-none"
                  />
                </FormRow>
              </div>
              <FormRow label="CTA текст">
                <Input
                  value={form.cta}
                  onChange={(event) => updateField("cta", event.target.value)}
                />
              </FormRow>
              <FormRow label="Утас">
                <Input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </FormRow>
              <FormRow label="Хаяг">
                <Input
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
              </FormRow>
              <FormRow label="Салбар">
                <Select value={form.branch} onValueChange={(value) => updateField("branch", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Салбар сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label="Website / social link">
                <Input
                  value={form.website}
                  onChange={(event) => updateField("website", event.target.value)}
                />
              </FormRow>
              <FormRow label="QR холбоос">
                <Input
                  value={form.qrLink}
                  onChange={(event) => updateField("qrLink", event.target.value)}
                />
              </FormRow>
              <FormRow label="Accent color">
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.accentColor}
                    onChange={(event) => updateField("accentColor", event.target.value)}
                    className="w-12 cursor-pointer p-1"
                    aria-label="Accent color сонгох"
                  />
                  <Input
                    value={form.accentColor}
                    onChange={(event) => updateField("accentColor", event.target.value)}
                    className="font-mono uppercase"
                  />
                </div>
              </FormRow>
              <FormRow label="Theme style">
                <Select
                  value={form.themeStyle}
                  onValueChange={(value) => updateField("themeStyle", value as ThemeStyle)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(themeStyleLabels) as ThemeStyle[]).map((style) => (
                      <SelectItem key={style} value={style}>
                        {themeStyleLabels[style]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
              <FormRow label="QR байрлал">
                <Select
                  value={form.qrPosition}
                  onValueChange={(value) => updateField("qrPosition", value as QrPosition)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(qrPositionLabels) as QrPosition[]).map((position) => (
                      <SelectItem key={position} value={position}>
                        {qrPositionLabels[position]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <UploadPlaceholder
                id="promo-logo-upload"
                title="Logo upload"
                description={logoName || "PNG, JPG эсвэл SVG placeholder"}
                icon={<Upload />}
                preview={logoData}
                onChange={(file) => loadImage(file, setLogoData, setLogoName)}
                onClear={() => {
                  setLogoData("");
                  setLogoName("");
                }}
              />
              <UploadPlaceholder
                id="promo-cover-upload"
                title="Cover image upload"
                description={coverName || "A5 visual зураг сонгох placeholder"}
                icon={<ImagePlus />}
                preview={coverData}
                onChange={(file) => loadImage(file, setCoverData, setCoverName)}
                onClear={() => {
                  setCoverData("");
                  setCoverName("");
                }}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border/80 bg-surface/85 p-5 shadow-sm">
            <SectionHeading
              icon={<Sparkles />}
              title="A5 загварууд"
              description="Бизнесийнхээ төрөл, сурталчилгааны орчинд тохирох загварыг сонгоно уу."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  active={template.id === selectedTemplateId}
                  qrPng={qrPng}
                  onSelect={() => selectTemplate(template)}
                  onPreview={() => selectTemplate(template, true)}
                />
              ))}
            </div>
          </section>
        </div>

        <section ref={previewRef} className="min-w-0 xl:sticky xl:top-0">
          <div className="rounded-2xl border border-border/80 bg-surface/85 p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">A5 live preview</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  148 × 210 мм · Portrait · {selectedTemplate.name}
                </p>
              </div>
              <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-[var(--brand)]">
                {qrPositionLabels[form.qrPosition]}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface-muted/45 p-3 sm:p-6">
              <A5Preview
                template={selectedTemplate}
                form={form}
                logoData={logoData}
                coverData={coverData}
                qrPng={qrPng}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Button className="rounded-lg" onClick={() => mockMaterialDownload("PNG")}>
                <Download /> PNG татах
              </Button>
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => mockMaterialDownload("PDF")}
              >
                <FileDown /> PDF татах
              </Button>
              <Button variant="outline" className="rounded-lg" onClick={printPreview}>
                <Printer /> Print preview
              </Button>
              <Button variant="outline" className="rounded-lg" onClick={duplicateMaterial}>
                <Files /> Duplicate
              </Button>
              <Button variant="outline" className="rounded-lg" onClick={saveDraft}>
                <Save /> Save draft
              </Button>
              <div className="flex min-h-9 items-center justify-center rounded-lg border border-dashed border-border px-3 text-center text-[10px] text-muted-foreground">
                {savedAt ? `Ноорог ${savedAt}-д хадгалагдсан` : "Хадгалаагүй өөрчлөлт"}
              </div>
            </div>
            <p className="mt-3 text-[10px] leading-4 text-muted-foreground">
              PNG болон PDF материалын экспорт demo горимтой. QR таталт болон browser print preview
              frontend дээр ажиллана.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-[var(--brand)] [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function InfoValue({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-muted/45 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon} {label}
      </div>
      <p className="mt-1 truncate text-xs font-semibold" title={value}>
        {value}
      </p>
    </div>
  );
}

function UploadPlaceholder({
  id,
  title,
  description,
  icon,
  preview,
  onChange,
  onClear,
}: {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  preview: string;
  onChange: (file?: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative flex min-h-28 items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted/30 p-3">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface text-muted-foreground [&_svg]:h-5 [&_svg]:w-5">
        {preview ? (
          <img src={preview} alt="Upload preview" className="h-full w-full object-cover" />
        ) : (
          icon
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold">{title}</p>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center gap-2">
          <label
            htmlFor={id}
            className="cursor-pointer text-[11px] font-semibold text-[var(--brand)] hover:underline"
          >
            Зураг сонгох
          </label>
          {preview && (
            <button
              type="button"
              className="text-[11px] text-destructive hover:underline"
              onClick={onClear}
            >
              Арилгах
            </button>
          )}
        </div>
      </div>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0])}
      />
    </div>
  );
}

function TemplateCard({
  template,
  active,
  qrPng,
  onSelect,
  onPreview,
}: {
  template: TemplateConfig;
  active: boolean;
  qrPng: string;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-surface transition",
        active
          ? "border-[var(--brand)] shadow-[0_0_0_2px_color-mix(in_oklch,var(--brand)_12%,transparent)]"
          : "border-border/80 hover:-translate-y-0.5 hover:border-[var(--brand)]/35 hover:shadow-sm",
      )}
    >
      <div
        className="relative h-40 overflow-hidden p-4"
        style={{ backgroundColor: template.surface, color: template.ink }}
      >
        <TemplateDecoration visual={template.visual} accent={template.defaultAccent} />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div
              className="h-5 w-16 rounded-full opacity-90"
              style={{ backgroundColor: template.defaultAccent }}
            />
            {active && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#102A56] shadow">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <div
            className="mt-4 h-2.5 w-3/5 rounded-full"
            style={{ backgroundColor: template.ink, opacity: 0.9 }}
          />
          <div
            className="mt-2 h-1.5 w-4/5 rounded-full"
            style={{ backgroundColor: template.muted, opacity: 0.6 }}
          />
          <div className="mt-auto flex items-end justify-between">
            <div className="space-y-1.5">
              <div
                className="h-1.5 w-20 rounded-full"
                style={{ backgroundColor: template.muted, opacity: 0.5 }}
              />
              <div
                className="h-1.5 w-14 rounded-full"
                style={{ backgroundColor: template.muted, opacity: 0.35 }}
              />
            </div>
            <div className="rounded-md bg-white p-1 shadow-sm">
              {qrPng ? (
                <img src={qrPng} alt="" className="h-11 w-11" />
              ) : (
                <QrCodeIcon className="h-11 w-11 text-[#071B3D]" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-xs font-bold">{template.name}</h3>
            <p className="mt-0.5 text-[10px] font-medium text-[var(--brand)]">{template.label}</p>
          </div>
          {active && (
            <span className="rounded-full bg-brand-soft px-2 py-1 text-[9px] font-bold text-[var(--brand)]">
              Сонгосон
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 min-h-8 text-[10px] leading-4 text-muted-foreground">
          {template.description}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant={active ? "secondary" : "default"}
            className="rounded-lg"
            onClick={onSelect}
          >
            {active ? <Check /> : <Sparkles />} {active ? "Сонгосон" : "Сонгох"}
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg" onClick={onPreview}>
            <Eye /> Preview
          </Button>
        </div>
      </div>
    </article>
  );
}

function TemplateDecoration({
  visual,
  accent,
}: {
  visual: TemplateConfig["visual"];
  accent: string;
}) {
  if (visual === "medical")
    return (
      <div
        className="absolute -right-3 top-4 text-7xl font-light opacity-15"
        style={{ color: accent }}
      >
        +
      </div>
    );
  if (visual === "beauty")
    return (
      <>
        <div
          className="absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-20"
          style={{ backgroundColor: accent }}
        />
        <div
          className="absolute -bottom-12 left-8 h-24 w-24 rounded-full border opacity-20"
          style={{ borderColor: accent }}
        />
      </>
    );
  if (visual === "premium")
    return (
      <>
        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />
        <div
          className="absolute -bottom-16 -right-12 h-40 w-40 rotate-12 rounded-[40%] border opacity-20"
          style={{ borderColor: accent }}
        />
      </>
    );
  if (visual === "education")
    return (
      <div
        className="absolute -right-5 bottom-0 h-24 w-24 rotate-12 rounded-3xl opacity-15"
        style={{ backgroundColor: accent }}
      />
    );
  if (visual === "brochure")
    return (
      <div
        className="absolute inset-y-0 left-0 w-[30%] opacity-12"
        style={{ backgroundColor: accent }}
      />
    );
  if (visual === "stand")
    return (
      <div
        className="absolute inset-x-0 top-0 h-[38%] opacity-12"
        style={{ backgroundColor: accent }}
      />
    );
  if (visual === "poster")
    return (
      <div className="absolute right-0 top-0 h-full w-2" style={{ backgroundColor: accent }} />
    );
  return (
    <div
      className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10"
      style={{ backgroundColor: accent }}
    />
  );
}

function A5Preview({
  template,
  form,
  logoData,
  coverData,
  qrPng,
}: {
  template: TemplateConfig;
  form: PromotionForm;
  logoData: string;
  coverData: string;
  qrPng: string;
}) {
  const qrPositionClass: Record<QrPosition, string> = {
    "center-bottom": "bottom-[7%] left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-[7%] right-[7%]",
    "middle-right": "right-[7%] top-[50%] -translate-y-1/2",
    "lower-center": "bottom-[16%] left-1/2 -translate-x-1/2",
  };
  const themeClass: Record<ThemeStyle, string> = {
    modern: "tracking-tight",
    elegant: "font-medium tracking-wide",
    editorial: "uppercase tracking-[0.08em]",
    bold: "uppercase font-black tracking-tight",
  };
  const accent = form.accentColor || template.defaultAccent;
  const previewStyle = {
    backgroundColor: template.surface,
    color: template.ink,
    "--promo-accent": accent,
    "--promo-muted": template.muted,
    "--promo-chip": template.chip,
  } as CSSProperties;

  return (
    <div
      id="qr-promo-print-area"
      className="relative mx-auto aspect-[148/210] w-full max-w-[500px] overflow-hidden bg-white shadow-[0_24px_70px_-35px_rgba(8,24,55,0.55)] ring-1 ring-black/5"
      style={previewStyle}
    >
      <TemplateDecoration visual={template.visual} accent={accent} />
      <div className="absolute inset-x-[7%] top-[5.5%] z-10 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-[clamp(28px,7vw,46px)] w-[clamp(28px,7vw,46px)] shrink-0 place-items-center overflow-hidden rounded-[28%] bg-white shadow-sm ring-1 ring-black/5">
            {logoData ? (
              <img
                src={logoData}
                alt="Байгууллагын лого"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-[clamp(11px,2vw,18px)] font-black" style={{ color: accent }}>
                {form.organizationName.charAt(0) || "T"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[clamp(8px,1.6vw,13px)] font-extrabold">
              {form.organizationName || "Байгууллагын нэр"}
            </p>
            <p className="truncate text-[clamp(6px,1.1vw,9px)]" style={{ color: template.muted }}>
              {form.branch || "Үндсэн салбар"}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[clamp(6px,1.1vw,9px)] font-bold"
          style={{ backgroundColor: template.chip, color: accent }}
        >
          TANU BOOKING
        </span>
      </div>

      <div
        className={cn(
          "absolute inset-x-[7%] top-[17%] z-10",
          form.qrPosition === "middle-right" ? "max-w-[55%]" : "max-w-[86%]",
        )}
      >
        <div className="mb-[3%] h-1 w-[18%] rounded-full" style={{ backgroundColor: accent }} />
        <h2
          className={cn(
            "text-[clamp(20px,5.2vw,42px)] font-extrabold leading-[1.03]",
            themeClass[form.themeStyle],
          )}
        >
          {form.headline || "Таны гарчиг"}
        </h2>
        <p
          className="mt-[4%] max-w-[88%] text-[clamp(7px,1.5vw,12px)] leading-[1.55]"
          style={{ color: template.muted }}
        >
          {form.subtitle || "Материалын товч тайлбар энд харагдана."}
        </p>
      </div>

      <div
        className={cn(
          "absolute z-[5] overflow-hidden rounded-[clamp(12px,3vw,24px)]",
          form.qrPosition === "middle-right"
            ? "bottom-[20%] left-[7%] top-[49%] w-[48%]"
            : "inset-x-[7%] bottom-[25%] top-[49%]",
        )}
        style={{ backgroundColor: template.chip }}
      >
        {coverData ? (
          <img
            src={coverData}
            alt="Сурталчилгааны нүүр зураг"
            className="h-full w-full object-cover"
          />
        ) : (
          <SupportingVisual visual={template.visual} accent={accent} />
        )}
      </div>

      <div
        className={cn(
          "absolute z-20 w-[28%] min-w-[88px] text-center",
          qrPositionClass[form.qrPosition],
        )}
      >
        <div className="rounded-[12%] bg-white p-[7%] shadow-[0_10px_30px_-12px_rgba(7,27,61,0.45)] ring-1 ring-black/5">
          {qrPng ? (
            <img src={qrPng} alt="Цаг захиалгын QR код" className="aspect-square w-full" />
          ) : (
            <div className="grid aspect-square place-items-center text-[#071B3D]">
              <QrCodeIcon className="h-12 w-12" />
            </div>
          )}
        </div>
        <p
          className="mt-[5%] text-[clamp(6px,1.2vw,10px)] font-extrabold leading-tight"
          style={{
            color:
              form.qrPosition === "middle-right" && template.visual === "premium"
                ? "white"
                : template.ink,
          }}
        >
          {form.cta || "QR уншуулж цаг захиалаарай"}
        </p>
      </div>

      <div
        className="absolute inset-x-[7%] bottom-[3.5%] z-10 flex items-end justify-between gap-3 border-t pt-[2.5%] text-[clamp(5px,1vw,8px)]"
        style={{ borderColor: `${accent}33`, color: template.muted }}
      >
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-1 truncate">
            <Phone className="h-[1.2em] w-[1.2em]" /> {form.phone || "Утас"}
          </p>
          <p className="flex items-center gap-1 truncate">
            <MapPin className="h-[1.2em] w-[1.2em]" /> {form.address || "Хаяг"}
          </p>
        </div>
        <p className="flex shrink-0 items-center gap-1 font-semibold">
          <Globe2 className="h-[1.2em] w-[1.2em]" /> {form.website || "website.mn"}
        </p>
      </div>
    </div>
  );
}

function SupportingVisual({
  visual,
  accent,
}: {
  visual: TemplateConfig["visual"];
  accent: string;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="absolute inset-0 opacity-15"
        style={{ background: `linear-gradient(135deg, ${accent}, transparent 65%)` }}
      />
      <div className="absolute left-[9%] top-[12%] flex h-[76%] w-[43%] flex-col justify-between rounded-[18%] bg-white/70 p-[6%] shadow-sm">
        <div className="h-[12%] w-[38%] rounded-full" style={{ backgroundColor: accent }} />
        <div className="space-y-[8%]">
          <div className="h-1.5 w-full rounded-full bg-black/10" />
          <div className="h-1.5 w-4/5 rounded-full bg-black/10" />
          <div className="h-1.5 w-3/5 rounded-full bg-black/10" />
        </div>
        <div
          className="h-[22%] w-[55%] rounded-full"
          style={{ backgroundColor: accent, opacity: 0.8 }}
        />
      </div>
      <div
        className="absolute -bottom-[20%] right-[7%] h-[100%] w-[42%] rounded-t-full opacity-75"
        style={{ backgroundColor: accent }}
      />
      <div
        className="absolute right-[17%] top-[18%] grid h-[38%] w-[22%] place-items-center rounded-full bg-white/80 text-[clamp(14px,4vw,36px)] font-black shadow-sm"
        style={{ color: accent }}
      >
        {visual === "medical"
          ? "+"
          : visual === "education"
            ? "A+"
            : visual === "beauty"
              ? "✦"
              : "T"}
      </div>
    </div>
  );
}
