import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Menu,
  X,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  HelpCircle,
  ChevronDown,
  Check,
  MoreHorizontal,
  User,
  Building,
  CalendarClock,
  ClipboardList,
  Users,
  LayoutList,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { useAuth, type AuthSession } from "@/lib/auth-context";
import { useDashboardData } from "@/lib/dashboard/store";
import { CHAT_UNREAD_EVENT, INITIAL_CHAT_UNREAD_COUNT } from "@/lib/dashboard/chat-state";
import type { BusinessRole } from "@/lib/dashboard/types";
import { roleLabel } from "./nav-config";
import { TanuBusinessLogo, TanuMark } from "@/components/brand/Logo";
import { MessengerMenu } from "@/components/dashboard/MessengerMenu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/lib/organization-context";
import { resolveBusinessModules, type ResolvedBusinessModule } from "@/lib/module-registry";
import { OrganizationSwitcher } from "@/components/dashboard/OrganizationSwitcher";
import { useTicketData } from "@/features/ticket/data/TicketDataProvider";

const SIDEBAR_KEY = "tanu-dashboard-sidebar-collapsed";

function ticketRoleLabel(role: string) {
  const labels: Record<string, string> = {
    owner: "Эзэмшигч",
    admin: "Админ",
    event_manager: "Арга хэмжээний менежер",
    venue_manager: "Байршлын менежер",
    gate_staff: "Хаалганы ажилтан",
    scanner_staff: "QR шалгагч",
    report_viewer: "Тайлан харах эрх",
  };
  return labels[role] ?? role;
}

