# Perkėlimas į monorepo

Data: 2026-09-19. Du atskiri repozitoriumai sujungti į `debesyla/dago-irankiai`
neprarandant git istorijos.

## Šaltiniai

| Senas repozitoriumas | Importuotas `main` commit | Commit'ų | Naujas kelias |
| --- | --- | --- | --- |
| [debesyla/asmens-kodai](https://github.com/debesyla/asmens-kodai) | `b261ad8d9725777f7fea014a0d94261185706995` | 9 | `tools/asmens-kodai/` |
| [debesyla/vardu-linksniavimas](https://github.com/debesyla/vardu-linksniavimas) | `cc62929` (2026-09-02) | 17 | `tools/vardu-linksniavimas/` |

## Metodas

1. Kiekvienas repozitoriumas nuklonuotas iš GitHub į švarų katalogą.
2. `git filter-repo --to-subdirectory-filter tools/<pavadinimas>` perrašė visus
   kelius į pakatalogį, todėl `git log` ir `git blame` bet kuriam failui rodo
   visą istoriją iki pat pirmo commit'o be `--follow`.
3. Abi istorijos sujungtos į tuščią pradinį commit'ą su
   `git merge --allow-unrelated-histories`.
4. Patikrinta, kad kiekvieno failo turinys (blob hash) sutampa su originalu.

Perrašius kelius pasikeitė commit'ų SHA. Atitikmenys (senas → naujas):

- [`docs/history/asmens-kodai-commit-map.txt`](history/asmens-kodai-commit-map.txt)
- [`docs/history/vardu-linksniavimas-commit-map.txt`](history/vardu-linksniavimas-commit-map.txt)

Importuota tik `main` šaka. Visos `codex/*` šakos buvo pilnai įlietos į
`main` ir lieka archyvuotuose repozitoriumuose.

## Užduotys (issues)

Atviros užduotys perkeltos su GitHub „transfer“ funkcija (komentarai, autoriai
ir datos išsaugoti; seni adresai nukreipia į naujus). Uždarytos užduotys lieka
archyvuotuose repozitoriumuose.

| Sena užduotis | Nauja užduotis |
| --- | --- |
| asmens-kodai#6 Improve remaining color contrast issue | [#1](https://github.com/debesyla/dago-irankiai/issues/1) |
| vardu-linksniavimas#1 Publish this tool: naming + dago.lt/irankiai/ page + homepage link | [#2](https://github.com/debesyla/dago-irankiai/issues/2) |
| vardu-linksniavimas#6 Add automated tests and CI quality gates | [#3](https://github.com/debesyla/dago-irankiai/issues/3) |
| vardu-linksniavimas#7 Set up GitHub-to-SSH production autodeployment | [#4](https://github.com/debesyla/dago-irankiai/issues/4) |

## Kas pakeista perkeliant

- Bendra `LICENSE` (GPL-2.0-or-later) repo šaknyje – perkelta iš
  `asmens-kodai`; dabar galioja visiems įrankiams.
- `tools/asmens-kodai`: `npm run build` dabar reiškia diegiamą statinį
  puslapį (buvęs `build:static`), `vinext` variantas – `build:worker`;
  pašalinti atskira darbo eiga ir `docs/deployment.md` (pakeisti bendrais);
  `codeRepository` ir `package.json` nuorodos rodo į monorepo; atskiras
  `package-lock.json` pakeistas bendru.
- `tools/vardu-linksniavimas`: pridėti `package.json`, `build.mjs`,
  `.htaccess` ir `tool.json`. Tai pirmas šio įrankio diegimas į `dago.lt`
  (anksčiau jis buvo tik GitHub Pages).
- Nauja: `site/` (bendras `/irankiai/` puslapis), `scripts/`, `tests/`,
  `.github/workflows/deploy.yml`.

## Perjungimo eiga

- [x] Sukurtas `debesyla/dago-irankiai`, `production` aplinka (tik `main`), žymos.
- [x] Perkeltos atviros užduotys.
- [x] Senų repozitoriumų README rodo į monorepo; senoji `asmens-kodai` diegimo
      darbo eiga išjungta.
- [x] Į `production` aplinką įrašytos paslaptys (`REMOTE_DIR` baigiasi `/irankiai`).
- [x] Hostinger `/irankiai/` katalogas išvalytas 2026-09-26, jame sukurtas
      `.deploy-marker-irankiai`. Senasis `/irankiai/.htaccess` su 302 į pradinį
      puslapį dingo kartu su juo.
- [x] Pirmas diegimas 2026-09-26 (run 36232333940): failai įkelti, abu įrankiai
      ir `/irankiai/` pasiekiami. Smoke testas tame paleidime krito dėl
      Cloudflare 403 GitHub vykdytojui; nuo tada testas eina tiesiai į kilmės
      serverį, o įkėlimą papildomai patikrina SSH žingsnis.
- [x] `vardu-linksniavimas` GitHub Pages `index.html` pakeistas nukreipimu į
      `https://dago.lt/irankiai/vardu-linksniavimas/`.
- [x] Abu seni repozitoriumai archyvuoti 2026-09-26.
