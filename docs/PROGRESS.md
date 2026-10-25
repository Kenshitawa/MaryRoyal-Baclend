# Progress

## Phase 0 — complete
- Built: initialized Git, wrote AGENTS.md, architecture analysis and decision log.
- Tested: reviewed operating rules; initial workspace was empty.
- Known issues: none for documentation phase.

## Phase 1 — foundation checkpoint (partial)
- Built: Next.js App Router/TypeScript/Tailwind shell; branded login/dashboard; credentials login with bcrypt, signed HTTP-only sessions, forced password change and login audit; random per-install session secret; per-IP throttling and account lockout; Director account create/list/suspend/reactivate/reset/unlock with one-time generated credentials; centralized role/action/scope matrix; security headers; PWA manifest/logo; seven seeded role accounts.
- Tested: `npm run setup`, lint, type-check, 6 Vitest tests, production build, 4 Playwright tests, local backup, and `npm audit` (0 vulnerabilities) passed.
- Known issues: session revocation/idle timeout, exhaustive per-route checks, CSP nonce hardening, bulk import/multi-role grants and offline service worker remain incomplete. CSP allows inline/eval scripts for the current framework.

## Phase 2 — academic core checkpoint (partial)
- Built: 30 demo learners; seeded Teacher assignments by grade/subject; learner register with Director create, Head Teacher/Deputy school view, Teacher assigned-grade view and Accountant identity-only fields; search, bounded pagination API, unique admission number, archive field, Zod validation, scope checks and audit records.
- Tested: Playwright checks every seeded non-Director role's current account/learner access and denies unauthenticated learner API requests.
- Known issues: no guardian links, full learner profiles/UPI/NEMIS, academic year/term/class setup, parent/learner data links or attendance. The UI loads at most 50 learners.

## Phase 3 — assessment checkpoint (partial)
- Built: seeded marks for two terms; assigned grade/subject mark entry; EE/ME/AE/BE mapping; strands, competencies and comments; version history; teacher submit, Head Teacher approve/return with reason, Director release; submitted marks lock, returned marks can be revised and resubmitted.
- Tested: Playwright exercises assessment creation, a Grade 9 assignment mismatch/IDOR denial, mark locking, Head Teacher approval and Director release. CBC helpers are in the unit suite.
- Known issues: grading cutoffs are hard-coded (80/60/40); no deadlines/reopen approval, bulk grid/import, report cards/PDF or parent release portal.

## Phase 4 — finance checkpoint (partial)
- Built: school-scoped invoices and fee lines; KES payments by M-Pesa, cash, bank or cheque; unique M-Pesa codes; transactional sequential receipt numbers; overpayment credits applied to later invoices; versioned payment history; reasoned payment voids; append-only audit events; branded receipt page that prints or saves as PDF; Accountant identity-only learner selection.
- Tested: Playwright covers invoice, overpayment, credit carry-forward, duplicate M-Pesa rejection, receipt rendering, minimum void reason and successful void. Schema setup, lint, type-check and unit suite passed.
- Known issues: fee structures/templates, adjustments, Director waiver approval, expenses/payroll, statements and finance PDF/Excel reports are not built. Voiding a payment whose credit was already applied is blocked pending reconciliation. The app is not suitable for real financial data.
- Next: implement operations modules, then family portals, analytics, hardening and document remaining gaps.

## Phase 5 — operations checkpoint (partial)
- Built: mobile-first daily attendance register for school leaders and assigned teachers; present/absent/late actions; date selection in EAT; server-side assignment and learner/class IDOR checks; transactional upsert and audit entry.
- Tested: Playwright covers teacher taking attendance, reading back the register, tampered class/learner denial and access attempts for all seeded roles. Full six-test E2E suite passed.
- Known issues: attendance correction approval/lock window, teacher attendance, timetable/clash checks, discipline, duty/cover, announcements, messaging, lesson plans, homework/resources and calendar are not built.
- Next: add further operations workflows, role analytics/exports and family access.

## Phase 6 — family access checkpoint (partial)
- Built: explicit Director-managed parent/learner links; seed parent has two children and learner account its own record; linked child switching; learner portal with attendance and released marks; parent additionally sees scoped fee balances and linked printable receipts; learner gets no finance data; scoped API data and receipt access.
- Tested: Playwright creates a parent account, links it to the new learner, signs in and verifies that learner-only access; role sweep checks linked data, released result filtering, fee-role access and denies guardian admin endpoints to non-Directors.
- Known issues: the portal lacks report-card PDFs, homework, notifications, timetable, message channel and editable contact details. Family access needs more exhaustive route/IDOR coverage. Analytics, search and dark mode remain unbuilt; the only export is the Director learner-register CSV.
- Next: complete other role portals and admin flows, then harden, accessibility/performance review and role guides.

