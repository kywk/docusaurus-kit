import type { Config } from '@docusaurus/types';
import type { AlbumPluginOptions } from 'docusaurus-plugin-album';
import type { PeleThemeConfig } from 'docusaurus-theme-pele';
import { rehypeObsidianTasks } from 'rehype-obsidian-tasks';
import { remarkKanban } from 'remark-obsidian-kanban';

const config: Config = {
  title: 'docusaurus-theme-pele',
  tagline: 'Pele renderer playground',
  url: 'https://example.com',
  baseUrl: '/',
  favicon: 'img/favicon.svg',
  onBrokenLinks: 'throw',

  markdown: {
    format: 'detect',
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['docusaurus-theme-pele'],

  plugins: [
    [
      'docusaurus-plugin-album',
      {
        id: 'album',
        path: 'blog.album',
        routeBasePath: 'album',
      } satisfies AlbumPluginOptions,
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [
            [
              remarkKanban,
              {
                pageResolver: (name: string) => [name.replaceAll(' ', '-').toLowerCase()],
                hrefTemplate: (permalink: string) => `/docs/${permalink}`,
              },
            ],
          ],
          rehypePlugins: [rehypeObsidianTasks],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    pele: {
      zoom: 'auto',
    } satisfies PeleThemeConfig,
    navbar: {
      title: 'theme-pele',
      items: [
        { to: '/docs', label: 'Diagrams', position: 'left' },
        { to: '/album', label: 'Album', position: 'left' },
      ],
    },
    footer: {
      style: 'dark',
      copyright: 'MIT',
    },
  },
};

export default config;
