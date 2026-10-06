import assert from 'node:assert/strict';
import test from 'node:test';
import { extractReferences } from '../scripts/lib/html.mjs';

test('documentation imports are not page dependencies; inline script imports are', () => {
  const refs = extractReferences(`<pre><code>import { generatePeople } from './generator.v1.mjs';</code></pre>
    <script type="module">import { actual } from './src/actual.mjs';</script>
    <script type="module" src="./src/ui.mjs"></script>
    <a href="person.v1.json">JSON</a>`);
  assert.deepEqual(refs, ['./src/ui.mjs', 'person.v1.json', './src/actual.mjs']);
});
