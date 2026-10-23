import type { Options as BlogOptions } from '@docusaurus/plugin-content-blog';

export type AlbumFrontMatter = {
  cover?: string;
  cover_caption?: string;
  location?: string;
  album_series?: string;
  tags?: string[];
  hide_table_of_contents?: boolean;
  toc_min_heading_level?: number;
  toc_max_heading_level?: number;
  [key: string]: unknown;
};

export type AlbumPostMeta = {
  permalink: string;
  title: string;
  date: string;
  year?: string;
  month?: string;
  displayDate?: string;
  frontMatter: AlbumFrontMatter;
};

export type LightboxImage = {
  src: string;
  alt?: string;
  caption?: string;
};

export type AlbumPluginOptions = BlogOptions;
