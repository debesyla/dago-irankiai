import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { appendColumn, parseCsv, serializeCsv } from '../src/csv.mjs';
import { toVocative, toVocativeMany } from '../src/vocative.mjs';

const settle = () => new Promise(resolve => setImmediate(resolve));
async function setup() {
    const browser = new Window({ settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true, disableJavaScriptEvaluation: true } });
    const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    const doc = browser.document;
    doc.body.innerHTML = page.match(/<body>([\s\S]*)<\/body>/)[1];
    const state = { copied: null, denied: false, blobs: [], downloads: [] };
    const create = doc.createElement.bind(doc);
    doc.createElement = (tag, ...args) => {
        const el = create(tag, ...args);
        if (tag === 'a') el.click = () => state.downloads.push(el.download);
        return el;
    };
    const clipboard = { async writeText(value) { if (state.denied) throw new Error('denied'); state.copied = value; } };
    const urls = { createObjectURL(blob) { state.blobs.push(blob); return 'blob:http://localhost/test'; }, revokeObjectURL() {} };
    const script = page.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^\s*import[^\n]+;\s*$/gm, '');
    new Function('document', 'navigator', 'window', 'URL', 'Blob', 'appendColumn', 'parseCsv', 'serializeCsv', 'toVocative', 'toVocativeMany', script)(doc, { clipboard }, browser, urls, Blob, appendColumn, parseCsv, serializeCsv, toVocative, toVocativeMany);
    const input = value => { doc.getElementById('names').value = value; doc.getElementById('names').dispatchEvent(new browser.Event('input')); };
    const submit = () => doc.getElementById('namesForm').dispatchEvent(new browser.Event('submit', { cancelable: true }));
    const upload = async text => {
        const file = { name: 'contacts.csv', async text() { return text; } };
        Object.defineProperty(doc.getElementById('csvFile'), 'files', { configurable: true, value: [file] });
        doc.getElementById('csvFile').dispatchEvent(new browser.Event('change'));
        await settle();
    };
    return { browser, doc, state, input, submit, upload };
}

test('conversion edits the original field; copying preserves edits and handles denial', async () => {
    const { browser, doc, state, input, submit } = await setup();
    try {
        const field = doc.getElementById('names');
        input('Jonas\nEglė\nAlex');
        assert.equal(doc.getElementById('copyVocatives').hidden, true);
        submit();
        assert.equal(doc.getElementById('names'), field);
        assert.equal(field.value, 'Jonai\nEgle\nAlex');
        assert.equal(doc.getElementById('actionStatus').hidden, true);
        input('Jonai\nEgle\nAlexai');
        doc.getElementById('copyVocatives').click(); await settle();
        assert.equal(state.copied, 'Jonai\nEgle\nAlexai');
        state.denied = true;
        doc.getElementById('copyVocatives').click(); await settle();
        assert.match(doc.getElementById('actionStatus').textContent, /Nepavyko nukopijuoti/);
        input('');
        assert.equal(doc.getElementById('copyVocatives').hidden, true);
        assert.equal(doc.getElementById('submitButton').disabled, true);
    } finally { await browser.happyDOM.close(); }
});

test('CSV edits preserve original contacts and blank rows; row-count changes block export', async () => {
    const { browser, doc, state, input, upload } = await setup();
    try {
        await upload('EMAIL,FIRSTNAME,KREIPINYS\na@example.lt,Jonas,old\nb@example.lt,Eglė,old\nc@example.lt,,old');
        assert.equal(doc.getElementById('csvNameColumn').value, '1');
        doc.getElementById('processCsv').click();
        assert.equal(doc.getElementById('names').value, 'Jonai\nEgle\n');
        input('Jonai\nEgle');
        assert.equal(doc.getElementById('downloadCsv').disabled, true);
        doc.getElementById('downloadCsv').click();
        assert.equal(state.blobs.length, 0);
        input('Jonai\nEgle!\n');
        doc.getElementById('downloadCsv').click();
        assert.equal(state.downloads[0], 'contacts-su-kreipiniais.csv');
        const exported = await state.blobs[0].text();
        assert.deepEqual([...new Uint8Array(await state.blobs[0].arrayBuffer()).slice(0, 3)], [0xEF, 0xBB, 0xBF]);
        const parsed = parseCsv(exported);
        assert.deepEqual(parsed.headers, ['EMAIL', 'FIRSTNAME', 'KREIPINYS', 'KREIPINYS_2']);
        assert.deepEqual(parsed.rows, [['a@example.lt', 'Jonas', 'old', 'Jonai'], ['b@example.lt', 'Eglė', 'old', 'Egle!'], ['c@example.lt', '', 'old', '']]);
    } finally { await browser.happyDOM.close(); }
});
