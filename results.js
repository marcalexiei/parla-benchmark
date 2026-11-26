// Runs every bench, archives the README's results under results/, writes the new ones.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';

import { devDependencies } from './versions.js';

const run = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(args[0], args.slice(1), { stdio: ['inherit', 'pipe', 'inherit'] });
    let out = '';
    child.stdout.on('data', (chunk) => {
      out += chunk;
      process.stdout.write(chunk);
    });
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${args.join(' ')}: exit ${code}`))));
  });

const node = (script) => run([process.execPath, script]);
const tables = [await node('size.js'), await node('types.js'), await node('memory.js')];
await run(['node_modules/.bin/vitest', 'bench', '--run', '--reporter=json', '--outputFile.json=.tmp/bench.json']);
tables.push(await node('summary.js'));

const now = new Date().toISOString();
const id = `${now.slice(0, 10)}_${now.slice(11, 16).replace(':', '')}`;
const block = `<!-- results ${id} -->

${now.slice(0, 10)} ${now.slice(11, 16)} UTC, ${cpus()[0].model}, ${process.platform}-${process.arch}. Ratios are against Parla.

Versions: ${devDependencies().join(', ')}.

${tables.map((t) => t.trim().replaceAll(/^## /gm, '### ')).join('\n\n')}

<!-- /results -->`;

const readme = readFileSync('README.md', 'utf8');
const old = readme.match(/<!-- results (\S+) -->\n([\s\S]*?)\n<!-- \/results -->/);
if (!old) throw new Error('README has no <!-- results --> block');
mkdirSync('results', { recursive: true });
// wx: never overwrite an archived run.
writeFileSync(`results/${old[1]}.md`, `# Results ${old[1]}\n${old[2].replaceAll(/^### /gm, '## ')}\n`, { flag: 'wx' });
writeFileSync('README.md', readme.replace(old[0], block));
console.log(`\nArchived results/${old[1]}.md; README has ${id}.`);
