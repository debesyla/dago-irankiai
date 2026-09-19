import { PENSION_AGE } from "./personal-code.ts";

export interface LlmPromptSettings {
  adultOnly: boolean;
  notOlderThanPensionAge: boolean;
  useExactDate: boolean;
  exactDate: string;
  count: number;
}

export function buildLlmPrompt(settings: LlmPromptSettings) {
  const ageRule = settings.adultOnly && settings.notOlderThanPensionAge
    ? `nuo 18 iki ${PENSION_AGE} metų`
    : settings.adultOnly
      ? "18 metų ar vyresnis"
      : settings.notOlderThanPensionAge
        ? `ne vyresnis nei ${PENSION_AGE} metų`
        : "amžius neribojamas, gimimo data negali būti ateityje";
  const birthDateRule = settings.useExactDate && settings.exactDate
    ? settings.exactDate
    : "parink pagal nurodytą amžiaus ribą";

  return `Sugeneruok struktūriškai teisingus Lietuvos asmens kodus.

[KIEKIS: ${settings.count}]
[AMŽIUS: ${ageRule}]
[GIMIMO DATA: ${birthDateRule}]

Taisyklės:
1. Kiekvieną kodą turi sudaryti lygiai 11 skaitmenų.
2. Pirmasis skaitmuo žymi lytį ir gimimo šimtmetį: 1/2 – 1800–1899, 3/4 – 1900–1999, 5/6 – 2000–2099; nelyginis – vyras, lyginis – moteris.
3. 2–7 skaitmenys yra gimimo data YYMMDD. Data turi egzistuoti ir atitikti aukščiau nurodytus nustatymus.
4. 8–10 skaitmenys yra eilės numeris nuo 001 iki 999.
5. Kontroliniam skaitmeniui pirmus 10 skaitmenų daugink iš svorių 1,2,3,4,5,6,7,8,9,1 ir sumos liekaną dalijant iš 11 naudok kaip 11-ą skaitmenį. Jei liekana yra 10, kartok su svoriais 3,4,5,6,7,8,9,1,2,3. Jei ir tada liekana 10, kontrolinis skaitmuo yra 0.

Prieš atsakydamas pats dar kartą patikrink kiekvieno kodo datą ir kontrolinį skaitmenį. Kodai turi nesikartoti. Atsakyme pateik tik kodus, po vieną eilutėje, be numeracijos ir paaiškinimų.`;
}
