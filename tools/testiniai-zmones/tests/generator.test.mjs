import assert from 'node:assert/strict';
import test from 'node:test';
import { generatePeople, generatePerson } from '../src/generator.v2.mjs';
import { parsePersonalCode } from '../../asmens-kodai/lib/personal-code.ts';
import { ADDRESSES } from '../src/addresses.v1.mjs';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

const options = { count: 1000, seed: 'testas', referenceDate: '2026-10-06' };

test('reproducible fixtures and the single-person API agree', () => {
  const first = generatePeople(options);
  assert.deepEqual(first, generatePeople(options));
  assert.deepEqual(first[0], generatePerson(options));
  assert.notDeepEqual(first, generatePeople({ ...options, seed: 'kitas-testas' }));
  assert.notEqual(generatePerson().personalCode, generatePerson().personalCode);
});

test('all dates, ages, test markers and validator-compatible contacts remain consistent', () => {
  for (const referenceDate of ['2026-10-06', '2024-02-29', '2000-01-01', '1900-12-31']) {
    const people = generatePeople({ ...options, referenceDate });

    for (const p of people) {
      assert.equal(p.schemaVersion, 2);
      assert.equal(p.isTestData, true);
      assert.equal(p.referenceDate, referenceDate);
      assert.equal('id' in p, false);
      const parsedCode = parsePersonalCode(p.personalCode, new Date(referenceDate + 'T12:00:00'));
      assert.equal(parsedCode.valid, true);
      assert.equal(parsedCode.age, p.age);
      assert.equal(parsedCode.sex, p.gender === 'moteris' ? 'female' : 'male');
      assert.equal(parsedCode.birthDate.getFullYear(), Number(p.birthDate.slice(0, 4)));
      assert.equal(parsedCode.birthDate.getMonth() + 1, Number(p.birthDate.slice(5, 7)));
      assert.equal(parsedCode.birthDate.getDate(), Number(p.birthDate.slice(8, 10)));
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
      assert.match(p.phone, /^\+3706\d{7}$/);
      const phone = parsePhoneNumberFromString(p.phone);
      assert.equal(phone.country, 'LT');
      assert.equal(phone.isValid(), true);
      assert.equal(phone.getType(), 'MOBILE');
      const { country, countryCode, ...address } = p.address;
      assert.ok(ADDRESSES.some((entry) => JSON.stringify(entry) === JSON.stringify(address)));
      assert.match(p.address.postalCode, /^LT-\d{5}$/);
      assert.equal(country, 'Lietuva');
      assert.equal(countryCode, 'LT');
      assert.equal(p.address.countryCode, 'LT');
      assert.ok(p.address.city.length);
      assert.ok(p.occupation.length);
      assert.match(p.company, /Testinė įmonė/);
    }

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
  assert.equal(current.personalCode, previous.personalCode);
});

test('invalid options fail clearly instead of silently producing wrong fixtures', () => {
  for (const count of [0, -1, 1001, 1.5, '10', NaN, Infinity]) {
    assert.throws(() => generatePeople({ count }), /count/);
  }
  for (const seed of ['', 1, null, 'x'.repeat(201)]) {
    assert.throws(() => generatePeople({ seed }), /seed/);
  }
  for (const referenceDate of ['2026-02-29', '2026-04-31', '2026-13-01', '1899-01-01', '2119-01-01', 'foo', '2026-1-1', null]) {
    assert.throws(() => generatePerson({ referenceDate }), /referenceDate/);
  }
});
