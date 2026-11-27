// Throughput table from .tmp/bench.json.
import { readFileSync } from 'node:fs';

import { named } from './versions.js';

const report = JSON.parse(readFileSync('.tmp/bench.json', 'utf8'));
const libraries = [
  'parla',
  'i18next',
  'i18next-icu',
  'react-intl',
  'lingui',
  'paraglide',
  'typesafe-i18n',
];

const fmt = (hz) => {
  if (hz >= 1e6) {
    return `${(hz / 1e6).toFixed(1)}M`;
  }
  return hz >= 1e3 ? `${(hz / 1e3).toFixed(0)}k` : hz.toFixed(0);
};
const versus = (parla, other) => {
  const ratio = parla / other;
  return ratio >= 1
    ? `parla ${ratio.toFixed(1)}× faster`
    : `parla ${(1 / ratio).toFixed(1)}× slower`;
};

console.log(`## Throughput (Node ${process.version}, ${process.platform}-${process.arch})\n`);
console.log(
  `| | ${libraries.map((name) => named(name)).join(' | ')} |\n|---|${libraries.map(() => '---:').join('|')}|`,
);
for (const test of report.testResults.flatMap((file) => file.assertionResults)) {
  const hz = Object.fromEntries(
    test.benchmarks
      .flatMap((benchmark) => benchmark.tasks)
      .map((task) => [task.name, task.throughput.mean]),
  );
  const cells = libraries.map((name) =>
    name === 'parla' ? `${fmt(hz.parla)}/s` : `${fmt(hz[name])}/s (${versus(hz.parla, hz[name])})`,
  );
  console.log(`| ${test.title} | ${cells.join(' | ')} |`);
}
