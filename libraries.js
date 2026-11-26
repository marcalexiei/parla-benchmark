import { createParla } from '@parlajs/core';
import i18next from 'i18next';
import ICU from 'i18next-icu';

import { catalogs } from './fixtures.js';
import { loadCatalog } from './parla-catalog.js';

const catalog = await loadCatalog();

export const createParlaT = async () => createParla({ catalog }).load('app');

const init = (instance, resources) => {
  instance.init({
    lng: 'en',
    initAsync: false,
    resources: { en: { translation: resources } },
    interpolation: { escapeValue: false },
  });
  return instance;
};
export const createI18next = () => init(i18next.createInstance(), catalogs.i18next);
export const createI18nextIcu = () => init(i18next.createInstance().use(ICU), catalogs.icu);
