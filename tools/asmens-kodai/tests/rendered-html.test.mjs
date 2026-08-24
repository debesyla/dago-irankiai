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
    assert.match(html, /Lietuviško asmens kodo generatorius ir validatorius/);
    assert.match(html, /Generavimo nustatymai/);
    assert.match(html, /Kaip veikia asmens kodas/);
    assert.match(html, /Validatoriaus kodo pavyzdžiai/);
    assert.match(html, />LLM</);
    assert.match(html, /Kopijuoti promptą/);
    assert.match(html, /KIEKIS:/);
    assert.match(html, /https:\/\/dago\.lt\/assets\/styles\/dago\.css/);
    assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
  }
});

test("keeps the shared dago base separate from project styles", async () => {
  const [layout, projectCss] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/project.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /dago\.lt\/assets\/styles\/reset\.css/);
  assert.match(layout, /dago\.lt\/assets\/styles\/dago\.css/);
  assert.match(layout, /dago\.lt\/assets\/img\/dago-icon\.png/);
  assert.match(projectCss, /\.site-header h1 a\s*\{[^}]*text-decoration:\s*none;/s);
  assert.doesNotMatch(projectCss, /body\s*\{|--theme\s*:|--black\s*:/);
  await access(new URL("../public/og.png", import.meta.url));
});
