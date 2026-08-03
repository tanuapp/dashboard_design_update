import { useState } from "react";
import { toast } from "sonner";
import { Phone, Copy, Mail, Star, Tag, StickyNote, Plus, CalendarPlus } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge, formatDate, money } from "./ui";
import { AddBookingModal } from "./AddBookingModal";

export function CustomerDrawer({
  customerId,
  onOpenChange,
}: {
  customerId: string | null;
  onOpenChange: (id: string | null) => void;
}) {
  const { customers, services, bookings, addCustomerNote, addCustomerTag, updateCustomer } = useDashboardData();
  const customer = customers.find((c) => c.id === customerId) ?? null;
  const [noteDraft, setNoteDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  const history = customer ? bookings.filter((b) => b.customerId === customer.id).sort((a, b) => (a.date < b.date ? 1 : -1)) : [];
  const favoriteServices = customer ? services.filter((s) => customer.favoriteServiceIds.includes(s.id)) : [];
  const cancellations = history.filter((b) => b.status === "cancelled");

  return (
    <Sheet open={!!customer} onOpenChange={(v) => !v && onOpenChange(null)}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {customer && (
        <>
        <SheetHeader>
          <SheetTitle>{customer.name}</SheetTitle>
          <SheetDescription>Хэрэглэгчийн дэлгэрэнгүй мэдээлэл</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <section className="flex flex-wrap gap-1.5">
            {customer.tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1"><Tag className="h-3 w-3" />{t}</Badge>
            ))}
          </section>

          <section className="rounded-xl border border-border/70 bg-surface-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {customer.phone}</span>
              <div className="flex gap-1">
                <button
                  aria-label="Утас хуулах"
                  className="rounded p-1 hover:bg-secondary"
                  onClick={() => { navigator.clipboard?.writeText(customer.phone).catch(() => {}); toast.success("Утас хуулагдлаа"); }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="rounded p-1 hover:bg-secondary" aria-label="Дуудлага хийх">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {customer.email}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Нийт захиалга" value={customer.totalBookings} />
            <Stat label="Дууссан" value={customer.completedBookings} />
            <Stat label="Цуцалсан" value={customer.cancelledBookings} />
            <Stat label="Нийт зарцуулсан" value={money(customer.totalSpend)} />
            <Stat label="Урамшууллын оноо" value={customer.loyaltyPoints} />
            <Stat label="Сүүлд ирсэн" value={formatDate(customer.lastVisit)} />
          </section>

          <section className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
            <span className="text-xs font-medium">Мэдэгдэл хүлээн авах</span>
            <Switch checked={customer.notificationOptIn} onCheckedChange={(v) => updateCustomer(customer.id, { notificationOptIn: v })} />
          </section>

          {favoriteServices.length > 0 && (
            <section>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Дуртай үйлчилгээ</p>
              <div className="flex flex-wrap gap-1.5">
                {favoriteServices.map((s) => <Badge key={s.id} variant="outline">{s.name}</Badge>)}
              </div>
            </section>
          )}

          <section>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Захиалгын түүх</p>
              {cancellations.length > 0 && <span className="text-xs text-destructive">{cancellations.length} цуцлагдсан</span>}
            </div>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">Захиалгын түүх алга байна.</p>
              ) : (
                history.slice(0, 10).map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg bg-surface-muted/40 px-2.5 py-1.5 text-xs">
                    <span>{formatDate(b.date)} · {b.serviceName}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><StickyNote className="h-3.5 w-3.5" /> Тэмдэглэл</p>
            <div className="mb-2 max-h-32 space-y-1.5 overflow-y-auto">
              {customer.notes.map((n) => (
                <div key={n.id} className="rounded-lg bg-surface-muted/40 px-2.5 py-1.5 text-xs">
                  <p>{n.text}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(n.at.slice(0, 10))}</p>
                </div>
              ))}
            </div>
            <Textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Шинэ тэмдэглэл нэмэх..." className="min-h-16" />
            <Button
              size="sm"
              variant="outline"
              className="mt-2 rounded-lg"
              disabled={!noteDraft.trim()}
              onClick={() => { addCustomerNote(customer.id, noteDraft.trim()); setNoteDraft(""); toast.success("Тэмдэглэл нэмэгдлээ"); }}
            >
              Тэмдэглэл нэмэх
            </Button>
          </section>

          <section>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Шошго нэмэх</p>
            <div className="flex gap-2">
              <Input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="Жишээ: VIP" className="h-9" />
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                disabled={!tagDraft.trim()}
                onClick={() => { addCustomerTag(customer.id, tagDraft.trim()); setTagDraft(""); toast.success("Шошго нэмэгдлээ"); }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </section>

          <section className="border-t border-border/70 pt-4">
            <Button className="w-full gap-1.5 rounded-lg" onClick={() => setBookingOpen(true)}>
              <CalendarPlus className="h-4 w-4" /> Захиалга үүсгэх
            </Button>
          </section>
        </div>
        </>
        )}
      </SheetContent>

      <AddBookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface-muted/40 p-2.5">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
