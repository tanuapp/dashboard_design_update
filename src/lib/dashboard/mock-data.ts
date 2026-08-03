import type {
  AppNotification,
  AttendanceRecord,
  AttendanceStatus,
  Booking,
  BookingSource,
  BookingStatus,
  Branch,
  Customer,
  Employee,
  PaymentState,
  Service,
  ServiceCategory,
} from "./types";

// Deterministic pseudo-random generator so mock numbers stay stable across
// re-renders/navigations within a session (never Math.random at module scope).
function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// JS `%` keeps the sign of the dividend, so a negative seed indexing an array
// (e.g. SOURCE_CYCLE[seed % SOURCE_CYCLE.length]) can yield a negative index
// and silently return `undefined`. Always wrap through this instead.
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function isoDate(offsetDays: number, base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const today = () => isoDate(0);

// ===== Branches =====
export const BRANCHES: Branch[] = [
  {
    id: "b1",
    name: "Aura Beauty — Төв салбар",
    address: "СБД, 1-р хороо, Энхтайваны өргөн чөлөө 15",
    phone: "7000 1234",
    workingHours: "09:00–20:00",
    employeeIds: ["e1", "e2", "e3", "e5"],
    todayBookings: 14,
    monthlyRevenue: 48600000,
    active: true,
  },
  {
    id: "b2",
    name: "Aura Beauty — Хан-Уул",
    address: "ХУД, 15-р хороо, Зайсангийн гудамж 8",
    phone: "7000 5678",
    workingHours: "10:00–19:00",
    employeeIds: ["e4", "e6"],
    todayBookings: 7,
    monthlyRevenue: 21400000,
    active: true,
  },
  {
    id: "b3",
    name: "Aura Beauty — Баянзүрх",
    address: "БЗД, 3-р хороо, 100 айл",
    phone: "7000 9012",
    workingHours: "10:00–18:00",
    employeeIds: [],
    todayBookings: 3,
    monthlyRevenue: 9800000,
    active: false,
  },
];

// ===== Service categories & services =====
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "cat-hair", name: "Үс арчилгаа" },
  { id: "cat-skin", name: "Арьс арчилгаа" },
  { id: "cat-massage", name: "Массаж" },
  { id: "cat-nail", name: "Гар хумс" },
  { id: "cat-foot", name: "Хөл арчилгаа" },
];

