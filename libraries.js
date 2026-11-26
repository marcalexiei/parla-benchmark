// One module per library, for memory.js.
import * as i18nextIcu from './libraries/i18next-icu.js';
import * as i18next from './libraries/i18next.js';
import * as lingui from './libraries/lingui.js';
import * as paraglide from './libraries/paraglide.js';
import * as parla from './libraries/parla.js';
import * as reactIntl from './libraries/react-intl.js';
import * as typesafe from './libraries/typesafe-i18n.js';

export const libraries = {
  parla,
  i18next,
  'i18next-icu': i18nextIcu,
  'react-intl': reactIntl,
  lingui,
  paraglide,
  'typesafe-i18n': typesafe,
};
