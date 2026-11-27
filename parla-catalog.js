import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { catalogs } from './fixtures.js';

const dir = join(import.meta.dirname, '.tmp/parla');
export const chunkPath = join(dir, 'src/parla/messages/en/app.js');
// Parla since namespace objects writes one module per namespace; before, `load` took names.
const appModule = join(dir, 'src/parla/namespaces/app.js');
export const hasNamespaceObjects = () => existsSync(appModule);

export async function setup() {
  const { build } = await import('@parlajs/compiler');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'locales/en'), { recursive: true });
  writeFileSync(join(dir, 'locales/en/app.json'), JSON.stringify(catalogs.icu));
  const config = {
    locales: ['en'],
    namespaces: { app: { format: 'icu', path: 'locales/{locale}/app.json' } },
  };
  writeFileSync(join(dir, 'parla.config.ts'), `export default ${JSON.stringify(config)};\n`);
  await build({ cwd: dir });
}

/** The catalog, and what `load` takes for the `app` namespace. */
export async function loadCatalog() {
  const { catalog } = await import(pathToFileURL(join(dir, 'src/parla/catalog.js')).href);
  const app = hasNamespaceObjects() ? (await import(pathToFileURL(appModule).href)).app : 'app';
  return { catalog, app };
}
