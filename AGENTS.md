# Mary Royal SMS — Agent Operating Rules

## Product and security rules
- Build a local-first school management system for Mary Royal School, Kisumu, using the stated CBE workflows and KES/EAT context.
- No public registration. Enforce least privilege on the server for every mutation/read; UI hiding is supplemental. Scope parent/learner/teacher records to linked/assigned learners. Accountant must not see academic, discipline, medical, or message data.
- Validate every external input with Zod, use hashed credentials and HTTP-only session cookies, log sensitive actions append-only, and avoid sensitive values in logs.
- Protect children’s data, soft archive people with history, use transactions/unique constraints for grades and money, and record material decisions in docs/DECISIONS.md.
- Use royal blue/white, accessible mobile-first layouts, clear labels, keyboard/focus support, and Mary Royal branding.
- Do not deploy or use paid services. No public registration, fake buttons, or placeholder claims.

## Stack
Next.js App Router, strict TypeScript, Tailwind CSS, shadcn-compatible accessible primitives, lucide-react, Prisma with SQLite locally and PostgreSQL-compatible models, credentials auth, Zod, Vitest and Playwright. Keep feature code modular and centralize authorization in `src/lib/permissions.ts` and grading in `src/lib/grading.ts`.

## Phase workflow
For each phase: read this file; run the app locally; run lint, type-check and available tests; fix failures; append actual built/tested/known/next notes to docs/PROGRESS.md; commit with a clear phase message. Do not claim a check passed unless it ran. If a phase cannot be completed, record precise remaining work in docs/ROADMAP.md and continue.

## Commands
- `npm run setup`: install dependencies, migrate and seed local demo data.
- `npm run dev`: local development server.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`: quality checks.
- `npm run backup`: create a local database backup.
