"use client";

import { FormEvent, useMemo, useState } from "react";
import { buildLlmPrompt } from "@/lib/llm-prompt";
import {
  formatIsoDate,
  generatePersonalCodes,
  parsePersonalCode,
  PENSION_AGE,
  type PersonalCodeResult,
} from "@/lib/personal-code";

const javascriptExample = `function validuotiAsmensKoda(kodas) {
  if (!/^[1-6]\\d{10}$/.test(kodas)) return false;

  const pirmas = Number(kodas[0]);
  const simtmetis = pirmas <= 2 ? 1800 : pirmas <= 4 ? 1900 : 2000;
  const metai = simtmetis + Number(kodas.slice(1, 3));
  const menuo = Number(kodas.slice(3, 5));
  const diena = Number(kodas.slice(5, 7));
  const data = new Date(metai, menuo - 1, diena);

  if (data.getFullYear() !== metai ||
      data.getMonth() !== menuo - 1 ||
      data.getDate() !== diena) return false;
  if (data > new Date() || kodas.slice(7, 10) === '000') return false;

  const skaiciai = [...kodas].map(Number);
  const svoriai1 = [1,2,3,4,5,6,7,8,9,1];
  const svoriai2 = [3,4,5,6,7,8,9,1,2,3];
  let k = skaiciai.slice(0, 10)
    .reduce((s, n, i) => s + n * svoriai1[i], 0) % 11;

  if (k === 10) k = skaiciai.slice(0, 10)
    .reduce((s, n, i) => s + n * svoriai2[i], 0) % 11;
  if (k === 10) k = 0;

  return k === skaiciai[10];
}`;

const phpExample = `function validuotiAsmensKoda(string $kodas): bool {
    if (!preg_match('/^[1-6]\\d{10}$/', $kodas)) return false;

    $pirmas = (int) $kodas[0];
    $simtmetis = $pirmas <= 2 ? 1800 : ($pirmas <= 4 ? 1900 : 2000);
    $metai = $simtmetis + (int) substr($kodas, 1, 2);
    $menuo = (int) substr($kodas, 3, 2);
    $diena = (int) substr($kodas, 5, 2);
    if (!checkdate($menuo, $diena, $metai)) return false;
    $gimimoData = sprintf('%04d-%02d-%02d', $metai, $menuo, $diena);
    if ($gimimoData > date('Y-m-d') || substr($kodas, 7, 3) === '000') return false;

    $skaiciai = array_map('intval', str_split($kodas));
    $svoriai1 = [1,2,3,4,5,6,7,8,9,1];
    $svoriai2 = [3,4,5,6,7,8,9,1,2,3];
    $suma = 0;
    for ($i = 0; $i < 10; $i++) $suma += $skaiciai[$i] * $svoriai1[$i];
    $k = $suma % 11;

    if ($k === 10) {
        $suma = 0;
        for ($i = 0; $i < 10; $i++) $suma += $skaiciai[$i] * $svoriai2[$i];
        $k = $suma % 11;
    }

    return ($k === 10 ? 0 : $k) === $skaiciai[10];
}`;

