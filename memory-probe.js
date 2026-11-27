// Heap after loading one library, then after formatting everything.
import { catalogs } from './fixtures.js';

const heap = () => {
  globalThis.gc();
  globalThis.gc();
  return process.memoryUsage().heapUsed;
};

const before = heap();
const { formatter } = await import(`./libraries/${process.argv[2]}.js`);
const format = await formatter();
const loaded = heap() - before;
for (const key of Object.keys(catalogs.icu)) {
  for (const count of [1, 3]) {
    format(key, { name: 'Ada', count });
  }
}
const formatted = heap() - before;
console.log(JSON.stringify({ loaded, formatted }));
