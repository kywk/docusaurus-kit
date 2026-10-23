import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkWikiLink from 'remark-wiki-link';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { remarkKanban } from '../src/index.js';

const pageResolver = (name) => [name.replace(/\s+/g, '-').toLowerCase()];
const hrefTemplate = (permalink) => `/docs/${permalink}`;

function run(markdown, options) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(remarkWikiLink)
    .use(remarkKanban, options);

  const tree = processor.parse(markdown);
  processor.runSync(tree);
  return tree;
}

function boardHtml(tree) {
  return tree.children.find((node) => node.type === 'html')?.value ?? '';
}

const board = `---
kanban-plugin: board
---

## To Do

- [ ] First task
- [ ] Second task

## Doing

- [/] Third task
- [-] Fourth task
`;

describe('remark-obsidian-kanban', () => {
  it('renders columns and cards', () => {
    const html = boardHtml(run(board, { pageResolver, hrefTemplate }));

    expect(html).toContain('kanban-board-container');
    expect(html).toContain('To Do');
    expect(html).toContain('Doing');
    expect(html).toContain('First task');
    expect(html).toContain('Third task');
    expect(html).not.toContain('[ ] First task');
    expect(html).not.toContain('[/] Third task');
    expect(html).toContain('kanban-card--in-progress');
    expect(html).toContain('kanban-card--cancelled');
    expect(html).toContain('data-task="/"');
    expect(html).toContain('data-task="-"');
  });

  it('keeps the board readable without link resolvers', () => {
    const html = boardHtml(run(board));

    expect(html).toContain('First task');
    expect(html).toContain('kanban-board-container');
  });

  it('resolves wiki links in card titles', () => {
    const markdown = `---
kanban-plugin: board
---

## To Do

- [ ] Read [[Some Note]]
`;
    const html = boardHtml(run(markdown, { pageResolver, hrefTemplate }));

    expect(html).toContain('href="/docs/some-note"');
    expect(html).toContain('Some Note');
  });

  it('leaves non-kanban documents untouched without traversing deep nodes', () => {
    const markdown = '# Normal note\n\n- [ ] A task\n';
    const tree = run(markdown, { pageResolver, hrefTemplate });

    expect(tree.children.some((node) => node.type === 'html')).toBe(false);

    let visitedDeepChildren = false;
    const customTree = {
      type: 'root',
      children: [
        { type: 'yaml', value: 'title: Normal page' },
        {
          type: 'paragraph',
          get children() {
            visitedDeepChildren = true;
            return [{ type: 'text', value: 'Hello' }];
          },
        },
      ],
    };
    remarkKanban()(customTree);
    expect(visitedDeepChildren).toBe(false);
  });

  it('drops kanban settings blocks', () => {
    const markdown = `${board}
%% kanban:settings
\`\`\`
{"kanban-plugin":"board"}
\`\`\`
%%
`;
    const html = boardHtml(run(markdown, { pageResolver, hrefTemplate }));

    expect(html).toContain('First task');
    expect(html).not.toContain('kanban:settings');
  });

  it('gives identical tags the same colour', () => {
    const html = boardHtml(
      run(`---\nkanban-plugin: board\n---\n\n## A\n\n- 抵達 #交通\n- 轉乘 #交通 #藝術 #123\n`),
    );
    const hues = [...html.matchAll(/--kanban-tag-hue: (\d+)">#([^<]+)</g)];
    const byTag = Object.fromEntries(hues.map((m) => [m[2], m[1]]));
    expect(hues.filter((m) => m[2] === '交通')).toHaveLength(2);
    expect(new Set(hues.filter((m) => m[2] === '交通').map((m) => m[1])).size).toBe(1);
    expect(byTag['藝術']).toBeDefined();
    expect(byTag['123']).toBeUndefined();
  });
});
