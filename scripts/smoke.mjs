// Post-deploy smoke test against the live site. Fails loudly (GitHub Actions
// ::error:: annotations) on the first problem it finds.
//
//   SITE=https://dago.lt/irankiai EXPECTED_SHA=<commit> node scripts/smoke.mjs
//
// dago.lt sits behind Cloudflare, whose bot protection answers 403 to
// GitHub-hosted runners. With SMOKE_ORIGIN_IP set, every request goes to that
// origin server directly, with SNI and the Host header still set to the public
// hostname, so the origin serves exactly what it serves Cloudflare. Cloudflare
// does not cache HTML, BUILD or .mjs by default, so that is what visitors get.
import https from "node:https";
import { setTimeout as sleep } from "node:timers/promises";
import { isScriptUrl, sameOriginUrls } from "./lib/html.mjs";
import { INDEX_TITLE, loadTools } from "./lib/tools.mjs";

const site = (process.env.SITE ?? "https://dago.lt/irankiai").replace(/\/+$/, "");
const expectedSha = process.env.EXPECTED_SHA?.trim();
const originIp = process.env.SMOKE_ORIGIN_IP?.trim() || null;
const REQUEST_TIMEOUT_MS = 20_000;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

function request(url, redirectsLeft = 3) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    if (target.protocol !== "https:") {
      reject(new Error(`only https URLs are checked, got ${url}`));
      return;
    }
    const req = https.request(
      {
        host: originIp ?? target.hostname,
        servername: target.hostname,
        port: target.port || 443,
        path: `${target.pathname}${target.search}`,
        method: "GET",
        headers: {
          host: target.host,
          "cache-control": "no-cache",
          pragma: "no-cache",
          "user-agent": "dago-irankiai-smoke",
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("error", reject);
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          if (status >= 300 && status < 400 && res.headers.location) {
            if (redirectsLeft === 0) {
              reject(new Error(`${url}: too many redirects`));
              return;
            }
            const next = new URL(res.headers.location, target);
            if (next.origin !== target.origin) {
              reject(new Error(`${url} redirects off-site to ${next.href}`));
              return;
            }
            resolve(request(next.href, redirectsLeft - 1));
            return;
          }
          resolve({ status, headers: res.headers, body: Buffer.concat(chunks) });
        });
      },
    );
    req.on("timeout", () => req.destroy(new Error(`no response within ${REQUEST_TIMEOUT_MS / 1000}s`)));
    req.on("error", reject);
    req.end();
  });
}

async function get(url) {
  let response;
  try {
    response = await request(url);
  } catch (error) {
    fail(`GET ${url} failed to complete: ${error.message}`);
  }
  if (response.status < 200 || response.status >= 300) {
    const server = response.headers.server ?? "unknown server";
    const mitigated = response.headers["cf-mitigated"] ? `, cf-mitigated: ${response.headers["cf-mitigated"]}` : "";
    fail(`GET ${url} returned HTTP ${response.status} (server: ${server}${mitigated})`);
  }
  return response;
}

function assertIncludes(haystack, needle, url) {
  if (!haystack.includes(needle)) fail(`${url} does not contain ${JSON.stringify(needle)}`);
}

const tools = await loadTools();
const checked = new Set();
console.log(originIp ? `checking ${site}/ directly on the origin server (SMOKE_ORIGIN_IP)` : `checking ${site}/ via public DNS`);

// 1. The bytes reached the live document root. rsync creates a missing
//    destination rather than failing, so this is the only HTTP check that
//    catches a mistyped target directory.
let liveSha = "";
for (let attempt = 1; attempt <= 5; attempt += 1) {
  liveSha = (await get(`${site}/BUILD`)).body.toString("utf8").trim();
  if (!expectedSha || liveSha === expectedSha) break;
  console.log(`BUILD=${liveSha}, waiting for ${expectedSha} (attempt ${attempt})`);
  await sleep(3_000);
}
if (expectedSha && liveSha !== expectedSha) fail(`live BUILD=${liveSha}, expected ${expectedSha}`);
console.log(`BUILD ok (${liveSha})`);

// 2. The index page lists every tool.
const indexUrl = `${site}/`;
const indexHtml = (await get(indexUrl)).body.toString("utf8");
assertIncludes(indexHtml, `<title>${INDEX_TITLE}</title>`, indexUrl);
for (const tool of tools) assertIncludes(indexHtml, `href="${tool.urlPath}"`, indexUrl);
console.log(`index ok (${tools.length} tools listed)`);

// 3. Every tool renders and every same-origin file it references is served.
async function checkAssets(html, pageUrl) {
  for (const url of sameOriginUrls(html, pageUrl)) {
    if (checked.has(url)) continue;
    checked.add(url);
    const response = await get(url);
    if (response.body.byteLength === 0) fail(`${url} is empty`);
    if (isScriptUrl(url)) {
      const type = response.headers["content-type"] ?? "";
      if (!/javascript|ecmascript/i.test(type)) {
        fail(`${url} is served as "${type}"; browsers refuse module scripts without a JavaScript MIME type`);
      }
    }
  }
}

await checkAssets(indexHtml, indexUrl);
for (const tool of tools) {
  const pageUrl = `${site}/${tool.slug}/`;
  const html = (await get(pageUrl)).body.toString("utf8");
  assertIncludes(html, `<title>${tool.title}</title>`, pageUrl);
  await checkAssets(html, pageUrl);
  console.log(`${tool.slug} ok`);
}

console.log(`Smoke test passed: ${tools.length} tools, ${checked.size} files checked at ${site}/`);
