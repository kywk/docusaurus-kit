import { useThemeConfig } from '@docusaurus/theme-common';
import React from 'react';

/**
 * One shared promise keeps the renderer chunk out of the initial page bundle.
 * The import is dynamic on purpose: `pele` is ESM-only, and this component is
 * also evaluated during Docusaurus' server-side rendering.
 */
let pelePromise;

function loadPele() {
  pelePromise ??= import('pele');
  return pelePromise;
}

export default function Mermaid({ value }) {
  const containerRef = React.useRef(null);
  const { pele: peleConfig } = useThemeConfig();
  const zoom = peleConfig?.zoom ?? 'auto';
  const extraClassName = peleConfig?.className;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    let cancelled = false;
    let diagram;

    loadPele()
      .then(({ mount }) => {
        if (cancelled) {
          return;
        }
        diagram = mount(container, value, { zoom });
      })
      .catch((error) => {
        console.error('[docusaurus-theme-pele] Failed to load the renderer.', error);
        container.textContent = 'Unable to load the diagram renderer.';
      });

    return () => {
      cancelled = true;
      diagram?.destroy();
    };
  }, [value, zoom]);

  return (
    <div
      ref={containerRef}
      className={['docusaurus-mermaid-container', 'pele-container', extraClassName]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
