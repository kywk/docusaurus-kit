/**
 * Rehype plugin that turns Obsidian task statuses into GFM-compatible task
 * list items:
 *
 * - `[-]` cancelled
 * - `[/]` in progress
 * - `[ ]` / `[x]` keep their standard GFM behavior
 */
export declare function rehypeObsidianTasks(
  options?: Record<string, never>,
): (tree: unknown) => void;

export default rehypeObsidianTasks;
