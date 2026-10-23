const { visit } = require('unist-util-visit');

// FNV-1a 32-bit hash: the same tag name always maps to the same hue.
function tagHue(name) {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % 360;
}

const TAG_RE =
  /(^|\s)#([^\s#.,;:!?'"()[\]{}<>]*[^\s\d#.,;:!?'"()[\]{}<>][^\s#.,;:!?'"()[\]{}<>]*)/gu;

function renderTags(text) {
  return text.replace(TAG_RE, (_, pre, name) => {
    const tag = name.toLowerCase();
    return `${pre}<span class="kanban-tag" style="--kanban-tag-hue: ${tagHue(tag)}">#${name}</span>`;
  });
}

function remarkKanban(options = {}) {
  return (tree) => {
    const { pageResolver, hrefTemplate } = options;

    const renderWikiLink = (node) => {
      const linkText =
        node.data?.alias || node.data?.permalink || node.value || node.children?.[0]?.value || '';

      if (!pageResolver || !hrefTemplate) {
        return linkText;
      }

      try {
        const resolvedPages = pageResolver(linkText);
        const permalink = resolvedPages?.[0]
          ? resolvedPages[0]
          : linkText.replace(/ /g, '-').toLowerCase();
        const href = hrefTemplate(permalink);
        return `<a href="${href}" style="color: var(--ifm-color-primary); text-decoration: none; border-bottom: 1px dotted var(--ifm-color-primary);">${linkText}</a>`;
      } catch (error) {
        console.warn(`Failed to resolve wikilink ${linkText}:`, error.message);
        return linkText;
      }
    };

    const isKanbanBoard = tree.children?.some(
      (node) => node.type === 'yaml' && node.value?.includes('kanban-plugin: board'),
    );

    if (!isKanbanBoard) return;

    const columns = [];
    let currentColumn = null;
    const filteredChildren = [];

    tree.children.forEach((node) => {
      if (node.type !== 'heading' && node.type !== 'list') {
        let nodeText = node.value || '';
        visit(node, 'text', (textNode) => {
          nodeText += textNode.value;
        });

        if (
          nodeText.includes('kanban:settings') ||
          (nodeText.includes('%%') && nodeText.includes('kanban')) ||
          (nodeText.includes('```') && nodeText.includes('kanban-plugin'))
        ) {
          return;
        }
      }

      filteredChildren.push(node);

      if (node.type === 'heading' && node.depth === 2) {
        if (currentColumn) columns.push(currentColumn);

        let title = '';
        visit(node, 'text', (textNode) => {
          title += textNode.value;
        });

        currentColumn = { title: title.trim(), tasks: [] };
      } else if (node.type === 'list' && currentColumn) {
        node.children.forEach((listItem) => {
          if (listItem.type === 'listItem') {
            const card = { title: '', content: [], task: null };

            // 處理第一層內容作為卡片標題
            if (listItem.children?.[0]) {
              const firstChild = listItem.children[0];
              if (firstChild.type === 'paragraph') {
                let titleHtml = '';
                visit(firstChild, (node) => {
                  if (node.type === 'text') {
                    const marker = !card.task && node.value.match(/^\[([ xX\-/])\]\s+/);
                    if (marker) {
                      card.task = marker[1];
                      titleHtml += renderTags(node.value.slice(marker[0].length));
                    } else {
                      titleHtml += renderTags(node.value);
                    }
                  } else if (node.type === 'wikiLink') {
                    titleHtml += renderWikiLink(node);
                  } else if (node.type === 'image') {
                    const src = node.url || '';
                    const alt = node.alt || '';
                    titleHtml += `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 0.25rem 0;">`;
                  } else if (node.type === 'link' && node.children) {
                    node.children.forEach((child) => {
                      if (child.type === 'text') titleHtml += child.value;
                    });
                  }
                });
                card.title = titleHtml.trim();
              }
            }

            // 處理縮排內容作為卡片內容
            if (listItem.children && listItem.children.length > 1) {
              // 處理除了第一個段落之外的所有內容
              for (let i = 1; i < listItem.children.length; i++) {
                const child = listItem.children[i];

                if (child.type === 'list') {
                  // 處理子列表
                  child.children.forEach((subItem) => {
                    if (subItem.type === 'listItem' && subItem.children) {
                      subItem.children.forEach((subChild) => {
                        card.content.push(subChild);
                      });
                    }
                  });
                } else {
                  // 處理其他類型的內容（段落、圖片等）
                  card.content.push(child);
                }
              }
            }

            if (card.title) {
              currentColumn.tasks.push(card);
            }
          }
        });
      }
    });

    if (currentColumn) columns.push(currentColumn);

    tree.children = filteredChildren;

    if (columns.length > 0) {
      const newChildren = [];

      tree.children.forEach((node) => {
        if (node.type !== 'heading' && node.type !== 'list') {
          newChildren.push(node);
        }
      });

      let html = '<div style="display: flex; gap: 1rem; overflow-x: auto; padding: 1rem 0;">';

      columns.forEach((column) => {
        html += `<div style="flex: 0 0 300px; background: var(--ifm-color-emphasis-100); border: 1px solid var(--ifm-color-emphasis-300); border-radius: 8px; padding: 1rem;">`;
        html += `<h3 style="margin: 0 0 1rem 0; color: var(--ifm-color-primary); font-size: 1.1em;">${column.title} <span style="color: var(--ifm-color-emphasis-600); font-weight: normal;">${column.tasks.length}</span></h3>`;

        column.tasks.forEach((card) => {
          const statusClass = card.task
            ? card.task === '-'
              ? ' kanban-card--cancelled'
              : card.task === '/'
                ? ' kanban-card--in-progress'
                : card.task.trim()
                  ? ' kanban-card--done'
                  : ' kanban-card--open'
            : '';
          const taskAttribute = card.task ? ` data-task="${card.task}"` : '';
          html += `<div class="kanban-card${statusClass}"${taskAttribute}>`;
          html += `<div class="kanban-card-title">${card.title}</div>`;

          if (card.content && card.content.length > 0) {
            card.content.forEach((contentNode) => {
              if (contentNode.type === 'paragraph') {
                let contentHtml = '';
                visit(contentNode, (node) => {
                  if (node.type === 'text') {
                    contentHtml += renderTags(node.value);
                  } else if (node.type === 'strong') {
                    contentHtml += '<strong>';
                    if (node.children) {
                      node.children.forEach((child) => {
                        if (child.type === 'text') contentHtml += child.value;
                      });
                    }
                    contentHtml += '</strong>';
                  } else if (node.type === 'emphasis') {
                    contentHtml += '<em>';
                    if (node.children) {
                      node.children.forEach((child) => {
                        if (child.type === 'text') contentHtml += child.value;
                      });
                    }
                    contentHtml += '</em>';
                  } else if (node.type === 'image') {
                    const src = node.url || '';
                    const alt = node.alt || '';
                    contentHtml += `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 0.25rem 0; display: block;">`;
                  } else if (node.type === 'wikiLink') {
                    contentHtml += renderWikiLink(node);
                  } else if (node.type === 'link') {
                    contentHtml += `<a href="${node.url || '#'}" style="color: var(--ifm-link-color);">`;
                    if (node.children) {
                      node.children.forEach((child) => {
                        if (child.type === 'text') contentHtml += child.value;
                      });
                    }
                    contentHtml += '</a>';
                  }
                });
                html += `<div style="font-size: 0.9em; color: var(--ifm-color-emphasis-700); margin-bottom: 0.25rem;">• ${contentHtml}</div>`;
              }
            });
          }

          html += `</div>`;
        });

        html += `</div>`;
      });

      html += '</div>';

      newChildren.unshift({
        type: 'html',
        value: `<style>
/* TOC 請改用 frontmatter 的 hide_table_of_contents: true 關閉。
   用 CSS 隱藏會留下指向看板欄位（無 heading id）的 TOC 連結，造成 broken anchors。 */
.kanban-board-container { background: var(--ifm-background-color); padding: 1rem; border-radius: 8px; }
.kanban-board-container img { max-width: 100%; height: auto; border-radius: 4px; }
.kanban-card { background: var(--ifm-card-background-color); border: 1px solid var(--ifm-color-emphasis-200); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.75rem; color: var(--ifm-color-content); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.kanban-card-title { color: var(--ifm-color-primary-dark); font-weight: 500; margin-bottom: 0.5rem; }
.kanban-tag { display: inline-block; margin: 0 0.1em; padding: 0 0.6em; border-radius: 999px; font-size: 0.85em; font-weight: 500; line-height: 1.6; color: hsl(var(--kanban-tag-hue) 65% 32%); background: hsl(var(--kanban-tag-hue) 70% 50% / 0.15); border: 1px solid hsl(var(--kanban-tag-hue) 70% 50% / 0.35); }
[data-theme='dark'] .kanban-tag { color: hsl(var(--kanban-tag-hue) 75% 72%); }
.kanban-card--cancelled .kanban-card-title { color: var(--ifm-color-emphasis-500); text-decoration: line-through; }
.kanban-card--in-progress .kanban-card-title { color: var(--ifm-color-primary); }
</style><div class="kanban-board-container">${html}</div>`,
      });

      tree.children = newChildren;
    }
  };
}

module.exports = function plugin() {
  return {
    name: 'docusaurus-plugin-obsidian-kanban',
    configureMarkdownProcessor(processor) {
      processor.use(remarkKanban);
      return processor;
    },
  };
};

module.exports.remarkKanban = remarkKanban;
