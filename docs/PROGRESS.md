# Progress

## Phase 0 — complete
- Built: initialized Git, wrote AGENTS.md, architecture analysis and decision log.
- Tested: reviewed operating rules; initial workspace was empty.
- Known issues: none for documentation phase.

## Phase 1 — foundation checkpoint (partial)
- Built: Next.js App Router/TypeScript/Tailwind shell; branded login/dashboard; credentials login with bcrypt, signed HTTP-only sessions, forced password change and audit events; random per-install session secret; basic rate limiting and account lockout; Director account create/list/suspend/reactivate/reset/unlock with one-time generated credentials; centralized role/action and scope matrices; security headers; PWA manifest/logo; 7 seeded role accounts.
- Tested: `npm run setup`, `npm run lint`, `npm run typecheck`, `npm test` (6 passed), `npm run build`, `npm run test:e2e` (3 passed), `npm run backup`, and `npm audit` (0 vulnerabilities) passed.
- Known issues: permissions are only applied to implemented routes; session revocation/idle timeout, exhaustive per-route checks, CSP nonce hardening, full account import/multi-role grants and offline service worker remain incomplete. CSP currently allows inline/eval scripts for the framework.
- Next: complete row-level scopes with linked/assigned records and add required school modules.

## Phase 2 — academic core checkpoint (partial)
- Built: seeded 30 demo learners; learner register with Director create and Head Teacher/Deputy school-view scopes; search and bounded pagination API; unique admission number; soft archive field; Zod validation; permission/scope check; denial and transactional create audit records.
- Tested: Playwright covers Director adding a learner, plus role API tests allow the configured school views and deny account/learner access for other roles. Type, lint, unit and build checks passed.
- Known issues: no guardian relationships, learner profiles, classes, streams, subjects, teacher assignments, or attendance workflow. The UI currently loads only the first 50 learners.
- Next: implement class/guardian setup, assignments and attendance.

## Phases 3–7 — not complete
- Built: CBC grading-level and fee balance helpers with unit coverage; no fake pages for unimplemented modules.
- Tested: helper and permission unit suite passed; the small e2e suite does not cover full role workflows.
- Known issues: assessment/report cards, finance, operations, family portals, role-specific dashboards/exports, offline PWA, exhaustive security/IDOR testing, performance/accessibility review, privacy request workflow and complete user guides remain in docs/ROADMAP.md.
- Next: implement remaining modules in order. The app remains an early prototype and is not suitable for real pupil or finance data.

## Phase 8 planning document
- Built: docs/DEPLOYMENT_GUIDE.md describes future PostgreSQL migration, hosting evaluation, HTTPS, secrets, backups and monitoring. No deployment was performed.
