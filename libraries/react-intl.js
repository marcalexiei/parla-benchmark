import { createIntl } from 'react-intl';

import { catalogs } from '../fixtures.js';

// A copy, as if parsed from JSON, so memory.js counts it here.
const messages = structuredClone(catalogs.icu);

export const create = () => createIntl({ locale: 'en', messages });
export const formatter = async () => {
  const intl = create();
  return (key, params) => intl.formatMessage({ id: key }, params);
};
