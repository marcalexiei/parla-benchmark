// tsc time and memory on 200 typed calls per library.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { setup } from './compile.js';
import { catalogs } from './fixtures.js';
import { hasNamespaceObjects } from './parla-catalog.js';
import { named } from './versions.js';

await setup();

const here = import.meta.dirname;
const root = join(here, '.tmp/types');
const tsc = join(here, 'node_modules/.bin/tsc');
const runs = 5;

const keys = Object.keys(catalogs.icu);
const args = (key) =>
  key.startsWith('greet') ? "{ name: 'Ada' }" : key.startsWith('count') ? '{ count: 3 }' : '';
const calls = (call) => `export const out: string[] = [\n${keys.map((k) => `  ${call(k, args(k))},`).join('\n')}\n];\n`;
const object = (catalog, suffix = '') =>
  `export default ${JSON.stringify(catalog, null, 2)}${suffix};\n`;

// Each library typed its documented way.
const projects = {
  'baseline (200 string literals)': { 'usage.ts': calls((k) => `'${k}'`) },
  parla: {
    'usage.ts': `import { createParla } from '@parlajs/core';
import { catalog } from '../../parla/src/parla/catalog.js';
${hasNamespaceObjects() ? "import { app } from '../../parla/src/parla/namespaces/app.js';\n" : ''}
const { app: t } = await createParla({ catalog }).load([${hasNamespaceObjects() ? 'app' : "'app'"}]);
${calls((k, a) => `t.${k}(${a})`)}`,
  },
  i18next: {
    // `as const` lets i18next infer params.
    'resources.ts': object(catalogs.i18next, ' as const'),
    'usage.ts': `import i18next from 'i18next';
import type resources from './resources.js';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof resources };
  }
}
${calls((k, a) => `i18next.t('${k}'${a && `, ${a}`})`)}`,
  },
  'react-intl': {
    'messages.ts': object(catalogs.icu),
    'usage.ts': `import { createIntl } from 'react-intl';
import messages from './messages.js';

declare global {
  namespace FormatjsIntl {
    interface Message {
      ids: keyof typeof messages;
    }
  }
}
const intl = createIntl({ locale: 'en', messages });
${calls((k, a) => `intl.formatMessage({ id: '${k}' }${a && `, ${a}`})`)}`,
  },
  lingui: {
    'messages.ts': object(catalogs.icu),
    'usage.ts': `import { setupI18n } from '@lingui/core';
import type messages from './messages.js';

declare module '@lingui/core' {
  interface Register {
    messageIds: keyof typeof messages;
  }
}
const i18n = setupI18n();
${calls((k, a) => `i18n._('${k}'${a && `, ${a}`})`)}`,
  },
  paraglide: {
    'usage.ts': `import { m } from '../../paraglide/out/messages.js';
${calls((k, a) => `m.${k}(${a})`)}`,
  },
  'typesafe-i18n': {
    'usage.ts': `import { i18nObject } from '../../typesafe-i18n/src/i18n/i18n-util.js';

const LL = i18nObject('en');
${calls((k, a) => `LL.${k}(${a})`)}`,
  },
};

const tsconfig = {
  compilerOptions: {
    strict: true,
    noEmit: true,
    target: 'es2022',
    module: 'esnext',
    moduleResolution: 'bundler',
    lib: ['es2022', 'dom'],
    types: [],
    skipLibCheck: true,
    // typesafe-i18n's util is JS with JSDoc.
    allowJs: true,
  },
  files: ['usage.ts'],
};

const median = (xs) => xs.toSorted((a, b) => a - b)[Math.floor(xs.length / 2)];
const diagnostics = (dir) => {
  // Throws on a type error.
  const out = execFileSync(tsc, ['-p', dir, '--extendedDiagnostics'], { encoding: 'utf8' });
  const field = (name) => Number.parseFloat(out.match(new RegExp(`${name}:\\s+([\\d.]+)`))[1]);
  return {
    check: field('Check time') * 1000,
    total: field('Total time') * 1000,
    memory: field('Memory used') / 1024,
    types: field('Types'),
    instantiations: field('Instantiations'),
  };
};

rmSync(root, { recursive: true, force: true });
const version = execFileSync(tsc, ['--version'], { encoding: 'utf8' }).trim().replace('Version', 'TypeScript');
console.log(`\n## Type-check (${version}, median of ${runs} runs)\n`);
console.log('| | check | total | memory | types | instantiations |\n|---|---:|---:|---:|---:|---:|');
for (const [name, files] of Object.entries(projects)) {
  const dir = join(root, name.split(' ')[0]);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify(tsconfig));
  for (const [file, contents] of Object.entries(files)) writeFileSync(join(dir, file), contents);
  const samples = Array.from({ length: runs }, () => diagnostics(dir));
  const m = (key) => median(samples.map((s) => s[key]));
  console.log(
    `| ${name.startsWith('baseline') ? name : named(name)} | ${m('check').toFixed(0)} ms | ${m('total').toFixed(0)} ms | ${m('memory').toFixed(0)} MB | ${m('types')} | ${m('instantiations')} |`,
  );
}
