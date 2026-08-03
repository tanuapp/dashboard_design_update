# Tanu Business Government Workspace Migration

Last updated: 2026-08-03

## Objective

Tanu Business remains one application and one shared codebase. The authenticated organization now has an `organizationType` discriminator:

```ts
type OrganizationType = "private" | "government";
```

Existing sessions and organizations without this field are normalized to `private`. This is the backwards-compatibility rule that prevents the government workspace rollout from changing private booking, service, sales, revenue, customer, employee, attendance, or report behavior.

## Workspace selection

The shared `/business/dashboard` layout selects a workspace after authentication:

- `private` → existing `DashboardShell`, private navigation, private dashboard and existing stores.
- `government` → `GovernmentShell`, permission-aware government navigation and government dashboard.

The main account types remain:

- Admin
- Employee

Private organizations continue to support the existing `owner`, `admin`, and `employee` demo roles. Government authorization adds a separate `permissionPreset` field without replacing the main account type.

## Existing private modules

These modules are unchanged:

1. Private business dashboard
2. Calendar
3. Bookings
4. Employees
5. Employee schedule and attendance
6. Services
7. Customers
8. Finance and revenue
9. Private business reports
10. Branches
11. Organization profile
12. Billing and plans
13. Settings
14. Employee personal dashboard
15. Employee bookings, clients, performance, leave and schedule

No existing private route or private data mutation contract was removed or renamed.

## Shared modules and platform services

The following remain shared across organization types:

- Authentication session and logout
- Tanu Business branding and design tokens
- Light and dark mode
- Responsive sidebar behavior
- Global search interaction pattern
- Notification interaction patterns
- Shared form, modal, table, badge, input, select, tabs, tooltip and dialog components
- Organization onboarding storage
- Main Admin and Employee account types
- Accessibility and responsive layout conventions

The private and government workspaces use separate domain stores so government mock operations cannot mutate private booking or finance data.

## Government-only modules

1. Government Dashboard
2. Official Documents
3. Tasks and Assignments
4. Meetings and Events
5. Petitions and Complaints
6. Human Resources
7. Attendance
8. Resolutions and Decisions
9. Surveys
10. Reports
11. Employee Directory
12. Training
13. Notifications

Internal chat, direct messaging and chat groups are intentionally excluded from the government workspace. This follows the latest product decision for government organizations; private-organization chat remains unchanged.

## New routes

The government dashboard uses the shared dashboard index:

- `/business/dashboard`

Government module URLs are handled by the permission-aware route pattern:

- `/business/dashboard/government/$module`

Current module URLs:

- `/business/dashboard/government/documents`
- `/business/dashboard/government/tasks`
- `/business/dashboard/government/meetings`
- `/business/dashboard/government/petitions`
- `/business/dashboard/government/hr`
- `/business/dashboard/government/attendance`
- `/business/dashboard/government/resolutions`
- `/business/dashboard/government/surveys`
- `/business/dashboard/government/reports`
- `/business/dashboard/government/directory`
- `/business/dashboard/government/training`
- `/business/dashboard/government/notifications`

Private organizations that open a government URL receive an organization-type guard message. Government users without module permission receive an access-denied state.

## Permission presets

Implemented presets:

- System Admin
- Organization Admin
- Executive
- Department Head
- Records Officer
- HR Officer
- Petition Officer
- Employee
- Auditor
- Read Only

Permissions currently control module visibility and direct route access. `Auditor` and `Read Only` presets do not receive create actions in government module headers.

### Pending permission work

- Server-authoritative permission enforcement
- Action-level permissions for create, edit, approve, reject, archive, export and delete
- Department and record scope constraints
- Delegation and temporary acting-role periods
- Row-level confidential-document access
- Permission change approval and immutable audit records

## New frontend models

Implemented TypeScript domain models:

- `OrganizationType`
- `GovernmentPermissionPreset`
- `GovernmentModuleKey`
- `GovernmentActivity`
- `GovernmentDepartment`
- `GovernmentEmployee`
- `OfficialDocument`
- `GovernmentTask`
- `GovernmentMeeting`
- `GovernmentPetition`
- `GovernmentRequest`
- `GovernmentNewsItem`

The HR hierarchy is represented by `GovernmentDepartment.level` and `parentId`:

```text
Organization
└── Department
    └── Division
        └── Unit
            └── Position
                └── Employee
```

`GovernmentEmployee` currently includes position, government position classification, department, permission preset, appointment date, presence and online state. The HR information architecture exposes appointments, transfers, dismissals, employment history, job descriptions, leave, business trips, training, attendance and audit history.

### Pending model extensions

