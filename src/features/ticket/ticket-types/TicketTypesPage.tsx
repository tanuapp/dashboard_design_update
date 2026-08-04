import { useState } from "react";
import { CircleDollarSign, Plus, Ticket } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState, FormRow, StatCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import { TicketPanel, TicketStatusBadge, ticketMoney } from "@/features/ticket/components/TicketUI";

export function TicketTypesPage() {
  const data = useTicketData();
  const [eventId, setEventId] = useState("all");
  const [open, setOpen] = useState(false);
  const types = data.ticketTypes.filter((type) => eventId === "all" || type.eventId === eventId);
  const capacity = types.reduce((sum, type) => sum + type.capacity, 0);
  const sold = types.reduce((sum, type) => sum + type.soldQuantity, 0);
  const sales = types.reduce((sum, type) => sum + type.soldQuantity * type.price, 0);
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Тасалбар ба үнэ"
        description="Тасалбарын төрөл, үнэ, борлуулах тоо болон оноосон хэсэг/бүсийг удирдана."
        actions={
          data.can("ticket.pricing.manage") && (
            <Button onClick={() => setOpen(true)}>
              <Plus /> Тасалбарын төрөл нэмэх
            </Button>
          )
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Ticket className="h-4 w-4" />}
          label="Нийт багтаамж"
          value={capacity.toLocaleString("mn-MN")}
        />
        <StatCard
          icon={<Ticket className="h-4 w-4" />}
          label="Борлуулсан"
          value={sold.toLocaleString("mn-MN")}
        />
        <StatCard
          icon={<CircleDollarSign className="h-4 w-4" />}
          label="Борлуулалтын дүн"
          value={ticketMoney(sales)}
        />
      </div>
      <TicketPanel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Үнийн тохиргоо</h2>
            <p className="text-xs text-muted-foreground">{types.length} төрөл</p>
          </div>
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх арга хэмжээ</SelectItem>
              {data.events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TicketPanel>
      {types.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-6 w-6" />}
          title="Тасалбарын төрөл алга байна"
          description="Сонгосон арга хэмжээнд тасалбарын төрөл нэмнэ үү."
        />
      ) : (
        <TicketPanel className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1050px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Тасалбар</TableHead>
                  <TableHead>Арга хэмжээ</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Хэсэг / бүс</TableHead>
                  <TableHead>Үнэ</TableHead>
                  <TableHead>Багтаамж</TableHead>
                  <TableHead>Борлуулсан</TableHead>
                  <TableHead>Нэг захиалгын хязгаар</TableHead>
                  <TableHead>Буцаалт</TableHead>
                  <TableHead>Төлөв</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((type) => {
                  const event = data.events.find((item) => item.id === type.eventId);
                  return (
                    <TableRow key={type.id}>
                      <TableCell>
                        <span className="flex items-center gap-2 font-semibold">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </span>
                      </TableCell>
                      <TableCell>{event?.name}</TableCell>
                      <TableCell className="font-mono text-xs">{type.code}</TableCell>
                      <TableCell>{type.sectionOrZone}</TableCell>
                      <TableCell className="font-semibold">{ticketMoney(type.price)}</TableCell>
                      <TableCell>{type.capacity}</TableCell>
                      <TableCell>{type.soldQuantity}</TableCell>
                      <TableCell>
                        {type.minQuantity}–{type.maxPerOrder}
                      </TableCell>
                      <TableCell>{type.refundable ? "Буцаалттай" : "Буцаалтгүй"}</TableCell>
                      <TableCell>
                        <TicketStatusBadge
                          value={type.active ? "active" : "inactive"}
                          label={type.active ? "Идэвхтэй" : "Идэвхгүй"}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TicketPanel>
      )}
      <CreateTicketTypeDialog
        open={open}
        onOpenChange={setOpen}
        defaultEventId={eventId === "all" ? (data.events[0]?.id ?? "") : eventId}
      />
    </div>
  );
}

function CreateTicketTypeDialog({
  open,
  onOpenChange,
  defaultEventId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEventId: string;
}) {
  const data = useTicketData();
  const [eventId, setEventId] = useState(defaultEventId);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(100000);
  const [capacity, setCapacity] = useState(100);
  const [minQuantity, setMinQuantity] = useState(1);
  const [maxPerOrder, setMaxPerOrder] = useState(8);
  const [refundable, setRefundable] = useState(true);
  const [sectionOrZone, setSectionOrZone] = useState("");
  const [color, setColor] = useState("#3157A4");
  const [gateId, setGateId] = useState("");
  const event = data.events.find((item) => item.id === eventId);
  const gates = data.gates.filter((gate) => gate.venueId === event?.venueId);
  const submit = () => {
    try {
      data.createTicketType({
        eventId,
        name,
        code,
        description,
        price,
        capacity,
        minQuantity,
        maxPerOrder,
        refundable,
        sectionOrZone,
        color,
        gateId: gateId || undefined,
        seatCategory:
          data.layouts.find((layout) => layout.id === event?.layoutId)?.layoutType === "standing"
            ? undefined
            : name,
      });
      toast.success("Тасалбарын төрөл нэмэгдлээ");
      onOpenChange(false);
      setName("");
      setCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Төрөл нэмэгдсэнгүй");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Тасалбарын төрөл нэмэх</DialogTitle>
          <DialogDescription>
            Үнэ болон багтаамжийг зураглалын хэсэг/бүстэй холбоно.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Арга хэмжээ">
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {data.events.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Тасалбарын нэр">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormRow>
          <FormRow label="Дотоод код">
            <Input value={code} onChange={(event) => setCode(event.target.value)} />
          </FormRow>
          <FormRow label="Үнэ">
            <Input
              type="number"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
            />
          </FormRow>
          <FormRow label="Борлуулах тоо">
            <Input
              type="number"
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
          </FormRow>
          <FormRow label="Хэсэг / зогсоолын бүс">
            <Input
              value={sectionOrZone}
              onChange={(event) => setSectionOrZone(event.target.value)}
            />
          </FormRow>
          <FormRow label="Доод тоо">
            <Input
              type="number"
              value={minQuantity}
              onChange={(event) => setMinQuantity(Number(event.target.value))}
            />
          </FormRow>
          <FormRow label="Нэг захиалгын дээд тоо">
            <Input
              type="number"
              value={maxPerOrder}
              onChange={(event) => setMaxPerOrder(Number(event.target.value))}
            />
          </FormRow>
          <FormRow label="Нэвтрэх хаалга">
            <Select
              value={gateId || "none"}
              onValueChange={(value) => setGateId(value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Оноогоогүй</SelectItem>
                {gates.map((gate) => (
                  <SelectItem key={gate.id} value={gate.id}>
                    {gate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Тасалбарын өнгө">
            <Input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </FormRow>
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
            <span>Буцаалттай</span>
            <Switch checked={refundable} onCheckedChange={setRefundable} />
          </label>
          <div className="sm:col-span-2">
            <FormRow label="Тайлбар">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </FormRow>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Болих
          </Button>
          <Button onClick={submit}>Төрөл нэмэх</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
