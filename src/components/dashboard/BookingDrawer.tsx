import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Phone,
  Copy,
  Clock,
  Wallet,
  StickyNote,
  Info,
  Ban,
  Repeat2,
  CalendarClock,
  Tag,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { bookingSourceLabel, bookingStatusLabel, type BookingStatus } from "@/lib/dashboard/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge, PaymentStateBadge, ConfirmDialog, money, formatDate } from "./ui";

const STATUS_OPTIONS: BookingStatus[] = [
  "upcoming",
  "arrived",
  "in-service",
  "completed",
  "cancelled",
  "no-show",
];

export function BookingDrawer({
  bookingId,
  onOpenChange,
}: {
  bookingId: string | null;
  onOpenChange: (id: string | null) => void;
}) {
  const {
    bookings,
    employees,
    changeBookingStatus,
    reassignBookingEmployee,
    rescheduleBooking,
    addBookingInternalNote,
    cancelBooking,
  } = useDashboardData();
  const booking = bookings.find((b) => b.id === bookingId) ?? null;

  const [noteDraft, setNoteDraft] = useState("");
  const [timeDraft, setTimeDraft] = useState({ date: "", time: "" });
  const [editingTime, setEditingTime] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (booking) {
      setNoteDraft(booking.internalNote ?? "");
      setTimeDraft({ date: booking.date, time: booking.startTime });
      setEditingTime(false);
    }
  }, [booking?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableEmployees = booking
    ? employees.filter(
        (e) => e.serviceIds.includes(booking.serviceId) || e.id === booking.employeeId,
      )
    : [];

  return (
    <Sheet open={!!booking} onOpenChange={(v) => !v && onOpenChange(null)}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {booking && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{booking.code}</SheetTitle>
                <BookingStatusBadge status={booking.status} />
              </div>
              <SheetDescription>
                {formatDate(booking.date)} · {booking.startTime}–{booking.endTime}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-5 space-y-5">
              <section className="rounded-xl border border-border/70 bg-surface-muted/40 p-4">
                <p className="text-sm font-semibold">{booking.customerName}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {booking.customerPhone}
                  <button
                    type="button"
                    aria-label="Утасны дугаар хуулах"
                    className="ml-1 rounded p-1 hover:bg-secondary"
                    onClick={() => {
                      navigator.clipboard?.writeText(booking.customerPhone).catch(() => {});
                      toast.success("Утасны дугаар хуулагдлаа");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                {booking.customerNote && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <Info className="mr-1 inline h-3 w-3" /> {booking.customerNote}
                  </p>
                )}
              </section>

              <section className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Үйлчилгээ</p>
                  <p className="font-medium">{booking.serviceName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ажилтан</p>
                  <p className="font-medium">{booking.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Салбар</p>
                  <p className="font-medium">{booking.branchName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Эх сурвалж</p>
                  <p className="font-medium">{bookingSourceLabel[booking.source]}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold">{money(booking.price)}</span>
                </div>
                <div>
                  <PaymentStateBadge state={booking.paymentState} />
                </div>
              </section>

              <section>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Төлөв өөрчлөх</p>
                <Select
                  value={booking.status}
                  onValueChange={(v) => changeBookingStatus(booking.id, v as BookingStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {bookingStatusLabel[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Ажилтан солих</p>
                <Select
                  value={booking.employeeId}
                  onValueChange={(v) => {
                    const emp = employees.find((e) => e.id === v);
                    if (emp) reassignBookingEmployee(booking.id, emp.id, emp.name);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} · {e.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Цаг өөрчлөх</p>
                  {!editingTime && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] hover:underline"
                      onClick={() => setEditingTime(true)}
                    >
                      <CalendarClock className="h-3.5 w-3.5" /> Засах
                    </button>
                  )}
                </div>
                {editingTime ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="date"
                      value={timeDraft.date}
                      onChange={(e) => setTimeDraft((p) => ({ ...p, date: e.target.value }))}
                      className="w-auto"
                    />
                    <Input
                      type="time"
                      value={timeDraft.time}
                      onChange={(e) => setTimeDraft((p) => ({ ...p, time: e.target.value }))}
                      className="w-auto"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        rescheduleBooking(booking.id, timeDraft.date, timeDraft.time);
                        setEditingTime(false);
                        toast.success("Захиалгын цаг шинэчлэгдлээ");
                      }}
                    >
                      Хадгалах
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingTime(false)}>
                      Болих
                    </Button>
                  </div>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                    {formatDate(booking.date)}, {booking.startTime}–{booking.endTime}
                  </p>
                )}
              </section>

              <section>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <StickyNote className="h-3.5 w-3.5" /> Дотоод тэмдэглэл
                </p>
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Зөвхөн багийнхаа хардаг дотоод тэмдэглэл..."
                  className="min-h-20"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 rounded-lg"
                  disabled={noteDraft === (booking.internalNote ?? "")}
                  onClick={() => {
                    addBookingInternalNote(booking.id, noteDraft);
                    toast.success("Тэмдэглэл хадгалагдлаа");
                  }}
                >
                  Тэмдэглэл хадгалах
                </Button>
              </section>

              {booking.history.length > 0 && (
                <section>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Repeat2 className="h-3.5 w-3.5" /> Захиалгын түүх
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {booking.history.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Tag className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{h.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="flex flex-wrap gap-2 border-t border-border/70 pt-4">
                <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" asChild>
                  <a href={`tel:${booking.customerPhone.replace(/\s/g, "")}`}>
                    <Phone className="h-3.5 w-3.5" /> Холбогдох
                  </a>
                </Button>
                {booking.status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 rounded-lg text-destructive hover:bg-destructive/[0.06] hover:text-destructive"
                    onClick={() => setConfirmCancel(true)}
                  >
                    <Ban className="h-3.5 w-3.5" /> Захиалга цуцлах
                  </Button>
                )}
              </section>
            </div>

            <ConfirmDialog
              open={confirmCancel}
              onOpenChange={setConfirmCancel}
              title="Захиалгыг цуцлах уу?"
              description={`${booking.customerName} — ${booking.serviceName} захиалгыг цуцлахдаа итгэлтэй байна уу?`}
              confirmLabel="Цуцлах"
              destructive
              onConfirm={() => {
                cancelBooking(booking.id);
                toast.success("Захиалга цуцлагдлаа");
                setConfirmCancel(false);
              }}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
