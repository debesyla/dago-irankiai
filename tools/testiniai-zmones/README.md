# Testiniai žmonės

Fiktyvūs lietuviški žmonių duomenys formoms, maketams ir programų testams.
Puslapis su bendrais DAGO stiliais; generuoja naršyklėje, JSON kopijavimas
ir atsisiuntimas. Naršyklės generatoriui priklausomybių nereikia.

## Generatorius v2

```js
import { generatePeople, generatePerson } from './src/generator.v2.mjs';
const people = generatePeople({ count: 10, seed: 'testas', referenceDate: '2026-01-01' });
const person = generatePerson();
```

`count`: sveikasis 1–1000; `seed`: 1–200 simbolių eilutė, numatyta atsitiktinė
UUID; `referenceDate`: galiojanti YYYY-MM-DD data 1900–2118, numatyta UTC šiandien.
Pakartojamiems testams nurodykite seed ir referenceDate. Datos ribos užtikrina,
kad sugeneruotų suaugusiųjų gimimo metai patektų į asmens kodo palaikomą 1800–2099 intervalą.

Schema 2: `schemaVersion`, `isTestData`, `referenceDate`, `personalCode`,
`firstName`, `lastName`, `fullName`, `gender`, `birthDate`, `age`, `email`,
`phone`, `address` (`street`, `city`, `postalCode`, `country`, `countryCode`),
`occupation`, `company`. Testinio `id` nebėra. Amžius 18–80 metų;
referenceDate – tik JSON metaduomenys, žmogaus kortelėje nerodomi.

- Asmens kodas atitinka gimimo datą, lytį ir kontrolinį skaitmenį. Naudojamas
  tas pats `tools/asmens-kodai/lib/personal-code-core.mjs`, kurį naudoja asmens
  kodų įrankis. Kodai nekopijuojami iš realių žmonių; sutapimai įmanomi,
  todėl tai nėra tapatybės ar garantuoto unikalumo įrodymas.
- Telefonas E.164 `+3706XXXXXXX`; testuose tikrinamas su `libphonenumber-js/max`
  kaip galiojantis LT mobilusis numeris. Nežadama, kad numeris aktyvus ar
  nepasiskirtas tikram abonentui. Testuose nesiųskite SMS ir neskambinkite.
- Adresas parenkamas kaip visas patikrintas gatvės, namo, miesto ir pašto kodo
  derinys iš 7 viešų įstaigų adresų. Namas nekeičiamas, butai nepridedami.
  [Šaltiniai ir ribos](ADDRESS-SOURCES.md). Tai ne gyva Lietuvos pašto API.
- El. paštas naudoja example.com; įmonė išgalvota.

## HTTP ir LLM

Build sukuria `person.v2.json` (objektas) ir `people.v2.json` (100 objektų masyvas).
Tai pastovūs pavyzdžiai: seed `dago-testiniai-zmones-v2`, referenceDate `2026-01-01`.
Užklausos parametrai nekeičia rezultatų. Dinaminio API nėra.
`llms.txt` aprašo adresus, schemą, generatorių ir apribojimus.
Viešas `src/generator.v2.mjs` build metu surenkamas į vieną savarankišką modulį,
įtraukiant bendrą asmens kodų logiką ir patikrintą adresų sąrašą. Šį build failą
galima atsisiųsti ir importuoti be kitų failų, taip pat importuoti URL naršyklėje.
JSON, v1/v2 generatoriai ir instrukcijos viešai pasiekiami su CORS per Apache.

Ankstesnis v1 modulis ir JSON pavyzdžiai išsaugoti nekeičiant: v1 turi testinį
ID ir vietaženklius adresui / telefonui. Puslapis ir instrukcijos naudoja v2.

```sh
npm test -w tools/testiniai-zmones
npm run build -w tools/testiniai-zmones
```

Pakeitus versijuotą algoritmą ar schemą nesuderinamu būdu, kurkite kitą versiją.
GPL-2.0-or-later, kaip visas repozitoriumas.
