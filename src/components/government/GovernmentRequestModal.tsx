import { useMemo, useState } from "react";
import { FileText, Loader2, Paperclip, Save, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useGovernmentData } from "@/lib/government/store";
import type { GovernmentRequestStatus } from "@/lib/government/types";
import { cn } from "@/lib/utils";

const requestTypeOptions: Record<string, string[]> = {
  "Дотоод хүсэлт": ["Техникийн дэмжлэг", "Хангамж", "Засвар үйлчилгээ", "Бусад"],
  "Хүний нөөц": ["Чөлөө", "Томилолт", "Сургалт", "Ажлын нөхцөл"],
  "Албан бичгийн хүсэлт": ["Төсөл боловсруулах", "Хянах", "Батлуулах", "Хуулбар авах"],
  "Иргэдийн үйлчилгээ": ["Өргөдөл", "Гомдол", "Санал", "Мэдээлэл хүсэх"],
};

type SubmitStatus = Extract<GovernmentRequestStatus, "draft" | "submitted">;

const initialForm = {
  type: "Дотоод хүсэлт",
  subtype: "Техникийн дэмжлэг",
  title: "",
  departmentId: "",
  responsibleEmployeeId: "",
  priority: "normal" as const,
  dueDate: "",
  description: "",
  relatedDocumentId: "none",
  reviewingManagerId: "",
};

