// Formatting throughput: Parla vs i18next. Run after `size` (it builds the Parla chunk): pnpm perf
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createParla } from '@parlajs/core';
import i18next from 'i18next';
import ICU from 'i18next-icu';
import { Bench } from 'tinybench';

import { catalogs } from './fixtures.mjs';

const here = import.meta.dirname;
const { catalog } = await import(pathToFileURL(join(here, '.tmp/size/src/parla/catalog.js')).href);

const makeParla = async () => {
  const parla = createParla({ catalog });
  return parla.load('app');
};
const makeI18next = () => {
  const i = i18next.createInstance();
  i.init({
    lng: 'en',
    initAsync: false,
    resources: { en: { translation: catalogs.i18next } },
    interpolation: { escapeValue: false },
  });
  return i;
};
const makeIcu = () => {
  const i = i18next.createInstance().use(ICU);
  i.init({
    lng: 'en',
    initAsync: false,
    resources: { en: { translation: catalogs.icu } },
    interpolation: { escapeValue: false },
  });
  return i;
};

const t = await makeParla();
const n = makeI18next();
const icu = makeIcu();

// Same output check before timing.
console.log('sample output:', [
  t.count7({ count: 3 }),
  n.t('count7', { count: 3 }),
  icu.t('count7', { count: 3 }),
]);

const suites = {
  'plain string': {
    parla: () => t.plain42(),
    i18next: () => n.t('plain42'),
    'i18next-icu': () => icu.t('plain42'),
  },
  interpolation: {
    parla: () => t.greet7({ name: 'Ada' }),
    i18next: () => n.t('greet7', { name: 'Ada' }),
    'i18next-icu': () => icu.t('greet7', { name: 'Ada' }),
  },
  plural: {
    parla: () => t.count7({ count: 3 }),
    i18next: () => n.t('count7', { count: 3 }),
    'i18next-icu': () => icu.t('count7', { count: 3 }),
  },
  'cold start (create + load + 1 message)': {
    parla: async () => (await makeParla()).plain1(),
    i18next: () => makeI18next().t('plain1'),
    'i18next-icu': () => makeIcu().t('plain1'),
  },
};

console.log(`\nNode ${process.version}\n`);
console.log('| | parla | i18next | i18next-icu |\n|---|---:|---:|---:|');
for (const [name, tasks] of Object.entries(suites)) {
  const bench = new Bench({ time: 400, warmup: true });
  for (const [label, fn] of Object.entries(tasks)) bench.add(label, fn);
  await bench.run();
  const hz = Object.fromEntries(
    bench.tasks.map((task) => [task.name, task.result.throughput.mean]),
  );
  const fmt = (x) =>
    x >= 1e6 ? `${(x / 1e6).toFixed(1)}M` : x >= 1e3 ? `${(x / 1e3).toFixed(0)}k` : x.toFixed(0);
  const rel = (x) => {
    const r = hz.parla / x;
    return r >= 1 ? ` (parla ${r.toFixed(1)}× faster)` : ` (parla ${(1 / r).toFixed(1)}× slower)`;
  };
  console.log(
    `| ${name} | ${fmt(hz.parla)}/s | ${fmt(hz.i18next)}/s${rel(hz.i18next)} | ${fmt(hz['i18next-icu'])}/s${rel(hz['i18next-icu'])} |`,
  );
}
