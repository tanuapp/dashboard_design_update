import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Ban,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  FileDown,
  Loader2,
  Plus,
  QrCode as QrCodeIcon,
  ScanLine,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog, FormRow } from "../ui";
import { useDashboardData } from "@/lib/dashboard/store";
import type { OrganizationType } from "@/lib/organization";
import { settingsOrganizationConfig } from "@/lib/settings/config";
import {
  type SettingsQrFrame as QrFrame,
  type SettingsQrRecord,
  type SettingsQrStatus as QrStatus,
} from "@/lib/settings/qr-data";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "./SettingsShell";

type DownloadSize = "small" | "medium" | "large" | "print";

interface QrFormState {
  name: string;
  type: string;
  destinationUrl: string;
  description: string;
  branchId: string;
  employeeId: string;
  serviceId: string;
  foregroundColor: string;
  backgroundColor: string;
  logoEnabled: boolean;
  frameStyle: QrFrame;
  cta: string;
  expiresAt: string;
}

const downloadSizes: Record<DownloadSize, { label: string; pixels: number }> = {
  small: { label: "Small · 320px", pixels: 320 },
  medium: { label: "Medium · 640px", pixels: 640 },
  large: { label: "Large · 1200px", pixels: 1200 },
  print: { label: "Print quality · 2048px", pixels: 2048 },
};

const frameLabels: Record<QrFrame, string> = {
  none: "Хүрээгүй",
  rounded: "Дугуй хүрээ",
  label: "CTA шошготой",
  scan: "Scan тэмдэглэгээтэй",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyQrForm(organizationType: OrganizationType): QrFormState {
  const firstType = settingsOrganizationConfig[organizationType].qrTypes[0];
  return {
    name: "",
    type: firstType.value,
    destinationUrl: `https://tanu.mn${firstType.defaultPath}`,
    description: "",
    branchId: "none",
    employeeId: "none",
    serviceId: "none",
    foregroundColor: "#071B3D",
    backgroundColor: "#FFFFFF",
    logoEnabled: true,
    frameStyle: "label",
    cta: organizationType === "government" ? "Мэдээлэл авах" : "Цаг захиалах",
    expiresAt: "",
  };
}

function isPublicSafeUrl(value: string) {
  try {
    const url = new URL(value);
    const forbiddenParams = ["token", "access_token", "session", "auth"];
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.pathname.startsWith("/business/dashboard") &&
      !forbiddenParams.some((param) => url.searchParams.has(param))
    );
  } catch {
    return false;
  }
}

