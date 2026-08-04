import { useState } from "react";
import { Clock3, Database, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FormRow } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TicketPanel } from "@/features/ticket/components/TicketUI";

export function TicketSettingsPage() {
  const [holdMinutes, setHoldMinutes] = useState(10);
  const [allowRefund, setAllowRefund] = useState(true);
  const [requirePhone, setRequirePhone] = useState(true);
  const [scanOnce, setScanOnce] = useState(true);
  const save = () =>
    toast.success("Ticket тохиргоо local state-д хадгалагдлаа", {
      description: "Production settings API дараагийн phase-д холбогдоно.",
    });
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Тасалбарын тохиргоо"
        description="Захиалга, түр хадгалалт, буцаалт болон QR шалгалтын үндсэн дүрмийг тохируулна."
        actions={
          <Button onClick={save}>
            <Save /> Өөрчлөлт хадгалах
          </Button>
        }
      />
      <TicketPanel>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
            <Clock3 className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="font-bold">Захиалга ба hold</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Production seat hold service холбогдох үед ашиглах тохиргоо.
            </p>
            <div className="mt-5 max-w-sm">
              <FormRow label="Суудал түр хадгалах хугацаа (минут)">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={holdMinutes}
                  onChange={(event) => setHoldMinutes(Number(event.target.value))}
                />
              </FormRow>
            </div>
          </div>
        </div>
      </TicketPanel>
      <TicketPanel>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="font-bold">Борлуулалтын дүрэм</h2>
            <div className="mt-4 divide-y divide-border">
              {" "}
              <SettingRow
                label="Буцаалттай тасалбар зөвшөөрөх"
                description="Арга хэмжээ тус бүр дээр давхар хязгаарлаж болно."
                checked={allowRefund}
                onChange={setAllowRefund}
              />
              <SettingRow
                label="Захиалагчийн утас заавал авах"
                description="Гар болон онлайн захиалгад үйлчилнэ."
                checked={requirePhone}
                onChange={setRequirePhone}
              />
              <SettingRow
                label="Тасалбарыг нэг удаа уншуулах"
                description="USED төлөвтэй тасалбарыг дахин нэвтрүүлэхгүй."
                checked={scanOnce}
                onChange={setScanOnce}
              />
            </div>
          </div>
        </div>
      </TicketPanel>
      <TicketPanel>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-bold">Repository төлөв</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Одоогоор local demo adapter ашиглаж байна. Real API, payment callback, idempotency
              key, seat hold expiration worker болон database unique constraint холбогдоогүй.
            </p>
          </div>
        </div>
      </TicketPanel>
    </div>
  );
}
function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <span>
        <span className="block text-xs font-semibold">{label}</span>
        <span className="mt-0.5 block text-[10px] text-muted-foreground">{description}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
