import * as lingui from './lingui-catalog.js';
import * as paraglide from './paraglide-catalog.js';
import * as parla from './parla-catalog.js';
import * as typesafe from './typesafe-catalog.js';

/** Every compile step; also vitest's globalSetup. */
export async function setup() {
  await Promise.all([parla.setup(), lingui.setup(), paraglide.setup()]);
  // Last: it changes the working directory.
  await typesafe.setup();
}
