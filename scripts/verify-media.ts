/**
 * Smoke tests (and cache warming) for the EmDash blog's image pipeline:
 * `/_image` transforms served by src/lib/media/image-endpoint.ts and the
 * media files behind them, with the caching policy in src/lib/media/cache.ts.
 *
 * Usage:
 *   pnpm verify:media                                  # verify localhost:4321
 *   pnpm verify:media --base-url https://example.com   # verify a deployment
 *   pnpm verify:media --base-url <url> --warm          # request every variant
 *
 * Options:
 *   --base-url <url>        site to test (default http://localhost:4321)
 *   --warm                  crawl /blog and every post, request every image
 *                           URL they reference and report HIT/MISS counts
 *   --concurrency <n>       parallel requests in --warm mode (default 6)
 *   --edge-checks <mode>    auto | on | off (default auto). Checks that need
 *                           real Cloudflare infrastructure: Workers Cache
 *                           (`cf-cache-status`), which `astro dev` doesn't
 *                           emulate, and lossless WebP at q=100, which the
 *                           real Images binding does but miniflare's
 *                           sharp-based stand-in doesn't. `auto` downgrades
 *                           them to warnings/skips for localhost.
 *                           Cache-Control is set by our own code and is
 *                           always checked.
 *
 * Run it locally after bumping emdash, @emdash-cms/* or @astrojs/cloudflare
 * (crops break silently if the image endpoint override stops applying), and
 * with --warm after each deploy.
 */
import { parseArgs } from 'node:util'

import sharp from 'sharp'

import {
  MEDIA_BROWSER_CACHE_CONTROL,
  MEDIA_FILE_PREFIX,
} from '../src/lib/media/cache'
import { COVER_PICTURE } from '../src/lib/media/picture'

const CULPRIT_HINT =
  'If this started after an EmDash/@astrojs/cloudflare upgrade, check that ' +
  'the resolveId override in astro.config.mjs still swaps in ' +
  'src/lib/media/image-endpoint.ts, and that endpoint itself.'

interface CliOptions {
  baseUrl: URL
  warm: boolean
  concurrency: number
  edgeChecks: boolean
}

interface CheckResult {
  name: string
  ok: boolean
  detail: string
  warning?: boolean
}

interface ImageUrl {
  url: URL
  page: string
}

function parseCli(): CliOptions {
  const { values } = parseArgs({
    options: {
      'base-url': { type: 'string', default: 'http://localhost:4321' },
      warm: { type: 'boolean', default: false },
      concurrency: { type: 'string', default: '6' },
      'edge-checks': { type: 'string', default: 'auto' },
    },
  })
  const baseUrl = new URL(values['base-url'])
  const concurrency = Number(values.concurrency)
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error(`--concurrency must be a positive integer`)
  }
  const mode = values['edge-checks']
  if (!['auto', 'on', 'off'].includes(mode)) {
    throw new Error(`--edge-checks must be auto, on or off (got ${mode})`)
  }
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname)
  return {
    baseUrl,
    warm: values.warm,
    concurrency,
    edgeChecks: mode === 'on' || (mode === 'auto' && !isLocal),
  }
}

const decodeEntities = (value: string) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&#38;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")

/** Every URL in a srcset (`url 280w, url 560w`). Our URLs contain no commas. */
const srcsetUrls = (srcset: string) =>
  srcset
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean)

const isMediaUrl = (url: URL) =>
  url.pathname === '/_image' || url.pathname.startsWith(MEDIA_FILE_PREFIX)

/**
 * Image URLs referenced by a page: `<img src/srcset>`, `<source srcset>`
 * and `<link rel="preload" as="image" imagesrcset/href>`, limited to
 * `/_image` transforms and EmDash media files.
 */
function extractImageUrls(html: string, pageUrl: URL): URL[] {
  const raw: string[] = []
  for (const [tag] of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    for (const [, attr, value] of tag.matchAll(/\s(src|srcset)="([^"]*)"/gi)) {
      raw.push(
        ...(attr.toLowerCase() === 'srcset' ? srcsetUrls(value) : [value])
      )
    }
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (!/\brel="preload"/i.test(tag) || !/\bas="image"/i.test(tag)) continue
    const srcset = /\simagesrcset="([^"]*)"/i.exec(tag)?.[1]
    if (srcset) raw.push(...srcsetUrls(srcset))
    const href = /\shref="([^"]*)"/i.exec(tag)?.[1]
    if (href) raw.push(href)
  }
  const urls = new Map<string, URL>()
  for (const value of raw) {
    try {
      const url = new URL(decodeEntities(value), pageUrl)
      if (url.origin === pageUrl.origin && isMediaUrl(url)) {
        urls.set(url.href, url)
      }
    } catch {
      // Not a URL (e.g. a data: placeholder we can't parse); ignore.
    }
  }
  return [...urls.values()]
}

