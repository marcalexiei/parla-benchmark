// Same 200 messages in each library's syntax.
const words = [
  'account',
  'billing',
  'cart',
  'dashboard',
  'export',
  'filters',
  'invoice',
  'profile',
  'report',
  'settings',
];

const i18next = {};
const icu = {};
const paraglide = {};
const typesafe = {};
for (let i = 0; i < 120; i += 1) {
  const text = `Open the ${words[i % 10]} page to review item ${i}`;
  for (const catalog of [i18next, icu, paraglide, typesafe]) {
    catalog[`plain${i}`] = text;
  }
}
for (let i = 0; i < 50; i += 1) {
  const word = words[i % 10];
  i18next[`greet${i}`] = `Hello {{name}}, your ${word} is ready`;
  for (const catalog of [icu, paraglide, typesafe]) {
    catalog[`greet${i}`] = `Hello {name}, your ${word} is ready`;
  }
}
for (let i = 0; i < 30; i += 1) {
  const word = words[i % 10];
  i18next[`count${i}_one`] = `{{count}} ${word} item`;
  i18next[`count${i}_other`] = `{{count}} ${word} items`;
  icu[`count${i}`] = `{count, plural, one {# ${word} item} other {# ${word} items}}`;
  // inlang format: plurals are variants of a selector.
  paraglide[`count${i}`] = [
    {
      declarations: ['input count', 'local countPlural = count: plural'],
      selectors: ['countPlural'],
      match: {
        'countPlural=one': `{count} ${word} item`,
        'countPlural=*': `{count} ${word} items`,
      },
    },
  ];
  typesafe[`count${i}`] = `{count} ${word} {{item|items}}`;
}

// Lingui and react-intl use `icu`.
export const catalogs = { i18next, icu, paraglide, typesafe };
