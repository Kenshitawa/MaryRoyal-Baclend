# Mary Royal SMS — Backend source snapshot

This repository contains API route handlers, shared server modules, Prisma schemas/migrations, scripts and tests from the Mary Royal School Management System.

**This is not an independently deployable backend service.** The current application is one Next.js App Router monolith: pages and API handlers share one project and server runtime. Deploy the complete project from the MaryRoyal-frontend repository to Vercel or Render. Do not create a separate Render service from this snapshot.

The project uses SQLite locally and a PostgreSQL production schema at `prisma/postgresql/schema.prisma`. See `docs/DEPLOYMENT_GUIDE.md` in the full app checkout before configuring production. Do not use real learner data until the security, privacy and PostgreSQL validation gates in `docs/ROADMAP.md` are closed.