export function GovernmentRequestModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { session } = useAuth();
  const { departments, employees, documents, createRequest } = useGovernmentData();
  const [form, setForm] = useState(initialForm);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<SubmitStatus | null>(null);

  const subtypes = requestTypeOptions[form.type] ?? [];
  const departmentEmployees = useMemo(
    () =>
      form.departmentId
        ? employees.filter((employee) => employee.departmentId === form.departmentId)
        : employees,
    [employees, form.departmentId],
  );

  const update = <Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const submit = async (status: SubmitStatus) => {
    const nextErrors: Record<string, string> = {};
    if (!form.type) nextErrors.type = "Хүсэлтийн төрлийг сонгоно уу";
    if (!form.title.trim()) nextErrors.title = "Хүсэлтийн гарчиг оруулна уу";
    if (!form.departmentId) nextErrors.departmentId = "Хариуцах нэгжийг сонгоно уу";

    if (status === "submitted") {
      if (!form.subtype) nextErrors.subtype = "Дэд төрлийг сонгоно уу";
      if (!form.responsibleEmployeeId) {
        nextErrors.responsibleEmployeeId = "Хариуцах ажилтныг сонгоно уу";
      }
      if (!form.dueDate) nextErrors.dueDate = "Шийдвэрлэх хугацааг сонгоно уу";
      if (!form.description.trim()) nextErrors.description = "Тайлбар оруулна уу";
      if (!form.reviewingManagerId) {
        nextErrors.reviewingManagerId = "Хянах удирдлагыг сонгоно уу";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(status);
    await new Promise((resolve) => setTimeout(resolve, 450));
    createRequest(
      {
        type: form.type,
        subtype: form.subtype,
        title: form.title.trim(),
        departmentId: form.departmentId,
        responsibleEmployeeId: form.responsibleEmployeeId,
        priority: form.priority,
        dueDate: form.dueDate,
        description: form.description.trim(),
        attachments,
        relatedDocumentId: form.relatedDocumentId === "none" ? undefined : form.relatedDocumentId,
        reviewingManagerId: form.reviewingManagerId,
      },
      status,
      session?.name ?? "Системийн хэрэглэгч",
    );
    toast.success(status === "draft" ? "Ноорог хадгалагдлаа" : "Хүсэлт амжилттай илгээгдлээ", {
      description:
        status === "draft"
          ? "Хүсэлтийг дараа үргэлжлүүлэн засах боломжтой."
          : "Хариуцсан нэгж болон хянах удирдлагад мэдэгдэл хүргэлээ.",
    });
    setSaving(null);
    setForm(initialForm);
    setAttachments([]);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle>Шинэ хүсэлт үүсгэх</DialogTitle>
              <DialogDescription className="mt-1">
                Хүсэлтийг хариуцсан нэгж, ажилтанд шилжүүлж шийдвэрлэх хугацааг хянана.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <RequestField label="Хүсэлтийн төрөл" error={errors.type} required>
            <Select
              value={form.type}
              onValueChange={(value) => {
                const subtype = requestTypeOptions[value]?.[0] ?? "";
                setForm((current) => ({ ...current, type: value, subtype }));
              }}
            >
              <SelectTrigger className={cn(errors.type && "border-destructive")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(requestTypeOptions).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </RequestField>

          <RequestField label="Дэд төрөл" error={errors.subtype} required>
            <Select value={form.subtype} onValueChange={(value) => update("subtype", value)}>
              <SelectTrigger className={cn(errors.subtype && "border-destructive")}>
                <SelectValue placeholder="Дэд төрөл сонгох" />
              </SelectTrigger>
              <SelectContent>
                {subtypes.map((subtype) => (
                  <SelectItem key={subtype} value={subtype}>
                    {subtype}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </RequestField>

          <div className="sm:col-span-2">
            <RequestField label="Хүсэлтийн гарчиг" error={errors.title} required>
              <Input
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Хүсэлтийн утгыг товч, тодорхой бичнэ үү"
                className={cn(errors.title && "border-destructive")}
              />
            </RequestField>
          </div>

          <RequestField label="Хариуцах хэлтэс, нэгж" error={errors.departmentId} required>
            <Select
              value={form.departmentId}
              onValueChange={(value) => {
                setForm((current) => ({
                  ...current,
                  departmentId: value,
                  responsibleEmployeeId: "",
                }));
                setErrors((current) => ({ ...current, departmentId: "" }));
              }}
            >
              <SelectTrigger className={cn(errors.departmentId && "border-destructive")}>
                <SelectValue placeholder="Нэгж сонгох" />
              </SelectTrigger>
              <SelectContent>
                {departments
                  .filter((department) => department.level !== "organization")
                  .map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </RequestField>

          <RequestField label="Хариуцах ажилтан" error={errors.responsibleEmployeeId} required>
            <Select
              value={form.responsibleEmployeeId}
              onValueChange={(value) => update("responsibleEmployeeId", value)}
            >
              <SelectTrigger className={cn(errors.responsibleEmployeeId && "border-destructive")}>
                <SelectValue placeholder="Ажилтан сонгох" />
              </SelectTrigger>
              <SelectContent>
                {departmentEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} · {employee.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </RequestField>

          <RequestField label="Ач холбогдол" required>
            <Select
              value={form.priority}
              onValueChange={(value) => update("priority", value as typeof form.priority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Бага</SelectItem>
                <SelectItem value="normal">Хэвийн</SelectItem>
                <SelectItem value="high">Өндөр</SelectItem>
                <SelectItem value="urgent">Яаралтай</SelectItem>
              </SelectContent>
            </Select>
          </RequestField>

          <RequestField label="Шийдвэрлэх хугацаа" error={errors.dueDate} required>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(event) => update("dueDate", event.target.value)}
              className={cn(errors.dueDate && "border-destructive")}
            />
          </RequestField>

          <div className="sm:col-span-2">
            <RequestField label="Тайлбар" error={errors.description} required>
              <Textarea
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Нөхцөл байдал, хүсэж буй шийдэл болон шаардлагатай мэдээллийг оруулна уу"
                className={cn("min-h-24 resize-y", errors.description && "border-destructive")}
              />
            </RequestField>
          </div>

          <RequestField label="Холбогдох албан бичиг">
            <Select
              value={form.relatedDocumentId}
              onValueChange={(value) => update("relatedDocumentId", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Холбоогүй</SelectItem>
                {documents.map((document) => (
                  <SelectItem key={document.id} value={document.id}>
                    {document.number} · {document.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </RequestField>

          <RequestField label="Хянах удирдлага" error={errors.reviewingManagerId} required>
            <Select
              value={form.reviewingManagerId}
              onValueChange={(value) => update("reviewingManagerId", value)}
            >
              <SelectTrigger className={cn(errors.reviewingManagerId && "border-destructive")}>
                <SelectValue placeholder="Удирдлага сонгох" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter((employee) =>
                    ["executive", "department-head", "organization-admin"].includes(
                      employee.permissionPreset,
                    ),
                  )
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} · {employee.position}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </RequestField>

          <div className="sm:col-span-2">
            <RequestField label="Файл хавсаргах">
              <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/30 px-4 py-3 text-center transition hover:border-[var(--brand)]/40 hover:bg-brand-soft/40">
                <Paperclip className="h-5 w-5 text-[var(--brand)]" />
                <span className="mt-1 text-xs font-medium">Файл сонгох эсвэл энд чирж оруулах</span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  PDF, DOCX, XLSX, JPG, PNG · Нэг файл 20MB хүртэл
                </span>
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const names = Array.from(event.target.files ?? []).map((file) => file.name);
                    setAttachments((current) => [...new Set([...current, ...names])]);
                    event.target.value = "";
                  }}
                />
              </label>
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <span
                      key={attachment}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
                      <span className="truncate">{attachment}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((current) => current.filter((item) => item !== attachment))
                        }
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`${attachment} файл хасах`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </RequestField>
          </div>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={!!saving}>
            Болих
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => submit("draft")}
            disabled={!!saving}
          >
            {saving === "draft" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Ноорог хадгалах
          </Button>
          <Button className="gap-2" onClick={() => submit("submitted")} disabled={!!saving}>
            {saving === "submitted" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Илгээх
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RequestField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11px] text-destructive">{error}</span>}
    </label>
  );
}
