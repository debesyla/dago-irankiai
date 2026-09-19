# dago įrankiai

Vienas repozitoriumas (monorepo), iš kurio diegiami visi
`https://dago.lt/irankiai/` įrankiai. Kiekvienas įrankis gyvena atskirame
`tools/<pavadinimas>/` kataloge ir pasiekiamas adresu
`https://dago.lt/irankiai/<pavadinimas>/`.

| Įrankis | Adresas | Aprašymas |
| --- | --- | --- |
| [Asmens kodai](tools/asmens-kodai/) | <https://dago.lt/irankiai/asmens-kodai/> | Lietuviško asmens kodo generatorius ir validatorius. |
| [Vardų linksniavimas](tools/vardu-linksniavimas/) | <https://dago.lt/irankiai/vardu-linksniavimas/> | Lietuviškų vardų šauksmininkas kreipiniams. |

## Struktūra

- `tools/*` – įrankiai; kiekvienas yra atskiras npm darbo srities (workspace) paketas;
- `site/` – bendro `https://dago.lt/irankiai/` pradinio puslapio šablonas ir failai;
- `scripts/` – diegimo paketo surinkimas (`assemble.mjs`) ir gyvo puslapio patikra (`smoke.mjs`);
- `tests/` – surinkto diegimo paketo `_deploy/` patikros;
- `docs/` – diegimo aprašas ir perkėlimo istorija;
- `.github/workflows/deploy.yml` – viena bendra diegimo darbo eiga visiems įrankiams.

## Įrankio sutartis

Kad įrankis būtų įtrauktas į pradinį puslapį ir diegimą, jo kataloge turi būti:

1. `tool.json` – metaduomenys: `slug` (turi sutapti su katalogo pavadinimu),
   `name`, `title` (tikslus puslapio `<title>`), `description`;
2. `package.json` su `build` skriptu, kuris sukuria statinį `build/` katalogą
   su `index.html` ir `.htaccess`;
3. pageidautina – `test` ir `lint` skriptai.

`npm run build` repo šaknyje surenka visų įrankių `build/` katalogus į
`_deploy/`, iš `site/index.html` ir `tool.json` failų sugeneruoja pradinį
puslapį, prideda `site/` failus ir įrašo `BUILD` žymą su commit SHA.

## Vietinis darbas

```sh
npm ci                                # visų įrankių priklausomybės (repo šaknyje)
npm run dev -w tools/asmens-kodai     # vieno įrankio kūrimo serveris
npm run verify                        # lint, testai, surinkimas ir paketo patikra
```

Vieno įrankio komandos veikia su `-w tools/<pavadinimas>` arba tiesiog
paleidžiamos iš to įrankio katalogo.

## Naujas įrankis

1. Sukurkite `tools/<slug>/` su `tool.json`, `package.json` (`build` skriptas),
   `index.html`, `.htaccess` ir testais.
2. Puslapyje naudokite bendrus `https://dago.lt/assets/styles/reset.css` ir
   `dago.css` stilius bei `// dago` antraštės nuorodą, kad įrankis atitiktų
   šeimos dizainą.
3. `npm run verify` turi praeiti. Pradinis puslapis ir diegimas naują įrankį
   pasiima automatiškai.

## Diegimas

Kiekvienas `main` šakos pakeitimas paleidžia `.github/workflows/deploy.yml`:
patikros, surinkimas, `rsync` per vieną SSH jungtį į Hostinger `/irankiai/`
katalogą ir gyvų puslapių patikra. Detalės – [`docs/deployment.md`](docs/deployment.md).

## Istorija

Repozitoriumas sukurtas 2026-09-19 sujungus `debesyla/asmens-kodai` ir
`debesyla/vardu-linksniavimas` su visa jų git istorija. Žr.
[`docs/migration.md`](docs/migration.md).

## Licencija

Visi įrankiai platinami pagal `GPL-2.0-or-later` licenciją. Visas licencijos
tekstas yra faile [`LICENSE`](LICENSE).
