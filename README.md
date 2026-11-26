# parla-benchmark

[Parla](https://github.com/marcalexiei/parla) vs i18next, i18next-icu, react-intl, Lingui, Paraglide and typesafe-i18n: size, speed, type-check time, heap. Same 200 messages for all (`fixtures.js`).

```sh
pnpm parla:update   # pack ../parla into .packs/
pnpm test           # every library formats the same text
pnpm bench          # size, types, memory, perf; updates the results below
```

CI runs it against Parla's `main` and writes the tables to the job summary.

Workarounds:

- Lingui, Paraglide and typesafe-i18n compile under `.tmp/`, like Parla (`*-catalog.js`).
- Paraglide's plugin loads from `node_modules`, not a CDN.
- typesafe-i18n runs through its `importer` API: its CLI needs `ts.createProgram`, gone in TypeScript 7.
- typesafe-i18n's `LL` Proxy answers `then`, so async factories return `{ LL }`.

## Results

Latest run; earlier ones are in [`results/`](results/).

<!-- results 2026-11-26_2221 -->

2026-11-26 22:21 UTC, Apple M3, darwin-arm64. Ratios are against Parla.

Versions: @inlang/paraglide-js 3.2.2, @inlang/plugin-message-format 4.6.2, @lingui/cli 6.12.0, @lingui/core 6.12.0, @lingui/react 6.12.0, @parlajs/compiler 0.0.0 (fb483a2), @parlajs/core 0.0.0 (fb483a2), @parlajs/react 0.0.0 (fb483a2), esbuild 0.28.2, i18next 27.2.4, i18next-icu 2.7.1, intl-messageformat 12.2.0, react 19.3.1, react-dom 19.3.1, react-i18next 18.0.3, react-intl 12.2.0, typesafe-i18n 5.27.1, typescript 7.0.2, vitest 5.1.1.

### Runtime (minified, React excluded)

| | min | gzip | brotli |
|---|---:|---:|---:|
| @parlajs/react 0.0.0 (fb483a2), includes core | 5.5 kB | 2.5 kB | 2.3 kB |
| i18next 27.2.4 + react-i18next 18.0.3 | 54.8 kB | 18.2 kB | 16.4 kB |
| i18next 27.2.4 + react-i18next 18.0.3 + i18next-icu 2.7.1 | 96.1 kB | 30.8 kB | 27.2 kB |
| react-intl 12.2.0 (includes the ICU parser) | 50.2 kB | 14.6 kB | 13.1 kB |
| @lingui/core 6.12.0 + @lingui/react 6.12.0 | 10.5 kB | 4.4 kB | 3.9 kB |
| paraglide 3.2.2 (generated runtime, no React binding) | 11.2 kB | 4.2 kB | 3.8 kB |
| typesafe-i18n 5.27.1 + typesafe-i18n/react | 4.6 kB | 1.6 kB | 1.4 kB |

### One locale, one namespace (200 messages)

| | raw | gzip | brotli |
|---|---:|---:|---:|
| parla 0.0.0 (fb483a2) compiled chunk (minified JS) | 13.0 kB | 1.3 kB | 0.8 kB |
| i18next 27.2.4 JSON (`{{var}}`, `_one`/`_other` plurals) | 10.9 kB | 1.2 kB | 0.7 kB |
| i18next-icu 2.7.1 / react-intl 12.2.0 JSON (ICU strings, parsed in the browser) | 10.6 kB | 1.1 kB | 0.7 kB |
| lingui 6.12.0 compiled catalog (minified JS) | 11.8 kB | 1.1 kB | 0.8 kB |
| paraglide 3.2.2 message functions (minified JS) | 39.2 kB | 4.6 kB | 2.9 kB |
| typesafe-i18n 5.27.1 locale (minified JS, parsed in the browser) | 9.3 kB | 1.0 kB | 0.6 kB |

### Type-check (TypeScript 7.0.2, median of 5 runs)

| | check | total | memory | types | instantiations |
|---|---:|---:|---:|---:|---:|
| baseline (200 string literals) | 1 ms | 33 ms | 24 MB | 945 | 1 |
| parla 0.0.0 (fb483a2) | 1 ms | 30 ms | 25 MB | 1126 | 365 |
| i18next 27.2.4 | 65 ms | 86 ms | 49 MB | 14563 | 99639 |
| react-intl 12.2.0 | 20 ms | 41 ms | 39 MB | 8363 | 10544 |
| lingui 6.12.0 | 1 ms | 20 ms | 25 MB | 1619 | 9 |
| paraglide 3.2.2 | 2 ms | 21 ms | 27 MB | 1643 | 804 |
| typesafe-i18n 5.27.1 | 2 ms | 22 ms | 26 MB | 1945 | 1693 |

### Heap (Node v26.13.1, median of 5 fresh processes)

| | loaded | after formatting all 200 |
|---|---:|---:|
| parla 0.0.0 (fb483a2) | 727 kB | 812 kB |
| i18next 27.2.4 | 332 kB | 538 kB |
| i18next-icu 2.7.1 | 758 kB | 1654 kB |
| react-intl 12.2.0 | 752 kB | 1109 kB |
| lingui 6.12.0 | 995 kB | 1046 kB |
| paraglide 3.2.2 | 2157 kB | 2166 kB |
| typesafe-i18n 5.27.1 | 845 kB | 916 kB |

### Throughput (Node v26.13.1, darwin-arm64)

| | parla 0.0.0 (fb483a2) | i18next 27.2.4 | i18next-icu 2.7.1 | react-intl 12.2.0 | lingui 6.12.0 | paraglide 3.2.2 | typesafe-i18n 5.27.1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| plain string | 39.0M/s | 903k/s (parla 43.1× faster) | 998k/s (parla 39.0× faster) | 2.2M/s (parla 18.0× faster) | 14.7M/s (parla 2.7× faster) | 10.3M/s (parla 3.8× faster) | 12.5M/s (parla 3.1× faster) |
| interpolation | 36.9M/s | 742k/s (parla 49.8× faster) | 891k/s (parla 41.5× faster) | 1.5M/s (parla 24.7× faster) | 7.2M/s (parla 5.1× faster) | 9.8M/s (parla 3.8× faster) | 7.9M/s (parla 4.7× faster) |
| plural | 2.6M/s | 446k/s (parla 5.9× faster) | 358k/s (parla 7.3× faster) | 559k/s (parla 4.7× faster) | 835k/s (parla 3.1× faster) | 1.6M/s (parla 1.7× faster) | 2.7M/s (parla 1.0× slower) |
| cold start (create + load + 1 message) | 161k/s | 80k/s (parla 2.0× faster) | 63k/s (parla 2.5× faster) | 268k/s (parla 1.7× slower) | 7k/s (parla 23.4× faster) | 7.1M/s (parla 44.3× slower) | 25k/s (parla 6.4× faster) |

<!-- /results -->

## Reading them

- Parla, Lingui, Paraglide and typesafe-i18n format compiled or cached messages; i18next and react-intl resolve at call time.
- Paraglide resolves the locale on every call.
- react-intl's cold start defers all parsing to each message's first format.
- Paraglide has no init step; its real start-up cost is importing its modules.
- i18next infers params from `as const` resources: 100k type instantiations.
- react-intl and Lingui type keys only, not params.
- Paraglide's payload holds every locale per message unless built per locale (`experimentalStaticLocale`).
- Plural syntax differs (`_one` keys, ICU, MF2 selectors, `{{item|items}}`); output is the same.
- react-intl's runtime includes the ICU parser, which precompiling would drop.
