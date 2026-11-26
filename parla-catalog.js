import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build } from '@parlajs/compiler';

import { catalogs } from './fixtures.js';

const dir = join(import.meta.dirname, '.tmp/parla');
export const chunkPath = join(dir, 'src/parla/messages/en/app.js');

/** Compiles the ICU fixtures into Parla's catalog and per-locale chunk. */
export function setup() {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'locales/en'), { recursive: true });
  writeFileSync(join(dir, 'locales/en/app.json'), JSON.stringify(catalogs.icu));
  writeFileSync(
    join(dir, 'parla.config.json'),
    JSON.stringify({
      locales: ['en'],
      namespaces: { app: { format: 'icu', path: 'locales/{locale}/app.json' } },
    }),
  );
  build({ cwd: dir });
}

export async function loadCatalog() {
  const mod = await import(pathToFileURL(join(dir, 'src/parla/catalog.js')).href);
  return mod.catalog;
}
