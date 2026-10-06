import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { generatePeople } from '../src/generator.v1.mjs';
import { generatePeople as generatePeopleV2 } from '../src/generator.v2.mjs';

// Verify the actual public fixtures, not just an independent in-memory copy.
execFileSync(process.execPath, ['build.mjs'], { cwd: new URL('../', import.meta.url) });
test('built HTTP fixtures match the documented v1 generator', async () => {
  const load = async (file) => JSON.parse(await readFile(new URL(`../build/${file}`, import.meta.url), 'utf8'));
  const people = await load('people.v1.json');
  assert.deepEqual(people, generatePeople({ count: 100, seed: 'dago-testiniai-zmones-v1', referenceDate: '2026-01-01' }));
  assert.deepEqual(await load('person.v1.json'), people[0]);
  const instructions = await readFile(new URL('../build/llms.txt', import.meta.url), 'utf8');
  assert.match(instructions, /STATIC fixture/);
  assert.match(instructions, /2026-01-01/);
  const deployed = await import('../build/src/generator.v1.mjs');
  assert.deepEqual(deployed.generatePeople({ count: 100, seed: 'dago-testiniai-zmones-v1', referenceDate: '2026-01-01' }), people);
});


test('published v2 is self-contained and matches the shared-code source', async () => {
  const people = JSON.parse(await readFile(new URL('../build/people.v2.json', import.meta.url), 'utf8'));
  const options = { count: 100, seed: 'dago-testiniai-zmones-v2', referenceDate: '2026-01-01' };
  assert.deepEqual(people, generatePeopleV2(options));
  assert.deepEqual(JSON.parse(await readFile(new URL('../build/person.v2.json', import.meta.url), 'utf8')), people[0]);
  const portable = await readFile(new URL('../build/src/generator.v2.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(portable, /^import /m);
  const deployed = await import('../build/src/generator.v2.mjs');
  assert.deepEqual(deployed.generatePeople(options), people);
  const html = await readFile(new URL('../build/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('person.v3.json'));
  const ui = await readFile(new URL('../build/src/ui.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(ui, /Amžius skaičiuotas|Testinis ID/);
  assert.match(ui, /Asmens kodas/);
});


test('published v3 single-person module and JSON include all extra fields', async () => {
  const { generatePerson } = await import('../src/generator.v3.mjs');
  const { generatePerson: deployedPerson } = await import('../build/src/generator.v3.mjs');
  const options = { seed: 'dago-testiniai-zmones-v3', referenceDate: '2026-01-01' };
  const fixture = JSON.parse(await readFile(new URL('../build/person.v3.json', import.meta.url), 'utf8'));
  assert.deepEqual(fixture, generatePerson(options));
  assert.deepEqual(deployedPerson(options), fixture);
  assert.doesNotMatch(await readFile(new URL('../build/src/generator.v3.mjs', import.meta.url), 'utf8'), /^import /m);
});
