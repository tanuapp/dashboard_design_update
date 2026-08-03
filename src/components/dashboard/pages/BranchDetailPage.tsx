import { useState } from "react";
import { XCircle, MapPin, Phone, Clock } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AvatarInitials, BookingStatusBadge, EmptyState, PageHeader, money } from "../ui";
import { BranchFormModal } from "../BranchFormModal";

export function BranchDetailPage({ branchId }: { branchId: string }) {
  const { branches, employees, services, bookings } = useDashboardData();
  const [formOpen, setFormOpen] = useState(false);
  const branch = branches.find((b) => b.id === branchId);

  if (!branch) return <EmptyState icon={<XCircle className="h-6 w-6" />} title="Салбар олдсонгүй" />;

  const staff = employees.filter((e) => e.branchId === branch.id);
  const branchServices = services.filter((s) => s.branchIds.includes(branch.id));
  const todayBookings = bookings.filter((b) => b.branchId === branch.id && b.date === new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-5">
      <PageHeader
        title={branch.name}
        description={branch.address}
        backTo="/business/dashboard/branches"
        breadcrumb={[{ label: "Салбарууд", to: "/business/dashboard/branches" }, { label: branch.name }]}
        actions={<Button variant="outline" onClick={() => setFormOpen(true)}>Засах</Button>}
      />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">Ерөнхий мэдээлэл</TabsTrigger>
          <TabsTrigger value="hours">Ажлын цаг</TabsTrigger>
          <TabsTrigger value="staff">Ажилтан</TabsTrigger>
          <TabsTrigger value="services">Үйлчилгээ</TabsTrigger>
          <TabsTrigger value="calendar">Календарь</TabsTrigger>
          <TabsTrigger value="stats">Статистик</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Хаяг" value={branch.address} icon={<MapPin className="h-3.5 w-3.5" />} />
            <Field label="Утас" value={branch.phone} icon={<Phone className="h-3.5 w-3.5" />} />
            <Field label="Ажиллах цаг" value={branch.workingHours} icon={<Clock className="h-3.5 w-3.5" />} />
            <Field label="Төлөв" value={branch.active ? "Идэвхтэй" : "Идэвхгүй"} />
          </div>
        </TabsContent>

        <TabsContent value="hours" className="rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"].map((d, i) => (
              <div key={d} className="rounded-lg border border-border/70 bg-surface-muted/40 p-2.5 text-center text-xs">
                <p className="font-semibold">{d}</p>
                <p className="mt-1 text-muted-foreground">{i < 6 ? branch.workingHours : "Амарна"}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-2">
          {staff.length === 0 ? (
            <EmptyState icon={<XCircle className="h-6 w-6" />} title="Энэ салбарт ажилтан алга байна" />
          ) : (
            staff.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface/80 p-3 shadow-sm">
                <AvatarInitials name={e.name} className="h-9 w-9 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.position}</p>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-2">
          {branchServices.length === 0 ? (
            <EmptyState icon={<XCircle className="h-6 w-6" />} title="Энэ салбарт үйлчилгээ алга байна" />
          ) : (
            branchServices.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/80 p-3 text-sm shadow-sm">
                <span>{s.name}</span>
                <span className="font-semibold">{money(s.price)}</span>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-2">
          {todayBookings.length === 0 ? (
            <EmptyState icon={<XCircle className="h-6 w-6" />} title="Өнөөдөр захиалга алга байна" />
          ) : (
            todayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/80 p-3 text-sm shadow-sm">
                <span>{b.startTime} · {b.customerName} — {b.serviceName}</span>
                <BookingStatusBadge status={b.status} />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="stats" className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Ажилтны тоо</p>
            <p className="mt-1 text-2xl font-bold">{staff.length}</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Өнөөдрийн захиалга</p>
            <p className="mt-1 text-2xl font-bold">{todayBookings.length}</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Сарын орлого</p>
            <p className="mt-1 text-2xl font-bold">{money(branch.monthlyRevenue)}</p>
          </div>
        </TabsContent>
      </Tabs>

      <BranchFormModal open={formOpen} onOpenChange={setFormOpen} branch={branch} />
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">{icon}{value}</p>
    </div>
  );
}
