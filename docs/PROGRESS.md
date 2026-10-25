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

## Phases 4–7 — not complete
- Built: no finance, operations, Parent/Learner portal, analytics or export screens were added without real backing features.
- Tested: current checks do not cover finance or later modules.
- Known issues: fees/payments/receipts, expenses, timetable, discipline, announcements/messages, lesson plans/homework/events, family portals, analytics/exports, exhaustive security testing, performance/accessibility pass and privacy request workflow remain in docs/ROADMAP.md.
- Next: implement remaining modules in order. The app is not yet suitable for real pupil or finance data.

## Phase 8 planning document
- Built: docs/DEPLOYMENT_GUIDE.md covers future PostgreSQL migration, hosting evaluation, HTTPS, secrets, backups and monitoring. No deployment was performed.
