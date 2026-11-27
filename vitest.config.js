import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // CI checks parla out into .parla/, whose specs are not ours to run.
    include: ['*.spec.js'],
    benchmark: { include: ['*.bench.js'] },
    globalSetup: ['./compile.js'],
  },
});
