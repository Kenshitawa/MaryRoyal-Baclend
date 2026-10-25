# Mary Royal School Management System

Local-first portal foundation for Mary Royal School, Obunga, Kisumu. This build provides credentials login, forced password update, a Director overview and an audited learner register. It is an incomplete prototype; use synthetic demo records only. See `docs/ROADMAP.md` before considering school use.

## Requirements and setup

Node.js 20.9+ and npm are required. The first setup needs internet access to install dependencies. No cloud account is used.

### Windows (PowerShell)

```powershell
npm run setup
npm run dev
```

Open <http://localhost:3000>.

### macOS or Linux

```sh
npm run setup
npm run dev
```

Open <http://localhost:3000>. Setup installs dependencies, creates `.env` if missing, generates a private 32-byte `SESSION_SECRET`, initializes local SQLite and seeds demo accounts and 30 learners. Setup preserves any existing `.env`.

## Demo accounts

All accounts use the temporary password `MaryRoyal2026!` on a fresh database and require a password change.

| Role | Email |
|---|---|
| Director | director@maryroyal.ac.ke |
| Head Teacher | headteacher@maryroyal.ac.ke |
| Deputy | deputy@maryroyal.ac.ke |
| Accountant | accountant@maryroyal.ac.ke |
| Teacher | teacher@maryroyal.ac.ke |
| Parent | parent@maryroyal.ac.ke |
| Learner | learner@maryroyal.ac.ke |

Only Director and Head Teacher/Deputy learner-register access is configured in this prototype (only Director can add records). Other role accounts can sign in but their dashboards and requested role workflows are not yet implemented. Do not use these shared demo credentials outside local development.

## Commands

- `npm run setup` — install, initialize schema and seed demo data
- `npm run dev` — local development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm test` — Vitest unit suite
- `npm run test:e2e` — Playwright browser suite (install Chromium with `npx playwright install chromium` if no system Chrome is available)
- `npm run backup` — copy local SQLite database into `backups/`

## Backup restore

Stop the app. Preserve the current `prisma/dev.db`, then replace it with the selected backup file from `backups/`. Start the app and verify records. Backups contain children’s information; encrypt them and limit access.

## Status

This is not a complete school management system and is not ready for real learner or finance data. See `docs/PROGRESS.md`, `docs/ROADMAP.md`, and `docs/guides/` for current implementation and remaining work.

