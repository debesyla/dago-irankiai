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

## Tyrimas ir tolesnė kryptis

Pavadinimo, panašių įrankių, turinio, funkcijų ir būsimos techninės sąsajos
tyrimas pateiktas faile [RESEARCH.md](RESEARCH.md).

## Dizaino sistema

`dago.lt` šeimos vizualinių žetonų, komponentų, šaltinių ir sąmoningų
skirtumų auditas pateiktas faile [DESIGN.md](DESIGN.md).
