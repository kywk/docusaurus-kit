# rehype-obsidian-tasks

Render Obsidian task statuses in remark/rehype pipelines and Docusaurus.

Obsidian extends GFM checkboxes with custom statuses. This plugin understands:

| Syntax | Meaning |
| --- | --- |
| `- [-]` | Cancelled |
| `- [/]` | In progress |
| `- [ ]` | Open (GFM) |
| `- [x]` | Done (GFM) |

## Install

```bash
npm install rehype-obsidian-tasks
```

## Docusaurus

```ts
// docusaurus.config.ts
import {rehypeObsidianTasks} from 'rehype-obsidian-tasks';

export default {
  presets: [
    [
      'classic',
      {
        docs: {
          rehypePlugins: [rehypeObsidianTasks],
        },
      },
    ],
  ],
};
```

Apply it to every content plugin instance that can contain tasks (docs, blog,
or custom content plugins).

## Output

Each task item receives GFM-compatible classes and data attributes:

```html
<li
  class="task-list-item task-list-item--cancelled"
  data-task="-"
>
  <input type="checkbox" disabled data-task="-" />
  Cancelled task
</li>
```

- `task-list-item--cancelled` for `[-]`
- `task-list-item--in-progress` for `[/]`
- `contains-task-list` on the parent list
- `data-task` on the item and on the checkbox

The standard GFM `[ ]` and `[x]` checkboxes are left untouched.

## Styling

```css
.task-list-item--cancelled {
  color: var(--ifm-color-emphasis-500);
  text-decoration: line-through;
}

.task-list-item--in-progress {
  color: var(--ifm-color-primary);
}

.task-list-item--in-progress .task-list-item-checkbox--in-progress {
  accent-color: var(--ifm-color-primary);
}
```

## Notes

- Works with tight and loose lists.
- Only list items that start with `[-]` or `[/]` are changed.
- The plugin does not add icons or interactivity; style the classes as needed.

## License

MIT
