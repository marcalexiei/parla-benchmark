// Runs every bench, archives the README's results under results/, writes the new ones.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';

import { devDependencies, parlaVersion } from './versions.js';

const run = async (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(args[0], args.slice(1), { stdio: ['inherit', 'pipe', 'inherit'] });
    let out = '';
    child.stdout.on('data', (chunk) => {
      out += chunk;
      process.stdout.write(chunk);
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve(out);
      } else {
        reject(new Error(`${args.join(' ')}: exit ${code}`));
      }
    });
  });

const node = async (script) => run([process.execPath, script]);
const tables = [await node('size.js'), await node('types.js'), await node('memory.js')];
await run([
  'node_modules/.bin/vitest',
  'bench',
  '--run',
  '--reporter=json',
  '--outputFile.json=.tmp/bench.json',
]);
tables.push(await node('summary.js'));

const now = new Date().toISOString();
const id = `${now.slice(0, 10)}_${parlaVersion()}`;
const block = `<!-- results ${id} -->

${now.slice(0, 10)} ${now.slice(11, 16)} UTC, ${cpus()[0].model}, ${process.platform}-${process.arch}. Ratios are against Parla.

Versions: ${devDependencies().join(', ')}.

${tables.map((table) => table.trim().replaceAll(/^## /gm, '### ')).join('\n\n')}

<!-- /results -->`;

const readme = readFileSync('README.md', 'utf8');
const old = /<!-- results (?<id>\S+) -->\n(?<body>[\s\S]*?)\n<!-- \/results -->/.exec(readme);
if (!old) {
  throw new Error('README has no <!-- results --> block');
}
const archive = `results/${old.groups.id}.md`;
// The same Parla on the same day: the new run replaces the old one.
const archived = old.groups.id !== id;
if (archived) {
  mkdirSync('results', { recursive: true });
  // wx: never overwrite an archived run.
  writeFileSync(
    archive,
    `# Results ${old.groups.id}\n${old.groups.body.replaceAll(/^### /gm, '## ')}\n`,
    {
      flag: 'wx',
    },
  );
}
writeFileSync('README.md', readme.replace(old[0], block));
// The tables come out unpadded; `format:check` wants them aligned.
await run(['node_modules/.bin/oxfmt', 'README.md', ...(archived ? [archive] : [])]);
console.log(`\n${archived ? `Archived ${archive}; ` : ''}README has ${id}.`);
