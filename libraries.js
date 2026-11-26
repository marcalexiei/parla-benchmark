import { createParla } from '@parlajs/core';
import { setupI18n } from '@lingui/core';
import i18next from 'i18next';
import ICU from 'i18next-icu';
import { createIntl } from 'react-intl';

import { catalogs } from './fixtures.js';
import { compiledUrl } from './lingui-catalog.js';
import { outUrl as paraglideUrl } from './paraglide-catalog.js';
import { loadCatalog } from './parla-catalog.js';
import { outUrl as typesafeUrl } from './typesafe-catalog.js';

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

export const createReactIntl = () => createIntl({ locale: 'en', messages: catalogs.icu });

export const createLingui = async () => {
  const { messages } = await import(compiledUrl);
  const i18n = setupI18n();
  i18n.loadAndActivate({ locale: 'en', messages });
  return i18n;
};

// Paraglide has no instance: messages are module functions reading the current locale.
const paraglide = await import(paraglideUrl('messages.js'));
const { setLocale } = await import(paraglideUrl('runtime.js'));
export const createParaglide = () => {
  setLocale('en', { reload: false });
  return paraglide.m;
};

const { loadLocaleAsync } = await import(typesafeUrl('i18n-util.async.js'));
const { i18nObject } = await import(typesafeUrl('i18n-util.js'));
// LL answers every key with a function, `then` included, so returning it bare from async never settles.
export const createTypesafe = async () => {
  await loadLocaleAsync('en');
  return { LL: i18nObject('en') };
};
