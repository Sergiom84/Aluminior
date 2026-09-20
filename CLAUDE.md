# Claude Code Project Instructions

Read `AGENTS.md` first; it is the canonical project contract for Aluminior.
Before editing, inspect the affected workspace package, domain documentation,
tests, migrations, and git status. Preserve the existing monorepo boundaries,
keep real company data and secrets out of version control, and use July when
project context or access pointers are needed.

Work in small, cohesive modules. `AGENTS.md` contains the canonical boundaries
and size-review rules. Pages and server actions are orchestration layers, not a
place to accumulate domain rules, SQL, validation and UI state. Before adding to
a broad file, extract the affected business responsibility behind a small public
interface, preserve behavior with tests, and then implement the change. Split by
cohesion rather than by arbitrary line ranges. Do not create a second monolith in
the enclosure designer. Budget actions now delegate to feature-local services;
preserve those boundaries. Read `docs/ESTADO-ACTUAL.md` for current status and
run `npm run check:architecture` to check module boundaries and size exceptions.

For UI work, follow the shared rules: no emojis or explanatory microcopy, one
coherent pair of typefaces per project, compact semantic hierarchy,
recognizable reusable blocks, responsive behavior, accessibility, keyboard
operation, and reduced motion.

Productor Aluminio is the canonical functional and interaction reference. Aim
for maximum evidence-backed parity in screen architecture, workflow order,
field grouping, tables, terminology, document states, contextual actions,
keyboard shortcuts, and operational density. Modernize the visual skin without
reproducing Windows XP chrome. Do not reuse generic dashboards, card grids,
oversized whitespace, or F-Gestor-IA patterns when they add steps or make the
workflow less recognizable.

Aluminior deliberately uses a legible modern sans-serif for dense interface
text and JetBrains Mono for codes, measures, shortcuts, and amounts instead of
the editorial Cormorant Garamond default. Preserve at most two families.

Before implementing a workflow, map the evidence from the CHM, screenshots,
authorized observation, data/configuration, reports, or user interviews. Mark
unknown behavior as a hypothesis. Compare Productor and Aluminior using the same
task, inputs, keyboard path, visible states, totals, and screenshots before
claiming parity.

For budgets, the observed operator workflow is canonical: create a minimal
header (customer optional, free name and work), then enter the enclosure
configurator immediately. Treat its result as one aggregate `GRUPO` line with
drawing, generated description, measures, price and explicit manual
fabrication/installation adjustments. Do not invent those adjustments from
historical data.

Customer lookup in a budget header accepts code prefixes or multiple partial
name fragments in any order and always persists the selected canonical code.

Analysis of the legacy application is allowed only with user authorization and
for interoperability, behavior, or the user's own data. Do not bypass licenses,
activation, HASP/UniKey, authentication, or other protections; do not copy or
redistribute proprietary code, assets, or binaries. Run legacy COM/OCX software
only in an isolated VM or sandbox using copies, never against the active MDB.

Productor is integrated as a behavioral and data reference, not as an embedded
runtime dependency. Reimplement verified behavior in Aluminior's own stack; do
not couple the web app to launching or automating the legacy `.exe`.

Run relevant tests and typechecks, review the diff, and report verification,
assumptions, limitations, and follow-up.