export const SERVICES: Service[] = [
  {
    id: "sv1",
    name: "Үс засалт",
    categoryId: "cat-hair",
    durationMin: 45,
    price: 45000,
    employeeIds: ["e1"],
    branchIds: ["b1", "b2"],
    onlineBooking: true,
    active: true,
    rating: 4.9,
    bookingCount: 132,
    revenue: 5940000,
    trend: 8,
  },
  {
    id: "sv2",
    name: "Үс будалт",
    categoryId: "cat-hair",
    durationMin: 120,
    price: 120000,
    employeeIds: ["e1"],
    branchIds: ["b1"],
    onlineBooking: true,
    active: true,
    rating: 4.8,
    bookingCount: 58,
    revenue: 6960000,
    trend: 12,
  },
  {
    id: "sv3",
    name: "Нүүр арчилгаа",
    categoryId: "cat-skin",
    durationMin: 60,
    price: 80000,
    employeeIds: ["e2"],
    branchIds: ["b1", "b2"],
    onlineBooking: true,
    active: true,
    rating: 4.9,
    bookingCount: 96,
    revenue: 7680000,
    trend: 15,
  },
  {
    id: "sv4",
    name: "Гүн арчилгаа (маск)",
    categoryId: "cat-skin",
    durationMin: 75,
    price: 95000,
    employeeIds: ["e2"],
    branchIds: ["b1"],
    onlineBooking: true,
    active: true,
    rating: 4.7,
    bookingCount: 41,
    revenue: 3895000,
    trend: -4,
  },
  {
    id: "sv5",
    name: "Бүтэн биеийн массаж",
    categoryId: "cat-massage",
    durationMin: 60,
    price: 70000,
    employeeIds: ["e3"],
    branchIds: ["b1", "b2"],
    onlineBooking: true,
    active: true,
    rating: 4.9,
    bookingCount: 87,
    revenue: 6090000,
    trend: 6,
  },
  {
    id: "sv6",
    name: "Хөлний массаж",
    categoryId: "cat-massage",
    durationMin: 30,
    price: 40000,
    employeeIds: ["e3"],
    branchIds: ["b1"],
    onlineBooking: true,
    active: true,
    rating: 4.6,
    bookingCount: 33,
    revenue: 1320000,
    trend: 2,
  },
  {
    id: "sv7",
    name: "Gel маникюр",
    categoryId: "cat-nail",
    durationMin: 50,
    price: 55000,
    employeeIds: ["e4"],
    branchIds: ["b1", "b2"],
    onlineBooking: true,
    active: true,
    rating: 4.9,
    bookingCount: 121,
    revenue: 6655000,
    trend: 9,
  },
  {
    id: "sv8",
    name: "Сонгодог маникюр",
    categoryId: "cat-nail",
    durationMin: 40,
    price: 35000,
    employeeIds: ["e4"],
    branchIds: ["b1"],
    onlineBooking: true,
    active: true,
    rating: 4.5,
    bookingCount: 44,
    revenue: 1540000,
    trend: -2,
  },
  {
    id: "sv9",
    name: "Хумсны загвар (Nail art)",
    categoryId: "cat-nail",
    durationMin: 60,
    price: 65000,
    employeeIds: ["e4"],
    branchIds: ["b1"],
    onlineBooking: false,
    active: true,
    rating: 4.8,
    bookingCount: 29,
    revenue: 1885000,
    trend: 18,
  },
  {
    id: "sv10",
    name: "Педикюр",
    categoryId: "cat-foot",
    durationMin: 50,
    price: 60000,
    employeeIds: ["e6"],
    branchIds: ["b1", "b2"],
    onlineBooking: true,
    active: true,
    rating: 4.7,
    bookingCount: 38,
    revenue: 2280000,
    trend: 4,
  },
  {
    id: "sv11",
    name: "Хөмсөг засалт",
    categoryId: "cat-skin",
    durationMin: 20,
    price: 25000,
    employeeIds: ["e2"],
    branchIds: ["b1", "b2"],
    onlineBooking: true,
    active: true,
    rating: 4.6,
    bookingCount: 52,
    revenue: 1300000,
    trend: 1,
  },
  {
    id: "sv12",
    name: "Гэрлэн epilation",
    categoryId: "cat-skin",
    durationMin: 40,
    price: 90000,
    employeeIds: ["e2"],
    branchIds: ["b1"],
    onlineBooking: false,
    active: false,
    rating: 4.4,
    bookingCount: 12,
    revenue: 1080000,
    trend: -8,
  },
];

