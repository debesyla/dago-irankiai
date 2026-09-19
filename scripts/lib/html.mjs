// Finds the URLs a page depends on: src/href attributes, og/twitter images,
// and static ES module imports inside inline scripts.
const ATTRIBUTE_PATTERN = /\b(?:src|href)\s*=\s*"([^"]+)"/g;
const META_CONTENT_PATTERN = /<meta\b[^>]*\b(?:property|name)\s*=\s*"(?:og|twitter):image"[^>]*\bcontent\s*=\s*"([^"]+)"/g;
const IMPORT_PATTERN = /\bimport\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;

const SKIP_SCHEMES = /^(?:#|mailto:|tel:|data:|javascript:)/i;

/** Returns every distinct reference found in the HTML, unresolved. */
export function extractReferences(html) {
  const found = new Set();
  for (const pattern of [ATTRIBUTE_PATTERN, META_CONTENT_PATTERN, IMPORT_PATTERN]) {
    for (const match of html.matchAll(pattern)) {
      const value = match[1].trim();
      if (value === "" || SKIP_SCHEMES.test(value)) continue;
      found.add(value);
    }
  }
  return [...found];
}

/**
 * Resolves references against the page URL and keeps only the ones on the
 * same origin (external links are somebody else's uptime).
 */
export function sameOriginUrls(html, pageUrl) {
  const page = new URL(pageUrl);
  const urls = new Set();
  for (const reference of extractReferences(html)) {
    let resolved;
    try {
      resolved = new URL(reference, page);
    } catch {
      continue;
    }
    if (resolved.origin !== page.origin) continue;
    resolved.hash = "";
    urls.add(resolved.href);
  }
  return [...urls];
}

export function isScriptUrl(url) {
  return /\.m?js(?:\?|$)/i.test(url);
}
