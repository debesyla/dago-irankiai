// Validates the assembled _deploy/ tree before anything is uploaded.
// Run "npm run build" first.
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { extractReferences } from "../scripts/lib/html.mjs";
import { BASE_PATH, INDEX_TITLE, deployDir, loadTools } from "../scripts/lib/tools.mjs";

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

const tools = await loadTools();

// og:image and twitter:image must be absolute — link-preview crawlers do not
// resolve relative ones — so a plain "skip absolute URLs" would skip every
// share card. Those under this site's own prefix are checked like any local
// reference: only crawlers ever fetch them, so nothing else would notice one
// missing.
const SITE_PREFIX = `https://dago.lt${BASE_PATH}`;

test("_deploy/ exists (run npm run build first)", async () => {
  assert.ok(await exists(deployDir), "_deploy/ is missing; run npm run build");
});

test("root files: BUILD stamp, .htaccess, IndexNow key", async () => {
  const build = (await readFile(path.join(deployDir, "BUILD"), "utf8")).trim();
  assert.match(build, /^(?:[0-9a-f]{40}|local)$/);
  assert.ok(await exists(path.join(deployDir, ".htaccess")));

  const keyFiles = (await readdir(deployDir)).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
  assert.equal(keyFiles.length, 1, "exactly one IndexNow key file at the root");
  const key = (await readFile(path.join(deployDir, keyFiles[0]), "utf8")).trim();
  assert.equal(`${key}.txt`, keyFiles[0], "IndexNow key file content must equal its file name");
});

test("index page lists every tool", async () => {
  const html = await readFile(path.join(deployDir, "index.html"), "utf8");
  assert.match(html, new RegExp(`<title>${INDEX_TITLE}</title>`));
  assert.doesNotMatch(html, /<!-- TOOLS -->/);
  for (const tool of tools) {
    assert.ok(html.includes(`href="${tool.urlPath}"`), `index links ${tool.urlPath}`);
    assert.ok(html.includes(tool.name), `index names ${tool.name}`);
  }
});

test("index page's share card is deployed", async () => {
  const html = await readFile(path.join(deployDir, "index.html"), "utf8");
  const cards = extractReferences(html).filter((reference) => reference.startsWith(SITE_PREFIX));
  assert.ok(cards.length > 0, `index has an og:image under ${SITE_PREFIX}`);
  for (const card of cards) {
    const file = path.join(deployDir, card.slice(SITE_PREFIX.length).split(/[?#]/)[0]);
    assert.ok(await exists(file), `${card} resolves to a deployed file`);
  }
});

for (const tool of tools) {
  test(`${tool.slug}: build output is complete`, async () => {
    const dir = path.join(deployDir, tool.slug);
    assert.ok(await exists(path.join(dir, ".htaccess")), ".htaccess present");
    const html = await readFile(path.join(dir, "index.html"), "utf8");
    assert.ok(html.includes(`<title>${tool.title}</title>`), `title matches tool.json: ${tool.title}`);

    // Every local reference must resolve to a file inside _deploy/.
    for (let reference of extractReferences(html)) {
      if (reference.startsWith(SITE_PREFIX)) reference = reference.slice("https://dago.lt".length);
      else if (/^[a-z][a-z0-9+.-]*:/i.test(reference) || reference.startsWith("//")) continue; // absolute URL
      let file;
      if (reference.startsWith("/")) {
        if (!reference.startsWith(BASE_PATH)) continue; // outside /irankiai/, not ours to check
        file = path.join(deployDir, reference.slice(BASE_PATH.length).split(/[?#]/)[0]);
      } else {
        file = path.join(dir, reference.split(/[?#]/)[0]);
      }
      if (file.endsWith(path.sep)) file = path.join(file, "index.html");
      assert.ok(await exists(file), `${tool.slug}: ${reference} resolves to a deployed file`);
    }
  });
}
