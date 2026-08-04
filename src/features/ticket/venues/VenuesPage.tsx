import { useState } from "react";
import {
  Archive,
  Building2,
  Copy,
  Eye,
  FileUp,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, EmptyState, ConfirmDialog, FormRow } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganization } from "@/lib/organization-context";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";
import {
  formatTicketDateTime,
  TicketPanel,
  TicketStatusBadge,
} from "@/features/ticket/components/TicketUI";

const facilityOptions = [
  "Зогсоол",
  "Тэргэнцэртэй иргэний зам",
  "Ариун цэврийн өрөө",
  "Хоол, ундаа",
  "VIP орц",
  "Хамгаалалтын өрөө",
  "Эмнэлгийн өрөө",
];

export function VenuesPage() {
  const data = useTicketData();
  const { selectedOrganization } = useOrganization();
  const [createOpen, setCreateOpen] = useState(false);
  const [archiveId, setArchiveId] = useState<string>();
  const archive = () => {
    if (!archiveId) return;
    try {
      data.archiveVenue(archiveId);
      toast.success("Байршил архивлагдлаа");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Архивласангүй");
    }
    setArchiveId(undefined);
  };
  const duplicate = (venueId: string) => {
    try {
      data.duplicateVenue(venueId);
      toast.success("Байршлын хуулбар үүслээ");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Хуулбарласангүй");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Байршил ба суудал"
        description="Арга хэмжээ зохион байгуулах газар, танхим болон суудлын зураглалыг удирдана."
        actions={
          <>
            {data.can("ticket.venues.manage") && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus /> Байршил нэмэх
              </Button>
            )}
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs hover:bg-accent">
              <FileUp className="h-4 w-4" /> Зураглал импортлох
              <input
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={(event) =>
                  event.target.files?.[0] &&
                  toast.success(`${event.target.files[0].name} файл шалгагдлаа`, {
                    description: "Импортын schema adapter дараагийн phase-д холбогдоно.",
                  })
                }
              />
            </label>
          </>
        }
      />
      {data.venues.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Байршил үүсгээгүй байна"
          description="Эхний байршлаа үүсгээд танхим, зураглал нэмнэ үү."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus /> Байршил нэмэх
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.venues.map((venue) => {
            const halls = data.halls.filter((hall) => hall.venueId === venue.id);
            const capacity = halls.reduce((sum, hall) => sum + hall.capacity, 0);
            return (
              <TicketPanel key={venue.id} className="p-0 sm:p-0">
                <div className="h-24 bg-gradient-brand p-4 text-white">
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
                      <Building2 className="h-5 w-5" />
                    </span>
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
                </div>
                <div className="p-4">
                  <h2 className="font-bold">{venue.name}</h2>
                  <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {venue.address}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-surface-muted/40 p-3 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Танхим</p>
                      <p className="font-bold">{halls.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Нийт багтаамж</p>
                      <p className="font-bold">{capacity.toLocaleString("mn-MN")}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-muted-foreground">
                      Шинэчилсэн: {formatTicketDateTime(venue.updatedAt)}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            to="/business/dashboard/ticket/$organizationId/venues/$venueId"
                            params={{ organizationId: selectedOrganization.id, venueId: venue.id }}
                          >
                            <Eye /> Дэлгэрэнгүй
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to="/business/dashboard/ticket/$organizationId/venues/$venueId"
                            params={{ organizationId: selectedOrganization.id, venueId: venue.id }}
                          >
                            <Pencil /> Засах
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicate(venue.id)}>
                          <Copy /> Хуулах
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setArchiveId(venue.id)}
                        >
                          <Archive /> Архивлах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </TicketPanel>
            );
          })}
        </div>
      )}
      <CreateVenueDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ConfirmDialog
        open={Boolean(archiveId)}
        onOpenChange={(open) => !open && setArchiveId(undefined)}
        title="Байршил архивлах уу?"
        description="Идэвхтэй арга хэмжээтэй байршлыг архивлах боломжгүй. Түүхэн захиалгын мэдээлэл өөрчлөгдөхгүй."
        confirmLabel="Архивлах"
        destructive
        onConfirm={archive}
      />
    </div>
  );
}

function CreateVenueDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = useTicketData();
  const [name, setName] = useState("");
  const [city, setCity] = useState("Улаанбаатар");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState<string[]>([]);
  const submit = () => {
    try {
      data.createVenue({ name, city, district, address, phone, email, description, facilities });
      toast.success("Шинэ байршил үүслээ");
      onOpenChange(false);
      setName("");
      setAddress("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Байршил үүссэнгүй");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Байршил нэмэх</DialogTitle>
          <DialogDescription>
            Үндсэн мэдээлэл болон боломжит байгууламжуудыг бүртгэнэ.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Байршлын нэр">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormRow>
          <FormRow label="Хот">
            <Input value={city} onChange={(event) => setCity(event.target.value)} />
          </FormRow>
          <FormRow label="Дүүрэг">
            <Input value={district} onChange={(event) => setDistrict(event.target.value)} />
          </FormRow>
          <FormRow label="Хаяг">
            <Input value={address} onChange={(event) => setAddress(event.target.value)} />
          </FormRow>
          <FormRow label="Холбоо барих утас">
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </FormRow>
          <FormRow label="И-мэйл">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow label="Тайлбар">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </FormRow>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Байгууламж</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {facilityOptions.map((facility) => (
                <label
                  key={facility}
                  className="flex items-center gap-2 rounded-xl border border-border p-3 text-xs"
                >
                  <Checkbox
                    checked={facilities.includes(facility)}
                    onCheckedChange={(checked) =>
                      setFacilities((current) =>
                        checked
                          ? [...current, facility]
                          : current.filter((item) => item !== facility),
                      )
                    }
                  />{" "}
                  {facility}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Cover зураг upload placeholder · Frontend local preview
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Болих
          </Button>
          <Button onClick={submit}>Байршил үүсгэх</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
