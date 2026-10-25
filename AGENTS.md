# Mary Royal SMS — Agent Operating Rules

## Product and security rules
- Build a local-first school management system for Mary Royal School, Kisumu, using the stated CBE workflows and KES/EAT context.
- No public registration. Only the Director manages accounts and roles. Enforce least privilege on the server for every mutation/read; UI hiding is supplemental. Scope parent/learner/teacher records to linked/assigned learners. Secretary handles admissions and records, but only reads fee structure and learner balances. Accountant manages operational finance and must not see grades, discipline, medical, or private family-message data. Head Teacher and Director approve/authorize as configured. Complaints are only Parent → Head Teacher/Director.
- Validate every external input with Zod, use hashed credentials and HTTP-only session cookies, log sensitive actions append-only, and avoid sensitive values in logs.
- Protect children’s data, soft archive people with history, use transactions/unique constraints for grades and money, and record material decisions in docs/DECISIONS.md.
- Learner profile access must use the `learners` matrix scopes, with Accountant restricted to `learner-identity` plus permitted finance data. Fetch restricted medical fields only for authorized roles and append an audit record on each health-profile view. Staff directory/profile browsing is Director/Head Teacher only; staff may view their own profile.
- Use royal blue/white, accessible mobile-first layouts, clear labels, keyboard/focus support, and Mary Royal branding.
- Do not deploy or use paid services. No public registration, fake buttons, or placeholder claims.
- Optional assignment drafting must use a local model only; never send child data or user content to a paid/external AI service.

## Stack
Next.js App Router, strict TypeScript, Tailwind CSS, shadcn-compatible accessible primitives, lucide-react, Prisma with SQLite locally and PostgreSQL-compatible models, credentials auth, Zod, Vitest and Playwright. Keep feature code modular and centralize authorization in `src/lib/permissions.ts` and grading in `src/lib/grading.ts`.

## Phase workflow
For each phase: read this file; run the app locally; run lint, type-check and available tests; fix failures; append actual built/tested/known/next notes to docs/PROGRESS.md; commit with a clear phase message. Do not claim a check passed unless it ran. If a phase cannot be completed, record precise remaining work in docs/ROADMAP.md and continue.

## Commands
- `npm run setup`: install dependencies, apply the Prisma schema, and create an empty local system with the Director and defaults.
- `npm run seed:demo`: optional synthetic demo data for development and E2E tests.
- `npm run reset:fresh`: interactively clear school data while preserving the Director and system defaults; use `-- --yes` only when a reset is explicitly intended.
- `npm run dev`: local development server.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`: quality checks.
- `npm run backup`: create a local database backup.
