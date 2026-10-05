import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { generatePeople } from './src/generator.v1.mjs';

const out = new URL('./build/', import.meta.url);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const entry of ['index.html', '.htaccess', 'src/', 'llms.txt']) {
  await cp(new URL(entry, import.meta.url), new URL(entry, out), { recursive: true });
}
const people = generatePeople({ count: 100, seed: 'dago-testiniai-zmones-v1', referenceDate: '2026-01-01' });
await writeFile(new URL('people.v1.json', out), JSON.stringify(people, null, 2) + '\n');
await writeFile(new URL('person.v1.json', out), JSON.stringify(people[0], null, 2) + '\n');
console.log('testiniai-zmones: build/ ready');
