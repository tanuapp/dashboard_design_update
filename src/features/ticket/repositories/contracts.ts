import type {
  EntryGate,
  EventSchedule,
  Hall,
  IssuedTicket,
  NewEventInput,
  NewHallInput,
  NewManualOrderInput,
  NewTicketTypeInput,
  NewGateInput,
  NewVenueInput,
  ScanResult,
  TicketAccessScope,
  TicketEvent,
  TicketOrder,
  TicketType,
  Venue,
  VenueLayout,
} from "@/features/ticket/types";

export interface VenueRepository {
  list(scope: TicketAccessScope): Venue[];
  get(scope: TicketAccessScope, venueId: string): Venue | undefined;
  create(scope: TicketAccessScope, input: NewVenueInput): Venue;
  listHalls(scope: TicketAccessScope, venueId?: string): Hall[];
  getHall(scope: TicketAccessScope, hallId: string): Hall | undefined;
  createHall(scope: TicketAccessScope, input: NewHallInput): Hall;
  duplicate(scope: TicketAccessScope, venueId: string): Venue;
  archive(scope: TicketAccessScope, venueId: string): Venue;
}

export interface SeatMapRepository {
  list(scope: TicketAccessScope, hallId?: string): VenueLayout[];
  get(scope: TicketAccessScope, layoutId: string): VenueLayout | undefined;
}

export interface EventRepository {
  list(scope: TicketAccessScope): TicketEvent[];
  get(scope: TicketAccessScope, eventId: string): TicketEvent | undefined;
  create(scope: TicketAccessScope, input: NewEventInput): TicketEvent;
  listSchedules(scope: TicketAccessScope, eventId?: string): EventSchedule[];
}

export interface PricingRepository {
  listTicketTypes(scope: TicketAccessScope, eventId?: string): TicketType[];
  createTicketType(scope: TicketAccessScope, input: NewTicketTypeInput): TicketType;
}

export interface OrderRepository {
  list(scope: TicketAccessScope, eventId?: string): TicketOrder[];
  get(scope: TicketAccessScope, orderId: string): TicketOrder | undefined;
  listTickets(scope: TicketAccessScope, orderId?: string): IssuedTicket[];
  createManual(scope: TicketAccessScope, input: NewManualOrderInput): TicketOrder;
  cancel(scope: TicketAccessScope, orderId: string): TicketOrder;
  refund(scope: TicketAccessScope, orderId: string): TicketOrder;
  voidTickets(scope: TicketAccessScope, orderId: string): TicketOrder;
  addNote(scope: TicketAccessScope, orderId: string, note: string): TicketOrder;
}

export interface GateRepository {
  list(scope: TicketAccessScope): EntryGate[];
  create(scope: TicketAccessScope, input: NewGateInput): EntryGate;
  toggle(scope: TicketAccessScope, gateId: string): EntryGate;
}

export interface ScannerRepository {
  validate(scope: TicketAccessScope, ticketCode: string, gateId: string): ScanResult;
}

export interface ReportRepository {
  listOrders(scope: TicketAccessScope): TicketOrder[];
  listTickets(scope: TicketAccessScope): IssuedTicket[];
}

export interface TicketRepositories {
  venues: VenueRepository;
  seatMaps: SeatMapRepository;
  events: EventRepository;
  pricing: PricingRepository;
  orders: OrderRepository;
  gates: GateRepository;
  scanner: ScannerRepository;
  reports: ReportRepository;
}
