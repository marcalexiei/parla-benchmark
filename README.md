# parla-benchmark

Size and speed of [Parla](https://github.com/marcalexiei/parla) against other i18n libraries,
on the same 200 English messages: 120 plain, 50 interpolated, 30 plural (`fixtures.js`).

```sh
pnpm parla:update   # pack ../parla into .packs/ and reinstall
pnpm test           # every library formats the same text
pnpm bench          # size.js, then the vitest benchmarks in formatting.bench.js
```

CI runs the same against Parla's `main` on every push, pull request and Monday, and writes the
tables to the job summary.

## Results

Node v26.13.1, Apple Silicon, 2026-11-26.

### Runtime (minified, React excluded)

|                                       |     min |    gzip |  brotli |
| ------------------------------------- | ------: | ------: | ------: |
| parla (`@parlajs/react`, incl. core)  |  4.6 kB |  2.1 kB |  1.9 kB |
| i18next + react-i18next               | 54.8 kB | 18.2 kB | 16.4 kB |
| i18next + react-i18next + i18next-icu | 96.1 kB | 30.8 kB | 27.2 kB |

### One locale, one namespace (200 messages)

|                                    |     raw |   gzip | brotli |
| ---------------------------------- | ------: | -----: | -----: |
| parla compiled chunk (minified JS) | 14.4 kB | 1.2 kB | 0.8 kB |
| i18next JSON                       | 10.9 kB | 1.2 kB | 0.7 kB |
| i18next-icu JSON (ICU strings)     | 10.6 kB | 1.1 kB | 0.7 kB |

### Throughput

|                                        |   parla |              i18next |          i18next-icu |
| -------------------------------------- | ------: | -------------------: | -------------------: |
| plain string                           | 40.5M/s |  936k/s (43× slower) |  1.0M/s (39× slower) |
| interpolation                          | 34.3M/s |  759k/s (45× slower) |  917k/s (37× slower) |
| plural                                 |  2.0M/s | 475k/s (4.3× slower) | 382k/s (5.3× slower) |
| cold start (create + load + 1 message) |   28k/s |  82k/s (2.9× faster) |  68k/s (2.4× faster) |

## Reading them

- Parla compiles messages to functions at build time, so formatting is a property lookup and a
  call; i18next parses or resolves at call time.
- Cold start is where Parla loses: building the accessor tree and the per-locale runtime costs
  more than i18next's init. It happens once per namespace and locale.
- Payload per locale is a wash once compressed.
- i18next can load per locale too (`i18next-http-backend`), so per-locale loading is not an
  advantage over i18next; it is over Paraglide, which bundles every locale.
