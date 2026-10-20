# ADR 0001: Publish packages from a standalone monorepo

- Status: accepted
- Date: 2026-10-20

## Context

Several Docusaurus plugins were written inside the kywk.me site repository:
album, Obsidian kanban, Obsidian tasks, slug normalization, and a story map
loader. The site repository is also an Obsidian vault. It holds private notes,
large content assets, and deploys on every content push.

The long-term goal is to publish some of these plugins for other Docusaurus
users, starting with a Pele-based Mermaid renderer.

## Decision

Publish reusable packages from a standalone pnpm monorepo
(`docusaurus-kit`). Keep the site repository as a consumer that installs
published versions.

## Rationale

- **Release cadence**: content edits and package releases should not share a
  branch, CI pipeline, or changelog.
- **Access**: external contributors should not need the private vault to work on
  a package.
- **Build safety**: a package refactor must not be able to break the deployed
  site before a version is intentionally adopted.
- **CI and secrets**: npm publishing credentials stay out of the vault
  repository.
- **Size**: the vault repository is already large and Dropbox-synced; workspace
  tooling and build outputs would make it heavier.

A monorepo (rather than one repository per package) keeps one toolchain, one CI
configuration, and one fixture site for packages that share the Docusaurus
ecosystem. Changesets versions each package independently.

## Consequences

- Cross-repository development needs a link step (`yalc`, a canary release, or
  `npm link`).
- The site must upgrade package versions deliberately.
- Only generalized packages move here. Site-specific behavior stays in the
  site repository.
- `docusaurus-theme-pele` is a package in this monorepo, not a fork of Pele.
  Upstream patches go to `obsidianmd/pele`; a fork is a last resort.
