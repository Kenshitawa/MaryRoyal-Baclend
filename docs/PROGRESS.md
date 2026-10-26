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
- Built: 30 demo learners; seeded Teacher assignments by grade/subject; learner register with Director create, Head Teacher/Deputy school view, Teacher assigned-grade view and restricted staff learner fields; search, bounded pagination API, unique admission number, archive field, Zod validation, scope checks and audit records.
- Tested: Playwright checks every seeded non-Director role's current account/learner access and denies unauthenticated learner API requests.
- Known issues: no guardian links, full learner profiles/UPI/NEMIS, academic year/term/class setup, parent/learner data links or attendance. The UI loads at most 50 learners.

## Phase 3 — assessment checkpoint (partial)
- Built: seeded marks for two terms; assigned grade/subject mark entry; EE/ME/AE/BE mapping; strands, competencies and comments; version history; teacher submit, Head Teacher approve/return with reason, Director release; submitted marks lock, returned marks can be revised and resubmitted.
- Tested: Playwright exercises assessment creation, a Grade 9 assignment mismatch/IDOR denial, mark locking, Head Teacher approval and Director release. CBC helpers are in the unit suite.
- Known issues: grading cutoffs are hard-coded (80/60/40); no deadlines/reopen approval, bulk grid/import, report cards/PDF or parent release portal.

## Phase 4 — finance checkpoint (partial)
- Built: school-scoped invoices and fee lines; KES payments by M-Pesa, cash, bank or cheque; unique M-Pesa codes; transactional sequential receipt numbers; overpayment credits applied to later invoices; versioned payment history; reasoned payment voids; append-only audit events; branded receipt page that prints or saves as PDF; scoped learner selection.
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
- Built: teachers alone can create/edit learner marks; Head Teacher review and Director release remain. Director dashboard now reports school enrollment, attendance, released results, fee collection and outstanding balances by class, plus monthly payroll totals. Added staff payroll entries prepared by the Head Teacher and authorized by the Director, with version history and audit events; payroll demo figures are seeded examples.
- Tested: `npm run setup` passed and generated Prisma client/synced SQLite; `npm run lint` passed; `npm run typecheck` passed; `npm test` passed (7 tests); `npm run test:e2e` passed (6 browser tests covering theme persistence, fixed navigation, mobile width, Director mark-entry denial, admissions/accounts, role access, teacher assessment workflow, payroll/payment and attendance); `npm run build` passed; Director dashboard was opened locally and visually checked in light and dark modes; `git diff --check` passed before commit.
- Known issues: the dark theme still uses targeted shared CSS overrides; broader visual QA across each workflow screen and real school devices remains. Payroll is a basic monthly sheet, not full statutory payroll/accounting; seed salaries are fictional demo values. The system remains a local prototype; see ROADMAP for remaining modules/security work.
- Next: continue remaining modules and security work listed in ROADMAP. No cloud deployment was performed.

## UI and account-security follow-up
- Built: users can open **Profile & security** from their avatar, upload a PNG/JPEG/WebP photo (2 MB max, signature checked), and change their password after validating the current password. Sessions expire after 10 minutes idle, with signed HTTP-only idle tokens renewed by active server requests and a client inactivity timer. Director gets an eye-icon shortcut to the existing role-protected audit trail for sign-ins and recorded changes; no password values are logged.
- Built: saved dark mode now applies from a `beforeInteractive` document-root script before first paint, removing the light-to-dark flash. Demo seeding is idempotent and now includes two terms of invoices, partial sample payments and payroll so Director finance tiles show real demo totals immediately. Family links are anchored to the official seed roster so repeated E2E cleanup cannot remove them.
- Tested: Playwright full suite passed (6/6), including profile read/photo upload, persisted theme, fixed/mobile navigation, role denial/scope, CBC approval/release, payroll, payments and attendance; test cleanup preserves the seeded attendance row state and removes test accounts/files. Unit tests passed (7); lint and strict type-check passed; `git diff --check` passed; production build passed with 31 routes compiled. Local visual check confirmed 30 learners, 5 staff, 60 demo invoices, 34 sample payments, KES 293,000 collected, KES 907,000 balance and KES 201,000 monthly payroll.
- Known issues: local profile image uploads are files under `public/uploads/avatars`; deletion/replacement retention is not automated. Idle expiration and upload validation are application safeguards, not a formal security certification. Broader device and accessibility QA remains in ROADMAP.
- Next: continue the remaining features and security work in ROADMAP.md. No deployment performed.


