# docusaurus-kit

A pnpm monorepo for reusable Docusaurus packages maintained by kywk.

The Docusaurus site ([kywk.me](https://kywk.me)) is only a consumer of these
packages. It stays in its own repository so content edits and package releases
never share a release cadence or a history.

## Packages

| Package | Status | Description |
| --- | --- | --- |
| [`docusaurus-theme-pele`](packages/theme-pele) | initial release (`0.1.0`) | Render Mermaid fences with [Pele](https://pele.run) instead of Mermaid |
| `remark-obsidian-kanban` | planned | Render Obsidian kanban boards in Docusaurus |
| `rehype-obsidian-tasks` | planned | Render Obsidian task syntax |

Only packages that work outside kywk.me belong here. Site-specific policies
(URL slugs, story maps, album import pipelines) stay in the site repository
until they grow a documented, data-agnostic API.

## Layout

```
packages/            published packages
examples/playground  minimal Docusaurus site for end-to-end checks
docs/adr             architecture decisions
```

## Requirements

- Node.js >= 20.19
- pnpm 12.4 (via `corepack`)

```bash
corepack enable pnpm   # once, if pnpm is not on PATH
pnpm install
```

## Commands

```bash
pnpm build              # build every package
pnpm typecheck          # type-check every package
pnpm test               # unit tests (builds the package first)
pnpm check              # Biome format + lint
pnpm playground         # http://localhost:3100
pnpm playground:build   # build the fixture site
pnpm test:e2e           # Playwright against an existing fixture build (system Chrome)
pnpm check:ci           # full local gate
```

## Releasing

Releases use [Changesets](https://github.com/changesets/changesets):

```bash
pnpm changeset          # describe the change
pnpm version-packages   # bump versions and write changelogs
pnpm release            # build and publish to npm
```

The GitHub release workflow opens a version PR on `main`; merging it publishes
the packages. Publishing requires an `NPM_TOKEN` repository secret and npm
provenance is enabled in CI.

## Design rules

1. A package must be usable without kywk.me content, paths, or configuration.
2. Every package ships a README with a compatibility table and an example.
3. Theme packages must be tested against the fixture site, not just unit tests.
4. `peerDependencies` stay wide; exact Docusaurus versions belong in
   `devDependencies`.
5. Never publish from the site repository.

See [`docs/adr/0001-packages-monorepo.md`](docs/adr/0001-packages-monorepo.md)
for the reasoning behind this repository split.
