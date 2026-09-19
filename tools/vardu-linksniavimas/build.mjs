// Static site: copy the page, its ES modules and the Apache config into build/.
import { cp, mkdir, rm } from "node:fs/promises";

const root = new URL("./", import.meta.url);
const out = new URL("./build/", import.meta.url);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const entry of ["index.html", ".htaccess", "src/"]) {
  await cp(new URL(entry, root), new URL(entry, out), { recursive: true });
}

console.log("vardu-linksniavimas: build/ ready");
