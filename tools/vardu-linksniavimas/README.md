# Vardų linksniavimas

Prenumeratos formoje klientas vardą teisingai įrašo vardininku, pavyzdžiui,
„Jonas“. Tačiau naujienlaiškio kreipinyje reikia šauksmininko: „Laba diena,
Jonai“.

Šis įrankis paverčia lietuviškus vardus į šauksmininko formą, kad juos būtų
paprasta naudoti naujienlaiškiuose, kvietimuose ir asmeninėse žinutėse.

## Konvertavimo branduolys

Naršyklėje naudojama gryna `toVocative` funkcija yra faile
`src/vocative.mjs`. Ji normalizuoja tarpus ir raidžių dydį, taiko
versijuojamus patikrintų vardų bei išimčių duomenis ir abejotinus rezultatus
pažymi peržiūrai. `toVocativeMany` priima vardų masyvą arba tekstą, kuriame
kiekvienas vardas pateiktas atskiroje eilutėje.

Branduolio regresijos testai paleidžiami su Node.js:

```sh
node --test tests/vocative.test.mjs
```

## CSV importas ir eksportas

Puslapyje galima pasirinkti UTF-8 CSV failą ir nurodyti stulpelį, kuriame
yra vardai. Įrankis atpažįsta kablelio, kabliataškio ir tabuliacijos skirtukus,
išsaugo visas pradines eilutes bei stulpelius ir prie jų prideda
`KREIPINYS` stulpelį. Jei toks pavadinimas jau yra, parenkamas naujas
nepasikartojantis pavadinimas, pavyzdžiui, `KREIPINYS_2`, todėl esami duomenys
neperrašomi.

Abejotinus arba nepakeistus vardus galima atfiltruoti ir pataisyti prieš
atsisiunčiant. Galutinis failas pateikiamas UTF-8 su BOM koduote, išlaikant
pradinį skirtuką, kad jį būtų patogu importuoti į skaičiuokles, MailerLite,
Omnisend, Mailchimp, Brevo ar Klaviyo. Failas apdorojamas tik naršyklėje.

CSV logikos regresijos testai:

```sh
node --test tests/csv.test.mjs
```

## Tyrimas ir tolesnė kryptis

Pavadinimo, panašių įrankių, turinio, funkcijų ir būsimos techninės sąsajos
tyrimas pateiktas faile [RESEARCH.md](RESEARCH.md).

## Dizaino sistema

`dago.lt` šeimos vizualinių žetonų, komponentų, šaltinių ir sąmoningų
skirtumų auditas pateiktas faile [DESIGN.md](DESIGN.md).
