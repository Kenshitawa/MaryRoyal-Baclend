# Roadmap

The brief defines a full commercial school information system. The initial workspace was empty; this run established the foundation but cannot safely mark the end-to-end scope complete. Remaining work:

- Expand Prisma schema/migrations to guardians, role grants, classes, assignments, school terms/settings, subjects, payments/invoices, receipts, report approvals, uploads, and all modules. Add database-backed 30-learner/guardian/role seed set.
- Replace seeded single Director demo with complete demo accounts for all roles. Build Director-only user lifecycle, temporary credential slip, bulk CSV import/preview, password reset/unlock and session revocation.
- Implement server-side permission and row-scope enforcement for every route/action; current matrix is a starting point only. Add test coverage for every role/resource/action and IDOR attempts. Harden CSRF, security headers/CSP/HSTS, durable login throttling/lockouts, idle timeout and access logging.
- Build real academic setup, learner/guardian, assignments, attendance, CBE assessments, mark history/locks, review/release, and branded PDF reports.
- Build fee structures, invoices, payments, unique M-Pesa codes, immutable/voidable receipts, waiver approval, expenses/payroll/financial exports, statements and PDF output.
- Build operations (clash-checked timetable, cover/duty, discipline, notices, notifications, moderated messages, lesson plans, homework/resources, events), parent/learner portals, scoped analytics, search, CSV/Excel exports, dark mode and PWA/offline support.
- Add comprehensive e2e role workflows, backup/restore, performance and accessibility audits, error boundaries, privacy notice/data request workflow, guides for all roles and deployment guide.
- Replace dashboard shortcuts and summary data with role-specific, scope-filtered functional pages. Current demonstration view is not production safe for multiple roles.
