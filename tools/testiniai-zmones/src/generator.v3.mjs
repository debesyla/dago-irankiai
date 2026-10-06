import { generatePerson as generateBasePerson } from './generator.v2.mjs';

export const SCHEMA_VERSION = 3;
// Approximate city coordinates from GeoNames, not geocoded house locations.
// https://www.geonames.org/LT/largest-cities-in-lithuania.html (2026-10-06)
const cityCoordinates = {
  Vilnius: [54.689, 25.280], Kaunas: [54.902, 23.909],
  'Šiauliai': [55.933, 23.317], 'Panevėžys': [55.732, 24.360], Utena: [55.498, 25.605],
};

export function generatePerson(options = {}) {
  const person = generateBasePerson(options);
  const token = person.email.split('@')[0].slice(5);
  let state = parseInt(token.slice(0, 8), 16);
  const integer = (min, max) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return min + Math.floor(state / 4294967296 * (max - min + 1));
  };
  const pick = (items) => items[integer(0, items.length - 1)];
  const usernameBase = `${person.firstName}.${person.lastName}`
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const adultDate = new Date(person.birthDate + 'T00:00:00Z');
  adultDate.setUTCFullYear(adultDate.getUTCFullYear() + 18);
  const today = new Date(person.referenceDate + 'T00:00:00Z');
  const days = Math.floor((today - adultDate) / 86400000);
  const registered = new Date(adultDate.getTime() + (parseInt(token.slice(0, 8), 16) % (days + 1)) * 86400000);
  const username = `${usernameBase.slice(0, 23)}.${token.slice(0, 6)}`;
  const uuid = `${token.slice(0, 8)}-${token.slice(8, 12)}-4${token.slice(13, 16)}-${(8 + (parseInt(token[16], 16) % 4)).toString(16)}${token.slice(17, 20)}-${token.slice(20)}`;
  const [latitude, longitude] = cityCoordinates[person.address.city];
  const year = Number(person.referenceDate.slice(0, 4));
  const vehicles = [{ make: 'Toyota', model: 'Corolla' }, { make: 'Volkswagen', model: 'Golf' }, { make: 'Škoda', model: 'Octavia' }, { make: 'Volvo', model: 'V60' }, { make: 'Honda', model: 'Civic' }];
  return {
    ...person,
    schemaVersion: SCHEMA_VERSION,
    username,
    // Test credentials only: deterministic and deliberately reproducible.
    password: `Tt9!${token.slice(0, 16)}`,
    registeredAt: registered.toISOString().slice(0, 10),
    uuid,
    nationality: 'Lietuvos',
    website: `https://${username.replaceAll('.', '-')}.example.com`,
    userAgent: pick([
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:132.0) Gecko/20100101 Firefox/132.0',
    ]),
    mothersMaidenName: pick(['Kazlauskaitė', 'Petrauskaitė', 'Jankauskaitė', 'Vaitkutė', 'Žukauskaitė', 'Balčiūnaitė', 'Navickaitė', 'Šimkutė']),
    heightCm: person.gender === 'vyras' ? integer(160, 195) : integer(150, 185),
    weightKg: integer(500, 1100) / 10,
    bloodType: pick(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    favoriteColor: pick(['Mėlyna', 'Žalia', 'Geltona', 'Raudona', 'Violetinė', 'Oranžinė', 'Juoda', 'Balta']),
    vehicle: { ...pick(vehicles), year: integer(year - 20, year) },
    location: { coordinates: { latitude, longitude, precision: 'city' }, timezone: 'Europe/Vilnius' },
    // Stripe's documented sandbox card, not a generated live payment card.
    // https://docs.stripe.com/testing
    payment: { provider: 'Stripe', brand: 'Visa', number: '4242424242424242', expiryMonth: String(integer(1, 12)).padStart(2, '0'), expiryYear: year + 3, cvv: String(integer(100, 999)) },
  };
}
