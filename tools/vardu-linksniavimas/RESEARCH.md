# Vardų šauksmininko įrankio tyrimas

Tyrimo data: 2026-08-31

## Trumpa išvada

Projektą verta pozicionuoti ne kaip bendrą „vardų keitiklį“ ar visų linksnių
linksniuoklę, o kaip vieną aiškią užduotį atliekantį įrankį:

> **Vardų šauksmininkas** — taisyklingi kreipiniai el. laiškams ir
> naujienlaiškiams.

Siūlomas adresas:

`dago.lt/irankiai/vardu-sauksmininkas/`

Svarbiausia prieš viešinant pagerinti ne dizainą, o pasitikėjimą rezultatu:

1. pataisyti aprašymą ir aiškiai įvardyti šauksmininką;
2. sutvarkyti žinomus taisyklių, didžiųjų raidžių ir saugumo trūkumus;
3. rezultatą rodyti kaip patikrinamą lentelę, o ne vieną teksto bloką;
4. pridėti kopijavimą ir CSV importą / eksportą;
5. nežinomų ar galimai nelietuviškų vardų nekeisti ir aiškiai pažymėti;
6. pridėti testų rinkinį, išimčių žodyną ir tikslumo paaiškinimą.

## Ką projektas daro dabar

Projektą sudaro vienas `index.html`. Jis priima po vieną vardą eilutėje ir
pagal penkias galūnes bando sudaryti šauksmininką:

- `-as → -ai`;
- `-ius → -iau`;
- `-ė → -e`;
- `-is → -i`;
- `-us → -au`.

Šis mažas, naršyklėje veikiantis prototipas turi gerą pradinį pranašumą:
vardai niekur nesiunčiami, nereikia paskyros ir nėra serverio išlaidų.

