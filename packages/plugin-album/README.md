# docusaurus-plugin-album

Pinterest-style masonry photo album plugin for [Docusaurus](https://docusaurus.io) with a Google Photos timeline scrubber, immersive hero header, and zero-dependency full-screen lightbox.

- **Pinterest Masonry Grid**: Responsive multi-column layout with hover overlays for titles, locations, and series badges.
- **Google Photos Timeline Scrubber**: Floating year/month indicator on scroll with one-click smooth jumping across years.
- **Immersive Post Hero Header**: Full-width cover image, caption, location badge (`📍`), and album series badge (`📁`).
- **Zero-Dependency Lightbox**: Keyboard navigation (`←` / `→` / `Escape`), background preload of adjacent photos, scroll locking, and automatic author avatar exclusion.
- **Drop-In Blog Wrapper**: Wraps `@docusaurus/plugin-content-blog` with build-time lazy image injection and lightweight route props for fast page loads even with hundreds of albums.

## Requirements

| Dependency | Version |
| --- | --- |
| Docusaurus | 3.8 or newer (tested with 3.10) |
| React | 18 or 19 (tested with 19.2) |
| Node.js | 20.19 or newer |

## Install

```bash
npm install docusaurus-plugin-album
```

## Usage

Register `docusaurus-plugin-album` in `docusaurus.config.ts`:

```ts
// docusaurus.config.ts
import type { Config } from '@docusaurus/types';
import type { AlbumPluginOptions } from 'docusaurus-plugin-album';

const config: Config = {
  // ...
  plugins: [
    [
      'docusaurus-plugin-album',
      {
        id: 'album',
        path: 'blog.album',
        routeBasePath: 'album',
        blogTitle: 'Photo Album',
        blogDescription: 'Travel and photography archive.',
      } satisfies AlbumPluginOptions,
    ],
  ],
};

export default config;
```

## Album Post Frontmatter

Create Markdown files under your configured `path` (default: `blog.album/`):

```markdown
---
title: Autumn in Hokkaido Biei
date: 2025-09-05
cover: /img/album/biei-cover.jpg
cover_caption: Morning light over the Blue Pond in Biei
location: Biei, Hokkaido
album_series: 2025 Northern Autumn
tags:
  - Japan
  - Photography
---

Introductory notes for the album...

<!--truncate-->

![Blue Pond Panorama](/img/album/biei-01.jpg)

![White Birch Reflections](/img/album/biei-02.jpg)
```

### Supported Frontmatter Fields

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | Album title |
| `date` | `string \| Date` | Album date (`YYYY-MM-DD`) |
| `cover` | `string` | Cover image URL. Posts without `cover` are hidden from the masonry index |
| `cover_caption` | `string` | Optional caption displayed over the hero cover image |
| `location` | `string` | Optional location badge (`📍`) |
| `album_series` | `string` | Optional series/collection badge (`📁`) |
| `tags` | `string[]` | Standard Docusaurus blog tags |

All standard [`@docusaurus/plugin-content-blog` options](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog) are supported.

## Development

```bash
pnpm install
pnpm --filter docusaurus-plugin-album build
pnpm --filter docusaurus-plugin-album test
pnpm playground
```

## License

MIT
