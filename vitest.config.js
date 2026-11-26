import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // CI checks parla out into .parla/, whose specs are not ours to run.
    include: ['*.test.js'],
    benchmark: { include: ['*.bench.js'] },
    // The libraries with a compile step.
    globalSetup: [
      './parla-catalog.js',
      './lingui-catalog.js',
      './paraglide-catalog.js',
      './typesafe-catalog.js',
    ],
  },
});