// ===== Employees =====
const EMPLOYEES_BASE: Omit<Employee, "attendance">[] = [
  {
    id: "e1",
    name: "Саруул",
    phone: "8801 0101",
    email: "saruul@aurabeauty.mn",
    initials: "С",
    position: "Ахлах үсчин",
    specialty: "Үс засалт, будалт",
    branchId: "b1",
    workingHours: "09:00–18:00",
    status: "available",
    todayBookings: 6,
    nextAvailable: "15:30",
    rating: 4.9,
    serviceIds: ["sv1", "sv2"],
    role: "employee",
    accessEnabled: true,
    hireDate: "2023-04-12",
    leave: [
      {
        id: "lv1",
        from: isoDate(9),
        to: isoDate(11),
        reason: "Ээлжийн амралт",
        status: "approved",
      },
    ],
  },
  {
    id: "e2",
    name: "Анужин",
    phone: "8802 0202",
    email: "anujin@aurabeauty.mn",
    initials: "А",
    position: "Арьс арчилгааны мастер",
    specialty: "Нүүр, арьс арчилгаа",
    branchId: "b1",
    workingHours: "09:00–18:00",
    status: "busy",
    todayBookings: 4,
    nextAvailable: "16:00",
    rating: 4.8,
    serviceIds: ["sv3", "sv4", "sv11", "sv12"],
    role: "employee",
    accessEnabled: true,
    hireDate: "2023-08-01",
    leave: [],
  },
  {
    id: "e3",
    name: "Мөнхөө",
    phone: "8803 0303",
    email: "munkhoo@aurabeauty.mn",
    initials: "М",
    position: "Массажист",
    specialty: "Бүтэн бие, хөлний массаж",
    branchId: "b1",
    workingHours: "10:00–19:00",
    status: "available",
    todayBookings: 3,
    nextAvailable: "14:00",
    rating: 4.9,
    serviceIds: ["sv5", "sv6"],
    role: "employee",
    accessEnabled: true,
    hireDate: "2024-01-20",
    leave: [],
  },
  {
    id: "e4",
    name: "Билгүүн",
    phone: "8804 0404",
    email: "bilguun@aurabeauty.mn",
    initials: "Б",
    position: "Маникюрч",
    specialty: "Gel, сонгодог маникюр, nail art",
    branchId: "b1",
    workingHours: "09:00–18:00",
    status: "break",
    todayBookings: 5,
    nextAvailable: "13:30",
    rating: 4.7,
    serviceIds: ["sv7", "sv8", "sv9"],
    role: "employee",
    accessEnabled: true,
    hireDate: "2024-03-05",
    leave: [
      { id: "lv2", from: isoDate(2), to: isoDate(2), reason: "Хувийн ажил", status: "pending" },
    ],
  },
  {
    id: "e5",
    name: "Сарнай",
    phone: "8805 0505",
    email: "sarnai@aurabeauty.mn",
    initials: "С",
    position: "Ресепшн",
    specialty: "Хэрэглэгчийн үйлчилгээ",
    branchId: "b1",
    workingHours: "09:00–20:00",
    status: "busy",
    todayBookings: 0,
    rating: 4.6,
    serviceIds: [],
    role: "employee",
    accessEnabled: true,
    hireDate: "2022-11-11",
    leave: [],
  },
  {
    id: "e6",
    name: "Дэлгэрмаа",
    phone: "8806 0606",
    email: "delgermaa@aurabeauty.mn",
    initials: "Д",
    position: "Педикюрч",
    specialty: "Хөл арчилгаа",
    branchId: "b2",
    workingHours: "10:00–19:00",
    status: "off",
    todayBookings: 0,
    rating: 4.7,
    serviceIds: ["sv10"],
    role: "employee",
    accessEnabled: true,
    hireDate: "2024-06-18",
    leave: [{ id: "lv3", from: isoDate(0), to: isoDate(1), reason: "Өвчтэй", status: "approved" }],
  },
];

const ATTENDANCE_CYCLE: AttendanceStatus[] = [
  "present",
  "present",
  "present",
  "present",
  "late",
  "present",
  "absent",
];

function buildAttendance(employee: Omit<Employee, "attendance">, days = 7): AttendanceRecord[] {
  return Array.from({ length: days }, (_, i) => {
    const offset = -(days - 1) + i;
    const date = isoDate(offset);
    const onLeave = employee.leave.some(
      (l) => l.status === "approved" && date >= l.from && date <= l.to,
    );
    if (onLeave) return { date, status: "leave" as const };
    const seed = employee.id.charCodeAt(1) * 31 + offset * 7;
    const status = ATTENDANCE_CYCLE[mod(seed, ATTENDANCE_CYCLE.length)];
    if (status === "absent") return { date, status };
    const [shiftStart, shiftEnd] = employee.workingHours.split("–");
    const checkIn = addMinutes(
      shiftStart,
      status === "late" ? 10 + mod(seed, 15) : -(3 + mod(seed, 8)),
    );
    const checkOut = addMinutes(shiftEnd, mod(seed + 1, 9) - 3);
    const breaks =
      employee.position === "Ресепшн"
        ? [
            { startTime: "11:15", endTime: "11:30" },
            { startTime: "15:30", endTime: "15:45" },
          ]
        : [{ startTime: "13:00", endTime: "13:30" }];
    return { date, status, checkIn, checkOut, breaks };
  });
}

export const EMPLOYEES: Employee[] = EMPLOYEES_BASE.map((e) => ({
  ...e,
  attendance: buildAttendance(e),
}));

