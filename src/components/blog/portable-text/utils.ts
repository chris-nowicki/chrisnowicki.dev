import GithubSlugger from 'github-slugger'

import type { MediaValue } from 'emdash'

/** Minimal Portable Text shapes the blog renderers rely on. */
export interface PTSpan {
  _type: 'span'
  _key?: string
  text?: string
  marks?: string[]
}

export interface PTBlock {
  _type: string
  _key?: string
  style?: string
  children?: Array<PTSpan | { _type: string; [key: string]: unknown }>
  [key: string]: unknown
}

/** Heading block after `withHeadingIds()` has assigned its anchor id. */
export interface PTHeadingBlock extends PTBlock {
  headingId?: string
}

/**
 * Image reference as stored by EmDash. Accepts both the reference shape
 * (`_ref`, `url`) and the MediaValue shape that seeded `$media` stores
 * (`id`, `src`, `meta.storageKey`).
 */
export interface PTImageAsset {
  _ref?: string
  _type?: string
  url?: string
  provider?: string
  id?: string
  src?: string
  alt?: string
  width?: number
  height?: number
  meta?: Record<string, unknown>
}

export interface PTImage {
  _type: 'image'
  _key: string
  asset: PTImageAsset
  alt?: string
  caption?: string
  width?: number
  height?: number
  focalX?: number
  focalY?: number
  blurhash?: string
  dominantColor?: string
}

const HEADING_STYLES = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const INTERNAL_MEDIA_PREFIX = '/_emdash/api/media/file/'
const SAFE_STORAGE_KEY = /^[A-Za-z0-9._-]+$/

export function isHeadingBlock(block: unknown): block is PTHeadingBlock {
  const node = block as PTBlock | null
  return (
    node?._type === 'block' &&
    typeof node.style === 'string' &&
    HEADING_STYLES.has(node.style)
  )
}

/** Concatenated text of a block's spans (what a reader sees). */
export function blockPlainText(block: PTBlock): string {
  return (block.children ?? [])
    .map((child) => (typeof child.text === 'string' ? child.text : ''))
    .join('')
}

/**
 * Assign GitHub-style slug ids to every heading, deduped per post exactly
 * like Astro's `rehypeHeadingIds` (one github-slugger per document, in
 * document order, h1–h6). Returns a shallow copy; the input is untouched.
 */
export function withHeadingIds<T>(blocks: T[]): T[] {
  const slugger = new GithubSlugger()
  return blocks.map((block) =>
    isHeadingBlock(block) ?
      { ...block, headingId: slugger.slug(blockPlainText(block)) }
    : block
  )
}

/**
 * Convert a Portable Text image (block or gallery item) into the
 * `MediaValue` that `emdash/ui`'s `<Image>` expects. Internal media URLs are
 * turned back into a storage key so EmDash can rewrite them to the R2 public
 * URL when one is configured.
 */
export function toMediaValue(image: PTImage): MediaValue {
  const asset = image.asset ?? {}
  const url = asset.url || asset.src
  const storageKey =
    typeof asset.meta?.storageKey === 'string' ? asset.meta.storageKey
    : url?.startsWith(INTERNAL_MEDIA_PREFIX) ?
      url.slice(INTERNAL_MEDIA_PREFIX.length)
    : undefined
  const isSafeKey = storageKey ? SAFE_STORAGE_KEY.test(storageKey) : false
  // External providers (e.g. Cloudflare Images) resolve their own URLs;
  // a `src` would short-circuit that inside <Image>.
  const isLocal = !asset.provider || asset.provider === 'local'

  return {
    id: asset._ref || asset.id || '',
    provider: asset.provider,
    src: isLocal && !isSafeKey ? url : undefined,
    meta: isSafeKey ? { ...asset.meta, storageKey } : asset.meta,
    alt: image.alt ?? asset.alt,
    width: image.width ?? asset.width,
    height: image.height ?? asset.height,
    focalX: image.focalX,
    focalY: image.focalY,
    blurhash: image.blurhash,
    dominantColor: image.dominantColor,
  }
}

/** One paragraph of a multi-paragraph list item (see `withListItemBlocks`). */
export interface PTListParagraph {
  _type: 'listParagraph'
  _key: string
  children: PTSpan[]
  markDefs?: unknown[]
}

const isListItemBlock = (block: unknown): block is PTBlock =>
  (block as PTBlock | null)?._type === 'block' &&
  typeof (block as PTBlock).listItem === 'string'

const isLineBreak = (child: unknown) =>
  (child as PTSpan | undefined)?._type === 'span' &&
  (child as PTSpan).text === '\n'

/**
 * Markdown wraps the text of a loose list's items in `<p>` and lets an item
 * hold several paragraphs. A PT list item is one block, so the migration
 * flags loose items (`listLoose`) and joins extra paragraphs with a blank
 * line (two `\n` spans). Turn such an item's text back into `listParagraph`
 * children, one `<p>` each. Other items are returned unchanged.
 */
function splitListItemParagraphs(item: PTBlock): PTBlock {
  const children = item.children ?? []
  const hasBreak = children.some(
    (child, i) => isLineBreak(child) && isLineBreak(children[i + 1])
  )
  if (!hasBreak && item.listLoose !== true) return item

  const out: PTBlock['children'] = []
  let spans: PTSpan[] = []
  const flush = () => {
    while (isLineBreak(spans.at(-1))) spans.pop()
    if (spans.length) {
      const paragraph: PTListParagraph = {
        _type: 'listParagraph',
        _key: `${item._key}-p${out.length}`,
        children: spans,
        markDefs: item.markDefs as unknown[] | undefined,
      }
      out.push(paragraph as never)
    }
    spans = []
  }
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isLineBreak(child) && isLineBreak(children[i + 1])) {
      flush()
      while (isLineBreak(children[i + 1])) i++
    } else if (child._type === 'span') {
      if (spans.length || !isLineBreak(child)) spans.push(child as PTSpan)
    } else {
      flush()
      out.push(child)
    }
  }
  flush()
  return { ...item, children: out }
}

/**
 * Restore list items' block structure, which Portable Text can't nest:
 *
 * - An image or code block that belongs to a list item is stored right
 *   after it with `listItemKey` pointing at the item (see
 *   scripts/migrate-blog-to-emdash.ts). Move it back into the item's
 *   `children` so it renders inside the `<li>`; astro-portabletext renders
 *   non-span children in place, the same way EmDash nests sub-lists. A block
 *   whose item no longer exists stays where it is.
 * - Loose and multi-paragraph items get `<p>`s (`splitListItemParagraphs`).
 *
 * Returns a shallow copy; the input is untouched.
 */
export function withListItemBlocks<T>(blocks: T[]): T[] {
  const items = new Map<string, PTBlock>()
  const out: T[] = []
  for (const block of blocks) {
    const node = block as PTBlock | null
    const itemKey = node?.listItemKey
    const item = typeof itemKey === 'string' ? items.get(itemKey) : undefined
    if (item && node) {
      item.children = [...(item.children ?? []), node]
      continue
    }
    if (isListItemBlock(block) && typeof block._key === 'string') {
      const copy = { ...block, children: [...(block.children ?? [])] }
      items.set(block._key, copy)
      out.push(copy as T)
      continue
    }
    out.push(block)
  }
  return out.map((block) =>
    isListItemBlock(block) ? (splitListItemParagraphs(block) as T) : block
  )
}
