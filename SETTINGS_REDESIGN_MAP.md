# Tanu Business Settings redesign map

## Safe checkpoint

- Local checkpoint created before the redesign: `765bc29 chore: checkpoint before settings redesign`.
- The checkpoint was not pushed and published history was not rewritten.

## Existing Settings audit

The previous `/business/dashboard/settings` page was a single-page, eight-tab view:

1. General organization settings
2. Booking settings
3. Working hours
4. Notifications
5. Access and permissions
6. Branches
7. Payment
8. Security

Related settings-like capabilities already existed as separate routes and remain the source of truth:

| Capability                     | Existing route                          | Redesign treatment                                      |
| ------------------------------ | --------------------------------------- | ------------------------------------------------------- |
| Organization profile           | `/business/dashboard/org-profile`       | Linked from Profile settings                            |
| Branches                       | `/business/dashboard/branches`          | Linked from Branch settings; existing route unchanged   |
| Employees                      | `/business/dashboard/employees`         | Linked from Employee settings; existing route unchanged |
| Services                       | `/business/dashboard/services`          | Linked for private organizations only                   |
| Schedule and attendance        | `/business/dashboard/employee-schedule` | Linked from Schedule and Attendance settings            |
| Billing and subscription       | `/business/dashboard/billing`           | Linked for private organizations only                   |
| Standalone QR promotion editor | `/business/dashboard/qr-promotion`      | Preserved; also embedded inside Settings                |

No settings API client, API-integration settings page, audit-log page, persistent upload service, or real export service was present. Those items were not shown as fake functional settings.

## New information architecture

The primary application sidebar is unchanged. `/business/dashboard/settings` now contains a secondary Settings navigation column and a flexible content panel. On tablet/mobile the secondary navigation becomes a select control.

| Group                    | Private organization                                   | Government organization                                           |
| ------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Үндсэн тохиргоо          | Organization, Profile, Branches, Employees, Access     | Organization, Public profile, Departments, Civil servants, Access |
| Үйл ажиллагааны тохиргоо | Services, Booking, Schedule, Attendance, Notifications | Schedule, Attendance, Notifications                               |
| Сурталчилгаа ба холбоос  | QR, Promotional materials, Public links                | QR, Promotional materials, Public links                           |
| Систем                   | Security, Billing                                      | Security                                                          |

Private-only service pricing, booking, appointment QR types, and billing are not shown to government organizations. Government terminology and QR destinations come from one centralized organization-type configuration.

## Route map

No backend route was changed and no separate Settings application was created.

- Main route: `/business/dashboard/settings`
- Section addressing: `/business/dashboard/settings?section=<section-key>`
- Section keys: `organization`, `profile`, `branches`, `employees`, `access`, `services`, `booking`, `schedule`, `attendance`, `notifications`, `qr`, `promotional-materials`, `public-links`, `security`, `billing`
- Existing standalone QR route remains: `/business/dashboard/qr-promotion`

Invalid or organization-inappropriate section values fall back to Organization settings.

## Preserved functionality

- Existing organization fields remain connected to `updateOrgProfile`.
- Existing booking fields remain connected to `updateBookingSettings`.
- Existing branch working-hours and schedule fields remain connected to `updateBranch`.
- Notification, payment, security/2FA, and permission controls remain available with their existing frontend behavior.
- Existing profile, branch, employee, service, schedule/attendance, and billing routes are linked rather than duplicated.
- Existing private-business modules and backend behavior are unchanged.
- The new Save Bar provides dirty state, reset, validation, loading feedback, success/error toasts, and a browser unload warning.

## New QR section

The QR workspace is frontend-only and uses local React state. It supports:

- Organization-scoped records with an explicit `organizationId` and edit/delete guards.
- Separate private and government QR-type presets.
- Create, edit, enable/disable, confirmed delete, copy, PNG download, and SVG download.
- Small, medium, large, and print-quality sizes.
- Public URL validation that rejects internal dashboard paths and token-like query parameters.
- Optional branch, employee, and service relationships where relevant.
- Optional expiration, colors, frame, CTA, status, and a small logo overlay.
- Browser QR generation with a quiet zone and high error correction when the logo is enabled.

