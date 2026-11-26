import * as lingui from './lingui-catalog.js';
import * as paraglide from './paraglide-catalog.js';
import * as parla from './parla-catalog.js';
import * as typesafe from './typesafe-catalog.js';

/** Runs every library's compile step; vitest's `globalSetup`, and the first step of each script. */
export async function setup() {
  await Promise.all([parla.setup(), lingui.setup(), paraglide.setup()]);
  // Alone: it changes the working directory while it runs.
  await typesafe.setup();
}
