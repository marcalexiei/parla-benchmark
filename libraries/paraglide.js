import { outUrl } from '../paraglide-catalog.js';

// Paraglide has no instance: messages are module functions reading the current locale.
const { m } = await import(outUrl('messages.js'));
const { setLocale } = await import(outUrl('runtime.js'));

export const create = () => {
  setLocale('en', { reload: false });
  return m;
};
export const formatter = async () => {
  const messages = create();
  return (key, params) => messages[key](params);
};
