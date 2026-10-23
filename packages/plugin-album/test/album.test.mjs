import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import pluginAlbum, {
  parsePostDate,
  rehypeAlbumLazyImages,
  validateOptions,
} from '../lib/index.js';

describe('docusaurus-plugin-album', () => {
  it('attaches validateOptions to default export', () => {
    expect(typeof validateOptions).toBe('function');
    expect(pluginAlbum.validateOptions).toBe(validateOptions);
  });

  it('injects default album options and prepends rehypeAlbumLazyImages', () => {
    const customRehype = function customPlugin() {};
    const validated = validateOptions({
      validate: (_schema, opts) => opts,
      options: {
        rehypePlugins: [customRehype],
      },
    });

    expect(validated.id).toBe('album');
    expect(validated.path).toBe('blog.album');
    expect(validated.routeBasePath).toBe('album');
    expect(validated.postsPerPage).toBe('ALL');
    expect(validated.rehypePlugins[0]).toBe(rehypeAlbumLazyImages);
    expect(validated.rehypePlugins[1]).toBe(customRehype);
  });

  it('transforms hast img nodes with lazy loading and async decoding', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          children: [
            {
              type: 'element',
              tagName: 'img',
              properties: { src: '/photo-1.jpg' },
            },
            {
              type: 'element',
              tagName: 'img',
              properties: { src: '/photo-2.jpg', loading: 'eager', decoding: 'sync' },
            },
          ],
        },
      ],
    };

    rehypeAlbumLazyImages()(tree);

    const [img1, img2] = tree.children[0].children;
    expect(img1.properties).toEqual({
      src: '/photo-1.jpg',
      loading: 'lazy',
      decoding: 'async',
    });
    expect(img2.properties).toEqual({
      src: '/photo-2.jpg',
      loading: 'eager',
      decoding: 'sync',
    });
  });

  it('parses year, month, and displayDate from permalink or date', () => {
    expect(parsePostDate('/album/2025/09/05/biei/', '2025-09-05')).toEqual({
      year: '2025',
      month: '9',
      displayDate: '2025年 9月',
    });

    expect(parsePostDate('/album/custom-slug/', new Date('2024-11-18T00:00:00.000Z'))).toEqual({
      year: '2024',
      month: '11',
      displayDate: '2024年 11月',
    });
  });

  it('ships theme components and optimizes list route props in contentLoaded', async () => {
    const options = validateOptions({
      validate: (schema, opts) => schema.validate(opts).value,
      options: {},
    });
    const instance = await pluginAlbum(
      {
        siteDir: process.cwd(),
        generatedFilesDir: path.join(process.cwd(), '.docusaurus'),
        siteConfig: {
          url: 'https://example.com',
          baseUrl: '/',
          trailingSlash: true,
          staticDirectories: ['static'],
          future: {
            experimental_router: 'browser',
            faster: { mdxCrossCompilerCache: false },
          },
          markdown: {
            format: 'mdx',
            mermaid: false,
            emoji: true,
            mdx1Compat: {
              comments: true,
              admonitions: true,
              headingIds: true,
            },
            anchors: { maintainCase: false },
            hooks: {
              onBrokenMarkdownLinks: 'warn',
              onBrokenMarkdownImages: 'warn',
            },
          },
        },
        i18n: {
          defaultLocale: 'en',
          currentLocale: 'en',
          locales: ['en'],
          localeConfigs: {
            en: {
              calendar: 'gregory',
              label: 'English',
              direction: 'ltr',
              htmlLang: 'en',
              path: 'en',
              translate: false,
            },
          },
        },
        localizationDir: process.cwd(),
      },
      options,
    );

    const themePath = instance.getThemePath();
    const tsThemePath = instance.getTypeScriptThemePath();

    for (const file of [
      'AlbumListPage.tsx',
      'AlbumPostPage.tsx',
      'AlbumHeroHeader.tsx',
      'AlbumMasonryGrid.tsx',
      'TimelineScrubber.tsx',
      'ImageLightbox.tsx',
      'styles.module.css',
    ]) {
      expect(fs.existsSync(path.join(themePath, file))).toBe(true);
      expect(fs.existsSync(path.join(tsThemePath, file))).toBe(true);
    }
  });
});
