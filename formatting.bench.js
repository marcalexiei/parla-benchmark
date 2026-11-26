import { test } from 'vitest';

import { libraries } from './libraries.js';

const {
  parla: { create: createParlaT },
  i18next: { create: createI18next },
  'i18next-icu': { create: createI18nextIcu },
  'react-intl': { create: createReactIntl },
  lingui: { create: createLingui },
  paraglide: { create: createParaglide },
  'typesafe-i18n': { create: createTypesafe },
} = libraries;

const t = await createParlaT();
const n = createI18next();
const icu = createI18nextIcu();
const intl = createReactIntl();
const lingui = await createLingui();
const m = createParaglide();
const { LL } = await createTypesafe();

test('plain string', async ({ bench }) => {
  await bench.compare(
    bench('parla', () => t.plain42()),
    bench('i18next', () => n.t('plain42')),
    bench('i18next-icu', () => icu.t('plain42')),
    bench('react-intl', () => intl.formatMessage({ id: 'plain42' })),
    bench('lingui', () => lingui._('plain42')),
    bench('paraglide', () => m.plain42()),
    bench('typesafe-i18n', () => LL.plain42()),
  );
});

test('interpolation', async ({ bench }) => {
  const params = { name: 'Ada' };
  await bench.compare(
    bench('parla', () => t.greet7(params)),
    bench('i18next', () => n.t('greet7', params)),
    bench('i18next-icu', () => icu.t('greet7', params)),
    bench('react-intl', () => intl.formatMessage({ id: 'greet7' }, params)),
    bench('lingui', () => lingui._('greet7', params)),
    bench('paraglide', () => m.greet7(params)),
    bench('typesafe-i18n', () => LL.greet7(params)),
  );
});

test('plural', async ({ bench }) => {
  const params = { count: 3 };
  await bench.compare(
    bench('parla', () => t.count7(params)),
    bench('i18next', () => n.t('count7', params)),
    bench('i18next-icu', () => icu.t('count7', params)),
    bench('react-intl', () => intl.formatMessage({ id: 'count7' }, params)),
    bench('lingui', () => lingui._('count7', params)),
    bench('paraglide', () => m.count7(params)),
    bench('typesafe-i18n', () => LL.count7(params)),
  );
});

test('cold start (create + load + 1 message)', async ({ bench }) => {
  await bench.compare(
    bench('parla', async () => (await createParlaT()).plain1()),
    bench('i18next', () => createI18next().t('plain1')),
    bench('i18next-icu', () => createI18nextIcu().t('plain1')),
    bench('react-intl', () => createReactIntl().formatMessage({ id: 'plain1' })),
    bench('lingui', async () => (await createLingui())._('plain1')),
    bench('paraglide', () => createParaglide().plain1()),
    bench('typesafe-i18n', async () => (await createTypesafe()).LL.plain1()),
  );
});
