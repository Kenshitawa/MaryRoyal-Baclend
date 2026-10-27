# Mary Royal SMS — Frontend source

This repository contains the tracked Next.js page, UI component, and public asset source for Mary Royal School.

## Architecture note

The current application is a single Next.js App Router monolith. Some server-rendered pages import shared database, session, and authorization modules from `src/lib`, while mutations live in `src/app/api`. This frontend source snapshot is therefore **not independently runnable yet**. Combine it with the matching backend repository at the same project root to restore the complete source tree. A later extraction into a standalone frontend and API service is still required before these repositories can be deployed independently.

Use the root project README for local setup after combining the repositories. Keep all authentication and authorization checks in the server layer; hiding UI controls is not a security boundary.

No production data or credentials are included.