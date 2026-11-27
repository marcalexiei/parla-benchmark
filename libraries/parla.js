import { createParla } from '@parlajs/core';

import { loadCatalog } from '../parla-catalog.js';

const { catalog, app } = await loadCatalog();

export const create = async () => (await createParla({ catalog }).load([app])).app;
export const formatter = async () => {
  const t = await create();
  return (key, params) => t[key](params);
};
