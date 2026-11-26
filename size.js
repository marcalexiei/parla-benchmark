// Runtime and per-locale payload size: Parla vs i18next. Run: pnpm size
import { readFileSync } from 'node:fs';
import { brotliCompressSync, gzipSync } from 'node:zlib';

import * as esbuild from 'esbuild';

import { catalogs } from './fixtures.js';
import { chunkPath, setup } from './parla-catalog.js';

const here = import.meta.dirname;
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const sizes = (code) => ({
  min: code.length,
  gzip: gzipSync(code, { level: 9 }).length,
  brotli: brotliCompressSync(code).length,
});

async function bundle(contents) {
  const out = await esbuild.build({
    stdin: { contents, resolveDir: here, loader: 'js' },
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
};

console.log('\n## Runtime (minified, React excluded)\n');
console.log('| | min | gzip | brotli |\n|---|---:|---:|---:|');
for (const [name, entry] of Object.entries(runtimes)) {
  const s = sizes(await bundle(entry));
  console.log(`| ${name} | ${kb(s.min)} | ${kb(s.gzip)} | ${kb(s.brotli)} |`);
}

// Per-locale payload for the same 200 messages.
setup();
const chunk = readFileSync(chunkPath, 'utf8');
const chunkMin = Buffer.from(
  (await esbuild.transform(chunk, { minify: true, format: 'esm' })).code,
);

const payloads = {
  'parla compiled chunk (minified JS)': chunkMin,
  'i18next JSON (`{{var}}`, `_one`/`_other` plurals)': Buffer.from(
    JSON.stringify(catalogs.i18next),
  ),
  'i18next-icu JSON (ICU strings, parsed in the browser)': Buffer.from(
    JSON.stringify(catalogs.icu),
  ),
};
console.log(`\n## One locale, one namespace (${Object.keys(catalogs.icu).length} messages)\n`);
console.log('| | raw | gzip | brotli |\n|---|---:|---:|---:|');
for (const [name, code] of Object.entries(payloads)) {
  const s = sizes(code);
  console.log(`| ${name} | ${kb(s.min)} | ${kb(s.gzip)} | ${kb(s.brotli)} |`);
}
