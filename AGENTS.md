# DAGO design

- All DAGO projects follow the existing dago.lt design. Do not invent a separate visual style.
- Use `https://dago.lt/assets/styles/reset.css` and `https://dago.lt/assets/styles/dago.css` as the source of truth. Their source lives in the sibling `dago-homepage/assets/styles/` directory.
- Before changing a page, inspect those styles and the closest existing DAGO page. For tools, use `tools/asmens-kodai/static-site/project.css` and the existing tool markup as references.
- Reuse shared typography, colors, buttons, links, focus states, tables, expandable sections and code blocks. Add local CSS only for the feature's layout and behavior; do not restyle shared components.
- Keep the existing lowercase title and dimmed `// dago` link, tool width and contact layout. Keep copy short and useful.
- Explicit user requests take precedence, including click-to-copy values without hover underlines, no avatars and no extra back link on Testiniai žmonės.
