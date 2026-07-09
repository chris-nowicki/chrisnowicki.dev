import type { ShikiTransformer } from 'shiki'

/**
 * Reads a `title="..."` token from a code fence's meta string (e.g.
 * ```` ```ts title="src/index.ts" ````) and stores it as a `data-title`
 * attribute on the `<pre>`. The filename bar itself is drawn in CSS via
 * `pre[data-title]::before`, so no hast tree surgery is needed here.
 *
 * This replaces the one expressive-code feature the blog actually used.
 */
export function transformerCodeTitle(): ShikiTransformer {
  return {
    name: 'code-title',
    pre(node) {
      const raw = this.options.meta?.__raw ?? ''
      const match = raw.match(/title="([^"]+)"/)
      if (match) {
        node.properties['data-title'] = match[1]
      }
    },
  }
}
