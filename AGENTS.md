# AGENTS.md

Parla vs other i18n libraries on the same 200 messages: size, speed, type-check time, heap.

## Rules

- **Parla comes from `.packs/`**, refreshed by `pnpm parla:update`; CI packs `main` from `.parla/`.
- **A library counts only once `formatting.spec.js` passes for it.**
- **A new library goes everywhere**: `libraries/`, `libraries.js`, the benches, `size.js`, `types.js`, `summary.js`, `versions.js`.
- **Compile steps live in `*-catalog.js`**, write to `.tmp/`, and run via `compile.js`.
- **Compilers load inside `setup()`**, or memory.js counts them.
- **Each library loads its own data**, so memory.js charges it there.
- **Vitest 5 has no global `bench()`**: `test(name, async ({ bench }) => bench.compare(bench('parla', fn), …))`.

## Commands

```sh
pnpm parla:update   # repack ../parla
pnpm test           # same output everywhere
pnpm bench          # size, types, memory, perf; archives the README's results, writes new ones
pnpm lint           # oxlint, type-aware (`lint:fix`)
pnpm format         # oxfmt (`format:check` in CI)
```

## Conventions

- **Plain `.js` ESM**, never `.mjs`.
- **pnpm 12, exact versions**; install scripts go in `allowBuilds`.
- **Comments: one line, the reason.**
- **Each oxlint override carries its reason in `oxlint.config.ts`**; an inline disable, after `--`.
- **Commits: one-line conventional subject**, no body, no co-author.
- **Keep `bench.yml` green.** README results change only through `pnpm bench`, which moves the old ones to `results/<UTC date>_<Parla version>.md`: the commit until Parla is published. Other versions go in the header: as a filename they'd pass the 255-byte limit.
- **Parla's commit is in `.packs/commit`**, since every pack is 0.0.0.
