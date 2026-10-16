/** Sizing helpers for EmDash media rendered by `MediaPicture.astro`. */

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
