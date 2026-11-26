# AGENTS.md

Parla vs other i18n libraries on the same 200 messages: size, speed, type-check time, heap.

## Rules

- **Parla comes from `.packs/`**, refreshed by `pnpm parla:update`; CI packs `main` from `.parla/`.
- **A library counts only once `formatting.test.js` passes for it.**
- **A new library goes everywhere**: `libraries/`, `libraries.js`, the benches, `size.js`, `types.js`, `summary.js`.
- **Compile steps live in `*-catalog.js`**, write to `.tmp/`, and run via `compile.js`.
- **Compilers load inside `setup()`**, or memory.js counts them.
- **Each library loads its own data**, so memory.js charges it there.
- **Vitest 5 has no global `bench()`**: `test(name, async ({ bench }) => bench.compare(bench('parla', fn), …))`.

## Commands

```sh
pnpm parla:update   # repack ../parla
pnpm test           # same output everywhere
pnpm bench          # size, types, memory, perf
```

## Conventions

- **Plain `.js` ESM**, never `.mjs`.
- **pnpm 12, exact versions**; install scripts go in `allowBuilds`.
- **Comments: one line, the reason.**
- **Commits: one-line conventional subject**, no body, no co-author.
- **Keep `bench.yml` green and the README tables current.**
