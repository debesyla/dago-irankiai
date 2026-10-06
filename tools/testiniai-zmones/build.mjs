import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { generatePeople } from './src/generator.v1.mjs';
import { generatePeople as generatePeopleV2 } from './src/generator.v2.mjs';

const out = new URL('./build/', import.meta.url);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const entry of ['index.html', '.htaccess', 'src/', 'llms.txt']) {
  await cp(new URL(entry, import.meta.url), new URL(entry, out), { recursive: true });
}
const people = generatePeople({ count: 100, seed: 'dago-testiniai-zmones-v1', referenceDate: '2026-01-01' });
await writeFile(new URL('people.v1.json', out), JSON.stringify(people, null, 2) + '\n');
await writeFile(new URL('person.v1.json', out), JSON.stringify(people[0], null, 2) + '\n');

// Publish v2 as one portable module. Inline the exact shared national-ID core
// and verified address list so the download needs no sibling dependencies.
const core = await readFile(new URL('../asmens-kodai/lib/personal-code-core.mjs', import.meta.url), 'utf8');
const addresses = await readFile(new URL('./src/addresses.v1.mjs', import.meta.url), 'utf8');
const generator = await readFile(new URL('./src/generator.v2.mjs', import.meta.url), 'utf8');
const portable = generator
  .replace("import { createPersonalCode } from '../../asmens-kodai/lib/personal-code-core.mjs';", core.replace(/^export /gm, ''))
  .replace("import { ADDRESSES } from './addresses.v1.mjs';", addresses.replace(/^export /gm, ''));
await writeFile(new URL('src/generator.v2.mjs', out), portable);
const peopleV2 = generatePeopleV2({ count: 100, seed: 'dago-testiniai-zmones-v2', referenceDate: '2026-01-01' });
await writeFile(new URL('people.v2.json', out), JSON.stringify(peopleV2, null, 2) + '\n');
await writeFile(new URL('person.v2.json', out), JSON.stringify(peopleV2[0], null, 2) + '\n');

console.log('testiniai-zmones: build/ ready');
