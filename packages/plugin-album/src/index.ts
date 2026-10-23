import path from 'node:path';
import type {
  BlogContent,
  PluginOptions as BlogPluginOptions,
} from '@docusaurus/plugin-content-blog';
import pluginContentBlog, {
  validateOptions as validateBlogOptions,
} from '@docusaurus/plugin-content-blog';
import type { LoadContext, OptionValidationContext, Plugin, RouteConfig } from '@docusaurus/types';
import type { AlbumFrontMatter, AlbumPluginOptions, AlbumPostMeta } from './types';

export type { AlbumFrontMatter, AlbumPluginOptions, AlbumPostMeta, LightboxImage } from './types';

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const PERMALINK_DATE_REGEX = /\/(\d{4})\/(\d{2})\//;

/**
 * Build-time Rehype plugin that injects `loading="lazy"` and `decoding="async"`
 * into markdown body `<img>` elements so static HTML does not trigger eager
 * preload requests for every photo in an album post.
 */
export function rehypeAlbumLazyImages() {
  function visitNode(node: HastNode | null | undefined): void {
    if (!node || typeof node !== 'object') {
      return;
    }
    if (node.type === 'element' && node.tagName === 'img') {
      node.properties = node.properties ?? {};
      if (!node.properties.loading) {
        node.properties.loading = 'lazy';
      }
      if (!node.properties.decoding) {
        node.properties.decoding = 'async';
      }
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        visitNode(child);
      }
    }
  }

  return (tree: HastNode): void => {
    visitNode(tree);
  };
}

/**
 * Pre-parses year, month, and display label from permalink or post date.
 */
export function parsePostDate(
  permalink: string,
  date: Date | string | undefined,
): { year: string; month: string; displayDate: string } {
  if (typeof permalink === 'string') {
    const permalinkMatch = permalink.match(PERMALINK_DATE_REGEX);
    if (permalinkMatch) {
      const year = permalinkMatch[1];
      const month = String(Number(permalinkMatch[2]));
      return { year, month, displayDate: `${year}年 ${month}月` };
    }
  }

  if (date) {
    const parsed = date instanceof Date ? date : new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      const year = `${parsed.getUTCFullYear()}`;
      const month = `${parsed.getUTCMonth() + 1}`;
      return { year, month, displayDate: `${year}年 ${month}月` };
    }
  }

  return { year: '2026', month: '1', displayDate: '' };
}

export function validateOptions({
  validate,
  options = {},
}: OptionValidationContext<AlbumPluginOptions | undefined, BlogPluginOptions>): BlogPluginOptions {
  const userRehypePlugins = Array.isArray(options.rehypePlugins) ? options.rehypePlugins : [];

  const mergedOptions: AlbumPluginOptions = {
    id: 'album',
    path: 'blog.album',
    routeBasePath: 'album',
    blogTitle: 'Album 相簿',
    blogDescription: '用快門記錄旅途風光與生活剪影，在光影與時間軸中重溫每一刻感動。',
    blogSidebarTitle: 'All albums',
    blogSidebarCount: 'ALL',
    postsPerPage: 'ALL',
    blogListComponent: path.resolve(__dirname, 'theme/AlbumListPage'),
    blogPostComponent: path.resolve(__dirname, 'theme/AlbumPostPage'),
    onUntruncatedBlogPosts: 'ignore',
    showReadingTime: true,
    ...options,
    rehypePlugins: [rehypeAlbumLazyImages, ...userRehypePlugins],
  };

  return validateBlogOptions({ validate, options: mergedOptions });
}

export default async function pluginAlbum(
  context: LoadContext,
  options: BlogPluginOptions,
): Promise<Plugin<BlogContent>> {
  const blogPluginInstance = await pluginContentBlog(context, options);

  return {
    ...blogPluginInstance,
    // Keep blogPluginInstance.name ('docusaurus-plugin-content-blog') because
    // Docusaurus namespaces createData() by plugin.name and @docusaurus/plugin-content-blog
    // hardcodes 'docusaurus-plugin-content-blog' in its MDX loader rules.
    async contentLoaded({ content, actions }) {
      const albumPosts: AlbumPostMeta[] = (content?.blogPosts ?? [])
        .filter((post) => {
          const fm = post?.metadata?.frontMatter as AlbumFrontMatter | undefined;
          return Boolean(fm?.cover);
        })
        .map((post) => {
          const { permalink, title, date } = post.metadata;
          const frontMatter = post.metadata.frontMatter as AlbumFrontMatter;
          const dateStr = date instanceof Date ? date.toISOString() : String(date);
          const { year, month, displayDate } = parsePostDate(permalink, date);
          return {
            permalink,
            title,
            date: dateStr,
            year,
            month,
            displayDate,
            frontMatter: {
              cover: frontMatter.cover,
              cover_caption: frontMatter.cover_caption,
              location: frontMatter.location,
              album_series: frontMatter.album_series,
              tags: Array.isArray(frontMatter.tags) ? (frontMatter.tags as string[]) : undefined,
            },
          };
        });

      const wrappedActions = {
        ...actions,
        addRoute(routeConfig: RouteConfig) {
          const isAlbumListRoute =
            routeConfig.component === options.blogListComponent ||
            (typeof routeConfig.component === 'string' &&
              routeConfig.component.endsWith('AlbumListPage'));

          if (isAlbumListRoute) {
            actions.addRoute({
              ...routeConfig,
              modules: {},
              props: {
                ...routeConfig.props,
                posts: albumPosts,
              },
            });
            return;
          }

          actions.addRoute(routeConfig);
        },
      };

      if (blogPluginInstance.contentLoaded) {
        await blogPluginInstance.contentLoaded({
          content,
          actions: wrappedActions,
        });
      }
    },

    getThemePath() {
      return path.resolve(__dirname, 'theme');
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, '../src/theme');
    },
  };
}

Object.assign(pluginAlbum, { validateOptions });
