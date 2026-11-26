import { outUrl } from '../typesafe-catalog.js';

const { loadLocaleAsync } = await import(outUrl('i18n-util.async.js'));
const { i18nObject } = await import(outUrl('i18n-util.js'));

// LL answers every key with a function, `then` included, so returning it bare from async never settles.
export const create = async () => {
  await loadLocaleAsync('en');
  return { LL: i18nObject('en') };
};
export const formatter = async () => {
  const { LL } = await create();
  return (key, params) => LL[key](params);
};
