import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
    appendColumn,
    detectDelimiter,
    nextColumnName,
    parseCsv,
    serializeCsv,
} from '../src/csv.mjs';
import { toVocative } from '../src/vocative.mjs';

test('detects common CSV delimiters outside quoted fields', () => {
    assert.equal(detectDelimiter('EMAIL,FIRSTNAME\na@example.lt,Jonas'), ',');
    assert.equal(detectDelimiter('EMAIL;FIRSTNAME\na@example.lt;Jonas'), ';');
    assert.equal(detectDelimiter('EMAIL\tFIRSTNAME\na@example.lt\tJonas'), '\t');
    assert.equal(detectDelimiter('EMAIL;NOTE;FIRSTNAME\nmail;"a,b,c";Jonas'), ';');
});

test('parses a UTF-8 BOM, escaped quotes, embedded delimiters, and line breaks', () => {
    const parsed = parseCsv('\uFEFFEMAIL,FIRSTNAME,NOTE\r\na@example.lt,Jonas,"Labas, ""Jonai"""\r\nb@example.lt,Eglė,"dvi\neilutės"\r\n');

    assert.deepEqual(parsed.headers, ['EMAIL', 'FIRSTNAME', 'NOTE']);
    assert.deepEqual(parsed.rows, [
        ['a@example.lt', 'Jonas', 'Labas, "Jonai"'],
        ['b@example.lt', 'Eglė', 'dvi\neilutės'],
    ]);
    assert.equal(parsed.delimiter, ',');
});

test('preserves blank and uneven data rows without inventing a final row', () => {
    const parsed = parseCsv('A;B\n1;2\n\n3\n');

    assert.deepEqual(parsed.rows, [['1', '2'], [''], ['3']]);
});

test('rejects empty input and unclosed quoted fields', () => {
    assert.throws(() => parseCsv(''), /tuščias/u);
    assert.throws(() => parseCsv('A,B\n1,"du'), /neuždarytos/u);
});

test('adds a unique KREIPINYS column while preserving every original cell', () => {
    const source = {
        headers: ['EMAIL', 'FIRSTNAME', 'KREIPINYS'],
        rows: [
            ['a@example.lt', 'Jonas', 'senas'],
            ['b@example.lt', 'Eglė', ''],
        ],
    };
    const output = appendColumn(source, ['Jonai', 'Egle']);

    assert.equal(output.columnName, 'KREIPINYS_2');
    assert.deepEqual(output.headers, ['EMAIL', 'FIRSTNAME', 'KREIPINYS', 'KREIPINYS_2']);
    assert.deepEqual(output.rows, [
        ['a@example.lt', 'Jonas', 'senas', 'Jonai'],
        ['b@example.lt', 'Eglė', '', 'Egle'],
    ]);
    assert.equal(nextColumnName(['kreipinys', 'KREIPINYS_2']), 'KREIPINYS_3');
});

test('serializes RFC-style CSV with UTF-8 BOM and round-trips its contents', () => {
    const document = {
        headers: ['EMAIL', 'FIRSTNAME', 'KREIPINYS'],
        rows: [
            ['a@example.lt', 'Jonas', 'Jonai'],
            ['b@example.lt', 'Eglė', 'Egle, mieloji'],
            ['c@example.lt', 'Vėjas', '„Vėjau"\n!'],
        ],
        delimiter: ',',
    };
    const serialized = serializeCsv(document);

    assert.equal(serialized.charCodeAt(0), 0xFEFF);
    const parsed = parseCsv(serialized);
    assert.deepEqual(parsed.headers, document.headers);
    assert.deepEqual(parsed.rows, document.rows);
});

test('converts the sample contact file without losing original rows or columns', async () => {
    const source = await readFile(new URL('./fixtures/contacts.csv', import.meta.url), 'utf8');
    const parsed = parseCsv(source);
    const values = parsed.rows.map((row) => toVocative(row[1]).value);
    const output = appendColumn(parsed, values);
    const roundTrip = parseCsv(serializeCsv({ ...output, delimiter: parsed.delimiter }));

    assert.deepEqual(roundTrip.headers, ['EMAIL', 'FIRSTNAME', 'NOTE', 'KREIPINYS']);
    assert.deepEqual(roundTrip.rows, [
        ['jonas@example.lt', 'Jonas', 'Klientas, aktyvus', 'Jonai'],
        ['egle@example.lt', 'Eglė', 'Naujienlaiškis', 'Egle'],
        ['john@example.lt', 'John', 'Patikrinti', 'John'],
        ['empty@example.lt', '', 'Tuščias vardas', ''],
    ]);
});
