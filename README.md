# parla-benchmark

Size, speed, type-check time and memory of [Parla](https://github.com/marcalexiei/parla) against i18next (plain and with
i18next-icu), react-intl (FormatJS), Lingui, Paraglide (inlang) and typesafe-i18n, on the same
200 English messages: 120 plain, 50 interpolated, 30 plural (`fixtures.js`).

```sh
pnpm parla:update   # pack ../parla into .packs/ and reinstall
pnpm test           # compile the catalogs, then check every library formats the same text
pnpm size           # runtime bundle and per-locale payload (size.js)
pnpm types          # tsc time and memory on 200 typed calls per library (types.js)
pnpm memory         # heap per library, each in a fresh process (memory.js)
pnpm perf           # the vitest benchmarks in formatting.bench.js
pnpm bench          # all four
```

Parla, Lingui, Paraglide and typesafe-i18n have a compile step. Each has a `*-catalog.js`
that writes its catalog under `.tmp/` and compiles it there; `compile.js` runs them all, as
vitest's `globalSetup` and at the start of each script:

- Lingui: `createCompiledCatalog` from `@lingui/cli/api`, which is what `lingui compile` runs,
  applied to the ICU catalog.
- Paraglide: `compile()` on an inlang project, with `@inlang/plugin-message-format` loaded from
  `node_modules` rather than a CDN, and `.d.ts` files emitted for `types.js`.
- typesafe-i18n: its `importer` API writes the base locale and runs the generator, emitting
  JavaScript. The CLI can't run here: it reads the base locale with `ts.createProgram`, which
  TypeScript 7, pulled in by the other packages, no longer has. Its `LL` Proxy also answers
  `then`, so an async factory hands it back wrapped as `{ LL }`; awaited bare, it never settles.

CI runs the same against Parla's `main` on every push, pull request and Monday, and writes the
tables to the job summary.

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

- Parla compiles messages to functions at build time, so formatting is a property lookup and a
  call. i18next, i18next-icu and react-intl parse or resolve at call time; Lingui interpolates a
  precompiled array; typesafe-i18n parses each message on first use and caches it.
- Paraglide also compiles to functions, but each call resolves the current locale first, which
  costs it about 3× on plain messages.
- typesafe-i18n is the one library ahead of Parla on plurals, at 1.4×.
- Cold start: Parla builds a namespace's accessor in one call, and beats every library but
  react-intl, whose `createIntl` defers all parsing to the first format of each message.
  Paraglide has no init step, so its "cold start" is only `setLocale` and a call; its real cost
  is importing the message modules, which a bundler resolves. Lingui and typesafe-i18n import the
  locale module on each run here, as Parla does.
- Type-check: each library is typed its documented way (`types.js`). Parla, Lingui, Paraglide
  and typesafe-i18n cost next to nothing over the baseline, because their types are plain
  interfaces or a key union. i18next infers keys and `{{params}}` from the resources with
  conditional types: 100k instantiations and 63 ms for 200 calls. react-intl and Lingui check
  keys only, not params.
- Heap counts library code, the catalog and caches, from a fresh process (`memory.js`).
  i18next-icu and react-intl grow most while formatting, as they parse and cache each ICU
  message; Paraglide's 200 message modules cost about 2 MB up front.
- Payload per locale is a wash once compressed, except Paraglide: one exported function per
  message, with its locale switch inside, comes to 3–4× the others even with a single locale.
  Each function holds every locale unless the app is built per locale (`experimentalStaticLocale`).
- i18next can load per locale too (`i18next-http-backend`), so per-locale loading is not an
  advantage over i18next.
- The plural models differ: i18next uses `_one`/`_other` keys; Parla, i18next-icu, react-intl and
  Lingui use ICU `{count, plural, …}`; Paraglide declares a `plural` selector and matches
  variants on it (MessageFormat 2 style); typesafe-i18n writes `{count} {{item|items}}`. They
  all produce the same text here.
- react-intl's runtime includes the ICU parser. FormatJS can precompile messages to ASTs and drop
  the parser, which this benchmark does not do.
