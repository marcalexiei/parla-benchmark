import { createParla } from '@parlajs/core';

import { loadCatalog } from '../parla-catalog.js';

const { catalog, app } = await loadCatalog();

export const create = async () => {
  const translations = await createParla({ catalog }).load([app]);
  return translations.app;
};
export const formatter = async () => {
  const translations = await create();
  return (key, params) => translations[key](params);
};
