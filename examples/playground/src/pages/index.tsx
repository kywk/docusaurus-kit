import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import type { ReactNode } from 'react';

export default function Home(): ReactNode {
  return (
    <Layout title="Playground" description="docusaurus-theme-pele playground">
      <main
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h1>docusaurus-theme-pele</h1>
        <p>Pele renders Mermaid fenced blocks as themeable SVG.</p>
        <Link className="button button--primary button--lg" to="/docs">
          Open diagrams
        </Link>
      </main>
    </Layout>
  );
}
