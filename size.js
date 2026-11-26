// Runtime and per-locale payload size of each library. Run: pnpm size
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

import * as esbuild from 'esbuild';

import { catalogs } from './fixtures.js';
import * as lingui from './lingui-catalog.js';
import * as paraglide from './paraglide-catalog.js';
import * as parla from './parla-catalog.js';
import * as typesafe from './typesafe-catalog.js';

const here = import.meta.dirname;
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const sizes = (code) => ({
  min: code.length,
  gzip: gzipSync(code, { level: 9 }).length,
  brotli: brotliCompressSync(code).length,
});

async function bundle(contents, plugins = []) {
  const out = await esbuild.build({
    stdin: { contents, resolveDir: here, loader: 'js' },
    plugins,
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'silent',
  });
  return Buffer.from(out.outputFiles[0].contents);
}

const runtimes = {
  'parla (@parlajs/react, includes core)': `export { createParla, ParlaProvider, useT, useLocale } from '@parlajs/react';`,
  'i18next + react-i18next': `import i18next from 'i18next'; export { i18next }; export { initReactI18next, useTranslation, I18nextProvider } from 'react-i18next';`,
  'i18next + react-i18next + i18next-icu': `import i18next from 'i18next'; import ICU from 'i18next-icu'; export { i18next, ICU }; export { initReactI18next, useTranslation, I18nextProvider } from 'react-i18next';`,
  'react-intl (includes the ICU parser)': `export { createIntl, IntlProvider, useIntl, FormattedMessage } from 'react-intl';`,
  'lingui (@lingui/core + @lingui/react)': `export { i18n, setupI18n } from '@lingui/core'; export { I18nProvider, useLingui, Trans } from '@lingui/react';`,
  'paraglide (generated runtime, no React binding)': `export { getLocale, setLocale, locales } from './.tmp/paraglide/out/runtime.js'; export { plural } from './.tmp/paraglide/out/registry.js';`,
  'typesafe-i18n + typesafe-i18n/react': `export { i18n, i18nObject } from 'typesafe-i18n'; export { initI18nReact } from 'typesafe-i18n/react';`,
};

// Paraglide's runtime is generated, so compile every catalog first.
parla.setup();
lingui.setup();
await paraglide.setup();
await typesafe.setup();

console.log('\n## Runtime (minified, React excluded)\n');
console.log('| | min | gzip | brotli |\n|---|---:|---:|---:|');
for (const [name, entry] of Object.entries(runtimes)) {
  const s = sizes(await bundle(entry));
  console.log(`| ${name} | ${kb(s.min)} | ${kb(s.gzip)} | ${kb(s.brotli)} |`);
}

// Per-locale payload for the same 200 messages.
const minify = async (path) =>
  Buffer.from((await esbuild.transform(readFileSync(path, 'utf8'), { minify: true })).code);
// Counted above as Paraglide's runtime.
const paraglideRuntime = {
  name: 'paraglide-runtime',
  setup: (build) =>
    build.onResolve({ filter: /\/(runtime|registry)\.js$/ }, (args) => ({
      path: args.path,
      external: true,
    })),
};

const payloads = {
  'parla compiled chunk (minified JS)': await minify(parla.chunkPath),
  'i18next JSON (`{{var}}`, `_one`/`_other` plurals)': Buffer.from(
    JSON.stringify(catalogs.i18next),
  ),
  'i18next-icu / react-intl JSON (ICU strings, parsed in the browser)': Buffer.from(
    JSON.stringify(catalogs.icu),
  ),
  'lingui compiled catalog (minified JS)': await minify(lingui.compiledPath),
  'paraglide message functions (minified JS)': await bundle(
    `export * as m from './.tmp/paraglide/out/messages.js';`,
    [paraglideRuntime],
  ),
  'typesafe-i18n locale (minified JS, parsed in the browser)': await minify(
    join(typesafe.outdir, 'en/index.js'),
  ),
};
console.log(`\n## One locale, one namespace (${Object.keys(catalogs.icu).length} messages)\n`);
console.log('| | raw | gzip | brotli |\n|---|---:|---:|---:|');
for (const [name, code] of Object.entries(payloads)) {
  const s = sizes(code);
  console.log(`| ${name} | ${kb(s.min)} | ${kb(s.gzip)} | ${kb(s.brotli)} |`);
}
