import { generatePerson } from './generator.v2.mjs';

const get = (id) => document.getElementById(id);
let currentPerson;
const status = get('status');
const generate = get('generate');
generate.disabled = false;

generate.addEventListener('click', () => {
  currentPerson = generatePerson();
  get('person-name').textContent = currentPerson.fullName;
  const p = currentPerson;
  const fields = [
    ['Vardas', p.firstName], ['Pavardė', p.lastName], ['Amžius', `${p.age} m.`],
    ['Gimimo data', p.birthDate], ['Lytis', p.gender], ['Asmens kodas', p.personalCode],
    ['El. paštas', p.email], ['Telefonas', p.phone],
    ['Adresas', `${p.address.street}, ${p.address.postalCode} ${p.address.city}, ${p.address.country}`],
    ['Profesija', p.occupation], ['Įmonė', p.company],
  ];
  get('person-fields').replaceChildren(...fields.flatMap(([label, value]) => {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    return [dt, dd];
  }));
  get('person-json').textContent = JSON.stringify(currentPerson, null, 2);
  get('person').hidden = false;
  generate.textContent = 'Sugeneruoti kitą';
  status.textContent = `Sugeneruota: ${p.fullName}. Duomenys paruošti kopijuoti.`;
});

async function copy(text, target) {
  try {
    await navigator.clipboard.writeText(text);
    target.textContent = 'Nukopijuota.';
  } catch {
    target.textContent = 'Nepavyko nukopijuoti. Išskleiskite tekstą ir nukopijuokite rankiniu būdu.';
  }
}
get('copy').addEventListener('click', () => copy(JSON.stringify(currentPerson, null, 2), status));
get('copy-prompt').addEventListener('click', () => copy(get('llm-prompt').textContent, get('prompt-status')));
get('download').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(currentPerson, null, 2) + '\n'], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'testinis-zmogus.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = 'JSON failas paruoštas atsisiųsti.';
});
