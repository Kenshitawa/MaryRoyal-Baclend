# Roadmap

The current build is a local prototype. It now includes a scoped login/dashboard and learner register, CBC mark approval/release, parent/learner portals, basic finance and payroll, and new Secretary, class-teacher, daily-log, assignment, and complaint workflows. It is not complete enough for real learner or finance data.

## Implemented in this checkpoint

- Fixed the Next.js root-script ordering error by moving the persistent theme initializer into the root `<head>` with `beforeInteractive`; saved dark mode is applied before the app body renders.
- Removed Accountant from the Prisma role enum, new-account form and demo logins. `npm run setup` migrates old Accountant users to a suspended Head Teacher legacy account without deleting their history.
- Added Secretary admissions (`MR-##` numbers, pending Head Teacher approval), Secretary payment intake (pending confirmation, receipt available after confirmation), Head Teacher invoice/payroll preparation, Director payroll authorization, and school oversight/audit visibility.
- Added a separate Class Teacher assignment. Teachers with subject assignments but no Class Teacher appointment cannot view or submit a register; the seeded teacher is class teacher for Grade 4.
- Added teacher daily teaching logs, confirmation by Head Teacher/Director, assigned-class assignments, learner submissions, teacher marking and an exact-answer auto-mark option. Optional assignment drafting can use a local Ollama model only.
- Added parent complaint intake/chat, Secretary complaint logging on behalf of families/Head Teacher, staff routing, replies, and scoped school leader review. Learner complaint navigation and APIs are explicitly denied.
- Added a grade-tailored Learner learning space, teacher-shared HTTPS video/reading resources, subject progress from released results and marked assignments, saved practice-game scores, and grade-specific Number Quest/Science Explorer games. New admissions create a unique suspended-or-active Learner login and a one-time printable credential slip; Head Teacher approval activates pending accounts.
- Teacher learner navigation now opens assigned learner rows. Workspace nav uses Next `Link` for client navigation/prefetch. Parent/learner portal no longer repeats a text Sign out action inside its dashboard.

## Remaining work

- Finish academic configuration: school years/terms/streams/subjects, teacher and class-teacher assignment management UI, CBC grading configuration, assessment rubrics/exam workflows, marks deadlines/reopen approvals, bulk entry, and branded downloadable PDF report cards.
- Complete finance: configurable fee structures, discounts/bursaries/Director waiver authorization, sequential receipt PDF download, parent payment-method/transaction page, statements/arrears reports, expenses, and accounting exports. The current receipt uses a browser print flow, not a generated PDF file. Credit is created after payment confirmation.
- Finish payroll approval UX/history correction flows and statutory/payroll reporting. Current payroll is a basic monthly register with Director mark-paid authorization; it is not Kenya statutory payroll.
- Build the full attendance overview requested for Director/Head Teacher/Deputy, including teacher attendance, class comparison, absentee follow-up and edit approval windows. Current register is learner attendance by grade; only class teachers may mark it.
- Build Deputy operations: clash-checked timetable, exam timetable/exam rubric approval, lesson plans and schemes of work with Deputy review, teacher cover/duty roster, discipline, textbook library issue/return and school-leader oversight, clubs and events.
- Extend the learner learning area with downloadable worksheets/local uploads, more interactive CBE activities, parent-visible assignment progress and teacher-managed content editing. Current video resources are secure HTTPS links and cannot be uploaded or hosted locally; game progress is a simple score record. The optional AI draft requires the user to install Ollama and a local model.
- Add parent/learner separate results and balances pages, visual progress charts, announcements, schedule/homework views, notification preferences, receipt download, and verified multi-guardian flows. Current portal is a basic linked dashboard and complaint thread.
- Finish Director/Head Teacher analytics, global search, complete CSV/Excel/PDF exports, PWA offline caching, comprehensive mobile/accessibility QA, performance verification on slow 3G, session-wide sign-out/revocation, durable login rate limiting, hardened CSP, and privacy export/deletion workflow.
- Extend automated authorization tests to every endpoint/action/IDOR combination. Current E2E coverage verifies Secretary admission/payment approval and automatic learner-account activation, learner complaint denial, grade-scoped learning resources and saved game activity, complaint visibility/replies, class-teacher attendance, marks approval/release, payroll authorization, assignment submission/marking, and daily teaching-log confirmation. Add complaint cross-family IDOR checks and broaden API tests to every endpoint/action combination.
- Verify backup/restore regularly, add database-managed audit immutability, finalize all role guides and review privacy notice/data-retention rules with school leadership before real use.

No deployment is performed. Future PostgreSQL and hosting notes remain in `docs/DEPLOYMENT_GUIDE.md`.
