import { useState } from "react";
import { toast } from "sonner";
import { Eye, Globe, Image as ImageIcon, MapPin, Save, Sparkles } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { TanuMark } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FormRow, PageHeader, money } from "../ui";

export function OrgProfilePage() {
  const { orgProfile, updateOrgProfile, branches, services } = useDashboardData();
  const [form, setForm] = useState(orgProfile);
  const [previewOpen, setPreviewOpen] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(orgProfile);

  const save = () => {
    updateOrgProfile(form);
    toast.success("Байгууллагын профайл шинэчлэгдлээ");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Байгууллагын профайл"
        description="Энэ мэдээлэл Tanu апп дээр хэрэглэгчдэд харагдана — таны хувийн профайлаас тусдаа."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5 rounded-lg" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4" /> Нийтэд харагдах байдал
            </Button>
            <Button className="gap-1.5 rounded-lg" disabled={!dirty} onClick={save}>
              <Save className="h-4 w-4" /> Хадгалах
            </Button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/80 shadow-sm">
        <div className="relative h-32 bg-gradient-brand">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <button className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-black/25 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/35">
            <ImageIcon className="h-3.5 w-3.5" /> Cover солих
          </button>
        </div>
        <div className="flex items-end gap-4 px-5 pb-5">
          <div className="-mt-8 grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-surface bg-white shadow-md">
            <TanuMark variant="navy" className="h-12" />
          </div>
          <div className="pt-3">
            <p className="font-semibold">{form.name}</p>
            <p className="text-xs text-muted-foreground">{form.businessType}</p>
          </div>
          <Button size="sm" variant="outline" className="ml-auto mt-3 gap-1.5 rounded-lg">
            <ImageIcon className="h-3.5 w-3.5" /> Лого солих
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3.5 rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <h2 className="font-semibold">Ерөнхий мэдээлэл</h2>
          <FormRow label="Байгууллагын нэр">
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </FormRow>
          <FormRow label="Товч тайлбар">
            <Input value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
          </FormRow>
          <FormRow label="Дэлгэрэнгүй тайлбар">
            <Textarea className="min-h-24" value={form.detailedDescription} onChange={(e) => setForm((p) => ({ ...p, detailedDescription: e.target.value }))} />
          </FormRow>
          <FormRow label="Үйл ажиллагааны чиглэл">
            <Input value={form.businessType} onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))} />
          </FormRow>
        </div>

        <div className="space-y-3.5 rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <h2 className="font-semibold">Холбоо барих</h2>
          <FormRow label="Утас">
            <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </FormRow>
          <FormRow label="И-мэйл">
            <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </FormRow>
          <FormRow label="Вэбсайт">
            <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Facebook">
              <Input value={form.socials.facebook} onChange={(e) => setForm((p) => ({ ...p, socials: { ...p.socials, facebook: e.target.value } }))} />
            </FormRow>
            <FormRow label="Instagram">
              <Input value={form.socials.instagram} onChange={(e) => setForm((p) => ({ ...p, socials: { ...p.socials, instagram: e.target.value } }))} />
            </FormRow>
          </div>
          <FormRow label="Хаяг">
            <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          </FormRow>
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted/40 text-xs text-muted-foreground">
            <MapPin className="mr-1.5 h-4 w-4" /> Газрын зургийн байршил (placeholder)
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Ажиллах цаг</h2>
          <div className="space-y-1.5 text-sm">
            {branches.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-surface-muted/40 px-3 py-2">
                <span>{b.name}</span>
                <span className="text-muted-foreground">{b.workingHours}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Салбарууд</h2>
          <div className="space-y-1.5 text-sm">
            {branches.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-surface-muted/40 px-3 py-2">
                <span>{b.name}</span>
                <span className="text-muted-foreground">{b.address}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Үйлчилгээ</h2>
          <div className="flex flex-wrap gap-1.5">
            {services.filter((s) => s.active).map((s) => (
              <span key={s.id} className="rounded-md bg-brand-soft px-2 py-1 text-xs text-[var(--brand-2)]">{s.name}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Зургийн галерей</h2>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid aspect-square place-items-center rounded-lg bg-gradient-brand text-white">
                <Sparkles className="h-5 w-5 opacity-80" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[var(--brand)]" />
          <div>
            <p className="text-sm font-medium">Tanu апп дээр захиалга авах</p>
            <p className="text-xs text-muted-foreground">Идэвхгүй бол хэрэглэгчид апп-аар шинэ захиалга үүсгэх боломжгүй.</p>
          </div>
        </div>
        <Switch checked={form.publicBookingVisible} onCheckedChange={(v) => setForm((p) => ({ ...p, publicBookingVisible: v }))} />
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Нийтийн профайлын урьдчилан харах</DialogTitle>
            <DialogDescription>Tanu аппад хэрэглэгчид ойролцоогоор ингэж харагдана.</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="h-20 bg-gradient-brand" />
            <div className="p-4">
              <p className="font-bold">{form.name}</p>
              <p className="text-xs text-muted-foreground">{form.shortDescription}</p>
              <p className="mt-2 text-xs text-muted-foreground">{form.address}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {services.filter((s) => s.active).slice(0, 4).map((s) => (
                  <span key={s.id} className="rounded-md bg-brand-soft px-2 py-1 text-[11px] text-[var(--brand-2)]">{s.name} · {money(s.price)}</span>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
