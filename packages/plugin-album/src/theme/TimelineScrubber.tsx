import clsx from 'clsx';
import { memo } from 'react';
import styles from './styles.module.css';

type Props = {
  years: string[];
  activeYear: string;
  activeMonth: string;
  visible: boolean;
  onSelectYear: (year: string) => void;
};

function TimelineScrubber({ years, activeYear, activeMonth, visible, onSelectYear }: Props) {
  if (years.length === 0) {
    return null;
  }

  return (
    <nav
      className={clsx(styles.scrubberContainer, visible && styles.scrubberVisible)}
      aria-label="相簿時間軸"
    >
      {/* Floating active date bubble */}
      <div className={styles.timelineBubble} aria-live="polite">
        {activeYear ? `${activeYear}年 ${activeMonth ? `${activeMonth}月` : ''}` : '探索相簿'}
      </div>

      {/* Rail with clickable year ticks */}
      <div className={styles.timelineRail}>
        {years.map((year) => (
          <button
            key={year}
            type="button"
            className={clsx(styles.yearTick, year === activeYear && styles.yearTickActive)}
            onClick={() => onSelectYear(year)}
            title={`跳轉至 ${year} 年`}
            aria-label={`${year} 年`}
          >
            {year}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default memo(TimelineScrubber);
