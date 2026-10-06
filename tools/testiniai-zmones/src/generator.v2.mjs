import { createPersonalCode } from '../../asmens-kodai/lib/personal-code-core.mjs';
import { ADDRESSES } from './addresses.v1.mjs';

// Portable, dependency-free test data. Never sourced from real people.
export const SCHEMA_VERSION = 2;
const profiles = [
  { gender: 'vyras', names: ['Jonas', 'Mantas', 'Lukas', 'Tomas', 'Darius', 'Paulius', 'Domantas', 'Arnas'], surnames: ['Kazlauskas', 'Petrauskas', 'Jankauskas', 'Vaitkus', 'Žukauskas', 'Balčiūnas', 'Navickas', 'Šimkus'] },
  { gender: 'moteris', names: ['Eglė', 'Ieva', 'Austėja', 'Gabija', 'Rūta', 'Monika', 'Ugnė', 'Viltė'], surnames: ['Kazlauskaitė', 'Petrauskaitė', 'Jankauskaitė', 'Vaitkutė', 'Žukauskaitė', 'Balčiūnaitė', 'Navickaitė', 'Šimkutė'] },
];
const occupations = ['Programuotojas (-a)', 'Dizaineris (-ė)', 'Mokytojas (-a)', 'Inžinierius (-ė)', 'Projektų vadovas (-ė)', 'Studentas (-ė)'];

// A seed is for reproducible fixtures, not for security or guaranteed unique IDs.
function seededRandom(seed) {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.codePointAt(0), 16777619) >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function dateParts(referenceDate) {
  if (typeof referenceDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(referenceDate)) throw new TypeError('referenceDate must be YYYY-MM-DD');
  const date = new Date(referenceDate + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== referenceDate || (date.getUTCFullYear() < 1900 || date.getUTCFullYear() > 2118)) throw new RangeError('referenceDate must be a valid date from 1900 to 2118');
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
}

export function generatePeople({ count = 1, seed = globalThis.crypto.randomUUID(), referenceDate = new Date().toISOString().slice(0, 10) } = {}) {
  if (!Number.isInteger(count) || count < 1 || count > 1000) throw new RangeError('count must be an integer from 1 to 1000');
  if (typeof seed !== 'string' || !seed.length || seed.length > 200) throw new TypeError('seed must be a string of 1–200 characters');
  const [year, month, day] = dateParts(referenceDate);
  const random = seededRandom(seed);
  const integer = (min, max) => min + Math.floor(random() * (max - min + 1));
  const pick = (items) => items[integer(0, items.length - 1)];
  return Array.from({ length: count }, () => {
    const profile = pick(profiles);
    const firstName = pick(profile.names);
    const lastName = pick(profile.surnames);
    const birthYear = year - integer(19, 80);
    const birthMonth = integer(1, 12);
    const birthDay = integer(1, new Date(Date.UTC(birthYear, birthMonth, 0)).getUTCDate());
    const birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
    const age = year - birthYear - Number(month < birthMonth || (month === birthMonth && day < birthDay));
    const token = Array.from({ length: 16 }, () => integer(0, 255).toString(16).padStart(2, '0')).join('');
    return {
      schemaVersion: SCHEMA_VERSION,
      isTestData: true,
      referenceDate,
      personalCode: createPersonalCode(new Date(birthYear, birthMonth - 1, birthDay), profile.gender === 'moteris' ? 'female' : 'male', integer(1, 999)),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      gender: profile.gender,
      birthDate,
      age,
      email: `test.${token}@example.com`,
      phone: `+3706${String(integer(0, 9999999)).padStart(7, '0')}`,
      address: { ...pick(ADDRESSES), country: 'Lietuva', countryCode: 'LT' },
      occupation: pick(occupations),
      company: `UAB „Testinė įmonė ${integer(1, 999)}“`,
    };
  });
}

export function generatePerson(options = {}) {
  return generatePeople({ ...options, count: 1 })[0];
}