- Versioned job descriptions and position catalogs
- Appointment, transfer and dismissal order entities
- Full employment-history event model
- Leave balance and leave approval model
- Business trip itinerary, expense and approval models
- Training enrollment, assessment and certification entities
- Daily attendance ledger and correction requests
- Immutable audit event model with before/after snapshots
- Official document versions, signatures, attachments and routing history
- Meeting agenda, minutes, attendance and decisions
- Survey questions, answers, anonymity settings and result snapshots

## Request workflow

The request creation modal implements:

- Request type
- Request subtype
- Request title
- Responsible department
- Responsible employee
- Priority
- Due date
- Description
- File attachment metadata
- Related official document
- Reviewing manager
- Save as draft
- Submit

Workflow statuses:

1. Draft
2. Submitted
3. Received
4. In Review
5. Resolved
6. Closed

Phase 1 persists created requests in the government frontend store for the active application session. Submitted requests also create a latest-activity feed item.

## API requirements

No existing private backend endpoint needs to change behavior. A production government rollout requires new namespaced APIs or equivalent service boundaries.

### Organization and permissions

- `GET/PATCH /api/organizations/:organizationId`
- `GET /api/organizations/:organizationId/permission-presets`
- `PUT /api/organizations/:organizationId/users/:userId/permission-preset`
- Session claims: `organizationId`, `organizationType`, `accountType`, `permissionPreset`, department scope

### Organization structure and HR

- CRUD organization structure, positions and employees
- Appointment, transfer and dismissal commands
- Employment history and job description versions
- Leave, business trip and training workflows
- Attendance check-in/check-out and correction workflow
- HR audit history

### Official documents and resolutions

- Register incoming and outgoing documents
- Upload and virus-scan attachments
- Document routing, ownership and due dates
- Review, approve, reject, digitally sign and archive
- Resolution/decision registry and implementation tracking
- Version and audit history

### Tasks, meetings and surveys

- Task assignment, dependency, progress and status history
- Meeting/event scheduling, attendees, agenda, minutes and decisions
- Survey authoring, publishing, response collection and aggregation

### Petitions and requests

- Petition intake from web, email, paper and phone channels
- Classification, assignment, SLA and citizen response delivery
- Request draft, submit, receive, review, resolve and close transitions
- Attachment and related-document links

### Activity and notifications

- Organization activity stream
- Notification preferences, read state and delivery channels
- Presence and online/offline state

### Reporting and audit

- Permission-scoped report queries
- Asynchronous Excel/PDF exports
- Immutable audit trail
- Retention, archival and legal-hold policies

## Completed work

### Phase 1 — foundation

- Added backwards-compatible `organizationType` support.
- Added government demo Admin and Employee sessions.
- Added government-aware onboarding selection.
- Kept private onboarding fields and validation unchanged for private organizations.
- Added government structure and permission onboarding steps.
- Added a separate government data provider without changing private store mutations.
- Added all permission presets and module access mapping.
- Added government route and organization-type guards.

### Phase 2 — government workspace UI

- Added responsive government sidebar and global search.
- Added role-aware module navigation.
- Added light/dark-mode government dashboard.
- Added latest activity feed for documents, tasks, meetings, announcements, petitions, attendance and document decisions.
- Added Activities, Meetings and Tasks dashboard tabs.
- Added all eight required summary cards.
- Added active-employee, department/unit, profile and logout sidebar sections.
- Added electronic attendance card.
- Added organization/government news, FAQ, petition statistics, quick notes and quick links.
- Explicitly excluded chat, direct messaging and group messaging from the government workspace.

### Phase 3 — module information architecture

- Added modern tables/cards for official documents, tasks, meetings, petitions, HR, attendance, resolutions, surveys, reports, directory, training, notifications and messaging.
- Added the HR hierarchy and government position classification display.
- Added permission-aware create controls.
- Added search/filter layout and export entry points.

### Phase 4 — request workflow UI

- Added the complete request creation form.
- Added draft and submit actions.
- Added client-side required-field validation.
- Added attachment name capture and related-document selection.
- Added submitted requests to the activity feed.

## Pending work

The following are intentionally pending because this repository currently uses frontend mock stores and no production government backend contract was supplied:

1. Database migrations and persistent government entities
2. Real API endpoints listed above
3. Server-authoritative permission and department-scope enforcement
4. Digital signature and official document approval integration
5. Antivirus-scanned object storage for attachments
6. Email/SMS/push delivery and citizen response channels
7. Real-time employee presence integration; government chat is out of scope
8. Attendance device, QR or identity-provider integration
9. Full HR lifecycle workflows and audit snapshots
10. Meeting minutes, agendas and decision follow-up
11. Survey builder and response analytics
12. Report generation workers and downloadable files
13. Localization and formal terminology review with a government records officer
14. Automated unit, integration, accessibility and end-to-end test suites
15. Production security, retention, backup and compliance review

## Demo access

- Government Admin: `government@tanu.mn`
- Government Employee: `gov.employee@tanu.mn`
- Password: `tanu123`

Private demo accounts remain available and unchanged.
