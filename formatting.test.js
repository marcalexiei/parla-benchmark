import { expect, it } from 'vitest';

import { catalogs } from './fixtures.js';
import {
  createI18next,
  createI18nextIcu,
  createLingui,
  createParaglide,
  createParlaT,
  createReactIntl,
  createTypesafe,
} from './libraries.js';

const t = await createParlaT();
const n = createI18next();
const icu = createI18nextIcu();
const intl = createReactIntl();
const lingui = await createLingui();
const m = createParaglide();
const { LL } = await createTypesafe();

// Timings compare nothing unless every library formats the same text.
it.for(Object.keys(catalogs.icu))('formats %s alike in every library', (key) => {
  for (const params of [{ name: 'Ada', count: 1 }, { name: 'Ada', count: 3 }]) {
    const expected = icu.t(key, params);
    expect(t[key](params)).toBe(expected);
    expect(n.t(key, params)).toBe(expected);
    expect(intl.formatMessage({ id: key }, params)).toBe(expected);
    expect(lingui._(key, params)).toBe(expected);
    expect(m[key](params)).toBe(expected);
    expect(LL[key](params)).toBe(expected);
  }
});
