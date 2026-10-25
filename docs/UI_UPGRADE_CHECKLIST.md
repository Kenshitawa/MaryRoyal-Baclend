# Round 2 UI inventory and upgrade checklist

Status describes the Round 2 visual audit, not whether the route already has a usable UI. `Audit pending` means the route needs an in-app/mobile/dark-mode/accessibility pass before it can be marked complete.

## Shared and signed-out pages

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/` — sign in | Branded split layout exists; verify small-screen behavior, focus order, and error recovery | Refine mobile welcome panel, loading/error states, keyboard flow, reduced motion | Audit pending |
| `/change-password` | Basic one-field form; no password-strength guidance or explicit session feedback | Add inline rules, show/hide control, success/error toast, back navigation safety | Audit pending |
| `/privacy` | Static notice; no data request workflow | Improve readability and link Director request steps when the workflow exists | Audit pending |
| `/receipts/[id]` | In-app breadcrumb and safe back are present; print-to-PDF only, no QR verification | Add downloadable PDF artifact, QR verification, child context and print QA | U3 navigation shipped; U10 audit pending |
| `/staff` — staff directory | Role scope existed but mobile card/readability needed review | Director/Head Teacher only; responsive staff cards with profile links | U5 scope retained; U10 visual audit pending |
| `/admissions/new` — new admission entry | Transient entry route can cause back-navigation loops | Return to admissions list if no existing draft; preserve safe navigation state | U3 route history handles transient entry; U10 QA pending |
| `/loading`, `/error`, `/not-found` — shared route states | Route transition and failure states were inconsistent or blank | Provide branded skeletons, accessible retry/recovery, reduced-motion support and safe dashboard return | Shared loading/error/not-found states shipped; U10 QA pending |
| `PortalFrame` | Role-aware breadcrumbs, mobile detail back bar, route history, scroll restoration and unsaved-form guard now shared across portal routes | Keep fixed deep-color navigation, add keyboard skip link, audit list/filter preservation, browser edge cases, responsive/dark states and focus behavior | Shared skip link shipped; U10 route-by-route audit pending |
| `PageNavigation` | Shared route-aware back/breadcrumb control is in place; browser state can vary after external/deep links | Validate external-entry fallback, query state, and keyboard/screen-reader behavior | U3 core shipped; U10 audit pending |
| `ThemeToggle` | Persistent light/dark theme exists; shared overrides need contrast review | Verify every page, browser preference and reduced motion in both themes | Audit pending |
| `IdleSessionGuard` | Ten-minute client timer exists; relies on client events and current session endpoints | Verify timeout and refresh across browser back/forward, improve expiry messaging | Audit pending |

## Director

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/dashboard` — Director | Existing school KPIs and fee/payroll aggregates; fresh-start checklist absent | Add ordered setup checklist, needs-attention panel, trends and setup links | Audit pending |
| `/accounts` / `AccountDirectory` | Account list/forms exist; import, search, account history and multi-role grant flows absent | Add safe create/reset/suspend dialogs, clear danger colors, bulk import preview and responsive list | Audit pending |
| `/accounts` / `GuardianLinks` | Basic link management; no phone/ID matching or guardian profile workflow | Add duplicate-aware family linking and link history | Audit pending |
| `/learners` / `LearnerDirectory` | Directory is searchable but learner profiles/tabs are not yet built | Keep the register focused; open full learner biography and role-scoped profile actions | U4 replaced short form; U5 profile implemented; U10 visual audit pending |
| `/learners/[id]` — learner profile | Profile sections were incomplete and role exposure needed review | Role-scoped section navigation, passport photo, biography, family contacts, residence, audited health, attendance, released-result trend charts, fee balances and receipt links, discipline, activity timeline, and protected admission documents; test linked/assigned IDOR | U5 implemented; focused admission/photo/doc/parent E2E passed; full suite pending |
| `/staff` and `/staff/[id]` — staff directory/profile | Employment and staff attendance details were not modeled | Director/Head Teacher directory, staff identity/TSC/qualifications, assignments, teaching notes, sign-in, staff attendance/punctuality, Director-only payroll | U5 implemented; role-scope E2E included; full suite pending |
| `/admissions` and `/admissions/[id]` | Previously only a short learner form; admission packet was not persisted | Build guided draft/resume, validate each step, securely manage documents, explicit access setup and printable packet | U4 implementation shipped; browser/security QA pending |
| `/assessments` / `AssessmentWorkspace` | Mark workflow exists; no global exam picker, rubric version display or full report-card print | Add exam context, rubric help, keyboard grid, review states and report output | Audit pending |
| `/attendance` / `AttendanceClient` | Daily learner overview and class completion are visible; stream/gender breakdown and follow-up absent | Add date range, stream/gender breakdown, follow-up workflow and staff attendance | Learner overview and scoped staff register shipped; remaining U6 work and visual audit pending |
| `/finance` / `FinanceClient` + `PayrollSheet` | Invoice/payment/payroll actions work; the finance overview lacks collection analytics, aging and export controls | Add finance dashboard, invoice preview, aging, generated PDF/exports | Audit pending |
| `/finance/structures` — Head Teacher/Director | Versioned structure editor and read-only structure cards now exist; broad mobile/dark/accessibility visual review pending | Verify effective dates, optional-item preview, responsive editing and audit feedback | U9 built; visual audit pending |
| `/reports` | Basic register export only | Add filterable school reports with accessible charts and verified exports | Audit pending |
| `/audit` | Basic table and action filter | Add time/user/entity filters, pagination and export history | Audit pending |
| `/complaints` / `ComplaintsClient` | Parent thread and leadership reply/status exist; attachments and both-recipient fan-out absent | Improve inbox triage, unread/status clarity, recipient routing, attachment and reply notifications | Audit pending |

