import assert from "node:assert/strict";
import test from "node:test";
import {
  createPersonalCode,
  generatePersonalCodes,
  parsePersonalCode,
} from "../lib/personal-code.ts";

const referenceDate = new Date(2026, 7, 24);

function seededRandom(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test("creates and validates a known personal code", () => {
  const code = createPersonalCode(new Date(1990, 0, 1), "male", 1);
  assert.equal(code, "39001010011");

  const result = parsePersonalCode(code, referenceDate);
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.sex, "male");
    assert.equal(result.age, 36);
  }
});

test("rejects malformed dates, wrong checksums, and future dates", () => {
  assert.equal(parsePersonalCode("39001010012", referenceDate).valid, false);
  const badDate = parsePersonalCode("39902310010", referenceDate);
  assert.equal(badDate.valid, false);
  if (!badDate.valid) assert.match(badDate.error, /data/);

  const futureCode = createPersonalCode(new Date(2030, 0, 1), "female", 10);
  const futureResult = parsePersonalCode(futureCode, referenceDate);
  assert.equal(futureResult.valid, false);
  if (!futureResult.valid) assert.match(futureResult.error, /ateityje/);

  const zeroSequence = parsePersonalCode(createPersonalCode(new Date(1990, 0, 1), "male", 1).slice(0, 7) + "0000", referenceDate);
  assert.equal(zeroSequence.valid, false);
  if (!zeroSequence.valid) assert.match(zeroSequence.error, /000/);
});

test("generates unique batches that obey both age filters", () => {
  const codes = generatePersonalCodes(
    { adultOnly: true, notOlderThan: 65, count: 25 },
    referenceDate,
    seededRandom(),
  );

  assert.equal(codes.length, 25);
  assert.equal(new Set(codes).size, 25);
  for (const code of codes) {
    const result = parsePersonalCode(code, referenceDate);
    assert.equal(result.valid, true);
    if (result.valid) assert.ok(result.age >= 18 && result.age <= 65);
  }
});

test("uses the exact requested birth date in bulk generation", () => {
  const codes = generatePersonalCodes(
    { exactBirthDate: "2000-02-29", count: 10 },
    referenceDate,
    seededRandom(42),
  );

  assert.equal(codes.length, 10);
  for (const code of codes) {
    const result = parsePersonalCode(code, referenceDate);
    assert.equal(result.valid, true);
    if (result.valid) {
      assert.equal(result.birthDate.getFullYear(), 2000);
      assert.equal(result.birthDate.getMonth(), 1);
      assert.equal(result.birthDate.getDate(), 29);
    }
  }
});