## Secretary workflows and approval integrity — current checkpoint
- Built: added Secretary as the learner-admission and fee-payment intake role; new admissions get automated `MR-##` numbers and remain pending until Head Teacher approval, while Director has visibility and audit oversight. Secretary payment entries for cash, M-Pesa, bank or cheque remain pending until Head Teacher/Director confirmation; receipts become available only after confirmation. Central permissions now distinguish invoice creation, payment entry, confirmation and voiding. Head Teacher prepares invoices/payroll and the Director authorizes payroll.
- Built: added Secretary complaint intake on behalf of a parent, learner or Head Teacher, staff routing and replies, with schoolwide visibility for Head Teacher/Director and assignment/owner scoping for other roles. Added daily teaching logs, teacher assignments and learner submissions with teacher marking; marked submissions cannot be overwritten. Retired Accountant in the role enum and account form; the setup migration preserves legacy accounts as suspended Head Teacher records.
- Fixed: Next.js root theme script ordering and first-paint dark mode; replaced internal workspace anchors with Next `Link`; teacher learner navigation and class-teacher-only attendance; parent dashboard sign-out duplication. Removed Secretary ability to void payments after tightening the finance authorization matrix.
- Tested: `npm run typecheck`, `npm run lint`, and `npm test` passed (7 unit tests). `npx playwright test --reporter=line` passed (7/7 browser tests), including theme persistence, fixed/mobile navigation, role denial/scope, assessment approval/release, Secretary pending admission and payment confirmation, complaint visibility/replies, assignment auto-mark and manual marking, teaching-log review, payroll authorization and attendance. `npm run build` passed and compiled 38 routes. Local `GET http://localhost:3000` returned HTTP 200 and the login page. `git diff --check` passed; the remaining LF-to-CRLF notices are Git platform notices, not whitespace errors.
- Known issues: this remains a local prototype and must not be used with real learner/finance data. Full LMS/video/games, timetable/library/discipline, full finance exports and PDF downloads, advanced analytics, complete PWA offline behavior, exhaustive IDOR coverage, and slow-network/accessibility/device review remain in `docs/ROADMAP.md`.
- Next: continue the remaining modules from `docs/ROADMAP.md`; no cloud deployment was performed.

## Learner learning space and automatic admission accounts — 2026-10-25
- Built: removed Learner complaint navigation and denied complaint API access in the centralized permission matrix. Every new admission now creates a linked learner login with a generated `mr-##@learners.maryroyal.ac.ke` address, hashed one-time password, forced first-login change and printable credential slip. Secretary-created pending admissions keep the account suspended until Head Teacher approval activates it.
- Built: added the Learner grade-based learning dashboard with released marks, assignment feedback and submission entry point, subject progress, class-scoped teacher video/reading resources, attendance summary, and Number Quest/Science Explorer games with persisted scores. Teachers can publish secure HTTPS resources to their assigned grade/subject pairs.
- Tested: `npm run setup` passed (database schema synced and Prisma Client generated); `npm run lint`, `npm run typecheck` and `npm test` passed (7 unit tests); `npm run test:e2e` passed (8 browser tests), including admission/login activation, learner complaint denial, grade-scoped resources, saved game activity, assignment delivery/submission, theme initialization and cross-role checks. `npm run build` passed on Next.js 15.5.28; local `GET /` returned HTTP 200. `git diff --check` passed.
- Known issues: learning resources are HTTPS links rather than locally uploaded files; the two games store simple quiz scores and do not yet constitute a full CBE course authoring/LMS suite. Learner admission credentials are displayed once to the admitting staff member, so they must be handed to the guardian privately.
- Next: expand content authoring/uploads, interactive grade-specific learning activities, full CBE progress analytics and parent-visible progress; continue the broader remaining modules in `docs/ROADMAP.md`. No deployment was performed.

