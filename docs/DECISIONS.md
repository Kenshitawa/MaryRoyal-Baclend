# Decisions

- 2026-10-25: Workspace was empty, so initialize a new app rather than adapt existing code.
- Use SQLite for local-first setup and Prisma's provider/config split for PostgreSQL compatibility.
- Treat the demo Director password as a one-time local seed credential and require a change on first sign-in.
- Use explicit role grants for multi-role users; authorization must be centralized and data scope checked server-side.
- Defer any module that cannot be implemented and verified to docs/ROADMAP.md rather than exposing nonfunctional controls.

- 2026-10-25: Demo users share one temporary local-only password and are forced to change it at first login; setup generates a random 32-byte signing secret for `.env`.
- 2026-10-25: This checkpoint exposes learner directory data only to Director, Head Teacher and Deputy because other role-to-record assignments are not yet modeled.
- 2026-10-25: Prisma SQLite setup runs with `RUST_LOG=info` because the bundled Prisma schema engine otherwise returned an empty Schema engine error in this Windows environment.
- 2026-10-25: Keep the local prototype honest about incomplete CBE, finance, operations and family portals; do not enable generic actions that would imply those workflows work.
- 2026-10-25: Use 80/60/40 as the initial EE/ME/AE boundaries (below 40 is BE); thresholds remain configurable work for the grading module and should be confirmed with school leadership before real grading.
- 2026-10-25: Use `MR-01`, `MR-02`, … as the sequential admission-number format for new learner records; generate the value server-side within the admission transaction. Existing seed records keep their original identifiers.
- 2026-10-25: The school motto is “Hard work pays”; keep “Nurturing Excellence Through CBE” as the portal’s CBE descriptor.
- 2026-10-25: Teachers alone create and edit learner assessments; the Head Teacher reviews, and the Director can release approved results but cannot enter marks. This follows the school’s separation of teaching and executive oversight.
- 2026-10-25: Director dashboards show schoolwide fee collection, outstanding balances, enrollment, attendance and payroll aggregates; the Accountant manages payroll entries. Payroll is stored with a versioned audit history and sample values are seeded for local demonstration only.
- 2026-10-25: Frontend product research reviewed the public feature descriptions for [SAMIS](https://www.samis.co.ke/), [Masomo 360](https://www.masomo360.com/), [OLP Monitor](https://olpmonitor.tech/) and [Kenya’s NEMIS](https://www.education.go.ke/nemis). Applied patterns: role-specific dashboards, connected fee and learner records, CBC strand/competency presentation, mobile access, and explicit approval/audit trails. These are UX references only; no external product or service is connected.
- 2026-10-25: The supplied Mary Royal Junior School logo is used in the application and a square app icon is generated from it. The fixed navigation uses deep royal blue in light mode and a darker navy blue in dark mode; selected and inactive links retain readable contrast.
- 2026-10-25: Add a self-service profile area for photo and password updates. Profile photos are limited to PNG/JPEG/WebP, 2 MB, checked against file signatures and stored under random names. Password changes require the current password after initial setup. Use a signed, HTTP-only 10-minute idle token refreshed by active server requests, alongside a client inactivity timer.
- 2026-10-25: The Director’s header eye icon is a discreet shortcut to the existing privileged audit trail, not covert monitoring. It exposes recorded sign-in outcomes and sensitive system actions only; passwords, credential slips, and private message content are not logged.
- 2026-10-25: Apply the saved light/dark theme with a tiny `beforeInteractive` script on the document root so the chosen palette is in place before the first paint. Seed two terms of sample fee invoices and partial payments so executive finance dashboards are useful on first setup; keep amounts clearly synthetic.
