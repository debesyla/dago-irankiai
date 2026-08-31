import {
    VERIFIED_LITHUANIAN_NAMES,
    VOCATIVE_DATA_VERSION,
    VOCATIVE_EXCEPTIONS,
} from './vocative-data.v1.mjs';

export const VOCATIVE_RULES = Object.freeze([
    Object.freeze({ ending: 'ius', replacement: 'iau' }),
    Object.freeze({ ending: 'ys', replacement: 'y' }),
    Object.freeze({ ending: 'as', replacement: 'ai' }),
    Object.freeze({ ending: 'is', replacement: 'i' }),
    Object.freeze({ ending: 'us', replacement: 'au' }),
    Object.freeze({ ending: 'ė', replacement: 'e' }),
]);

const verifiedNames = new Set(VERIFIED_LITHUANIAN_NAMES);
const supportedLetters = /^[a-ząčęėįšųūž]+$/iu;
const foreignMarkers = /[qwx]/iu;

function normalizeName(input) {
    return String(input ?? '')
        .normalize('NFC')
        .trim()
        .replace(/\s+/gu, ' ');
}

function lowerName(name) {
    return name.toLocaleLowerCase('lt-LT');
}

function applyNameCase(value, source) {
    const lowerSource = lowerName(source);
    const upperSource = source.toLocaleUpperCase('lt-LT');

    if (source === upperSource && source !== lowerSource) {
        return value.toLocaleUpperCase('lt-LT');
    }

    const titleSource = lowerSource.charAt(0).toLocaleUpperCase('lt-LT') + lowerSource.slice(1);
    if (source === titleSource) {
        return value.charAt(0).toLocaleUpperCase('lt-LT') + value.slice(1);
    }

    return value;
}

function result(input, value, confidence, reason, rule = null) {
    return Object.freeze({
        input,
        value,
        confidence,
        changed: input !== value,
        reason,
        rule,
        dataVersion: VOCATIVE_DATA_VERSION,
    });
}

/**
 * Convert one Lithuanian given name to the vocative case without side effects.
 * Rule-only matches are deliberately marked for review until the name is in
 * the versioned verified-name data.
 */
export function toVocative(input) {
    const normalized = normalizeName(input);

    if (!normalized) {
        return result('', '', 'unchanged', 'blank');
    }

    if (/[<>&]/u.test(normalized)) {
        return result(normalized, normalized, 'review', 'unsupported');
    }

    if (/\s|-|–|—/u.test(normalized)) {
        return result(normalized, normalized, 'review', 'compound');
    }

    if (!supportedLetters.test(normalized) || foreignMarkers.test(normalized)) {
        return result(normalized, normalized, 'review', 'unsupported');
    }

    const lower = lowerName(normalized);
    const exception = Object.prototype.hasOwnProperty.call(VOCATIVE_EXCEPTIONS, lower)
        ? VOCATIVE_EXCEPTIONS[lower]
        : null;

    if (exception) {
        const value = exception.value === null
            ? normalized
            : applyNameCase(exception.value, normalized);
        return result(normalized, value, exception.confidence, 'exception');
    }

    const rule = VOCATIVE_RULES.find(({ ending }) => lower.endsWith(ending));
    const isVerified = verifiedNames.has(lower);

    if (!rule) {
        return result(
            normalized,
            normalized,
            isVerified ? 'high' : 'review',
            isVerified ? 'verified' : 'unknown-ending',
        );
    }

    const stem = normalized.slice(0, -rule.ending.length);
    const replacement = normalized === normalized.toLocaleUpperCase('lt-LT')
        ? rule.replacement.toLocaleUpperCase('lt-LT')
        : rule.replacement;
    const value = stem + replacement;

    return result(
        normalized,
        value,
        isVerified ? 'high' : 'review',
        isVerified ? 'verified' : 'rule',
        `${rule.ending}→${rule.replacement}`,
    );
}

/** Convert a newline-delimited string or an iterable of names. Blank rows are omitted. */
export function toVocativeMany(input) {
    let names;

    if (typeof input === 'string') {
        names = input.split(/\r\n?|\n/u);
    } else if (input && typeof input[Symbol.iterator] === 'function') {
        names = Array.from(input);
    } else {
        names = [input];
    }

    return names
        .map(toVocative)
        .filter(({ reason }) => reason !== 'blank');
}
