import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Eye, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, FormRow } from "@/components/dashboard/ui";
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
import { useOrganization } from "@/lib/organization-context";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import { SimpleLayoutPreview } from "@/features/ticket/components/SimpleLayoutPreview";
import { layoutTypeLabel, TicketPanel, ticketMoney } from "@/features/ticket/components/TicketUI";
import type { EventStatus } from "@/features/ticket/types";

const steps = [
  "Үндсэн мэдээлэл",
  "Байршил",
  "Огноо ба цаг",
  "Тасалбарын төрөл",
  "Борлуулалтын тохиргоо",
  "Урьдчилан харах",
];

export function CreateEventPage() {
  const data = useTicketData();
  const { selectedOrganization } = useOrganization();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Тоглолт");
  const [description, setDescription] = useState("");
  const [venueId, setVenueId] = useState(data.venues[0]?.id ?? "");
  const availableHalls = data.halls.filter((hall) => hall.venueId === venueId);
  const [hallId, setHallId] = useState(availableHalls[0]?.id ?? "");
  const availableLayouts = data.layouts.filter((layout) => layout.hallId === hallId);
  const [layoutId, setLayoutId] = useState(availableLayouts[0]?.id ?? "");
  const [date, setDate] = useState("2026-08-30");
  const [time, setTime] = useState("19:00");
  const [doorsTime, setDoorsTime] = useState("18:00");
  const [ticketName, setTicketName] = useState("Standard");
  const [ticketCode, setTicketCode] = useState("STD");
  const [ticketPrice, setTicketPrice] = useState(100000);
  const [ticketCapacity, setTicketCapacity] = useState(100);
  const [section, setSection] = useState("Ерөнхий хэсэг");
  const [refundable, setRefundable] = useState(true);
  const [salesStart, setSalesStart] = useState("2026-08-04T10:00");
  const [salesEnd, setSalesEnd] = useState("2026-08-30T18:30");
  const [holdMinutes, setHoldMinutes] = useState(10);
  const [status, setStatus] = useState<EventStatus>("draft");
  const selectedVenue = data.venues.find((venue) => venue.id === venueId);
  const selectedHall = data.halls.find((hall) => hall.id === hallId);
  const selectedLayout = data.layouts.find((layout) => layout.id === layoutId);
  const errors = useMemo(() => {
    const list: string[] = [];
    if (!name.trim()) list.push("Арга хэмжээний нэр шаардлагатай.");
    if (!venueId) list.push("Байршил сонгоно уу.");
    if (!hallId) list.push("Танхим сонгоно уу.");
    if (!layoutId || !selectedLayout?.totalCapacity) list.push("Багтаамжтай зураглал сонгоно уу.");
    if (!date || !time) list.push("Эхлэх огноо, цаг шаардлагатай.");
    if (!ticketName.trim() || !section.trim())
      list.push("Тасалбарын нэр болон хэсэг/бүс шаардлагатай.");
    if (ticketCapacity > (selectedLayout?.totalCapacity ?? 0))
      list.push("Тасалбарын тоо зураглалын багтаамжаас хэтэрсэн.");
    if (salesStart >= salesEnd)
      list.push("Борлуулалтын эхлэх хугацаа дуусах хугацаанаас өмнө байна.");
    if (salesEnd > `${date}T${time}`)
      list.push("Борлуулалтын дуусах хугацаа арга хэмжээ эхлэхээс өмнө байна.");
    return list;
  }, [
    date,
    hallId,
    layoutId,
    name,
    salesEnd,
    salesStart,
    section,
    selectedLayout,
    ticketCapacity,
    ticketName,
    time,
    venueId,
  ]);

  const changeVenue = (value: string) => {
    setVenueId(value);
    const hall = data.halls.find((item) => item.venueId === value);
    setHallId(hall?.id ?? "");
    setLayoutId(data.layouts.find((layout) => layout.hallId === hall?.id)?.id ?? "");
  };
  const changeHall = (value: string) => {
    setHallId(value);
    setLayoutId(data.layouts.find((layout) => layout.hallId === value)?.id ?? "");
  };
  const save = (publish: boolean) => {
    if (errors.length) {
      toast.error("Мэдээллийг бүрэн шалгана уу", { description: errors[0] });
      setStep(6);
      return;
    }
    try {
      const id = data.createEvent({
        name,
        category,
        description,
        venueId,
        hallId,
        layoutId,
        startAt: `${date}T${time}:00`,
        doorsOpenAt: `${date}T${doorsTime}:00`,
        salesStartAt: salesStart,
        salesEndAt: salesEnd,
        holdDurationMinutes: holdMinutes,
        status: publish ? (status === "draft" ? "on-sale" : status) : "draft",
      });
      data.createTicketType({
        eventId: id,
        name: ticketName,
        code: ticketCode,
        description: `${ticketName} тасалбар`,
        price: ticketPrice,
        capacity: ticketCapacity,
        minQuantity: 1,
        maxPerOrder: 8,
        refundable,
        sectionOrZone: section,
        seatCategory: selectedLayout?.layoutType === "standing" ? undefined : ticketName,
        gateId: data.gates.find((gate) => gate.venueId === venueId)?.id,
        color: "#3157A4",
      });
      toast.success(publish ? "Арга хэмжээ нийтлэгдлээ" : "Арга хэмжээ нооргоор хадгалагдлаа");
      navigate({ to: `/business/dashboard/ticket/${selectedOrganization.id}/events/${id}` });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Арга хэмжээ хадгалсангүй");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Шинэ арга хэмжээ"
        description="Арга хэмжээний мэдээллийг дарааллаар нь бүрдүүлнэ."
        backTo={`/business/dashboard/ticket/${selectedOrganization.id}/events`}
        actions={
          <Button variant="outline" onClick={() => save(false)}>
            <Save /> Ноорог хадгалах
          </Button>
        }
      />
      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[760px] grid-cols-6 gap-2">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index + 1)}
              className={`rounded-xl border px-3 py-3 text-left ${step === index + 1 ? "border-[var(--brand)] bg-brand-soft text-[var(--brand)]" : "border-border bg-surface/70 text-muted-foreground"}`}
            >
              <span className="text-[10px] font-bold">{index + 1}-р алхам</span>
              <span className="mt-1 block truncate text-xs font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <TicketPanel className="min-h-[430px]">
        <h2 className="text-base font-bold">{steps[step - 1]}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Шаардлагатай мэдээллийг бүрэн оруулна уу.
        </p>
        <div className="mt-6">
          {step === 1 && (
            <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormRow label="Арга хэмжээний нэр">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Жишээ: Live Concert 2026"
                  />
                </FormRow>
              </div>
              <FormRow label="Ангилал">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Тоглолт", "Фестиваль", "Хурал", "Энтертайнмент", "Спорт"].map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
              <div className="sm:col-span-2">
                <FormRow label="Тайлбар">
                  <Textarea
                    className="min-h-32"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </FormRow>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(360px,1.2fr)]">
              <div className="space-y-4">
                <FormRow label="Байршил">
                  <Select value={venueId} onValueChange={changeVenue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Байршил сонгох" />
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
                <FormRow label="Танхим">
                  <Select value={hallId} onValueChange={changeHall}>
                    <SelectTrigger>
                      <SelectValue placeholder="Танхим сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHalls.map((hall) => (
                        <SelectItem key={hall.id} value={hall.id}>
                          {hall.name} · {layoutTypeLabel[hall.layoutType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormRow>
                <FormRow label="Хадгалсан зураглал">
                  <Select value={layoutId} onValueChange={setLayoutId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Зураглал сонгох" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLayouts.map((layout) => (
                        <SelectItem key={layout.id} value={layout.id}>
                          {layout.name} · v{layout.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormRow>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Байршил ба суудал хэсгээс шинэ байршил үүсгэнэ үү")}
                  >
                    <Plus /> Байршил үүсгэх
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info("Сонгосон байршлын дэлгэрэнгүйгээс танхим үүсгэнэ үү")
                    }
                  >
                    <Plus /> Танхим үүсгэх
                  </Button>
                </div>
              </div>
              <SimpleLayoutPreview
                layoutType={selectedLayout?.layoutType ?? "seated"}
                capacity={selectedLayout?.totalCapacity ?? 0}
              />
            </div>
          )}
          {step === 3 && (
            <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
              <FormRow label="Огноо">
                <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </FormRow>
              <FormRow label="Эхлэх цаг">
                <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
              </FormRow>
              <FormRow label="Хаалга нээх цаг">
                <Input
                  type="time"
                  value={doorsTime}
                  onChange={(event) => setDoorsTime(event.target.value)}
                />
              </FormRow>
            </div>
          )}
          {step === 4 && (
            <div className="grid max-w-4xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <FormRow label="Тасалбарын нэр">
                <Input value={ticketName} onChange={(event) => setTicketName(event.target.value)} />
              </FormRow>
              <FormRow label="Дотоод код">
                <Input value={ticketCode} onChange={(event) => setTicketCode(event.target.value)} />
              </FormRow>
              <FormRow label="Үнэ">
                <Input
                  type="number"
                  value={ticketPrice}
                  onChange={(event) => setTicketPrice(Number(event.target.value))}
                />
              </FormRow>
              <FormRow label="Борлуулах тоо">
                <Input
                  type="number"
                  value={ticketCapacity}
                  onChange={(event) => setTicketCapacity(Number(event.target.value))}
                />
              </FormRow>
              <FormRow label="Оноосон хэсэг / бүс">
                <Input value={section} onChange={(event) => setSection(event.target.value)} />
              </FormRow>
              <label className="flex items-center justify-between rounded-xl border border-border p-3 text-xs">
                <span>Буцаалттай тасалбар</span>
                <Switch checked={refundable} onCheckedChange={setRefundable} />
              </label>
            </div>
          )}
          {step === 5 && (
            <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
              <FormRow label="Борлуулалт эхлэх">
                <Input
                  type="datetime-local"
                  value={salesStart}
                  onChange={(event) => setSalesStart(event.target.value)}
                />
              </FormRow>
              <FormRow label="Борлуулалт дуусах">
                <Input
                  type="datetime-local"
                  value={salesEnd}
                  onChange={(event) => setSalesEnd(event.target.value)}
                />
              </FormRow>
              <FormRow label="Суудал түр хадгалах хугацаа">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={holdMinutes}
                  onChange={(event) => setHoldMinutes(Number(event.target.value))}
                />
              </FormRow>
              <FormRow label="Эхний төлөв">
                <Select value={status} onValueChange={(value) => setStatus(value as EventStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Ноорог</SelectItem>
                    <SelectItem value="published">Нийтлэхэд бэлэн</SelectItem>
                    <SelectItem value="on-sale">Борлуулж эхлэх</SelectItem>
                  </SelectContent>
                </Select>
              </FormRow>
              <p className="sm:col-span-2 rounded-xl border border-[var(--warning)]/20 bg-[color-mix(in_oklch,var(--warning)_8%,transparent)] p-3 text-xs text-muted-foreground">
                {holdMinutes} минутын hold нь зөвхөн тохиргооны demo утга. Production atomic
                inventory одоогоор холбогдоогүй.
              </p>
            </div>
          )}
          {step === 6 && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(360px,1.2fr)]">
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-surface-muted/35 p-4">
                  <h3 className="font-bold">{name || "Арга хэмжээний нэр"}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category} · {selectedVenue?.name} · {selectedHall?.name}
                  </p>
                  <p className="mt-3 text-sm">{description || "Тайлбар оруулаагүй"}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <Review label="Эхлэх" value={`${date} ${time}`} />
                    <Review label="Багтаамж" value={`${selectedLayout?.totalCapacity ?? 0}`} />
                    <Review
                      label="Тасалбар"
                      value={`${ticketName} · ${ticketMoney(ticketPrice)}`}
                    />
                    <Review label="Борлуулах тоо" value={`${ticketCapacity}`} />
                  </div>
                </div>
                {errors.length > 0 ? (
                  <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
                    <p className="text-xs font-bold text-destructive">
                      Нийтлэхийн өмнө засах зүйлс
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-destructive">
                      {errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--success)]/25 bg-[color-mix(in_oklch,var(--success)_8%,transparent)] p-4 text-xs text-[var(--success)]">
                    <Check /> Нийтлэх үндсэн шалгалтууд амжилттай.
                  </div>
                )}
              </div>
              <SimpleLayoutPreview
                layoutType={selectedLayout?.layoutType ?? "seated"}
                capacity={selectedLayout?.totalCapacity ?? 0}
              />
            </div>
          )}
        </div>
      </TicketPanel>
      <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-lg backdrop-blur">
        <Button
          variant="outline"
          onClick={() =>
            step === 1
              ? navigate({ to: `/business/dashboard/ticket/${selectedOrganization.id}/events` })
              : setStep((current) => current - 1)
          }
        >
          <ArrowLeft /> {step === 1 ? "Болих" : "Өмнөх"}
        </Button>
        {step < 6 ? (
          <Button onClick={() => setStep((current) => current + 1)}>
            Дараах <ArrowRight />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => save(false)}>
              <Save /> Ноорог хадгалах
            </Button>
            <Button onClick={() => save(true)} disabled={errors.length > 0}>
              <Eye /> Нийтлэх
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
