const SUPPORTED_DELIMITERS = Object.freeze([',', ';', '\t']);

function countDelimiters(firstRecord) {
    const counts = new Map(SUPPORTED_DELIMITERS.map((delimiter) => [delimiter, 0]));
    let quoted = false;

    for (let index = 0; index < firstRecord.length; index += 1) {
        const character = firstRecord[index];

        if (character === '"') {
            if (quoted && firstRecord[index + 1] === '"') {
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (!quoted && counts.has(character)) {
            counts.set(character, counts.get(character) + 1);
        }
    }

    return counts;
}

export function detectDelimiter(text) {
    const source = String(text ?? '').replace(/^\uFEFF/u, '');
    let quoted = false;
    let end = source.length;

    for (let index = 0; index < source.length; index += 1) {
        const character = source[index];

        if (character === '"') {
            if (quoted && source[index + 1] === '"') {
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (!quoted && (character === '\r' || character === '\n')) {
            end = index;
            break;
        }
    }

    const counts = countDelimiters(source.slice(0, end));
    return SUPPORTED_DELIMITERS.reduce((best, delimiter) => (
        counts.get(delimiter) > counts.get(best) ? delimiter : best
    ), ',');
}

export function parseCsv(text, delimiter = detectDelimiter(text)) {
    const source = String(text ?? '').replace(/^\uFEFF/u, '');

    if (!SUPPORTED_DELIMITERS.includes(delimiter)) {
        throw new Error('Nepalaikomas CSV skirtukas.');
    }
    if (!source) {
        throw new Error('CSV failas yra tuščias.');
    }

    const records = [];
    let record = [];
    let field = '';
    let quoted = false;
    let fieldStarted = false;

    function finishField() {
        record.push(field);
        field = '';
        fieldStarted = false;
    }

    function finishRecord() {
        finishField();
        records.push(record);
        record = [];
    }

    for (let index = 0; index < source.length; index += 1) {
        const character = source[index];

        if (quoted) {
            if (character === '"' && source[index + 1] === '"') {
                field += '"';
                index += 1;
            } else if (character === '"') {
                quoted = false;
            } else {
                field += character;
            }
            continue;
        }

        if (character === '"' && !fieldStarted) {
            quoted = true;
            fieldStarted = true;
        } else if (character === delimiter) {
            finishField();
        } else if (character === '\r' || character === '\n') {
            finishRecord();
            if (character === '\r' && source[index + 1] === '\n') {
                index += 1;
            }
        } else {
            field += character;
            fieldStarted = true;
        }
    }

    if (quoted) {
        throw new Error('CSV faile neuždarytos kabutės.');
    }

    const endsWithRecordSeparator = /(?:\r\n|\r|\n)$/u.test(source);
    if (!endsWithRecordSeparator || record.length > 0 || field !== '') {
        finishRecord();
    }

    if (records.length === 0 || records[0].every((value) => value === '')) {
        throw new Error('CSV faile nerasta antraščių eilutė.');
    }

    return Object.freeze({
        headers: Object.freeze([...records[0]]),
        rows: Object.freeze(records.slice(1).map((row) => Object.freeze([...row]))),
        delimiter,
    });
}

function escapeField(value, delimiter) {
    const field = String(value ?? '');
    return field.includes(delimiter) || /["\r\n]/u.test(field)
        ? `"${field.replace(/"/gu, '""')}"`
        : field;
}

export function serializeCsv({ headers, rows, delimiter = ',', bom = true }) {
    if (!SUPPORTED_DELIMITERS.includes(delimiter)) {
        throw new Error('Nepalaikomas CSV skirtukas.');
    }

    const records = [headers, ...rows];
    const csv = records
        .map((record) => record.map((field) => escapeField(field, delimiter)).join(delimiter))
        .join('\r\n');

    return (bom ? '\uFEFF' : '') + csv;
}

export function nextColumnName(headers, requestedName = 'KREIPINYS') {
    const names = new Set(headers.map((header) => String(header).toLocaleUpperCase('lt-LT')));
    let candidate = requestedName;
    let suffix = 2;

    while (names.has(candidate.toLocaleUpperCase('lt-LT'))) {
        candidate = `${requestedName}_${suffix}`;
        suffix += 1;
    }

    return candidate;
}

export function appendColumn({ headers, rows }, values, requestedName = 'KREIPINYS') {
    if (rows.length !== values.length) {
        throw new Error('Naujo stulpelio reikšmių skaičius nesutampa su CSV eilučių skaičiumi.');
    }

    const columnName = nextColumnName(headers, requestedName);
    return Object.freeze({
        columnName,
        headers: Object.freeze([...headers, columnName]),
        rows: Object.freeze(rows.map((row, index) => Object.freeze([...row, values[index]]))),
    });
}
