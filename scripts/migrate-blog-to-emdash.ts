/**
 * Migrate src/content/blog (Markdown + MDX) into EmDash seed content.
 *
 * Usage:
 *   pnpm migrate:blog                      # write .emdash/seed.json content.posts
 *   pnpm migrate:blog --dry-run            # convert + validate, print summary only
 *   pnpm migrate:blog --seed-local         # write, then reset local D1/R2 and seed
 *   pnpm migrate:blog --media-base-url <url>
 *
 * Media: EmDash's seed engine downloads every `$media` URL through an SSRF
 * guard that rejects localhost and private IPs, so images can't be served
 * from the local dev server. Each image is referenced by its repo-relative
 * path under `--media-base-url`, which defaults to raw.githubusercontent.com
 * pinned to MEDIA_COMMIT. With the default base the script checks (via git)
 * that every local file is byte-identical to the pinned copy.
 *
 * The converter fails loudly: any Markdown/MDX construct it doesn't
 * explicitly map throws with file + line instead of being dropped.
 *
 * Typography: Astro renders Markdown/MDX with remark-smartypants (default
 * options), so the old site showed curly quotes, dashes and ellipses. The
 * same plugin is applied to the Portable Text spans (see `smartenText`) and
 * the result is checked character-for-character against the plugin's output
 * on the source mdast.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { markdownToPortableText } from '@portabletext/markdown'
import prettier from 'prettier'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkSmartypants from 'remark-smartypants'
import { unified } from 'unified'
import { parse as parseYaml } from 'yaml'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(ROOT, 'src/content/blog')
const SEED_PATH = path.join(ROOT, '.emdash/seed.json')

/** Last commit on main that contains every blog image (public/ + src/assets/). */
const MEDIA_COMMIT = '1ad7a726059ac187b86d7b6558bab2c8b79d9072'
const DEFAULT_MEDIA_BASE_URL = `https://raw.githubusercontent.com/chris-nowicki/chrisnowicki.dev/${MEDIA_COMMIT}`

