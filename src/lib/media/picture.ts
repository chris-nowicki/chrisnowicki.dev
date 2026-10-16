/**
 * Format and sizing choices for EmDash media rendered by
 * `MediaPicture.astro`.
 *
 * - Photos: AVIF first with a WebP fallback (AVIF is ~45% smaller at the
 *   same visual quality on the Images binding).
 * - Screenshots (PNG sources): WebP only. AVIF smears text, and at native
 *   width a WebP screenshot is as small or smaller (measured Oct 2026: a
 *   1296px screenshot was 38 KB lossless WebP vs 45 KB AVIF q60).
 */

export type MediaKind = 'photo' | 'screenshot'

export type PictureFormat = 'avif' | 'webp'

/** Ordered best-first; the last entry is also the `<img>` fallback. */
export const FORMATS: Record<MediaKind, readonly PictureFormat[]> = {
  photo: ['avif', 'webp'],
  screenshot: ['webp'],
}

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
