import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createCompiledCatalog } from '@lingui/cli/api';

import { catalogs } from './fixtures.js';

const dir = join(import.meta.dirname, '.tmp/lingui');
export const compiledPath = join(dir, 'en.js');
export const compiledUrl = pathToFileURL(compiledPath).href;

/** Compiles the ICU fixtures into the catalog module `lingui compile` writes. */
export function setup() {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const { source, errors } = createCompiledCatalog('en', catalogs.icu, {
    namespace: 'es',
    strict: true,
  });
  if (errors.length) throw new Error(`lingui: ${errors.map((e) => e.id).join(', ')}`);
  writeFileSync(compiledPath, source);
}
