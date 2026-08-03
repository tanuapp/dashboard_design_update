// Shared TypeScript types for the Tanu Business dashboard (frontend mock only).

import type { BusinessRole } from "@/lib/mock-data";
export type { BusinessRole };

export type BookingStatus =
  "upcoming" | "arrived" | "in-service" | "completed" | "cancelled" | "no-show";

export const bookingStatusLabel: Record<BookingStatus, string> = {
  upcoming: "Удахгүй",
  arrived: "Ирсэн",
  "in-service": "Үйлчилгээ эхэлсэн",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
  "no-show": "Ирээгүй",
};

export type PaymentState = "paid" | "unpaid" | "partial" | "refunded";

export const paymentStateLabel: Record<PaymentState, string> = {
  paid: "Төлөгдсөн",
  unpaid: "Төлөгдөөгүй",
  partial: "Хэсэгчлэн төлсөн",
  refunded: "Буцаалт хийгдсэн",
};

export type BookingSource = "app" | "admin_manual" | "employee_manual";

export const bookingSourceLabel: Record<BookingSource, string> = {
  app: "Tanu апп",
  admin_manual: "Админаас гараар оруулсан",
  employee_manual: "Ажилтнаас гараар оруулсан",
};

export interface BookingHistoryEntry {
  at: string; // ISO datetime
  text: string;
}

export interface Booking {
  id: string;
  code: string;
  date: string; // "2026-07-29"
  startTime: string; // "09:00"
  endTime: string; // "09:45"
  durationMin: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  branchName: string;
  price: number;
  paymentState: PaymentState;
  status: BookingStatus;
  source: BookingSource;
  customerNote?: string;
  internalNote?: string;
  history: BookingHistoryEntry[];
}

export type EmployeeStatus = "busy" | "available" | "break" | "off" | "not-working";

export const employeeStatusLabel: Record<EmployeeStatus, string> = {
  busy: "Үйлчилгээтэй",
  available: "Сул",
  break: "Завсарлага",
  off: "Чөлөөтэй",
  "not-working": "Ажиллаагүй",
};

export interface EmployeeLeave {
  id: string;
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "declined";
}

export type AttendanceStatus = "present" | "late" | "absent" | "leave";

export const attendanceStatusLabel: Record<AttendanceStatus, string> = {
  present: "Ирсэн",
  late: "Хоцорсон",
  absent: "Ирээгүй",
  leave: "Чөлөөтэй",
};

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  breaks?: Array<{
    startTime: string;
    endTime: string;
  }>;
}

export interface EmployeeWorkDay {
  day: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  initials: string;
  position: string;
  specialty: string;
  branchId: string;
  workingHours: string;
  weeklySchedule?: EmployeeWorkDay[];
  status: EmployeeStatus;
  todayBookings: number;
  nextAvailable?: string;
  rating: number;
  serviceIds: string[];
  role: BusinessRole;
  accessEnabled: boolean;
  hireDate: string;
  leave: EmployeeLeave[];
  attendance: AttendanceRecord[];
}

export interface ServiceCategory {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  durationMin: number;
  price: number;
  employeeIds: string[];
  branchIds: string[];
  onlineBooking: boolean;
  active: boolean;
  rating: number;
  bookingCount: number;
  revenue: number;
  trend: number;
}

export interface CustomerNote {
  id: string;
  text: string;
  at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpend: number;
  lastVisit: string;
  loyaltyPoints: number;
  tags: string[];
  notes: CustomerNote[];
  favoriteServiceIds: string[];
  notificationOptIn: boolean;
  joinedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  employeeIds: string[];
  todayBookings: number;
  monthlyRevenue: number;
  active: boolean;
}

export type NotificationType =
  | "new-booking"
  | "booking-changed"
  | "booking-cancelled"
  | "upcoming"
  | "schedule-update"
  | "system"
  | "review";

export const notificationTypeLabel: Record<NotificationType, string> = {
  "new-booking": "Шинэ захиалга",
  "booking-changed": "Захиалга өөрчлөгдсөн",
  "booking-cancelled": "Захиалга цуцлагдсан",
  upcoming: "Удахгүй захиалга",
  "schedule-update": "Ажилтны хуваарь шинэчлэгдсэн",
  system: "Системийн мэдэгдэл",
  review: "Хэрэглэгчийн үнэлгээ",
};

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  at: string; // ISO datetime
  read: boolean;
  link?: string;
}
