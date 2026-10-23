# docusaurus-kit

A pnpm monorepo for reusable Docusaurus packages maintained by kywk.

The Docusaurus site ([kywk.me](https://kywk.me)) is only a consumer of these
packages. It stays in its own repository so content edits and package releases
never share a release cadence or a history.

## Packages

| Package | Status | Description |
| --- | --- | --- |
| [`docusaurus-theme-pele`](packages/theme-pele) | `0.1.1` | Render Mermaid fences with [Pele](https://pele.run) instead of Mermaid |
| [`docusaurus-plugin-album`](packages/plugin-album) | `0.1.0` | Pinterest-style masonry photo album with timeline scrubber and lightbox |
| [`remark-obsidian-kanban`](packages/remark-obsidian-kanban) | `0.2.1` | Render Obsidian kanban boards in Docusaurus |
| [`rehype-obsidian-tasks`](packages/rehype-obsidian-tasks) | `0.2.1` | Render Obsidian `[-]` / `[/]` task statuses |

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

The Release workflow on `main` opens a version PR; merging it publishes the
unpublished packages.

### First publish

The first version must be published interactively so npm can create the package
and complete 2FA:

```bash
pnpm --filter docusaurus-theme-pele publish --access public
```

npm may stage the upload (visible as a temporary `0.0.0-stage` version) and ask
for browser approval. Approving promotes the real version to `latest`.

### Trusted publishing (CI)

After the first publish, configure trusted publishing on npmjs.com:

1. Open the package → **Settings** → **Trusted publishing**.
2. Add a **GitHub Actions** publisher:
   - Repository: `kywk/docusaurus-kit`
   - Workflow: `release.yml`
   - Environment: none
3. Save.

The Release workflow then publishes through GitHub OIDC with provenance. It
does not use an `NPM_TOKEN` secret and does not prompt maintainers for 2FA.

For a new package, complete its first interactive publish, then register the
trusted publisher once:

```bash
npx npm@12 trust github <package> \
  --repo kywk/docusaurus-kit \
  --file release.yml \
  --allow-publish --allow-stage-publish
```

After that, releases go through the version PR workflow only. Do not run
`pnpm publish` locally for routine releases.

## Design rules

1. A package must be usable without kywk.me content, paths, or configuration.
2. Every package ships a README with a compatibility table and an example.
3. Theme packages must be tested against the fixture site, not just unit tests.
4. `peerDependencies` stay wide; exact Docusaurus versions belong in
   `devDependencies`.
5. Never publish from the site repository.

See [`docs/adr/0001-packages-monorepo.md`](docs/adr/0001-packages-monorepo.md)
for the reasoning behind this repository split.
