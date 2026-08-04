import { createTicketMockSeed } from "@/features/ticket/data/mock/seed";
import type { TicketRepositories } from "@/features/ticket/repositories/contracts";
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

function can(scope: TicketAccessScope, permission: string) {
  return scope.role === "owner" || scope.role === "admin" || scope.permissions.includes(permission);
}

function requirePermission(scope: TicketAccessScope, permission: string) {
  if (!can(scope, permission)) throw new Error("Энэ үйлдлийг хийх эрх хүрэлцэхгүй байна.");
}

function requireAnyPermission(scope: TicketAccessScope, permissions: string[]) {
  if (!permissions.some((permission) => can(scope, permission))) {
    throw new Error("Энэ мэдээллийг харах эрх хүрэлцэхгүй байна.");
  }
}

function canAccessVenue(scope: TicketAccessScope, venueId: string) {
  return !scope.venueIds?.length || scope.venueIds.includes(venueId);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createMockTicketRepositories(): TicketRepositories {
  const data = createTicketMockSeed();

  const scopedVenues = (scope: TicketAccessScope) =>
    data.venues.filter(
      (venue) => venue.organizationId === scope.organizationId && canAccessVenue(scope, venue.id),
    );
  const scopedEvents = (scope: TicketAccessScope) =>
    data.events.filter(
      (event) =>
        event.organizationId === scope.organizationId && canAccessVenue(scope, event.venueId),
    );

  const venues = {
    list(scope: TicketAccessScope): Venue[] {
      return scopedVenues(scope);
    },
    get(scope: TicketAccessScope, venueId: string): Venue | undefined {
      return scopedVenues(scope).find((venue) => venue.id === venueId);
    },
    create(scope: TicketAccessScope, input: NewVenueInput): Venue {
      requirePermission(scope, "ticket.venues.manage");
      if (!input.name.trim() || !input.address.trim())
        throw new Error("Байршлын нэр болон хаягийг бүрэн оруулна уу.");
      const venue: Venue = {
        id: createId("venue"),
        organizationId: scope.organizationId,
        ...input,
        status: "active",
        updatedAt: new Date().toISOString(),
      };
      data.venues.unshift(venue);
      return venue;
    },
    listHalls(scope: TicketAccessScope, venueId?: string): Hall[] {
      const allowedVenueIds = new Set(scopedVenues(scope).map((venue) => venue.id));
      return data.halls.filter(
        (hall) =>
          hall.organizationId === scope.organizationId &&
          allowedVenueIds.has(hall.venueId) &&
          (!venueId || hall.venueId === venueId),
      );
    },
    getHall(scope: TicketAccessScope, hallId: string): Hall | undefined {
      return this.listHalls(scope).find((hall) => hall.id === hallId);
    },
    createHall(scope: TicketAccessScope, input: NewHallInput): Hall {
      requirePermission(scope, "ticket.venues.manage");
      if (!this.get(scope, input.venueId))
        throw new Error("Сонгосон байршил олдсонгүй эсвэл хандах эрхгүй байна.");
      if (!input.name.trim() || input.capacity < 1)
        throw new Error("Танхимын нэр болон багтаамжийг зөв оруулна уу.");
      const hall: Hall = {
        id: createId("hall"),
        organizationId: scope.organizationId,
        ...input,
      };
      data.halls.unshift(hall);
      data.layouts.unshift({
        id: createId("layout"),
        organizationId: scope.organizationId,
        hallId: hall.id,
        name: `${hall.name} — үндсэн зураглал`,
        version: 1,
        layoutType: hall.layoutType,
        totalCapacity: hall.capacity,
        seatedCapacity: hall.layoutType === "standing" ? 0 : hall.capacity,
        standingCapacity: hall.layoutType === "standing" ? hall.capacity : 0,
        blockedSeats: 0,
        status: "draft",
        updatedAt: new Date().toISOString(),
      });
      return hall;
    },
    duplicate(scope: TicketAccessScope, venueId: string): Venue {
      requirePermission(scope, "ticket.venues.manage");
      const source = this.get(scope, venueId);
      if (!source) throw new Error("Байршил олдсонгүй.");
      const venue: Venue = {
        ...source,
        id: createId("venue"),
        name: `${source.name} — Хуулбар`,
        status: "inactive",
        updatedAt: new Date().toISOString(),
      };
      data.venues.unshift(venue);
      return venue;
    },
    archive(scope: TicketAccessScope, venueId: string): Venue {
      requirePermission(scope, "ticket.venues.manage");
      const venue = this.get(scope, venueId);
      if (!venue) throw new Error("Байршил олдсонгүй.");
      const hasActiveEvent = scopedEvents(scope).some(
        (event) => event.venueId === venueId && ["published", "on-sale"].includes(event.status),
      );
      if (hasActiveEvent) throw new Error("Идэвхтэй арга хэмжээтэй байршлыг архивлах боломжгүй.");
      venue.status = "archived";
      venue.updatedAt = new Date().toISOString();
      return venue;
    },
  };

  const seatMaps = {
    list(scope: TicketAccessScope, hallId?: string): VenueLayout[] {
      const allowedHallIds = new Set(venues.listHalls(scope).map((hall) => hall.id));
      return data.layouts.filter(
        (layout) =>
          layout.organizationId === scope.organizationId &&
          allowedHallIds.has(layout.hallId) &&
          (!hallId || layout.hallId === hallId),
      );
    },
    get(scope: TicketAccessScope, layoutId: string): VenueLayout | undefined {
      return this.list(scope).find((layout) => layout.id === layoutId);
    },
  };

  const events = {
    list(scope: TicketAccessScope): TicketEvent[] {
      return scopedEvents(scope);
    },
    get(scope: TicketAccessScope, eventId: string): TicketEvent | undefined {
      return scopedEvents(scope).find((event) => event.id === eventId);
    },
    create(scope: TicketAccessScope, input: NewEventInput): TicketEvent {
      requirePermission(scope, "ticket.events.manage");
      const venue = venues.get(scope, input.venueId);
      const hall = venues.getHall(scope, input.hallId);
      const layout = seatMaps.get(scope, input.layoutId);
      if (!venue || !hall || !layout)
        throw new Error("Байршил, танхим болон зураглалыг бүрэн сонгоно уу.");
      if (layout.totalCapacity < 1) throw new Error("Зураглалын багтаамж тэгээс их байна.");
      const event: TicketEvent = {
        id: createId("event"),
        organizationId: scope.organizationId,
        venueId: venue.id,
        hallId: hall.id,
        layoutId: layout.id,
        name: input.name,
        category: input.category,
        description: input.description,
        status: input.status,
        imageColor: "#3157A4",
        createdAt: new Date().toISOString(),
      };
      data.events.unshift(event);
      data.schedules.unshift({
        id: createId("schedule"),
        organizationId: scope.organizationId,
        eventId: event.id,
        layoutVersionId: layout.id,
        startAt: input.startAt,
        doorsOpenAt: input.doorsOpenAt,
        salesStartAt: input.salesStartAt,
        salesEndAt: input.salesEndAt,
        holdDurationMinutes: input.holdDurationMinutes,
        status: input.status === "on-sale" ? "on-sale" : "scheduled",
      });
      return event;
    },
    listSchedules(scope: TicketAccessScope, eventId?: string): EventSchedule[] {
      const allowedEventIds = new Set(scopedEvents(scope).map((event) => event.id));
      return data.schedules.filter(
        (schedule) =>
          schedule.organizationId === scope.organizationId &&
          allowedEventIds.has(schedule.eventId) &&
          (!eventId || schedule.eventId === eventId),
      );
    },
  };

  const pricing = {
    listTicketTypes(scope: TicketAccessScope, eventId?: string): TicketType[] {
      const allowedEventIds = new Set(scopedEvents(scope).map((event) => event.id));
      return data.ticketTypes.filter(
        (ticketType) =>
          ticketType.organizationId === scope.organizationId &&
          allowedEventIds.has(ticketType.eventId) &&
          (!eventId || ticketType.eventId === eventId),
      );
    },
    createTicketType(scope: TicketAccessScope, input: NewTicketTypeInput): TicketType {
      requirePermission(scope, "ticket.pricing.manage");
      const event = events.get(scope, input.eventId);
      if (!event) throw new Error("Арга хэмжээ олдсонгүй.");
      const layout = seatMaps.get(scope, event.layoutId);
      const existingCapacity = this.listTicketTypes(scope, event.id).reduce(
        (sum, type) => sum + type.capacity,
        0,
      );
      if (!input.name.trim() || !input.code.trim() || !input.sectionOrZone.trim())
        throw new Error("Нэр, код болон оноосон хэсэг/бүс шаардлагатай.");
      if (input.capacity < 1 || existingCapacity + input.capacity > (layout?.totalCapacity ?? 0))
        throw new Error("Тасалбарын тоо зураглалын үлдсэн багтаамжаас хэтэрсэн.");
      const type: TicketType = {
        id: createId("ticket-type"),
        organizationId: scope.organizationId,
        ...input,
        soldQuantity: 0,
        active: true,
      };
      data.ticketTypes.unshift(type);
      return type;
    },
  };

  const orderList = (scope: TicketAccessScope, eventId?: string) => {
    const allowedEventIds = new Set(scopedEvents(scope).map((event) => event.id));
    return data.orders.filter(
      (order) =>
        order.organizationId === scope.organizationId &&
        allowedEventIds.has(order.eventId) &&
        (!eventId || order.eventId === eventId),
    );
  };

  const orders = {
    list(scope: TicketAccessScope, eventId?: string): TicketOrder[] {
      requirePermission(scope, "ticket.orders.view");
      return orderList(scope, eventId);
    },
    get(scope: TicketAccessScope, orderId: string): TicketOrder | undefined {
      requirePermission(scope, "ticket.orders.view");
      return orderList(scope).find((order) => order.id === orderId);
    },
    listTickets(scope: TicketAccessScope, orderId?: string): IssuedTicket[] {
      const allowedOrderIds = new Set(orderList(scope).map((order) => order.id));
      return data.tickets.filter(
        (ticket) =>
          ticket.organizationId === scope.organizationId &&
          allowedOrderIds.has(ticket.orderId) &&
          (!orderId || ticket.orderId === orderId),
      );
    },
    createManual(scope: TicketAccessScope, input: NewManualOrderInput): TicketOrder {
      requirePermission(scope, "ticket.orders.create");
      if (input.salesChannel === "complimentary") {
        requirePermission(scope, "ticket.complimentary.create");
        if (!input.complimentaryReason?.trim())
          throw new Error("Үнэгүй тасалбарын шалтгааныг оруулна уу.");
      }
      const event = events.get(scope, input.eventId);
      const schedule = events
        .listSchedules(scope, input.eventId)
        .find((item) => item.id === input.scheduleId);
      const ticketType = pricing
        .listTicketTypes(scope, input.eventId)
        .find((item) => item.id === input.ticketTypeId);
      if (!event || !schedule || !ticketType)
        throw new Error("Арга хэмжээ, хуваарь болон тасалбарын төрлийг шалгана уу.");
      if (input.quantity < ticketType.minQuantity || input.quantity > ticketType.maxPerOrder)
        throw new Error(
          `Нэг захиалгаар ${ticketType.minQuantity}–${ticketType.maxPerOrder} тасалбар авна.`,
        );
      if (ticketType.soldQuantity + input.quantity > ticketType.capacity)
        throw new Error("Тасалбарын үлдэгдэл хүрэлцэхгүй байна.");

      const now = new Date().toISOString();
      const orderId = createId("order");
      const complimentary = input.salesChannel === "complimentary";
      const issued = Array.from({ length: input.quantity }, (_, index): IssuedTicket => ({
        id: createId("ticket"),
        organizationId: scope.organizationId,
        orderId,
        ticketTypeId: ticketType.id,
        ticketCode: `TN-${Date.now().toString(36).toUpperCase()}-${index + 1}`,
        section: ticketType.sectionOrZone,
        seat: ticketType.seatCategory ? `M-${ticketType.soldQuantity + index + 1}` : undefined,
        standingZone: ticketType.seatCategory ? undefined : ticketType.sectionOrZone,
        price: complimentary ? 0 : ticketType.price,
        status: "active",
      }));
      data.tickets.unshift(...issued);
      ticketType.soldQuantity += input.quantity;
      const subtotal = complimentary ? 0 : ticketType.price * input.quantity;
      const serviceFee = complimentary ? 0 : Math.round(subtotal * 0.02);
      const order: TicketOrder = {
        id: orderId,
        organizationId: scope.organizationId,
        orderNumber: `ORD-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${String(data.orders.length + 1049)}`,
        eventId: event.id,
        scheduleId: schedule.id,
        customer: input.customer,
        ticketIds: issued.map((ticket) => ticket.id),
        subtotal,
        discount: 0,
        serviceFee,
        total: subtotal + serviceFee,
        paymentStatus: "paid",
        orderStatus: "confirmed",
        salesChannel: input.salesChannel,
        paymentMethod: input.paymentMethod,
        transactionId: complimentary ? undefined : `MAN-${Date.now()}`,
        paymentDate: now,
        refundAmount: 0,
        createdBy: input.createdBy,
        createdAt: now,
        adminNote: input.complimentaryReason ?? "",
        activity: [
          {
            id: createId("activity"),
            action: complimentary ? "Үнэгүй тасалбар үүссэн" : "Гар захиалга үүссэн",
            actor: input.createdBy,
            note: input.complimentaryReason,
            createdAt: now,
          },
        ],
      };
      data.orders.unshift(order);
      return order;
    },
    cancel(scope: TicketAccessScope, orderId: string): TicketOrder {
      requirePermission(scope, "ticket.orders.cancel");
      const order = this.get(scope, orderId);
      if (!order) throw new Error("Захиалга олдсонгүй.");
      if (["cancelled", "refunded"].includes(order.orderStatus))
        throw new Error("Энэ захиалга аль хэдийн хаагдсан байна.");
      order.orderStatus = "cancelled";
      data.tickets
        .filter((ticket) => ticket.orderId === order.id && ticket.status === "active")
        .forEach((ticket) => {
          ticket.status = "cancelled";
        });
      order.activity.push({
        id: createId("activity"),
        action: "Захиалга цуцалсан",
        actor: "Админ",
        createdAt: new Date().toISOString(),
      });
      return order;
    },
    refund(scope: TicketAccessScope, orderId: string): TicketOrder {
      requirePermission(scope, "ticket.orders.refund");
      const order = this.get(scope, orderId);
      if (!order) throw new Error("Захиалга олдсонгүй.");
      if (order.paymentStatus !== "paid") throw new Error("Зөвхөн төлөгдсөн захиалгыг буцаана.");
      order.paymentStatus = "refunded";
      order.orderStatus = "refunded";
      order.refundAmount = order.total;
      order.activity.push({
        id: createId("activity"),
        action: "Төлбөр бүрэн буцаасан",
        actor: "Админ",
        createdAt: new Date().toISOString(),
      });
      return order;
    },
    voidTickets(scope: TicketAccessScope, orderId: string): TicketOrder {
      requirePermission(scope, "ticket.orders.cancel");
      const order = this.get(scope, orderId);
      if (!order) throw new Error("Захиалга олдсонгүй.");
      data.tickets
        .filter((ticket) => ticket.orderId === order.id && ticket.status === "active")
        .forEach((ticket) => {
          ticket.status = "void";
        });
      order.activity.push({
        id: createId("activity"),
        action: "Тасалбар хүчингүй болгосон",
        actor: "Админ",
        createdAt: new Date().toISOString(),
      });
      return order;
    },
    addNote(scope: TicketAccessScope, orderId: string, note: string): TicketOrder {
      requirePermission(scope, "ticket.orders.view");
      const order = this.get(scope, orderId);
      if (!order) throw new Error("Захиалга олдсонгүй.");
      if (!note.trim()) throw new Error("Тэмдэглэл хоосон байна.");
      order.adminNote = note.trim();
      order.activity.push({
        id: createId("activity"),
        action: "Дотоод тэмдэглэл шинэчилсэн",
        actor: "Админ",
        createdAt: new Date().toISOString(),
      });
      return order;
    },
  };

  const gates = {
    list(scope: TicketAccessScope): EntryGate[] {
      const allowedVenueIds = new Set(scopedVenues(scope).map((venue) => venue.id));
      return data.gates.filter(
        (gate) => gate.organizationId === scope.organizationId && allowedVenueIds.has(gate.venueId),
      );
    },
    create(scope: TicketAccessScope, input: NewGateInput): EntryGate {
      requirePermission(scope, "ticket.gates.manage");
      if (!venues.get(scope, input.venueId)) throw new Error("Байршил олдсонгүй.");
      if (!input.name.trim() || !input.code.trim())
        throw new Error("Хаалганы нэр, код шаардлагатай.");
      const gate: EntryGate = {
        id: createId("gate"),
        organizationId: scope.organizationId,
        ...input,
        status: "closed",
        scannedToday: 0,
      };
      data.gates.unshift(gate);
      return gate;
    },
    toggle(scope: TicketAccessScope, gateId: string): EntryGate {
      requirePermission(scope, "ticket.gates.manage");
      const gate = this.list(scope).find((item) => item.id === gateId);
      if (!gate) throw new Error("Хаалга олдсонгүй.");
      gate.status = gate.status === "open" ? "closed" : "open";
      return gate;
    },
  };

  const scanner = {
    validate(scope: TicketAccessScope, ticketCode: string, gateId: string): ScanResult {
      requirePermission(scope, "ticket.scan");
      const gate = gates.list(scope).find((item) => item.id === gateId);
      if (!gate) return { ok: false, message: "Хаалга сонгоогүй эсвэл хандах эрхгүй байна." };
      const ticket = orders
        .listTickets(scope)
        .find((item) => item.ticketCode.toLowerCase() === ticketCode.trim().toLowerCase());
      if (!ticket) return { ok: false, message: "Тасалбар олдсонгүй." };
      const order = orderList(scope).find((item) => item.id === ticket.orderId);
      const event = order ? events.get(scope, order.eventId) : undefined;
      if (!order || !event) return { ok: false, message: "Тасалбарын захиалга олдсонгүй." };
      if (ticket.status === "used")
        return {
          ok: false,
          message: "Энэ тасалбар өмнө нь ашиглагдсан байна.",
          ticket,
          order,
          event,
          scannedAt: ticket.scannedAt,
        };
      if (ticket.status !== "active")
        return { ok: false, message: "Энэ тасалбар идэвхгүй байна.", ticket, order, event };
      const scannedAt = new Date().toISOString();
      ticket.status = "used";
      ticket.scannedAt = scannedAt;
      ticket.scannedGateId = gate.id;
      gate.scannedToday += 1;
      order.activity.push({
        id: createId("activity"),
        action: "Тасалбар шалгасан",
        actor: gate.name,
        createdAt: scannedAt,
      });
      return {
        ok: true,
        message: "Тасалбар хүчинтэй. Нэвтрэхийг зөвшөөрлөө.",
        ticket,
        order,
        event,
        scannedAt,
      };
    },
  };

  const reports = {
    listOrders(scope: TicketAccessScope): TicketOrder[] {
      requireAnyPermission(scope, ["ticket.dashboard.view", "ticket.reports.view"]);
      return orderList(scope);
    },
    listTickets(scope: TicketAccessScope): IssuedTicket[] {
      requireAnyPermission(scope, ["ticket.dashboard.view", "ticket.reports.view"]);
      const allowedOrderIds = new Set(orderList(scope).map((order) => order.id));
      return data.tickets.filter(
        (ticket) =>
          ticket.organizationId === scope.organizationId && allowedOrderIds.has(ticket.orderId),
      );
    },
  };

  return { venues, seatMaps, events, pricing, orders, gates, scanner, reports };
}
