# remark-obsidian-kanban

Render [Obsidian Kanban](https://github.com/mgmeyers/obsidian-kanban) boards as
static kanban columns in remark pipelines, including Docusaurus.

The plugin detects boards through `kanban-plugin: board` frontmatter, treats
`##` headings as columns, and turns list items into cards. Kanban settings
blocks are removed from the output.

## Install

```bash
npm install remark-obsidian-kanban
```

## Docusaurus

```ts
// docusaurus.config.ts
import {remarkKanban} from 'remark-obsidian-kanban';

export default {
  presets: [
    [
      'classic',
      {
        docs: {
          remarkPlugins: [
            [
              remarkKanban,
              {
                pageResolver: (name) => [name.replaceAll(' ', '-').toLowerCase()],
                hrefTemplate: (permalink) => `/docs/${permalink}`,
              },
            ],
          ],
        },
      },
    ],
  ],
};
```

`pageResolver` and `hrefTemplate` are optional. When both are provided, wiki
links inside cards become anchors. When they are omitted, wiki links render as
plain text and the board still renders.

> If you also use `remark-wiki-link`, place `remarkKanban` **after** it so the
> kanban plugin can see the `wikiLink` nodes.

## Obsidian format

```markdown
---
kanban-plugin: board
---

## To Do

- [ ] Task 1
- [ ] Task 2

## In Progress

- [ ] Task 3

## Done

- [x] Finished task
```

## Output

The plugin replaces the board's headings and lists with a single HTML block:

```html
<div class="kanban-board-container">
  <div style="display: flex; gap: 1rem; overflow-x: auto; ...">
    <div style="flex: 0 0 300px; ...">
      <h3>To Do <span>2</span></h3>
      ...
    </div>
  </div>
</div>
```

The output uses Docusaurus CSS variables such as `--ifm-color-primary`,
`--ifm-color-emphasis-100`, and `--ifm-card-background-color`, so it follows the
site palette and dark mode. Override `.kanban-board-container` to adjust the
layout.

Because the plugin emits raw HTML, it requires a Markdown pipeline that allows
HTML. In Docusaurus, set `markdown.format: 'detect'` so `.md` files are
processed as CommonMark instead of MDX; MDX rejects raw `html` nodes.

## Notes

- Boards are static. There is no drag and drop or persistence.
- Only level-2 headings become columns.
- Set `hide_table_of_contents: true` in frontmatter if the column headings
  should not appear in the table of contents.
- Images and links inside cards are preserved.

## License

MIT
