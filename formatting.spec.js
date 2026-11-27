import { describe, expect, it } from 'vitest';

import { catalogs } from './fixtures.js';
import { libraries } from './libraries.js';

const formatters = await Promise.all(
  Object.entries(libraries).map(async ([name, lib]) => [name, await lib.formatter()]),
);
const reference = Object.fromEntries(formatters)['i18next-icu'];

// Timings compare nothing unless every library formats the same text.
describe('formatting', () => {
  it.each(Object.keys(catalogs.icu))('formats %s alike in every library', (key) => {
    for (const params of [
      { name: 'Ada', count: 1 },
      { name: 'Ada', count: 3 },
    ]) {
      const expected = reference(key, params);
      for (const [name, format] of formatters) {
        expect(format(key, params), name).toBe(expected);
      }
    }
  });
});