Tačiau dabartinis tekstas klaidingai sako, kad klientai vardą įveda
„neteisingu linksniu“. Registracijos formoje vardas **Jonas** yra visiškai
taisyklingas vardininkas. Problema atsiranda tada, kai naujienlaiškis jį
įterpia į kreipinį, kuriame reikia šauksmininko: **Labas, Jonai!** Lietuvių
kalbos kreipiniu dažniausiai eina šauksmininkas, o rašant jis išskiriamas
kableliu ar šauktuku ([Visuotinė lietuvių enciklopedija](https://www.vle.lt/straipsnis/kreipinys/)).

## Pavadinimo tyrimas

### Rekomendacija

**Vardų šauksmininkas**

Kodėl:

- iš karto pasako, kokią formą įrankis pateikia;
- sutampa su vartotojo problema — taisyklingu kreipiniu;
- nekuria lūkesčio, kad įrankis pateiks visus septynis linksnius;
- tinka ir H1 antraštei, ir aiškiam URL;
- leidžia natūraliai vartoti paieškos frazes „vardo šauksmininkas“,
  „vardas šauksmininku“ ir „taisyklingas kreipinys“.

Rekomenduojamas pateikimas:

- prekės / puslapio vardas: **Vardų šauksmininkas**;
- H1: **Paverskite vardus taisyklingais kreipiniais**;
- paantraštė: **Įklijuokite lietuviškų vardų sąrašą ir gaukite
  šauksmininko formas naujienlaiškiams, kvietimams ar asmeninėms žinutėms.**

### Įvertinti variantai

| Pavadinimas | Aiškumas | Tikslumas | Pastaba |
| --- | ---: | ---: | --- |
| **Vardų šauksmininkas** | 5/5 | 5/5 | Geriausias dabartinei vienai funkcijai |
| **Kreipinys** | 3/5 | 4/5 | Trumpas prekės vardas, bet be paantraštės per abstraktus |
| **Vardų linksniuoklė** | 4/5 | 3/5 | Skamba natūraliai, tačiau žada visus linksnius |
| **Vardų linksniavimo įrankis** | 4/5 | 3/5 | Suprantamas, bet ilgas ir platesnis už funkciją |
| **Vardų keitiklis** | 2/5 | 1/5 | Gali reikšti vardo pakeitimą, perrašymą ar transliteraciją |

Paieškos rezultatų peržiūroje pagal kelias lietuviškas frazes nepasirodė
stiprus tiesioginis nemokamas konkurentas, atliekantis būtent masinį vardų
pavertimą kreipiniais. Tai yra krypties, o ne paieškos apimties įrodymas;
prieš mokamą SEO kampaniją vis tiek reikėtų patikrinti raktažodžių apimtis
su specializuotu SEO įrankiu.

## Siūlomas puslapio tekstas

### Naršyklės ir paieškos sistemų tekstas

**Title**

`Vardų šauksmininkas – kreipiniai el. laiškams`

**Meta description**

`Paverskite lietuviškus vardus taisyklingais kreipiniais. Įklijuokite sąrašą, patikrinkite formas ir nukopijuokite arba atsisiųskite rezultatą.`

### Hero dalis

**Vardų šauksmininkas**

**Paverskite vardus taisyklingais kreipiniais**

Žmogus registracijos formoje įrašo „Jonas“, tačiau laiške kreipiamės
„Jonai“. Įklijuokite vardų sąrašą — įrankis paruoš šauksmininko formas,
kurias galėsite patikrinti, nukopijuoti ar atsisiųsti.

`Jonas → Jonai` · `Eglė → Egle` · `Saulius → Sauliau`

Trumpa privatumo žinutė prie įvesties:

> Vardai apdorojami tik jūsų naršyklėje ir niekur nesiunčiami.

Šią žinutę galima teigti tik tol, kol visas apdorojimas iš tiesų lieka
kliento naršyklėje ir nepridedama vardus registruojanti analitika ar API.

### Įvesties tekstas

- lauko antraštė: **Įklijuokite vardus — po vieną eilutėje**;
- placeholder: `Jonas\nEglė\nSaulius`;
- pagrindinis mygtukas: **Paversti į kreipinius**;
- antrinis veiksmas: **Įkelti CSV**;
- po įvestimi: **0 vardų** arba **23 vardai**.

### Rezultato tekstas

- antraštė: **Paruošti kreipiniai**;
- stulpeliai: **Įvestas vardas**, **Kreipinys**, **Būsena**;
- veiksmai: **Kopijuoti kreipinius**, **Atsisiųsti CSV**, **Taisyti**;
- būsenos: **Patikima taisyklė**, **Patikrinkite**, **Nepakeista**;
- santrauka: **22 pakeisti · 1 reikia patikrinti · 0 klaidų**.

### Paaiškinimo ir pasitikėjimo turinys

Po įrankiu verta pridėti trumpus skyrius:

1. **Kodėl „Jonai“, o ne „Jonas“?** — vienos pastraipos šauksmininko
   paaiškinimas su nuoroda į kalbos šaltinį.
2. **Kaip naudoti?** — įklijuoti, patikrinti, nukopijuoti / atsisiųsti.
3. **Kur pravers?** — naujienlaiškiai, CRM eksportai, kvietimai,
   pažymėjimai, renginių žinutės.
4. **Tikslumas ir išimtys** — užsienietiški, reti ir dvigubi vardai gali būti
   nelinksniuojami arba turėti išimčių; abejotinas formas būtina patikrinti.
5. **Kaip įkelti į el. pašto platformą?** — sukurti lauką `KREIPINYS` arba
   `FIRST_NAME_VOCATIVE` ir į jį importuoti rezultatą.
6. **Kūrėjams** — keli trumpi naudojimo pavyzdžiai ir nuoroda į GitHub.

## Panašūs įrankiai ir ko iš jų mokytis

| Įrankis | Ką siūlo | Pamoka šiam projektui |
| --- | --- | --- |
| [VLKK Vardai](https://vardai.vlkk.lt/) | Autoritetingas LR piliečių vardų sąvadas, norminis vertinimas, kirčiavimas ir dažnumas; svetainėje nurodoma beveik 4 mln. asmenų vardų bazė | Naudoti kaip vardų ir testų rinkinio tyrimo šaltinį tik išsiaiškinus duomenų naudojimo sąlygas; vartotojui rodyti nuorodą patikrinti retą vardą |
| [e.kalba API atvirų duomenų įrašas](https://data.gov.lt/datasets/4804/) | Vieša prieiga prie LKI elektroninių kalbos išteklių | Ištirti, ar yra morfologinio generavimo galimybė ir tinkama licencija; nekurti priklausomybės, kol tai nepatvirtinta |
| [morfologija.lt](https://morfologija.lietuviuzodynas.lt/) | Atskiro žodžio gramatinių formų lentelė | Šiam projektui laimėti paprastesniu masiniu procesu ir aiškiu rinkodaros scenarijumi |
| [Lingea: Linksniavimas, kreipinys laiške](https://www.lingea.lt/technologijos/linksniavimas) | Komercinei komunikacijai skirtos linksniavimo technologijos pristatymas | Problemos aprašyme akcentuoti taisyklingą pasisveikinimą ir reputaciją, bet nežadėti nepatikrinto poveikio pristatomumui |
| [Lithuanian Names Declension Bundle](https://packagist.org/packages/jokubasr/lithuanian-names-declension) | PHP / Symfony biblioteka visiems linksniams; daugiau nei 14 tūkst. diegimų; paprasti Twig filtrai | Rinkoje yra kūrėjų poreikis; verta siūlyti mažą JavaScript funkciją, bet neperimti senų taisyklių aklai |
| [Boldem vardų linksniavimas](https://help.boldem.com/faq/how-do-i-add-a-personalized-salutation-to-a-template/) | Čekų el. pašto platformoje naudojamas tiesioginis šablono filtras `{{ vokativ contact.name }}`, lyties logika ir neutralus fallback | Ilgalaikė geriausia UX yra integracija; dabar pateikti aiškų `KREIPINYS` lauką ir neutralų atsarginį tekstą |
| [microservices.cz kreipinių API](https://www.microservices.cz/docs) | Grąžina vardą, pavardę, mandagų kreipinį, alternatyvas ir `high/medium/low/unknown` pasitikėjimą; turi JavaScript SDK | Rezultate rodyti pasitikėjimą, nekeisti nežinomo vardo tyliai ir numatyti alternatyvias formas |
| [Vema ukrainietiškų vardų API](https://vema.com.ua/) | Visi linksniai, normalizavimas, vardo dalių atpažinimas, patikra, lytis ir API pavyzdžiai | Jei projektas išaugs, atskirti `normalize`, `validate`, `decline` ir `parse`, o ne vienoje funkcijoje spėti viską |
| [shevchenko-js](https://github.com/tooleks/shevchenko-js) | TypeScript / JavaScript biblioteka, naršyklės paketas, HTTP API ir lyties nustatymas | Gera būsimos atvirojo kodo bibliotekos architektūros kryptis: gryna funkcija, tipai, testai ir keli naudojimo būdai |
| [salutr](https://github.com/bzamecnik/salutr) | Atskira biblioteka, CLI ir žiniatinklio programa; autoriai viešai nurodo maždaug 95 % tikslumą | Neslėpti ribotumo ir atskirti kalbos branduolį nuo UI |

## Funkciniai patobulinimai

### P0 — būtina prieš viešinant

1. **Tiksliai įvardyti funkciją.** Visur naudoti „šauksmininkas“ ir
   „kreipinys“, o ne miglotą „atnaujina vardus“.
2. **Pridėti trūkstamą `-ys → -y` taisyklę.** Dabar, pavyzdžiui,
   `Stasys` lieka nepakeistas, nors turi tapti `Stasy`.
3. **Normalizuoti saugiai.** Apkarpyti tarpus, ignoruoti tuščias eilutes,
   taisykles taikyti nepriklausomai nuo raidžių dydžio ir išlaikyti vartotojo
   pasirinktą rašybą, kai tai įmanoma.
4. **Nebenaudoti vartotojo teksto su `innerHTML`.** Rezultatus kurti per
   `textContent` arba DOM elementus, kad įklijuotas HTML nebūtų interpretuotas.
5. **Nekeisti abejotinų vardų tyliai.** Užsienietiškas vardas gali atsitiktinai
   baigtis lietuviška galūne; tokį rezultatą reikia pažymėti patikrai arba
   palikti nepakeistą, jei vardo nėra patikimame žodyne.
6. **Rodyti poras „prieš → po“.** Vartotojas turi matyti ir pataisyti kiekvieną
   rezultatą prieš importuodamas šimtams gavėjų.
7. **Pridėti kopijavimo mygtuką ir aiškų patvirtinimą.** Dabartinį rezultatą
   tenka žymėti ranka.
8. **Sukurti automatinius testus.** Pirmasis rinkinys turi apimti visas
   galūnes, didžiąsias raides, tarpus, tuščias eilutes, HTML simbolius,
   nelinksniuojamus ir dvigubus vardus.

### P1 — didžiausia praktinė vertė

1. **CSV įkėlimas ir atsisiuntimas.** Leisti pasirinkti vardo stulpelį,
   išlaikyti visas pradines eilutes ir pridėti naują `KREIPINYS` stulpelį.
2. **Pasitikėjimo būsena.** `high` — žodyne ir taisyklė patvirtinta;
   `medium` — žinoma galūnės taisyklė; `review` — reta ar dviprasmė forma;
   `unchanged` — sąmoningai nekeista.
3. **Išimčių žodynas.** Pradėti nuo populiariausių vardų ir realių naudotojų
   pataisymų. Išimtis turi būti versijuojamas duomuo, ne išmėtyti `if` sakiniai.
4. **Rankinis taisymas.** Leisti redaguoti atskirą rezultatą ir tik tada
   kopijuoti / eksportuoti.
5. **Neutralus fallback.** Dokumentacijoje siūlyti šabloną, kuris neįterpia
   abejotino vardo, pvz. `Laba diena,`.
6. **Integracijų instrukcijos.** Parodyti Mailchimp, Brevo ir Klaviyo laukų
   pavyzdžius. Visos šios platformos leidžia CSV stulpelį susieti su
   auditorijos / kontakto lauku ar pasirinktine savybe:
   [Mailchimp](https://mailchimp.com/help/format-guidelines-for-your-import-file/),
   [Brevo](https://help.brevo.com/hc/en-us/articles/208729849-Create-a-file-to-import-your-contacts),
   [Klaviyo](https://help.klaviyo.com/hc/en-us/articles/1260806293150).

### P2 — tik patvirtinus poreikį

1. visų linksnių režimas;
2. pavardės ir pilni vardai;
3. paketas npm registre;
4. CLI dideliems failams;
5. HTTP API ir tiesioginės CRM / naujienlaiškių integracijos;
6. viešas taisymų pateikimas su žmogaus peržiūra.

Neverta iš karto statyti serverio ar naudoti generatyvinio AI. Šiam uždaviniui
deterministinės taisyklės, patikrintas vardų žodynas, išimtys ir aiškus
nežinomybės parodymas yra pigesni, greitesni ir lengviau testuojami.

## Siūloma techninė sąsaja

Toliau pateikti pavyzdžiai yra **siūloma būsima sąsaja**, ne dabartinio
prototipo dokumentacija.

### Paprastas JavaScript naudojimas

```js
import { toVocative } from "@dago/lt-vocative";

toVocative("Jonas");
// { input: "Jonas", value: "Jonai", confidence: "high" }
```

### Saugus fallback

```js
const result = toVocative(customer.firstName);

const greeting = result.confidence === "review"
  ? "Laba diena,"
  : `Laba diena, ${result.value},`;
```

### Keli vardai

```js
import { toVocativeMany } from "@dago/lt-vocative";

const results = toVocativeMany(["Jonas", "Eglė", "Stasys", "John"]);
// [
//   { input: "Jonas",  value: "Jonai", confidence: "high" },
//   { input: "Eglė",   value: "Egle",  confidence: "high" },
//   { input: "Stasys", value: "Stasy", confidence: "high" },
//   { input: "John",   value: "John",  confidence: "unchanged" }
// ]
```

### Naršyklėje be build sistemos

```html
<script type="module">
  import { toVocative } from "https://cdn.example.lt/lt-vocative.js";

  console.log(toVocative("Saulius").value); // „Sauliau“
</script>
```

Tikras CDN adresas turi būti dokumentuojamas tik tada, kai failas bus
versijuojamas, testuojamas ir iš tiesų publikuotas.

### Siūlomas CLI

```bash
npx @dago/lt-vocative contacts.csv \
  --column FIRSTNAME \
  --output contacts-with-vocative.csv
```

### Galimas HTTP API vėliau

```http
POST /v1/vocative
Content-Type: application/json

{
  "names": ["Jonas", "Eglė", "John"]
}
```

```json
{
  "results": [
    { "input": "Jonas", "value": "Jonai", "confidence": "high" },
    { "input": "Eglė", "value": "Egle", "confidence": "high" },
    { "input": "John", "value": "John", "confidence": "unchanged" }
  ]
}
```

API verta kurti tik atsiradus realiam automatizavimo poreikiui. Kol kas
statinė naršyklės programa geriau išlaiko privatumo pažadą ir yra beveik
nemokama eksploatuoti.

## Testavimo kryptis

Minimalūs reprezentatyvūs pavyzdžiai:

| Įvestis | Laukiamas rezultatas | Ką tikrina |
| --- | --- | --- |
| Jonas | Jonai | `-as` |
| Saulius | Sauliau | `-ius` |
| Dainius | Dainiau | `-ius` |
| Merkurijus | Merkurijau | `-us` po `j` |
| Jurgis | Jurgi | `-is` |
| Stasys | Stasy | trūkstamas `-ys` |
| Eglė | Egle | `-ė` |
| Kristina | Kristina | `-a` nekinta |
| John | John | nežinomas vardas nekinta |
| `  Jonas  ` | Jonai | tarpai |
| JONAS | JONAI arba Jonai pagal pasirinktą politiką | raidžių dydis |
| `<img src=x onerror=alert(1)>` | rodomas kaip tekstas | HTML saugumas |

Šių pavyzdžių neužtenka lingvistiniam tikslumui. Prieš teigiant konkretų
tikslumo procentą reikia turėti atskirą, žmogaus patikrintą vardų rinkinį,
kuris nebuvo naudotas kuriant taisykles.

## Siūloma darbų seka

### 1 etapas — patikimas viešas įrankis

- naujas vardas, URL ir tekstai;
- saugus, testuojamas linksniavimo branduolys;
- `-ys`, normalizavimas ir išimtys;
- redaguojama rezultatų lentelė;
- kopijavimas, privatumo ir tikslumo paaiškinimai;
- mobilus ir prieinamas dizainas;
- publikavimas `dago.lt/irankiai/` ir nuoroda pagrindiniame puslapyje.

### 2 etapas — realus darbo srautas

- CSV importas / eksportas;
- vardo stulpelio pasirinkimas;
- pasitikėjimo būsenos ir filtras „reikia patikrinti“;
- Mailchimp, Brevo ir Klaviyo instrukcijos;
- anoniminis, vardų nerenkantis naudojimo matavimas, jei jo iš tikrųjų reikia.

### 3 etapas — kūrėjams

- atskira ESM funkcija ir TypeScript tipai;
- versijuojamas išimčių duomenų failas;
- npm paketas ir CLI;
- API tik turint aktyvių integracijos prašymų.

## Sėkmės kriterijai

Pirmai viešai versijai:

- nė vienas vardas neišsiunčiamas iš naršyklės;
- visi automatiniai lingvistiniai ir saugumo testai praeina;
- vartotojas gali pataisyti kiekvieną rezultatą;
- abejotina forma nėra pateikiama kaip užtikrintai teisinga;
- 100 vardų galima įklijuoti, patikrinti ir nukopijuoti per mažiau nei minutę;
- puslapis aiškiai pasako, kad daro šauksmininką, o ne visus linksnius.

CSV versijai:

- išsaugomos visos pradinės eilutės ir stulpeliai;
- lietuviškos raidės išlieka UTF-8;
- sukuriamas atskiras `KREIPINYS` stulpelis;
- nepakeisti ir abejotini vardai gali būti atfiltruoti peržiūrai;
- failą galima tiesiogiai susieti su pasirinktiniu lauku Mailchimp, Brevo ar
  Klaviyo importo metu.

## Galutinis sprendimas

Viešinimui rinktis **Vardų šauksmininkas** ir
`/irankiai/vardu-sauksmininkas/`. Repo pavadinimo nebūtina skubiai keisti —
istorinį `vardu-linksniavimas` galima palikti, o vartotojui rodyti tikslesnį
produkto vardą.

Pirmiausia sukurti patikimą vienos paskirties įrankį. Visus linksnius, pavardes,
npm paketą ir API plėsti tik tada, kai naudojimas parodys tikrą poreikį.
