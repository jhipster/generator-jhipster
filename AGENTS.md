# AI agent instructions for generator-jhipster

JHipster is a Yeoman-based code generator (TypeScript, ESM, Node `^22.18.0 || >=24.11.0`) that scaffolds Spring Boot + Angular/React/Vue applications. See `ARCHITECTURE.md`, `BLUEPRINTS.md`, and `DEVELOPMENT.md` for background context.

**Trust order when docs disagree:** `package.json` scripts and the current source tree are the source of truth. Prose docs (including `DEVELOPMENT.md`) may be stale — verify commands against `package.json` before running them.

## Build, lint, test

- Install: `npm ci` (also compiles via `prepare` → `build`).
- Build: `npm run build` (runs `clean` → `tsc` → copy non-TS template files + `.d.ts` to `dist/`, then `bin/fix-bin.cjs`). Use `npm run compile` alone for a faster TS-only recompile.
- Type-check tests: `npm run check-types` (`tsc -p tsconfig.spec.json`).
- Lint: `npm run lint` (eslint, `--max-warnings 5`). Auto-fix: `npm run lint-fix` (runs eslint `--fix` then `prettier --write`).
- Prettier check/format: `npm run prettier:check` / `npm run prettier:format`.
- Full test (lint + type-check + mocha): `npm test`. Runs esmocha over `test generators cli .blueprint lib` with `--forbid-only`.
- Fast test (skip lint/type-check): `npx esmocha`.
- Single test file / directory: `npx esmocha <path>` (add `--no-parallel` for clearer stack traces).
- Update snapshots: `npm run update-snapshot -- <path>` (single) or `npm run update-snapshots` (all). Equivalent: `npx esmocha <path> --no-parallel --update-snapshot`.
- JDL-only tests: `npm run jdl:test` (watch: `npm run jdl:test-watch`).

Snapshots live next to specs as `*.snap` and are committed. Never hand-edit them — regenerate.

## Running the generator locally

Two options (see `DEVELOPMENT.md`):
- JIT: `alias jhipster="$PWD/bin/jhipster.cjs"` — no build step needed.
- Linked build: `npm run build && npm link`; rebuild after changes.
On generated apps use `jhipster --skip-jhipster-dependencies` plus `npm link generator-jhipster` so the dev version is picked up. `jhipster --install-path` shows which copy is active.

## Big-picture architecture

- CLI entry: `cli/jhipster.cjs` → `cli/cli.ts` (env checks) → `cli/program.ts` (commander parsing, generator/blueprint lookup) → spawns a Yeoman Environment which runs the selected generator.
- Generator hierarchy (extend the lowest level that has what you need):
  `GeneratorBaseCore` → `GeneratorBase` (blueprint composition) → `GeneratorApplication` (entity APIs).
- Each generator lives in `generators/<name>/` with a fixed layout:
  - `index.ts` — re-exports the generator as **default** plus the `command`. Required for the exports map in `package.json`.
  - `generator.ts` — priority task groups (see below).
  - `command.ts` — CLI args/options/configs (consumed by `parseJHipsterArguments` / `parseJHipsterConfigs` and by `program.ts` to build the CLI).
  - `templates/` — EJS templates rendered during `writing`/`writingEntities`.
  - `support/` — exported helpers (part of the public API via `./generators/*/support`).
  - `internal/` — non-exported helpers.
  - `resources/`, `jdl/` — supporting data / JDL specs.
  Sub-generators nest under `generators/<parent>/generators/<child>/` and are exported via the same pattern.
- Priority lifecycle (order matters, see `ARCHITECTURE.md` for full list): `initializing` → `prompting` → `configuring` → `composing` → `loading` → `preparing` → `configuringEachEntity` → `loadingEntities` → `preparingEachEntity` → `preparingEachEntityField` → `preparingEachEntityRelationship` → `default` → `writing` → `writingEntities` → `postWriting` → `install` → `end`. Use the matching `as<Priority>TaskGroup()` helper on the generator to get typed task signatures.
- Blueprints (`BLUEPRINTS.md`): three flavors — replacement, side-by-side, standalone. `GeneratorBase` handles composition; blueprinted sub-generators are discovered and composed in `beforeQueue`.
- `lib/` holds shared, **exported** code: `lib/jdl` (Chevrotain-based JDL parser), `lib/testing` (test harness, also importable as `#testing`), `lib/utils`, `lib/eslint`, `lib/ci`. Keep cross-generator logic here, not inside an individual generator.
- `.blueprint/` is the in-repo "dev blueprint" enabled when running via JIT. It provides sub-generators like `generate-sample`, `generate-generator`, `from-issue`, `update-spring-boot`, etc. — use these instead of ad-hoc scripts when generating samples for manual testing.
- Build output in `dist/` is what gets published. The `exports` map in `package.json` defines the public API surface — don't import across generator `internal/` boundaries.
- **Never edit `dist/` directly.** Modify source in `cli/`, `generators/`, `lib/`, etc., then rebuild with `npm run build` (or `npm run compile` for TS-only).

## Key conventions

- **ESM + TypeScript everywhere**; `"type": "module"` in `package.json`. Use `.ts`/`.mts`. Tests are `*.spec.ts` run by `esmocha`.
- **Task groups**: define priorities as getters returning the result of `this.as<Priority>TaskGroup({...})`. Never call tasks directly — the Yeoman environment orchestrates them.
- **Config access**: prefer `this.jhipsterConfig` (persists to `.yo-rc.json`), `this.jhipsterConfigWithDefaults` (read-only with defaults applied), and the `application`/`entity`/`field`/`relationship` context objects injected into tasks. Derived booleans (e.g. `entity.dtoMapstruct`, `field.fieldTypeInteger`) belong in `preparing*` priorities, not in templates.
- **Writing files**: use `this.writeFiles({ blocks, context })` with `condition` functions on blocks rather than branching inside templates. Use `editFile(path, transform)` or the needle APIs on `source` in `postWriting` to inject into already-written files.
- **Templates**: EJS (`.ejs`). Two-space indent for template logic; generated file's own rules apply to content. Factor shared fragments into `.ejs` sub-templates included via `<%- include('../path', { ... }) -%>`.
- **Commit messages** (enforced at review): imperative present tense, lowercase first letter, no trailing dot, header ≤100 chars. Reference issues in footer (`Fix #1234`). Use `[ci skip]` for docs-only commits.
- **Tests required** for every feature or bug fix. When behavior touches generated output, update/extend snapshots rather than asserting strings by hand.
- **Path aliases** for tests: `#testing` → `lib/testing/index.ts`, `#test-support` → `test/support/index.ts`.
- **Node version**: CI and local must match `engines` in `package.json`; avoid APIs only in newer releases.

## AI assistant disclosure

This project expects AI-assisted contributions to be disclosed (see `CONTRIBUTING.md` → *Use of AI coding assistants*). When you act as an AI assistant on this repo:

- Add a `Co-authored-by:` trailer to commits you author. Example for GitHub Copilot: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`. Use the equivalent identity for other assistants.
- When opening a PR on the user's behalf (or drafting a PR description), include a short note stating that an AI assistant contributed and summarizing what it produced.
- Remind the user to review, understand, and test your changes before submitting — do not encourage blind merges.