export function QrSettingsPage({
  organizationType,
  records,
  onRecordsChange,
  logoSrc = "",
  publicLinks = [],
}: {
  organizationType: OrganizationType;
  records: SettingsQrRecord[];
  onRecordsChange: (records: SettingsQrRecord[]) => void;
  logoSrc?: string;
  publicLinks?: Array<{ label: string; url: string }>;
}) {
  const { orgProfile, branches, employees, services } = useDashboardData();
  const config = settingsOrganizationConfig[organizationType];
  const visibleRecords = records.filter(
    (record) => record.organizationId === config.organizationId,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QrFormState>(() => emptyQrForm(organizationType));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SettingsQrRecord | null>(null);
  const [downloadSize, setDownloadSize] = useState<DownloadSize>("medium");

  const selectedType = config.qrTypes.find((option) => option.value === form.type);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyQrForm(organizationType));
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (record: SettingsQrRecord) => {
    setEditingId(record.id);
    setForm({
      name: record.name,
      type: record.type,
      destinationUrl: record.destinationUrl,
      description: record.description,
      branchId: record.branchId ?? "none",
      employeeId: record.employeeId ?? "none",
      serviceId: record.serviceId ?? "none",
      foregroundColor: record.foregroundColor,
      backgroundColor: record.backgroundColor,
      logoEnabled: record.logoEnabled,
      frameStyle: record.frameStyle,
      cta: record.cta,
      expiresAt: record.expiresAt ?? "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "QR нэр заавал шаардлагатай";
    if (!form.type) next.type = "QR төрөл сонгоно уу";
    if (!form.destinationUrl.trim()) next.destinationUrl = "Destination холбоос шаардлагатай";
    else if (!isPublicSafeUrl(form.destinationUrl))
      next.destinationUrl =
        "Public http/https холбоос оруулна уу. Admin route эсвэл token ашиглахгүй.";
    if (form.expiresAt && form.expiresAt < todayIso())
      next.expiresAt = "Дуусах хугацаа өнөөдрөөс хойш байна";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveQr = async () => {
    if (!validate()) {
      toast.error("QR мэдээллийг шалгана уу");
      return;
    }
    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    const now = todayIso();
    if (editingId) {
      onRecordsChange(
        records.map((record) =>
          record.id === editingId && record.organizationId === config.organizationId
            ? {
                ...record,
                ...form,
                branchId: form.branchId === "none" ? undefined : form.branchId,
                employeeId: form.employeeId === "none" ? undefined : form.employeeId,
                serviceId: form.serviceId === "none" ? undefined : form.serviceId,
                expiresAt: form.expiresAt || undefined,
                updatedAt: now,
              }
            : record,
        ),
      );
      toast.success("QR код шинэчлэгдлээ");
    } else {
      const next: SettingsQrRecord = {
        id: `qr-${Date.now()}`,
        organizationId: config.organizationId,
        name: form.name.trim(),
        type: form.type,
        destinationUrl: form.destinationUrl.trim(),
        description: form.description.trim(),
        branchId: form.branchId === "none" ? undefined : form.branchId,
        employeeId: form.employeeId === "none" ? undefined : form.employeeId,
        serviceId: form.serviceId === "none" ? undefined : form.serviceId,
        foregroundColor: form.foregroundColor,
        backgroundColor: form.backgroundColor,
        logoEnabled: form.logoEnabled,
        frameStyle: form.frameStyle,
        cta: form.cta,
        expiresAt: form.expiresAt || undefined,
        status: "active",
        scanCount: 0,
        createdBy: "current-user",
        createdAt: now,
        updatedAt: now,
      };
      onRecordsChange([next, ...records]);
      toast.success("Шинэ QR код үүслээ");
    }
    setSaving(false);
    setModalOpen(false);
  };

  const toggleStatus = (record: SettingsQrRecord) => {
    const nextStatus: QrStatus = record.status === "active" ? "inactive" : "active";
    onRecordsChange(
      records.map((item) =>
        item.id === record.id && item.organizationId === config.organizationId
          ? { ...item, status: nextStatus, updatedAt: todayIso() }
          : item,
      ),
    );
    toast.success(nextStatus === "active" ? "QR идэвхжлээ" : "QR идэвхгүй боллоо");
  };

  const deleteQr = () => {
    if (!deleteTarget || deleteTarget.organizationId !== config.organizationId) return;
    onRecordsChange(records.filter((record) => record.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("QR код устгагдлаа");
  };

  const typeLabel = (type: string) =>
    config.qrTypes.find((option) => option.value === type)?.label ?? type;

  return (
    <div className="space-y-6">
      <SettingsHeader
        eyebrow="Сурталчилгаа ба холбоос"
        title="QR код"
        description={`${config.terms.organization}-ын public-safe холбоосуудын QR кодыг үүсгэж, удирдана.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={downloadSize}
              onValueChange={(value) => setDownloadSize(value as DownloadSize)}
            >
              <SelectTrigger className="h-9 w-[190px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(downloadSizes) as DownloadSize[]).map((size) => (
                  <SelectItem key={size} value={size}>
                    {downloadSizes[size].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="rounded-lg" onClick={openCreate}>
              <Plus /> Шинэ QR үүсгэх
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 2xl:grid-cols-2">
        {visibleRecords.map((record) => (
          <QrRecordCard
            key={record.id}
            record={record}
            typeLabel={typeLabel(record.type)}
            organizationName={orgProfile.name}
            logoSrc={logoSrc}
            branchName={branches.find((branch) => branch.id === record.branchId)?.name}
            downloadPixels={downloadSizes[downloadSize].pixels}
            onEdit={() => openEdit(record)}
            onToggle={() => toggleStatus(record)}
            onDelete={() => setDeleteTarget(record)}
          />
        ))}
      </div>

      {visibleRecords.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
          <QrCodeIcon className="mx-auto h-9 w-9 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">QR код алга байна</p>
          <p className="mt-1 text-xs text-muted-foreground">Эхний public QR кодоо үүсгэнэ үү.</p>
          <Button size="sm" className="mt-4" onClick={openCreate}>
            <Plus /> QR үүсгэх
          </Button>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "QR код засах" : "Шинэ QR үүсгэх"}</DialogTitle>
            <DialogDescription>
              QR нь зөвхөн {orgProfile.name}-д харьяалагдаж, public-safe destination ашиглана.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <FormRow label="QR нэр" hint={errors.name}>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className={errors.name ? "border-destructive" : ""}
                placeholder="Жишээ: Үндсэн цаг захиалгын QR"
              />
            </FormRow>
            <FormRow label="QR төрөл" hint={errors.type}>
              <Select
                value={form.type}
                onValueChange={(value) => {
                  const option = config.qrTypes.find((item) => item.value === value);
                  setForm((current) => ({
                    ...current,
                    type: value,
                    destinationUrl: option?.defaultPath
                      ? `https://tanu.mn${option.defaultPath}`
                      : current.destinationUrl,
                  }));
                }}
              >
                <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.qrTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Байгууллага">
              <Input value={orgProfile.name} disabled />
            </FormRow>
            {selectedType?.relation === "branch" && (
              <FormRow label={`${config.terms.branch} · сонголттой`}>
                <Select
                  value={form.branchId}
                  onValueChange={(value) => setForm((current) => ({ ...current, branchId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Сонгоогүй</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
            )}
            {selectedType?.relation === "employee" && (
              <FormRow label={`${config.terms.employee} · сонголттой`}>
                <Select
                  value={form.employeeId}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, employeeId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Сонгоогүй</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
            )}
            {selectedType?.relation === "service" && (
              <FormRow label={`${config.terms.service} · сонголттой`}>
                <Select
                  value={form.serviceId}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, serviceId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Сонгоогүй</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
            )}
            <div className="sm:col-span-2">
              <FormRow label="Destination URL" hint={errors.destinationUrl}>
                <div className="space-y-2">
                  <Input
                    type="url"
                    value={form.destinationUrl}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, destinationUrl: event.target.value }))
                    }
                    className={errors.destinationUrl ? "border-destructive" : ""}
                    placeholder="https://..."
                  />
                  {publicLinks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {publicLinks.map((link) => (
                        <button
                          key={link.label}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({ ...current, destinationUrl: link.url }))
                          }
                          className="rounded-md bg-brand-soft px-2 py-1 text-[10px] font-semibold text-[var(--brand)] hover:brightness-95"
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </FormRow>
            </div>
            <div className="sm:col-span-2">
              <FormRow label="Тайлбар · сонголттой">
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="min-h-20 resize-none"
                />
              </FormRow>
            </div>
            <FormRow label="QR өнгө">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.foregroundColor}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, foregroundColor: event.target.value }))
                  }
                  className="w-12 cursor-pointer p-1"
                />
                <Input value={form.foregroundColor} readOnly className="font-mono uppercase" />
              </div>
            </FormRow>
            <FormRow label="Background өнгө">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.backgroundColor}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, backgroundColor: event.target.value }))
                  }
                  className="w-12 cursor-pointer p-1"
                />
                <Input value={form.backgroundColor} readOnly className="font-mono uppercase" />
              </div>
            </FormRow>
            <FormRow label="Frame style">
              <Select
                value={form.frameStyle}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, frameStyle: value as QrFrame }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(frameLabels) as QrFrame[]).map((frame) => (
                    <SelectItem key={frame} value={frame}>
                      {frameLabels[frame]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
            <FormRow label="Call-to-action текст">
              <Input
                value={form.cta}
                onChange={(event) =>
                  setForm((current) => ({ ...current, cta: event.target.value }))
                }
                placeholder="Цаг захиалах"
              />
            </FormRow>
            <FormRow label="Дуусах хугацаа · сонголттой" hint={errors.expiresAt}>
              <Input
                type="date"
                min={todayIso()}
                value={form.expiresAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expiresAt: event.target.value }))
                }
                className={errors.expiresAt ? "border-destructive" : ""}
              />
            </FormRow>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <div>
                <p className="text-xs font-semibold">QR-ийн голд лого оруулах</p>
                <p className="text-[10px] text-muted-foreground">
                  Байгууллагын лого эсвэл нэрийн эхний үсгийг харуулна
                </p>
              </div>
              <Switch
                checked={form.logoEnabled}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, logoEnabled: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Болих
            </Button>
            <Button disabled={saving} onClick={saveQr}>
              {saving && <Loader2 className="animate-spin" />}
              {editingId ? "Өөрчлөлт хадгалах" : "QR үүсгэх"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="QR код устгах уу?"
        description={`“${deleteTarget?.name ?? ""}” QR кодыг устгасны дараа сэргээх боломжгүй.`}
        confirmLabel="Устгах"
        destructive
        onConfirm={deleteQr}
      />
    </div>
  );
}

