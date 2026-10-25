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
- Next: add family linking and role portals, analytics/exports, and the listed operations modules.

## Phases 6–7 — not complete
- Built: no family portals, analytics, global search, dark mode or exports yet.
- Tested: 6 Playwright tests, 6 Vitest tests, lint, type-check and production build passed at the Phase 5 checkpoint.
- Known issues: security/performance/accessibility/privacy pass and remaining feature work are listed in docs/ROADMAP.md.
- Next: continue feature completion, then finalize guides and verified test results. The app is not suitable for real pupil or financial data.

## Phase 8 planning document
- Built: docs/DEPLOYMENT_GUIDE.md covers future PostgreSQL migration, hosting evaluation, HTTPS, secrets, backups and monitoring. No deployment was performed.
