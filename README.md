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

Director, Head Teacher and Deputy can view the school register; Teacher sees only assigned grades; Accountant sees learner name, admission number and grade only. Director can add learners and manage parent/learner links. Teachers can enter assigned CBC marks; Head Teacher reviews them and Director releases approved marks. Assigned teachers and school leaders can take daily class attendance. Accountant can create invoices, record payments, apply learner credits and issue/void receipts. Do not use these shared demo credentials outside local development.

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

This is an early prototype, not a complete school management system. Do not store real learner or financial data in it. See `docs/PROGRESS.md`, `docs/ROADMAP.md`, and `docs/guides/` for verified features and outstanding work.


## Verified local role workflows

- **Director:** sign in and change the temporary password; open **Learners** to add/search a learner; open **Accounts** to create an account and copy its one-time password, suspend/reactivate, reset a password or unlock an account; open **Assessments** to release Head Teacher-approved marks.
- **Teacher:** use **Attendance** for assigned grades 4–6 and set each learner present/absent/late; use **Open CBC assessments** for assigned subjects English, Mathematics and Science. Enter a Term 3 mark, submit it, and confirm submitted marks are locked. Grade 9 attempts are denied.
- **Head Teacher:** sign in; **Open CBC assessments** shows school marks; approve submitted marks or return them with a reason.
- **Deputy:** can read the school learner register and assessments; timetable and discipline are not built.
- **Accountant:** the learner API exposes only learner name, admission number and grade. Open **Finance** to create an invoice and record an M-Pesa/cash/bank/cheque payment; the system issues a printable receipt, rejects duplicate M-Pesa codes, carries overpayments forward and requires a reason to void a receipt.
- **Parent:** open the family portal to switch between linked children, see attendance, released marks, fee balances and linked receipts. The seeded demo Parent has two children.
- **Learner:** open the learner portal to see their linked record, attendance and released marks. Fee data is not shown.

The e2e suite covers Director account/learner/family-link work, unauthenticated denial, resource access for every seeded non-Director role, linked child scope, attendance IDOR denial, finance invoice/payment/credit/receipt workflows, assignment mismatch denial, mark submission lock, Head Teacher approval and Director release. Remaining items in docs/ROADMAP.md are not implemented.
