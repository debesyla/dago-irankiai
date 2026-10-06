// Shared by the asmens-kodai and testiniai-zmones tools.
const firstPass = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
const secondPass = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];

/** @param {string} firstTenDigits */
export function calculateChecksum(firstTenDigits) {
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

/**
 * @param {Date} birthDate
 * @param {"male" | "female"} sex
 * @param {number} sequence
 */
export function createPersonalCode(birthDate, sex, sequence) {
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

