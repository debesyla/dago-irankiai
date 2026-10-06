import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

test('single-person UI copies exact field values, handles clipboard denial', async () => {
  const browser = new Window({ settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true, disableJavaScriptEvaluation: true } });
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  browser.document.body.innerHTML = html.match(/<body>([\s\S]*)<\/body>/)[1];
  const originalDocument = globalThis.document;
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  globalThis.document = browser.document;
  let copied;
  let denied = false;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { async writeText(value) { if (denied) throw new Error('denied'); copied = value; } } } });
  try {
    await import('../src/ui.mjs');
    const doc = browser.document;
    doc.getElementById('generate').click();
    const person = JSON.parse(doc.getElementById('person-json').textContent);
    assert.equal(person.schemaVersion, 3);
    const clickCopy = async (label) => {
      doc.querySelector(`[aria-label^="Kopijuoti: ${label}:"]`).click();
      await new Promise((resolve) => setImmediate(resolve));
    };
    await clickCopy('El. paštas');
    assert.equal(copied, person.email); // Full address even when visually wrapped.
    await clickCopy('Amžius');
    assert.equal(copied, String(person.age)); // Numeric value, without display unit.
    await clickCopy('Pašto kodas');
    assert.equal(copied, person.address.postalCode);
    await clickCopy('Slaptažodis');
    assert.equal(copied, person.password);
    assert.match(doc.getElementById('status').textContent, /nukopijuota/);
    denied = true;
    await clickCopy('Vartotojo vardas');
    assert.match(doc.getElementById('status').textContent, /Nepavyko nukopijuoti/);
    doc.execCommand = (command) => {
      assert.equal(command, 'copy');
      copied = doc.querySelector('textarea').value;
      return true;
    };
    await clickCopy('El. paštas');
    assert.equal(copied, person.email);
    assert.match(doc.getElementById('status').textContent, /nukopijuota/);
    assert.equal(doc.querySelector('textarea'), null);
    delete doc.execCommand;
    denied = false;
    doc.getElementById('copy').click();
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(JSON.parse(copied), person);
    doc.getElementById('generate').click();
    assert.notEqual(JSON.parse(doc.getElementById('person-json').textContent).email, person.email);
    assert.equal(doc.querySelectorAll('#person-fields dd').length, 14);
    assert.doesNotMatch(html, /CSV|people\.v3\.json|count: 10/);
  } finally {
    globalThis.document = originalDocument;
    if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
    else delete globalThis.navigator;
    await browser.happyDOM.close();
  }
});
