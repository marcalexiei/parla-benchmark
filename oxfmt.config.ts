import { defineConfig } from '@marcalexiei/oxfmt-config';

export default defineConfig({
  // oxfmt already skips lock files, but the rule is spelled out so it survives that default changing.
  ignorePatterns: ['pnpm-lock.yaml'],
});
