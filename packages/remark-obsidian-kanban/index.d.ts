export interface KanbanOptions {
  /**
   * Resolve a wiki-link target to one or more permalinks. Required: without
   * both `pageResolver` and `hrefTemplate` the plugin leaves the tree alone.
   */
  pageResolver?: (name: string) => string[];

  /** Build the final href from a permalink. Required. */
  hrefTemplate?: (permalink: string) => string;
}

/**
 * The remark plugin. Add it to a remark processor with
 * `processor.use(remarkKanban, options)`.
 */
export declare function remarkKanban(
  options?: KanbanOptions,
): (tree: unknown, file?: unknown) => void;

/**
 * Docusaurus plugin wrapper. Only useful if you want the plugin to register
 * its own markdown processor instead of adding `remarkKanban` to a content
 * plugin's `remarkPlugins` array.
 */
declare function docusaurusPlugin(): {
  name: string;
  configureMarkdownProcessor: (processor: unknown) => unknown;
};

export default docusaurusPlugin;
