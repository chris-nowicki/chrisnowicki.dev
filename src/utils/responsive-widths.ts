/**
 * Srcset candidate widths for an image whose original size is known.
 *
 * Astro can't measure remote (EmDash media) images, so it happily emits
 * candidates wider than the source. The image service won't upscale, so
 * such a candidate's file is narrower than its `w` descriptor and the
 * browser renders the image smaller than intended (a 480px photo picked as
 * `720w` for a 360px slot displays at 240px). Keep only candidates the
 * source can actually fill, plus the original width itself as the largest.
 */
export function widthsUpToOriginal(
  widths: readonly number[],
  originalWidth: number | undefined
): number[] {
  if (!originalWidth || !Number.isFinite(originalWidth) || originalWidth <= 0) {
    return [...widths]
  }
  const original = Math.round(originalWidth)
  const fitting = widths.filter((width) => width <= original)
  if (fitting.length < widths.length) fitting.push(original)
  return [...new Set(fitting)].toSorted((a, b) => a - b)
}
