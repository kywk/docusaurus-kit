# remark-obsidian-kanban

## 0.3.1

### Patch Changes

- 64c70d0: Optimize AST traversal in `remark-obsidian-kanban` and `rehype-obsidian-tasks`, move repeated kanban card inline styles into the board stylesheet, and allow `docusaurus-theme-pele` to retry loading the renderer chunk after a transient network error.

## 0.3.0

### Minor Changes

- 3de8ddb: Detect `#tags` in card titles and content and render them as pills. Each tag gets a stable colour derived from a hash of its name, so the same tag always has the same colour.

## 0.2.1

### Patch Changes

- c8ae624: Document the tested Docusaurus, React, and Node.js versions.

## 0.2.0

### Minor Changes

- Initial releases.

  - `remark-obsidian-kanban` renders Obsidian kanban boards, with optional wiki-link resolution.
  - `rehype-obsidian-tasks` renders `[-]` cancelled and `[/]` in-progress task statuses as GFM task items.
