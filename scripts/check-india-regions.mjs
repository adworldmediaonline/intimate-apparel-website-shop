// Checks that the hardcoded state list in src/lib/india-regions.ts and the
// generated public/data/in-cities.json still agree. They are two files that
// have to be regenerated together, so drift between them is the realistic
// failure: a state in the dropdown with no cities behind it gives the customer
// an empty list and no obvious way out.
//
//   node scripts/check-india-regions.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/lib/india-regions.ts', import.meta.url), 'utf8');
const states = [...source.matchAll(/^ {2}'([^']+)',$/gm)].map(m => m[1]);
const cities = JSON.parse(
  readFileSync(new URL('../public/data/in-cities.json', import.meta.url), 'utf8')
);

assert.equal(states.length, 36, `expected 36 states, parsed ${states.length}`);

for (const state of states) {
  assert.ok(cities[state], `no city list for "${state}"`);
  assert.ok(cities[state].length > 0, `empty city list for "${state}"`);
}

const orphans = Object.keys(cities).filter(name => !states.includes(name));
assert.deepEqual(orphans, [], `city list has states the dropdown will not offer`);

// The address the Shadowfax booking was tested against has to be reachable
// through the dropdowns, not only by typing it in.
assert.ok(cities['Delhi'].includes('New Delhi'), 'Delhi is missing New Delhi');

console.log(
  `ok: ${states.length} states, ${Object.values(cities).flat().length} cities, no drift`
);
