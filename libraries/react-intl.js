import { createIntl } from 'react-intl';

import { catalogs } from '../fixtures.js';

// A copy, as if parsed from the fetched JSON, so memory.js charges it to this library.
const messages = structuredClone(catalogs.icu);

export const create = () => createIntl({ locale: 'en', messages });
export const formatter = async () => {
  const intl = create();
  return (key, params) => intl.formatMessage({ id: key }, params);
};