const FRONTMATTER_KEYS = new Set([
  'date',
  'title',
  'description',
  'image',
  'draft',
])
const ALLOWED_STYLES = new Set([
  'normal',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
])
const ALLOWED_DECORATORS = new Set(['strong', 'em', 'code', 'strike-through'])
const IGNORED_IMAGE_PROPS = new Set(['widths', 'sizes'])

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Span {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

interface MarkDef {
  _type: string
  _key: string
  href?: string
  title?: string
}

interface TextBlock {
  _type: 'block'
  _key: string
  style: string
  children: (Span | InlineObject)[]
  markDefs: MarkDef[]
  listItem?: 'bullet' | 'number'
  level?: number
  listId?: string
  listStart?: number
  /**
   * Set on every item of a loose Markdown list (one whose items are
   * separated by blank lines or hold several blocks). Markdown wraps those
   * items' text in `<p>`, which spaces them further apart than a tight
   * list; the blog renderer does the same for flagged items.
   */
  listLoose?: true
}

interface InlineObject {
  _type: string
  _key: string
  src?: string
  alt?: string
  title?: string
}

interface MediaRef {
  $media: { url: string; alt?: string; filename: string }
}

interface ImageBlock {
  _type: 'image'
  _key: string
  asset: MediaRef
  alt?: string
  caption?: string
  /** `_key` of the list item this image belongs to (see `flattenList`). */
  listItemKey?: string
}

interface GalleryBlock {
  _type: 'gallery'
  _key: string
  images: ImageBlock[]
}

interface CodeBlock {
  _type: 'code'
  _key: string
  code: string
  language?: string
  filename?: string
  /** `_key` of the list item this block belongs to (see `flattenList`). */
  listItemKey?: string
}

type OutputBlock = TextBlock | ImageBlock | GalleryBlock | CodeBlock

/** Raw node shapes from @portabletext/markdown (pre-normalization). */
type RawNode = { _type: string; _key: string; [key: string]: unknown }

interface ListValue extends RawNode {
  kind: 'bullet' | 'number' | 'task'
  items: { content: RawNode[] }[]
}

interface MdastNode {
  type: string
  name?: string | null
  value?: string
  start?: number | null
  ordered?: boolean | null
  spread?: boolean | null
  attributes?: MdxAttribute[]
  children?: MdastNode[]
  position?: {
    start: { line: number; offset?: number }
    end: { offset?: number }
  }
}

interface MdxAttribute {
  type: string
  name?: string
  value?: string | null | { type: string; value: string }
}

interface Post {
  file: string
  slug: string
  status: 'published' | 'draft'
  data: {
    title: string
    description: string
    date: string
    cover?: MediaRef
    content: OutputBlock[]
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class MigrationError extends Error {
  constructor(file: string, line: number | undefined, message: string) {
    super(`${file}${line ? `:${line}` : ''}: ${message}`)
  }
}

/** Deterministic `_key`s: stable across runs for unchanged source. */
const createKeyGenerator = (slug: string) => {
  let counter = 0
  return () =>
    createHash('sha256')
      .update(`${slug}:${counter++}`)
      .digest('hex')
      .slice(0, 12)
}

const isTextBlock = (node: RawNode): node is RawNode & TextBlock =>
  node._type === 'block'

const isSpan = (node: { _type: string }): node is Span => node._type === 'span'

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

class MediaResolver {
  private readonly verified = new Set<string>()

  constructor(
    private readonly baseUrl: string,
    private readonly verifyAgainstCommit: boolean
  ) {}

  /** Map a repo-relative file to a `$media` reference. */
  ref(repoPath: string, alt: string | undefined, where: string): MediaRef {
    const absolute = path.join(ROOT, repoPath)
    if (!existsSync(absolute)) {
      throw new Error(`${where}: image file not found: ${repoPath}`)
    }
    if (this.verifyAgainstCommit) this.verify(repoPath, where)
    const media: MediaRef['$media'] = {
      url: `${this.baseUrl}/${repoPath.split('/').map(encodeURIComponent).join('/')}`,
      filename: path.basename(repoPath),
    }
    if (alt) media.alt = alt
    return { $media: media }
  }

  /** A site-root path like `/blog/x.png` → `public/blog/x.png`. */
  publicRef(src: string, alt: string | undefined, where: string): MediaRef {
    if (!src.startsWith('/blog/')) {
      throw new Error(
        `${where}: unsupported image src "${src}" (expected /blog/...)`
      )
    }
    return this.ref(`public${src}`, alt, where)
  }

  private verify(repoPath: string, where: string) {
    if (this.verified.has(repoPath)) return
    const git = (...args: string[]) =>
      execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()
    let pinned: string
    try {
      pinned = git('rev-parse', `${MEDIA_COMMIT}:${repoPath}`)
    } catch {
      throw new Error(
        `${where}: ${repoPath} does not exist at ${MEDIA_COMMIT}; pass --media-base-url pointing at a public host that serves it`
      )
    }
    const local = git('hash-object', repoPath)
    if (pinned !== local) {
      throw new Error(
        `${where}: ${repoPath} differs from the copy at ${MEDIA_COMMIT}; update MEDIA_COMMIT or pass --media-base-url`
      )
    }
    this.verified.add(repoPath)
  }
}

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

const splitFrontmatter = (source: string, file: string) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source)
  if (!match) throw new MigrationError(file, 1, 'missing frontmatter')
  const frontmatter = parseYaml(match[1]) as Record<string, unknown>
  for (const key of Object.keys(frontmatter)) {
    if (!FRONTMATTER_KEYS.has(key)) {
      throw new MigrationError(file, 1, `unhandled frontmatter key "${key}"`)
    }
  }
  const bodyLineOffset = match[0].split('\n').length - 1
  // Blank out the frontmatter (keeping line count) so mdast lines match the file.
  const body = '\n'.repeat(bodyLineOffset) + source.slice(match[0].length)
  return { frontmatter, body }
}

const requireString = (
  value: unknown,
  key: string,
  file: string,
  optional = false
): string | undefined => {
  if (value === undefined && optional) return undefined
  if (typeof value !== 'string') {
    throw new MigrationError(file, 1, `frontmatter "${key}" must be a string`)
  }
  return value
}

/** Matches src/content.config.ts: dates are normalized to 12:00 UTC. */
const normalizeDate = (value: unknown, file: string) => {
  const raw = value instanceof Date ? value.toISOString().slice(0, 10) : value
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new MigrationError(file, 1, `invalid date "${String(value)}"`)
  }
  return `${raw}T12:00:00.000Z`
}

// ---------------------------------------------------------------------------
// MDX: imports and <Polaroids> → gallery
// ---------------------------------------------------------------------------

interface ImportMap {
  /** Default-import binding → repo-relative path (for image assets). */
  assets: Map<string, string>
  /** Component name → module specifier. */
  components: Map<string, string>
}

const IMPORT_PATTERN =
  /^import\s+(?:(\w+)|\{\s*(\w+)\s*\})\s+from\s+['"]([^'"]+)['"]\s*;?$/

const parseImports = (node: MdastNode, file: string, imports: ImportMap) => {
  const line = node.position?.start.line ?? 0
  const statements = (node.value ?? '').split('\n')
  statements.forEach((statement, index) => {
    const trimmed = statement.trim()
    if (!trimmed) return
    const match = IMPORT_PATTERN.exec(trimmed)
    if (!match) {
      throw new MigrationError(
        file,
        line + index,
        `unhandled ESM statement: ${trimmed}`
      )
    }
    const [, defaultName, namedName, specifier] = match
    if (/\.(png|jpe?g|webp|gif|avif)$/i.test(specifier)) {
      if (!defaultName || !specifier.startsWith('@/')) {
        throw new MigrationError(
          file,
          line + index,
          `unhandled image import: ${trimmed}`
        )
      }
      imports.assets.set(defaultName, `src/${specifier.slice(2)}`)
    } else {
      imports.components.set(defaultName ?? namedName, specifier)
    }
  })
}

