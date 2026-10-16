const DEFAULT_WORDS_PER_MINUTE = 200

function formatReadingTime(wordCount: number, wordsPerMinute: number) {
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  return `${minutes} min read`
}

function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

export function readingTime(
  html: string,
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE
) {
  const textOnly = html.replace(/<[^>]+>/g, '')
  // Unfiltered split kept as-is so existing Markdown reading times don't move.
  return formatReadingTime(textOnly.split(/\s+/).length, wordsPerMinute)
}

interface PortableTextNode {
  _type?: string
  text?: unknown
  code?: unknown
  children?: unknown
  blocks?: unknown
}

/** Collect the reader-visible text of a Portable Text tree. */
function collectText(nodes: unknown, out: string[]) {
  if (!Array.isArray(nodes)) return
  for (const node of nodes as PortableTextNode[]) {
    if (!node || typeof node !== 'object') continue
    if (typeof node.text === 'string') out.push(node.text)
    // Code is counted, as it was in the rendered-HTML count for Markdown
    // posts. Image alts/captions are not (they were attributes there).
    if (node._type === 'code' && typeof node.code === 'string') {
      out.push(node.code)
    }
    collectText(node.children, out)
    collectText(node.blocks, out)
  }
}

/**
 * Reading time for an EmDash Portable Text field, using the same
 * words-per-minute rule as `readingTime()`.
 */
export function readingTimeFromPortableText(
  blocks: unknown[] | null | undefined,
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE
) {
  const parts: string[] = []
  collectText(blocks, parts)
  return formatReadingTime(countWords(parts.join(' ')), wordsPerMinute)
}
