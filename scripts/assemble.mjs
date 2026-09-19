// Assembles _deploy/: every tool's build/ under its slug, the generated
// /irankiai/ index page, the shared site/ files and the BUILD stamp.
import { execFileSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { deployDir, escapeHtml, loadTools, repoRoot, siteDir } from "./lib/tools.mjs";

const TOOLS_PLACEHOLDER = "<!-- TOOLS -->";

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

function buildStamp() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "local";
  }
}

function renderToolList(tools) {
  const items = tools.map(
    (tool) => `            <li class="tool-card">
                <h2><a href="${escapeHtml(tool.urlPath)}">${escapeHtml(tool.name)}</a></h2>
                <p>${escapeHtml(tool.description)}</p>
            </li>`,
  );
  return `<ul class="tool-list">\n${items.join("\n")}\n        </ul>`;
}

const tools = await loadTools();

await rm(deployDir, { recursive: true, force: true });
await mkdir(deployDir, { recursive: true });

for (const tool of tools) {
  for (const required of ["index.html", ".htaccess"]) {
    if (!(await exists(path.join(tool.buildDir, required)))) {
      throw new Error(
        `tools/${tool.slug}: build output is missing ${required}. ` +
          `Run "npm run build -w tools/${tool.slug}" and make sure the build ships a .htaccess.`,
      );
    }
  }
  await cp(tool.buildDir, path.join(deployDir, tool.slug), { recursive: true });
}

// Shared site files: everything in site/ except the index template.
for (const entry of await readdir(siteDir, { withFileTypes: true })) {
  if (entry.name === "index.html") continue;
  await cp(path.join(siteDir, entry.name), path.join(deployDir, entry.name), { recursive: true });
}

const template = await readFile(path.join(siteDir, "index.html"), "utf8");
if (!template.includes(TOOLS_PLACEHOLDER)) {
  throw new Error(`site/index.html must contain the ${TOOLS_PLACEHOLDER} placeholder`);
}
await writeFile(path.join(deployDir, "index.html"), template.replace(TOOLS_PLACEHOLDER, renderToolList(tools)));

const stamp = buildStamp();
await writeFile(path.join(deployDir, "BUILD"), `${stamp}\n`);

console.log(`assembled _deploy/ (BUILD=${stamp})`);
for (const tool of tools) console.log(`  ${tool.urlPath}  <- tools/${tool.slug}/${path.basename(tool.buildDir)}/`);