## Head Teacher

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/dashboard` — Head Teacher | Role dashboard exists; deeper academic comparisons/at-risk panels absent | Add class/subject trends, pending approvals and task links | Audit pending |
| `/learners` — class register | School list view exists; profile tabs and full class setup absent | Add detail navigation, filters, class/stream context and approved profile access | U5 profile implemented; U10 visual audit pending |
| `/learners/[id]` and `/staff/[id]` | No role-aware learner/staff detail screens | Review permitted learner biography and teacher workload without account-management controls | U5 implemented; full U10 role QA pending |
| `/assessments` | Review/approve exists; exam and rubric management not built | Add approval queue, rubric versions and released report-card workflow | Audit pending |
| `/attendance` | Can inspect class registers; no all-class dashboard | Add daily overview, missing registers, absentee follow-up and staff attendance | Audit pending |
| `/finance` | Read view and payment confirmation exist; fee structure configuration absent | Add fee structure management, waivers/approvals and decision history | Audit pending |
| `/audit` | Shared audit list exists | Add leadership filters and complaint/admission/payments review context | Audit pending |
| `/teaching-log` | Confirmation workflow exists | Improve review queue and feedback context | Audit pending |
| `/complaints` | Parent inbox/reply exists | Add filters, status counts, assignment and notification state | Audit pending |

## Deputy Head Teacher

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/dashboard` — Deputy | Attendance/operations summary exists, limited drill-down | Add follow-up and timetable/event tasks | Audit pending |
| `/learners` | Basic school list; no profile tabs | Add useful learner summaries with restricted details | Audit pending |
| `/attendance` | Basic register view only | Add schoolwide heatmap/trends, staff attendance and follow-up | Audit pending |
| `/assessments` | Read-only current marks view; no exam sessions or rubrics | Add exam creation/timetable and centrally managed rubric workflow | Audit pending |
| Deputy operations pages | Timetable, duty, discipline, library, events and exams pages do not exist | Build approved modules with clash checks and transaction/audit rules | Not built |

## Secretary

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/dashboard` — Secretary | Admission and read-only fee indicators exist; setup guidance is missing | Add admission queue, pending review and clear fee read-only context | Audit pending |
| `/admissions` / admission | Legacy short form has been retired; fee pricing and pre-existing parent matching still need end-to-end verification | Resume seven-step admission drafts, upload and preview documents, record consent, create or match family access, download and print the branded admission form | U4 implementation shipped; QA pending |
| `/finance` — read-only | Secretary has fee totals/balances; fee structures now have a separate read-only view | Show the structure for a class/term and permitted paid/balance only, no receipt or payment identifiers | Audit pending |
| `/profile` | Shared password/photo profile exists | Verify and polish mobile profile form, success feedback and validation | Audit pending |

## Accountant

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/dashboard` — Accountant | Generic finance metrics, limited collection analytics | Add collections, outstanding, payment method and arrears panels | Audit pending |
| `/learners` and `/learners/[id]` | No safe way to select a learner for a fee review | Identity-only directory and fee balances with family, health, grades and discipline withheld | Implemented; verify in full E2E |
| `/finance` / `FinanceClient` | Invoice/payment creation exists and API can snapshot the approved fee structure; invoice page still permits manual entry and lacks stepper/search/status filters | Add learner search, structure-driven invoice preview, payment drawer and confirmation states | Audit pending |
| `/receipts/[id]` | Print-to-PDF only; no QR code or downloadable PDF artifact | Add direct PDF download, verification token and polished print view | Audit pending |

