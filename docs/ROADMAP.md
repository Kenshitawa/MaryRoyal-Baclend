# Roadmap

The initial workspace was empty. The current deliverable establishes a runnable foundation and a limited learner-register workflow, not the complete Mary Royal SMS described in the build brief. Remaining work:

- Expand the Prisma schema/migrations for guardian relationships, class/stream/subject configuration, multi-role grants, teacher assignments, payments/invoices, receipt histories, report approval, and the rest of the domain. Link demo parent/learner accounts to seeded learner records.
- Finish Director account lifecycle with printable credential slips, bulk import/validation, multi-role assignment, and session revocation. Basic account creation, suspend/reactivate, one-time reset password and failed-login unlock are implemented.
- Implement server-side permission and row-scope enforcement for every route/action. Add exhaustive test attempts across roles/actions, parent/learner/teacher IDOR checks, and audit-log verification. Harden CSRF, security headers/CSP/HSTS, durable throttling/lockouts and idle timeout.
- Build academic setup, guardian/learner details, class assignments, attendance, CBC assessment, grade history/locks, report-card approval/release, and branded PDFs.
- Build fees, invoices, unique M-Pesa payments, immutable/voidable receipts, waivers, expenses/payroll, statements, PDF and CSV/Excel outputs.
- Build timetable clash detection, duty/cover, discipline, notices/notifications, moderated messages, lesson plans, homework/resources, events and staff attendance.
- Build scoped Parent and Learner portals; role-specific Teacher, Head Teacher, Deputy and Accountant dashboards; Director/Head Teacher analytics; global search, accessible dark mode and PWA/offline behavior.
- Complete the six role guides with the finished workflows. Add full e2e role journeys, performance/accessibility checks, backups/restore verification, privacy notice/data request workflow and operational hardening; a deployment planning guide exists but must be aligned with the eventual PostgreSQL implementation.
- Replace placeholder overview copy and dashboard aggregates with live, role-scoped data as the relevant modules ship.


