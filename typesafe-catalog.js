import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { catalogs } from './fixtures.js';

const dir = join(import.meta.dirname, '.tmp/typesafe-i18n');
export const outdir = join(dir, 'src/i18n');
export const outUrl = (file) => pathToFileURL(join(outdir, file)).href;

/** Writes the base locale and runs typesafe-i18n's generator on it, as JavaScript. */
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
  // The CLI reads the base locale through the TypeScript JS API, which TypeScript 7 dropped.
  const { storeTranslationToDisk } = await import('typesafe-i18n/importer');
  const { info } = console;
  const cwd = process.cwd();
  // It reads its config from the working directory, and its logs would land in size.js's tables.
  process.chdir(dir);
  console.info = () => {};
  try {
    await storeTranslationToDisk({ locale: 'en', translations: catalogs.typesafe }, true);
  } finally {
    process.chdir(cwd);
    console.info = info;
  }
  // Its scratch copy would shadow the real package for the generated files.
  rmSync(join(dir, 'node_modules'), { recursive: true, force: true });
}
