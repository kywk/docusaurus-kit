# Agent Guide

This repository publishes reusable Docusaurus packages. The kywk.me site is a
separate repository and only consumes published versions.

## Read first

- `README.md` for commands and package rules.
- `docs/adr/` before changing repository boundaries or release tooling.
- The package README before changing a public API.

## Invariants

- Packages must work without the kywk.me vault, its content model, or its
  `site.config.js`.
- Published packages keep wide `peerDependencies`; Docusaurus versions used for
  local testing live in `devDependencies`.
- Theme components are shipped as JSX and copied to `lib/`; do not downlevel
  `import('pele')` to `require()`, or the renderer stops being a lazy chunk.
- `@theme/Mermaid` is resolved by theme order. The last theme wins, and
  `src/theme` in a consumer site wins over every package.
- Never add a build-time remark/rehype dependency to a theme package. A
  Docusaurus plugin cannot inject remark plugins into content plugins.

## Workflow

1. Change one package at a time.
2. Add or update a test under `packages/*/test` or the playground.
3. Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm playground:build`.
4. Add a changeset for every user-visible change: `pnpm changeset`.
5. Update the package README when options, compatibility, or behavior change.

## Releasing

- `main` is always releasable.
- Versions are produced by Changesets; do not edit versions or changelogs by
  hand.
- A package with no changeset must not be published.
