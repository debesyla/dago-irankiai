import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

test("statinis gamybinis puslapis naudoja teisingą dago.lt kelią", async () => {
  const html = await readFile(new URL("../build/index.html", import.meta.url), "utf8");

  assert.match(html, /<title>Asmens kodai \/\/ dago<\/title>/);
  assert.match(html, /https:\/\/dago\.lt\/irankiai\/asmens-kodai\//);
  assert.match(html, /\/irankiai\/asmens-kodai\/assets\/[^"']+\.js/);
  assert.match(html, /\/irankiai\/asmens-kodai\/assets\/[^"']+\.css/);
});

test("statiniame pakete yra diegimui reikalingi failai", async () => {
  const assets = await readdir(new URL("../build/assets/", import.meta.url));
  const socialImage = await stat(new URL("../build/og.png", import.meta.url));

  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
  assert.ok(socialImage.size > 100_000);
  await stat(new URL("../build/.htaccess", import.meta.url));
});
