# Mary Royal SMS — Backend source

This repository contains the tracked API route handlers, shared server/data modules, Prisma schema and migrations, local scripts, and automated test source.

## Architecture note

The current application is a single Next.js App Router monolith. API handlers and shared server modules are part of that app; they are not an independently deployable service yet. Combine this source with the matching frontend repository at the same project root to restore the complete application. A standalone API/service extraction remains future work.

After combining, use the root project README for local setup. Preserve the centralized permission matrix and enforce authorization and row scoping in every server endpoint.

No production data or credentials are included.