## Upgrade Round 2 — U1 and U2 foundations — 2026-10-25
- Built: restored ACCOUNTANT as a distinct role and updated the permission matrix/navigation/account form. Secretary can view fee totals and balances but cannot create or void payments or open receipts. New admissions no longer create learner accounts automatically; Director/Secretary can explicitly create one from the register, and pending accounts stay suspended until admission approval. Complaint access is limited to Parent, Head Teacher and Director; parent threads have category, recipient, status, replies and audit events. Removed the old role-remapping setup script.
- Built: default seed now creates only the Director, Mary Royal school identity and CBC level defaults. Added optional synthetic `seed:demo`, confirmed `reset:fresh`, generated SQLite migration `20261025_round2_defaults`, and updated setup/docs/demo login instructions. E2E runner seeds demo data explicitly. The local reset was executed before the test seed.
- Tested: `npm run setup`; `npm run reset:fresh -- --yes`; `npm run lint`; `npm run typecheck`; `npm test` (9 tests); `npm run test:e2e` (8/8 Playwright tests); `npm run build` (42 route outputs). The dev server served the login and dashboard during the E2E run. Build and test checks passed after the role/seed changes.
- Known issues: new admission workflow remains the short legacy form (name/grade/gender); parent accounts are not matched by phone/ID; complaints do not support attachments or two-recipient fan-out; full setup models/pages and broad role-by-route/IDOR coverage are outstanding. See `docs/ROADMAP.md`.
- Next: U3 smart breadcrumbs/back navigation and unsaved-form protection, then continue U4–U10 in order. No deployment was performed.

## Upgrade Round 2 — U3 navigation foundations — 2026-10-25
- Built: shared `PageNavigation` adds role-aware breadcrumbs, desktop back and a mobile detail app bar, with role-specific home destinations for staff, parents and learners. It records same-user in-app paths, uses safe parent fallbacks for deep links, restores scroll position on return and warns before internal navigation, browser back or leaving a page with unsaved forms. The desktop logo and mobile brand now return to the role's home dashboard. Receipt pages include the same breadcrumb/back experience.
- Tested: `npm run lint`, `npm run typecheck`, and `npm test` passed (9 unit tests); `npm run test:e2e` passed all 9 Playwright tests, including navigation across all eight roles; `npm run build` passed with 42 route outputs; local `GET /` returned HTTP 200; `git diff --check` passed. The navigation test covers detail routes, mobile controls, unsaved-form dismissal/acceptance and browser back/forward. The finance workflow test reuses its newly admitted learner and no longer depends on another test's demo fixture.
- Known issues: URL-based filter state is not yet consistent across list pages; scroll and path history are preserved, but some client-only filter state may reset. Routes outside the shared portal shell still need a navigation/accessibility audit. The all-role navigation test takes about two minutes on this Windows development setup.
- Next: U4 admission wizard and data model, then profile, exams/rubrics and remaining finance/UI work. No deployment was performed.

## Upgrade Round 2 — U4 admission and U5 profile checkpoint — 2026-10-25
- Built: seven-step admission draft/resume, normalized learner/guardian/emergency/pick-up/residence/health data, validated private document uploads, consent, required-document checklist, branded admission PDF, explicit learner login and parent account link/create workflow. Learner records now open role-aware profiles; sensitive health fields are fetched only for permitted school leaders and the learner's class teacher, and each health view is audited. Accountant has a restricted learner directory/profile showing only basic identity and finance. Director and Head Teacher can browse staff profiles; staff can view their own profile. Staff fields not present in the data model are disclosed as unavailable.
- Fixed: Playwright mobile dashboard overflow after viewport resize; isolated E2E marks now use a valid unused term and clean up after the test; ESLint excludes the isolated `.next-e2e` output. Added `staff` and `learner-identity` scopes to the central permission matrix.
- Tested: `npm run lint` passed; `npm run typecheck` passed; `npm test` passed (13 tests); focused Playwright dashboard/marks tests passed (2/2); focused all-role access and profile sweep passed (1/1). The last full Playwright run passed 8/9; its only failure was an assertion that expected a redirect status while Playwright followed the redirect. The check now disables redirect following and the focused all-role test passes. `npm run build` passed; generated 46 static pages/routes.
- Known issues: U4 still needs passport-photo crop, sibling parent-link E2E, admission invoice preview, and secure document preview/download from learner profiles. U5 still needs avatar display on learner profiles, full profile IDOR/tab coverage, assessment trend charts, receipt links, learner activity/discipline timeline, and stored TSC/qualification/attendance/punctuality fields. Major U6–U10 requirements remain; see `docs/ROADMAP.md`. No deployment was performed.
- Next: continue U6 exams/rubrics/attendance, then U7 complaints, U8 KICD curation, U9 fee structures and U10 page-by-page QA. Admission/profile work is committed as `fa682a9`.