const getAttribute = (
  node: MdastNode,
  name: string,
  file: string
): MdxAttribute | undefined => {
  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== 'mdxJsxAttribute') {
      throw new MigrationError(
        file,
        node.position?.start.line,
        `unhandled spread attribute on <${node.name}>`
      )
    }
  }
  return node.attributes?.find((attribute) => attribute.name === name)
}

const stringAttribute = (node: MdastNode, name: string, file: string) => {
  const attribute = getAttribute(node, name, file)
  if (attribute === undefined) return undefined
  if (typeof attribute.value !== 'string') {
    throw new MigrationError(
      file,
      node.position?.start.line,
      `<${node.name}> ${name} must be a string literal`
    )
  }
  return attribute.value
}

const assertOnlyAttributes = (
  node: MdastNode,
  allowed: Set<string>,
  file: string
) => {
  for (const attribute of node.attributes ?? []) {
    if (!attribute.name || !allowed.has(attribute.name)) {
      throw new MigrationError(
        file,
        node.position?.start.line,
        `unhandled attribute "${attribute.name}" on <${node.name}>`
      )
    }
  }
}

const unwrapImage = (figure: MdastNode, file: string): MdastNode => {
  const children = figure.children ?? []
  // `<Image />` on its own line is a flow element; inline it's wrapped in a <p>.
  const [only] =
    children.length === 1 && children[0].type === 'paragraph' ?
      (children[0].children ?? [])
    : children
  const count =
    children.length === 1 && children[0].type === 'paragraph' ?
      (children[0].children ?? []).length
    : children.length
  if (
    count !== 1 ||
    !only ||
    !['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(only.type) ||
    only.name !== 'Image'
  ) {
    throw new MigrationError(
      file,
      figure.position?.start.line,
      '<figure> must contain exactly one <Image />'
    )
  }
  return only
}

const polaroidsToGallery = (
  node: MdastNode,
  file: string,
  imports: ImportMap,
  media: MediaResolver,
  nextKey: () => string
): GalleryBlock => {
  assertOnlyAttributes(node, new Set(), file)
  const images = (node.children ?? []).map((figure): ImageBlock => {
    const line = figure.position?.start.line
    if (figure.type !== 'mdxJsxFlowElement' || figure.name !== 'figure') {
      throw new MigrationError(
        file,
        line,
        `unhandled <Polaroids> child: ${figure.name ?? figure.type}`
      )
    }
    assertOnlyAttributes(figure, new Set(['data-caption']), file)
    const caption = stringAttribute(figure, 'data-caption', file)

    const image = unwrapImage(figure, file)
    assertOnlyAttributes(
      image,
      new Set(['src', 'alt', ...IGNORED_IMAGE_PROPS]),
      file
    )
    const src = getAttribute(image, 'src', file)?.value
    if (
      typeof src !== 'object' ||
      src === null ||
      src.type !== 'mdxJsxAttributeValueExpression'
    ) {
      throw new MigrationError(
        file,
        line,
        '<Image> src must be {importedAsset}'
      )
    }
    const assetPath = imports.assets.get(src.value.trim())
    if (!assetPath) {
      throw new MigrationError(
        file,
        line,
        `<Image> src {${src.value}} is not an imported asset`
      )
    }
    const alt = stringAttribute(image, 'alt', file)

    const block: ImageBlock = {
      _type: 'image',
      _key: nextKey(),
      asset: media.ref(assetPath, alt, `${file}:${line}`),
    }
    if (alt) block.alt = alt
    if (caption) block.caption = caption
    return block
  })
  if (images.length === 0) {
    throw new MigrationError(
      file,
      node.position?.start.line,
      'empty <Polaroids>'
    )
  }
  return { _type: 'gallery', _key: nextKey(), images }
}

// ---------------------------------------------------------------------------
// mdast pass: validate, strip ESM, extract galleries
// ---------------------------------------------------------------------------

const MDX_NODE_TYPES = new Set([
  'mdxjsEsm',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxFlowExpression',
  'mdxTextExpression',
])
const UNSUPPORTED_MDAST = new Set([
  'html',
  'table',
  'footnoteDefinition',
  'footnoteReference',
  'definition',
  'linkReference',
  'imageReference',
  'thematicBreak',
])

const DECORATOR_MDAST = new Set(['strong', 'emphasis', 'delete'])

/**
 * @portabletext/markdown 2.5.1 corrupts its mark stack when a link is nested
 * inside a decorator (`**[a](u)**`): the link mark leaks onto following text
 * and paragraphs. When the decorator wraps exactly the link, rewrite it to the
 * equivalent `[**a**](u)`; any other nesting throws.
 */
const hoistLinkOutOfDecorator = (
  source: string,
  decorator: MdastNode,
  link: MdastNode,
  file: string
) => {
  const line = link.position?.start.line
  const children = link.children ?? []
  if (decorator.children?.length !== 1 || !children.length) {
    throw new MigrationError(
      file,
      line,
      'link nested inside partially-decorated text is not supported; wrap the whole link'
    )
  }
  const decoratorStart = decorator.position!.start.offset!
  const decoratorEnd = decorator.position!.end.offset!
  const linkStart = link.position!.start.offset!
  const linkEnd = link.position!.end.offset!
  const innerStart = children[0].position!.start.offset!
  const innerEnd = children.at(-1)!.position!.end.offset!
  const open = source.slice(decoratorStart, linkStart)
  const close = source.slice(linkEnd, decoratorEnd)
  if (source[linkStart] !== '[') {
    throw new MigrationError(
      file,
      line,
      'unhandled link syntax inside decorator'
    )
  }
  return {
    start: decoratorStart,
    end: decoratorEnd,
    text: `[${open}${source.slice(innerStart, innerEnd)}${close}${source.slice(innerEnd, linkEnd)}`,
  }
}

const GALLERY_PLACEHOLDER = (index: number) =>
  `EMDASHGALLERYPLACEHOLDER${index}`

interface PreparedBody {
  markdown: string
  galleries: GalleryBlock[]
  orderedListStarts: number[]
  looseLists: boolean[]
  textProfile: TextProfile
}

// ---------------------------------------------------------------------------
// Smart punctuation (matches Astro's Markdown pipeline)
// ---------------------------------------------------------------------------

type SmartypantsNode = {
  type: string
  value?: string
  children?: SmartypantsNode[]
}

/** remark-smartypants with Astro's (default) options, as a tree transform. */
const smartypants = remarkSmartypants as unknown as () => (
  tree: SmartypantsNode
) => void

/**
 * Apply remark-smartypants to the Portable Text spans. The spans are mapped
 * onto the mdast shape the plugin expects: each text block is a paragraph
 * (fresh quote context), each span a `text` node, and `code`-marked spans are
 * `inlineCode` (they keep their text but still give neighbouring quotes their
 * context). The plugin pairs quotes across the whole run of nodes, so quotes
 * split across differently-marked spans are resolved like on the old site.
 * Code blocks, image alt text and captions are not prose and are untouched,
 * exactly as in Astro (captions were JSX attributes there).
 */
const smartenText = (blocks: OutputBlock[]) => {
  const spans = new Map<SmartypantsNode, Span>()
  const tree: SmartypantsNode = {
    type: 'root',
    children: blocks
      .filter((block): block is TextBlock => block._type === 'block')
      .map((block) => ({
        type: 'paragraph',
        children: block.children.filter(isSpan).map((span) => {
          const node = {
            type: span.marks.includes('code') ? 'inlineCode' : 'text',
            value: span.text,
          }
          spans.set(node, span)
          return node
        }),
      })),
  }
  smartypants()(tree)
  for (const [node, span] of spans) span.text = node.value!
}

// ---------------------------------------------------------------------------
// Text/mark parity check
// ---------------------------------------------------------------------------

/**
 * Non-whitespace character counts (total and per mark kind), plus the
 * non-whitespace text itself in document order.
 */
interface TextProfile {
  counts: Record<string, number>
  text: string
}

const emptyProfile = (): TextProfile => ({ counts: {}, text: '' })

const MDAST_MARKS: Record<string, string> = {
  strong: 'strong',
  emphasis: 'em',
  delete: 'strike-through',
  inlineCode: 'code',
  link: 'link',
}

const addText = (
  profile: TextProfile,
  text: string,
  marks: Iterable<string>
) => {
  const compact = text.replace(/\s+/g, '')
  if (!compact) return
  const { counts } = profile
  profile.text += compact
  counts.total = (counts.total ?? 0) + compact.length
  for (const mark of marks) counts[mark] = (counts[mark] ?? 0) + compact.length
}

const mdastTextProfile = (tree: MdastNode, skip: Set<MdastNode>) => {
  const profile = emptyProfile()
  const visit = (node: MdastNode, marks: Set<string>) => {
    if (skip.has(node) || node.type === 'code' || node.type === 'image') return
    const mark = MDAST_MARKS[node.type]
    const active = mark ? new Set([...marks, mark]) : marks
    if (node.type === 'text' || node.type === 'inlineCode') {
      addText(profile, node.value ?? '', active)
    }
    node.children?.forEach((child) => visit(child, active))
  }
  visit(tree, new Set())
  return profile
}

const portableTextProfile = (blocks: OutputBlock[]) => {
  const profile = emptyProfile()
  for (const block of blocks) {
    if (block._type !== 'block') continue
    const links = new Set(block.markDefs.map((def) => def._key))
    for (const child of block.children) {
      if (!isSpan(child)) continue
      const marks = new Set(
        child.marks.map((mark) => (links.has(mark) ? 'link' : mark))
      )
      addText(profile, child.text, marks)
    }
  }
  return profile
}

/**
 * Guards against converter bugs (like the leaked-link-mark one): every
 * character of prose, and every character under each mark, must survive.
 * `expected` is profiled after remark-smartypants ran on the source mdast,
 * so this also proves the PT spans got the same typography as Astro's render.
 */
const assertSameProfile = (
  expected: TextProfile,
  actual: TextProfile,
  file: string
) => {
  const keys = new Set([
    ...Object.keys(expected.counts),
    ...Object.keys(actual.counts),
  ])
  const diffs = [...keys]
    .filter((key) => (expected.counts[key] ?? 0) !== (actual.counts[key] ?? 0))
    .map(
      (key) =>
        `${key}: source ${expected.counts[key] ?? 0} vs PT ${actual.counts[key] ?? 0}`
    )
  if (diffs.length) {
    throw new MigrationError(
      file,
      undefined,
      `text/mark mismatch (${diffs.join('; ')})`
    )
  }
  if (expected.text !== actual.text) {
    let index = 0
    while (expected.text[index] === actual.text[index]) index++
    const around = (text: string) =>
      JSON.stringify(text.slice(Math.max(0, index - 30), index + 30))
    throw new MigrationError(
      file,
      undefined,
      `text mismatch at char ${index}: source ${around(expected.text)} vs PT ${around(actual.text)}`
    )
  }
}

/**
 * Whether Markdown renders a list as loose (items' text wrapped in `<p>`).
 * Same rule as mdast-util-to-hast, which Astro uses: the list or any item is
 * spread, or an item without a `spread` flag holds more than one child.
 */
const isLooseList = (list: MdastNode) =>
  !!list.spread ||
  (list.children ?? []).some((item) =>
    item.spread == null ? (item.children?.length ?? 0) > 1 : item.spread
  )

const prepareBody = (
  body: string,
  file: string,
  isMdx: boolean,
  media: MediaResolver,
  nextKey: () => string
): PreparedBody => {
  // Same Markdown dialect Astro renders the posts with (GFM on).
  const processor = unified().use(remarkParse).use(remarkGfm)
  if (isMdx) processor.use(remarkMdx)
  const tree = processor.parse(body) as MdastNode

  const imports: ImportMap = { assets: new Map(), components: new Map() }
  const galleries: GalleryBlock[] = []
  const replacements: { start: number; end: number; text: string }[] = []
  const orderedListStarts: number[] = []
  const looseLists: boolean[] = []

  // Top level: ESM is stripped, <Polaroids> becomes a gallery placeholder.
  for (const node of tree.children ?? []) {
    const start = node.position?.start.offset
    const end = node.position?.end.offset
    if (node.type === 'mdxjsEsm') {
      parseImports(node, file, imports)
      replacements.push({ start: start!, end: end!, text: '' })
    } else if (node.type === 'mdxJsxFlowElement' && node.name === 'Polaroids') {
      galleries.push(polaroidsToGallery(node, file, imports, media, nextKey))
      replacements.push({
        start: start!,
        end: end!,
        text: GALLERY_PLACEHOLDER(galleries.length - 1),
      })
    }
  }

  if (isMdx) {
    if (imports.components.get('Image') !== 'astro:assets') {
      if (galleries.length) {
        throw new MigrationError(
          file,
          undefined,
          '<Image> is not imported from astro:assets'
        )
      }
    }
    if (galleries.length && !imports.components.has('Polaroids')) {
      throw new MigrationError(file, undefined, '<Polaroids> is not imported')
    }
  }

  // Everything else must be plain Markdown the converter understands.
  const handled = new Set(
    (tree.children ?? []).filter(
      (node) =>
        node.type === 'mdxjsEsm' ||
        (node.type === 'mdxJsxFlowElement' && node.name === 'Polaroids')
    )
  )
  const walk = (node: MdastNode, parent?: MdastNode) => {
    if (handled.has(node)) return
    const line = node.position?.start.line
    if (MDX_NODE_TYPES.has(node.type)) {
      const label = node.name ? `<${node.name}>` : node.type
      throw new MigrationError(file, line, `unhandled MDX node ${label}`)
    }
    if (UNSUPPORTED_MDAST.has(node.type)) {
      throw new MigrationError(
        file,
        line,
        `unhandled Markdown node "${node.type}"`
      )
    }
    if (node.type === 'list' && node.ordered) {
      orderedListStarts.push(node.start ?? 1)
    }
    if (node.type === 'list') looseLists.push(isLooseList(node))
    if (node.type === 'link' && parent && DECORATOR_MDAST.has(parent.type)) {
      replacements.push(hoistLinkOutOfDecorator(body, parent, node, file))
    }
    node.children?.forEach((child) => walk(child, node))
  }
  walk(tree)
  // Profile the text as Astro rendered it (smart quotes, dashes, ellipses).
  smartypants()(tree as SmartypantsNode)

  let markdown = body
  for (const { start, end, text } of replacements.sort(
    (a, b) => b.start - a.start
  )) {
    markdown = markdown.slice(0, start) + text + markdown.slice(end)
  }
  return {
    markdown,
    galleries,
    orderedListStarts,
    looseLists,
    textProfile: mdastTextProfile(tree, handled),
  }
}

// ---------------------------------------------------------------------------
// Portable Text normalization (library output → EmDash built-in shapes)
// ---------------------------------------------------------------------------

interface NormalizeContext {
  file: string
  slug: string
  slugs: Set<string>
  media: MediaResolver
  nextKey: () => string
  galleries: GalleryBlock[]
  orderedListStarts: number[]
  orderedListIndex: number
  /** Looseness of every list, in document order (`isLooseList`). */
  looseLists: boolean[]
  listIndex: number
}

/** Fence info string → bare language + optional `title="..."` as filename. */
const normalizeCode = (node: RawNode, ctx: NormalizeContext): CodeBlock => {
  const info = String(node.language ?? '').trim()
  const [language, ...rest] = info.split(/\s+/)
  const meta = rest.join(' ').trim()
  const block: CodeBlock = {
    _type: 'code',
    _key: node._key,
    code: String(node.code ?? ''),
  }
  if (language) block.language = language
  if (meta) {
    const match = /^title=(?:"([^"]*)"|'([^']*)')$/.exec(meta)
    if (!match) {
      throw new MigrationError(
        ctx.file,
        undefined,
        `unhandled code fence meta "${meta}"`
      )
    }
    block.filename = match[1] ?? match[2]
  }
  return block
}

