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

test('the page explains name conversion and vocative generation in simple Lithuanian', async () => {
    const projectRoot = fileURLToPath(new URL('..', import.meta.url));
    const page = await readFile(new URL('index.html', `file://${projectRoot}/`), 'utf8');

    assert.match(page, /<h1>\s*vardų linksniavimas\s*<a class="dago-link/u);
    assert.match(page, /pakeisti lietuviškus vardus į šauksmininką/u);
    assert.match(page, /vardų keitimas/u);
    assert.match(page, /kreipinių generavimas/u);
    assert.match(page, /Vardai apdorojami tik jūsų naršyklėje ir niekur nesiunčiami/u);
    assert.match(page, /Tikslumas ir išimtys/u);
    assert.match(page, /Saugus atsarginis kreipinys/u);
});

test('the page leaves the base design language to the shared dago stylesheets', async () => {
    const projectRoot = fileURLToPath(new URL('..', import.meta.url));
    const page = await readFile(new URL('index.html', `file://${projectRoot}/`), 'utf8');
    const localCss = page.match(/<style>([\s\S]*?)<\/style>/u)?.[1] ?? '';

    assert.match(page, /assets\/styles\/reset\.css\?v=20260808/u);
    assert.match(page, /assets\/styles\/dago\.css\?v=20260901/u);
    assert.doesNotMatch(localCss, /^\s*:root\s*\{/mu);
    assert.doesNotMatch(localCss, /^\s*(?:html|body)\s*\{/mu);
    assert.doesNotMatch(localCss, /^\s*h[1-6](?:\s*,|\s*\{)/mu);
    assert.doesNotMatch(localCss, /^\s*a\s*\{/mu);
    assert.doesNotMatch(localCss, /font-family\s*:/u);
    assert.doesNotMatch(localCss, /^\s*(?:button|details|summary)(?:\s*,|\s*\{)/mu);
    assert.doesNotMatch(localCss, /^\s*\.(?:primary-button|text-button|sr-only)\s*\{/mu);
    assert.doesNotMatch(localCss, /:focus-visible|prefers-reduced-motion/u);
    assert.match(page, /class="sr-only"/u);
});

test('the review workflow provides editable rows, counts, copy, reset, and live feedback', async () => {
    const projectRoot = fileURLToPath(new URL('..', import.meta.url));
    const page = await readFile(new URL('index.html', `file://${projectRoot}/`), 'utf8');

    assert.match(page, /<th scope="col">Įvestas vardas<\/th>/u);
    assert.match(page, /<th scope="col">Kreipinys<\/th>/u);
    assert.match(page, /<th scope="col">Būsena<\/th>/u);
    assert.match(page, /resultInput\.type = 'text'/u);
    assert.match(page, /resultInput\.addEventListener\('input'/u);
    assert.match(page, /id="copyVocatives"/u);
    assert.match(page, /id="resetButton"/u);
    assert.match(page, /id="resetResults"/u);
    assert.match(page, /id="resultActionStatus"[^>]+role="status"[^>]+aria-live="polite"/u);
    assert.match(page, /updateResultSummary\(\)/u);
});

test('the page provides CSV upload, column mapping, review filters, and UTF-8 download', async () => {
    const projectRoot = fileURLToPath(new URL('..', import.meta.url));
    const page = await readFile(new URL('index.html', `file://${projectRoot}/`), 'utf8');

    assert.match(page, /id="csvFile"[^>]+accept="\.csv,text\/csv"/u);
    assert.match(page, /id="csvNameColumn"/u);
    assert.match(page, /id="processCsv"/u);
    assert.match(page, /id="resultFilter"/u);
    assert.match(page, /value="review"/u);
    assert.match(page, /value="unchanged"/u);
    assert.match(page, /id="downloadCsv"/u);
    assert.match(page, /appendColumn\(csvDocument/u);
    assert.match(page, /serializeCsv\(\{/u);
    assert.match(page, /bom: true/u);
});

test('the page documents five email-platform mappings in the requested order', async () => {
    const projectRoot = fileURLToPath(new URL('..', import.meta.url));
    const page = await readFile(new URL('index.html', `file://${projectRoot}/`), 'utf8');

    assert.match(page, /MailerLite: KREIPINYS lauko susiejimas/u);
    assert.match(page, /Omnisend: KREIPINYS savybės susiejimas/u);
    assert.match(page, /Mailchimp: KREIPINYS lauko susiejimas/u);
    assert.match(page, /Brevo: KREIPINYS atributo susiejimas/u);
    assert.match(page, /Klaviyo: KREIPINYS profilio savybės susiejimas/u);
    assert.match(page, /\{\$kreipinys\|default\(''\)\}/u);
    assert.match(page, /\[\[contact\.custom_properties\.KREIPINYS \| default: ""\]\]/u);
    assert.match(page, /\*\|KREIP\|\*/u);
    assert.match(page, /\{\{ contact\.KREIPINYS \}\}/u);
    assert.match(page, /\{\{ person\.KREIPINYS \}\}/u);
    assert.ok(page.indexOf('MailerLite:') < page.indexOf('Omnisend:'));
    assert.ok(page.indexOf('Omnisend:') < page.indexOf('Mailchimp:'));
});
