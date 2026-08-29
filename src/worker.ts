const HTML_TYPE = 'text/html'
const MARKDOWN_TYPE = 'text/markdown'
const MARKDOWN_CONTENT_TYPE = `${MARKDOWN_TYPE}; charset=utf-8`
const NOT_ACCEPTABLE_BODY = `Available: ${HTML_TYPE}, ${MARKDOWN_TYPE}\n`
const NOT_FOUND_BODY = `# Not found

- [Home](/)
- [Sitemap](/sitemap-index.xml)
- [LLMs](/llms.txt)
- [Blog](/blog)
- [About](/about)
- [Contact](/contact)
`

type Representation = typeof HTML_TYPE | typeof MARKDOWN_TYPE

type Preference = {
  quality: number
  specificity: number
}

function parseQuality(value: string): number {
  if (!/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value)) {
    return 0
  }

  return Number(value)
}

function getPreference(
  accept: string,
  representation: Representation
): Preference {
  const [representationType, representationSubtype] = representation.split('/')
  let preference: Preference = { quality: 0, specificity: -1 }

  for (const entry of accept.split(',')) {
    const [mediaRange, ...parameters] = entry.split(';')
    const parts = mediaRange.trim().toLowerCase().split('/')

    if (parts.length !== 2) {
      continue
    }

    const [rangeType, rangeSubtype] = parts
    let specificity = -1

    if (
      rangeType === representationType &&
      rangeSubtype === representationSubtype
    ) {
      specificity = 2
    } else if (rangeType === representationType && rangeSubtype === '*') {
      specificity = 1
    } else if (rangeType === '*' && rangeSubtype === '*') {
      specificity = 0
    }

    if (specificity <= preference.specificity) {
      continue
    }

    let quality = 1

    for (const parameter of parameters) {
      const separator = parameter.indexOf('=')

      if (separator === -1) {
        continue
      }

      const name = parameter.slice(0, separator).trim().toLowerCase()

      if (name === 'q') {
        quality = parseQuality(parameter.slice(separator + 1).trim())
        break
      }
    }

    preference = { quality, specificity }
  }

  return preference
}

function negotiate(accept: string | null): Representation | null {
  if (!accept?.trim()) {
    return HTML_TYPE
  }

  const html = getPreference(accept, HTML_TYPE)
  const markdown = getPreference(accept, MARKDOWN_TYPE)

  if (html.quality === 0 && markdown.quality === 0) {
    return null
  }

  const markdownIsPreferred =
    markdown.quality > html.quality ||
    (markdown.quality === html.quality &&
      markdown.specificity > html.specificity)

  return markdownIsPreferred ? MARKDOWN_TYPE : HTML_TYPE
}

function addVaryAccept(headers: Headers): void {
  const vary = headers.get('Vary')

  if (!vary) {
    headers.set('Vary', 'Accept')
    return
  }

  const tokens = vary
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)

  if (
    tokens.some((token) => token === '*' || token.toLowerCase() === 'accept')
  ) {
    return
  }

  headers.set('Vary', [...tokens, 'Accept'].join(', '))
}

function cloneAssetResponse(
  response: Response,
  method: string,
  contentType?: string
): Response {
  const headers = new Headers(response.headers)

  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  addVaryAccept(headers)

  return new Response(method === 'HEAD' ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function notAcceptable(method: string): Response {
  return new Response(method === 'HEAD' ? null : NOT_ACCEPTABLE_BODY, {
    status: 406,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Vary: 'Accept',
    },
  })
}

function markdownNotFound(response: Response, method: string): Response {
  const headers = new Headers(response.headers)

  for (const name of [
    'Content-Encoding',
    'Content-Length',
    'Content-Range',
    'ETag',
    'Last-Modified',
  ]) {
    headers.delete(name)
  }

  headers.set('Content-Type', MARKDOWN_CONTENT_TYPE)
  addVaryAccept(headers)

  return new Response(method === 'HEAD' ? null : NOT_FOUND_BODY, {
    status: 404,
    statusText: response.statusText,
    headers,
  })
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    const negotiableMethod =
      request.method === 'GET' || request.method === 'HEAD'

    if (!negotiableMethod || url.pathname !== '/') {
      const assetResponse = await env.ASSETS.fetch(request)

      if (
        negotiableMethod &&
        assetResponse.status === 404 &&
        negotiate(request.headers.get('Accept')) === MARKDOWN_TYPE
      ) {
        return markdownNotFound(assetResponse, request.method)
      }

      return assetResponse
    }

    const representation = negotiate(request.headers.get('Accept'))

    if (!representation) {
      return notAcceptable(request.method)
    }

    if (representation === MARKDOWN_TYPE) {
      const markdownRequest = new Request(
        new URL('/llms.txt', request.url),
        request
      )
      const assetResponse = await env.ASSETS.fetch(markdownRequest)
      return cloneAssetResponse(
        assetResponse,
        request.method,
        MARKDOWN_CONTENT_TYPE
      )
    }

    const assetResponse = await env.ASSETS.fetch(request)
    return cloneAssetResponse(assetResponse, request.method)
  },
} satisfies ExportedHandler<Env>
