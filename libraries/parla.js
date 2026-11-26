import { createParla } from '@parlajs/core';

import { loadCatalog } from '../parla-catalog.js';

const catalog = await loadCatalog();

export const create = async () => createParla({ catalog }).load('app');
export const formatter = async () => {
  const t = await create();
  return (key, params) => t[key](params);
};
