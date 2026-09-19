export const VOCATIVE_DATA_VERSION = '1.0.0';

// Explicit overrides are kept as versioned data rather than hidden in the
// conversion algorithm. Null means that the input must remain unchanged.
export const VOCATIVE_EXCEPTIONS = Object.freeze({
    'vėjas': Object.freeze({ value: 'vėjau', confidence: 'high' }),
    'jėzus': Object.freeze({ value: 'jėzau', confidence: 'high' }),
    'lucas': Object.freeze({ value: null, confidence: 'review' }),
    'thomas': Object.freeze({ value: null, confidence: 'review' }),
    'chris': Object.freeze({ value: null, confidence: 'review' }),
    'james': Object.freeze({ value: null, confidence: 'review' }),
    'jesus': Object.freeze({ value: null, confidence: 'review' }),
});

// This intentionally small list only raises confidence. Names absent from it
// can still be converted by a suffix rule, but their result requires review.
export const VERIFIED_LITHUANIAN_NAMES = Object.freeze([
    'antanas',
    'dainius',
    'danielius',
    'darius',
    'dominykas',
    'eglė',
    'gabija',
    'ieva',
    'jonas',
    'jurgis',
    'karolis',
    'kristina',
    'lukas',
    'meilė',
    'merkurijus',
    'mindaugas',
    'ona',
    'paulius',
    'saulius',
    'stasys',
    'tadas',
]);
