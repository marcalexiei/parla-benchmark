# parla-benchmark

[Parla](https://github.com/marcalexiei/parla) vs i18next, i18next-icu, react-intl, Lingui, Paraglide and typesafe-i18n: size, speed, type-check time, heap. Same 200 messages for all (`fixtures.js`).

```sh
pnpm parla:update   # pack ../parla into .packs/
pnpm test           # every library formats the same text
pnpm bench          # size, types, memory, perf
```

CI runs it against Parla's `main` and writes the tables to the job summary.

Workarounds:

- Lingui, Paraglide and typesafe-i18n compile under `.tmp/`, like Parla (`*-catalog.js`).
- Paraglide's plugin loads from `node_modules`, not a CDN.
- typesafe-i18n runs through its `importer` API: its CLI needs `ts.createProgram`, gone in TypeScript 7.
- typesafe-i18n's `LL` Proxy answers `then`, so async factories return `{ LL }`.

## Results

Node v26.13.1, Apple Silicon, 2026-11-26, Parla `2bb4834`. Ratios are against Parla.

### Runtime (minified, React excluded)

|                                               |     min |    gzip |  brotli |
| --------------------------------------------- | ------: | ------: | ------: |
| parla (`@parlajs/react`, incl. core)          |  5.2 kB |  2.4 kB |  2.2 kB |
| i18next + react-i18next                       | 54.8 kB | 18.2 kB | 16.4 kB |
| i18next + react-i18next + i18next-icu         | 96.1 kB | 30.8 kB | 27.2 kB |
| react-intl (incl. the ICU parser)             | 50.2 kB | 14.6 kB | 13.1 kB |
| lingui (`@lingui/core` + `@lingui/react`)     | 10.5 kB |  4.4 kB |  3.9 kB |
| paraglide (generated runtime, no React layer) | 11.2 kB |  4.2 kB |  3.8 kB |
| typesafe-i18n + `typesafe-i18n/react`         |  4.6 kB |  1.6 kB |  1.4 kB |

### One locale, one namespace (200 messages)

|                                                  |     raw |   gzip | brotli |
| ------------------------------------------------ | ------: | -----: | -----: |
| parla compiled chunk (minified JS)               | 14.2 kB | 1.3 kB | 0.8 kB |
| i18next JSON                                     | 10.9 kB | 1.2 kB | 0.7 kB |
| i18next-icu / react-intl JSON (ICU strings)      | 10.6 kB | 1.1 kB | 0.7 kB |
| lingui compiled catalog (minified JS)            | 11.8 kB | 1.1 kB | 0.8 kB |
| paraglide message functions (minified JS)        | 39.2 kB | 4.6 kB | 2.9 kB |
| typesafe-i18n locale (minified JS, parsed later) |  9.3 kB | 1.0 kB | 0.6 kB |

### Throughput

|               |          plain string |         interpolation |               plural | cold start (create + load + 1 message) |
| ------------- | --------------------: | --------------------: | -------------------: | -------------------------------------: |
| parla         |               34.7M/s |               35.6M/s |               1.9M/s |                                 194k/s |
| i18next       |   902k/s (38× slower) |   733k/s (49× slower) | 454k/s (4.3× slower) |                    77k/s (2.5× slower) |
| i18next-icu   |   996k/s (35× slower) |   882k/s (40× slower) | 365k/s (5.3× slower) |                    61k/s (3.2× slower) |
| react-intl    |   2.2M/s (16× slower) |   1.6M/s (22× slower) | 582k/s (3.3× slower) |                   269k/s (1.4× faster) |
| lingui        | 13.8M/s (2.5× slower) |  7.2M/s (4.9× slower) | 842k/s (2.3× slower) |                      7k/s (29× slower) |
| paraglide     | 10.5M/s (3.3× slower) | 10.1M/s (3.5× slower) | 1.5M/s (1.3× slower) |                  7.6M/s (no init step) |
| typesafe-i18n | 13.0M/s (2.7× slower) |  7.9M/s (4.5× slower) | 2.8M/s (1.4× faster) |                    26k/s (7.5× slower) |

### Type-check (TypeScript 7.0.2, 200 typed calls, median of 5 runs)

|                                | check | total | memory | types | instantiations |
| ------------------------------ | ----: | ----: | -----: | ----: | -------------: |
| baseline (200 string literals) |  0 ms | 19 ms |  24 MB |   945 |              1 |
| parla                          |  1 ms | 20 ms |  25 MB |  1011 |             58 |
| i18next                        | 63 ms | 83 ms |  49 MB | 14563 |          99639 |
| react-intl                     | 20 ms | 40 ms |  39 MB |  8363 |          10544 |
| lingui                         |  1 ms | 19 ms |  25 MB |  1619 |              9 |
| paraglide                      |  2 ms | 20 ms |  27 MB |  1643 |            804 |
| typesafe-i18n                  |  2 ms | 21 ms |  26 MB |  1945 |           1693 |

### Heap (median of 5 fresh processes)

|               |  loaded | after formatting all 200 |
| ------------- | ------: | -----------------------: |
| parla         |  699 kB |                   792 kB |
| i18next       |  332 kB |                   538 kB |
| i18next-icu   |  758 kB |                  1654 kB |
| react-intl    |  752 kB |                  1112 kB |
| lingui        |  995 kB |                  1046 kB |
| paraglide     | 2157 kB |                  2166 kB |
| typesafe-i18n |  845 kB |                   916 kB |

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
