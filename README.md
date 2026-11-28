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

<!-- results 2026-11-28_1a36b55 -->

2026-11-28 13:43 UTC, Apple M3, darwin-arm64. Ratios are against Parla.

Versions: @inlang/paraglide-js 3.2.2, @inlang/plugin-message-format 4.6.2, @lingui/cli 6.12.0, @lingui/core 6.12.0, @lingui/react 6.12.0, @marcalexiei/oxfmt-config 2.0.1, @marcalexiei/oxlint-config 1.10.0, @parlajs/compiler 0.0.0 (1a36b55), @parlajs/core 0.0.0 (1a36b55), @parlajs/react 0.0.0 (1a36b55), @types/node 26.6.7, esbuild 0.28.2, i18next 27.2.7, i18next-icu 2.7.1, intl-messageformat 12.2.1, oxfmt 0.80.0, oxlint 1.95.0, oxlint-tsgolint 7.0.2008, react 19.3.1, react-dom 19.3.1, react-i18next 18.0.3, react-intl 12.2.1, typesafe-i18n 5.27.1, typescript 7.0.2, vitest 5.1.1.

### Runtime (minified, React excluded)

|                                                           |     min |    gzip |  brotli |
| --------------------------------------------------------- | ------: | ------: | ------: |
| @parlajs/react 0.0.0 (1a36b55), includes core             |  7.0 kB |  3.2 kB |  2.9 kB |
| i18next 27.2.7 + react-i18next 18.0.3                     | 54.9 kB | 18.2 kB | 16.5 kB |
| i18next 27.2.7 + react-i18next 18.0.3 + i18next-icu 2.7.1 | 96.3 kB | 30.9 kB | 27.4 kB |
| react-intl 12.2.1 (includes the ICU parser)               | 50.4 kB | 14.8 kB | 13.2 kB |
| @lingui/core 6.12.0 + @lingui/react 6.12.0                | 10.5 kB |  4.4 kB |  3.9 kB |
| paraglide 3.2.2 (generated runtime, no React binding)     | 11.2 kB |  4.2 kB |  3.8 kB |
| typesafe-i18n 5.27.1 + typesafe-i18n/react                |  4.6 kB |  1.6 kB |  1.4 kB |

### One locale, one namespace (200 messages)

|                                                                                 |     raw |   gzip | brotli |
| ------------------------------------------------------------------------------- | ------: | -----: | -----: |
| parla 0.0.0 (1a36b55) compiled chunk (minified JS)                              | 13.0 kB | 1.3 kB | 0.8 kB |
| i18next 27.2.7 JSON (`{{var}}`, `_one`/`_other` plurals)                        | 10.9 kB | 1.2 kB | 0.7 kB |
| i18next-icu 2.7.1 / react-intl 12.2.1 JSON (ICU strings, parsed in the browser) | 10.6 kB | 1.1 kB | 0.7 kB |
| lingui 6.12.0 compiled catalog (minified JS)                                    | 11.8 kB | 1.1 kB | 0.8 kB |
| paraglide 3.2.2 message functions (minified JS)                                 | 39.2 kB | 4.6 kB | 2.9 kB |
| typesafe-i18n 5.27.1 locale (minified JS, parsed in the browser)                |  9.3 kB | 1.0 kB | 0.6 kB |

### Type-check (TypeScript 7.0.2, median of 5 runs)

|                                | check | total | memory | types | instantiations |
| ------------------------------ | ----: | ----: | -----: | ----: | -------------: |
| baseline (200 string literals) |  0 ms | 21 ms |  24 MB |   945 |              1 |
| parla 0.0.0 (1a36b55)          |  1 ms | 22 ms |  25 MB |  1009 |            213 |
| i18next 27.2.7                 | 69 ms | 90 ms |  49 MB | 14563 |          99639 |
| react-intl 12.2.1              | 22 ms | 46 ms |  38 MB |  8363 |          10544 |
| lingui 6.12.0                  |  1 ms | 23 ms |  25 MB |  1619 |              9 |
| paraglide 3.2.2                |  3 ms | 24 ms |  27 MB |  1643 |            804 |
| typesafe-i18n 5.27.1           |  2 ms | 24 ms |  26 MB |  1945 |           1693 |

### Heap (Node v26.13.1, median of 5 fresh processes)

|                       |  loaded | after formatting all 200 |
| --------------------- | ------: | -----------------------: |
| parla 0.0.0 (1a36b55) |  789 kB |                   878 kB |
| i18next 27.2.7        |  333 kB |                   545 kB |
| i18next-icu 2.7.1     |  759 kB |                  1658 kB |
| react-intl 12.2.1     |  752 kB |                  1110 kB |
| lingui 6.12.0         |  995 kB |                  1046 kB |
| paraglide 3.2.2       | 2157 kB |                  2165 kB |
| typesafe-i18n 5.27.1  |  845 kB |                   916 kB |

### Throughput (Node v26.13.1, darwin-arm64)

|                                        | parla 0.0.0 (1a36b55) |              i18next 27.2.7 |           i18next-icu 2.7.1 |           react-intl 12.2.1 |               lingui 6.12.0 |             paraglide 3.2.2 |        typesafe-i18n 5.27.1 |
| -------------------------------------- | --------------------: | --------------------------: | --------------------------: | --------------------------: | --------------------------: | --------------------------: | --------------------------: |
| plain string                           |               40.2M/s | 826k/s (parla 48.6× faster) | 923k/s (parla 43.5× faster) | 1.6M/s (parla 25.5× faster) | 13.3M/s (parla 3.0× faster) |  9.1M/s (parla 4.4× faster) | 12.0M/s (parla 3.3× faster) |
| interpolation                          |               30.9M/s | 668k/s (parla 46.3× faster) | 803k/s (parla 38.5× faster) | 1.2M/s (parla 25.1× faster) |  6.7M/s (parla 4.6× faster) |  8.9M/s (parla 3.5× faster) |  7.1M/s (parla 4.4× faster) |
| plural                                 |               21.5M/s | 410k/s (parla 52.6× faster) | 298k/s (parla 72.3× faster) | 437k/s (parla 49.3× faster) | 766k/s (parla 28.1× faster) | 1.4M/s (parla 15.1× faster) |  2.6M/s (parla 8.4× faster) |
| cold start (create + load + 1 message) |                140k/s |   73k/s (parla 1.9× faster) |   58k/s (parla 2.4× faster) |  241k/s (parla 1.7× slower) |   7k/s (parla 20.7× faster) | 6.5M/s (parla 46.2× slower) |   24k/s (parla 5.8× faster) |

<!-- /results -->

## Reading them

- Parla, Lingui, Paraglide and typesafe-i18n format compiled or cached messages; i18next and react-intl resolve at call time.
- Paraglide resolves the locale on every call.
- react-intl's cold start defers all parsing to each message's first format.
- Paraglide has no init step; its real start-up cost is importing its modules.
- i18next infers params from `as const` resources: 100k type instantiations.
- react-intl types keys only, not params.
- Lingui types keys only once `Register` is augmented (`messageIds`, as here), else `string`; values
  are `Record<string, unknown>`. With its macros (`` t`Hi ${name}` ``, `<Trans>`) the source text is
  the message: no key to type, and tsc never sees the translations.
- Paraglide's payload holds every locale per message unless built per locale (`experimentalStaticLocale`).
- Plural syntax differs (`_one` keys, ICU, MF2 selectors, `{{item|items}}`); output is the same.
- react-intl's runtime includes the ICU parser, which precompiling would drop.
