// Runtime and per-locale payload sizes.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

import * as esbuild from 'esbuild';

import { catalogs } from './fixtures.js';
import { setup } from './compile.js';
import * as lingui from './lingui-catalog.js';
import * as parla from './parla-catalog.js';
import * as typesafe from './typesafe-catalog.js';
import { named, version as v } from './versions.js';

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
  [`@parlajs/react ${v('@parlajs/react')}, includes core`]: `export { createParla, ParlaProvider, useParla, useLocale } from '@parlajs/react';`,
  [`i18next ${v('i18next')} + react-i18next ${v('react-i18next')}`]: `import i18next from 'i18next'; export { i18next }; export { initReactI18next, useTranslation, I18nextProvider } from 'react-i18next';`,
  [`i18next ${v('i18next')} + react-i18next ${v('react-i18next')} + i18next-icu ${v('i18next-icu')}`]: `import i18next from 'i18next'; import ICU from 'i18next-icu'; export { i18next, ICU }; export { initReactI18next, useTranslation, I18nextProvider } from 'react-i18next';`,
  [`${named('react-intl')} (includes the ICU parser)`]: `export { createIntl, IntlProvider, useIntl, FormattedMessage } from 'react-intl';`,
  [`@lingui/core ${v('@lingui/core')} + @lingui/react ${v('@lingui/react')}`]: `export { i18n, setupI18n } from '@lingui/core'; export { I18nProvider, useLingui, Trans } from '@lingui/react';`,
  [`${named('paraglide')} (generated runtime, no React binding)`]: `export { getLocale, setLocale, locales } from './.tmp/paraglide/out/runtime.js'; export { plural } from './.tmp/paraglide/out/registry.js';`,
  [`${named('typesafe-i18n')} + typesafe-i18n/react`]: `export { i18n, i18nObject } from 'typesafe-i18n'; export { initI18nReact } from 'typesafe-i18n/react';`,
};

// Paraglide's runtime is generated.
await setup();

console.log('\n## Runtime (minified, React excluded)\n');
console.log('| | min | gzip | brotli |\n|---|---:|---:|---:|');
for (const [name, entry] of Object.entries(runtimes)) {
  const s = sizes(await bundle(entry));
  console.log(`| ${name} | ${kb(s.min)} | ${kb(s.gzip)} | ${kb(s.brotli)} |`);
}

const minify = async (path) =>
  Buffer.from((await esbuild.transform(readFileSync(path, 'utf8'), { minify: true })).code);
// Counted as runtime above.
const paraglideRuntime = {
  name: 'paraglide-runtime',
  setup: (build) =>
    build.onResolve({ filter: /\/(runtime|registry)\.js$/ }, (args) => ({
      path: args.path,
      external: true,
    })),
};

const payloads = {
  [`${named('parla')} compiled chunk (minified JS)`]: await minify(parla.chunkPath),
  [`${named('i18next')} JSON (\`{{var}}\`, \`_one\`/\`_other\` plurals)`]: Buffer.from(
    JSON.stringify(catalogs.i18next),
  ),
  [`${named('i18next-icu')} / ${named('react-intl')} JSON (ICU strings, parsed in the browser)`]: Buffer.from(
    JSON.stringify(catalogs.icu),
  ),
  [`${named('lingui')} compiled catalog (minified JS)`]: await minify(lingui.compiledPath),
  [`${named('paraglide')} message functions (minified JS)`]: await bundle(
    `export * as m from './.tmp/paraglide/out/messages.js';`,
    [paraglideRuntime],
  ),
  [`${named('typesafe-i18n')} locale (minified JS, parsed in the browser)`]: await minify(
    join(typesafe.outdir, 'en/index.js'),
  ),
};
console.log(`\n## One locale, one namespace (${Object.keys(catalogs.icu).length} messages)\n`);
console.log('| | raw | gzip | brotli |\n|---|---:|---:|---:|');
for (const [name, code] of Object.entries(payloads)) {
  const s = sizes(code);
  console.log(`| ${name} | ${kb(s.min)} | ${kb(s.gzip)} | ${kb(s.brotli)} |`);
}
