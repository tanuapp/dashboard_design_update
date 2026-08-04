export type TicketRole =
  | "owner"
  | "admin"
  | "event_manager"
  | "venue_manager"
  | "gate_staff"
  | "scanner_staff"
  | "report_viewer";

export type TicketPermission =
  | "ticket.dashboard.view"
  | "ticket.orders.view"
  | "ticket.orders.create"
  | "ticket.orders.cancel"
  | "ticket.orders.refund"
  | "ticket.complimentary.create"
  | "ticket.events.manage"
  | "ticket.schedules.manage"
  | "ticket.venues.manage"
  | "ticket.layouts.manage"
  | "ticket.pricing.manage"
  | "ticket.gates.manage"
  | "ticket.scan"
  | "ticket.reports.view"
  | "ticket.settings.manage";

export interface TicketAccessScope {
  organizationId: string;
  role: string;
  permissions: string[];
  venueIds?: string[];
}

export type VenueStatus = "active" | "inactive" | "archived";
export type LayoutType = "seated" | "standing" | "mixed" | "table" | "free-layout";

export interface Venue {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  district: string;
  address: string;
  coordinates?: string;
  phone: string;
  email: string;
  description: string;
  facilities: string[];
  status: VenueStatus;
  updatedAt: string;
}

export interface Hall {
  id: string;
  organizationId: string;
  venueId: string;
  name: string;
  type: string;
  environment: "indoor" | "outdoor";
  layoutType: LayoutType;
  capacity: number;
  floor: string;
  width: number;
  height: number;
  entranceCount: number;
  exitCount: number;
  description: string;
}

export interface VenueLayout {
  id: string;
  organizationId: string;
  hallId: string;
  name: string;
  version: number;
  layoutType: LayoutType;
  totalCapacity: number;
  seatedCapacity: number;
  standingCapacity: number;
  blockedSeats: number;
  status: "draft" | "active" | "archived";
  updatedAt: string;
}

export type EventStatus = "draft" | "published" | "on-sale" | "completed" | "cancelled";

export interface TicketEvent {
  id: string;
  organizationId: string;
  venueId: string;
  hallId: string;
  layoutId: string;
  name: string;
  category: string;
  description: string;
  status: EventStatus;
  imageColor: string;
  createdAt: string;
}

export interface EventSchedule {
  id: string;
  organizationId: string;
  eventId: string;
  layoutVersionId: string;
  startAt: string;
  doorsOpenAt: string;
  salesStartAt: string;
  salesEndAt: string;
  holdDurationMinutes: number;
  status: "scheduled" | "on-sale" | "closed" | "cancelled";
}

export interface TicketType {
  id: string;
  organizationId: string;
  eventId: string;
  name: string;
  code: string;
  description: string;
  price: number;
  capacity: number;
  soldQuantity: number;
  minQuantity: number;
  maxPerOrder: number;
  refundable: boolean;
  sectionOrZone: string;
  seatCategory?: string;
  gateId?: string;
  color: string;
  active: boolean;
}

export type OrderStatus =
  "new" | "pending" | "confirmed" | "cancelled" | "expired" | "refunded" | "partially-refunded";

export type PaymentStatus =
  "unpaid" | "checking" | "paid" | "failed" | "refunded" | "partially-refunded";

export type IssuedTicketStatus = "active" | "used" | "cancelled" | "void";

export interface TicketCustomer {
  name: string;
  phone: string;
  email: string;
  company?: string;
}

export interface IssuedTicket {
  id: string;
  organizationId: string;
  orderId: string;
  ticketTypeId: string;
  ticketCode: string;
  section: string;
  row?: string;
  seat?: string;
  standingZone?: string;
  price: number;
  status: IssuedTicketStatus;
  scannedAt?: string;
  scannedGateId?: string;
}

export interface OrderActivity {
  id: string;
  action: string;
  actor: string;
  note?: string;
  createdAt: string;
}

export interface TicketOrder {
  id: string;
  organizationId: string;
  orderNumber: string;
  eventId: string;
  scheduleId: string;
  customer: TicketCustomer;
  ticketIds: string[];
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  salesChannel: "online" | "box-office" | "phone" | "complimentary";
  paymentMethod: string;
  transactionId?: string;
  paymentDate?: string;
  refundAmount: number;
  createdBy: string;
  createdAt: string;
  adminNote: string;
  activity: OrderActivity[];
}

export interface EntryGate {
  id: string;
  organizationId: string;
  venueId: string;
  name: string;
  code: string;
  type: "entrance" | "vip" | "staff" | "exit";
  status: "open" | "closed";
  deviceCount: number;
  scannedToday: number;
}

export interface ScanResult {
  ok: boolean;
  message: string;
  ticket?: IssuedTicket;
  order?: TicketOrder;
  event?: TicketEvent;
  scannedAt?: string;
}

export interface NewVenueInput {
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  facilities: string[];
}

export interface NewHallInput {
  venueId: string;
  name: string;
  type: string;
  environment: "indoor" | "outdoor";
  layoutType: LayoutType;
  capacity: number;
  floor: string;
  width: number;
  height: number;
  entranceCount: number;
  exitCount: number;
  description: string;
}

export interface NewEventInput {
  name: string;
  category: string;
  description: string;
  venueId: string;
  hallId: string;
  layoutId: string;
  startAt: string;
  doorsOpenAt: string;
  salesStartAt: string;
  salesEndAt: string;
  holdDurationMinutes: number;
  status: EventStatus;
}

export interface NewManualOrderInput {
  eventId: string;
  scheduleId: string;
  ticketTypeId: string;
  quantity: number;
  customer: TicketCustomer;
  paymentMethod: string;
  salesChannel: "box-office" | "phone" | "complimentary";
  complimentaryReason?: string;
  createdBy: string;
}

export interface NewTicketTypeInput {
  eventId: string;
  name: string;
  code: string;
  description: string;
  price: number;
  capacity: number;
  minQuantity: number;
  maxPerOrder: number;
  refundable: boolean;
  sectionOrZone: string;
  seatCategory?: string;
  gateId?: string;
  color: string;
}

export interface NewGateInput {
  venueId: string;
  name: string;
  code: string;
  type: EntryGate["type"];
  deviceCount: number;
}