// ===== Customers =====
export const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Номин Б.",
    phone: "9911 0011",
    email: "nomin.b@gmail.com",
    totalBookings: 18,
    completedBookings: 16,
    cancelledBookings: 1,
    totalSpend: 1240000,
    lastVisit: isoDate(0),
    loyaltyPoints: 620,
    tags: ["VIP", "Тогтмол"],
    notes: [
      {
        id: "n1",
        text: "Мэдрэмтгий арьстай, эрч хүчтэй массаж хийхгүй байхыг хүсдэг.",
        at: isoDate(-20),
      },
    ],
    favoriteServiceIds: ["sv1", "sv7"],
    notificationOptIn: true,
    joinedAt: "2024-02-10",
  },
  {
    id: "c2",
    name: "Энхжин Т.",
    phone: "9922 0022",
    email: "enkhjin.t@gmail.com",
    totalBookings: 9,
    completedBookings: 8,
    cancelledBookings: 1,
    totalSpend: 640000,
    lastVisit: isoDate(0),
    loyaltyPoints: 320,
    tags: ["Тогтмол"],
    notes: [],
    favoriteServiceIds: ["sv3"],
    notificationOptIn: true,
    joinedAt: "2024-09-02",
  },
  {
    id: "c3",
    name: "Тэмүүлэн Д.",
    phone: "9933 0033",
    email: "temuulen.d@gmail.com",
    totalBookings: 5,
    completedBookings: 5,
    cancelledBookings: 0,
    totalSpend: 350000,
    lastVisit: isoDate(0),
    loyaltyPoints: 175,
    tags: ["Шинэ"],
    notes: [],
    favoriteServiceIds: ["sv5"],
    notificationOptIn: false,
    joinedAt: "2026-05-14",
  },
  {
    id: "c4",
    name: "Болор Ц.",
    phone: "9944 0044",
    email: "bolor.ts@gmail.com",
    totalBookings: 21,
    completedBookings: 19,
    cancelledBookings: 0,
    totalSpend: 1540000,
    lastVisit: isoDate(0),
    loyaltyPoints: 780,
    tags: ["VIP"],
    notes: [{ id: "n2", text: "Урьдчилж 1 өдрийн өмнө сануулга авахыг хүсдэг.", at: isoDate(-5) }],
    favoriteServiceIds: ["sv7", "sv9"],
    notificationOptIn: true,
    joinedAt: "2023-11-30",
  },
  {
    id: "c5",
    name: "Оюунтуяа Б.",
    phone: "9911 1122",
    email: "oyunaa.b@gmail.com",
    totalBookings: 12,
    completedBookings: 10,
    cancelledBookings: 2,
    totalSpend: 780000,
    lastVisit: isoDate(-1),
    loyaltyPoints: 410,
    tags: ["Тогтмол"],
    notes: [],
    favoriteServiceIds: ["sv1"],
    notificationOptIn: true,
    joinedAt: "2024-04-19",
  },
  {
    id: "c6",
    name: "Түвшинбаяр Д.",
    phone: "9922 2233",
    email: "tuvshee.d@gmail.com",
    totalBookings: 5,
    completedBookings: 4,
    cancelledBookings: 1,
    totalSpend: 260000,
    lastVisit: isoDate(-2),
    loyaltyPoints: 130,
    tags: [],
    notes: [],
    favoriteServiceIds: ["sv5"],
    notificationOptIn: true,
    joinedAt: "2025-01-08",
  },
  {
    id: "c7",
    name: "Мөнхзул Ц.",
    phone: "9933 3344",
    email: "munkhzul.ts@gmail.com",
    totalBookings: 21,
    completedBookings: 20,
    cancelledBookings: 0,
    totalSpend: 1540000,
    lastVisit: isoDate(-3),
    loyaltyPoints: 770,
    tags: ["VIP", "Тогтмол"],
    notes: [],
    favoriteServiceIds: ["sv7"],
    notificationOptIn: true,
    joinedAt: "2023-07-22",
  },
  {
    id: "c8",
    name: "Батбаяр Х.",
    phone: "9944 4455",
    email: "batbayar.kh@gmail.com",
    totalBookings: 2,
    completedBookings: 1,
    cancelledBookings: 1,
    totalSpend: 95000,
    lastVisit: isoDate(-8),
    loyaltyPoints: 45,
    tags: ["Хямдрал хайдаг"],
    notes: [{ id: "n3", text: "3 удаа цаг цуцалсан — сануулах шаардлагатай.", at: isoDate(-8) }],
    favoriteServiceIds: ["sv1"],
    notificationOptIn: false,
    joinedAt: "2026-03-01",
  },
  {
    id: "c9",
    name: "Ариунаа С.",
    phone: "9955 5566",
    email: "ariunaa.s@gmail.com",
    totalBookings: 7,
    completedBookings: 7,
    cancelledBookings: 0,
    totalSpend: 490000,
    lastVisit: isoDate(-4),
    loyaltyPoints: 245,
    tags: ["Тогтмол"],
    notes: [],
    favoriteServiceIds: ["sv9"],
    notificationOptIn: true,
    joinedAt: "2024-12-15",
  },
  {
    id: "c10",
    name: "Наранцэцэг О.",
    phone: "9966 6677",
    email: "narantsetseg.o@gmail.com",
    totalBookings: 3,
    completedBookings: 3,
    cancelledBookings: 0,
    totalSpend: 210000,
    lastVisit: isoDate(-6),
    loyaltyPoints: 105,
    tags: ["Шинэ"],
    notes: [],
    favoriteServiceIds: ["sv3"],
    notificationOptIn: true,
    joinedAt: "2026-06-20",
  },
  {
    id: "c11",
    name: "Хулан Ж.",
    phone: "9977 7788",
    email: "khulan.j@gmail.com",
    totalBookings: 14,
    completedBookings: 13,
    cancelledBookings: 1,
    totalSpend: 980000,
    lastVisit: isoDate(-7),
    loyaltyPoints: 490,
    tags: ["Тогтмол"],
    notes: [],
    favoriteServiceIds: ["sv2"],
    notificationOptIn: true,
    joinedAt: "2024-05-09",
  },
  {
    id: "c12",
    name: "Пүрэвсүрэн Н.",
    phone: "9988 8899",
    email: "purevsuren.n@gmail.com",
    totalBookings: 1,
    completedBookings: 0,
    cancelledBookings: 0,
    totalSpend: 0,
    lastVisit: isoDate(1),
    loyaltyPoints: 0,
    tags: ["Шинэ"],
    notes: [],
    favoriteServiceIds: [],
    notificationOptIn: true,
    joinedAt: isoDate(-1),
  },
];

