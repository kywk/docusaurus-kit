import path from 'node:path';
import type { Plugin } from '@docusaurus/types';

export type { PeleThemeConfig } from './types';

/**
 * Docusaurus theme that replaces `@theme/Mermaid` with a Pele renderer.
 *
 * Consumers should also set `markdown.mermaid: true` so that Docusaurus
 * transforms ```mermaid fences into the `<Mermaid value="...">` component.
 */
export default function themePele(): Plugin {
  return {
    name: 'docusaurus-theme-pele',

    getThemePath() {
      return path.resolve(__dirname, 'theme');
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, '../src/theme');
    },

    getClientModules() {
      return [path.resolve(__dirname, 'client/index.js')];
    },
  };
}