## Teacher

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/dashboard` — Teacher | Assigned-class shortcuts exist; lesson/todo overview is limited | Add timetable, pending marks, work due and teaching-log CTA | Audit pending |
| `/learners` | Assigned list works; no full profile or easy contact context | Add scoped learner profiles, parent contacts, attendance and subject results | Audit pending |
| `/learners/[id]` and `/staff/[id]` | No profile views for teacher or self | Show assigned learner details/subject marks and allow a staff member to open only their own staff profile | U5 implemented; full U10 role QA pending |
| `/attendance` | Class-teacher-only register exists | Improve one-tap mobile controls, missing status and lock/edit feedback | Audit pending |
| `/assessments` / `AssessmentWorkspace` | Mark entry/review exists; no active exam context or rubric helper | Add active exam only, rubric labels, bulk/keyboard entry and autosave feedback | Audit pending |
| `/assignments` / `AssignmentClient` | Create, submit and mark flow works | Improve editor, due-date clarity, class response list and saved-state notifications | Audit pending |
| `/learning-content` / `LearningContentClient` | Teacher resources can be shared; verified KICD curation absent | Add topic tags, verified source validation, learner watch metrics | Audit pending |
| `/teaching-log` / `TeachingLogClient` | Daily summary and confirmation exist | Streamline mobile end-of-day form and review response | Audit pending |
| `/profile` | Shared photo/password form exists | Add staff profile and workload details | Audit pending |

## Parent

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/portal` — children dashboard | Child switcher, recent results, attendance and fees exist; content is one long page | Build separate overview/results/fees/attendance pages, progress visuals and recent transactions | Audit pending |
| `/complaints` | Parent thread, replies and status exist | Improve chat readability, attachment state and reply notifications | Audit pending |
| `/receipts/[id]` | Linked receipt access exists; print-only output | Add direct PDF download and child context | Audit pending |
| `/profile` | Phone/email editing and photo/password state needs verification against role rule | Limit parent edits to own phone/email and polish mobile states | Audit pending |

## Learner

| Page/component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `/learning` / `LearningClient` | Results, assignments and games exist; full course authoring absent | Add verified official-channel revision videos for weak topics, watched state and accessible playback | KICD video library shipped; LMS expansion and QA pending |
| `/assignments` / `AssignmentClient` | Submission works; due-date and feedback view needs learner usability review | Improve classwork list, accessible answer entry and return feedback | Audit pending |
| `/portal` | Learner summary exists in shared page | Keep learner view focused and separate from Parent fee controls | Audit pending |
| Learner games | Number Quest/Science Explorer record a quiz score | Add grade-level content, feedback and accessible keyboard/mobile play | Audit pending |

## Shared feature components

| Component | Current problems | Planned improvements | Status |
|---|---|---|---|
| `LoginForm` | Login and error flow exist | Add loading state, rate-limit guidance and screen-reader announcement review | Audit pending |
| `ChangePasswordForm` | Basic forced password setup | Add password criteria, visibility control and robust success state | Audit pending |
| `ProfileSettings` | Photo/password update exists | Add role-specific contact edits, upload preview/remove and clearer validation | Audit pending |
| `AttendanceClient` | Attendance controls exist | Add accessible class/date summary and mobile lock feedback | Audit pending |
| `AssessmentWorkspace` | Mark/review form exists | Add active exam context, rubric preview, history and keyboard-grid support | Audit pending |
| `FinanceClient` | Invoice/payment actions exist | Add fee structure snapshot, payment drawer, totals and status badges | Audit pending |
| `PayrollSheet` | Basic payroll table exists | Add filter/export and approval history | Audit pending |
| `ComplaintsClient` | Private messages and status controls exist | Add robust inbox and notification state; restrict to Parent/Head Teacher/Director | Audit pending |
| `AssignmentClient` | Submission/marking works | Add improved authored question formats and feedback states | Audit pending |
| `LearningContentClient` | HTTPS resource form exists | Add KICD verification and safe content review | Audit pending |
| `TeachingLogClient` | Daily report/review exists | Add saved draft and clear approval feedback | Audit pending |
| Print styles | Receipt is printable; broader print rules absent | Add branded admission form, reports, statements, lists and document footers | Audit pending |
