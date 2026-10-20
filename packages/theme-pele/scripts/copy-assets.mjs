import { cp, mkdir, rm } from 'node:fs/promises';

await rm('lib/theme', { recursive: true, force: true });
await mkdir('lib/client', { recursive: true });

// Theme components are copied as-is, like Docusaurus' own themes do. Webpack
// parses the JSX and keeps the dynamic `import('pele')` as a split chunk.
await cp('src/theme', 'lib/theme', { recursive: true });
await cp('src/client/pele.css', 'lib/client/pele.css');
