import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  BRANCHES,
  BOOKINGS,
  BOOKING_SETTINGS_SEED,
  CUSTOMERS,
  EMPLOYEES,
  ORG_PROFILE_SEED,
  REVENUE_HISTORY,
  SERVICES,
  SERVICE_CATEGORIES,
} from "./mock-data";
import { readBusinessOnboarding, type BusinessOnboardingData } from "@/lib/business-onboarding";
import type {
  AppNotification,
  Booking,
  BookingStatus,
  Branch,
  BusinessRole,
  Customer,
  Employee,
  EmployeeLeave,
  Service,
} from "./types";

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${(idCounter++).toString(36)}`;

interface DashboardData {
  // Demo-only role switch (profile menu) — lets owner/admin/employee views be
  // previewed without logging out. Independent of the real login session.
  viewRole: BusinessRole;
  setViewRole: (role: BusinessRole) => void;

  branches: Branch[];
  addBranch: (input: Omit<Branch, "id">) => Branch;
  updateBranch: (id: string, patch: Partial<Branch>) => void;
  services: Service[];
  serviceCategories: typeof SERVICE_CATEGORIES;
  addServiceCategory: (name: string) => void;
  employees: Employee[];
  customers: Customer[];
  bookings: Booking[];
  notifications: AppNotification[];
  revenueHistory: typeof REVENUE_HISTORY;

  selectedBranchId: string | "all";
  setSelectedBranchId: (id: string | "all") => void;

  orgProfile: typeof ORG_PROFILE_SEED;
  updateOrgProfile: (patch: Partial<typeof ORG_PROFILE_SEED>) => void;

  bookingSettings: typeof BOOKING_SETTINGS_SEED;
  updateBookingSettings: (patch: Partial<typeof BOOKING_SETTINGS_SEED>) => void;

  addBooking: (input: Omit<Booking, "id" | "code" | "history">) => Booking;
  updateBooking: (id: string, patch: Partial<Booking>, historyNote?: string) => void;
  changeBookingStatus: (id: string, status: BookingStatus) => void;
  reassignBookingEmployee: (id: string, employeeId: string, employeeName: string) => void;
  rescheduleBooking: (id: string, date: string, startTime: string) => void;
  addBookingInternalNote: (id: string, note: string) => void;
  cancelBooking: (id: string, reason?: string) => void;

  addEmployee: (input: Omit<Employee, "id">) => Employee;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  setEmployeeLeave: (id: string, leave: EmployeeLeave[]) => void;
  toggleEmployeeAccess: (id: string) => void;

  addService: (input: Omit<Service, "id">) => Service;
  updateService: (id: string, patch: Partial<Service>) => void;
  duplicateService: (id: string) => void;
  toggleServiceActive: (id: string) => void;
  deleteService: (id: string) => void;

  addCustomer: (input: Omit<Customer, "id" | "notes">) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  addCustomerNote: (id: string, text: string) => void;
  addCustomerTag: (id: string, tag: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
}

const Ctx = createContext<DashboardData | null>(null);

function initialBranches(setup: BusinessOnboardingData | null): Branch[] {
  if (!setup) return BRANCHES;
  return [
    {
      ...BRANCHES[0],
      id: "b1",
      name: `${setup.organization.name} — Үндсэн салбар`,
      address: setup.organization.address,
      phone: setup.organization.phone,
      workingHours: `${setup.schedule.startTime}–${setup.schedule.endTime}`,
      employeeIds: setup.employees.map((_, index) => `e${index + 1}`),
      todayBookings: 0,
      monthlyRevenue: 0,
    },
  ];
}

function initialEmployees(setup: BusinessOnboardingData | null): Employee[] {
  if (!setup) return EMPLOYEES;
  return setup.employees.map((item, index) => {
    const seed = EMPLOYEES[index % EMPLOYEES.length];
    return {
      ...seed,
      id: `e${index + 1}`,
      name: item.name,
      phone: item.phone,
      email: "",
      initials: item.name.trim().charAt(0).toUpperCase(),
      position: item.position,
      specialty: item.position,
      branchId: "b1",
      workingHours: `${setup.schedule.startTime}–${setup.schedule.endTime}`,
      weeklySchedule: item.weeklySchedule,
      todayBookings: 0,
      serviceIds: setup.services.map((_, serviceIndex) => `sv${serviceIndex + 1}`),
      leave: [],
    };
  });
}

function initialServices(setup: BusinessOnboardingData | null): Service[] {
  if (!setup) return SERVICES;
  return setup.services.map((item, index) => {
    const seed = SERVICES[index % SERVICES.length];
    return {
      ...seed,
      id: `sv${index + 1}`,
      name: item.name,
      durationMin: item.durationMin,
      price: item.price,
      employeeIds: setup.employees.map((_, employeeIndex) => `e${employeeIndex + 1}`),
      branchIds: ["b1"],
      bookingCount: 0,
      revenue: 0,
      trend: 0,
    };
  });
}

export function DashboardDataProvider({
  children,
  initialRole,
}: {
  children: ReactNode;
  initialRole: BusinessRole;
}) {
  const [setup] = useState(() => readBusinessOnboarding());
  const [viewRole, setViewRole] = useState<BusinessRole>(initialRole);
  const [branches, setBranches] = useState<Branch[]>(() => initialBranches(setup));
  const [services, setServices] = useState<Service[]>(() => initialServices(setup));
  const [serviceCategories, setServiceCategories] = useState(SERVICE_CATEGORIES);
  const [employees, setEmployees] = useState<Employee[]>(() => initialEmployees(setup));
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMERS);
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | "all">("all");
  const [orgProfile, setOrgProfile] = useState(() =>
    setup
      ? {
          ...ORG_PROFILE_SEED,
          name: setup.organization.name,
          businessType: setup.organization.type,
          phone: setup.organization.phone,
          email: setup.organization.email,
          address: setup.organization.address,
        }
      : ORG_PROFILE_SEED,
  );
  const [bookingSettings, setBookingSettings] = useState(() =>
    setup
      ? {
          ...BOOKING_SETTINGS_SEED,
          minLeadTimeMin: setup.booking.minLeadTimeMin,
          cancellationDeadlineHours: setup.booking.cancellationDeadlineHours,
        }
      : BOOKING_SETTINGS_SEED,
  );

  const addBooking = useCallback((input: Omit<Booking, "id" | "code" | "history">) => {
    const booking: Booking = {
      ...input,
      id: nextId("bk"),
      code: `TN-${10000 + Math.floor(Math.random() * 8999)}`,
      history: [{ at: new Date().toISOString(), text: "Захиалга үүсгэгдсэн" }],
    };
    setBookings((prev) => [booking, ...prev]);
    setNotifications((prev) => [
      {
        id: nextId("nt"),
        type: "new-booking",
        title: "Шинэ захиалга нэмэгдлээ",
        body: `${booking.customerName} — ${booking.serviceName}, ${booking.startTime}`,
        at: new Date().toISOString(),
        read: false,
        link: "/business/dashboard/bookings",
      },
      ...prev,
    ]);
    return booking;
  }, []);

  const updateBooking = useCallback((id: string, patch: Partial<Booking>, historyNote?: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              ...patch,
              history: historyNote
                ? [...b.history, { at: new Date().toISOString(), text: historyNote }]
                : b.history,
            }
          : b,
      ),
    );
  }, []);

  const changeBookingStatus = useCallback(
    (id: string, status: BookingStatus) => {
      const labels: Record<BookingStatus, string> = {
        upcoming: "Удахгүй",
        arrived: "Ирсэн",
        "in-service": "Үйлчилгээ эхэлсэн",
        completed: "Дууссан",
        cancelled: "Цуцлагдсан",
        "no-show": "Ирээгүй",
      };
      updateBooking(id, { status }, `Төлөв өөрчлөгдсөн: ${labels[status]}`);
    },
    [updateBooking],
  );

  const reassignBookingEmployee = useCallback(
    (id: string, employeeId: string, employeeName: string) => {
      updateBooking(id, { employeeId, employeeName }, `Ажилтан солигдсон: ${employeeName}`);
    },
    [updateBooking],
  );

  const rescheduleBooking = useCallback(
    (id: string, date: string, startTime: string) => {
      updateBooking(id, { date, startTime }, `Цаг өөрчлөгдсөн: ${date} ${startTime}`);
    },
    [updateBooking],
  );

  const addBookingInternalNote = useCallback(
    (id: string, note: string) => {
      updateBooking(id, { internalNote: note }, "Дотоод тэмдэглэл нэмэгдсэн");
    },
    [updateBooking],
  );

  const cancelBooking = useCallback(
    (id: string, reason?: string) => {
      updateBooking(
        id,
        { status: "cancelled" },
        reason ? `Цуцлагдсан: ${reason}` : "Захиалга цуцлагдсан",
      );
    },
    [updateBooking],
  );

  const addEmployee = useCallback((input: Omit<Employee, "id">) => {
    const employee: Employee = { ...input, id: nextId("emp") };
    setEmployees((prev) => [employee, ...prev]);
    return employee;
  }, []);

  const updateEmployee = useCallback((id: string, patch: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const setEmployeeLeave = useCallback((id: string, leave: EmployeeLeave[]) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, leave } : e)));
  }, []);

  const toggleEmployeeAccess = useCallback((id: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, accessEnabled: !e.accessEnabled } : e)),
    );
  }, []);

  const addService = useCallback((input: Omit<Service, "id">) => {
    const service: Service = { ...input, id: nextId("sv") };
    setServices((prev) => [service, ...prev]);
    return service;
  }, []);

  const updateService = useCallback((id: string, patch: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const duplicateService = useCallback((id: string) => {
    setServices((prev) => {
      const source = prev.find((s) => s.id === id);
      if (!source) return prev;
      const copy: Service = {
        ...source,
        id: nextId("sv"),
        name: `${source.name} (хуулбар)`,
        bookingCount: 0,
        revenue: 0,
      };
      return [copy, ...prev];
    });
  }, []);

  const toggleServiceActive = useCallback((id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addBranch = useCallback((input: Omit<Branch, "id">) => {
    const branch: Branch = { ...input, id: nextId("br") };
    setBranches((prev) => [branch, ...prev]);
    return branch;
  }, []);

  const updateBranch = useCallback((id: string, patch: Partial<Branch>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const addServiceCategory = useCallback((name: string) => {
    setServiceCategories((prev) => [...prev, { id: nextId("cat"), name }]);
  }, []);

  const addCustomer = useCallback((input: Omit<Customer, "id" | "notes">) => {
    const customer: Customer = { ...input, id: nextId("cus"), notes: [] };
    setCustomers((prev) => [customer, ...prev]);
    return customer;
  }, []);

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const addCustomerNote = useCallback((id: string, text: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              notes: [{ id: nextId("note"), text, at: new Date().toISOString() }, ...c.notes],
            }
          : c,
      ),
    );
  }, []);

  const addCustomerTag = useCallback((id: string, tag: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id && !c.tags.includes(tag) ? { ...c, tags: [...c.tags, tag] } : c,
      ),
    );
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateOrgProfile = useCallback((patch: Partial<typeof ORG_PROFILE_SEED>) => {
    setOrgProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateBookingSettings = useCallback((patch: Partial<typeof BOOKING_SETTINGS_SEED>) => {
    setBookingSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<DashboardData>(
    () => ({
      viewRole,
      setViewRole,
      branches,
      addBranch,
      updateBranch,
      services,
      serviceCategories,
      addServiceCategory,
      employees,
      customers,
      bookings,
      notifications,
      revenueHistory: REVENUE_HISTORY,
      selectedBranchId,
      setSelectedBranchId,
      orgProfile,
      updateOrgProfile,
      bookingSettings,
      updateBookingSettings,
      addBooking,
      updateBooking,
      changeBookingStatus,
      reassignBookingEmployee,
      rescheduleBooking,
      addBookingInternalNote,
      cancelBooking,
      addEmployee,
      updateEmployee,
      setEmployeeLeave,
      toggleEmployeeAccess,
      addService,
      updateService,
      duplicateService,
      toggleServiceActive,
      deleteService,
      addCustomer,
      updateCustomer,
      addCustomerNote,
      addCustomerTag,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
    }),
    [
      viewRole,
      branches,
      addBranch,
      updateBranch,
      services,
      serviceCategories,
      addServiceCategory,
      employees,
      customers,
      bookings,
      notifications,
      selectedBranchId,
      orgProfile,
      bookingSettings,
      updateOrgProfile,
      updateBookingSettings,
      addBooking,
      updateBooking,
      changeBookingStatus,
      reassignBookingEmployee,
      rescheduleBooking,
      addBookingInternalNote,
      cancelBooking,
      addEmployee,
      updateEmployee,
      setEmployeeLeave,
      toggleEmployeeAccess,
      addService,
      updateService,
      duplicateService,
      toggleServiceActive,
      deleteService,
      addCustomer,
      updateCustomer,
      addCustomerNote,
      addCustomerTag,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return ctx;
}