async function fetchText(url: URL): Promise<string> {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`GET ${url.pathname} returned ${response.status}`)
  }
  return response.text()
}

/** Fetch /blog and every post linked from it. */
async function crawlBlog(baseUrl: URL) {
  const indexUrl = new URL('/blog', baseUrl)
  const indexHtml = await fetchText(indexUrl)
  const slugs = [
    ...new Set(
      [...indexHtml.matchAll(/href="\/blog\/([a-z0-9-]+)\/?"/gi)].map(
        (match) => match[1]
      )
    ),
  ]
  const pages = [{ url: indexUrl, html: indexHtml }]
  for (const slug of slugs) {
    const url = new URL(`/blog/${slug}`, baseUrl)
    pages.push({ url, html: await fetchText(url) })
  }
  const images: ImageUrl[] = []
  const seen = new Set<string>()
  for (const page of pages) {
    for (const url of extractImageUrls(page.html, page.url)) {
      if (seen.has(url.href)) continue
      seen.add(url.href)
      images.push({ url, page: page.url.pathname })
    }
  }
  return { slugs, images }
}

/** The media href inside an `/_image` URL, or null. */
const transformHref = (url: URL) =>
  url.pathname === '/_image' ? url.searchParams.get('href') : null

const param = (url: URL, name: string) => url.searchParams.get(name)
const intParam = (url: URL, name: string) => Number(param(url, name) ?? NaN)

interface FetchedImage {
  response: Response
  bytes: Buffer
}

async function fetchImage(url: URL): Promise<FetchedImage> {
  const response = await fetch(url)
  return { response, bytes: Buffer.from(await response.arrayBuffer()) }
}

async function dimensions(bytes: Buffer) {
  const { width, height } = await sharp(bytes).metadata()
  return { width: width ?? 0, height: height ?? 0 }
}

/** WebP lossless bitstreams are `VP8L` chunks (directly or after `VP8X`). */
const isLosslessWebp = (bytes: Buffer) =>
  bytes.subarray(0, 4).toString('latin1') === 'RIFF' &&
  bytes.subarray(8, 12).toString('latin1') === 'WEBP' &&
  bytes.subarray(12, 200).toString('latin1').includes('VP8L')

const describe = (url: URL) => {
  const href = transformHref(url)
  const file = href ? new URL(href).pathname.split('/').at(-1) : url.pathname
  const params = ['w', 'h', 'f', 'q', 'fit']
    .map((name) => (param(url, name) ? `${name}=${param(url, name)}` : ''))
    .filter(Boolean)
    .join('&')
  return params ? `${file} (${params})` : (file ?? url.href)
}

/** The original media file a transform reads from. */
const originalOf = (url: URL, baseUrl: URL) =>
  new URL(new URL(transformHref(url)!).pathname, baseUrl)

