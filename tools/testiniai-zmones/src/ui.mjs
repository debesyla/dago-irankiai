import { generatePerson, avatarForPerson } from './generator.v3.mjs';

const get = (id) => document.getElementById(id);
let currentPerson;
const status = get('status');
const generate = get('generate');
generate.disabled = false;
get('include-avatar').disabled = false;

async function copy(text, target, success = 'Nukopijuota.') {
  try {
    // Copy during the click gesture, including browsers that block Clipboard API access.
    let copied = false;
    if (typeof document.execCommand === 'function') {
      const active = document.activeElement;
      const input = document.createElement('textarea');
      input.value = text;
      input.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.append(input);
      input.select();
      try { copied = document.execCommand('copy'); } catch { /* Try the Clipboard API below. */ }
      input.remove();
      active?.focus({ preventScroll: true });
    }
    if (!copied) await navigator.clipboard.writeText(text);
    target.textContent = success;
    return true;
  } catch {
    target.textContent = 'Nepavyko nukopijuoti. Pažymėkite tekstą ir nukopijuokite rankiniu būdu.';
    return false;
  }
}

function copyValue(label, value, displayValue = value) {
  const button = document.createElement('button');
  const text = document.createElement('span');
  const feedback = document.createElement('span');
  button.type = 'button';
  button.className = 'copy-value';
  button.setAttribute('aria-label', `Kopijuoti: ${label}: ${displayValue}`);
  button.title = `Kopijuoti: ${label}`;
  text.className = 'value-text';
  text.textContent = String(displayValue);
  feedback.className = 'copy-feedback';
  feedback.setAttribute('aria-hidden', 'true');
  let timer;
  button.addEventListener('click', async () => {
    if (await copy(String(value), status, `${label}: nukopijuota.`)) {
      clearTimeout(timer);
      feedback.textContent = 'Nukopijuota';
      timer = setTimeout(() => { feedback.textContent = ''; }, 1600);
    }
  });
  button.append(text, feedback);
  return button;
}

function renderPerson() {
  const p = currentPerson;
  get('person-name').replaceChildren(copyValue('Vardas ir pavardė', p.fullName));
  get('person-name').setAttribute('aria-label', p.fullName);
  const fields = [
    ['Vardas', p.firstName], ['Pavardė', p.lastName], ['Amžius', p.age, `${p.age} m.`],
    ['Gimimo data', p.birthDate], ['Lytis', p.gender], ['Asmens kodas', p.personalCode],
    ['El. paštas', p.email], ['Telefonas', p.phone],
    ['Gatvė ir namas', p.address.street], ['Miestas', p.address.city],
    ['Pašto kodas', p.address.postalCode], ['Šalis', p.address.country],
    ['Profesija', p.occupation], ['Įmonė', p.company],
  ];
  function renderFields(id, rows) {
    get(id).replaceChildren(...rows.flatMap(([label, value, displayValue]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.append(copyValue(label, value, displayValue));
      return [dt, dd];
    }));
  }
  renderFields('person-fields', fields);
  renderFields('account-fields', [
    ['Vartotojo vardas', p.username], ['Slaptažodis', p.password], ['Paskyra sukurta', p.registeredAt],
    ['UUID', p.uuid], ['Svetainė', p.website], ['Naršyklės identifikatorius', p.userAgent],
  ]);
  renderFields('personal-fields', [
    ['Pilietybė', p.nationality], ['Motinos mergautinė pavardė', p.mothersMaidenName],
    ['Ūgis', p.heightCm, `${p.heightCm} cm`], ['Svoris', p.weightKg, `${p.weightKg} kg`],
    ['Kraujo grupė', p.bloodType], ['Mėgstamiausia spalva', p.favoriteColor],
  ]);
  renderFields('location-fields', [
    ['Platuma (miesto)', p.location.coordinates.latitude], ['Ilguma (miesto)', p.location.coordinates.longitude],
    ['Laiko juosta', p.location.timezone], ['Automobilis', `${p.vehicle.year} ${p.vehicle.make} ${p.vehicle.model}`],
  ]);
  renderFields('payment-fields', [
    ['Kortelės tipas', `${p.payment.brand} · ${p.payment.provider}`], ['Kortelės numeris', p.payment.number],
    ['Galioja iki', `${p.payment.expiryMonth}/${p.payment.expiryYear}`], ['CVV', p.payment.cvv],
  ]);
  const avatar = get('avatar');
  avatar.hidden = !p.avatar;
  if (p.avatar) {
    avatar.src = p.avatar;
    avatar.alt = `${p.fullName} inicialų avataras`;
  } else {
    avatar.removeAttribute('src');
  }
  get('copy-avatar').hidden = !p.avatar;
  get('person-json').textContent = JSON.stringify(p, null, 2);
  get('person').hidden = false;
}

generate.addEventListener('click', () => {
  currentPerson = generatePerson({ includeAvatar: get('include-avatar').checked });
  renderPerson();
  generate.textContent = 'Sugeneruoti kitą';
  status.textContent = `Sugeneruota: ${currentPerson.fullName}. Paspauskite reikšmę, kad ją nukopijuotumėte.`;
});

get('include-avatar').addEventListener('change', () => {
  if (!currentPerson) return;
  currentPerson.avatar = get('include-avatar').checked ? avatarForPerson(currentPerson) : null;
  renderPerson();
  status.textContent = currentPerson.avatar ? 'Avataras pridėtas.' : 'Avataras pašalintas.';
});

get('copy-avatar').addEventListener('click', () => copy(currentPerson.avatar, status, 'Avataro duomenų URL nukopijuotas.'));
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
