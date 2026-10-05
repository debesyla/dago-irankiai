import assert from 'node:assert/strict';
import test from 'node:test';
import { generatePeople, generatePerson } from '../src/generator.v1.mjs';

const options = { count: 1000, seed: 'testas', referenceDate: '2026-10-06' };

test('reproducible fixtures and the single-person API agree', () => {
  const first = generatePeople(options);
  assert.deepEqual(first, generatePeople(options));
  assert.deepEqual(first[0], generatePerson(options));
  assert.notDeepEqual(first, generatePeople({ ...options, seed: 'kitas-testas' }));
  assert.notEqual(generatePerson().id, generatePerson().id);
});

test('all dates, ages, test markers and contact placeholders remain consistent', () => {
  for (const referenceDate of ['2026-10-06', '2024-02-29', '2000-01-01', '1900-12-31']) {
    const people = generatePeople({ ...options, referenceDate });
    const ids = new Set();
    for (const p of people) {
      assert.equal(p.schemaVersion, 1);
      assert.equal(p.isTestData, true);
      assert.equal(p.referenceDate, referenceDate);
      assert.match(p.id, /^TEST-[a-f0-9]{32}$/);
      ids.add(p.id);
      assert.equal(new Date(p.birthDate + 'T00:00:00Z').toISOString().slice(0, 10), p.birthDate);
      const reference = new Date(referenceDate + 'T00:00:00Z');
      const birth = new Date(p.birthDate + 'T00:00:00Z');
      let expectedAge = reference.getUTCFullYear() - birth.getUTCFullYear();
      const anniversary = new Date(birth);
      anniversary.setUTCFullYear(reference.getUTCFullYear());
      if (anniversary > reference) expectedAge--;
      assert.equal(p.age, expectedAge);
      assert.ok(p.age >= 18 && p.age <= 80);
      assert.equal(p.fullName, `${p.firstName} ${p.lastName}`);
      assert.match(p.email, /^test\.[a-f0-9]{32}@example\.com$/);
      assert.match(p.phone, /^\+370 000 \d{5}$/);
      assert.equal(p.address.postalCode, 'LT-00000');
      assert.equal(p.address.countryCode, 'LT');
      assert.ok(p.address.city.length);
      assert.ok(p.occupation.length);
      assert.match(p.company, /Testinė įmonė/);
    }
    assert.equal(ids.size, people.length);
  }
});

test('birthday boundary updates age without changing the seeded identity', () => {
  const p = generatePerson({ seed: 'birthday', referenceDate: '2026-01-01' });
  const birthday = `2026${p.birthDate.slice(4)}`;
  const before = new Date(birthday + 'T00:00:00Z');
  before.setUTCDate(before.getUTCDate() - 1);
  const previous = generatePerson({ seed: 'birthday', referenceDate: before.toISOString().slice(0, 10) });
  const current = generatePerson({ seed: 'birthday', referenceDate: birthday });
  assert.equal(current.age, previous.age + 1);
  assert.equal(current.birthDate, previous.birthDate);
  assert.equal(current.id, previous.id);
});

test('invalid options fail clearly instead of silently producing wrong fixtures', () => {
  for (const count of [0, -1, 1001, 1.5, '10', NaN, Infinity]) {
    assert.throws(() => generatePeople({ count }), /count/);
  }
  for (const seed of ['', 1, null, 'x'.repeat(201)]) {
    assert.throws(() => generatePeople({ seed }), /seed/);
  }
  for (const referenceDate of ['2026-02-29', '2026-04-31', '2026-13-01', '1899-01-01', 'foo', '2026-1-1', null]) {
    assert.throws(() => generatePerson({ referenceDate }), /referenceDate/);
  }
});
