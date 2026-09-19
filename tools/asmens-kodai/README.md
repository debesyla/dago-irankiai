# Asmens kodai // dago

Lietuviško asmens kodo generatorius ir validatorius, skirtas
`https://dago.lt/irankiai/asmens-kodai/`.

## Galimybės

- vieno arba 5, 10 ir 25 kodų generavimas;
- 18+ ir ne vyresnio nei 65 metų asmens filtrai;
- konkrečios gimimo datos pasirinkimas;
- struktūros, gimimo datos ir kontrolinio skaitmens validavimas;
- JavaScript ir PHP validavimo pavyzdžiai;
- paruoštas LLM promptas kodams generuoti pasirinktame DI įrankyje.

Puslapis tiesiogiai jungia bendrus `dago.lt` bazinius stilius ir favicon.
Visos tik šiam įrankiui reikalingos taisyklės yra `app/project.css`.

## Kaip projektas sukurtas?

Projektas sukurtas padedant dirbtinio intelekto įrankiams, daugiausia „OpenAI
Codex“. DI padėjo rašyti kodą, tekstus ir testus. Galutinius sprendimus priėmė
ir rezultatą patikrino žmogus.

## Vietinis paleidimas

Priklausomybės diegiamos monorepo šaknyje, komandos – su `-w` arba iš šio
katalogo:

```sh
npm ci
npm run dev -w tools/asmens-kodai
```

Patikrinimas:

```sh
npm test -w tools/asmens-kodai
npm run lint -w tools/asmens-kodai
```

`npm run build` sukuria statinį `build/` katalogą, kurį bendra diegimo darbo
eiga įkelia į `https://dago.lt/irankiai/asmens-kodai/`. `npm run build:worker`
surenka `vinext` (Cloudflare Worker) variantą, naudojamą testams ir vietinei
peržiūrai.

## Diegimas

Įrankis diegiamas kartu su kitais `dago.lt/irankiai/` įrankiais per bendrą
monorepo darbo eigą `.github/workflows/deploy.yml`. Žr.
[`docs/deployment.md`](../../docs/deployment.md).

## Licencija

Projektas yra atvirojo kodo. Jį galima kopijuoti, keisti ir naudoti pagal
`GPL-2.0-or-later` licencijos sąlygas. Visas licencijos tekstas yra faile
[`LICENSE`](../../LICENSE) repo šaknyje.
