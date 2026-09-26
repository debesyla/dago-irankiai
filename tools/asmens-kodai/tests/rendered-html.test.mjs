import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { generatePersonalCodes } from "../lib/personal-code.ts";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const helperPath = fileURLToPath(new URL("./helpers/render.tsx", import.meta.url));

let server;
let renderTool;

before(async () => {
  const vite = await import("vite");
  server = await vite.createServer({
    root: projectRoot,
    configFile: `${projectRoot}vite.config.ts`,
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true, ws: false, watch: null },
  });
  const moduleId = `/@fs${helperPath}`;
  const loaded =
    typeof vite.createServerModuleRunner === "function"
      ? await vite.createServerModuleRunner(server.environments.ssr).import(moduleId)
      : await server.ssrLoadModule(moduleId);
  renderTool = loaded.renderTool;
});

after(async () => {
  await server?.close();
});

test("renders the finished tool", () => {
  const [initialCode] = generatePersonalCodes({ count: 1 });
  const html = renderTool(initialCode);

  assert.match(html, /Generavimo nustatymai/);
  assert.match(html, /Kaip veikia asmens kodas/);
  assert.match(html, /Kodo pavyzdžiai/);
  assert.doesNotMatch(html, /Validatoriaus kodo pavyzdžiai/);
  assert.doesNotMatch(html, /Trumpi pavyzdžiai savo projektui arba pokalbiui su pasirinktu DI įrankiu\./);
  assert.match(html, />LLM \/ AI</);
  assert.match(html, /Kopijuoti promptą/);
  assert.match(html, /KIEKIS:/);
  assert.match(html, /<a[^>]+target="_blank"[^>]+rel="noopener"[^>]+class="opacity-20 text-nowrap hover:opacity-100 no-underline">\/\/ dago<\/a>/);
  assert.match(html, /<h2 class="sr-only">Sugeneruotas kodas<\/h2>/);
  assert.doesNotMatch(html, /<h2>Patikrinti asmens kodą<\/h2>/);
  assert.match(html, /<small class="century-prefix">19<\/small>90-01-01/);
  assert.match(html, /gimimo data:.*metai, mėnuo, diena/s);
  assert.doesNotMatch(html, /mailto:/);
  assert.match(html, /<strong>labas \(sraigė\) dago\.lt<\/strong>/);
  assert.ok(html.includes(initialCode), "the generated code is rendered");
  assert.ok(html.indexOf('id="kodo-pavyzdziai"') < html.indexOf('id="kaip-veikia"'));
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("document head links the shared dago base", async () => {
  const html = await readFile(new URL("../static-site/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>Asmens kodai \/\/ dago<\/title>/);
  assert.match(html, /dago\.lt\/assets\/styles\/reset\.css/);
  assert.match(html, /dago\.lt\/assets\/styles\/dago\.css\?v=20260901/);
  assert.match(html, /dago\.lt\/assets\/img\/dago-icon\.png/);
  assert.match(html, /Lietuviško asmens kodo generatorius ir validatorius/);
  assert.match(html, /"codeRepository": "https:\/\/github\.com\/debesyla\/dago-irankiai\/tree\/main\/tools\/asmens-kodai"/);
  assert.doesNotMatch(html, /mailto:/);
});

test("keeps the shared dago base separate from project styles", async () => {
  const [projectCss, component, staticEntry] = await Promise.all([
    readFile(new URL("../static-site/project.css", import.meta.url), "utf8"),
    readFile(new URL("../components/PersonalCodeTool.tsx", import.meta.url), "utf8"),
    readFile(new URL("../static-site/main.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(component, /<label className="sr-only" htmlFor="personal-code">Asmens kodas<\/label>/);
  assert.match(staticEntry, /generatePersonalCodes\(\{ count: 1 \}\)/);
  assert.match(staticEntry, /<PersonalCodeTool initialCode=\{initialCode\} \/>/);
  assert.match(staticEntry, /import "\.\/project\.css";/);
  assert.ok(component.indexOf("<summary>LLM / AI</summary>") < component.indexOf("<summary>JavaScript</summary>"));
  assert.ok(component.indexOf("<summary>JavaScript</summary>") < component.indexOf("<summary>PHP</summary>"));
  assert.doesNotMatch(component, /<details open>/);
  assert.match(projectCss, /\.no-underline\s*\{[^}]*text-decoration:\s*none;/s);
  assert.match(projectCss, /\.hover\\:opacity-100:hover\s*\{[^}]*opacity:\s*100%;/s);
  assert.match(projectCss, /#validate-tab\.active,[^}]*border-left-color:/s);
  assert.doesNotMatch(projectCss, /\.filters legend\s*\{/);
  assert.doesNotMatch(projectCss, /(^|\n)\.sr-only\s*\{/);
  assert.doesNotMatch(projectCss, /(^|\n)\.text-button\s*[,{]/);
  assert.doesNotMatch(projectCss, /(^|\n)details\s*\{/);
  assert.doesNotMatch(projectCss, /prefers-reduced-motion/);
  assert.match(component, /className="text-button copy-button"/);
  assert.match(component, /<output className="code-output">\{copyStatus\?\.area === "generator" && copyStatus\.target === code \? copyStatus\.message : code\}<\/output>/);
  assert.match(component, /setCopyStatus\(\{ area, message: "Nukopijuota", target \}\)/);
  assert.doesNotMatch(projectCss, /\.generator-copy-status\s*\{/);
  assert.doesNotMatch(projectCss, /body\s*\{|--theme\s*:|--black\s*:/);
  await access(new URL("../public/og.png", import.meta.url));
});
