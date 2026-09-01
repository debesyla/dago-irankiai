import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the finished tool at the root and intended dago.lt path", async () => {
  for (const pathname of ["/", "/irankiai/asmens-kodai"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /<title>Asmens kodai \/\/ dago<\/title>/i);
    const structuredDataMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    assert.ok(structuredDataMatch, "rendered HTML should contain JSON-LD");
    const structuredData = JSON.parse(structuredDataMatch[1]);
    assert.equal(structuredData["@type"], "WebApplication");
    assert.equal(structuredData.url, "https://dago.lt/irankiai/asmens-kodai/");
    assert.equal(structuredData.isAccessibleForFree, true);
    assert.equal(structuredData.codeRepository, "https://github.com/debesyla/asmens-kodai");
    assert.match(html, /Lietuviško asmens kodo generatorius ir validatorius/);
    assert.match(html, /Generavimo nustatymai/);
    assert.match(html, /Kaip veikia asmens kodas/);
    assert.match(html, /Kodo pavyzdžiai/);
    assert.doesNotMatch(html, /Validatoriaus kodo pavyzdžiai/);
    assert.doesNotMatch(html, /Trumpi pavyzdžiai savo projektui arba pokalbiui su pasirinktu DI įrankiu\./);
    assert.match(html, />LLM \/ AI</);
    assert.match(html, /Kopijuoti promptą/);
    assert.match(html, /KIEKIS:/);
    assert.match(html, /https:\/\/dago\.lt\/assets\/styles\/dago\.css\?v=20260901/);
    assert.match(html, /<a[^>]+target="_blank"[^>]+rel="noopener"[^>]+class="opacity-20 text-nowrap hover:opacity-100 no-underline">\/\/ dago<\/a>/);
    assert.match(html, /<h2 class="sr-only">Sugeneruotas kodas<\/h2>/);
    assert.doesNotMatch(html, /<h2>Patikrinti asmens kodą<\/h2>/);
    assert.match(html, /<small class="century-prefix">19<\/small>90-01-01/);
    assert.match(html, /gimimo data:.*metai, mėnuo, diena/s);
    assert.doesNotMatch(html, /mailto:/);
    assert.match(html, /<strong>labas \(sraigė\) dago\.lt<\/strong>/);
    assert.ok(html.indexOf('id="kodo-pavyzdziai"') < html.indexOf('id="kaip-veikia"'));
    assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
  }
});

test("keeps the shared dago base separate from project styles", async () => {
  const [layout, projectCss, component, rootPage, toolPage, staticEntry] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/project.css", import.meta.url), "utf8"),
    readFile(new URL("../components/PersonalCodeTool.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/irankiai/asmens-kodai/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../static-site/main.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /dago\.lt\/assets\/styles\/reset\.css/);
  assert.match(layout, /dago\.lt\/assets\/styles\/dago\.css\?v=20260901/);
  assert.match(layout, /dago\.lt\/assets\/img\/dago-icon\.png/);
  assert.match(component, /<label className="sr-only" htmlFor="personal-code">Asmens kodas<\/label>/);
  for (const entry of [rootPage, toolPage, staticEntry]) {
    assert.match(entry, /generatePersonalCodes\(\{ count: 1 \}\)/);
    assert.match(entry, /<PersonalCodeTool initialCode=\{initialCode\} \/>/);
  }
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
