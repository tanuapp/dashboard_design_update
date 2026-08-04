import { useState } from "react";
import { DoorOpen, Plus, ScanLine, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState, FormRow, StatCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import { TicketPanel, TicketStatusBadge } from "@/features/ticket/components/TicketUI";
import type { EntryGate } from "@/features/ticket/types";

export function EntryGatesPage() {
  const data = useTicketData();
  const [open, setOpen] = useState(false);
  const toggle = (id: string) => {
    try {
      data.toggleGate(id);
      toast.success("Хаалганы төлөв шинэчлэгдлээ");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Төлөв шинэчлэгдсэнгүй");
    }
  };
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Нэвтрэх хаалга"
        description="Байршлын нэвтрэх цэг, төхөөрөмж болон өнөөдрийн шалгалтыг удирдана."
        actions={
          data.can("ticket.gates.manage") && (
            <Button onClick={() => setOpen(true)}>
              <Plus /> Хаалга нэмэх
            </Button>
          )
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<DoorOpen className="h-4 w-4" />}
          label="Нийт хаалга"
          value={data.gates.length}
        />
        <StatCard
          icon={<Smartphone className="h-4 w-4" />}
          label="Идэвхтэй төхөөрөмж"
          value={data.gates.reduce((sum, gate) => sum + gate.deviceCount, 0)}
        />
        <StatCard
          icon={<ScanLine className="h-4 w-4" />}
          label="Өнөөдөр шалгасан"
          value={data.gates
            .reduce((sum, gate) => sum + gate.scannedToday, 0)
            .toLocaleString("mn-MN")}
        />
      </div>
      {data.gates.length === 0 ? (
        <EmptyState
          icon={<DoorOpen className="h-6 w-6" />}
          title="Нэвтрэх хаалга алга байна"
          description="Байршилд эхний хаалгаа бүртгэнэ үү."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.gates.map((gate) => {
            const venue = data.venues.find((item) => item.id === gate.venueId);
            return (
              <TicketPanel key={gate.id}>
                <div className="flex items-start justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
                    <DoorOpen className="h-5 w-5" />
                  </span>
                  <TicketStatusBadge
                    value={gate.status}
                    label={gate.status === "open" ? "Нээлттэй" : "Хаалттай"}
                  />
                </div>
                <h2 className="mt-4 font-bold">{gate.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {venue?.name} · {gate.code}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-surface-muted/40 p-3 text-xs">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Төхөөрөмж</p>
                    <p className="font-bold">{gate.deviceCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Шалгасан</p>
                    <p className="font-bold">{gate.scannedToday}</p>
                  </div>
                </div>
                {data.can("ticket.gates.manage") && (
                  <label className="mt-4 flex items-center justify-between text-xs">
                    <span>Хаалга нээлттэй</span>
                    <Switch
                      checked={gate.status === "open"}
                      onCheckedChange={() => toggle(gate.id)}
                    />
                  </label>
                )}
              </TicketPanel>
            );
          })}
        </div>
      )}
      <CreateGateDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function CreateGateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = useTicketData();
  const [venueId, setVenueId] = useState(data.venues[0]?.id ?? "");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<EntryGate["type"]>("entrance");
  const [deviceCount, setDeviceCount] = useState(1);
  const submit = () => {
    try {
      data.createGate({ venueId, name, code, type, deviceCount });
      toast.success("Шинэ хаалга нэмэгдлээ");
      onOpenChange(false);
      setName("");
      setCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Хаалга нэмэгдсэнгүй");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Нэвтрэх хаалга нэмэх</DialogTitle>
          <DialogDescription>
            Хаалгыг байршилтай холбож, төхөөрөмжийн тоог тохируулна.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Байршил">
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Хаалганы нэр">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormRow>
          <FormRow label="Код">
            <Input value={code} onChange={(event) => setCode(event.target.value)} />
          </FormRow>
          <FormRow label="Төрөл">
            <Select value={type} onValueChange={(value) => setType(value as EntryGate["type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrance">Үндсэн орц</SelectItem>
                <SelectItem value="vip">VIP орц</SelectItem>
                <SelectItem value="staff">Ажилтны орц</SelectItem>
                <SelectItem value="exit">Гарц</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Төхөөрөмжийн тоо">
            <Input
              type="number"
              min={0}
              value={deviceCount}
              onChange={(event) => setDeviceCount(Number(event.target.value))}
            />
          </FormRow>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Болих
          </Button>
          <Button onClick={submit}>Хаалга нэмэх</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
