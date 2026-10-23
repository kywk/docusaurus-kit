---
"docusaurus-plugin-album": patch
---

Compile theme components in `lib/theme` to JavaScript (`.js` + `.d.ts`) so consumer bundlers do not need a TypeScript loader for `node_modules/docusaurus-plugin-album`, while keeping `src/theme/*.tsx` for `getTypeScriptThemePath()`.
