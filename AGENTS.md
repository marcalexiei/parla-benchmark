# AGENTS.md

Guidance for Claude Code in this repository. Durable rules live here; results live in the README.

## What this is

Size, speed, type-check time and memory of Parla against i18next, i18next-icu, react-intl, Lingui,
Paraglide and typesafe-i18n, on the same 200 messages: 120 plain, 50 interpolated, 30 plural.

- **Parla comes from tarballs, not npm.** `pnpm parla:update` packs `../parla` into `.packs/` and
  reinstalls; `pnpm-workspace.yaml` overrides `@parlajs/*` to those files. CI checks Parla's
  `main` out into `.parla/` and packs it the same way.
- **A library's timings count only once it formats the same text.** `formatting.test.js` checks
  every message in every library against i18next-icu; a new library joins that test first.

| File                  | What it is                                                         |
| --------------------- | ------------------------------------------------------------------ |
| `fixtures.js`         | The 200 messages, in each library's syntax                         |
| `*-catalog.js`        | One compile step per library that has one, writing under `.tmp/`   |
| `compile.js`          | Runs every compile step; vitest's `globalSetup`                    |
| `libraries/*.js`      | One module per library: `create()` for benches, `formatter()`      |
| `libraries.js`        | The `libraries` map of those modules                               |
| `formatting.test.js`  | Every library returns the same text for every message              |
| `formatting.bench.js` | Plain, interpolation, plural and cold-start comparisons            |
| `size.js`             | Runtime bundle (esbuild, React excluded) and per-locale payload    |
| `types.js`            | `tsc` time and memory on 200 typed calls per library               |
| `memory.js`           | Heap per library, via `memory-probe.js` in a fresh process each    |
| `summary.js`          | Throughput table from `.tmp/bench.json`                            |

- **Each script starts with `compile.js`'s `setup()`**, as vitest does through `globalSetup`.
- **A `*-catalog.js` imports its compiler inside `setup()`**, so loading a library never loads
  its compiler, which memory.js would count.
- **Library data is loaded or copied inside its own module** (`structuredClone` for JSON-style
  catalogs), so memory.js charges it to that library.
- **Vitest 5 has no global `bench()`.** Use the test fixture:
  `test(name, async ({ bench }) => { await bench.compare(bench('parla', fn), …) })`.
- **A new library goes into every comparison**: a `libraries/` module and its entry in
  `libraries.js` (which covers the test and memory.js), all four benches, `size.js`, a project in
  `types.js`, and the `libraries` list in `summary.js`.
- **types.js types every library its documented way**, with key checking at least; a type error
  fails the run.

## Commands

```sh
pnpm parla:update   # pack ../parla into .packs/ and reinstall
pnpm test           # compile the catalogs, then the same-output test
pnpm size           # bundle and payload tables
pnpm types          # type-check time and memory
pnpm memory         # heap per library
pnpm perf           # vitest bench, then summary.js
pnpm bench          # all four, in that order
```

## Conventions

- **Plain `.js` ES modules**, never `.mjs`.
- **pnpm 12 with exact versions**; a package with an install script goes in `allowBuilds`.
- **A comment states the reason, in one line**, or is left out.
- **A commit is a one-line conventional subject** (`feat: …`), with no body and no co-author line.
- **Keep `.github/workflows/bench.yml` working**, and refresh the README tables when results change.
