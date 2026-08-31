# Dago vizualinės kalbos auditas

Audito data: 2026-08-31

Šis dokumentas aprašo bendrą `dago.lt` vizualinę sistemą, pritaikytą vardų
linksniavimo įrankiui pagal GitHub užduotį #5.

## Peržiūrėti šaltiniai

- `https://idejos.dago.lt/`
- `https://portfolio.dago.lt/`
- `https://dago.lt/irankiai/asmens-kodai/`
- `https://weblog.dago.lt/`
- `https://log.dago.lt/`
- bendri `reset.css` ir `dago.css` failai iš `https://dago.lt/assets/styles/`

`weblog.dago.lt` audito metu rodė naršyklės patikros ekraną, todėl jo tikrasis
puslapis nebuvo pasiekiamas. Jis nenaudotas spėliojant komponentų išvaizdą;
sprendimai paremti kitais keturiais pasiekiamais šaltiniais, ypač artimiausiu
to paties tipo projektu „Asmens kodai“.

## Pasikartojantys dizaino žetonai

| Sritis | Reikšmė |
| --- | --- |
| Fonas | `#212121` / bendrame CSS deklaruojamas `--black: 0 0% 13%` |
| Tekstas ir akcentas | `#ffbf00` / `--theme: 45 100% 50%` |
| Silpnas rėmelis | akcento spalva su `0.35` permatomumu |
| Antrinis tekstas | akcento spalva su maždaug `0.65–0.7` permatomumu |
| Šriftas | `monospace, "Courier New", Courier, sans-serif` |
| Bazinis dydis | `16px`, eilutės aukštis `1.5` |
| H1 | `1.75em`, `1.25` eilutės aukštis, storesnis svoris |
| H2 | `1.5em`, `1.25` eilutės aukštis, storesnis svoris |
| Turinio plotis | įrankiuose `min(100%, 75ch)` |
| Puslapio paraštės | bendrame CSS `2em 1em`; platesniuose informaciniuose puslapiuose `3em 1.5em 4em` |
| Kampai | statūs, `border-radius: 0` |
| Šešėliai | nenaudojami |
| Fokusas | `2px solid` kontūras su `3px` atitraukimu |

## Pasikartojantys komponentai

- Pavadinimas rašomas mažosiomis raidėmis, o po jo eina prigesinta nuoroda
  `// dago`, kuri išryškėja užvedus pelę arba sufokusavus klaviatūra.
- Įrankis telpa į vieną kairėje lygiuotą skaitymo koloną.
- Pagrindinis įrankio paviršius apibrėžiamas vieno pikselio permatomu gintariniu
  rėmeliu, be šešėlio ir be suapvalinimo.
- Pagrindinis veiksmas turi vientisą gintarinį foną ir tamsų tekstą.
- Tekstinės nuorodos pabrauktos; užvedus ar sufokusavus pabraukimas tampa
  brūkšninis.
- Formos valdikliai yra tamsūs, su gintariniu rėmeliu ir tuo pačiu monospace
  šriftu kaip likęs puslapis.
- Lentelės naudoja tuos pačius rėmelius kaip įrankio kortelė.
- Ilgesnės informacinės dalys ir poraštė atskiriamos dideliu vertikaliu tarpu;
  poraštė prasideda plona akcento spalvos linija.

## Pritaikymas šiame įrankyje

- Tiesiogiai įkeliami bendri `reset.css` ir `dago.css`, o įrankio CSS apsiriboja
  forma, rezultatų lentele ir išdėstymu.
- Naudojamas bendras `dago-icon.png` faviconas ir tokia pati `// dago` nuoroda.
- Metaduomenys apima `title`, aprašymą, kanoninį adresą, Open Graph, Twitter,
  Fediverse autoriaus lauką ir `theme-color`, remiantis „Asmens kodai“ bei
  portfolio konvencijomis.
- Rezultatų lentelė horizontaliai slenka tik savo konteineryje, todėl puslapis
  neturi išsiplėsti siauruose ekranuose.
- Būsenos tekstai yra `aria-live`, rezultato antraštė po pateikimo gauna fokusą,
  o puslapio pradžioje yra klaviatūra pasiekiama turinio praleidimo nuoroda.
- Judesio beveik nėra; `prefers-reduced-motion` vis tiek išjungia sklandų
  slinkimą ir galimas perėjimo animacijas.

## Sąmoningi skirtumai

- Atskiro universalaus `dago.lt` navigacijos ar poraštės komponento audituotuose
  puslapiuose nėra. Todėl naudojama bendra pavadinimo nuoroda ir kompaktiška
  nuoroda į kitus įrankius, o ne kuriama nauja globali navigacija.
- Audituoti puslapiai nepateikia žiniatinklio programos manifesto, o bendras
  faviconas yra tik `48×48`. Manifestas nepridėtas, kad nebūtų imituojama
  nepalaikoma diegiamos programos konvencija; tas pats bendras paveikslas
  nurodytas kaip faviconas ir platformos piktograma.
- Pagrindinis bendras CSS įkeliamas iš `dago.lt`, kaip ir kituose šeimos
  puslapiuose. Kritiniai spalvų ir formų žetonai pakartoti lokaliame CSS, kad
  įrankis liktų įskaitomas, jei bendras failas laikinai nepasiekiamas.
- Užduotis #2 atskirai valdo įrankio turinį, eilučių redagavimą, kopijavimą ir
  išsamesnes rezultatų būsenas. Šiame pakeitime dabartinis konvertavimas tik
  pateikiamas šeimos dizainą atitinkančioje saugioje dviejų stulpelių lentelėje.
