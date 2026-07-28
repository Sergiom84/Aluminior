# Project Working Rules

## Project identity

- **Purpose:** sistema de gestión para carpintería de aluminio y PVC.
- **Stack:** monorepo TypeScript/Node.js 20+, Drizzle, PostgreSQL/Supabase, Fastify y React.
- **Structure:** `packages/db`, `packages/etl`, `packages/core`, `packages/api`, `packages/web`.
- **Canonical commands:** `npm install`, `npm run test`, `npm run typecheck`, `npm run dev:api`, `npm run dev:web`.
- **Project documentation:** `README.md`, `ARQUITECTURA.md`, `PLAN.md` y `ENTREGA.md`.

## Working contract

The global Codex and Claude instructions apply. This file adds the repository-
specific constraints for Aluminior. Preserve the existing architecture and
read the project documentation before changing domain logic.

## Before changing anything

1. Inspect the affected package, its tests, migrations, and current git status.
2. Read the relevant section of `ARQUITECTURA.md`, `PLAN.md`, or `ENTREGA.md`.
3. Check July for durable project decisions or access pointers when the task needs them.
4. Read `.env` locally only when required; never expose or commit its values.
5. Define the smallest change that proves the requested outcome.

## Domain and data safety

- Treat the original ALUMINIOS LARA SLU data as sensitive business data.
- Never version real dumps, CSV exports, Access files, credentials, or customer data.
- Keep domain calculations in `packages/core` free from I/O where the current architecture already does so.
- Do not alter migrations or run against a remote database without explicit scope and a reversible verification plan.
- Preserve the distinction between valued, incomplete, and unvalued results; never turn missing valuation data into a false zero.

## Product and UI rules

- No emojis in user-facing UI, copy, states, notifications, or seed content.
- Do not add explanatory microcopy whose only purpose is to describe how the interface is used.
- If the web UI is changed, use one coherent typographic system: at most two families and three semantic sizes — title, subtitle, and body. New UI defaults to `Cormorant Garamond` + `JetBrains Mono`; record a deliberate exception in `design-system/MASTER.md`.
- Compose the web interface from recognizable blocks and isolate independent effects or behavior.
- Treat mobile, accessibility, overflow, keyboard states, and reduced motion as part of the change.

## Verification

Run the relevant package tests and typechecks. Review the diff and git status;
confirm that no real data, secret, migration side effect, or unrelated change
has entered the result. Report evidence, assumptions, and remaining limits.

