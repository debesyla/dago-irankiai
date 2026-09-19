// Shared helpers: repository paths and the per-tool manifest contract.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
export const toolsDir = path.join(repoRoot, "tools");
export const siteDir = path.join(repoRoot, "site");
export const deployDir = path.join(repoRoot, "_deploy");

/** URL path prefix under which every tool is published. */
export const BASE_PATH = "/irankiai/";

export const INDEX_TITLE = "Įrankiai // dago";

const REQUIRED = ["slug", "name", "title", "description"];
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Reads tools/<dir>/tool.json for every tool directory, validates it and
 * returns the manifests sorted by name (Lithuanian collation).
 */
export async function loadTools() {
  const entries = await readdir(toolsDir, { withFileTypes: true });
  const tools = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const manifestPath = path.join(toolsDir, entry.name, "tool.json");
    let raw;
    try {
      raw = await readFile(manifestPath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`tools/${entry.name} has no tool.json; every tool directory needs a manifest`);
      }
      throw error;
    }

    const manifest = JSON.parse(raw);
    for (const key of REQUIRED) {
      if (typeof manifest[key] !== "string" || manifest[key].trim() === "") {
        throw new Error(`tools/${entry.name}/tool.json: "${key}" must be a non-empty string`);
      }
    }
    if (manifest.slug !== entry.name) {
      throw new Error(`tools/${entry.name}/tool.json: slug "${manifest.slug}" must match the directory name`);
    }
    if (!SLUG_PATTERN.test(manifest.slug)) {
      throw new Error(`tools/${entry.name}/tool.json: slug must be lowercase letters, digits and single hyphens`);
    }

    const dir = path.join(toolsDir, entry.name);
    tools.push({
      ...manifest,
      dir,
      buildDir: path.join(dir, manifest.build ?? "build"),
      urlPath: `${BASE_PATH}${manifest.slug}/`,
    });
  }

  if (tools.length === 0) throw new Error("no tools found under tools/");
  return tools.sort((a, b) => a.name.localeCompare(b.name, "lt"));
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
