import i18next from 'i18next';
import ICU from 'i18next-icu';

import { catalogs } from '../fixtures.js';
import { init } from './i18next.js';

// A copy, as if parsed from JSON, so memory.js counts it here.
const resources = structuredClone(catalogs.icu);

export const create = () => init(i18next.createInstance().use(ICU), resources);
export const formatter = async () => {
  const icu = create();
  return (key, params) => icu.t(key, params);
};
