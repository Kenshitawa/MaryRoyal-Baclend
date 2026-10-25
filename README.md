# Mary Royal School Management System

Local-first school management system for Mary Royal School, Obunga, Kisumu. This is a prototype; use synthetic demo records only. See [the roadmap](docs/ROADMAP.md) before considering real school data.

## Requirements and setup

Install Node.js 20.9+ and npm. First setup needs internet access for package installation. No cloud account is used.

### Windows (PowerShell)

```powershell
npm run setup
npm run dev
```

### macOS or Linux

```sh
npm run setup
npm run dev
```

Open <http://localhost:3000>. Setup installs dependencies, creates `.env` when missing, generates a private `SESSION_SECRET`, migrates retired Accountant accounts to a suspended legacy Head Teacher account, initializes local SQLite, and seeds demo users, 30 learners, invoices, payments, marks and payroll. Setup preserves an existing `.env`.

## Demo logins

Fresh accounts use `MaryRoyal2026!` and require a password change at first sign-in.

| Role | Email |
|---|---|
| Director | director@maryroyal.ac.ke |
| Head Teacher | headteacher@maryroyal.ac.ke |
| Deputy Head Teacher | deputy@maryroyal.ac.ke |
| Secretary | secretary@maryroyal.ac.ke |
| Teacher | teacher@maryroyal.ac.ke |
| Parent | parent@maryroyal.ac.ke |
| Learner | learner@maryroyal.ac.ke |

Do not reuse demo credentials outside local development.

## Role workflows

- **Director:** review school enrollment, attendance, fee collections/balances and payroll on the dashboard; manage accounts; view all admissions, payment approvals, complaints and audit events; release Head Teacher-approved results; authorize payroll payments.
- **Head Teacher:** approve Secretary-entered admissions and payments; create invoices and prepare payroll; review marks and approve results for Director release; see attendance across classes; confirm teacher daily teaching logs and review complaints.
- **Deputy:** review schoolwide attendance and assessments; access the operational dashboard and assigned complaint inbox.
- **Secretary:** add learners, which receive an automated `MR-##` admission number and await Head Teacher approval; record cash, M-Pesa, bank or cheque payments, which await confirmation before a receipt is available; log parent, learner or Head Teacher complaints and route them to the right staff member.
- **Teacher:** open only assigned learners; enter marks for assigned subjects; the seeded Grade 4 class teacher can mark attendance, while other teachers cannot; create assignments, review learner submissions, and submit an end-of-day teaching summary for Head Teacher/Director confirmation.
- **Parent:** switch between linked children; view their released marks, attendance, fee balances and confirmed receipts; open a complaint chat with the class teacher or school leadership.
- **Learner:** open a grade-tailored learning space with released results, subject progress, marked assignment feedback, teacher-shared video/reading resources and saved educational game scores; submit class assignments. Learners have no fee details, complaints page or access to another learner’s records.

The local AI assignment draft uses Ollama at `http://127.0.0.1:11434` with model `llama3.2` by default. It makes no paid or external AI request. Install Ollama and a local model to enable this optional assistant; assignment creation and learner submission work without it.

All users can open **Profile & security** from the avatar to change their password or update a profile photo. Sessions expire after ten minutes of inactivity. Dark mode is applied before first paint. Parent complaint conversations, admissions, learner account activation, fee confirmations, marks and payroll actions are access-controlled and audit logged. A newly admitted learner gets a unique `mr-##@learners.maryroyal.ac.ke` login and a one-time printable credential slip; pending accounts activate after Head Teacher approval.

## Commands

- `npm run setup` — install, migrate and seed the local database
- `npm run dev` — run the local development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — strict TypeScript check
- `npm test` — Vitest unit suite
- `npm run test:e2e` — Playwright browser suite
- `npm run backup` — copy local SQLite database into `backups/`

## Backup restore

Stop the app, preserve `prisma/dev.db`, and replace it with the selected file in `backups/`. Start the app and verify records. Backups contain children’s information; restrict and encrypt them.

## Status

The system remains an early local prototype, not a school-ready production system. Outstanding work and limits are documented in [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/PROGRESS.md](docs/PROGRESS.md). No deployment is performed.
