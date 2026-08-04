import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useOrganization } from "@/lib/organization-context";
import { createMockTicketRepositories } from "@/features/ticket/repositories/mock";
import type {
  NewEventInput,
  NewHallInput,
  NewManualOrderInput,
  NewTicketTypeInput,
  NewGateInput,
  NewVenueInput,
  ScanResult,
  TicketPermission,
} from "@/features/ticket/types";

type TicketRepositoryInstance = ReturnType<typeof createMockTicketRepositories>;

interface TicketDataContextValue {
  repositoryMode: "local-demo";
  venues: ReturnType<TicketRepositoryInstance["venues"]["list"]>;
  halls: ReturnType<TicketRepositoryInstance["venues"]["listHalls"]>;
  layouts: ReturnType<TicketRepositoryInstance["seatMaps"]["list"]>;
  events: ReturnType<TicketRepositoryInstance["events"]["list"]>;
  schedules: ReturnType<TicketRepositoryInstance["events"]["listSchedules"]>;
  ticketTypes: ReturnType<TicketRepositoryInstance["pricing"]["listTicketTypes"]>;
  orders: ReturnType<TicketRepositoryInstance["orders"]["list"]>;
  tickets: ReturnType<TicketRepositoryInstance["orders"]["listTickets"]>;
  gates: ReturnType<TicketRepositoryInstance["gates"]["list"]>;
  can: (permission: TicketPermission) => boolean;
  createVenue: (input: NewVenueInput) => void;
  createHall: (input: NewHallInput) => void;
  duplicateVenue: (venueId: string) => void;
  archiveVenue: (venueId: string) => void;
  createEvent: (input: NewEventInput) => string;
  createTicketType: (input: NewTicketTypeInput) => void;
  createGate: (input: NewGateInput) => void;
  toggleGate: (gateId: string) => void;
  createManualOrder: (input: NewManualOrderInput) => string;
  cancelOrder: (orderId: string) => void;
  refundOrder: (orderId: string) => void;
  voidOrderTickets: (orderId: string) => void;
  addOrderNote: (orderId: string, note: string) => void;
  scanTicket: (ticketCode: string, gateId: string) => ScanResult;
}

const TicketDataContext = createContext<TicketDataContextValue | null>(null);

export function TicketDataProvider({ children }: { children: ReactNode }) {
  const { selectedOrganization, currentMembership, hasPermission } = useOrganization();
  const [repositories] = useState(createMockTicketRepositories);
  const [revision, setRevision] = useState(0);
  const scope = useMemo(
    () => ({
      organizationId: selectedOrganization.id,
      role: currentMembership.role,
      permissions: currentMembership.permissions,
      venueIds: currentMembership.venueIds,
    }),
    [currentMembership, selectedOrganization.id],
  );
  const refresh = useCallback(() => setRevision((current) => current + 1), []);

  const value = useMemo<TicketDataContextValue>(() => {
    // Repository collections are intentionally mutable in the local demo adapter.
    // Reading the revision keeps this derived snapshot in sync after each local action.
    void revision;
    const canReadOrders = hasPermission("ticket.orders.view");
    const canReadReports =
      hasPermission("ticket.reports.view") || hasPermission("ticket.dashboard.view");
    const safeOrders = canReadOrders
      ? repositories.orders.list(scope)
      : canReadReports
        ? repositories.reports.listOrders(scope)
        : [];
    const safeTickets = canReadOrders
      ? repositories.orders.listTickets(scope)
      : canReadReports
        ? repositories.reports.listTickets(scope)
        : [];

    return {
      repositoryMode: "local-demo",
      venues: repositories.venues.list(scope),
      halls: repositories.venues.listHalls(scope),
      layouts: repositories.seatMaps.list(scope),
      events: repositories.events.list(scope),
      schedules: repositories.events.listSchedules(scope),
      ticketTypes: repositories.pricing.listTicketTypes(scope),
      orders: safeOrders,
      tickets: safeTickets,
      gates: repositories.gates.list(scope),
      can: (permission) => hasPermission(permission),
      createVenue: (input) => {
        repositories.venues.create(scope, input);
        refresh();
      },
      createHall: (input) => {
        repositories.venues.createHall(scope, input);
        refresh();
      },
      duplicateVenue: (venueId) => {
        repositories.venues.duplicate(scope, venueId);
        refresh();
      },
      archiveVenue: (venueId) => {
        repositories.venues.archive(scope, venueId);
        refresh();
      },
      createEvent: (input) => {
        const event = repositories.events.create(scope, input);
        refresh();
        return event.id;
      },
      createTicketType: (input) => {
        repositories.pricing.createTicketType(scope, input);
        refresh();
      },
      createGate: (input) => {
        repositories.gates.create(scope, input);
        refresh();
      },
      toggleGate: (gateId) => {
        repositories.gates.toggle(scope, gateId);
        refresh();
      },
      createManualOrder: (input) => {
        const order = repositories.orders.createManual(scope, input);
        refresh();
        return order.id;
      },
      cancelOrder: (orderId) => {
        repositories.orders.cancel(scope, orderId);
        refresh();
      },
      refundOrder: (orderId) => {
        repositories.orders.refund(scope, orderId);
        refresh();
      },
      voidOrderTickets: (orderId) => {
        repositories.orders.voidTickets(scope, orderId);
        refresh();
      },
      addOrderNote: (orderId, note) => {
        repositories.orders.addNote(scope, orderId, note);
        refresh();
      },
      scanTicket: (ticketCode, gateId) => {
        const result = repositories.scanner.validate(scope, ticketCode, gateId);
        refresh();
        return result;
      },
    };
  }, [hasPermission, refresh, repositories, revision, scope]);

  return <TicketDataContext.Provider value={value}>{children}</TicketDataContext.Provider>;
}

export function useTicketData() {
  const value = useContext(TicketDataContext);
  if (!value) throw new Error("useTicketData must be used within TicketDataProvider");
  return value;
}
