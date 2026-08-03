import { useState } from "react";
import { toast } from "sonner";
import { Laptop, Lock, Save, Smartphone } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { DASHBOARD_NAV, roleLabel } from "../nav-config";
import type { BusinessRole } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FormRow, PageHeader } from "../ui";

export function SettingsPage() {
  const { orgProfile, updateOrgProfile, bookingSettings, updateBookingSettings, branches, updateBranch } = useDashboardData();
  const [orgForm, setOrgForm] = useState({ name: orgProfile.name, businessType: orgProfile.businessType });
  const [bookingForm, setBookingForm] = useState(bookingSettings);
  const [notifPrefs, setNotifPrefs] = useState({ staffNewBooking: true, customerReminder: true, dailySummary: false });
  const [paymentMethods, setPaymentMethods] = useState({ cash: true, card: true, qpay: true, transfer: false });
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader title="Тохиргоо" description="Байгууллагын үндсэн тохиргоог удирдана." />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">Ерөнхий</TabsTrigger>
          <TabsTrigger value="booking">Захиалгын тохиргоо</TabsTrigger>
          <TabsTrigger value="hours">Ажиллах цаг</TabsTrigger>
          <TabsTrigger value="notifications">Мэдэгдэл</TabsTrigger>
          <TabsTrigger value="access">Эрх, хандалт</TabsTrigger>
          <TabsTrigger value="branches">Салбар</TabsTrigger>
          <TabsTrigger value="payment">Төлбөр</TabsTrigger>
          <TabsTrigger value="security">Аюулгүй байдал</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="grid max-w-lg gap-3.5">
            <FormRow label="Байгууллагын нэр">
              <Input value={orgForm.name} onChange={(e) => setOrgForm((p) => ({ ...p, name: e.target.value }))} />
            </FormRow>
            <FormRow label="Үйл ажиллагааны чиглэл">
              <Input value={orgForm.businessType} onChange={(e) => setOrgForm((p) => ({ ...p, businessType: e.target.value }))} />
            </FormRow>
            <Button
              className="w-fit gap-1.5 rounded-lg"
              onClick={() => { updateOrgProfile(orgForm); toast.success("Ерөнхий тохиргоо хадгалагдлаа"); }}
            >
              <Save className="h-4 w-4" /> Хадгалах
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="booking" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <p className="mb-4 rounded-lg bg-brand-soft px-3 py-2 text-xs text-[var(--brand-2)]">
            Санамж: Tanu-аар ирсэн захиалга автоматаар календарьт нэмэгддэг тул батламжлах шаардлагагүй.
          </p>
          <div className="grid max-w-lg gap-3.5 sm:grid-cols-2">
            <FormRow label="Хамгийн бага урьдчилан захиалах хугацаа (мин)">
              <Input type="number" value={bookingForm.minLeadTimeMin} onChange={(e) => setBookingForm((p) => ({ ...p, minLeadTimeMin: Number(e.target.value) }))} />
            </FormRow>
            <FormRow label="Хамгийн хол захиалах боломжтой хугацаа (өдөр)">
              <Input type="number" value={bookingForm.maxFutureDays} onChange={(e) => setBookingForm((p) => ({ ...p, maxFutureDays: Number(e.target.value) }))} />
            </FormRow>
            <FormRow label="Цуцлах эцсийн хугацаа (цаг)">
              <Input type="number" value={bookingForm.cancellationDeadlineHours} onChange={(e) => setBookingForm((p) => ({ ...p, cancellationDeadlineHours: Number(e.target.value) }))} />
            </FormRow>
            <FormRow label="Цагийн интервал (мин)">
              <Input type="number" value={bookingForm.slotIntervalMin} onChange={(e) => setBookingForm((p) => ({ ...p, slotIntervalMin: Number(e.target.value) }))} />
            </FormRow>
            <FormRow label="Үйлчилгээ хоорондын завсар (мин)">
              <Input type="number" value={bookingForm.bufferTimeMin} onChange={(e) => setBookingForm((p) => ({ ...p, bufferTimeMin: Number(e.target.value) }))} />
            </FormRow>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-xs font-medium">Автомат сануулга илгээх</span>
              <Switch checked={bookingForm.autoReminders} onCheckedChange={(v) => setBookingForm((p) => ({ ...p, autoReminders: v }))} />
            </div>
          </div>
          <Button
            className="mt-4 w-fit gap-1.5 rounded-lg"
            onClick={() => { updateBookingSettings(bookingForm); toast.success("Захиалгын тохиргоо хадгалагдлаа"); }}
          >
            <Save className="h-4 w-4" /> Хадгалах
          </Button>
        </TabsContent>

        <TabsContent value="hours" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="space-y-2.5">
            {branches.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface-muted/40 p-3">
                <span className="text-sm font-medium">{b.name}</span>
                <Input
                  value={b.workingHours}
                  onChange={(e) => updateBranch(b.id, { workingHours: e.target.value })}
                  className="h-8 w-40 text-xs"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="max-w-lg space-y-3">
            <ToggleRow label="Ажилтанд шинэ захиалгын мэдэгдэл илгээх" checked={notifPrefs.staffNewBooking} onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, staffNewBooking: v }))} />
            <ToggleRow label="Хэрэглэгчид сануулга илгээх" checked={notifPrefs.customerReminder} onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, customerReminder: v }))} />
            <ToggleRow label="Өдөр бүрийн тойм имэйл" checked={notifPrefs.dailySummary} onCheckedChange={(v) => setNotifPrefs((p) => ({ ...p, dailySummary: v }))} />
          </div>
        </TabsContent>

        <TabsContent value="access" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <p className="mb-4 text-sm text-muted-foreground">Эрхийн түвшин тус бүрийн харах боломжтой цэсүүд.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">Цэс</th>
                  {(["owner", "admin", "employee"] as BusinessRole[]).map((r) => (
                    <th key={r} className="pb-2 pr-4">{roleLabel[r]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...new Map(DASHBOARD_NAV.map((i) => [i.to + i.label, i])).values()].map((item) => (
                  <tr key={item.key} className="border-t border-border/60">
                    <td className="py-2 pr-4">{item.label}</td>
                    {(["owner", "admin", "employee"] as BusinessRole[]).map((r) => (
                      <td key={r} className="py-2 pr-4">
                        {item.roles.includes(r) ? <span className="text-[var(--success)]">✓</span> : <span className="text-muted-foreground/40">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="branches" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="space-y-2.5">
            {branches.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-muted/40 p-3">
                <span className="text-sm font-medium">{b.name}</span>
                <Switch checked={b.active} onCheckedChange={(v) => updateBranch(b.id, { active: v })} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="max-w-lg space-y-3">
            <ToggleRow label="Бэлнээр төлөх" checked={paymentMethods.cash} onCheckedChange={(v) => setPaymentMethods((p) => ({ ...p, cash: v }))} />
            <ToggleRow label="Картаар төлөх" checked={paymentMethods.card} onCheckedChange={(v) => setPaymentMethods((p) => ({ ...p, card: v }))} />
            <ToggleRow label="QPay-ээр төлөх" checked={paymentMethods.qpay} onCheckedChange={(v) => setPaymentMethods((p) => ({ ...p, qpay: v }))} />
            <ToggleRow label="Дансаар шилжүүлэх" checked={paymentMethods.transfer} onCheckedChange={(v) => setPaymentMethods((p) => ({ ...p, transfer: v }))} />
          </div>
        </TabsContent>

        <TabsContent value="security" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="max-w-lg space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[var(--brand)]" />
                <div>
                  <p className="text-sm font-medium">Хоёр шатлалт баталгаажуулалт</p>
                  <p className="text-xs text-muted-foreground">Нэвтрэх үед нэмэлт код шаардана.</p>
                </div>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Идэвхтэй төхөөрөмжүүд</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-surface-muted/40 p-3 text-xs">
                  <span className="inline-flex items-center gap-2"><Laptop className="h-3.5 w-3.5" /> Windows · Chrome (энэ төхөөрөмж)</span>
                  <span className="text-muted-foreground">Идэвхтэй</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-surface-muted/40 p-3 text-xs">
                  <span className="inline-flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" /> iPhone · Tanu Business апп</span>
                  <Button size="sm" variant="outline" className="h-6 rounded-md px-2 text-[11px]" onClick={() => toast.success("Төхөөрөмжөөс гарлаа")}>Гаргах</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ToggleRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