export function DashboardShell({ session }: { session: AuthSession }) {
  const { theme, toggleTheme } = useApp();
  const { logout } = useAuth();
  const {
    viewRole,
    setViewRole,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useDashboardData();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedOrganization, businessType, currentMembership } = useOrganization();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(INITIAL_CHAT_UNREAD_COUNT);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const updateChatUnreadCount = (event: Event) => {
      setChatUnreadCount((event as CustomEvent<number>).detail);
    };
    window.addEventListener(CHAT_UNREAD_EVENT, updateChatUnreadCount);
    return () => window.removeEventListener(CHAT_UNREAD_EVENT, updateChatUnreadCount);
  }, []);

  const items = useMemo(
    () =>
      resolveBusinessModules({
        businessType,
        organizationId: selectedOrganization.id,
        membership: currentMembership,
        serviceRole: viewRole,
      }),
    [businessType, currentMembership, selectedOrganization.id, viewRole],
  );
  const activeItem =
    items.find((i) =>
      i.to === "/business/dashboard"
        ? location.pathname === i.to
        : location.pathname.startsWith(i.to),
    ) ?? items[0];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const select = () => setMobileOpen(false);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "min-h-screen bg-background lg:grid lg:transition-[grid-template-columns] lg:duration-200 lg:ease-in-out",
          collapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[260px_1fr]",
        )}
      >
        {/* Desktop sidebar */}
        <aside className="hidden border-r border-border bg-surface/60 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:transition-[width] lg:duration-200 lg:ease-in-out">
          <SidebarContent
            items={items}
            activeKey={activeItem?.key}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            session={session}
            onLogout={handleLogout}
            onSelect={select}
          />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 240 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-xs flex-col bg-surface lg:hidden"
              >
                <div className="flex items-center justify-end p-3">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-md border border-border"
                    aria-label="Хаах"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <SidebarContent
                  items={items}
                  activeKey={activeItem?.key}
                  collapsed={false}
                  session={session}
                  onLogout={handleLogout}
                  onSelect={select}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main column */}
        <div className="flex min-h-screen min-w-0 flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-[color-mix(in_oklch,var(--background)_88%,transparent)] px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface/70 lg:hidden"
                aria-label="Цэс"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="hidden sm:block">
                <OrganizationSwitcher />
              </div>
              <div className="sm:hidden">
                <OrganizationSwitcher compact />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={
                  businessType === "ticket"
                    ? "Захиалга, арга хэмжээ, байршил хайх"
                    : "Захиалга, хэрэглэгч, ажилтан, үйлчилгээ хайх"
                }
                className="group flex h-9 w-9 shrink-0 items-center gap-2.5 rounded-lg border border-border bg-surface/75 px-2.5 text-left text-xs text-muted-foreground shadow-sm transition hover:border-[var(--brand)]/30 hover:bg-surface sm:w-full sm:max-w-xs sm:flex-1 sm:px-3"
              >
                <Search className="h-4 w-4 shrink-0 transition group-hover:text-foreground" />
                <span className="hidden min-w-0 flex-1 truncate sm:block">
                  {businessType === "ticket"
                    ? "Захиалга, арга хэмжээ, байршил хайх..."
                    : "Захиалга, хэрэглэгч, ажилтан, үйлчилгээ хайх..."}
                </span>
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Branch selector — hidden on narrow screens, folded into overflow menu */}
              {businessType === "service" && (
                <div className="hidden md:block">
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                    <SelectTrigger
                      className="h-9 w-44 gap-1.5 rounded-lg text-xs"
                      aria-label="Салбар сонгох"
                    >
                      <SelectValue placeholder="Бүх салбар" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Бүх салбар</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {businessType === "service" && <MessengerMenu unreadCount={chatUnreadCount} />}

              {businessType === "service" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label={`Мэдэгдэл (${unreadCount} уншаагүй)`}
                      className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/70 transition hover:bg-secondary"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-0">
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <p className="text-sm font-semibold">Мэдэгдэл</p>
                      {unreadCount > 0 && (
                        <button
                          className="text-xs font-medium text-[var(--brand)] hover:underline"
                          onClick={markAllNotificationsRead}
                        >
                          Бүгдийг уншсан
                        </button>
                      )}
                    </div>
                    <DropdownMenuSeparator className="m-0" />
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                          Мэдэгдэл алга байна
                        </p>
                      )}
                      {notifications.slice(0, 6).map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className="flex flex-col items-start gap-0.5 whitespace-normal px-3 py-2.5"
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.link) navigate({ to: n.link });
                          }}
                        >
                          <span className="flex w-full items-center gap-1.5 text-xs font-semibold">
                            {!n.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                            )}
                            {n.title}
                          </span>
                          <span className="text-xs text-muted-foreground">{n.body}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="m-0" />
                    <DropdownMenuItem
                      asChild
                      className="justify-center py-2.5 text-xs font-medium text-[var(--brand)]"
                    >
                      <Link to="/business/dashboard/notifications">Бүгдийг харах</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    aria-label={theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/70 transition hover:bg-secondary"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === "dark" ? "Гэрэлтэй горим" : "Харанхуй горим"}
                </TooltipContent>
              </Tooltip>

              {/* Overflow menu for the branch selector on narrow screens */}
              {businessType === "service" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Нэмэлт үйлдэл"
                      className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface/70 transition hover:bg-secondary md:hidden"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="mb-1 text-xs text-muted-foreground">Салбар</p>
                      <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Бүх салбар" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Бүх салбар</SelectItem>
                          {branches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg border border-border bg-surface/70 py-1.5 pl-1.5 pr-2 transition hover:bg-secondary">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
                      {session.name.charAt(0)}
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-semibold">{session.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedOrganization.name} ·{" "}
                      {businessType === "service"
                        ? roleLabel[viewRole]
                        : ticketRoleLabel(currentMembership.role)}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="gap-2">
                    <Link to="/business/dashboard/profile">
                      <User className="h-4 w-4" /> Миний профайл
                    </Link>
                  </DropdownMenuItem>
                  {businessType === "service" && (viewRole === "owner" || viewRole === "admin") && (
                    <DropdownMenuItem asChild className="gap-2">
                      <Link to="/business/dashboard/org-profile">
                        <Building className="h-4 w-4" /> Байгууллагын профайл
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {businessType === "service" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[11px] font-normal uppercase tracking-wide text-muted-foreground">
                        Демо: харах эрх сэлгэх
                      </DropdownMenuLabel>
                      {(["owner", "admin", "employee"] as BusinessRole[]).map((r) => (
                        <DropdownMenuItem
                          key={r}
                          className="justify-between gap-2"
                          onClick={() => {
                            setViewRole(r);
                            navigate({ to: "/business/dashboard" });
                            toast.info(`Одоо "${roleLabel[r]}" эрхээр харж байна`);
                          }}
                        >
                          {roleLabel[r]}
                          {viewRole === r && <Check className="h-3.5 w-3.5 text-[var(--brand)]" />}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
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

          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
            <Outlet />
          </main>
        </div>
      </div>

      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        businessType={businessType}
        items={items}
      />
    </TooltipProvider>
  );
}

function SidebarContent({
  items,
  activeKey,
  collapsed,
  onToggleCollapse,
  session,
  onLogout,
  onSelect,
}: {
  items: ResolvedBusinessModule[];
  activeKey?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  session: AuthSession;
  onLogout: () => void;
  onSelect: () => void;
}) {
  const { theme } = useApp();
  const { viewRole } = useDashboardData();
  const { selectedOrganization, businessType, currentMembership } = useOrganization();

  return (
    <div className="flex h-full flex-col p-3">
      <div className={cn("flex items-center gap-2 px-1 py-2", collapsed && "justify-center")}>
        {collapsed ? (
          <TanuMark variant="navy" invert={theme === "dark"} className="h-8" />
        ) : (
          <TanuBusinessLogo className="h-9" invert={theme === "dark"} />
        )}
      </div>

      <div
        className={cn(
          "mt-3 overflow-hidden rounded-xl border border-border/80 bg-surface/70 transition-all duration-200",
          collapsed ? "max-h-0 border-transparent p-0 opacity-0" : "max-h-28 p-3 opacity-100",
        )}
      >
        <p className="truncate text-sm font-semibold">{selectedOrganization.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {session.name} ·{" "}
          {businessType === "service"
            ? roleLabel[viewRole]
            : ticketRoleLabel(currentMembership.role)}
        </p>
      </div>

      <nav className="mt-4 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeKey;
          const link = (
            <Link
              key={item.key}
              to={item.to}
              onClick={onSelect}
              className={cn(
                "flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center gap-0 px-0" : "gap-2.5",
                isActive
                  ? "bg-gradient-brand text-white shadow-glow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "truncate overflow-hidden transition-all duration-200",
                  collapsed ? "w-0 opacity-0" : "w-full opacity-100",
                )}
              >
                {item.label}
              </span>
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
      </nav>

      <div className="mt-3 shrink-0 space-y-1 border-t border-border/70 pt-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => toast.info("Тусламжийн төв удахгүй нээгдэнэ")}
                className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Тусламж</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => toast.info("Тусламжийн төв удахгүй нээгдэнэ")}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
          >
            <HelpCircle className="h-4 w-4" /> Тусламж
          </button>
        )}

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onLogout}
                className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:border-destructive/30 hover:bg-destructive/[0.06] hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Гарах</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/[0.06] hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Гарах
          </button>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
            aria-label={collapsed ? "Sidebar-ыг дэлгэх" : "Sidebar-ыг хумих"}
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

function GlobalSearch({
  open,
  onOpenChange,
  businessType,
  items,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  businessType: "service" | "ticket" | "government" | "other";
  items: ResolvedBusinessModule[];
}) {
  const { bookings, customers, employees, services } = useDashboardData();
  const ticketData = useTicketData();
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={
          businessType === "ticket"
            ? "Захиалга, арга хэмжээ, байршил хайх..."
            : "Захиалга, хэрэглэгч, ажилтан, үйлчилгээ хайх..."
        }
      />
      <CommandList>
        <CommandEmpty>Илэрц олдсонгүй.</CommandEmpty>
        {businessType === "ticket" ? (
          <>
            <CommandGroup heading="Тасалбарын захиалга">
              {ticketData.orders.slice(0, 5).map((order) => {
                const event = ticketData.events.find((item) => item.id === order.eventId);
                const orderRoute = items.find((item) => item.id === "ticket-orders")?.to;
                return (
                  <CommandItem key={order.id} onSelect={() => orderRoute && go(orderRoute)}>
                    <ClipboardList /> {order.orderNumber} · {order.customer.name} — {event?.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandGroup heading="Арга хэмжээ">
              {ticketData.events.slice(0, 5).map((event) => {
                const eventRoute = items.find((item) => item.id === "ticket-events")?.to;
                return (
                  <CommandItem key={event.id} onSelect={() => eventRoute && go(eventRoute)}>
                    <CalendarClock /> {event.name} · {event.category}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandGroup heading="Байршил">
              {ticketData.venues.slice(0, 5).map((venue) => {
                const venueRoute = items.find((item) => item.id === "ticket-venues")?.to;
                return (
                  <CommandItem key={venue.id} onSelect={() => venueRoute && go(venueRoute)}>
                    <Building /> {venue.name} · {venue.address}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        ) : (
          <>
            <CommandGroup heading="Захиалга">
              {bookings.slice(0, 5).map((b) => (
                <CommandItem key={b.id} onSelect={() => go("/business/dashboard/bookings")}>
                  <ClipboardList /> {b.code} · {b.customerName} — {b.serviceName}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Хэрэглэгч">
              {customers.slice(0, 5).map((c) => (
                <CommandItem key={c.id} onSelect={() => go("/business/dashboard/customers")}>
                  <Users /> {c.name} · {c.phone}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Ажилтан">
              {employees.slice(0, 5).map((e) => (
                <CommandItem
                  key={e.id}
                  onSelect={() => go(`/business/dashboard/employees/${e.id}`)}
                >
                  <CalendarClock /> {e.name} · {e.position}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Үйлчилгээ">
              {services.slice(0, 5).map((s) => (
                <CommandItem key={s.id} onSelect={() => go("/business/dashboard/services")}>
                  <LayoutList /> {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