// ===== Bookings =====
// Deterministic booking generator spanning today ± 7 days for calendar/table views.
const STATUS_CYCLE: BookingStatus[] = [
  "completed",
  "completed",
  "in-service",
  "arrived",
  "upcoming",
  "upcoming",
  "cancelled",
  "no-show",
];
const PAYMENT_CYCLE: PaymentState[] = ["paid", "paid", "unpaid", "partial"];
const SOURCE_CYCLE: BookingSource[] = [
  "app",
  "app",
  "app",
  "admin_manual",
  "employee_manual",
  "admin_manual",
];

const TODAY_FIXED: Array<
  Partial<Booking> & {
    time: string;
    durationMin: number;
    customerId: string;
    serviceId: string;
    employeeId: string;
    status: BookingStatus;
  }
> = [
  {
    time: "09:00",
    durationMin: 45,
    customerId: "c1",
    serviceId: "sv1",
    employeeId: "e1",
    status: "completed",
  },
  {
    time: "10:30",
    durationMin: 60,
    customerId: "c2",
    serviceId: "sv3",
    employeeId: "e2",
    status: "completed",
  },
  {
    time: "12:00",
    durationMin: 60,
    customerId: "c3",
    serviceId: "sv5",
    employeeId: "e3",
    status: "in-service",
  },
  {
    time: "13:15",
    durationMin: 40,
    customerId: "c9",
    serviceId: "sv9",
    employeeId: "e4",
    status: "arrived",
  },
  {
    time: "14:30",
    durationMin: 50,
    customerId: "c4",
    serviceId: "sv7",
    employeeId: "e1",
    status: "upcoming",
  },
  {
    time: "15:30",
    durationMin: 20,
    customerId: "c10",
    serviceId: "sv11",
    employeeId: "e2",
    status: "upcoming",
  },
  {
    time: "16:15",
    durationMin: 30,
    customerId: "c6",
    serviceId: "sv6",
    employeeId: "e3",
    status: "cancelled",
  },
  {
    time: "17:00",
    durationMin: 50,
    customerId: "c8",
    serviceId: "sv8",
    employeeId: "e4",
    status: "no-show",
  },
];

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

