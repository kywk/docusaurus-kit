# docusaurus-plugin-album

## 0.1.1

### Patch Changes

- 0c379ac: Compile theme components in `lib/theme` to JavaScript (`.js` + `.d.ts`) so consumer bundlers do not need a TypeScript loader for `node_modules/docusaurus-plugin-album`, while keeping `src/theme/*.tsx` for `getTypeScriptThemePath()`.

## 0.1.0

### Minor Changes

- 4fa6e18: Initial release of `docusaurus-plugin-album`:

  - Pinterest-style responsive masonry grid with hover overlays and above-the-fold LCP prioritization
  - Google Photos timeline scrubber with O(log N) binary search scroll tracking and cross-year jump support
  - Immersive post hero header with location and album series badges
  - Zero-dependency full-screen image lightbox with keyboard navigation and adjacent photo preloading
  - Build-time rehype lazy image injection and lightweight route props for fast album index loading
