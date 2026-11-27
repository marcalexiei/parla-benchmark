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
const args = (key) => {
  if (key.startsWith('greet')) {
    return "{ name: 'Ada' }";
  }
  return key.startsWith('count') ? '{ count: 3 }' : '';
};
const calls = (call) =>
  `export const out: string[] = [\n${keys.map((key) => `  ${call(key, args(key))},`).join('\n')}\n];\n`;
const object = (catalog, suffix = '') =>
  `export default ${JSON.stringify(catalog, null, 2)}${suffix};\n`;

// Each library typed its documented way.
const projects = {
  'baseline (200 string literals)': { 'usage.ts': calls((key) => `'${key}'`) },
  parla: {
    'usage.ts': `import { createParla } from '@parlajs/core';
import { catalog } from '../../parla/src/parla/catalog.js';
${hasNamespaceObjects() ? "import { app } from '../../parla/src/parla/namespaces/app.js';\n" : ''}
const { app: t } = await createParla({ catalog }).load([${hasNamespaceObjects() ? 'app' : "'app'"}]);
${calls((key, params) => `t.${key}(${params})`)}`,
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
${calls((key, params) => `i18next.t('${key}'${params && `, ${params}`})`)}`,
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
${calls((key, params) => `intl.formatMessage({ id: '${key}' }${params && `, ${params}`})`)}`,
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
${calls((key, params) => `i18n._('${key}'${params && `, ${params}`})`)}`,
  },
  paraglide: {
    'usage.ts': `import { m } from '../../paraglide/out/messages.js';
${calls((key, params) => `m.${key}(${params})`)}`,
  },
  'typesafe-i18n': {
    'usage.ts': `import { i18nObject } from '../../typesafe-i18n/src/i18n/i18n-util.js';

const LL = i18nObject('en');
${calls((key, params) => `LL.${key}(${params})`)}`,
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
  const field = (name) =>
    Number(new RegExp(`${name}:\\s+(?<value>[\\d.]+)`).exec(out).groups.value);
  return {
    check: field('Check time') * 1000,
    total: field('Total time') * 1000,
    memory: field('Memory used') / 1024,
    types: field('Types'),
    instantiations: field('Instantiations'),
  };
};

rmSync(root, { recursive: true, force: true });
const version = execFileSync(tsc, ['--version'], { encoding: 'utf8' })
  .trim()
  .replace('Version', 'TypeScript');
console.log(`\n## Type-check (${version}, median of ${runs} runs)\n`);
console.log(
  '| | check | total | memory | types | instantiations |\n|---|---:|---:|---:|---:|---:|',
);
for (const [name, files] of Object.entries(projects)) {
  const dir = join(root, name.split(' ')[0]);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify(tsconfig));
  for (const [file, contents] of Object.entries(files)) {
    writeFileSync(join(dir, file), contents);
  }
  const samples = Array.from({ length: runs }, () => diagnostics(dir));
  const med = (key) => median(samples.map((sample) => sample[key]));
  console.log(
    `| ${name.startsWith('baseline') ? name : named(name)} | ${med('check').toFixed(0)} ms | ${med('total').toFixed(0)} ms | ${med('memory').toFixed(0)} MB | ${med('types')} | ${med('instantiations')} |`,
  );
}
