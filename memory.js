// Heap per library, one process each.
import { execFileSync } from 'node:child_process';

import { setup } from './compile.js';
import { libraries } from './libraries.js';
import { named } from './versions.js';

await setup();

const runs = 5;
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;
const median = (xs) => xs.toSorted((a, b) => a - b)[Math.floor(xs.length / 2)];
const probe = (name) =>
  JSON.parse(
    execFileSync(process.execPath, ['--expose-gc', 'memory-probe.js', name], {
      cwd: import.meta.dirname,
      encoding: 'utf8',
    }),
  );

console.log(`\n## Heap (Node ${process.version}, median of ${runs} fresh processes)\n`);
console.log('| | loaded | after formatting all 200 |\n|---|---:|---:|');
for (const name of Object.keys(libraries)) {
  const samples = Array.from({ length: runs }, () => probe(name));
  const loaded = median(samples.map((sample) => sample.loaded));
  const formatted = median(samples.map((sample) => sample.formatted));
  console.log(`| ${named(name)} | ${kb(loaded)} | ${kb(formatted)} |`);
}
