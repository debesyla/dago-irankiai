# Diegimas į dago.lt

Puslapis talpinamas adresu
`https://dago.lt/irankiai/asmens-kodai/`. Pakeitimai `main` šakoje paleidžia
`.github/workflows/deploy.yml`.

Diegimo metu:

1. atliekamos kodo patikros;
2. sukuriamas statinis `build/` katalogas;
3. per SSH patikrinamas tikslus Hostinger katalogas ir jo saugos žymeklis;
4. parodomas `rsync` dry-run, tada failai sinchronizuojami;
5. gyvame puslapyje patikrinamas commitą žymintis `BUILD` failas, HTML, JS ir
   socialinis paveikslėlis.

## Vienkartinis paruošimas

Hostinger katalogas turi baigtis `/irankiai/asmens-kodai` ir jame turi būti
tuščias failas `.deploy-marker-asmens-kodai`. Be šio failo diegimas sustoja
prieš bet kokį failų trynimą.

GitHub `production` aplinkoje naudojamos paslaptys:

- `DEPLOY_SSH_KEY`;
- `SSH_HOST`;
- `SSH_USER`;
- `SSH_PORT`;
- `SSH_KNOWN_HOSTS`;
- `REMOTE_DIR`.

SSH serverio raktas yra prisegtas iš anksto. Pasikeitus serveriui diegimas turi
sustoti, kol naujas rakto atspaudas bus patikrintas.

Grąžinimui į ankstesnę versiją reikia atšaukti atitinkamą commitą `main`
šakoje. Naujas push automatiškai įdiegs grąžintą versiją.
