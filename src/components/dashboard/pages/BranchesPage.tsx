import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Building2,
  GitFork,
  List,
  MapPin,
  Minus,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard/store";
import type { Branch } from "@/lib/dashboard/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { EmptyState, PageHeader, money } from "../ui";
import { BranchFormModal } from "../BranchFormModal";

type ViewMode = "hierarchy" | "list";

export function BranchesPage() {
  const { branches, employees, orgProfile, updateBranch } = useDashboardData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchy");
  const [zoom, setZoom] = useState(100);

  const assignedEmployeeIds = useMemo(
    () =>
      new Set(
        branches.flatMap((branch) => [
          ...branch.employeeIds,
          ...employees
            .filter((employee) => employee.branchId === branch.id)
            .map((employee) => employee.id),
        ]),
      ),
    [branches, employees],
  );

  const unassignedEmployeeCount = employees.filter(
    (employee) => !assignedEmployeeIds.has(employee.id),
  ).length;

  const openCreateForm = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEditForm = (branch: Branch) => {
    setEditing(branch);
    setFormOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Салбарын бүтэц"
        description="Байгууллагын салбаруудын бүтэц, ажилтны хуваарилалтыг нэг дороос удирдана."
        breadcrumb={[{ label: "Нүүр", to: "/business/dashboard" }, { label: "Салбарууд" }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode("hierarchy")}
            className={cn(
              "relative flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
              viewMode === "hierarchy"
                ? "bg-brand-soft text-[var(--brand-2)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <GitFork className="h-4 w-4" />
            Шатлал
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
              viewMode === "list"
                ? "bg-brand-soft text-[var(--brand-2)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <List className="h-4 w-4" />
            Жагсаалт
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-surface/60 px-3 text-xs">
            <span className="text-muted-foreground">Салбаргүй ажилтан</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
              {unassignedEmployeeCount}
            </span>
          </div>
          <Button onClick={openCreateForm} className="h-9 gap-1.5 rounded-lg">
            <Plus className="h-4 w-4" />
            Салбар нэмэх
          </Button>
        </div>
      </div>

      {branches.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Салбар алга байна"
          description="Байгууллагын бүтцийг үүсгэхийн тулд эхний салбараа нэмнэ үү."
          action={
            <Button onClick={openCreateForm} className="gap-1.5 rounded-lg">
              <Plus className="h-4 w-4" />
              Салбар нэмэх
            </Button>
          }
        />
      ) : viewMode === "hierarchy" ? (
        <section className="relative min-h-[610px] overflow-hidden rounded-2xl border border-border/80 bg-surface/70 shadow-sm">
          <div className="absolute top-4 right-4 z-20 flex items-center rounded-xl border border-border/70 bg-background/90 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setZoom((current) => Math.max(70, current - 10))}
              disabled={zoom === 70}
              aria-label="Жижигрүүлэх"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-xs font-bold tabular-nums">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((current) => Math.min(130, current + 10))}
              disabled={zoom === 130}
              aria-label="Томруулах"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="h-full min-h-[610px] overflow-auto px-8 pt-8 pb-12">
            <div
              className="mx-auto flex origin-top flex-col items-center transition-transform duration-200"
              style={{
                minWidth: Math.max(760, branches.length * 284 + 80),
                transform: `scale(${zoom / 100})`,
              }}
            >
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-[color-mix(in_oklch,var(--brand)_20%,transparent)]">
                <Building2 className="h-7 w-7" />
              </div>
              <p className="mt-2 max-w-72 truncate text-center text-sm font-extrabold">
                {orgProfile.name}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{orgProfile.businessType}</p>

              <div className="h-8 w-px bg-border" />

              <div className="w-72 rounded-xl border border-border/80 bg-background p-4 text-center shadow-md">
                <p className="text-xs font-bold tracking-wide">САЛБАРЫН УДИРДЛАГА</p>
                <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {branches.length} салбар
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {employees.length} ажилтан
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="relative">
                {branches.length > 1 && (
                  <div className="absolute top-0 right-32 left-32 h-px bg-border" />
                )}
                <div className="flex items-start gap-7">
                  {branches.map((branch) => {
                    const branchEmployees = employees.filter(
                      (employee) =>
                        employee.branchId === branch.id || branch.employeeIds.includes(employee.id),
                    );
                    const adminCount = branchEmployees.filter(
                      (employee) => employee.role === "owner" || employee.role === "admin",
                    ).length;
                    const staffCount = branchEmployees.filter(
                      (employee) => employee.role === "employee",
                    ).length;

                    return (
                      <div key={branch.id} className="w-64 shrink-0">
                        <div className="mx-auto h-5 w-px bg-border" />
                        <article
                          className={cn(
                            "relative min-h-40 rounded-xl border border-border/80 bg-background p-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg",
                            !branch.active && "opacity-60",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => openEditForm(branch)}
                            aria-label={`${branch.name} засах`}
                            className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <div className="pr-8">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2 w-2 shrink-0 rounded-full",
                                  branch.active ? "bg-[var(--success)]" : "bg-muted-foreground/40",
                                )}
                              />
                              <Link
                                to="/business/dashboard/branches/$branchId"
                                params={{ branchId: branch.id }}
                                className="truncate text-sm font-bold hover:text-[var(--brand)] hover:underline"
                              >
                                {branch.name}
                              </Link>
                            </div>
                            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-muted-foreground">
                              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                              <span className="line-clamp-2">{branch.address}</span>
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                            {adminCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold">
                                <ShieldCheck className="h-3 w-3" />
                                {adminCount} админ
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold">
                              <Users className="h-3 w-3" />
                              {staffCount} ажилтан
                            </span>
                          </div>

                          <div className="mt-3 border-t border-border/60 pt-2 text-center">
                            <Link
                              to="/business/dashboard/branches/$branchId"
                              params={{ branchId: branch.id }}
                              className="text-[11px] font-semibold text-[var(--brand)] hover:underline"
                            >
                              Дэлгэрэнгүй харах
                            </Link>
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={cn(
                "rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft",
                !branch.active && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{branch.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {branch.address}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {branch.phone}
                  </p>
                </div>
                <Switch
                  checked={branch.active}
                  onCheckedChange={(active) => {
                    updateBranch(branch.id, { active });
                    toast.success(active ? "Салбар идэвхжлээ" : "Салбар идэвхгүй боллоо");
                  }}
                  aria-label="Идэвхтэй эсэх"
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-surface-muted/50 p-2">
                  <p className="font-bold">{branch.employeeIds.length}</p>
                  <p className="text-muted-foreground">Ажилтан</p>
                </div>
                <div className="rounded-lg bg-surface-muted/50 p-2">
                  <p className="font-bold">{branch.todayBookings}</p>
                  <p className="text-muted-foreground">Өнөөдөр</p>
                </div>
                <div className="rounded-lg bg-surface-muted/50 p-2">
                  <p className="truncate font-bold">{money(branch.monthlyRevenue)}</p>
                  <p className="text-muted-foreground">Сарын орлого</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1 rounded-lg">
                  <Link
                    to="/business/dashboard/branches/$branchId"
                    params={{ branchId: branch.id }}
                  >
                    Дэлгэрэнгүй
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => openEditForm(branch)}
                >
                  Засах
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BranchFormModal open={formOpen} onOpenChange={setFormOpen} branch={editing} />
    </div>
  );
}
