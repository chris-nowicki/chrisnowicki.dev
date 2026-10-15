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
