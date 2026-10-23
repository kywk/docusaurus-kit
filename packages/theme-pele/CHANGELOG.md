# docusaurus-theme-pele

## 0.1.2

### Patch Changes

- 64c70d0: Optimize AST traversal in `remark-obsidian-kanban` and `rehype-obsidian-tasks`, move repeated kanban card inline styles into the board stylesheet, and allow `docusaurus-theme-pele` to retry loading the renderer chunk after a transient network error.

## 0.1.1

### Patch Changes

- 48830a8: Document the Docusaurus, React, Node.js, and Pele versions the package is
  tested against.

## 0.1.0

### Minor Changes

- b47cad9: Initial release. Adds a Docusaurus theme that renders `mermaid` fenced code
  blocks with Pele instead of Mermaid:

  - sync, client-side rendering through a lazy `pele` chunk
  - CSS-variable theming mapped to Docusaurus `--ifm-*` tokens, with light/dark
    switching that does not re-render diagrams
  - optional zoom controls via `themeConfig.pele.zoom`
  - a Playwright-checked playground covering the diagram types used by kywk.me
