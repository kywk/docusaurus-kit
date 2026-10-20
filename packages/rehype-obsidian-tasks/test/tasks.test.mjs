import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { rehypeObsidianTasks } from '../src/index.js';

async function render(markdown) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeObsidianTasks)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

describe('rehype-obsidian-tasks', () => {
  it('renders cancelled and in-progress tasks', async () => {
    const html = await render('- [-] Cancelled task\n- [/] In progress task\n');

    expect(html).toContain('task-list-item--cancelled');
    expect(html).toContain('task-list-item--in-progress');
    expect(html).toContain('data-task="-"');
    expect(html).toContain('data-task="/"');
    expect(html).toContain('contains-task-list');
  });

  it('keeps standard GFM tasks working', async () => {
    const html = await render('- [ ] Open task\n- [x] Done task\n');

    expect(html).toContain('task-list-item');
    expect(html).toContain('checked');
  });

  it('handles loose lists with paragraph wrappers', async () => {
    const html = await render('- [-] Cancelled\n\n- [/] In progress\n');

    expect(html).toContain('task-list-item--cancelled');
    expect(html).toContain('task-list-item--in-progress');
  });

  it('does not touch plain lists', async () => {
    const html = await render('- First\n- Second\n');

    expect(html).not.toContain('task-list-item');
  });
});
