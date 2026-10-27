# Mary Royal School Management System

A local-first school administration portal for Mary Royal School, Obunga, Kisumu. It supports role-based access for school leaders, staff, families, and learners. Use synthetic records until the remaining security, privacy, and workflow work in [the roadmap](docs/ROADMAP.md) is complete.

## Local setup

Install Node.js 20.9 or newer and npm. The first setup needs internet access to install packages. No cloud account or paid service is required.

### Windows (PowerShell)

```powershell
npm run setup
npm run dev
```

### macOS and Linux

```sh
npm run setup
npm run dev
```

Open <http://localhost:3000>. Setup installs dependencies, creates `.env` if needed, generates a local `SESSION_SECRET`, applies the Prisma schema to SQLite, and creates an otherwise empty school with a Director, school identity settings, and CBC grading defaults. Existing local school data is preserved by setup. To explicitly clear it, use `npm run reset:fresh` and type `RESET` at the prompt, or run `npm run reset:fresh -- --yes` when you intend to reset it.
.
