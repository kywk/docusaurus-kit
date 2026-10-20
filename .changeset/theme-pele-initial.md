---
"docusaurus-theme-pele": minor
---

Initial release. Adds a Docusaurus theme that renders `mermaid` fenced code
blocks with Pele instead of Mermaid:

- sync, client-side rendering through a lazy `pele` chunk
- CSS-variable theming mapped to Docusaurus `--ifm-*` tokens, with light/dark
  switching that does not re-render diagrams
- optional zoom controls via `themeConfig.pele.zoom`
- a Playwright-checked playground covering the diagram types used by kywk.me
