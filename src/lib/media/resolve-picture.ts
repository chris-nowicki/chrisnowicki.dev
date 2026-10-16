import { getImage } from 'astro:assets'

import {
  cropWidths,
  focalPosition,
  FORMATS,
  mediaKind,
  placeholderStyle,
} from './picture'

import type { MediaValue } from 'emdash'

export interface PictureOptions {
  /** Candidate widths; trimmed to what the source can fill. */
  widths: readonly number[]
  /** Crop to this width / height ratio. Defaults to the source's own. */
  aspectRatio?: number
}

export interface PictureSource {
  type: string
  srcset: string
}

export interface ResolvedPicture {
  /** Every format, best first; the last one is the `<img>` fallback. */
  sources: PictureSource[]
  src: string
  width: number
  height: number
  style?: string
}

/**
 * `/_image` URLs for an EmDash media value, one srcset per format (see
 * ./picture.ts), cropped to `aspectRatio` with `fit=cover` at the media's
 * focal point. Returns null for media this can't optimize (no storage key
 * or unknown size); callers fall back to EmDash's `<Image>`.
 */
export async function resolvePicture(
  image: MediaValue,
  { widths, aspectRatio }: PictureOptions,
  siteUrl: URL
): Promise<ResolvedPicture | null> {
  const storageKey =
    typeof image.meta?.storageKey === 'string' ? image.meta.storageKey : null
  const { width, height } = image
  if (!storageKey || !width || !height) return null

  const ratio = aspectRatio ?? width / height
  const candidates = cropWidths(widths, width, height, ratio)
  const largest = candidates.at(-1)!
  // Absolute, so Astro matches it against EmDash's remotePatterns; our
  // endpoint reads the key from R2 and never fetches this URL.
  const src = new URL(
    `/_emdash/api/media/file/${storageKey}`,
    siteUrl
  ).toString()
  const fallbackWidth = Math.floor(Math.min(width, height * ratio))
  const options = {
    src,
    width: fallbackWidth,
    height: Math.round(fallbackWidth / ratio),
    widths: candidates,
    fit: 'cover',
    position: focalPosition(image.focalX, image.focalY),
  } as const

  const kind = mediaKind(storageKey, image.mimeType)
  const variants = await Promise.all(
    FORMATS[kind].map(async ({ format, quality }) => ({
      type: `image/${format}`,
      image: await getImage({ ...options, format, quality }),
    }))
  )

  return {
    sources: variants.map(({ type, image: variant }) => ({
      type,
      srcset: variant.srcSet.attribute,
    })),
    src: variants.at(-1)!.image.src,
    width: largest,
    height: Math.round(largest / ratio),
    style: placeholderStyle(
      kind,
      image.dominantColor ?? image.meta?.dominantColor
    ),
  }
}