## Upgrade Round 2 — U6 attendance overview checkpoint — 2026-10-25
- Built: Director, Head Teacher and Deputy attendance now starts with a schoolwide daily summary, class register completion progress, and present/absent/late totals. Teacher attendance remains class-teacher-only.
- Tested: `npm run lint`, `npm run typecheck`, `npm test` (13 tests), and `npm run build` passed. The prior focused all-role Playwright sweep passed before this view-only dashboard addition; no new E2E run was made for the dashboard.
- Known issues: staff attendance is not modeled; date-range analytics, stream/gender split, absentee follow-up/parent notification, reminders/exports, Deputy exam sessions/timetable, active-exam mark filtering, and managed rubrics remain incomplete. See ROADMAP.
- Next: implement U6 exams and rubric workflow, then complete remaining U6 attendance and proceed U7–U10.

## Upgrade Round 2 — U8 KICD learning videos and full browser-suite checkpoint — 2026-10-25
- Built: added the verified KICD Edu TV library, grade/subject/strand tags, teacher/leader curation, official-channel metadata verification, learner recommendations from released weak-topic results, watched tracking, privacy-enhanced playback and role-scoped API access. Ordinary teacher video resources are now excluded from learner feeds so only the curated verified catalogue can recommend videos. Added permission/unit coverage and wired the library into learner and staff navigation.
- Fixed: Playwright had silently reused the unrelated localhost:3000 server when the test server fell back to 3001. The E2E server now uses its own isolated port (3187), and hard-coded test API/browser URLs target that same server. Updated the learning workflow assertion so it verifies unverified teacher videos stay hidden and no weak-topic video is fabricated when there are no released marks.
- Tested: `npx prisma validate` passed; `npm run lint` passed; `npm run typecheck` passed; `npm test` passed (15 tests); full `npm run test:e2e` passed (9/9 Playwright tests, including all eight role routes, cross-role API denial, assessment workflow, admission, parent complaints, finance payment, attendance, learning and back/forward navigation). The user-facing local server at `http://localhost:3000` returned HTTP 200.
- Known issues: this checkpoint does not complete all Round 2 requirements. U4/U5, U6 exams/rubrics and advanced attendance, U7 complaint attachments/notifications, U8 stronger content fixtures/trend weighting, U9 fee structures/adjustments/statement/export workflows, and the page-by-page U10 redesign/accessibility audit remain partial or unbuilt as itemized in `docs/ROADMAP.md` and `docs/UI_UPGRADE_CHECKLIST.md`. No production build was run in this checkpoint.
- Next: continue U6 exam sessions/rubrics, then U9 fee structures and remaining U10 page-by-page work. No deployment was performed.

## Upgrade Round 2 — U9 fee-structure foundation — 2026-10-25
- Built: Head Teacher and Director can create versioned class/term fee structures with effective dates and optional/compulsory KES line items. Secretary and Accountant have read-only access. Changes record an audit event. Invoice API can load the current class/term structure, enforce compulsory items, accept selected optional item IDs, and retain the structure/version reference alongside invoice line snapshots. Added `/finance/structures` with an editor for authorized roles and version cards for read-only roles. Added the incremental SQLite migration `20261025_u9_fee_structures`.
- Tested: Prisma schema validation and local SQLite sync passed; lint, strict TypeScript and all 15 Vitest tests passed; the U9-focused Secretary/admission/finance E2E passed; the full Playwright suite passed (9/9); local `GET /` returned HTTP 200.
- Known issues: the invoice page still permits manual line entry and does not yet provide the requested structure-driven stepper, preview or optional-item toggles. Discounts/waiver approvals, statements/aging, expenses, financial analytics, downloadable branded PDFs/QR verification and export reports remain unbuilt. U6 exam sessions/rubrics and the exhaustive U10 UI audit are still outstanding; see `docs/ROADMAP.md` and `docs/UI_UPGRADE_CHECKLIST.md`. No production build was run in this checkpoint.
- Next: finish U6 exams/rubrics, then remaining U9 finance workflows and the U10 page-by-page interface audit. No deployment was performed.

