import { cp } from 'node:fs/promises';

await cp('src/theme/styles.module.css', 'lib/theme/styles.module.css');
