# Tanu Business Ticket workspace — phase 1

Updated: 2026-08-03

## Scope and current architecture

The repository is a React 19 / TanStack Start application with file-based routes, the existing Tanu design tokens and shared dashboard components. Authentication is represented by `AuthProvider`; the service workspace uses `DashboardDataProvider`; the government workspace uses `GovernmentDataProvider`. All current business data is frontend demo state. No production Ticket API, payment gateway, database, or seat-locking service existed before this phase.

The phase keeps one Tanu Business application. An account can now have multiple organization memberships, while the selected organization's `businessType` controls its shell, navigation, routes, terminology, and permission-filtered module list.

## Existing service modules preserved

- Dashboard
- Calendar
- Bookings
- Employees and employee detail
- Employee schedule / attendance
- Services
- QR promotion
- Customers
- Finance
- Reports
- Branches and branch detail
- Notifications
- Organization profile
- Billing
- Settings
- Employee-specific dashboard, calendar, bookings, customers, performance, leave/schedule, notifications, and profile

Existing `/business/dashboard/*` service URLs remain intact. The service sidebar entries are now sourced from the central registry but keep their previous labels, roles, and paths.

## Organization architecture

Added business types:

- `service`
- `ticket`
- `government`
- `other`

`OrganizationProvider` exposes:

- `selectedOrganizationId`
- `selectedOrganization`
- `businessType`
- `currentMembership`
- `permissions`
- `availableModules`
- `selectOrganization`
- `hasPermission`

Selection is persisted under a per-account local-storage key. The existing top header now includes an organization switcher without replacing the header design. Legacy private/government sessions are converted to local memberships when a session does not yet contain a membership list.

## Shared modules and files

- Organization types and legacy compatibility: `src/lib/organization.ts`
- Local organization catalog and membership presets: `src/lib/organizations.ts`
- Selected organization state: `src/lib/organization-context.tsx`
- Central module/navigation registry: `src/lib/module-registry.ts`
- Header organization switcher: `src/components/dashboard/OrganizationSwitcher.tsx`
- Shared shell selection and providers: `src/routes/business.dashboard.tsx`
- Existing service shell integration: `src/components/dashboard/DashboardShell.tsx`
- Government shell switcher integration: `src/components/government/GovernmentShell.tsx`

## Ticket-only modules completed

- Ticket dashboard with sales, order, ticket, entry, and utilization summaries
- Orders with filtering, detail drawer, activity, admin notes, manual order wizard, cancel/refund/void confirmation
- Events list and event detail tabs
- Six-step create-event wizard
- Schedules
- Venue list, create, duplicate, archive, venue detail
- Hall list, create, hall detail
- Saved layout detail and simple seated/standing/mixed/table/free-layout preview
- Ticket types and pricing
- Entry gates
- QR scanner with manual-code demo validation and recent result state
- Entry reports
- Ticket settings
- Ticket help

The seat-map page is deliberately a simple preview/version surface, not a production canvas editor.

## New organization-scoped routes

- `/business/dashboard/ticket/$organizationId/dashboard`
- `/business/dashboard/ticket/$organizationId/orders`
- `/business/dashboard/ticket/$organizationId/events`
- `/business/dashboard/ticket/$organizationId/events/new`
- `/business/dashboard/ticket/$organizationId/events/$eventId`
- `/business/dashboard/ticket/$organizationId/schedules`
- `/business/dashboard/ticket/$organizationId/venues`
- `/business/dashboard/ticket/$organizationId/venues/$venueId`
- `/business/dashboard/ticket/$organizationId/halls/$hallId`
- `/business/dashboard/ticket/$organizationId/seat-maps/$layoutId`
- `/business/dashboard/ticket/$organizationId/ticket-types`
- `/business/dashboard/ticket/$organizationId/gates`
- `/business/dashboard/ticket/$organizationId/scanner`
- `/business/dashboard/ticket/$organizationId/reports`
- `/business/dashboard/ticket/$organizationId/settings`
- `/business/dashboard/ticket/$organizationId/help`

The ticket organization boundary rejects a missing membership, a non-ticket organization, and unauthorized direct route access. `/business/dashboard` redirects a selected ticket membership to its canonical organization-scoped dashboard or scanner route.

## Ticket roles and permissions

Prepared roles:

- `owner`
- `admin`
- `event_manager`
- `venue_manager`
- `gate_staff`
- `scanner_staff`
- `report_viewer`

Prepared permissions:

