import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { catalogs } from './fixtures.js';

const dir = join(import.meta.dirname, '.tmp/lingui');
export const compiledPath = join(dir, 'en.js');
export const compiledUrl = pathToFileURL(compiledPath).href;

/** Writes what `lingui compile` writes. */
export async function setup() {
  const { createCompiledCatalog } = await import('@lingui/cli/api');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const { source, errors } = createCompiledCatalog('en', catalogs.icu, {
    namespace: 'es',
    strict: true,
  });
  if (errors.length > 0) {
    throw new Error(`lingui: ${errors.map((error) => error.id).join(', ')}`);
  }
  writeFileSync(compiledPath, source);
}