const normalizeHref = (href: string, ctx: NormalizeContext) => {
  if (/^(https?:|mailto:|#|\/)/.test(href)) return href
  // Relative links resolve against /blog/<slug>; make them explicit.
  if (ctx.slugs.has(href)) return `/blog/${href}`
  throw new MigrationError(
    ctx.file,
    undefined,
    `unhandled relative link "${href}"`
  )
}

const imageFromInline = (
  node: InlineObject | RawNode,
  ctx: NormalizeContext
): ImageBlock => {
  const alt = typeof node.alt === 'string' && node.alt ? node.alt : undefined
  const block: ImageBlock = {
    _type: 'image',
    _key: node._key,
    asset: ctx.media.publicRef(String(node.src), alt, ctx.file),
  }
  if (alt) block.alt = alt
  if (typeof node.title === 'string' && node.title) block.caption = node.title
  return block
}

/**
 * EmDash text blocks only hold spans, so inline images are hoisted into
 * block-level images emitted right after the text block. Only trailing images
 * are allowed: an image followed by more text would reorder content.
 */
const normalizeTextBlock = (
  node: RawNode & TextBlock,
  ctx: NormalizeContext
): { block: TextBlock; hoisted: ImageBlock[] } => {
  if (!ALLOWED_STYLES.has(node.style)) {
    throw new MigrationError(
      ctx.file,
      undefined,
      `unhandled block style "${node.style}"`
    )
  }
  const markDefs = (node.markDefs ?? []).map((def): MarkDef => {
    if (def._type !== 'link' || typeof def.href !== 'string') {
      throw new MigrationError(
        ctx.file,
        undefined,
        `unhandled annotation "${def._type}"`
      )
    }
    const link: MarkDef = {
      _type: 'link',
      _key: def._key,
      href: normalizeHref(def.href, ctx),
    }
    if (def.title) link.title = def.title
    return link
  })
  const markKeys = new Set(markDefs.map((def) => def._key))

  const children: Span[] = []
  const hoisted: ImageBlock[] = []
  for (const child of node.children) {
    if (isSpan(child)) {
      if (hoisted.length && child.text.trim()) {
        throw new MigrationError(
          ctx.file,
          undefined,
          `text after an inline image ("${child.text.slice(0, 30)}") can't be represented`
        )
      }
      for (const mark of child.marks) {
        if (!ALLOWED_DECORATORS.has(mark) && !markKeys.has(mark)) {
          throw new MigrationError(
            ctx.file,
            undefined,
            `unhandled mark "${mark}"`
          )
        }
      }
      if (!hoisted.length) children.push({ ...child, marks: [...child.marks] })
    } else if (child._type === 'image') {
      hoisted.push(imageFromInline(child, ctx))
    } else {
      throw new MigrationError(
        ctx.file,
        undefined,
        `unhandled inline object "${child._type}"`
      )
    }
  }
  // Drop the whitespace that separated text from a hoisted image.
  if (hoisted.length) {
    while (children.length && !children.at(-1)!.text.trim()) children.pop()
    const last = children.at(-1)
    if (last) last.text = last.text.trimEnd()
  }
  if (!children.length) {
    throw new MigrationError(
      ctx.file,
      undefined,
      'text block is empty after hoisting images'
    )
  }

  const block: TextBlock = {
    _type: 'block',
    _key: node._key,
    style: node.style,
    children,
    markDefs,
  }
  return { block, hoisted }
}

const appendParagraph = (
  target: TextBlock,
  source: TextBlock,
  ctx: NormalizeContext
) => {
  // Multi-paragraph list items: PT list items are single blocks, so the
  // extra paragraph joins the item after a blank line (two hard breaks).
  target.children.push(
    { _type: 'span', _key: ctx.nextKey(), text: '\n', marks: [] },
    { _type: 'span', _key: ctx.nextKey(), text: '\n', marks: [] },
    ...source.children
  )
  target.markDefs.push(...source.markDefs)
}

const flattenList = (
  list: ListValue,
  level: number,
  ctx: NormalizeContext,
  out: OutputBlock[]
) => {
  if (list.kind === 'task') {
    throw new MigrationError(ctx.file, undefined, 'unhandled task list')
  }
  const loose = ctx.looseLists[ctx.listIndex++]
  if (loose === undefined) {
    throw new MigrationError(ctx.file, undefined, 'list count mismatch')
  }
  let listId: string | undefined
  let listStart: number | undefined
  if (list.kind === 'number') {
    const start = ctx.orderedListStarts[ctx.orderedListIndex]
    if (start === undefined) {
      throw new MigrationError(
        ctx.file,
        undefined,
        'ordered list count mismatch'
      )
    }
    listId = `${ctx.slug}-list-${ctx.orderedListIndex}`
    listStart = start
    ctx.orderedListIndex++
  }

  list.items.forEach((item, itemIndex) => {
    const [first, ...rest] = item.content
    if (!first || !isTextBlock(first)) {
      throw new MigrationError(
        ctx.file,
        undefined,
        'list item must start with text'
      )
    }
    const { block: itemBlock, hoisted } = normalizeTextBlock(first, ctx)
    itemBlock.listItem = list.kind as 'bullet' | 'number'
    itemBlock.level = level
    if (loose) itemBlock.listLoose = true
    if (listId) {
      // A shared listId keeps numbering continuous when hoisted images or
      // code blocks split the list into several runs.
      itemBlock.listId = listId
      if (itemIndex === 0 && listStart !== 1) itemBlock.listStart = listStart
    }
    out.push(itemBlock)
    let pending: OutputBlock[] = [...hoisted]
    let sawNestedList = false
    // PT list items can't hold blocks, so images/code inside an item are
    // emitted right after it with a back-reference to the item; the blog
    // renderer nests them into the item again (see `withListItemBlocks`).
    const flushPending = () => {
      for (const block of pending) {
        if (block._type !== 'image' && block._type !== 'code') {
          throw new MigrationError(
            ctx.file,
            undefined,
            `unhandled ${block._type} block inside a list item`
          )
        }
        if (sawNestedList) {
          throw new MigrationError(
            ctx.file,
            undefined,
            'list item image/code block after a nested list cannot be represented'
          )
        }
        block.listItemKey = itemBlock._key
      }
      out.push(...pending)
      pending = []
    }

    for (const node of rest) {
      if (isTextBlock(node)) {
        const { block, hoisted: more } = normalizeTextBlock(node, ctx)
        if (pending.length) {
          throw new MigrationError(
            ctx.file,
            undefined,
            'list item paragraph after an image/code block cannot be represented'
          )
        }
        appendParagraph(itemBlock, block, ctx)
        pending = [...more]
      } else if (node._type === 'list') {
        flushPending()
        sawNestedList = true
        flattenList(node as ListValue, level + 1, ctx, out)
      } else {
        pending.push(...normalizeNode(node, ctx))
      }
    }
    flushPending()
  })
}

const normalizeNode = (node: RawNode, ctx: NormalizeContext): OutputBlock[] => {
  switch (node._type) {
    case 'block': {
      const textBlock = node as RawNode & TextBlock
      const text = textBlock.children
        .map((child) => (isSpan(child) ? child.text : ''))
        .join('')
      const placeholder = /^EMDASHGALLERYPLACEHOLDER(\d+)$/.exec(text.trim())
      if (placeholder) return [ctx.galleries[Number(placeholder[1])]]
      if (textBlock.listItem) {
        throw new MigrationError(
          ctx.file,
          undefined,
          'unexpected flat list item'
        )
      }
      const { block, hoisted } = normalizeTextBlock(textBlock, ctx)
      return [block, ...hoisted]
    }
    case 'code':
      return [normalizeCode(node, ctx)]
    case 'image':
      return [imageFromInline(node, ctx)]
    case 'list': {
      const out: OutputBlock[] = []
      flattenList(node as ListValue, 1, ctx, out)
      return out
    }
    default:
      throw new MigrationError(
        ctx.file,
        undefined,
        `unhandled block type "${node._type}"`
      )
  }
}

// ---------------------------------------------------------------------------
// Post conversion
// ---------------------------------------------------------------------------

const convertPost = (
  fileName: string,
  slugs: Set<string>,
  media: MediaResolver
): Post => {
  const file = path.relative(ROOT, path.join(BLOG_DIR, fileName))
  const slug = fileName.replace(/\.mdx?$/, '')
  const source = readFileSync(path.join(BLOG_DIR, fileName), 'utf8')
  const { frontmatter, body } = splitFrontmatter(source, file)
  const nextKey = createKeyGenerator(slug)

  const title = requireString(frontmatter.title, 'title', file)!
  const description = requireString(
    frontmatter.description,
    'description',
    file
  )!
  const image = requireString(frontmatter.image, 'image', file, true)
  if (typeof frontmatter.draft !== 'boolean') {
    throw new MigrationError(file, 1, 'frontmatter "draft" must be a boolean')
  }

  const { markdown, galleries, orderedListStarts, looseLists, textProfile } =
    prepareBody(body, file, fileName.endsWith('.mdx'), media, nextKey)

  const raw = markdownToPortableText(markdown, {
    keyGenerator: nextKey,
    onDegradation: ({ message }) => {
      throw new MigrationError(file, undefined, message)
    },
    types: {
      // Structured lists keep each item's paragraphs/code/images together so
      // they can be flattened into EmDash's flat list blocks deliberately.
      list: ({ context, value }) => ({
        _type: 'list',
        _key: context.keyGenerator(),
        ...value,
      }),
    },
  }) as RawNode[]

  const ctx: NormalizeContext = {
    file,
    slug,
    slugs,
    media,
    nextKey,
    galleries,
    orderedListStarts,
    orderedListIndex: 0,
    looseLists,
    listIndex: 0,
  }
  const content = raw.flatMap((node) => normalizeNode(node, ctx))
  smartenText(content)

  assertSameProfile(textProfile, portableTextProfile(content), file)
  if (ctx.orderedListIndex !== orderedListStarts.length) {
    throw new MigrationError(file, undefined, 'ordered list count mismatch')
  }
  if (ctx.listIndex !== looseLists.length) {
    throw new MigrationError(file, undefined, 'list count mismatch')
  }
  const usedGalleries = content.filter((block) => block._type === 'gallery')
  if (usedGalleries.length !== galleries.length) {
    throw new MigrationError(
      file,
      undefined,
      'gallery placeholder was not converted'
    )
  }

  const post: Post = {
    file,
    slug,
    status: frontmatter.draft ? 'draft' : 'published',
    data: {
      title,
      description,
      date: normalizeDate(frontmatter.date, file),
      content,
    },
  }
  if (image) post.data.cover = media.publicRef(image, title, `${file} (cover)`)
  return post
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const summarize = (post: Post) => {
  const count = (type: string) =>
    post.data.content.filter((block) => block._type === type).length
  const galleryImages = post.data.content
    .filter((block): block is GalleryBlock => block._type === 'gallery')
    .reduce((sum, gallery) => sum + gallery.images.length, 0)
  return {
    slug: post.slug,
    status: post.status,
    date: post.data.date,
    cover: post.data.cover ? post.data.cover.$media.filename : '-',
    blocks: post.data.content.length,
    code: count('code'),
    images: count('image'),
    galleries: `${count('gallery')} (${galleryImages} images)`,
  }
}

export const migrateBlog = async (options: {
  mediaBaseUrl?: string
  dryRun?: boolean
}) => {
  const baseUrl = (options.mediaBaseUrl ?? DEFAULT_MEDIA_BASE_URL).replace(
    /\/+$/,
    ''
  )
  if (!/^https?:\/\//.test(baseUrl)) {
    throw new Error(`--media-base-url must be an http(s) URL, got "${baseUrl}"`)
  }
  const media = new MediaResolver(baseUrl, baseUrl === DEFAULT_MEDIA_BASE_URL)

  const files = readdirSync(BLOG_DIR)
    .filter((name) => /\.mdx?$/.test(name))
    .sort()
  const slugs = new Set(files.map((name) => name.replace(/\.mdx?$/, '')))
  const posts = files.map((name) => convertPost(name, slugs, media))

  console.table(posts.map(summarize))

  if (options.dryRun) return posts

  const seed = JSON.parse(readFileSync(SEED_PATH, 'utf8'))
  seed.content = {
    ...seed.content,
    posts: posts.map(({ slug, status, data }) => ({
      id: `post-${slug}`,
      slug,
      status,
      data,
    })),
  }
  const prettierConfig = (await prettier.resolveConfig(SEED_PATH)) ?? {}
  const formatted = await prettier.format(JSON.stringify(seed), {
    ...prettierConfig,
    plugins: [],
    filepath: SEED_PATH,
  })
  writeFileSync(SEED_PATH, formatted)
  console.log(
    `Wrote ${posts.length} posts to ${path.relative(ROOT, SEED_PATH)}`
  )
  return posts
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  const { values } = parseArgs({
    options: {
      'media-base-url': { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      'seed-local': { type: 'boolean', default: false },
      port: { type: 'string', default: '4321' },
    },
  })
  try {
    await migrateBlog({
      mediaBaseUrl: values['media-base-url'],
      dryRun: values['dry-run'],
    })
    if (values['seed-local'] && !values['dry-run']) {
      const { seedLocal } = await import('./seed-local-emdash.ts')
      await seedLocal({ port: Number(values.port) })
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
