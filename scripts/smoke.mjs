// Post-deploy smoke test against the live site. Fails loudly (GitHub Actions
// ::error:: annotations) on the first problem it finds.
//
//   SITE=https://dago.lt/irankiai EXPECTED_SHA=<commit> node scripts/smoke.mjs
import { setTimeout as sleep } from "node:timers/promises";
import { isScriptUrl, sameOriginUrls } from "./lib/html.mjs";
import { INDEX_TITLE, loadTools } from "./lib/tools.mjs";

const site = (process.env.SITE ?? "https://dago.lt/irankiai").replace(/\/+$/, "");
const expectedSha = process.env.EXPECTED_SHA?.trim();

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

async function get(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: { "cache-control": "no-cache", pragma: "no-cache", "user-agent": "dago-irankiai-smoke" },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    fail(`GET ${url} failed to complete: ${error.message}`);
  }
  if (!response.ok) fail(`GET ${url} returned HTTP ${response.status}`);
  return response;
}

function assertIncludes(haystack, needle, url) {
  if (!haystack.includes(needle)) fail(`${url} does not contain ${JSON.stringify(needle)}`);
}

const tools = await loadTools();
const checked = new Set();

// 1. The bytes reached the live document root. rsync creates a missing
//    destination rather than failing, so this is the only check that catches
//    a mistyped target directory.
let liveSha = "";
for (let attempt = 1; attempt <= 5; attempt += 1) {
  liveSha = (await (await get(`${site}/BUILD`)).text()).trim();
  if (!expectedSha || liveSha === expectedSha) break;
  console.log(`BUILD=${liveSha}, waiting for ${expectedSha} (attempt ${attempt})`);
  await sleep(3_000);
}
if (expectedSha && liveSha !== expectedSha) fail(`live BUILD=${liveSha}, expected ${expectedSha}`);
console.log(`BUILD ok (${liveSha})`);

// 2. The index page lists every tool.
const indexUrl = `${site}/`;
const indexHtml = await (await get(indexUrl)).text();
assertIncludes(indexHtml, `<title>${INDEX_TITLE}</title>`, indexUrl);
for (const tool of tools) assertIncludes(indexHtml, `href="${tool.urlPath}"`, indexUrl);
console.log(`index ok (${tools.length} tools listed)`);

// 3. Every tool renders and every same-origin file it references is served.
async function checkAssets(html, pageUrl) {
  for (const url of sameOriginUrls(html, pageUrl)) {
    if (checked.has(url)) continue;
    checked.add(url);
    const response = await get(url);
    const body = await response.arrayBuffer();
    if (body.byteLength === 0) fail(`${url} is empty`);
    if (isScriptUrl(url)) {
      const type = response.headers.get("content-type") ?? "";
      if (!/javascript|ecmascript/i.test(type)) {
        fail(`${url} is served as "${type}"; browsers refuse module scripts without a JavaScript MIME type`);
      }
    }
  }
}

await checkAssets(indexHtml, indexUrl);
for (const tool of tools) {
  const pageUrl = `${site}/${tool.slug}/`;
  const html = await (await get(pageUrl)).text();
  assertIncludes(html, `<title>${tool.title}</title>`, pageUrl);
  await checkAssets(html, pageUrl);
  console.log(`${tool.slug} ok`);
}

console.log(`Smoke test passed: ${tools.length} tools, ${checked.size} files checked at ${site}/`);
