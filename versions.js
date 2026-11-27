// Installed versions, so every result names what it measured.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const here = import.meta.dirname;
const json = (path) => JSON.parse(readFileSync(join(here, path), 'utf8'));
// Parla packs are all 0.0.0; the commit tells runs apart.
const hash = existsSync(join(here, '.packs/commit'))
  ? readFileSync(join(here, '.packs/commit'), 'utf8').trim()
  : '';
const commit = hash && ` (${hash})`;

export const version = (pkg) =>
  json(`node_modules/${pkg}/package.json`).version + (pkg.startsWith('@parlajs/') ? commit : '');

const packages = {
  parla: '@parlajs/core',
  i18next: 'i18next',
  'i18next-icu': 'i18next-icu',
  'react-intl': 'react-intl',
  lingui: '@lingui/core',
  paraglide: '@inlang/paraglide-js',
  'typesafe-i18n': 'typesafe-i18n',
};

/** Parla's version, or its commit until it is published. */
export const parlaVersion = () => {
  const published = json('node_modules/@parlajs/core/package.json').version;
  return published === '0.0.0' && hash ? hash : published;
};

/** `parla 0.0.0 (fb483a2)` */
export const named = (name) => `${name} ${version(packages[name])}`;

export const devDependencies = () =>
  Object.keys(json('package.json').devDependencies).map((pkg) => `${pkg} ${version(pkg)}`);