## Upgrade Round 2 — U5 profile completion and staff records — 2026-10-25
- Built: expanded learner profiles with role-aware section navigation, passport photo display through a private scoped endpoint, audited supporting-document preview/download, attendance summaries, released result trend bars, fee balance and authorized receipt links, discipline follow-up, and a dated activity timeline. Director, Head Teacher, Deputy and Secretary can access the school profile/admission record. Accountant profile data is constrained to learner identity, guardian contact and fee information; teacher records remain assignment-scoped; Parent and Learner access remains linked/self-scoped. Health data remains separately permission-checked and access-audited.
- Built: added staff number, TSC number, position and qualifications to the staff model and Director account-creation form. Staff profile now shows contact/avatar, employment details, assignments, lessons, successful login, recent attendance/punctuality and Director-only payroll. Added a staff register UI and Zod-validated, audited attendance API; leadership can record/view schoolwide attendance, while other staff can view only their own.
- Built: added additive SQLite migration `20261025_u5_profile_enrichment` and completed U11's definition as a local acceptance gate (not deployment).
- Tested: lint, strict TypeScript, 16 Vitest tests, Prisma validation, `git diff --check`, local HTTP GET `/` (200), focused Playwright profile/admission flow (1/1), and focused role access with learner/account and staff-attendance checks (1/1 before the final discipline assertions were added).
- Known issues: photo crop, employment-field editing after account creation, profile message-parent action, Director-configurable fee/health visibility settings, full U4/U6/U7/U9 requirements, and the page-by-page U10 visual audit remain. Full Playwright rerun and production build are part of U11.
- Next: finish U10 interface audit/QA, then U11 full acceptance and update this record with final suite results. No deployment was performed.

## Learner Profile comprehensive upgrade, Theme Light/Dark mode fixes, and Live Reports — 2026-10-26
- Built: upgraded Learner Profile (`/learners/[id]`) with comprehensive, role-aware Bento & Glass tabs:
  1. Biography & School Identity (full student details, NEMIS/UPI, age, admission date, languages, religion).
  2. Fee Balance & Financial Ledger (net balance, total billed, total paid, term-by-term invoice line items, confirmed receipts with printable vouchers).
  3. CBC Exam Results & Progress (overall average, proficiency descriptors EE/ME/AE/BE, subject trend visualization, detailed marksheets with strands and teacher evaluative feedback).
  4. Class Register & Attendance (total sessions, attendance rate %, days present, absent, late, and daily roll-call register).
  5. Talents, Clubs & CBC Co-Curricular Pathways (identified gifts & aptitudes, Arts/STEM/Social Sciences pathways, school clubs, sports & athletics, and student leadership).
  6. Parents & Guardians (primary contact badge, direct phone and email links, emergency contacts, authorized pick-up persons).
  7. Residence & Transport (Kisumu Central / Obunga physical address, landmarks, distance to school, and means of transport).
  8. Restricted Health Record (audit-logged medical conditions, blood group, allergies, medications, and insurance).
  9. Admission Documents (verified category uploads and download links).
  10. Discipline & Welfare (conduct records, actions taken, and welfare status).
  11. Profile Edit History & Audits (immutable timestamped security audit log).
- Built: upgraded Learner Directory (`/learners`) with direct "View Profile →" action buttons for every pupil, alongside clickable name and admission number links.
- Fixed: comprehensive light and dark mode styling across all pages:
  - Enforced dark font (`#0f172a`) in light mode for all search inputs, text inputs, selects, and textareas, eliminating white/light font issues.
  - Initialized `data-theme` explicitly (`light` or `dark`) in `theme-provider.tsx`, `layout.tsx` beforeInteractive script, and `theme-toggle.tsx`.
  - Mapped dark mode surface opacities (`bg-white/*` and `bg-slate-50/*`) to deep navy/slate surfaces (`#111d32` / `#17253c`), ensuring high-contrast typography and no blinding white card backgrounds in dark mode.
- Fixed: eliminated all "Coming soon" placeholders across the application:
  - Implemented `/api/reports/assessments/route.ts` for live CSV export of released CBC assessments.
  - Implemented `/api/reports/finance/route.ts` for live CSV export of fee collections and balances.
  - Updated `/reports` with live download buttons for both reports.
- Tested: `npm run typecheck` passed (0 errors); `npm run lint` passed (0 errors); `npm test` passed (20/20 unit and permission tests). Local git tree clean.

