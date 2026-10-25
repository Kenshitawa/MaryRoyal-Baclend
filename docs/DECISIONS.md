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
