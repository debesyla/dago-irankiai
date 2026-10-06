import assert from 'node:assert/strict';
import test from 'node:test';
import { generatePerson, avatarForPerson } from '../src/generator.v3.mjs';
import { generatePerson as generateV2 } from '../src/generator.v2.mjs';

const options = { seed: 'extended-person', referenceDate: '2026-10-06' };
test('v3 adds repeatable account and profile fields while preserving the v2 identity', () => {
  const p = generatePerson(options);
  assert.deepEqual(p, generatePerson(options));
  assert.equal(p.schemaVersion, 3);
  const previous = generateV2(options);
  for (const [key, value] of Object.entries(previous)) {
    if (key !== 'schemaVersion') assert.deepEqual(p[key], value);
  }
  assert.match(p.username, /^[a-z]+\.[a-z]+\.[a-f0-9]{6}$/);
  assert.ok(p.password.length >= 16);
  for (const pattern of [/[A-Z]/, /[a-z]/, /\d/, /[^a-zA-Z0-9]/]) assert.match(p.password, pattern);
  assert.match(p.uuid, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.equal(p.avatar, null);
  assert.equal(p.nationality, 'Lietuvos');
  assert.ok(new URL(p.website).hostname.endsWith('.example.com'));
  assert.ok(p.userAgent.startsWith('Mozilla/5.0'));
  assert.equal(p.location.coordinates.precision, 'city');
  assert.equal(p.location.timezone, 'Europe/Vilnius');
  assert.equal(p.payment.number, '4242424242424242');
  assert.equal(p.payment.provider, 'Stripe');
  assert.ok(p.payment.expiryYear > Number(p.referenceDate.slice(0, 4)));
  assert.match(p.payment.cvv, /^\d{3}$/);
  const adultDate = new Date(p.birthDate + 'T00:00:00Z');
  adultDate.setUTCFullYear(adultDate.getUTCFullYear() + 18);
  const registered = new Date(p.registeredAt + 'T00:00:00Z');
  assert.ok(registered >= adultDate && registered <= new Date(p.referenceDate + 'T00:00:00Z'));
});

test('optional local SVG avatar does not change other person fields', () => {
  const plain = generatePerson(options);
  const illustrated = generatePerson({ ...options, includeAvatar: true });
  assert.deepEqual({ ...illustrated, avatar: null }, plain);
  assert.equal(illustrated.avatar, avatarForPerson(plain));
  assert.match(illustrated.avatar, /^data:image\/svg\+xml;charset=utf-8,/);
  const svg = decodeURIComponent(illustrated.avatar.split(',')[1]);
  assert.ok(svg.includes(plain.firstName[0] + plain.lastName[0]));
  assert.doesNotMatch(svg, /<script|(?:href|src)=/);
  assert.throws(() => generatePerson({ includeAvatar: 'true' }), /includeAvatar/);
});

test('physical properties, registration dates and location stay within their stated ranges', () => {
  for (let i = 0; i < 200; i++) {
    const p = generatePerson({ ...options, seed: `extended-${i}` });
    assert.ok(p.heightCm >= 150 && p.heightCm <= 195);
    assert.ok(p.weightKg >= 50 && p.weightKg <= 110);
    assert.ok(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(p.bloodType));
    assert.ok(p.mothersMaidenName.length && p.favoriteColor.length);
    assert.ok(p.vehicle.year >= 2006 && p.vehicle.year <= 2026);
    assert.ok(p.location.coordinates.latitude >= 54 && p.location.coordinates.latitude <= 56);
    assert.ok(p.location.coordinates.longitude >= 23 && p.location.coordinates.longitude <= 26);
    assert.ok(p.registeredAt <= p.referenceDate);
    assert.ok(Number(p.payment.expiryMonth) >= 1 && Number(p.payment.expiryMonth) <= 12);
  }
});
