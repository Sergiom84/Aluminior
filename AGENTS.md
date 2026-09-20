# Project Working Rules

## Project identity

- **Purpose:** sistema de gestión para carpintería de aluminio y PVC.
- **Product reference:** Productor Aluminio es el patrón funcional y de interacción; buscar paridad máxima basada en evidencia, no una reinterpretación genérica.
- **Stack:** monorepo TypeScript/Node.js 20.9+, Drizzle, PostgreSQL/Supabase, Next.js App Router y React. `packages/api` es histórico.
- **Structure:** `packages/db`, `packages/etl`, `packages/core`, `packages/web`.
- **Canonical commands:** `npm install`, `npm run test`, `npm run typecheck`, `npm run check:architecture`, `npm run dev:web`.
- **Project documentation:** `docs/ESTADO-ACTUAL.md`, `README.md`, `ARQUITECTURA.md` y `PARIDAD-PRODUCTOR.md`; `docs/INDICE-DOCUMENTACION.md` clasifica planes y entregas históricos.

## Working contract

The global Codex and Claude instructions apply. This file adds the repository-
specific constraints for Aluminior. Preserve the existing architecture and
read the project documentation before changing domain logic.

The backend architecture is stable by default. The current web design is not:
do not preserve an existing UI decision merely because it already exists when
verified Productor behavior contradicts it.

## Modular architecture

- Build by vertical product modules and small files with one clear responsibility.
- Do not add new responsibilities to an already broad file. Extract a cohesive
  module first when the requested change would increase coupling.
- Keep React pages and route files as composition layers. Move stateful widgets,
  selectors, canvas/rendering, validation and server-side use cases into separate
  files close to the feature that owns them.
- Keep server actions thin: parse the request, authorize, call a domain/application
  service and revalidate. Database queries, valuation, configuration persistence
  and document numbering must not accumulate in one action file.
- Prefer feature-local folders with explicit public entry points. Do not import
  another feature's private components or reach across packages to internal files.
- A file approaching 250 lines requires a cohesion review. A handwritten file over
  400 lines requires a documented reason or a split before adding more behavior.
  Generated files, migrations and append-only research logs are exempt.
- Split by business responsibility, not by arbitrary line ranges. A refactor must
  preserve behavior and be covered by the relevant tests before feature work resumes.
- Keep tests beside the module they protect. Prefer pure functions in `packages/core`
  and dependency-injected application services over logic embedded in UI components.
- Budget actions already delegate to feature-local services. Keep that boundary:
  do not move SQL, valuation or numbering back into actions or the enclosure designer.
- Run `npm run check:architecture` when changing module boundaries. Historical
  research exceptions are frozen in `scripts/modularidad-excepciones.json`;
  review and extract the relevant use case before extending or reusing them.

## Before changing anything

1. Inspect the affected package, its tests, migrations, and current git status.
2. Read the relevant section of `ARQUITECTURA.md`, `PLAN.md`, or `ENTREGA.md`.
3. Check July for durable project decisions or access pointers when the task needs them.
4. Read `.env` locally only when required; never expose or commit its values.
5. Define the smallest change that proves the requested outcome and identify the
   module boundary that owns it.

## Domain and data safety

- Treat the original ALUMINIOS LARA SLU data as sensitive business data.
- Never version real dumps, CSV exports, Access files, credentials, or customer data.
- Keep domain calculations in `packages/core` free from I/O where the current architecture already does so.
- Do not alter migrations or run against a remote database without explicit scope and a reversible verification plan.
- Preserve the distinction between valued, incomplete, and unvalued results; never turn missing valuation data into a false zero.

## Product and UI rules

- Treat Productor as the source of truth for information architecture, workflow order, screen hierarchy, field grouping, tables, actions, terminology, document states, keyboard navigation, function-key shortcuts, and operational density.
- In budgets, optimize for the observed operator path: a minimal header with optional customer record, free name and work description, followed immediately by the enclosure configurator. The configurator—not the document list—is the primary product surface.
- Customer lookup in budget headers must support code prefixes and multiple partial name fragments in any order; selecting a result must persist the canonical customer code.
- Preserve enclosure output as one aggregate `GRUPO` line with drawing, generated description, measures, price and explicit manual fabrication/installation adjustments. Never infer manual adjustments from historical tables.
- Aim for the closest practical behavioral and structural parity. Do not add, remove, merge, rename, or reorder Productor concepts without evidence and an explicit product decision.
- Modernize the visual layer without reproducing Windows XP chrome: use contemporary surfaces, spacing, focus states, iconography, accessibility and responsive behavior while keeping the original task model recognizable.
- Do not import generic shells, card dashboards, oversized whitespace, marketing layouts, or patterns from F-Gestor-IA or another project when they reduce parity or increase clicks.
- Prefer dense, document-centred workspaces: primary actions near the active document, contextual operations visible, totals and state available without unnecessary navigation, and tables sized for real workshop workloads.
- For every changed workflow, build an evidence map from the manual CHM, screenshots, authorized observation, data/configuration, reports, or user interviews. Mark unsupported behavior as a hypothesis and obtain approval before treating it as canonical.
- Preserve useful Productor shortcuts and add visible keyboard focus. Mouse-only parity is incomplete parity.
- Known Productor defects are not compatibility requirements. Document the deviation and prove the corrected result.
- No emojis in user-facing UI, copy, states, notifications, or seed content.
- Do not add explanatory microcopy whose only purpose is to describe how the interface is used.
- If the web UI is changed, use at most two families and a compact semantic hierarchy. For Aluminior, prefer a highly legible modern sans-serif for interface text and `JetBrains Mono` for codes, measures, shortcuts and amounts. This is a deliberate project exception to the editorial `Cormorant Garamond` default because Productor parity and dense operational reading take priority.
- Compose the web interface from recognizable blocks and isolate independent effects or behavior.
- Treat mobile, accessibility, overflow, keyboard states, and reduced motion as part of the change.

## Original-system analysis

- Static or dynamic analysis is allowed only for software the user is authorized to inspect and only to understand interoperability, behavior, or the user's own data.
- Prefer observation, the extracted CHM, screenshots, reports, configuration and controlled input/output comparison before native decompilation.
- Productor is a behavioral and data reference, not an embedded runtime dependency. Reimplement verified behavior in Aluminior's own stack; do not couple the web app to launching or automating the legacy `.exe`.
- Never bypass licensing, activation, HASP/UniKey protection, authentication or other technical safeguards.
- Do not copy or redistribute GAIA source code, proprietary assets or binaries. Reimplement behavior in original project code and create new visual assets where needed.
- Run legacy executables and register old COM/OCX components only in an isolated VM or sandbox using copies. Never register them on the main workstation without explicit authorization and a rollback plan.
- Treat `EMP0016\aluminio.mdb` as active. Use a verified copy such as `EMP0016\Anterior.mdb` for read-only investigation.

## Verification

Run the relevant package tests and typechecks. Review the diff and git status;
confirm that no real data, secret, migration side effect, or unrelated change
has entered the result. Report evidence, assumptions, and remaining limits.

For UI parity work, verification must also compare the same task in Productor
and Aluminior: required steps, visible fields, keyboard path, states, totals,
overflow and screenshots at representative desktop and mobile widths. A visual
refresh without this comparison is not complete.
