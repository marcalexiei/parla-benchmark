import { baseConfig } from '@marcalexiei/oxlint-config/base';
import { nodeConfig } from '@marcalexiei/oxlint-config/node';
import { typescriptConfig } from '@marcalexiei/oxlint-config/typescript';
import { vitestConfig } from '@marcalexiei/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig, typescriptConfig, nodeConfig],

  env: { node: true },

  options: {
    reportUnusedDisableDirectives: 'error',
    typeAware: true,
  },

  rules: {
    // Comparator pairs and loop indexes are single letters by convention; `m` is Paraglide's own export.
    'id-length': ['error', { exceptions: ['a', 'b', 'i', 'm'], properties: 'never' }],

    // `path` is already the name of what these functions take, so the module is imported by member.
    'unicorn/import-style': [
      'error',
      { extendDefaultStyles: true, styles: { 'node:path': { named: true } } },
    ],

    // A module exports next to what it defines, so its shape reads top to bottom.
    'import/exports-last': 'off',

    // Every script reports its tables on stdout.
    'no-console': 'off',

    // Plain JS: every parameter is `any`, so each use of one would be flagged.
    'typescript/no-unsafe-argument': 'off',
    'typescript/no-unsafe-assignment': 'off',
    'typescript/no-unsafe-call': 'off',
    'typescript/no-unsafe-member-access': 'off',
    'typescript/no-unsafe-return': 'off',
  },

  overrides: [
    {
      // Each library module and compile step exports the same names, so each is read as one adapter.
      files: ['libraries.js', 'compile.js', 'size.js'],
      rules: { 'import/no-namespace': 'off' },
    },
    {
      files: ['*.{spec,bench}.js'],
      ...vitestConfig,
      // Enabling `jest` alongside `vitest` reports every shared rule twice.
      plugins: ['vitest'],
      rules: {
        ...vitestConfig.rules,
        // The message names the library that formats differently.
        'vitest/valid-expect': ['error', { maxArgs: 2 }],
      },
    },
    {
      // A bench measures; `formatting.spec.js` asserts the output.
      files: ['*.bench.js'],
      plugins: ['vitest'],
      rules: { 'vitest/expect-expect': 'off' },
    },
  ],
});