async function verify(options: CliOptions): Promise<CheckResult[]> {
  const { baseUrl, edgeChecks } = options
  const results: CheckResult[] = []
  const pass = (name: string, detail: string) =>
    results.push({ name, ok: true, detail })
  const fail = (name: string, detail: string) =>
    results.push({ name, ok: false, detail })
  const warn = (name: string, detail: string) =>
    results.push({ name, ok: true, warning: true, detail })

  const { slugs, images } = await crawlBlog(baseUrl)
  if (slugs.length === 0) {
    fail('blog index', `no posts linked from ${baseUrl.origin}/blog`)
    return results
  }
  pass('blog index', `${slugs.length} posts, ${images.length} image URLs`)

  const transforms = images
    .map(({ url }) => url)
    .filter((url) => transformHref(url))

  // Polaroid square crop. Prefer a source that isn't square itself, so a
  // scaled-but-not-cropped response can't pass by accident.
  const squares = transforms.filter(
    (url) =>
      param(url, 'fit') === 'cover' &&
      intParam(url, 'w') === intParam(url, 'h') &&
      intParam(url, 'w') > 0
  )
  let polaroid: URL | undefined
  for (const url of squares) {
    const { bytes } = await fetchImage(originalOf(url, baseUrl))
    const source = await dimensions(bytes).catch(() => null)
    if (source && source.width !== source.height) {
      polaroid = url
      break
    }
  }
  polaroid ??= squares[0]
  if (!polaroid) {
    fail('polaroid crop', 'no square fit=cover /_image URL found on any post')
  } else {
    const href = transformHref(polaroid)!
    const variants = new Map<string, URL>()
    for (const url of squares) {
      if (transformHref(url) === href && !variants.has(param(url, 'f')!)) {
        variants.set(param(url, 'f')!, url)
      }
    }
    for (const [format, url] of variants) {
      const expected = intParam(url, 'w')
      const { response, bytes } = await fetchImage(url)
      const name = `polaroid crop ${format}`
      if (response.status !== 200) {
        fail(name, `${describe(url)} returned ${response.status}`)
        continue
      }
      const actual = await dimensions(bytes)
      if (actual.width !== expected || actual.height !== expected) {
        fail(
          name,
          `${describe(url)} is ${actual.width}x${actual.height}, expected ` +
            `${expected}x${expected} (fit=cover was not applied: scaled, ` +
            `not cropped)`
        )
      } else {
        pass(name, `${describe(url)} is ${actual.width}x${actual.height}`)
      }
      const type = response.headers.get('content-type')
      if (type !== `image/${format}`) {
        fail(`${name} type`, `${describe(url)} is ${type}`)
      } else {
        pass(`${name} type`, type)
      }
    }
    if (!variants.has('avif')) {
      fail('polaroid avif', `no AVIF variant of ${describe(polaroid)}`)
    }
  }

  // Cover crop (2.5:1).
  const cover = transforms.find(
    (url) =>
      param(url, 'fit') === 'cover' &&
      intParam(url, 'w') === COVER_PICTURE.widths[0] &&
      intParam(url, 'h') ===
        Math.round(COVER_PICTURE.widths[0] / COVER_PICTURE.aspectRatio)
  )
  if (!cover) {
    warn('cover crop', 'no cover /_image URL found (no post has a cover?)')
  } else {
    const { response, bytes } = await fetchImage(cover)
    const actual = await dimensions(bytes).catch(() => null)
    const w = intParam(cover, 'w')
    const h = intParam(cover, 'h')
    if (response.status !== 200 || actual?.width !== w || actual.height !== h) {
      fail(
        'cover crop',
        `${describe(cover)} returned ${response.status} ` +
          `${actual?.width}x${actual?.height}, expected ${w}x${h}`
      )
    } else {
      pass('cover crop', `${describe(cover)} is ${w}x${h}`)
    }
  }

  // Screenshot (PNG source): lossless WebP only.
  const screenshot = transforms.find((url) =>
    transformHref(url)!.toLowerCase().endsWith('.png')
  )
  if (!screenshot) {
    warn('screenshot webp', 'no PNG-sourced /_image URL found')
  } else {
    const { response, bytes } = await fetchImage(screenshot)
    const type = response.headers.get('content-type')
    if (response.status !== 200 || type !== 'image/webp') {
      fail(
        'screenshot webp',
        `${describe(screenshot)} returned ${response.status} ${type}`
      )
    } else if (!isLosslessWebp(bytes)) {
      const report = edgeChecks ? fail : warn
      report(
        'screenshot webp',
        `${describe(screenshot)} is lossy WebP` +
          (edgeChecks ? '' : ' (expected locally: miniflare emulates IMAGES)')
      )
    } else {
      pass('screenshot webp', `${describe(screenshot)} is lossless WebP`)
    }
    const otherFormats = transforms.filter(
      (url) =>
        transformHref(url) === transformHref(screenshot) &&
        param(url, 'f') !== 'webp'
    )
    if (otherFormats.length > 0) {
      fail(
        'screenshot formats',
        `${describe(otherFormats[0])}: screenshots should only get WebP`
      )
    }
  }

  // Cache-Control (set by our code, so checked everywhere) and Workers Cache.
  const sample = polaroid ?? transforms[0]
  if (sample) {
    const targets: [string, URL][] = [
      ['transform', sample],
      ['media file', originalOf(sample, baseUrl)],
    ]
    for (const [label, url] of targets) {
      const first = await fetchImage(url)
      const cacheControl = first.response.headers.get('cache-control')
      if (cacheControl !== MEDIA_BROWSER_CACHE_CONTROL) {
        fail(
          `cache-control ${label}`,
          `${describe(url)}: "${cacheControl}", expected ` +
            `"${MEDIA_BROWSER_CACHE_CONTROL}" (src/lib/media/cache.ts)`
        )
      } else {
        pass(`cache-control ${label}`, cacheControl)
      }
      if (!edgeChecks) continue
      const second = await fetchImage(url)
      const status = second.response.headers.get('cf-cache-status')
      if (!status) {
        fail(`workers cache ${label}`, `${describe(url)}: no cf-cache-status`)
      } else if (status !== 'HIT') {
        // A purge or a different colo can legitimately miss once.
        warn(
          `workers cache ${label}`,
          `${describe(url)}: second request was ${status}, expected HIT`
        )
      } else {
        pass(`workers cache ${label}`, 'second request HIT')
      }
    }
  }

  // /_image must not be an open proxy.
  const forbidden: [string, string, number][] = [
    ['foreign href', 'https://example.com/a.jpg', 403],
    ['same-host non-media href', new URL('/robots.txt', baseUrl).href, 403],
    [
      'foreign-host media href',
      `https://example.com${MEDIA_FILE_PREFIX}01ARZ3NDEKTSV4RRFFQ69G5FAV.jpg`,
      404,
    ],
  ]
  for (const [name, href, expected] of forbidden) {
    const url = new URL('/_image', baseUrl)
    url.searchParams.set('href', href)
    url.searchParams.set('w', '100')
    url.searchParams.set('f', 'webp')
    const response = await fetch(url)
    await response.body?.cancel()
    if (response.status !== expected) {
      fail(
        `/_image ${name}`,
        `href=${href} returned ${response.status}, expected ${expected}`
      )
    } else {
      pass(`/_image ${name}`, `${response.status}`)
    }
  }

  return results
}

