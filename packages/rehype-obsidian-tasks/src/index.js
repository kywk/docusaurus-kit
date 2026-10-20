/**
 * rehype-obsidian-tasks
 *
 * Rehype plugin for Docusaurus that parses and correctly renders Obsidian Tasks
 * custom statuses, specifically:
 *   - [-] : Cancelled task
 *   - [/] : In progress task
 */

function rehypeObsidianTasks(_options = {}) {
  return (tree) => {
    function processNode(node) {
      if (!node?.children) return;

      for (const child of node.children) {
        processNode(child);
      }

      if (node.type === 'element' && (node.tagName === 'ul' || node.tagName === 'ol')) {
        let hasTask = false;
        for (const item of node.children) {
          if (item.type !== 'element' || item.tagName !== 'li') continue;

          // Check if already a task item (from standard GFM [ ] or [x])
          const existingClasses = getClasses(item);
          if (existingClasses.includes('task-list-item')) {
            hasTask = true;
          }

          // Locate the first container with inline text. Loose lists wrap the
          // content in a <p> and may start with whitespace text nodes.
          let container = null;
          const paragraph = item.children?.find(
            (child) => child.type === 'element' && child.tagName === 'p',
          );
          if (paragraph) {
            container = paragraph.children;
          } else if (item.children) {
            container = item.children;
          }

          if (container) {
            while (
              container.length > 0 &&
              container[0].type === 'text' &&
              container[0].value.trim() === ''
            ) {
              container.shift();
            }
          }

          if (container && container.length > 0) {
            const firstChild = container[0];
            if (firstChild && firstChild.type === 'text') {
              const match = firstChild.value.match(/^\[([-/])\](?:\s+(.*)|\s*$)/);
              if (match) {
                hasTask = true;
                const symbol = match[1];
                const rest = match[2] || '';
                firstChild.value = rest;

                // Mark listItem with appropriate task classes
                const itemClasses = getClasses(item);
                if (!itemClasses.includes('task-list-item')) {
                  itemClasses.push('task-list-item');
                }
                const statusClass =
                  symbol === '-' ? 'task-list-item--cancelled' : 'task-list-item--in-progress';
                if (!itemClasses.includes(statusClass)) {
                  itemClasses.push(statusClass);
                }
                setClasses(item, itemClasses);
                item.properties['data-task'] = symbol;

                // Prepend space and checkbox input element
                container.unshift({ type: 'text', value: ' ' });
                container.unshift({
                  type: 'element',
                  tagName: 'input',
                  properties: {
                    type: 'checkbox',
                    disabled: true,
                    checked: symbol === '-',
                    className:
                      symbol === '-'
                        ? 'task-list-item-checkbox--cancelled'
                        : 'task-list-item-checkbox--in-progress',
                    'data-task': symbol,
                  },
                  children: [],
                });
              }
            }
          }
        }

        // If list contains any task item, ensure parent <ul> or <ol> has contains-task-list class
        if (hasTask) {
          const listClasses = getClasses(node);
          if (!listClasses.includes('contains-task-list')) {
            listClasses.push('contains-task-list');
            setClasses(node, listClasses);
          }
        }
      }
    }

    function getClasses(node) {
      node.properties = node.properties || {};
      const cls = node.properties.className || [];
      return Array.isArray(cls) ? cls : [cls];
    }

    function setClasses(node, cls) {
      node.properties = node.properties || {};
      node.properties.className = cls;
    }

    processNode(tree);
  };
}

module.exports = { rehypeObsidianTasks, default: rehypeObsidianTasks };