## Phase 7 — hardening checkpoint (partial)
- Built: centralized matrix now separates assessment review/release permissions; mark patch/workflow routes reject unauthorized roles before record lookup; Director-only CSV export escapes spreadsheet formulas and logs exports; Director/Head Teacher audit viewer; public privacy notice; expanded direct API role/action tests.
- Tested: 6 Playwright tests include forbidden writes for every seeded non-Director role, linked learner scope, unauthorized assessment workflow/edit behavior, guardian endpoints, export denial and audit visibility. 6 Vitest tests exhaustively check role/resource/action grants. Setup, lint, type-check, production build, local login HTTP check, backup and `npm audit` (0 vulnerabilities) passed.
- Known issues: this is not a full security certification or a test of every route/IDOR combination. Login throttling is in-memory, sessions lack idle timeout and revocation, CSP uses unsafe-inline/eval, privacy request workflow, database-enforced audit immutability and broader business modules remain incomplete. Do not use real pupil or finance data.
- Next: complete remaining features and security/privacy work in docs/ROADMAP.md. No deployment performed.

## Phase 8 planning document
- Built: docs/DEPLOYMENT_GUIDE.md covers future PostgreSQL migration, hosting evaluation, HTTPS, secrets, backups and monitoring. No deployment was performed.

## UI refinement — completed
- Built: polished Mary Royal sign-in and role dashboards; installed the supplied Mary Royal Junior School emblem in the app and PWA icon; clarified the motto “Hard work pays”; added fixed deep-blue desktop navigation and fixed mobile navigation, with distinct navy treatment in dark mode; fixed theme persistence/hydration; improved responsive screens and account danger/status colors. New learner admissions receive sequential `MR-##` numbers.
- Built: teachers alone can create/edit learner marks; Head Teacher review and Director release remain. Director dashboard now reports school enrollment, attendance, released results, fee collection and outstanding balances by class, plus monthly payroll totals. Added Accountant-managed staff payroll entries, mark-paid flow, version history and audit events; payroll demo figures are seeded examples.
- Tested: `npm run setup` passed and generated Prisma client/synced SQLite; `npm run lint` passed; `npm run typecheck` passed; `npm test` passed (7 tests); `npm run test:e2e` passed (6 browser tests covering theme persistence, fixed navigation, mobile width, Director mark-entry denial, admissions/accounts, role access, teacher assessment workflow, payroll/payment and attendance); `npm run build` passed; Director dashboard was opened locally and visually checked in light and dark modes; `git diff --check` passed before commit.
- Known issues: the dark theme still uses targeted shared CSS overrides; broader visual QA across each workflow screen and real school devices remains. Payroll is a basic monthly sheet, not full statutory payroll/accounting; seed salaries are fictional demo values. The system remains a local prototype; see ROADMAP for remaining modules/security work.
- Next: continue remaining modules and security work listed in ROADMAP. No cloud deployment was performed.

## UI and account-security follow-up
- Built: users can open **Profile & security** from their avatar, upload a PNG/JPEG/WebP photo (2 MB max, signature checked), and change their password after validating the current password. Sessions expire after 10 minutes idle, with signed HTTP-only idle tokens renewed by active server requests and a client inactivity timer. Director gets an eye-icon shortcut to the existing role-protected audit trail for sign-ins and recorded changes; no password values are logged.
- Built: saved dark mode now applies from a `beforeInteractive` document-root script before first paint, removing the light-to-dark flash. Demo seeding is idempotent and now includes two terms of invoices, partial sample payments and payroll so Director finance tiles show real demo totals immediately. Family links are anchored to the official seed roster so repeated E2E cleanup cannot remove them.
- Tested: Playwright full suite passed (6/6), including profile read/photo upload, persisted theme, fixed/mobile navigation, role denial/scope, CBC approval/release, payroll, payments and attendance; test cleanup preserves the seeded attendance row state and removes test accounts/files. Unit tests passed (7); lint and strict type-check passed; `git diff --check` passed; production build passed with 31 routes compiled. Local visual check confirmed 30 learners, 5 staff, 60 demo invoices, 34 sample payments, KES 293,000 collected, KES 907,000 balance and KES 201,000 monthly payroll.
- Known issues: local profile image uploads are files under `public/uploads/avatars`; deletion/replacement retention is not automated. Idle expiration and upload validation are application safeguards, not a formal security certification. Broader device and accessibility QA remains in ROADMAP.
- Next: continue the remaining features and security work in ROADMAP.md. No deployment performed.
