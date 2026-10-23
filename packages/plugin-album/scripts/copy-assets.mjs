import { cp, rm } from 'node:fs/promises';

await rm('lib/theme', { recursive: true, force: true });

// Theme components are copied as-is so Docusaurus' bundler compiles the JSX
// and CSS modules directly, matching Docusaurus' own theme packages.
await cp('src/theme', 'lib/theme', { recursive: true });
