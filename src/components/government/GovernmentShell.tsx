import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { TanuBusinessLogo, TanuMark } from "@/components/brand/Logo";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useApp } from "@/lib/app-context";
import { useAuth, type AuthSession } from "@/lib/auth-context";
import { useGovernmentData } from "@/lib/government/store";
import {
  governmentPermissionLabel,
  governmentPermissionModules,
  hasGovernmentModuleAccess,
  type GovernmentPermissionPreset,
} from "@/lib/government/types";
import { cn } from "@/lib/utils";
import { GOVERNMENT_GROUPS, GOVERNMENT_NAV, type GovernmentNavItem } from "./government-nav";

const SIDEBAR_KEY = "tanu-government-sidebar-collapsed";
const permissionPresets = Object.keys(governmentPermissionModules) as GovernmentPermissionPreset[];

export function GovernmentShell({ session }: { session: AuthSession }) {
  const { theme, toggleTheme } = useApp();
  const { logout } = useAuth();
  const { activePermission, setActivePermission, departments } = useGovernmentData();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState("all");

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      // Storage is optional.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      // Storage is optional.
    }
  }, [collapsed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo(
    () => GOVERNMENT_NAV.filter((item) => hasGovernmentModuleAccess(activePermission, item.key)),
    [activePermission],
  );

  const activeItem =
    items.find((item) =>
      item.to === "/business/dashboard"
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    ) ?? items[0];

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "min-h-screen bg-background lg:grid lg:transition-[grid-template-columns] lg:duration-200",
          collapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[272px_1fr]",
        )}
      >
        <aside className="hidden border-r border-border bg-surface/65 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
          <GovernmentSidebar
            items={items}
            activeKey={activeItem?.key}
            collapsed={collapsed}
            session={session}
            onSelect={() => undefined}
            onLogout={handleLogout}
            onToggleCollapse={() => setCollapsed((current) => !current)}
          />
        </aside>

        {mobileOpen && (
          <>
            <button
              type="button"
              aria-label="Цэс хаах"
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-[88vw] max-w-[320px] flex-col bg-surface shadow-2xl lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface"
                aria-label="Хаах"
              >
                <X className="h-4 w-4" />
              </button>
              <GovernmentSidebar
                items={items}
                activeKey={activeItem?.key}
                session={session}
                onSelect={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </aside>
          </>
        )}

        <div className="flex min-h-screen min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex h-[62px] items-center gap-3 border-b border-border bg-[color-mix(in_oklch,var(--background)_88%,transparent)] px-4 backdrop-blur-xl sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface lg:hidden"
              aria-label="Цэс"
            >
              <Menu className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-border bg-surface/80 px-3 text-left text-xs text-muted-foreground shadow-sm transition hover:border-[var(--brand)]/35 sm:max-w-sm"
            >
              <Search className="h-4 w-4 shrink-0 group-hover:text-foreground" />
              <span className="hidden truncate sm:block">
                Албан бичиг, даалгавар, ажилтан хайх...
              </span>
              <kbd className="ml-auto hidden rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] lg:inline">
                Ctrl K
              </kbd>
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="hidden h-9 w-52 rounded-lg text-xs xl:flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх хэлтэс, нэгж</SelectItem>
                  {departments
                    .filter((department) => department.level !== "organization")
                    .map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/business/dashboard/government/notifications"
                    className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/80 transition hover:bg-secondary"
                    aria-label="Мэдэгдэл"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--brand-2)]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Мэдэгдэл</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/80 transition hover:bg-secondary"
                    aria-label={theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface/80 pl-1.5 pr-2 transition hover:bg-secondary">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
                      {session.name.charAt(0)}
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-semibold">{session.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{session.email}</p>
                    <span className="mt-2 inline-flex rounded-md bg-brand-soft px-2 py-1 text-[11px] font-medium text-[var(--brand)]">
                      {governmentPermissionLabel[activePermission]}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="h-4 w-4" /> Миний профайл
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Building2 className="h-4 w-4" /> Байгууллагын мэдээлэл
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                    Демо: эрхийн preset солих
                  </DropdownMenuLabel>
                  {permissionPresets.map((permission) => (
                    <DropdownMenuItem
                      key={permission}
                      className="justify-between gap-2"
                      onClick={() => {
                        setActivePermission(permission);
                        navigate({ to: "/business/dashboard" });
                        toast.info(`${governmentPermissionLabel[permission]} эрхээр харж байна`);
                      }}
                    >
                      {governmentPermissionLabel[permission]}
                      {permission === activePermission && (
                        <Check className="h-3.5 w-3.5 text-[var(--brand)]" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Гарах
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 xl:px-7">
            <Outlet />
          </main>
        </div>
      </div>

      <GovernmentGlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </TooltipProvider>
  );
}

function GovernmentSidebar({
  items,
  activeKey,
  collapsed = false,
  session,
  onSelect,
  onLogout,
  onToggleCollapse,
}: {
  items: GovernmentNavItem[];
  activeKey?: string;
  collapsed?: boolean;
  session: AuthSession;
  onSelect: () => void;
  onLogout: () => void;
  onToggleCollapse?: () => void;
}) {
  const { theme } = useApp();
  const { activePermission } = useGovernmentData();

  return (
    <div className="flex h-full min-h-0 flex-col p-3">
      <div className={cn("flex h-10 items-center px-1", collapsed && "justify-center")}>
        {collapsed ? (
          <TanuMark variant="navy" invert={theme === "dark"} className="h-8" />
        ) : (
          <TanuBusinessLogo className="h-9" invert={theme === "dark"} />
        )}
      </div>

      <div
        className={cn(
          "mt-3 overflow-hidden rounded-xl border border-[var(--brand)]/15 bg-[color-mix(in_oklch,var(--brand)_5%,var(--surface))] transition-all",
          collapsed ? "max-h-0 border-transparent p-0 opacity-0" : "max-h-28 p-3 opacity-100",
        )}
      >
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-[var(--brand)]">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="line-clamp-2 text-xs font-semibold leading-4">{session.org}</p>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {governmentPermissionLabel[activePermission]}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        {GOVERNMENT_GROUPS.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group} className="mb-3">
              {!collapsed && (
                <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/75">
                  {group}
                </p>
              )}
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeKey === item.key;
                  const link = (
                    <Link
                      key={item.key}
                      to={item.to}
                      onClick={onSelect}
                      className={cn(
                        "flex w-full items-center rounded-xl py-2 text-left text-[13px] font-medium transition",
                        collapsed ? "justify-center px-0" : "gap-2.5 px-3",
                        active
                          ? "bg-gradient-brand text-white shadow-glow"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                  if (!collapsed) return link;
                  return (
                    <Tooltip key={item.key}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-border/70 pt-2">
        {!collapsed && (
          <button
            type="button"
            onClick={() => toast.info("Тусламжийн төв удахгүй нээгдэнэ")}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            <HelpCircle className="h-4 w-4" /> Тусламж
          </button>
        )}
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            "flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/[0.06] hover:text-destructive",
            collapsed ? "justify-center" : "gap-2.5",
          )}
        >
          <LogOut className="h-4 w-4" /> {!collapsed && "Гарах"}
        </button>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
            {!collapsed && "Хумих"}
          </button>
        )}
      </div>
    </div>
  );
}

function GovernmentGlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { documents, tasks, meetings, employees } = useGovernmentData();
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Албан бичиг, даалгавар, хурал, ажилтан хайх..." />
      <CommandList>
        <CommandEmpty>Илэрц олдсонгүй.</CommandEmpty>
        <CommandGroup heading="Албан бичиг">
          {documents.map((document) => (
            <CommandItem
              key={document.id}
              onSelect={() => go("/business/dashboard/government/documents")}
            >
              {document.number} · {document.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Үүрэг, даалгавар">
          {tasks.map((task) => (
            <CommandItem key={task.id} onSelect={() => go("/business/dashboard/government/tasks")}>
              {task.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Хурал, арга хэмжээ">
          {meetings.map((meeting) => (
            <CommandItem
              key={meeting.id}
              onSelect={() => go("/business/dashboard/government/meetings")}
            >
              {meeting.date} · {meeting.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Ажилтан">
          {employees.map((employee) => (
            <CommandItem
              key={employee.id}
              onSelect={() => go("/business/dashboard/government/directory")}
            >
              {employee.name} · {employee.position}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
