# Diegimas į dago.lt/irankiai/

Visi įrankiai diegiami kartu, viena darbo eiga: `.github/workflows/deploy.yml`.
Ją paleidžia kiekvienas `main` šakos pakeitimas arba rankinis
`workflow_dispatch`.

Diegimo metu:

1. `npm run verify` – kiekvieno įrankio `lint` ir `test`, tada `npm run build`
   surenka `_deploy/` katalogą (visų įrankių `build/` katalogai, sugeneruotas
   `index.html`, `site/` failai ir `BUILD` žyma su commit SHA) ir jį patikrina;
2. per SSH patikrinamas Hostinger `/irankiai/` katalogas ir jo saugos žymeklis
   `.deploy-marker-irankiai`;
3. parodomas `rsync --delete` dry-run, tada `_deploy/` sinchronizuojamas į
   `/irankiai/` (žymeklis ir `.well-known/` neliečiami);
4. `scripts/smoke.mjs` gyvame puslapyje patikrina `BUILD` žymą, pradinį puslapį
   ir kiekvieno įrankio `<title>` bei visus jo vietinius failus (JavaScript
   failai privalo grįžti su JavaScript MIME tipu).

`rsync --delete` reiškia, kad serverio `/irankiai/` katalogas visada tiksliai
atkartoja `_deploy/`. Failai, kurių nėra repozitoriume, po diegimo dings.

## Vienkartinis paruošimas

Hostinger katalogas turi baigtis `/irankiai` ir jame turi būti tuščias failas
`.deploy-marker-irankiai`. Be šio failo diegimas sustoja prieš bet kokį failų
trynimą.

GitHub `production` aplinkoje naudojamos paslaptys:

- `DEPLOY_SSH_KEY` – privatus SSH raktas;
- `SSH_HOST`, `SSH_USER`, `SSH_PORT`;
- `SSH_KNOWN_HOSTS` – iš anksto patikrintas serverio rakto įrašas;
- `REMOTE_DIR` – absoliutus kelias, kuris baigiasi `/irankiai`.

SSH serverio raktas yra prisegtas iš anksto. Pasikeitus serveriui diegimas turi
sustoti, kol naujas rakto atspaudas bus patikrintas ir įrašytas į
`SSH_KNOWN_HOSTS`.

## Grąžinimas

Grąžinimui į ankstesnę versiją reikia atšaukti atitinkamą commitą `main`
šakoje (`git revert`). Naujas push automatiškai įdiegs grąžintą versiją.

## IndexNow

Viešas IndexNow raktas `4d92520a0ed54c33988657ccb048d8c3` diegiamas dviejose
vietose: `https://dago.lt/irankiai/4d92520a0ed54c33988657ccb048d8c3.txt`
(galioja visiems `/irankiai/` adresams) ir istoriškai
`https://dago.lt/irankiai/asmens-kodai/4d92520a0ed54c33988657ccb048d8c3.txt`.
