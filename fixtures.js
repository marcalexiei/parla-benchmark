// The same 200 English messages in i18next and ICU syntax: 120 plain, 50 interpolated, 30 plural.
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
for (let i = 0; i < 120; i++) {
  const text = `Open the ${words[i % 10]} page to review item ${i}`;
  i18next[`plain${i}`] = text;
  icu[`plain${i}`] = text;
}
for (let i = 0; i < 50; i++) {
  i18next[`greet${i}`] = `Hello {{name}}, your ${words[i % 10]} is ready`;
  icu[`greet${i}`] = `Hello {name}, your ${words[i % 10]} is ready`;
}
for (let i = 0; i < 30; i++) {
  i18next[`count${i}_one`] = `{{count}} ${words[i % 10]} item`;
  i18next[`count${i}_other`] = `{{count}} ${words[i % 10]} items`;
  icu[`count${i}`] =
    `{count, plural, one {# ${words[i % 10]} item} other {# ${words[i % 10]} items}}`;
}

export const catalogs = { i18next, icu };