- `ticket.dashboard.view`
- `ticket.orders.view`
- `ticket.orders.create`
- `ticket.orders.cancel`
- `ticket.orders.refund`
- `ticket.complimentary.create`
- `ticket.events.manage`
- `ticket.schedules.manage`
- `ticket.venues.manage`
- `ticket.layouts.manage`
- `ticket.pricing.manage`
- `ticket.gates.manage`
- `ticket.scan`
- `ticket.reports.view`
- `ticket.settings.manage`

Owner/admin receive organization-wide access. Venue-scoped memberships pass `venueIds` into every repository query. Scanner staff see only QR Scanner and Help navigation and use a scanner-only mutation contract. Report viewers use a report read contract without receiving Orders navigation or order-management actions.

## Ticket domain and repository layer

Domain types are in `src/features/ticket/types/index.ts`. Every primary Ticket record — venue, hall, layout, event, schedule, ticket type, order, issued ticket, and gate — contains `organizationId`.

Repository contracts are in `src/features/ticket/repositories/contracts.ts`:

- `VenueRepository`
- `SeatMapRepository`
- `EventRepository`
- `PricingRepository`
- `OrderRepository`
- `GateRepository`
- `ScannerRepository`
- `ReportRepository`
- `TicketRepositories` aggregate

The local adapter is `src/features/ticket/repositories/mock.ts`. Realistic seed data is isolated in `src/features/ticket/data/mock/seed.ts`. UI pages never import the seed; they use `TicketDataProvider`, which calls repository contracts with the selected membership scope.

All local repository reads filter by `organizationId`, and venue-scoped reads additionally filter by assigned venue IDs. Mutations check permissions inside the repository adapter, not only in button visibility.

## Demo accounts

- `owner@tanu.mn` / `tanu123`: service owner plus Ticket owner membership
- `admin@tanu.mn` / `tanu123`: service admin plus Ticket admin membership
- `events@tanu.mn` / `tanu123`: Ticket event manager
- `scanner@tanu.mn` / `tanu123`: scanner-only Ticket membership scoped to UB Palace

## Existing files modified

- `src/lib/auth-context.tsx`
- `src/lib/mock-data.ts`
- `src/lib/organization.ts`
- `src/routes/login.tsx`
- `src/routes/business.dashboard.tsx`
- `src/routes/business.dashboard.index.tsx`
- `src/routes/business.dashboard.government.$module.tsx`
- `src/routes/business.dashboard.chat.tsx`
- `src/components/dashboard/DashboardShell.tsx`
- `src/components/dashboard/nav-config.ts`
- `src/components/dashboard/pages/SettingsPage.tsx`
- `src/components/government/GovernmentDashboard.tsx`
- `src/components/government/GovernmentShell.tsx`
- generated `src/routeTree.gen.ts`

## Backend/API work still required

- Persist organizations, memberships, roles, and permission grants
- Server-side authorization for every organization- and venue-scoped request
- Venue, hall, versioned seat-map, event, schedule, pricing, order, ticket, gate, and scan endpoints
- Transactional ticket inventory and atomic seat holds with expiration
- Payment provider callbacks, reconciliation, refund, and idempotency handling
- Cryptographically signed QR payloads, secure scanner device sessions, and offline/retry rules
- Database uniqueness, foreign keys, audit records, and immutable financial history
- Real exports, notifications, image/file storage, observability, and production analytics
- Interactive seat-map editor and conflict-aware layout publishing

## Known phase-1 limitations

- Data and mutations are in-memory demo state and reset after reload.
- Payment labels and actions are simulations; no money is processed.
- Seat hold duration is configuration data only; no concurrent or atomic lock exists.
- QR validation uses local mock codes and is not a secure admission system.
- Layout editing is intentionally limited to metadata and simple previews.
- Import/export controls are local UI placeholders unless explicitly indicated.

## Verification

- Safety branch: `checkpoint/pre-ticket-workspace-20260803`
- Pre-ticket checkpoint commit: `2f7e0d4`
- Targeted Prettier: passed
- Targeted ESLint: 0 errors; Fast Refresh advisory warnings remain for established component/context export patterns
- TypeScript: `npx tsc --noEmit --pretty false` passed
- Production build: `npm run build` passed
- Development server: responds on `http://127.0.0.1:8081`
- Login and organization-scoped Ticket dashboard URLs return HTTP 200 from the development server
- Headless browser organization switch: Ticket → Service → Ticket updated the canonical URL, persisted organization ID, and business-specific sidebar content
