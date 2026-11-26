import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { catalogs } from './fixtures.js';

const dir = join(import.meta.dirname, '.tmp/typesafe-i18n');
export const outdir = join(dir, 'src/i18n');
export const outUrl = (file) => pathToFileURL(join(outdir, file)).href;

export async function setup() {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, '.typesafe-i18n.json'),
    JSON.stringify({
      adapter: 'react',
      outputFormat: 'JavaScript',
      esmImports: true,
      baseLocale: 'en',
      outputPath: './src/i18n/',
    }),
  );
  // Its CLI needs ts.createProgram, gone in TypeScript 7.
  const { storeTranslationToDisk } = await import('typesafe-i18n/importer');
  const { info } = console;
  const cwd = process.cwd();
  // Config comes from cwd; logs would pollute size.js output.
  process.chdir(dir);
  console.info = () => {};
  try {
    await storeTranslationToDisk({ locale: 'en', translations: catalogs.typesafe }, true);
  } finally {
    process.chdir(cwd);
    console.info = info;
  }
  // Its scratch copy shadows the real package.
  rmSync(join(dir, 'node_modules'), { recursive: true, force: true });
}
