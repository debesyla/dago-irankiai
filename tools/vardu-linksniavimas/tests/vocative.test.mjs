import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { toVocative, toVocativeMany, VOCATIVE_RULES } from '../src/vocative.mjs';

test('covers every supported ending in precedence order', () => {
    assert.deepEqual(
        VOCATIVE_RULES.map(({ ending }) => ending),
        ['ius', 'ys', 'as', 'is', 'us', 'ė'],
    );

    const cases = new Map([
        ['Saulius', 'Sauliau'],
        ['Dainius', 'Dainiau'],
        ['Stasys', 'Stasy'],
        ['Jonas', 'Jonai'],
        ['Jurgis', 'Jurgi'],
        ['Merkurijus', 'Merkurijau'],
        ['Eglė', 'Egle'],
    ]);

    for (const [input, expected] of cases) {
        assert.equal(toVocative(input).value, expected, input);
    }
});

test('keeps verified names without a changing ending unchanged', () => {
    const result = toVocative('Kristina');

    assert.equal(result.value, 'Kristina');
    assert.equal(result.confidence, 'high');
    assert.equal(result.changed, false);
});

test('normalizes whitespace, ignores blank lines, and keeps input order', () => {
    const results = toVocativeMany('  Jonas  \r\n\n\tEglė\t\n   \nSaulius');

    assert.deepEqual(results.map(({ input }) => input), ['Jonas', 'Eglė', 'Saulius']);
    assert.deepEqual(results.map(({ value }) => value), ['Jonai', 'Egle', 'Sauliau']);
});

test('applies rules independently of letter case', () => {
    assert.equal(toVocative('JONAS').value, 'JONAI');
    assert.equal(toVocative('SAULIUS').value, 'SAULIAU');
    assert.equal(toVocative('stasys').value, 'stasy');
    assert.equal(toVocative('EGLĖ').value, 'EGLE');
});

test('uses versioned exceptions before suffix rules and preserves case', () => {
    const result = toVocative('Vėjas');

    assert.equal(result.value, 'Vėjau');
    assert.equal(result.confidence, 'high');
    assert.equal(result.reason, 'exception');
    assert.match(result.dataVersion, /^\d+\.\d+\.\d+$/u);
    assert.equal(toVocative('VĖJAS').value, 'VĖJAU');
});

test('leaves foreign and uncertain names unchanged for review', () => {
    for (const name of ['John', 'Lucas', 'Thomas', 'Max', 'constructor']) {
        const result = toVocative(name);
        assert.equal(result.value, name, name);
        assert.equal(result.confidence, 'review', name);
        assert.equal(result.changed, false, name);
    }
});

test('leaves compound and hyphenated names unchanged for review', () => {
    for (const [input, normalized] of [
        ['Jonas   Paulius', 'Jonas Paulius'],
        ['Ona-Marija', 'Ona-Marija'],
    ]) {
        const result = toVocative(input);
        assert.equal(result.input, normalized);
        assert.equal(result.value, normalized);
        assert.equal(result.confidence, 'review');
        assert.equal(result.reason, 'compound');
    }
});

test('treats HTML-like input as inert unsupported text', () => {
    const html = '<img src=x onerror=alert(1)>';
    const result = toVocative(html);

    assert.equal(result.value, html);
    assert.equal(result.confidence, 'review');
    assert.equal(result.reason, 'unsupported');
});

test('the browser renderer does not use innerHTML for user-controlled results', async () => {
    const projectRoot = fileURLToPath(new URL('..', import.meta.url));
    const page = await readFile(new URL('index.html', `file://${projectRoot}/`), 'utf8');

    assert.doesNotMatch(page, /\.innerHTML\b/u);
    assert.match(page, /\.textContent\s*=/u);
    assert.match(page, /\.replaceChildren\(/u);
});

test('the page uses concise copy and the approved single-field workflow', async () => {
    const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    assert.match(page, /Paverskite vardus į šauksmininką: Jonas → Jonai, Eglė → Egle/u);
    assert.doesNotMatch(page, /id="results"|id="resultFilter"|id="resetButton"|id="resetResults"|id="formStatus"|Patikrinkite:|Tikslumas ir išimtys|Saugus atsarginis kreipinys/u);
    assert.match(page, /id="names"[^>]+rows="5"/u);
    assert.ok(page.indexOf('<summary>Pavyzdys, kaip rašyti') < page.indexOf('<summary>Įkelti CSV'));
    assert.match(page, /Galiu padėti\. <strong>labas \(sraigė\) dago\.lt<\/strong><\/p>/u);
});

test('the page leaves base typography and components to the shared DAGO styles', async () => {
    const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    const css = page.match(/<style>([\s\S]*?)<\/style>/u)?.[1] ?? '';
    assert.match(page, /assets\/styles\/reset\.css\?v=20260808/u);
    assert.match(page, /assets\/styles\/dago\.css\?v=20260901/u);
    assert.doesNotMatch(css, /^\s*(?::root|html|body|h[1-6]|a|button|details|summary|\.primary-button|\.text-button)\s*\{/mu);
    assert.doesNotMatch(css, /font-family\s*:/u);
    assert.match(css, /#copyVocatives\s*\{\s*opacity: 0\.2;/u);
    assert.match(page, /weblog.dago.lt\/mano-ai-di-politika/u);
});

test('the page retains CSV mapping and UTF-8 export', async () => {
    const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    for (const id of ['csvFile', 'csvNameColumn', 'processCsv', 'downloadCsv']) assert.ok(page.includes(`id="${id}"`));
    assert.match(page, /appendColumn\(csvDocument/u);
    assert.match(page, /bom: true/u);
});

test('the five email-platform guides retain their templates and order', async () => {
    const page = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    const platforms = ['MailerLite', 'Omnisend', 'Mailchimp', 'Brevo', 'Klaviyo'];
    let previous = -1;
    for (const platform of platforms) {
        const position = page.indexOf(`<summary>${platform}</summary>`);
        assert.ok(position > previous); previous = position;
    }
    for (const template of ["{$kreipinys|default('')}", '[[contact.custom_properties.KREIPINYS | default: ""]]', '*|KREIP|*', '{{ contact.KREIPINYS }}', '{{ person.KREIPINYS }}']) assert.ok(page.includes(template));
});
