import Link from '@docusaurus/Link';
import type React from 'react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { AlbumPostMeta } from '../types';
import styles from './styles.module.css';

export type { AlbumPostMeta } from '../types';

type Props = {
  posts: AlbumPostMeta[];
  onCurrentDateChange?: (year: string, month: string) => void;
  onScrubberVisibleChange?: (visible: boolean) => void;
  scrollToYearRef?: React.MutableRefObject<((year: string) => void) | null>;
};

const BATCH_SIZE = 12;

export function parseDate(post: AlbumPostMeta): {
  year: string;
  month: string;
  displayDate: string;
} {
  if (post.year && post.month) {
    return {
      year: post.year,
      month: post.month,
      displayDate: post.displayDate ?? `${post.year}年 ${post.month}月`,
    };
  }

  const permalinkMatch = post.permalink.match(/\/(\d{4})\/(\d{2})\//);
  if (permalinkMatch) {
    const year = permalinkMatch[1];
    const month = String(Number(permalinkMatch[2]));
    return { year, month, displayDate: `${year}年 ${month}月` };
  }

  if (post.date) {
    const parsed = new Date(post.date);
    if (!Number.isNaN(parsed.getTime())) {
      const year = `${parsed.getUTCFullYear()}`;
      const month = `${parsed.getUTCMonth() + 1}`;
      return { year, month, displayDate: `${year}年 ${month}月` };
    }
  }

  return { year: '2026', month: '1', displayDate: '' };
}

function AlbumMasonryGrid({
  posts,
  onCurrentDateChange,
  onScrubberVisibleChange,
  scrollToYearRef,
}: Props) {
  // 1. Filter out posts without cover and pre-normalize date metadata once
  const validPosts = useMemo(() => {
    return posts
      .filter((p) => Boolean(p.frontMatter?.cover))
      .map((p) => {
        if (p.year && p.month && p.displayDate !== undefined) {
          return p;
        }
        const { year, month, displayDate } = parseDate(p);
        return { ...p, year, month, displayDate };
      });
  }, [posts]);

  // 2. Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingScrollYearRef = useRef<string | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= validPosts.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, validPosts.length));
        }
      },
      { rootMargin: '350px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [validPosts.length, visibleCount]);

  // Handle year jump from TimelineScrubber (auto-expands visibleCount if target year is not yet rendered)
  useEffect(() => {
    if (!scrollToYearRef) {
      return;
    }

    scrollToYearRef.current = (year: string) => {
      const targetIdx = validPosts.findIndex((p) => p.year === year);
      if (targetIdx === -1) {
        return;
      }

      const targetPost = validPosts[targetIdx];
      onCurrentDateChange?.(targetPost.year || year, targetPost.month || '');

      if (targetIdx < visibleCount) {
        const targetCard = gridRef.current?.querySelector<HTMLElement>(`[data-year="${year}"]`);
        targetCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        pendingScrollYearRef.current = year;
        setVisibleCount((prev) =>
          Math.min(validPosts.length, Math.max(prev, targetIdx + BATCH_SIZE)),
        );
      }
    };

    return () => {
      scrollToYearRef.current = null;
    };
  }, [validPosts, visibleCount, onCurrentDateChange, scrollToYearRef]);

  useEffect(() => {
    if (visibleCount === 0) {
      return;
    }
    const pendingYear = pendingScrollYearRef.current;
    if (!pendingYear) {
      return;
    }

    const targetCard = gridRef.current?.querySelector<HTMLElement>(`[data-year="${pendingYear}"]`);
    if (targetCard) {
      pendingScrollYearRef.current = null;
      requestAnimationFrame(() => {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [visibleCount]);

  // 3. Responsive column count calculation via matchMedia breakpoints
  const [columnCount, setColumnCount] = useState(4);
  useEffect(() => {
    const mq1200 = window.matchMedia('(min-width: 1200px)');
    const mq850 = window.matchMedia('(min-width: 850px)');
    const mq560 = window.matchMedia('(min-width: 560px)');

    const updateCols = () => {
      if (mq1200.matches) {
        setColumnCount(4);
      } else if (mq850.matches) {
        setColumnCount(3);
      } else if (mq560.matches) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    };

    updateCols();
    mq1200.addEventListener('change', updateCols);
    mq850.addEventListener('change', updateCols);
    mq560.addEventListener('change', updateCols);

    return () => {
      mq1200.removeEventListener('change', updateCols);
      mq850.removeEventListener('change', updateCols);
      mq560.removeEventListener('change', updateCols);
    };
  }, []);

  // 4. Distribute visible items into columns round-robin
  const currentPosts = useMemo(() => {
    return validPosts.slice(0, visibleCount);
  }, [validPosts, visibleCount]);

  const columns = useMemo(() => {
    const cols: AlbumPostMeta[][] = Array.from({ length: columnCount }, () => []);
    currentPosts.forEach((post, idx) => {
      cols[idx % columnCount].push(post);
    });
    return cols;
  }, [currentPosts, columnCount]);

  // 5. Unified scroll listener using per-column O(log N) binary search
  const lastReportedRef = useRef<{ year: string; month: string; visible: boolean }>({
    year: '',
    month: '',
    visible: false,
  });

  useEffect(() => {
    if (!onCurrentDateChange && !onScrubberVisibleChange) {
      return;
    }

    let ticking = false;
    const evaluateScroll = () => {
      const isVisible = window.scrollY > 120;
      if (onScrubberVisibleChange && isVisible !== lastReportedRef.current.visible) {
        lastReportedRef.current.visible = isVisible;
        onScrubberVisibleChange(isVisible);
      }

      if (onCurrentDateChange && gridRef.current && currentPosts.length > 0 && columnCount > 0) {
        const colElements = gridRef.current.children;
        const viewportCenter = window.innerHeight * 0.35;
        let bestCard: HTMLElement | null = null;
        let minDistance = Number.POSITIVE_INFINITY;

        // Within each column, cards are ordered top-to-bottom monotonically, enabling binary search
        for (let c = 0; c < colElements.length; c += 1) {
          const cards = colElements[c].children;
          let low = 0;
          let high = cards.length - 1;

          while (low <= high) {
            const mid = (low + high) >> 1;
            const card = cards[mid] as HTMLElement;
            const top = card.getBoundingClientRect().top;
            const distance = Math.abs(top - viewportCenter);

            if (distance < minDistance) {
              minDistance = distance;
              bestCard = card;
            }

            if (top < viewportCenter) {
              low = mid + 1;
            } else {
              high = mid - 1;
            }
          }
        }

        if (bestCard) {
          const year = bestCard.dataset.year || '';
          const month = bestCard.dataset.month || '';
          if (
            year &&
            (year !== lastReportedRef.current.year || month !== lastReportedRef.current.month)
          ) {
            lastReportedRef.current.year = year;
            lastReportedRef.current.month = month;
            onCurrentDateChange(year, month);
          }
        }
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(evaluateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    evaluateScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPosts.length, columnCount, onCurrentDateChange, onScrubberVisibleChange]);

  if (validPosts.length === 0) {
    return (
      <div className={styles.endMessage}>
        <p>目前尚無相簿文章，請新增帶有 cover 封面的相簿 Markdown 筆記。</p>
      </div>
    );
  }

  return (
    <div className={styles.masonryWrapper}>
      <div ref={gridRef} className={styles.masonryGrid}>
        {columns.map((colPosts, colIdx) => (
          <div key={`col-${colPosts[0]?.permalink ?? colIdx}`} className={styles.masonryColumn}>
            {colPosts.map((post, rowIdx) => {
              const isAboveFold = rowIdx === 0;
              return (
                <Link
                  key={post.permalink}
                  to={post.permalink}
                  className={styles.albumCard}
                  data-album-card="true"
                  data-year={post.year}
                  data-month={post.month}
                >
                  <div className={styles.cardImageWrapper}>
                    <img
                      src={post.frontMatter.cover}
                      alt={post.title}
                      className={styles.cardImage}
                      loading={isAboveFold ? 'eager' : 'lazy'}
                      fetchPriority={isAboveFold && colIdx === 0 ? 'high' : undefined}
                      decoding="async"
                    />

                    {/* Pinterest Style Hover Overlay */}
                    <div className={styles.cardOverlay}>
                      <div className={styles.cardOverlayContent}>
                        <h2 className={styles.cardTitle}>{post.title}</h2>

                        <div className={styles.cardMetaRow}>
                          {post.frontMatter.location && (
                            <span className={styles.pillBadge} title="拍攝地點">
                              📍 {post.frontMatter.location}
                            </span>
                          )}
                          {post.frontMatter.album_series && (
                            <span
                              className={`${styles.pillBadge} ${styles.seriesBadge}`}
                              title="相簿系列"
                            >
                              📁 {post.frontMatter.album_series}
                            </span>
                          )}
                          <span className={styles.cardDate}>{post.displayDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {visibleCount < validPosts.length && <div ref={sentinelRef} className={styles.sentinel} />}

      {visibleCount >= validPosts.length && (
        <div className={styles.endMessage}>
          <span>✨ 已經瀏覽完所有相簿囉 ✨</span>
        </div>
      )}
    </div>
  );
}

export default memo(AlbumMasonryGrid);
