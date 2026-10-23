import type { BlogSidebar } from '@docusaurus/plugin-content-blog';
import { BlogPostProvider, useBlogPost } from '@docusaurus/plugin-content-blog/client';
import { HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogPostItem from '@theme/BlogPostItem';
import type { Props } from '@theme/BlogPostPage';
import BlogPostPageMetadata from '@theme/BlogPostPage/Metadata';
import BlogPostPageStructuredData from '@theme/BlogPostPage/StructuredData';
import BlogPostPaginator from '@theme/BlogPostPaginator';
import ContentVisibility from '@theme/ContentVisibility';
import TOC from '@theme/TOC';
import clsx from 'clsx';
import type React from 'react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import type { AlbumFrontMatter } from '../types';
import AlbumHeroHeader from './AlbumHeroHeader';
import ImageLightbox, { type LightboxImage } from './ImageLightbox';
import styles from './styles.module.css';

function AlbumPostPageContent({
  sidebar,
  children,
}: {
  sidebar: BlogSidebar;
  children: ReactNode;
}): ReactNode {
  const { metadata, toc } = useBlogPost();
  const { nextItem, prevItem, frontMatter, title, date, permalink } = metadata;
  const {
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
    cover,
    cover_caption: coverCaption,
    location,
    album_series: albumSeries,
  } = frontMatter as AlbumFrontMatter;

  // Lightbox state & image collection
  const articleRef = useRef<HTMLDivElement>(null);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!articleRef.current || !permalink) {
      return;
    }

    const collectedImages: LightboxImage[] = [];

    // 1. Add cover image first if available
    if (cover) {
      collectedImages.push({
        src: cover,
        alt: title,
        caption: coverCaption,
      });
    }

    // 2. Collect all images in the markdown body (strictly exclude author avatars and header elements)
    const domImages = articleRef.current.querySelectorAll<HTMLImageElement>(
      '.markdown img, [class*="markdown"] img',
    );
    const candidateImages =
      domImages.length > 0
        ? Array.from(domImages)
        : Array.from(articleRef.current.querySelectorAll<HTMLImageElement>('img')).filter(
            (img) =>
              !img.closest('.avatar') &&
              !img.classList.contains('avatar__photo') &&
              !img.closest('header'),
          );

    for (const img of candidateImages) {
      if (
        img.closest('.avatar') ||
        img.classList.contains('avatar__photo') ||
        img.closest('header')
      ) {
        continue;
      }

      if (!img.getAttribute('loading')) {
        img.loading = 'lazy';
      }
      if (!img.getAttribute('decoding')) {
        img.decoding = 'async';
      }

      if (img.src !== cover) {
        const imageIndex = collectedImages.length;
        collectedImages.push({
          src: img.src,
          alt: img.alt,
          caption: img.title || img.alt,
        });
        img.dataset.lightboxIndex = String(imageIndex);
      } else {
        img.dataset.lightboxIndex = '0';
      }
    }

    setLightboxImages(collectedImages);
  }, [cover, coverCaption, title, permalink]);

  // Event delegation on article container instead of per-image onclick closures
  const handleArticleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement | null)?.closest?.(
      'img[data-lightbox-index]',
    ) as HTMLImageElement | null;
    if (!target) {
      return;
    }

    const idx = Number(target.dataset.lightboxIndex);
    if (!Number.isNaN(idx)) {
      setLightboxIndex(idx);
      setLightboxOpen(true);
    }
  }, []);

  const handleOpenCoverLightbox = useCallback(() => {
    if (cover) {
      setLightboxIndex(0);
      setLightboxOpen(true);
    }
  }, [cover]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  return (
    <BlogLayout
      sidebar={sidebar}
      toc={
        !hideTableOfContents && toc.length > 0 ? (
          <TOC
            toc={toc}
            minHeadingLevel={tocMinHeadingLevel}
            maxHeadingLevel={tocMaxHeadingLevel}
          />
        ) : undefined
      }
    >
      <ContentVisibility metadata={metadata} />

      {/* Album Hero Header */}
      <AlbumHeroHeader
        title={title}
        date={date}
        cover={cover}
        coverCaption={coverCaption}
        location={location}
        albumSeries={albumSeries}
        onCoverClick={handleOpenCoverLightbox}
      />

      {/* Main article content with lazy-loading and zoomable images */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: delegated click handler for markdown images */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: delegated click handler for markdown images */}
      <div
        ref={articleRef}
        className={clsx('album-post-article', styles.albumPostArticle)}
        onClick={handleArticleClick}
      >
        <BlogPostItem>{children}</BlogPostItem>
      </div>

      {/* Paginator */}
      {(nextItem || prevItem) && <BlogPostPaginator nextItem={nextItem} prevItem={prevItem} />}

      {/* Full-screen Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        onIndexChange={setLightboxIndex}
      />
    </BlogLayout>
  );
}

export default function AlbumPostPage(props: Props): ReactNode {
  const BlogPostContent = props.content;
  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <HtmlClassNameProvider
        className={clsx(
          ThemeClassNames.wrapper.blogPages,
          ThemeClassNames.page.blogPostPage,
          'album-post-page',
        )}
      >
        <BlogPostPageMetadata />
        <BlogPostPageStructuredData />
        <AlbumPostPageContent sidebar={props.sidebar}>
          <BlogPostContent />
        </AlbumPostPageContent>
      </HtmlClassNameProvider>
    </BlogPostProvider>
  );
}