function buildBooking(
  seed: number,
  dayOffset: number,
  time: string,
  durationMin: number,
  customerId: string,
  serviceId: string,
  employeeId: string,
  status: BookingStatus,
  code: string,
): Booking {
  const customer = CUSTOMERS.find((c) => c.id === customerId)!;
  const service = SERVICES.find((s) => s.id === serviceId)!;
  const employee = EMPLOYEES.find((e) => e.id === employeeId)!;
  const branch = BRANCHES.find((b) => b.id === employee.branchId) ?? BRANCHES[0];
  const paymentState =
    status === "cancelled"
      ? "refunded"
      : status === "completed"
        ? PAYMENT_CYCLE[mod(seed, PAYMENT_CYCLE.length)]
        : "unpaid";
  return {
    id: `bk-${dayOffset}-${code}`,
    code: `TN-${10000 + seed}`,
    date: isoDate(dayOffset),
    startTime: time,
    endTime: addMinutes(time, durationMin),
    durationMin,
    customerId: customer.id,
    customerName: customer.name,
    customerPhone: customer.phone,
    serviceId: service.id,
    serviceName: service.name,
    employeeId: employee.id,
    employeeName: employee.name,
    branchId: branch.id,
    branchName: branch.name,
    price: service.price,
    paymentState,
    status,
    source: SOURCE_CYCLE[mod(seed, SOURCE_CYCLE.length)],
    customerNote: seed % 3 === 0 ? "Хаалганы дэргэдэх сандал дээр суухыг хүсч байна." : undefined,
    internalNote: undefined,
    history: [
      { at: `${isoDate(dayOffset)}T08:00:00`, text: "Захиалга үүсгэгдсэн" },
      ...(status === "completed"
        ? [
            {
              at: `${isoDate(dayOffset)}T${addMinutes(time, durationMin)}:00`,
              text: "Үйлчилгээ дууссан",
            },
          ]
        : []),
      ...(status === "cancelled"
        ? [{ at: `${isoDate(dayOffset)}T09:10:00`, text: "Захиалга цуцлагдсан" }]
        : []),
    ],
  };
}

function buildDayBookings(dayOffset: number): Booking[] {
  const slots = ["09:00", "10:15", "11:30", "13:00", "14:15", "15:30", "16:45"];
  const count = 3 + Math.floor(seeded(dayOffset + 100) * 4);
  return slots.slice(0, count).map((time, i) => {
    const seed = (dayOffset + 1) * 37 + i * 13;
    const customer = CUSTOMERS[Math.floor(seeded(seed) * CUSTOMERS.length)];
    const service = SERVICES[Math.floor(seeded(seed + 1) * SERVICES.length)];
    const employee =
      EMPLOYEES.filter((e) => e.serviceIds.includes(service.id))[0] ??
      EMPLOYEES[Math.floor(seeded(seed + 2) * (EMPLOYEES.length - 1))];
    const status =
      dayOffset < 0
        ? "completed"
        : dayOffset === 0
          ? STATUS_CYCLE[mod(seed, STATUS_CYCLE.length)]
          : "upcoming";
    return buildBooking(
      seed,
      dayOffset,
      time,
      service.durationMin,
      customer.id,
      service.id,
      employee.id,
      status,
      `d${dayOffset}i${i}`,
    );
  });
}

export const BOOKINGS: Booking[] = [
  ...TODAY_FIXED.map((b, i) =>
    buildBooking(
      i * 7 + 3,
      0,
      b.time,
      b.durationMin,
      b.customerId,
      b.serviceId,
      b.employeeId,
      b.status,
      `t${i}`,
    ),
  ),
  ...Array.from({ length: 7 }, (_, i) => -1 - i).flatMap((offset) => buildDayBookings(offset)),
  ...Array.from({ length: 7 }, (_, i) => 1 + i).flatMap((offset) => buildDayBookings(offset)),
];

// ===== Revenue history (last 90 days) for charts =====
export const REVENUE_HISTORY: { date: string; revenue: number; bookings: number }[] = Array.from(
  { length: 90 },
  (_, i) => {
    const offset = i - 89; // oldest -> today
    const base = 1200000 + seeded(offset + 500) * 1400000;
    const weekday = new Date(new Date().setDate(new Date().getDate() + offset)).getDay();
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.25 : 1;
    const revenue = Math.round((base * weekendBoost) / 1000) * 1000;
    const bookings = Math.max(6, Math.round(revenue / 62000));
    return { date: isoDate(offset), revenue, bookings };
  },
);

