import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, LayoutList, Star } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import type { Service } from "@/lib/dashboard/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog, EmptyState, PageHeader, money } from "../ui";
import { ServiceFormModal } from "../ServiceFormModal";
import { cn } from "@/lib/utils";

export function ServicesPage() {
  const {
    services,
    serviceCategories,
    employees,
    addServiceCategory,
    duplicateService,
    toggleServiceActive,
    deleteService,
  } = useDashboardData();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const filtered = useMemo(
    () =>
      categoryFilter === "all" ? services : services.filter((s) => s.categoryId === categoryFilter),
    [services, categoryFilter],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Үйлчилгээнүүд"
        description="Байгууллагын санал болгож буй үйлчилгээ, ангилал, үнийг удирдана."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="gap-1.5 rounded-lg"
          >
            <Plus className="h-4 w-4" /> Үйлчилгээ нэмэх
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition",
            categoryFilter === "all"
              ? "bg-gradient-brand text-white"
              : "border border-border hover:bg-secondary",
          )}
        >
          Бүгд ({services.length})
        </button>
        {serviceCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              categoryFilter === c.id
                ? "bg-gradient-brand text-white"
                : "border border-border hover:bg-secondary",
            )}
          >
            {c.name} ({services.filter((s) => s.categoryId === c.id).length})
          </button>
        ))}
        <div className="flex items-center gap-1.5">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Шинэ ангилал"
            className="h-8 w-32 text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs"
            onClick={() => {
              if (!newCategory.trim()) return;
              addServiceCategory(newCategory.trim());
              toast.success("Ангилал нэмэгдлээ");
              setNewCategory("");
            }}
          >
            <Plus className="h-3.5 w-3.5" /> Ангилал
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutList className="h-6 w-6" />}
          title="Үйлчилгээ олдсонгүй"
          description="Энэ ангилалд одоогоор үйлчилгээ алга байна."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => {
            const category = serviceCategories.find((c) => c.id === s.categoryId);
            const assigned = employees.filter((e) => s.employeeIds.includes(e.id));
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-2xl border border-border/80 bg-surface/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft",
                  !s.active && "opacity-60",
                )}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{category?.name}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md hover:bg-secondary"
                          aria-label="Нэмэлт үйлдэл"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(s);
                            setFormOpen(true);
                          }}
                        >
                          Засах
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            duplicateService(s.id);
                            toast.success("Үйлчилгээ хуулагдлаа");
                          }}
                        >
                          Хуулбарлах
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(s);
                            setFormOpen(true);
                          }}
                        >
                          Ажилтан хуваарилах
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            toggleServiceActive(s.id);
                            toast.success(s.active ? "Идэвхгүй болголоо" : "Идэвхжүүллээ");
                          }}
                        >
                          {s.active ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setConfirmDelete(s)}
                        >
                          Устгах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{s.durationMin} мин</span>
                    <span className="font-semibold">{money(s.price)}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> {s.rating} ·{" "}
                    {s.bookingCount} захиалга
                  </div>

                  {assigned.length > 0 && (
                    <div className="mt-3 flex -space-x-2">
                      {assigned.slice(0, 4).map((e) => (
                        <div
                          key={e.id}
                          title={e.name}
                          className="grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-gradient-brand text-[10px] font-bold text-white"
                        >
                          {e.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-xs text-muted-foreground">
                      {s.onlineBooking ? "Online захиалгатай" : "Зөвхөн гараар"}
                    </span>
                    <Switch
                      checked={s.active}
                      onCheckedChange={() => toggleServiceActive(s.id)}
                      aria-label="Идэвхтэй эсэх"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ServiceFormModal open={formOpen} onOpenChange={setFormOpen} service={editing} />
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Үйлчилгээг устгах уу?"
        description={`"${confirmDelete?.name}" үйлчилгээг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.`}
        confirmLabel="Устгах"
        destructive
        onConfirm={() => {
          if (confirmDelete) {
            deleteService(confirmDelete.id);
            toast.success("Үйлчилгээ устгагдлаа");
          }
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}
