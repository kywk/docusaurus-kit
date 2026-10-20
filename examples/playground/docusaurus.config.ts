import type { Config } from '@docusaurus/types';
import type { PeleThemeConfig } from 'docusaurus-theme-pele';

const config: Config = {
  title: 'docusaurus-theme-pele',
  tagline: 'Pele renderer playground',
  url: 'https://example.com',
  baseUrl: '/',
  favicon: 'img/favicon.svg',
  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['docusaurus-theme-pele'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
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
      items: [{ to: '/docs', label: 'Diagrams', position: 'left' }],
    },
    footer: {
      style: 'dark',
      copyright: 'MIT',
    },
  },
};

export default config;