async function warm(options: CliOptions) {
  const { images } = await crawlBlog(options.baseUrl)
  const statuses = new Map<string, number>()
  const cacheStatuses = new Map<string, number>()
  const failures: string[] = []
  let bytes = 0
  let next = 0
  const started = Date.now()

  const worker = async () => {
    while (next < images.length) {
      const { url, page } = images[next++]
      try {
        const response = await fetch(url)
        const body = await response.arrayBuffer()
        bytes += body.byteLength
        const status = String(response.status)
        statuses.set(status, (statuses.get(status) ?? 0) + 1)
        const cache = response.headers.get('cf-cache-status') ?? 'none'
        cacheStatuses.set(cache, (cacheStatuses.get(cache) ?? 0) + 1)
        if (!response.ok) {
          failures.push(`${response.status} ${describe(url)} (on ${page})`)
        }
      } catch (error) {
        failures.push(`error ${describe(url)} (on ${page}): ${error}`)
      }
    }
  }
  await Promise.all(Array.from({ length: options.concurrency }, worker))

  const summary = (counts: Map<string, number>) =>
    [...counts]
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => `${key} ${count}`)
      .join(', ')
  console.log(
    `Warmed ${images.length} image URLs from ${options.baseUrl.origin} in ` +
      `${((Date.now() - started) / 1000).toFixed(1)}s ` +
      `(${(bytes / 1024 / 1024).toFixed(1)} MB)`
  )
  console.log(`  status:          ${summary(statuses)}`)
  console.log(`  cf-cache-status: ${summary(cacheStatuses)}`)
  if (!options.edgeChecks) {
    console.log('  (local dev has no Workers Cache, so "none" is expected)')
  }
  for (const failure of failures) console.error(`  FAIL ${failure}`)
  return failures.length === 0
}

async function main() {
  const options = parseCli()
  if (options.warm) {
    process.exitCode = (await warm(options)) ? 0 : 1
    return
  }

  console.log(
    `Verifying media pipeline at ${options.baseUrl.origin}` +
      (options.edgeChecks ? '' : ' (edge-only checks relaxed)')
  )
  const results = await verify(options)
  for (const { name, ok, warning, detail } of results) {
    const label =
      !ok ? 'FAIL'
      : warning ? 'warn'
      : ' ok '
    console.log(`  [${label}] ${name}: ${detail}`)
  }
  const failed = results.filter(({ ok }) => !ok)
  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed. ${CULPRIT_HINT}`)
    process.exitCode = 1
  } else {
    console.log(`\nAll ${results.length} checks passed.`)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  console.error(CULPRIT_HINT)
  process.exitCode = 1
})
