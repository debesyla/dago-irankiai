# Testiniai žmonės

Fiktyvių lietuviškų žmonių duomenys formoms, maketams ir programų testams.
Statinis puslapis su bendrais DAGO stiliais; generuoja tik naršyklėje,
be papildomų priklausomybių. JSON kopijavimas ir atsisiuntimas.

## Generatorius

```js
import { generatePeople, generatePerson } from './src/generator.v1.mjs';
const people = generatePeople({ count: 10, seed: 'testas', referenceDate: '2026-01-01' });
const person = generatePerson();
```

`count`: sveikasis 1–1000; `seed`: 1–200 simbolių eilutė, numatyta atsitiktinė
UUID; `referenceDate`: galiojanti YYYY-MM-DD data nuo 1900, numatyta UTC šiandien.
Pakartojamiems testams nurodykite ir seed, ir referenceDate. ID nėra asmens kodas,
kriptografinis identifikatorius ar garantuotai unikalus raktas.

Versija 1: `schemaVersion`, `isTestData`, `referenceDate`, `id`, `firstName`,
`lastName`, `fullName`, `gender`, `birthDate`, `age`, `email`, `phone`,
`address` (`street`, `city`, `postalCode`, `country`, `countryCode`),
`occupation`, `company`. Amžius 18–80, tiksliai apskaičiuotas referenceDate dienai.
Vardai nesusieti su realiais žmonėmis. El. paštas example.com;
telefonas +370 000 XXXXX, adresas testinėje gatvėje, pašto kodas LT-00000.
Šie vietaženkliai netinka realių kontaktų ar adresų validavimui.

## HTTP ir LLM

Build sukuria `person.v1.json` (objektas) ir `people.v1.json` (100 objektų masyvas).
Tai pastovūs pavyzdžiai: seed `dago-testiniai-zmones-v1`, referenceDate `2026-01-01`.
Užklausos parametrai nekeičia rezultatų. Dinaminio API nėra.
`llms.txt` aprašo adresus, schemą, generatorių ir apribojimus.
JSON, generatorius ir instrukcijos viešai pasiekiami su CORS per Apache `.htaccess`.

```sh
npm test -w tools/testiniai-zmones
npm run build -w tools/testiniai-zmones
```

Pakeitus v1 algoritmą ar schemą nesuderinamu būdu, kurkite v2 modulį bei rinkinius.
GPL-2.0-or-later, kaip visas repozitoriumas.
