import i18next from 'i18next';

import { catalogs } from '../fixtures.js';

// A copy, as if parsed from JSON, so memory.js counts it here.
const resources = structuredClone(catalogs.i18next);

export const init = (instance, translation) => {
  instance.init({
    lng: 'en',
    initAsync: false,
    resources: { en: { translation } },
    interpolation: { escapeValue: false },
  });
  return instance;
};

export const create = () => init(i18next.createInstance(), resources);
export const formatter = async () => {
  const n = create();
  return (key, params) => n.t(key, params);
};
