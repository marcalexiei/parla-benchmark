import { test } from 'vitest';

import { createI18next, createI18nextIcu, createParlaT } from './libraries.js';

const t = await createParlaT();
const n = createI18next();
const icu = createI18nextIcu();

test('plain string', async ({ bench }) => {
  await bench.compare(
    bench('parla', () => t.plain42()),
    bench('i18next', () => n.t('plain42')),
    bench('i18next-icu', () => icu.t('plain42')),
  );
});

test('interpolation', async ({ bench }) => {
  await bench.compare(
    bench('parla', () => t.greet7({ name: 'Ada' })),
    bench('i18next', () => n.t('greet7', { name: 'Ada' })),
    bench('i18next-icu', () => icu.t('greet7', { name: 'Ada' })),
  );
});

test('plural', async ({ bench }) => {
  await bench.compare(
    bench('parla', () => t.count7({ count: 3 })),
    bench('i18next', () => n.t('count7', { count: 3 })),
    bench('i18next-icu', () => icu.t('count7', { count: 3 })),
  );
});

test('cold start (create + load + 1 message)', async ({ bench }) => {
  await bench.compare(
    bench('parla', async () => (await createParlaT()).plain1()),
    bench('i18next', () => createI18next().t('plain1')),
    bench('i18next-icu', () => createI18nextIcu().t('plain1')),
  );
});
