import { useState } from "react";
import { Building2, DoorOpen, MapPin, Plus, Ruler, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, EmptyState, FormRow } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useOrganization } from "@/lib/organization-context";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import type { LayoutType } from "@/features/ticket/types";
import {
  layoutTypeLabel,
  TicketPanel,
  TicketStatusBadge,
} from "@/features/ticket/components/TicketUI";
import { SimpleLayoutPreview } from "@/features/ticket/components/SimpleLayoutPreview";

export function VenueDetailPage({ venueId }: { venueId: string }) {
  const data = useTicketData();
  const { selectedOrganization } = useOrganization();
  const [hallOpen, setHallOpen] = useState(false);
  const venue = data.venues.find((item) => item.id === venueId);
  const base = `/business/dashboard/ticket/${selectedOrganization.id}`;
  if (!venue)
    return (
      <EmptyState
        icon={<Building2 className="h-6 w-6" />}
        title="Байршил олдсонгүй"
        description="Өөр байгууллагад харьяалагдах эсвэл архивлагдсан байж болно."
      />
    );
  const halls = data.halls.filter((hall) => hall.venueId === venue.id);
  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={venue.name}
        description={`${venue.city}, ${venue.district} · ${venue.address}`}
        backTo={`${base}/venues`}
        actions={
          data.can("ticket.venues.manage") && (
            <Button onClick={() => setHallOpen(true)}>
              <Plus /> Танхим нэмэх
            </Button>
          )
        }
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <TicketPanel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Байршлын мэдээлэл</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {venue.description}
              </p>
            </div>
            <TicketStatusBadge
              value={venue.status}
              label={
                venue.status === "active"
                  ? "Идэвхтэй"
                  : venue.status === "inactive"
                    ? "Идэвхгүй"
                    : "Архивласан"
              }
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info icon={<MapPin />} label="Хаяг" value={venue.address} />
            <Info
              icon={<Building2 />}
              label="Хот, дүүрэг"
              value={`${venue.city}, ${venue.district}`}
            />
            <Info
              icon={<DoorOpen />}
              label="Холбоо барих"
              value={`${venue.phone} · ${venue.email}`}
            />
            <Info
              icon={<Users />}
              label="Нийт багтаамж"
              value={halls.reduce((sum, hall) => sum + hall.capacity, 0).toLocaleString("mn-MN")}
            />
          </div>
        </TicketPanel>
        <TicketPanel>
          <h2 className="text-sm font-bold">Байгууламж</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {venue.facilities.length ? (
              venue.facilities.map((facility) => (
                <span
                  key={facility}
                  className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-[var(--brand)]"
                >
                  {facility}
                </span>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Байгууламж бүртгээгүй.</p>
            )}
          </div>
        </TicketPanel>
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Танхимууд</h2>
            <p className="text-xs text-muted-foreground">{halls.length} танхим</p>
          </div>
        </div>
        {halls.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="Танхим үүсгээгүй байна"
            action={
              <Button onClick={() => setHallOpen(true)}>
                <Plus /> Танхим нэмэх
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {halls.map((hall) => {
              const layout = data.layouts.find((item) => item.hallId === hall.id);
              return (
                <TicketPanel key={hall.id}>
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-[var(--brand)]">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <TicketStatusBadge
                      value={layout?.status ?? "draft"}
                      label={layout?.status === "active" ? "Зураглал идэвхтэй" : "Ноорог зураглал"}
                    />
                  </div>
                  <h3 className="mt-4 font-bold">{hall.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {layoutTypeLabel[hall.layoutType]} ·{" "}
                    {hall.environment === "indoor" ? "Дотор" : "Гадна"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <Info
                      icon={<Users />}
                      label="Багтаамж"
                      value={hall.capacity.toLocaleString("mn-MN")}
                    />
                    <Info
                      icon={<Ruler />}
                      label="Хэмжээ"
                      value={`${hall.width} × ${hall.height} м`}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button asChild variant="outline">
                      <Link
                        to="/business/dashboard/ticket/$organizationId/halls/$hallId"
                        params={{ organizationId: selectedOrganization.id, hallId: hall.id }}
                      >
                        Дэлгэрэнгүй
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link
                        to="/business/dashboard/ticket/$organizationId/seat-maps/$layoutId"
                        params={{
                          organizationId: selectedOrganization.id,
                          layoutId: layout?.id ?? "missing",
                        }}
                      >
                        Зураглал
                      </Link>
                    </Button>
                  </div>
                </TicketPanel>
              );
            })}
          </div>
        )}
      </div>
      <CreateHallDialog venueId={venue.id} open={hallOpen} onOpenChange={setHallOpen} />
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-muted/30 p-3">
      <span className="text-[var(--brand)] [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}

function CreateHallDialog({
  venueId,
  open,
  onOpenChange,
}: {
  venueId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = useTicketData();
  const [name, setName] = useState("");
  const [type, setType] = useState("Концертын танхим");
  const [environment, setEnvironment] = useState<"indoor" | "outdoor">("indoor");
  const [layoutType, setLayoutType] = useState<LayoutType>("seated");
  const [capacity, setCapacity] = useState(500);
  const [floor, setFloor] = useState("1");
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(20);
  const [entranceCount, setEntranceCount] = useState(2);
  const [exitCount, setExitCount] = useState(2);
  const [description, setDescription] = useState("");
  const submit = () => {
    try {
      data.createHall({
        venueId,
        name,
        type,
        environment,
        layoutType,
        capacity,
        floor,
        width,
        height,
        entranceCount,
        exitCount,
        description,
      });
      toast.success("Танхим болон эхний ноорог зураглал үүслээ");
      onOpenChange(false);
      setName("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Танхим үүссэнгүй");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Танхим нэмэх</DialogTitle>
          <DialogDescription>
            Танхимын төрөл, хэмжээ болон зохион байгуулалтыг сонгоно.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Танхимын нэр">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormRow>
          <FormRow label="Танхимын төрөл">
            <Input value={type} onChange={(event) => setType(event.target.value)} />
          </FormRow>
          <FormRow label="Дотор / гадна">
            <Select
              value={environment}
              onValueChange={(value) => setEnvironment(value as typeof environment)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Дотор</SelectItem>
                <SelectItem value="outdoor">Гадна</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Зураглалын төрөл">
            <Select
              value={layoutType}
              onValueChange={(value) => setLayoutType(value as LayoutType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(layoutTypeLabel) as LayoutType[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {layoutTypeLabel[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Нийт багтаамж">
            <Input
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
          </FormRow>
          <FormRow label="Давхар">
            <Input value={floor} onChange={(event) => setFloor(event.target.value)} />
          </FormRow>
          <FormRow label="Өргөн (м)">
            <Input
              type="number"
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
            />
          </FormRow>
          <FormRow label="Урт (м)">
            <Input
              type="number"
              value={height}
              onChange={(event) => setHeight(Number(event.target.value))}
            />
          </FormRow>
          <FormRow label="Орох хаалганы тоо">
            <Input
              type="number"
              value={entranceCount}
              onChange={(event) => setEntranceCount(Number(event.target.value))}
            />
          </FormRow>
          <FormRow label="Гарцын тоо">
            <Input
              type="number"
              value={exitCount}
              onChange={(event) => setExitCount(Number(event.target.value))}
            />
          </FormRow>
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
          <Button onClick={submit}>Танхим үүсгэх</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
