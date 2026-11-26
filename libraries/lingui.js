import { setupI18n } from '@lingui/core';

import { compiledUrl } from '../lingui-catalog.js';

export const create = async () => {
  const { messages } = await import(compiledUrl);
  const i18n = setupI18n();
  i18n.loadAndActivate({ locale: 'en', messages });
  return i18n;
};
export const formatter = async () => {
  const i18n = await create();
  return (key, params) => i18n._(key, params);
};
