/**
 * Format, quality and sizing choices for EmDash media rendered by
 * `MediaPicture.astro`. Measured on the Images binding (Oct 2026):
 *
 * - Photos: AVIF q60 is ~45% smaller than WebP q78 with no visible
 *   difference at polaroid/prose sizes, so AVIF first with a WebP fallback.
 *   (Without a `q` the endpoint defaults to 85: a 560px square was 37 KB
 *   WebP; q78 is 28 KB, AVIF q60 15 KB.)
 * - Screenshots (PNG sources): AVIF and lossy WebP leave ringing around
 *   text. WebP at quality 100 is lossless (VP8L) on the binding: pixel-exact
 *   and, at native width, the smallest option (a 1296px screenshot: 38 KB
 *   vs 40 KB WebP q80 and 45 KB AVIF q60). Downscaled candidates cost more
 *   (~1.7x WebP q80) but keep text crisp.
 */

export type MediaKind = 'photo' | 'screenshot'

export type PictureFormat = 'avif' | 'webp'

export interface FormatSpec {
  format: PictureFormat
  quality: number
}

/** Ordered best-first; the last entry is also the `<img>` fallback. */
export const FORMATS: Record<MediaKind, readonly FormatSpec[]> = {
  photo: [
    { format: 'avif', quality: 60 },
    { format: 'webp', quality: 78 },
  ],
  screenshot: [{ format: 'webp', quality: 100 }],
}

/**
 * Post cover: full-bleed below 896px, then the 896px (max-w-4xl) column; up
 * to 2x for high-density screens. Cropped to the sm+ 2.5:1 frame
 * (object-cover crops the narrower mobile 16:9 frame further). Shared by
 * the header and its `<link rel="preload">`, which must match exactly.
 */
export const COVER_PICTURE = {
  widths: [640, 828, 1080, 1280, 1792],
  sizes: '(min-width: 896px) 896px, 100vw',
  aspectRatio: 2.5,
} as const

/** PNG uploads are screenshots/diagrams in this blog; everything else is a photo. */
export function mediaKind(storageKey: string, mimeType?: string): MediaKind {
  if (mimeType) return mimeType === 'image/png' ? 'screenshot' : 'photo'
  return storageKey.toLowerCase().endsWith('.png') ? 'screenshot' : 'photo'
}

/**
 * Srcset widths for a crop of `aspectRatio` (width / height) from a
 * `width`×`height` source. The image service won't upscale, so a candidate
 * wider than the largest crop the source allows is dropped and replaced by
 * that largest crop.
 */
export function cropWidths(
  widths: readonly number[],
  width: number,
  height: number,
  aspectRatio: number
): number[] {
  const maxWidth = Math.floor(Math.min(width, height * aspectRatio))
  const fitting = widths.filter((candidate) => candidate <= maxWidth)
  if (fitting.length < widths.length) fitting.push(maxWidth)
  return [...new Set(fitting)].toSorted((a, b) => a - b)
}

/** CSS `object-position` for an EmDash focal point (0–1 each), else center. */
export function focalPosition(focalX?: number, focalY?: number): string {
  const valid = (value?: number): value is number =>
    typeof value === 'number' && value >= 0 && value <= 1
  if (!valid(focalX) || !valid(focalY)) return 'center'
  const percent = (value: number) => `${Math.round(value * 10_000) / 100}%`
  return `${percent(focalX)} ${percent(focalY)}`
}

const CSS_COLOR = /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s.,%/]+\))$/i

/**
 * Inline placeholder style from EmDash's `dominantColor` (computed on
 * upload; absent on seeded media), shown until the image paints. Only for
 * photos: a screenshot with transparency would keep showing it. The value
 * comes from the CMS, so anything but a plain hex/rgb() color is dropped.
 */
export function placeholderStyle(
  kind: MediaKind,
  dominantColor: unknown
): string | undefined {
  if (kind !== 'photo' || typeof dominantColor !== 'string') return undefined
  const color = dominantColor.trim()
  return CSS_COLOR.test(color) ? `background-color: ${color}` : undefined
}