function QrRecordCard({
  record,
  typeLabel,
  organizationName,
  logoSrc,
  branchName,
  downloadPixels,
  onEdit,
  onToggle,
  onDelete,
}: {
  record: SettingsQrRecord;
  typeLabel: string;
  organizationName: string;
  logoSrc: string;
  branchName?: string;
  downloadPixels: number;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [preview, setPreview] = useState("");
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    let active = true;
    setGenerating(true);
    void createQrPng(record, 420, logoSrc, organizationName).then((dataUrl) => {
      if (!active) return;
      setPreview(dataUrl);
      setGenerating(false);
    });
    return () => {
      active = false;
    };
  }, [logoSrc, organizationName, record]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(record.destinationUrl);
      toast.success("Холбоос хуулагдлаа");
    } catch {
      toast.error("Холбоос хуулах боломжгүй байна");
    }
  };

  const downloadPng = async () => {
    const dataUrl = await createQrPng(record, downloadPixels, logoSrc, organizationName);
    downloadUrl(dataUrl, `${safeFilename(record.name)}.png`);
    toast.success(`PNG · ${downloadPixels}px татагдлаа`);
  };

  const downloadSvg = async () => {
    const svg = await createQrSvg(record, downloadPixels, logoSrc, organizationName);
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    downloadUrl(url, `${safeFilename(record.name)}.svg`);
    URL.revokeObjectURL(url);
    toast.success("SVG татагдлаа");
  };

  return (
    <article className="rounded-2xl border border-border/80 bg-surface/85 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div
          className={cn(
            "mx-auto flex w-36 shrink-0 flex-col items-center rounded-2xl border bg-white p-3 shadow-sm sm:mx-0",
            record.status === "inactive" && "grayscale opacity-60",
          )}
        >
          {generating ? (
            <div className="grid aspect-square w-full place-items-center text-[#071B3D]">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          ) : (
            <img src={preview} alt={`${record.name} QR код`} className="aspect-square w-full" />
          )}
          {record.frameStyle !== "none" && (
            <p className="mt-1.5 text-center text-[9px] font-extrabold text-[#071B3D]">
              {record.cta}
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold">{record.name}</h2>
              <p className="mt-0.5 text-[10px] font-semibold text-[var(--brand-2)]">{typeLabel}</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold",
                record.status === "active"
                  ? "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {record.status === "active" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Ban className="h-3 w-3" />
              )}
              {record.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
            </span>
          </div>

          <p className="mt-3 break-all rounded-lg bg-surface-muted/40 px-2.5 py-2 text-[10px] text-muted-foreground">
            {record.destinationUrl}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-3">
            <Meta label="Байгууллага" value={organizationName} />
            <Meta label="Салбар" value={branchName ?? "Бүх байгууллага"} />
            <Meta label="Үүсгэсэн" value={record.createdAt} />
            <Meta label="Уншуулалт" value={`${record.scanCount.toLocaleString("mn-MN")} удаа`} />
            <Meta label="Шинэчилсэн" value={record.updatedAt} />
            <Meta label="Дуусах" value={record.expiresAt ?? "Хугацаагүй"} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-4">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <Edit3 /> Засах
        </Button>
        <Button size="sm" variant="outline" onClick={downloadPng}>
          <Download /> PNG
        </Button>
        <Button size="sm" variant="outline" onClick={downloadSvg}>
          <FileDown /> SVG
        </Button>
        <Button size="sm" variant="outline" onClick={copy}>
          <Copy /> Link
        </Button>
        <Button size="sm" variant="outline" onClick={onToggle}>
          {record.status === "active" ? <Ban /> : <CheckCircle2 />}
          {record.status === "active" ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 /> Устгах
        </Button>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-surface-muted/30 p-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate font-semibold" title={value}>
        {value}
      </p>
    </div>
  );
}

function safeFilename(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яөүё]+/gi, "-")
      .replace(/^-|-$/g, "") || "tanu-qr"
  );
}

