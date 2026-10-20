import type { ZoomOptions } from 'pele';

export type PeleThemeConfig = {
  /**
   * Enable the built-in zoom controls. Defaults to `'auto'`, which shows
   * controls only when a diagram is scaled down to fit its container.
   */
  zoom?: boolean | 'auto' | ZoomOptions;

  /** Extra class name added to every diagram container. */
  className?: string;
};