// ===== Notifications =====
export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "nt1",
    type: "new-booking",
    title: "Шинэ захиалга ирлээ",
    body: "Номин Б. — Үс засалт, 09:00",
    at: `${today()}T08:02:00`,
    read: false,
    link: "/business/dashboard/bookings",
  },
  {
    id: "nt2",
    type: "upcoming",
    title: "Удахгүй захиалга",
    body: "Болор Ц. — Gel маникюр, 14:30",
    at: `${today()}T13:30:00`,
    read: false,
    link: "/business/dashboard/calendar",
  },
  {
    id: "nt3",
    type: "booking-cancelled",
    title: "Захиалга цуцлагдлаа",
    body: "Түвшинбаяр Д. — Хөлний массаж, 16:15",
    at: `${today()}T11:00:00`,
    read: false,
    link: "/business/dashboard/bookings",
  },
  {
    id: "nt4",
    type: "review",
    title: "Шинэ үнэлгээ",
    body: "Мөнхзул Ц. таны байгууллагад 5 од өглөө.",
    at: `${isoDate(-1)}T18:20:00`,
    read: true,
    link: "/business/dashboard/customers",
  },
  {
    id: "nt5",
    type: "schedule-update",
    title: "Ажилтны хуваарь шинэчлэгдсэн",
    body: "Билгүүн — маргаашийн хуваарь өөрчлөгдсөн",
    at: `${isoDate(-1)}T09:15:00`,
    read: true,
    link: "/business/dashboard/employees",
  },
  {
    id: "nt6",
    type: "booking-changed",
    title: "Захиалгын цаг өөрчлөгдлөө",
    body: "Ариунаа С. — 13:00 → 14:00",
    at: `${isoDate(-2)}T10:00:00`,
    read: true,
    link: "/business/dashboard/bookings",
  },
  {
    id: "nt7",
    type: "system",
    title: "Системийн мэдэгдэл",
    body: "Tanu Business шинэ хувилбар гарлаа.",
    at: `${isoDate(-3)}T09:00:00`,
    read: true,
  },
  {
    id: "nt8",
    type: "new-booking",
    title: "Шинэ захиалга ирлээ",
    body: "Тэмүүлэн Д. — Бүтэн биеийн массаж, 12:00",
    at: `${today()}T07:45:00`,
    read: false,
    link: "/business/dashboard/bookings",
  },
];

export const bizTypes = [
  { name: "Гоо сайхны салон", icon: "Scissors" },
  { name: "Эмнэлэг, эрүүл мэнд", icon: "Stethoscope" },
  { name: "Сургалтын төв", icon: "BookOpen" },
  { name: "Фитнес, спорт", icon: "Dumbbell" },
  { name: "Авто үйлчилгээ", icon: "Wrench" },
  { name: "Зөвлөх үйлчилгээ", icon: "Briefcase" },
  { name: "Тасалбар, арга хэмжээ", icon: "Ticket" },
  { name: "Бусад цаг захиалгын үйлчилгээ", icon: "Sparkles" },
];

export const ORG_PROFILE_SEED = {
  name: "Aura Beauty Studio",
  shortDescription: "Улаанбаатар хотын тэргүүлэх гоо сайхны студи",
  detailedDescription:
    "Aura Beauty Studio нь 2022 оноос хойш үйлчлүүлэгчдэдээ өндөр стандартын гоо сайхан, арьс арчилгаа, массажны үйлчилгээг үзүүлж байна. Бид туршлагатай мастерууд, премиум материал ашиглан таны гоо үзэсгэлэн, тав тухыг эрхэмлэдэг.",
  businessType: "Гоо сайхны салон",
  phone: "7000 1234",
  email: "info@aurabeauty.mn",
  website: "https://aurabeauty.mn",
  socials: { facebook: "facebook.com/aurabeauty.mn", instagram: "instagram.com/aurabeauty.mn" },
  address: "СБД, 1-р хороо, Энхтайваны өргөн чөлөө 15",
  publicBookingVisible: true,
};

export const TANU_PROFILE_ANALYTICS = {
  uniqueProfileViews: 1284,
};

export const BOOKING_SETTINGS_SEED = {
  minLeadTimeMin: 60,
  maxFutureDays: 60,
  cancellationDeadlineHours: 12,
  slotIntervalMin: 15,
  bufferTimeMin: 10,
  autoReminders: true,
};