function downloadUrl(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
}

async function createQrPng(
  record: SettingsQrRecord,
  pixels: number,
  logoSrc = "",
  organizationName = "Tanu",
) {
  const raw = await QRCode.toDataURL(record.destinationUrl, {
    width: pixels,
    margin: 4,
    errorCorrectionLevel: "H",
    color: { dark: record.foregroundColor, light: record.backgroundColor },
  });
  if (!record.logoEnabled || typeof document === "undefined") return raw;

  const image = await loadImage(raw);
  const canvas = document.createElement("canvas");
  canvas.width = pixels;
  canvas.height = pixels;
  const context = canvas.getContext("2d");
  if (!context) return raw;
  context.drawImage(image, 0, 0, pixels, pixels);
  const logoSize = Math.round(pixels * 0.18);
  const start = Math.round((pixels - logoSize) / 2);
  const padding = Math.max(4, Math.round(pixels * 0.012));
  context.fillStyle = "#FFFFFF";
  context.beginPath();
  context.roundRect(
    start - padding,
    start - padding,
    logoSize + padding * 2,
    logoSize + padding * 2,
    logoSize * 0.24,
  );
  context.fill();

  if (logoSrc) {
    try {
      const logo = await loadImage(logoSrc);
      context.save();
      context.beginPath();
      context.roundRect(start, start, logoSize, logoSize, logoSize * 0.2);
      context.clip();
      context.fillStyle = "#FFFFFF";
      context.fillRect(start, start, logoSize, logoSize);
      const scale = Math.min(logoSize / logo.naturalWidth, logoSize / logo.naturalHeight);
      const width = logo.naturalWidth * scale;
      const height = logo.naturalHeight * scale;
      context.drawImage(
        logo,
        start + (logoSize - width) / 2,
        start + (logoSize - height) / 2,
        width,
        height,
      );
      context.restore();
    } catch {
      drawLogoFallback(context, pixels, start, logoSize, organizationName);
    }
  } else {
    drawLogoFallback(context, pixels, start, logoSize, organizationName);
  }
  return canvas.toDataURL("image/png");
}

