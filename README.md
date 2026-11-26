# parla-benchmark

Size and speed of [Parla](https://github.com/marcalexiei/parla) against i18next (plain and with
i18next-icu), react-intl (FormatJS), Lingui, Paraglide (inlang) and typesafe-i18n, on the same
200 English messages: 120 plain, 50 interpolated, 30 plural (`fixtures.js`).

```sh
pnpm parla:update   # pack ../parla into .packs/ and reinstall
pnpm test           # compile the catalogs, then check every library formats the same text
pnpm bench          # size.js, then the vitest benchmarks in formatting.bench.js
```

Parla, Lingui, Paraglide and typesafe-i18n have a compile step. Each has a `*-catalog.js`
that writes its catalog under `.tmp/` and runs it there, as vitest's `globalSetup`:

- Lingui: `createCompiledCatalog` from `@lingui/cli/api`, which is what `lingui compile` runs,
  applied to the ICU catalog.
- Paraglide: `compile()` on an inlang project, with `@inlang/plugin-message-format` loaded from
  `node_modules` rather than a CDN.
- typesafe-i18n: its `importer` API writes the base locale and runs the generator, emitting
  JavaScript. The CLI can't run here: it reads the base locale with `ts.createProgram`, which
  TypeScript 7, pulled in by the other packages, no longer has.

CI runs the same against Parla's `main` on every push, pull request and Monday, and writes the
tables to the job summary.

## Results

Node v26.13.1, Apple Silicon, 2026-11-26. Ratios are against Parla.

### Runtime (minified, React excluded)

|                                               |     min |    gzip |  brotli |
| --------------------------------------------- | ------: | ------: | ------: |
| parla (`@parlajs/react`, incl. core)          |  4.6 kB |  2.1 kB |  1.9 kB |
| i18next + react-i18next                       | 54.8 kB | 18.2 kB | 16.4 kB |
| i18next + react-i18next + i18next-icu         | 96.1 kB | 30.8 kB | 27.2 kB |
| react-intl (incl. the ICU parser)             | 50.2 kB | 14.6 kB | 13.1 kB |
| lingui (`@lingui/core` + `@lingui/react`)     | 10.5 kB |  4.4 kB |  3.9 kB |
| paraglide (generated runtime, no React layer) | 11.2 kB |  4.2 kB |  3.8 kB |
| typesafe-i18n + `typesafe-i18n/react`         |  4.6 kB |  1.6 kB |  1.4 kB |

### One locale, one namespace (200 messages)

|                                                  |     raw |   gzip | brotli |
| ------------------------------------------------ | ------: | -----: | -----: |
| parla compiled chunk (minified JS)               | 14.4 kB | 1.2 kB | 0.8 kB |
| i18next JSON                                     | 10.9 kB | 1.2 kB | 0.7 kB |
| i18next-icu / react-intl JSON (ICU strings)      | 10.6 kB | 1.1 kB | 0.7 kB |
| lingui compiled catalog (minified JS)            | 11.8 kB | 1.1 kB | 0.8 kB |
| paraglide message functions (minified JS)        | 39.2 kB | 4.6 kB | 2.9 kB |
| typesafe-i18n locale (minified JS, parsed later) |  9.3 kB | 1.0 kB | 0.6 kB |

### Throughput

|               |          plain string |        interpolation |               plural | cold start (create + load + 1 message) |
| ------------- | --------------------: | -------------------: | -------------------: | -------------------------------------: |
| parla         |               36.7M/s |              34.4M/s |               1.8M/s |                                  25k/s |
| i18next       |   903k/s (41× slower) |  727k/s (47× slower) | 463k/s (4.0× slower) |                    78k/s (3.1× faster) |
| i18next-icu   |   1.0M/s (36× slower) |  896k/s (38× slower) | 365k/s (5.0× slower) |                    63k/s (2.5× faster) |
| react-intl    |   2.3M/s (16× slower) |  1.7M/s (21× slower) | 551k/s (3.3× slower) |                    257k/s (10× faster) |
| lingui        | 14.4M/s (2.5× slower) | 7.2M/s (4.8× slower) | 800k/s (2.3× slower) |                     7k/s (3.7× slower) |
| paraglide     | 11.0M/s (3.3× slower) | 9.9M/s (3.5× slower) | 1.5M/s (1.3× slower) |                  4.7M/s (no init step) |
| typesafe-i18n | 12.8M/s (2.9× slower) | 7.7M/s (4.5× slower) | 2.8M/s (1.5× faster) |                         24k/s (on par) |

## Reading them

- Parla compiles messages to functions at build time, so formatting is a property lookup and a
  call. i18next, i18next-icu and react-intl parse or resolve at call time; Lingui interpolates a
  precompiled array; typesafe-i18n parses each message on first use and caches it.
- Paraglide also compiles to functions, but each call resolves the current locale first, which
  costs it about 3× on plain messages.
- typesafe-i18n is the one library ahead of Parla on plurals, at 1.5×.
- Cold start is where Parla loses: building the accessor tree and the per-locale runtime costs
  more than i18next's or react-intl's init. It happens once per namespace and locale. Paraglide
  has no init step, so its "cold start" is only `setLocale` and a call; its real cost is
  importing the message modules, which a bundler resolves. Lingui and typesafe-i18n import the
  locale module on each run here, as Parla does.
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
