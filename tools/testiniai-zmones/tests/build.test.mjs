import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { generatePeople } from '../src/generator.v1.mjs';

// Verify the actual public fixtures, not just an independent in-memory copy.
execFileSync(process.execPath, ['build.mjs'], { cwd: new URL('../', import.meta.url) });
test('built HTTP fixtures match the documented v1 generator', async () => {
  const load = async (file) => JSON.parse(await readFile(new URL(`../build/${file}`, import.meta.url), 'utf8'));
  const people = await load('people.v1.json');
  assert.deepEqual(people, generatePeople({ count: 100, seed: 'dago-testiniai-zmones-v1', referenceDate: '2026-01-01' }));
  assert.deepEqual(await load('person.v1.json'), people[0]);
  const instructions = await readFile(new URL('../build/llms.txt', import.meta.url), 'utf8');
  assert.match(instructions, /STATIC fixtures/);
  assert.match(instructions, /2026-01-01/);
  const deployed = await import('../build/src/generator.v1.mjs');
  assert.deepEqual(deployed.generatePeople({ count: 100, seed: 'dago-testiniai-zmones-v1', referenceDate: '2026-01-01' }), people);
});
