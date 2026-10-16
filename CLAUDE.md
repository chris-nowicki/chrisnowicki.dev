# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
pnpm dev              # Start development server at localhost:4321
pnpm build            # Build for production
pnpm preview          # Preview production build locally
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm typecheck        # TypeScript type checking
pnpm migrate:blog     # Convert src/content/blog → .emdash/seed.json (--dry-run, --seed-local)
pnpm seed:local       # Reset local D1/R2 and apply .emdash/seed.json
```

`pnpm lint` and `pnpm typecheck` are currently broken: TypeScript 7 isn't
supported by typescript-eslint or `astro check`. Verify with `pnpm build`.

The Astro 7 dev server can run detached (`astro dev --background`); stop
it with `pnpm astro dev stop`.

## Tech Stack

- **Astro 7.x** with the `@astrojs/cloudflare` adapter, deployed as a
  Cloudflare Worker (see `wrangler.jsonc`)
- **EmDash CMS** (`emdash`, `@emdash-cms/cloudflare`) for the blog —
  content in D1, media in R2, admin at `/_emdash/admin` (passkey login)
- **No UI framework on the site** — interactivity is small inline
  `<script>` blocks. React is installed only for the EmDash admin UI
- **Tailwind CSS v4** with Vite plugin
- **TypeScript** in strict mode
- **Plausible Analytics** for privacy-friendly pageview tracking (initialized in `Head.astro`)
- **pnpm** package manager

## Architecture

### Rendering Strategy

- `output: 'server'` (hybrid). Every non-CMS page and endpoint sets
  `export const prerender = true` — **new pages must add it**, and any
  page using `getStaticPaths` returns 500 without it.
- Blog routes (`/blog`, `/blog/[slug]`, `sitemap-blog.xml.ts`) and the
  `LatestPosts` island render on demand from EmDash and are route-cached
  in the Workers Cache: `cacheCloudflare()` + `routeRules` in
  `astro.config.mjs` (TTL), plus EmDash `cacheHint` tags via
  `applyCacheHint`. EmDash purges the `posts`/entry tags on publish,
  unpublish, delete and live saves. Routes without a rule (admin, API)
  are no-store; previews, editor renders, 404s and (via
  `src/middleware.ts`) other errors are never cached. `astro dev` never
  caches — verify against a build. Each Worker version has its own cache,
  so a deploy starts cold.
- `LatestPosts` is a server island (`server:defer` in `index.astro`) so
  the homepage stays prerendered.
- `pnpm deploy` runs `astro build && wrangler deploy` with
  `EMDASH_SITE_URL` set for the build.
- **Client-side interactivity**: small inline `<script>` blocks, no
  hydration framework.

### Component Organization

- **Astro components** (`.astro`) for all content
- Client-side behavior lives in per-component inline `<script>` blocks
  (e.g. `ThemeToggle.astro`, `MobileNav.astro`), re-initialized on
  `astro:after-swap` for view transitions
- Props interfaces always named `Props` with optional fields having defaults

### Data Layer

- **Blog**: EmDash `posts` collection (`title`, `description`, `date`,
  `cover`, Portable Text `content`; draft/published is EmDash status).
  Always read it through `src/utils/blog-helpers.ts`. Posts are written
  in `/_emdash/admin`, not in the repo.
- **Content collections** in `src/content/` with Zod validation
  (`speaking`; `src/content/blog` is the pre-migration source, kept until
  the EmDash cut-over is verified)
- **Static data** in `src/data/` (speaking.ts, uses.ts)
- **Site constants** in `src/lib/site.ts` (navigation, social links, metadata)

## Code Style

### Formatting (Prettier)

- 2 spaces, single quotes, no semicolons, trailing commas (es5)
- `bracketSameLine: true` for .astro files

### Import Order

1. External packages → 2. Astro components → 3. Internal modules (`@/`) → 4. Type imports → 5. Assets

### Naming

- **Files**: `kebab-case.ts` for utilities, `PascalCase.astro/tsx` for components
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase

### Styling

- Tailwind utility classes only (avoid custom CSS)
- Use `cn()` from `@/utils/utils.ts` for class merging
- Mobile-first responsive design (default → sm → md → lg)
- Supports light and dark mode via `.dark` class on `<html>`

### Design vocabulary

The site has a consistent "blueprint" visual language — reuse these
rather than inventing new treatments:

- **Page headers**: `PageHeader.astro` (`title` + optional `subtitle`),
  centered, `text-2xl → md:text-4xl`.
- **Section separators**: `Separator.astro` — a full-bleed dashed rule
  with `FramePlus` corner marks and an optional centered mono `label`.
- **Accent cards**: `ACCENT_CARD` from `@/lib/styles.ts` — bordered
  surface with a left-edge foreground rule that fades in on hover.
- **Grayscale → color**: imagery is `grayscale` and animates to full
  color on hover (`group-hover:grayscale-0`, ~500ms).
- **Link underline**: `link-underline` utility (animated underline);
  prose links use an offset underline that darkens on hover.
- **Motion**: entrance animations use the `cubic-bezier(0.16, 1, 0.3, 1)`
  ease curve; all motion is gated behind `prefers-reduced-motion`.
- **Cursive accents**: `font-cursive` (Reenie Beanie) for playful asides.
- **Polaroid gallery**: an EmDash gallery block in a post renders as
  `PolaroidGallery.astro` (tilted frames, grayscale → color, cursive
  captions from each image's caption).

## Key Files

- `src/lib/site.ts` - Site metadata, navigation links, social links
- `src/content.config.ts` - Content collection schemas
- `src/live.config.ts` - EmDash live collection loader
- `src/worker.ts` - Worker entry (EmDash handler + scheduled publishing cron)
- `ec.config.mjs` - Expressive Code options (must live here so the runtime
  `<Code>` used for CMS code blocks gets them)
- `.emdash/seed.json` - EmDash schema (`posts`) and migrated post content
- `scripts/migrate-blog-to-emdash.ts` - Markdown/MDX → Portable Text migration
- `src/components/blog/portable-text/` - Portable Text renderers (code,
  headings, images, blockquotes, Polaroid gallery)
- `src/utils/utils.ts` - `cn()` utility, `formatDate()`
- `src/utils/blog-helpers.ts` - Blog post fetching from EmDash
- `src/utils/og-image.ts` - Cloudinary OG image URL generation

## Environment Variables

- `PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name, used by
  `src/utils/og-image.ts` to build dynamic Open Graph image URLs.
- `EMDASH_SITE_URL` - public site URL for EmDash links, passkeys and media.
  Must be set in the **build** environment (`.env` isn't read at that
  stage); without it CMS images ship untransformed at full size.
- `EMDASH_ENCRYPTION_KEY` - EmDash secret; generate with
  `npx emdash secrets generate --write .env`.

Prerendering runs in workerd, so `.env` needs these locally too (see
`.env.example`).

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Run `pnpm build` before committing