The QR state model is defined in `src/lib/settings/qr-data.ts`; it is not a database model.

## New promotional-material section

The existing QR promotion editor is reused inside Settings and can select an active organization QR. It includes:

- Organization/logo/content/branch/contact/CTA controls.
- Eight controlled visual templates.
- A5 stand, A4 poster, table tent, brochure cover, counter sign, social post, story, window sticker, and QR-only card formats.
- Correct `148 × 210 mm` A5 and brochure preview/print ratio.
- Live preview, QR positioning, local image placeholders, browser print preview, duplicate, and local draft actions.
- QR PNG/SVG downloads are real browser downloads. Promotional PNG/PDF buttons remain explicit frontend mock interactions because no export renderer exists.

## Public links

The Public links section manages local public-profile, booking/request, and short-link values plus visibility/status controls. These URLs are passed into QR creation as reusable quick destinations. No public-page backend was added.

## Access and organization isolation

- Existing private Settings access remains protected by `OwnerOnlyGuard`.
- Government Settings is available only to System Admin and Organization Admin permission presets.
- Government users without Settings permission receive an access-denied state.
- The government main navigation only exposes Settings to roles that include the `settings` module.
- QR lists and mutations filter/guard by the active organization ID; a seeded foreign-organization record is intentionally excluded.

## Backend, API, and persistence requirements

### Changes made

- Backend: none
- Database: none
- API: none
- File storage: none

### Required for production persistence later

1. Settings read/update endpoints with validation and permission enforcement.
2. Organization-scoped QR CRUD endpoints and a persistent QR model.
3. QR scan redirect/analytics endpoint if scan counts are required.
4. Logo/cover upload and storage integration.
5. Server or trusted client export pipeline for production PNG/PDF files.
6. Public-profile/link endpoints and visibility enforcement.
7. Audit events for settings and QR mutations if an audit-log module is introduced.

Until those APIs exist, new QR records, public-link changes, promotional drafts, and uploads reset with the browser session/page lifecycle.

## Changed implementation files

- `src/components/dashboard/pages/SettingsPage.tsx`
- `src/components/dashboard/pages/QrPromotionPage.tsx`
- `src/components/dashboard/settings/SettingsShell.tsx`
- `src/components/dashboard/settings/SaveBar.tsx`
- `src/components/dashboard/settings/QrSettingsPage.tsx`
- `src/lib/settings/config.ts`
- `src/lib/settings/qr-data.ts`
- `src/routes/business.dashboard.settings.tsx`
- `src/components/government/government-nav.ts`
- `src/lib/government/types.ts`

## Completion status

| Area                                     | Status                                                    |
| ---------------------------------------- | --------------------------------------------------------- |
| Existing Settings audit and migration    | Complete                                                  |
| Two-level responsive Settings workspace  | Complete                                                  |
| Existing settings preservation           | Complete                                                  |
| Private/government configuration         | Complete                                                  |
| QR management UI and local behavior      | Complete                                                  |
| Promotional material formats and preview | Complete                                                  |
| Public-link UI and QR reuse              | Complete                                                  |
| Persistent backend/API/storage           | Pending by design; outside frontend-only scope            |
| Real promotional PNG/PDF renderer        | Pending; current actions are labelled mock interactions   |
| API integration and audit-log settings   | Pending because no existing functional modules were found |

## Verification results

- Formatter: passed for every redesign file and this migration document.
- Scoped ESLint: passed for every changed Settings, QR, route, and government-navigation file.
- Repository-wide ESLint: the existing repository baseline still reports 5,639 `prettier/prettier` errors and 13 `react-refresh/only-export-components` warnings across 86 unrelated/pre-existing files. No bulk rewrite was performed because it would create a large unrelated diff.
- Automated tests: no `test` script or configured test runner exists in `package.json`.
- Production build: passed with `npm run build`.
- Dev server smoke check: `/login` and `/business/dashboard/settings?section=qr` both returned HTTP 200.
- QR generation smoke test: passed for private booking and government request URLs in both PNG data-URL and SVG output using high error correction and a four-module quiet zone.
- Diff whitespace check: passed with `git diff --check` (Git only reports the repository's existing LF-to-CRLF checkout notice).
