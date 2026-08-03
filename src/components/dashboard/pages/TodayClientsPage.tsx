import { useState } from "react";
import { Phone, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { today } from "@/lib/dashboard/mock-data";
import { AvatarInitials, BookingStatusBadge, EmptyState, PageHeader } from "../ui";
import { BookingDrawer } from "../BookingDrawer";

export function TodayClientsPage() {
  const { session } = useAuth();
  const { employees, bookings } = useDashboardData();
  const me = employees.find((e) => e.name === session?.name);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const list = bookings
    .filter((b) => b.employeeId === me?.id && b.date === today())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-5">
      <PageHeader title="Өнөөдрийн үйлчлүүлэгчид" description="Танд өнөөдөр захиалгатай үйлчлүүлэгчид." />
      {list.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="Өнөөдөр үйлчлүүлэгч алга байна" />
      ) : (
        <div className="space-y-2.5">
          {list.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-surface/80 p-3.5 shadow-sm">
              <AvatarInitials name={b.customerName} className="h-10 w-10" />
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setDrawerId(b.id)}>
                <p className="font-medium">{b.customerName}</p>
                <p className="text-xs text-muted-foreground">{b.startTime} · {b.serviceName}</p>
              </div>
              <a href={`tel:${b.customerPhone.replace(/\s/g, "")}`} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary" aria-label="Дуудлага хийх">
                <Phone className="h-4 w-4" />
              </a>
              <BookingStatusBadge status={b.status} />
            </div>
          ))}
        </div>
      )}
      <BookingDrawer bookingId={drawerId} onOpenChange={setDrawerId} />
    </div>
  );
}
