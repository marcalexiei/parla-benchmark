// Throughput table from `pnpm perf`'s JSON report, for the README and the CI job summary.
import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('.tmp/bench.json', 'utf8'));
const libraries = ['parla', 'i18next', 'i18next-icu'];

const fmt = (x) =>
  x >= 1e6 ? `${(x / 1e6).toFixed(1)}M` : x >= 1e3 ? `${(x / 1e3).toFixed(0)}k` : x.toFixed(0);
const versus = (parla, other) => {
  const ratio = parla / other;
  return ratio >= 1 ? `parla ${ratio.toFixed(1)}× faster` : `parla ${(1 / ratio).toFixed(1)}× slower`;
};

console.log(`## Throughput (Node ${process.version}, ${process.platform}-${process.arch})\n`);
console.log(`| | ${libraries.join(' | ')} |\n|---|${libraries.map(() => '---:').join('|')}|`);
for (const test of report.testResults.flatMap((file) => file.assertionResults)) {
  const hz = Object.fromEntries(
    test.benchmarks.flatMap((b) => b.tasks).map((task) => [task.name, task.throughput.mean]),
  );
  const cells = libraries.map((name) =>
    name === 'parla' ? `${fmt(hz.parla)}/s` : `${fmt(hz[name])}/s (${versus(hz.parla, hz[name])})`,
  );
  console.log(`| ${test.title} | ${cells.join(' | ')} |`);
}
