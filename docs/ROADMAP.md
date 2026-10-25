# Mary Royal SMS — remaining work

This repository is a local prototype. The Round 2 work improves its authorization model and fresh-start flow, but does not make it ready for real children’s or financial data.

## Round 2 implemented foundations

- Accountant is a distinct role again. Secretary can admit learners and explicitly create learner logins, but has read-only fee totals/balances and cannot record payments or open receipts.
- Complaint access is limited to Parent, Head Teacher, and Director. Parents can create and track private complaint threads; school leaders can reply and update status.
- Default setup creates the Director, school identity settings, and CBC EE/ME/AE/BE defaults. Optional `seed:demo` supplies synthetic records; `reset:fresh` requires explicit confirmation and preserves only the Director and defaults.
- Playwright tests cover the seeded role access matrix for selected APIs, admission/login approval, the Parent complaint channel, Accountant payment workflow, learner-scoped portals and teaching/assignment workflows.

## Still required from Upgrade Round 2

- **Navigation (U3, core implemented):** shared role-aware breadcrumbs, mobile detail back bar, safe parent fallback, in-app route history, scroll restoration and unsaved-form warnings now cover PortalFrame pages and receipts. A role sweep exercises direct page loads, app back, browser back and forward. URL-backed filters/list pagination and QA of routes outside PortalFrame remain for U10.
- **Admission (U4):** the multi-step draft/resume wizard, normalized residence/guardian/emergency/pick-up/health records, consent, private photo/PDF uploads, required-document checklist, branded admission PDF, and explicit opt-in learner and parent access are implemented. Remaining: photo crop, broader parent identity maintenance for pre-existing accounts, parent account linking across sibling admissions E2E, secure view/download of individual supporting documents from the learner profile, and admission-to-approved-fee invoice preview.
- **Profiles (U5, partial):** learner biography, residence, contacts, restricted health, attendance, released results, fees and admission-document checklist render by role; staff directory/profile shows account, assignment, teaching-log, last successful login and Director-only payroll history. Sensitive query data is role-filtered and health access is audited. Remaining: learner passport photo field/crop and photo display, protected document previews/downloads, learner timeline/discipline records, full result-progress charts, receipt links from profiles, tests across every profile/role/tab, and stored TSC/qualification/staff-attendance/punctuality data. Current schema has no fields for these employment records.
- **Attendance/exams/rubrics (U6, partial):** a schoolwide daily learner-attendance overview now shows present/absent counts and class register completion for Director, Head Teacher and Deputy. Remaining attendance work: date-range filters/trends, stream/gender breakdown, teacher reminders, follow-up call logging/parent notification, staff attendance and exports. Deputy exam-session/timetable creation and progress tracking, teacher active-exam filtering, central configurable/versioned rubrics, and impact/reopen approvals are not implemented.
- **Complaints (U7):** attachment upload, explicit recipient fan-out for “both,” notification delivery, assignment and full conversation moderation are not implemented. Current one-way Parent-to-leadership access and reply/status workflows are implemented.
- **KICD learning library (U8):** the learner space has released results, grade-scoped teacher resources and educational quiz games, but no verified KICD-only video curation/catalogue, weak-topic recommendation, watched tracking or official-channel validation. Never present an unverified URL as KICD content.
- **Finance (U9):** versioned class/term fee structures, optional line items, invoice stepper/preview, approved discount/waiver requests, statements/aging buckets, expense management, collection-method analytics, generated PDFs/QR verification and exportable finance reports are not implemented. Existing invoices are entered manually; receipts use browser print-to-PDF.
- **Whole-system UX (U10):** page-by-page redesign and visual/accessibility audit across every role, full command-palette search, responsive sortable/paginated tables, dark-mode checks on every view, and comprehensive print behavior remain.

## Other security, operational and data gaps

- Permission tests still do not enumerate every route/action/IDOR for every role. The E2E sweep now includes profile scope checks, but does not cover all nested records, receipt privacy, each profile tab, uploads, and future modules.
- Append-only audit is enforced in application workflows, not at the database layer. Login rate limiting is process-local; durable lockout, idle-session revocation/sign-out-all-devices and session/device history need stronger storage and tests.
- Finish data-subject export/correction/deletion/anonymization workflow, retention controls, approved privacy notice, secure admission-document retention and encrypted backup/restore verification before real data use.
- The current deployment schema is configured for SQLite. The Round 2 migration is a SQLite incremental migration; PostgreSQL deployment needs a tested provider-specific migration path before a one-line database URL switch can be promised.
- Assignment auto-marking is exact-answer matching only. Optional AI needs a locally installed Ollama model. No child or school content is sent to a paid/external AI service.
- Finish `docs/guides/` for the new Accountant role and revise existing role guides for changed permissions and the clean-start walkthrough.

No deployment is performed.
