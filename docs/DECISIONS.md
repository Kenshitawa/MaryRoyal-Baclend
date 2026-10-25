# Decisions

- 2026-10-25: Workspace was empty, so initialize a new app rather than adapt existing code.
- Use SQLite for local-first setup and Prisma's provider/config split for PostgreSQL compatibility.
- Treat the demo Director password as a one-time local seed credential and require a change on first sign-in.
- Use explicit role grants for multi-role users; authorization must be centralized and data scope checked server-side.
- Defer any module that cannot be implemented and verified to docs/ROADMAP.md rather than exposing nonfunctional controls.
