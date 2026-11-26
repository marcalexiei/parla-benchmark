import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { catalogs } from './fixtures.js';

const dir = join(import.meta.dirname, '.tmp/paraglide');
export const outdir = join(dir, 'out');
export const outUrl = (file) => pathToFileURL(join(outdir, file)).href;

export async function setup() {
  const { compile } = await import('@inlang/paraglide-js');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'project.inlang'), { recursive: true });
  mkdirSync(join(dir, 'messages'));
  writeFileSync(join(dir, 'messages/en.json'), JSON.stringify(catalogs.paraglide));
  writeFileSync(
    join(dir, 'project.inlang/settings.json'),
    JSON.stringify({
      baseLocale: 'en',
      locales: ['en'],
      // Local, never a CDN.
      modules: [createRequire(import.meta.url).resolve('@inlang/plugin-message-format')],
      'plugin.inlang.messageFormat': { pathPattern: './messages/{locale}.json' },
    }),
  );
  await compile({
    project: join(dir, 'project.inlang'),
    outdir,
    // The default's cookie is browser-only.
    strategy: ['globalVariable', 'baseLocale'],
    isDevelopment: 'false',
    // For types.js.
    emitTsDeclarations: true,
    emitGitIgnore: false,
    emitPrettierIgnore: false,
    emitReadme: false,
  });
}
