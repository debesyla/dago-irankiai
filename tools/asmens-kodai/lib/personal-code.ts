export const PENSION_AGE = 65;

export type Sex = "male" | "female";

export interface GeneratorOptions {
  adultOnly?: boolean;
  notOlderThan?: number | null;
  exactBirthDate?: string | null;
  count?: number;
}

export interface PersonalCodeDetails {
  valid: true;
  code: string;
  birthDate: Date;
  sex: Sex;
  age: number;
}

export interface InvalidPersonalCode {
  valid: false;
  code: string;
  error: string;
}

export type PersonalCodeResult = PersonalCodeDetails | InvalidPersonalCode;

const firstPass = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1] as const;
const secondPass = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3] as const;
const dayInMilliseconds = 86_400_000;

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + amount);
}

function addYears(value: Date, amount: number) {
  const result = new Date(value.getFullYear() + amount, value.getMonth(), value.getDate());

  if (result.getMonth() !== value.getMonth()) {
    return new Date(value.getFullYear() + amount, value.getMonth() + 1, 0);
  }

  return result;
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
    ? date
    : null;
}

function randomDateBetween(start: Date, end: Date, random: () => number) {
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()) / dayInMilliseconds;
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) / dayInMilliseconds;
  const day = startDay + Math.floor(random() * (endDay - startDay + 1));
  const utcDate = new Date(day * dayInMilliseconds);

  return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
}

function ageOnDate(birthDate: Date, today: Date) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed = today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!birthdayHasPassed) age -= 1;
  return age;
}

export function formatIsoDate(value: Date) {
  return [
    String(value.getFullYear()).padStart(4, "0"),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

export function calculateChecksum(firstTenDigits: string) {
  if (!/^\d{10}$/.test(firstTenDigits)) {
    throw new Error("Kontroliniam skaitmeniui reikia 10 skaitmenų.");
  }

  const digits = firstTenDigits.split("").map(Number);
  let remainder = digits.reduce((sum, digit, index) => sum + digit * firstPass[index], 0) % 11;

  if (remainder === 10) {
    remainder = digits.reduce((sum, digit, index) => sum + digit * secondPass[index], 0) % 11;
  }

  return remainder === 10 ? 0 : remainder;
}

export function createPersonalCode(birthDate: Date, sex: Sex, sequence: number) {
  const year = birthDate.getFullYear();
  const centuryStart = Math.floor(year / 100) * 100;
  const centuryDigit = centuryStart === 1800 ? 1 : centuryStart === 1900 ? 3 : centuryStart === 2000 ? 5 : null;

  if (centuryDigit === null) throw new Error("Galimos gimimo datos nuo 1800 iki 2099 metų.");
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999) {
    throw new Error("Eilės numeris turi būti nuo 001 iki 999.");
  }

  const firstDigit = centuryDigit + (sex === "female" ? 1 : 0);
  const datePart = [
    String(year).slice(-2),
    String(birthDate.getMonth() + 1).padStart(2, "0"),
    String(birthDate.getDate()).padStart(2, "0"),
  ].join("");
  const firstTen = `${firstDigit}${datePart}${String(sequence).padStart(3, "0")}`;

  return `${firstTen}${calculateChecksum(firstTen)}`;
}

export function parsePersonalCode(rawCode: string, referenceDate = new Date()): PersonalCodeResult {
  const code = rawCode.replace(/[\s-]/g, "");
  if (!/^\d{11}$/.test(code)) {
    return { valid: false, code, error: "Asmens kodą turi sudaryti 11 skaitmenų." };
  }

  const firstDigit = Number(code[0]);
  if (firstDigit < 1 || firstDigit > 6) {
    return { valid: false, code, error: "Pirmasis skaitmuo neatitinka gimimo šimtmečio ir lyties." };
  }

  const century = firstDigit <= 2 ? 1800 : firstDigit <= 4 ? 1900 : 2000;
  const year = century + Number(code.slice(1, 3));
  const month = Number(code.slice(3, 5));
  const day = Number(code.slice(5, 7));
  const birthDate = new Date(year, month - 1, day);

  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month - 1 || birthDate.getDate() !== day) {
    return { valid: false, code, error: "Kode įrašyta neegzistuojanti gimimo data." };
  }

  if (birthDate > startOfDay(referenceDate)) {
    return { valid: false, code, error: "Gimimo data negali būti ateityje." };
  }

  if (code.slice(7, 10) === "000") {
    return { valid: false, code, error: "Eilės numeris negali būti 000." };
  }

  if (calculateChecksum(code.slice(0, 10)) !== Number(code[10])) {
    return { valid: false, code, error: "Nesutampa kontrolinis skaitmuo." };
  }

  return {
    valid: true,
    code,
    birthDate,
    sex: firstDigit % 2 === 1 ? "male" : "female",
    age: ageOnDate(birthDate, startOfDay(referenceDate)),
  };
}

export function generatePersonalCodes(
  options: GeneratorOptions = {},
  referenceDate = new Date(),
  random = Math.random,
) {
  const today = startOfDay(referenceDate);
  const count = Math.min(100, Math.max(1, Math.trunc(options.count ?? 1)));
  let earliest = addYears(today, -120);
  let latest = today;

  if (options.adultOnly) latest = addYears(today, -18);
  if (options.notOlderThan !== null && options.notOlderThan !== undefined) {
    earliest = addDays(addYears(today, -(options.notOlderThan + 1)), 1);
  }

  if (options.exactBirthDate) {
    const exactDate = parseIsoDate(options.exactBirthDate);
    if (!exactDate) throw new Error("Pasirinkite teisingą gimimo datą.");
    if (exactDate < new Date(1800, 0, 1) || exactDate > today) {
      throw new Error("Gimimo data turi būti tarp 1800 metų ir šiandienos.");
    }
    earliest = exactDate;
    latest = exactDate;
  }

  if (earliest > latest) {
    throw new Error("Pasirinkti amžiaus filtrai tarpusavyje nesuderinami.");
  }

  const codes = new Set<string>();
  let attempts = 0;
  while (codes.size < count && attempts < count * 2_500) {
    const birthDate = randomDateBetween(earliest, latest, random);
    const sex: Sex = random() < 0.5 ? "male" : "female";
    const sequence = Math.floor(random() * 999) + 1;
    codes.add(createPersonalCode(birthDate, sex, sequence));
    attempts += 1;
  }

  if (codes.size < count) throw new Error("Nepavyko sugeneruoti pakankamai skirtingų kodų.");
  return [...codes];
}