async function createQrSvg(
  record: SettingsQrRecord,
  pixels: number,
  logoSrc = "",
  organizationName = "Tanu",
) {
  const svg = await QRCode.toString(record.destinationUrl, {
    type: "svg",
    width: pixels,
    margin: 4,
    errorCorrectionLevel: "H",
    color: { dark: record.foregroundColor, light: record.backgroundColor },
  });
  if (!record.logoEnabled) return svg;
  const centerContent = logoSrc
    ? `<image x="42%" y="42%" width="16%" height="16%" href="${escapeXml(logoSrc)}" preserveAspectRatio="xMidYMid meet"/>`
    : `<rect x="42%" y="42%" width="16%" height="16%" rx="3%" fill="#071B3D"/><text x="50%" y="51%" fill="#fff" font-family="Manrope, sans-serif" font-size="9%" font-weight="800" text-anchor="middle" dominant-baseline="middle">${escapeXml(logoInitial(organizationName))}</text>`;
  return svg.replace(
    "</svg>",
    `<rect x="40.8%" y="40.8%" width="18.4%" height="18.4%" rx="3%" fill="#fff"/>${centerContent}</svg>`,
  );
}

function drawLogoFallback(
  context: CanvasRenderingContext2D,
  pixels: number,
  start: number,
  logoSize: number,
  organizationName: string,
) {
  context.fillStyle = "#071B3D";
  context.beginPath();
  context.roundRect(start, start, logoSize, logoSize, logoSize * 0.2);
  context.fill();
  context.fillStyle = "#FFFFFF";
  context.font = `800 ${Math.round(logoSize * 0.52)}px Manrope, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(logoInitial(organizationName), pixels / 2, pixels / 2 + 1);
}

function logoInitial(organizationName: string) {
  return Array.from(organizationName.trim())[0]?.toUpperCase() ?? "T";
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}