export function PersonalCodeTool({ initialCode }: { initialCode: string }) {
  const [mode, setMode] = useState<"generate" | "validate">("generate");
  const [adultOnly, setAdultOnly] = useState(false);
  const [notOlderThanPensionAge, setNotOlderThanPensionAge] = useState(false);
  const [useExactDate, setUseExactDate] = useState(false);
  const [exactDate, setExactDate] = useState("");
  const [count, setCount] = useState(1);
  const [codes, setCodes] = useState([initialCode]);
  const [generatorError, setGeneratorError] = useState("");
  const [copyStatus, setCopyStatus] = useState<{
    area: "generator" | "example";
    message: string;
    target?: string;
  } | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [validationResult, setValidationResult] = useState<PersonalCodeResult | null>(null);
  const todayIso = useMemo(() => formatIsoDate(new Date()), []);
  const llmPrompt = useMemo(() => buildLlmPrompt({
    adultOnly,
    notOlderThanPensionAge,
    useExactDate,
    exactDate,
    count,
  }), [adultOnly, count, exactDate, notOlderThanPensionAge, useExactDate]);

  function generate() {
    try {
      setCodes(generatePersonalCodes({
        adultOnly,
        notOlderThan: notOlderThanPensionAge ? PENSION_AGE : null,
        exactBirthDate: useExactDate ? exactDate : null,
        count,
      }));
      setGeneratorError("");
      setCopyStatus(null);
    } catch (error) {
      setGeneratorError(error instanceof Error ? error.message : "Nepavyko sugeneruoti kodų.");
    }
  }

  function validate(event: FormEvent) {
    event.preventDefault();
    setValidationResult(parsePersonalCode(inputCode));
  }

  async function copy(value: string, area: "generator" | "example", target?: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus({ area, message: "Nukopijuota", target });
      window.setTimeout(() => setCopyStatus(null), 1800);
    } catch {
      setCopyStatus({ area, message: "Nepavyko nukopijuoti", target });
    }
  }

  function enableExactDate(checked: boolean) {
    setUseExactDate(checked);
    if (checked) {
      setAdultOnly(false);
      setNotOlderThanPensionAge(false);
      if (!exactDate) setExactDate(todayIso);
    }
  }

  return (
    <main className="tool-page">
      <header className="site-header">
        {/* eslint-disable-next-line react/jsx-no-target-blank -- Matches the shared dago project header markup exactly. */}
        <h1>asmens kodai <a href="https://dago.lt" target="_blank" rel="noopener" className="opacity-20 text-nowrap hover:opacity-100 no-underline">{"// dago"}</a></h1>
        <p>Lietuviško asmens kodo generatorius ir validatorius.</p>
      </header>

      <section className="tool-card" aria-label="Asmens kodo įrankis">
        <div className="mode-switch" role="tablist" aria-label="Pasirinkite įrankį">
          <button id="generate-tab" className={mode === "generate" ? "active" : ""} onClick={() => setMode("generate")} role="tab" aria-selected={mode === "generate"} aria-controls="generate-panel">
            Generuoti
          </button>
          <button id="validate-tab" className={mode === "validate" ? "active" : ""} onClick={() => setMode("validate")} role="tab" aria-selected={mode === "validate"} aria-controls="validate-panel">
            Tikrinti
          </button>
        </div>

        {mode === "generate" ? (
          <div id="generate-panel" className="tool-content" role="tabpanel" aria-labelledby="generate-tab">
            <h2 className="sr-only">Sugeneruotas kodas{codes.length > 1 ? "i" : ""}</h2>
            {codes.length > 1 && <button className="text-button copy-all-button" onClick={() => copy(codes.join("\n"), "generator", "all")}>{copyStatus?.area === "generator" && copyStatus.target === "all" ? copyStatus.message : "Kopijuoti visus"}</button>}

            <div className="code-result">
              <div className={codes.length > 1 ? "code-list" : "single-code"}>
                {codes.map((code) => (
                  <div className="code-row" key={code}>
                    <output className="code-output">{copyStatus?.area === "generator" && copyStatus.target === code ? copyStatus.message : code}</output>
                    <button className="copy-button" onClick={() => copy(code, "generator", code)} aria-label={`Kopijuoti ${code}`}>kopijuoti</button>
                  </div>
                ))}
              </div>
            </div>

            <fieldset className="filters">
              <legend>Generavimo nustatymai</legend>
              <label><input type="checkbox" checked={adultOnly} disabled={useExactDate} onChange={(event) => setAdultOnly(event.target.checked)} /> Tik 18 metų ar vyresnis</label>
              <label><input type="checkbox" checked={notOlderThanPensionAge} disabled={useExactDate} onChange={(event) => setNotOlderThanPensionAge(event.target.checked)} /> Ne vyresnis nei {PENSION_AGE} m. <a href="https://www.sodra.lt/lt/senatves-pensijos-amziaus-lentele" target="_blank" rel="noreferrer" aria-label="Pensinio amžiaus šaltinis">↗</a></label>
              <label><input type="checkbox" checked={useExactDate} onChange={(event) => enableExactDate(event.target.checked)} /> Konkreti gimimo data</label>
              {useExactDate && (
                <label className="nested-field" htmlFor="birth-date">
                  Gimimo data
                  <input id="birth-date" type="date" min="1800-01-01" max={todayIso} value={exactDate} onChange={(event) => setExactDate(event.target.value)} />
                </label>
              )}
              <label className="inline-field" htmlFor="count">
                Kiek kodų?
                <select id="count" value={count} onChange={(event) => setCount(Number(event.target.value))}>
                  <option value="1">1</option>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
              </label>
            </fieldset>

            <button className="primary-button" onClick={generate}>Generuoti</button>
            {generatorError && <p className="result invalid" role="alert">{generatorError}</p>}
          </div>
        ) : (
          <form id="validate-panel" className="tool-content" onSubmit={validate} role="tabpanel" aria-labelledby="validate-tab">
            <label className="sr-only" htmlFor="personal-code">Asmens kodas</label>
            <input id="personal-code" className="personal-code-input" inputMode="numeric" autoComplete="off" maxLength={11} pattern="[0-9]{11}" placeholder="39001010011" value={inputCode} onChange={(event) => { setInputCode(event.target.value.replace(/\D/g, "")); setValidationResult(null); }} />
            <button className="primary-button" type="submit">Tikrinti</button>

            {validationResult && (
              validationResult.valid ? (
                <div className="result valid" role="status">
                  <strong>Kodas sudarytas teisingai.</strong>
                  <dl className="code-details">
                    <div><dt>Gimimo data</dt><dd>{new Intl.DateTimeFormat("lt-LT").format(validationResult.birthDate)}</dd></div>
                    <div><dt>Lytis kode</dt><dd>{validationResult.sex === "male" ? "vyras" : "moteris"}</dd></div>
                    <div><dt>Amžius</dt><dd>{validationResult.age} m.</dd></div>
                  </dl>
                </div>
              ) : (
                <p className="result invalid" role="alert"><strong>Kodas neteisingas.</strong> {validationResult.error}</p>
              )
            )}
          </form>
        )}
      </section>

      <section className="info-section" id="kodo-pavyzdziai">
        <h2>Kodo pavyzdžiai</h2>
        <details>
          <summary>LLM / AI</summary>
          <div className="example-actions">
            <p>Promptas automatiškai naudoja generatoriuje parinktus nustatymus.</p>
            <button className="text-button" type="button" onClick={() => copy(llmPrompt, "example")}>Kopijuoti promptą</button>
          </div>
          <pre><code>{llmPrompt}</code></pre>
          <p className="copy-status example-copy-status" role="status" aria-live="polite">{copyStatus?.area === "example" ? copyStatus.message : ""}</p>
        </details>
        <details>
          <summary>JavaScript</summary>
          <pre><code>{javascriptExample}</code></pre>
        </details>
        <details>
          <summary>PHP</summary>
          <pre><code>{phpExample}</code></pre>
        </details>
      </section>

      <section className="info-section" id="kaip-veikia">
        <h2>Kaip veikia asmens kodas?</h2>
        <p>Asmens kodą sudaro 11 skaitmenų. Pirmasis žymi gimimo šimtmetį ir lytį, kiti šeši – gimimo datą, po jų eina trijų skaitmenų eilės numeris, o paskutinis yra kontrolinis skaitmuo.</p>
        <div className="code-anatomy" aria-label="Asmens kodo dalių pavyzdys">
          <span><strong>3</strong><small>šimtmetis<br />ir lytis</small></span>
          <span><strong><small className="century-prefix">19</small>90-01-01</strong><small>gimimo data:<br />metai, mėnuo, diena</small></span>
          <span><strong>001</strong><small>eilės<br />numeris</small></span>
          <span><strong>1</strong><small>kontrolinis<br />skaitmuo</small></span>
        </div>

        <h3>Kaip kodas patikrinamas?</h3>
        <ol>
          <li>Patikrinama, ar yra lygiai 11 skaitmenų.</li>
          <li>Iš pirmųjų septynių skaitmenų atkuriama gimimo data ir tikrinama, ar tokia data egzistuoja.</li>
          <li>Pirmieji dešimt skaitmenų padauginami iš nustatytų svorių. Gautas kontrolinis skaitmuo turi sutapti su paskutiniu.</li>
        </ol>
      </section>

      <footer className="contact-section">
        <p>Reikia pagalbos su API jungtimis ar validatoriaus kūrimu? Galiu padėti.</p>
        <strong>labas (sraigė) dago.lt</strong>
      </footer>
    </main>
  );
}
