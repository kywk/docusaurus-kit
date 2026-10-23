import { PageMetadata } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import { useCallback, useMemo, useRef, useState } from 'react';
import AlbumMasonryGrid, { type AlbumPostMeta, parseDate } from './AlbumMasonryGrid';
import styles from './styles.module.css';
import TimelineScrubber from './TimelineScrubber';

type Props = {
  metadata: {
    blogTitle: string;
    blogDescription: string;
    permalink: string;
    [key: string]: unknown;
  };
  posts?: readonly AlbumPostMeta[];
  items?: readonly {
    content: {
      metadata: AlbumPostMeta;
    };
  }[];
  sidebar?: unknown;
};

const DEFAULT_TITLE = 'Album 相簿';
const DEFAULT_DESCRIPTION = '用快門記錄旅途風光與生活剪影，在光影與時間軸中重溫每一刻感動。';

export default function AlbumListPage(props: Props) {
  const { metadata, posts: directPosts, items } = props;
  const pageTitle = metadata.blogTitle || DEFAULT_TITLE;
  const pageDescription = metadata.blogDescription || DEFAULT_DESCRIPTION;

  const posts: AlbumPostMeta[] = useMemo(() => {
    if (directPosts) {
      return [...directPosts];
    }
    return (items ?? []).map(({ content }) => content.metadata);
  }, [directPosts, items]);

  // Extract unique years for TimelineScrubber in descending order
  const years = useMemo(() => {
    const yearSet = new Set<string>();
    for (const post of posts) {
      if (post.frontMatter?.cover) {
        const year = post.year || parseDate(post).year;
        if (year) {
          yearSet.add(year);
        }
      }
    }
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
  }, [posts]);

  const [activeYear, setActiveYear] = useState<string>(() => years[0] || '2026');
  const [activeMonth, setActiveMonth] = useState<string>('');
  const [scrubberVisible, setScrubberVisible] = useState(false);
  const scrollToYearRef = useRef<((year: string) => void) | null>(null);

  const handleCurrentDateChange = useCallback((year: string, month: string) => {
    setActiveYear(year);
    setActiveMonth(month);
  }, []);

  const handleScrubberVisibleChange = useCallback((visible: boolean) => {
    setScrubberVisible(visible);
  }, []);

  const handleSelectYear = useCallback((year: string) => {
    if (scrollToYearRef.current) {
      scrollToYearRef.current(year);
      return;
    }
    const targetCard = document.querySelector<HTMLElement>(`[data-year="${year}"]`);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <PageMetadata title={pageTitle} description={pageDescription} />
      <SearchMetadata tag="blog_posts_list" />

      <main className={styles.albumContainer}>
        <header className={styles.albumHeader}>
          <h1 className={styles.albumTitle}>{pageTitle}</h1>
          <p className={styles.albumDescription}>{pageDescription}</p>
        </header>

        <AlbumMasonryGrid
          posts={posts}
          onCurrentDateChange={handleCurrentDateChange}
          onScrubberVisibleChange={handleScrubberVisibleChange}
          scrollToYearRef={scrollToYearRef}
        />

        <TimelineScrubber
          years={years}
          activeYear={activeYear}
          activeMonth={activeMonth}
          visible={scrubberVisible}
          onSelectYear={handleSelectYear}
        />
      </main>
    </Layout>
  );
}
