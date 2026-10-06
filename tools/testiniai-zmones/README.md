# Testiniai žmonės

Fiktyvūs lietuviški žmonių duomenys formoms, maketams ir programų testams.
Puslapis su bendrais DAGO stiliais; generuoja naršyklėje, JSON kopijavimas
ir atsisiuntimas. Naršyklės generatoriui priklausomybių nereikia.

## Generatorius v3 (vienas žmogus)

```js
import { generatePerson } from './src/generator.v3.mjs';
const person = generatePerson({ seed: 'testas', referenceDate: '2026-01-01' });
```

`seed`: 1–200 simbolių eilutė, numatyta atsitiktinė
UUID; `referenceDate`: galiojanti YYYY-MM-DD data 1900–2118, numatyta UTC šiandien.
Pakartojamiems testams nurodykite seed ir referenceDate. Datos ribos užtikrina,
kad sugeneruotų suaugusiųjų gimimo metai patektų į asmens kodo palaikomą 1800–2099 intervalą.

Schema 3: `schemaVersion`, `isTestData`, `referenceDate`, `personalCode`,
`firstName`, `lastName`, `fullName`, `gender`, `birthDate`, `age`, `email`,
`phone`, `address` (`street`, `city`, `postalCode`, `country`, `countryCode`),
`occupation`, `company`. Testinio `id` nebėra. Amžius 18–80 metų;
referenceDate – tik JSON metaduomenys, žmogaus kortelėje nerodomi.

Papildomi v3 laukai: `username`, `password`, `registeredAt` (YYYY-MM-DD,
nuo 18-o gimtadienio iki referenceDate), `uuid` (v4 formato), `nationality`,
`website` (example.com subdomenas), `userAgent` (pavyzdinis naršyklės identifikatorius),
`mothersMaidenName`, `heightCm`, `weightKg`, `bloodType`, `favoriteColor`,
`vehicle` (make, model, year), `location` (coordinates su latitude, longitude,
precision: city, timezone: Europe/Vilnius), `payment` (provider, brand, number,
expiryMonth, expiryYear, cvv).
Slaptažodis yra pakartojamas testinis pavyzdys, ne tikros paskyros slaptažodis.

Paspaudus bet kurią rodomą reikšmę kopijuojamas jos tekstas, o skaitiniams
laukams – skaičius be rodymo vieneto (pvz., amžius be „m.“). Taip pat veikia
klaviatūros Enter / Space. Patvirtinimas rodomas prie reikšmės ir gyvoje
būsenos srityje. Atmetus iškarpinės prieigą rodomas aiškus pranešimas.

Papildomos skiltys išskleidžiamos, pagrindinė kortelė lieka paprasta.
Nėra kelių žmonių generavimo valdymo ar CSV eksporto.

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

Build sukuria naują `person.v3.json` (vienas objektas).
Tai pastovūs pavyzdžiai: seed `dago-testiniai-zmones-v3`, referenceDate `2026-01-01`.
Užklausos parametrai nekeičia rezultatų. Dinaminio API nėra.
`llms.txt` aprašo adresus, schemą, generatorių ir apribojimus.
Viešas `src/generator.v3.mjs` build metu surenkamas į vieną savarankišką modulį,
įtraukiant bendrą asmens kodų logiką ir patikrintą adresų sąrašą. Šį build failą
galima atsisiųsti ir importuoti be kitų failų, taip pat importuoti URL naršyklėje.
JSON, v1/v2/v3 generatoriai ir instrukcijos viešai pasiekiami su CORS per Apache.

Ankstesni v1/v2 moduliai ir JSON pavyzdžiai išsaugoti nekeičiant. Puslapis ir
instrukcijos naudoja v3 ir rodo tik vieną žmogų. V3 paveldi tą pačią v2
žmogaus tapatybę pagal seed, papildomus duomenis parenka atskirai.

```sh
npm test -w tools/testiniai-zmones
npm run build -w tools/testiniai-zmones
```

Pakeitus versijuotą algoritmą ar schemą nesuderinamu būdu, kurkite kitą versiją.
GPL-2.0-or-later, kaip visas repozitoriumas.


## Papildomų duomenų šaltiniai

- Miestų koordinatės: [GeoNames](https://www.geonames.org/LT/largest-cities-in-lithuania.html),
  patikrinta 2026-10-06, suapvalinta iki 3 skaitmenų. Tai miesto, ne namo koordinatės.
- Mokėjimui: [Stripe testavimo dokumentacija](https://docs.stripe.com/testing),
  Visa `4242424242424242`, būsima data ir 3 skaitmenų CVV. Tik Stripe testavimo režimui.
- Likę papildomi duomenys yra išgalvoti pavyzdžiai, nesusieti su tikrais žmonėmis.
