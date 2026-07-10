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
```

## Tech Stack

- **Astro 7.x** — fully static build (`output: 'static'`, no adapter),
  served as Cloudflare Workers static assets (see `wrangler.jsonc`)
- **No UI framework** — interactivity is small inline `<script>` blocks
- **Tailwind CSS v4** with Vite plugin
- **Markdown/MDX** — rendered by Sätteri (Astro's default Rust pipeline,
  no remark/rehype). Syntax highlighting is Shiki with dual catppuccin
  themes (`markdown.shikiConfig` in `astro.config.mjs`, `defaultColor:
  false` toggled by the `.dark` class). Code-fence `title="..."` is
  surfaced by a Shiki transformer (`src/lib/shiki-transformers.ts`) as a
  `data-title` attribute; the filename bar and copy button are styled/
  wired in `global.css` + `CodeCopyButton.astro`. Posts are plain `.md`
  by default; `.mdx` only when a component (e.g. `Polaroids`) is needed.
- **TypeScript** in strict mode
- **Plausible Analytics** for privacy-friendly pageview tracking (initialized in `Head.astro`)
- **pnpm** package manager

## Architecture

### Rendering Strategy

- `output: 'static'` — every page and endpoint (including
  `robots.txt.ts`) is prerendered to HTML/assets at build time. There is
  no server runtime.
- The build emits everything to `dist/`, which `wrangler` serves as
  static assets. `pnpm deploy` runs `astro build && wrangler deploy`.
- **Client-side interactivity**: small inline `<script>` blocks, no
  hydration framework.

### Component Organization

- **Astro components** (`.astro`) for all content
- Client-side behavior lives in per-component inline `<script>` blocks
  (e.g. `ThemeToggle.astro`, `MobileNav.astro`), re-initialized on
  `astro:after-swap` for view transitions
- Props interfaces always named `Props` with optional fields having defaults

### Data Layer

- **Content collections** in `src/content/` with Zod validation
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

The site is quiet and editorial: prose-first, single centered column,
mono-labeled metadata. Distinctiveness comes from the writing and the
docs-grade features, not visual flourish. Reuse these treatments rather
than inventing new ones:

- **Prose-first pages**: content pages are a single centered column
  (`Container.astro`, `max-w-3xl` on every page for a consistent measure).
  The home page is bio-as-prose with inline links — no hero, cards, or
  grid. Nav is a single wrapping line of text links (`NavBar.astro`), no
  hamburger.
- **Page headers**: `PageHeader.astro` (`title` + optional `subtitle`),
  centered, `text-2xl → md:text-4xl`.
- **Section labels**: `Separator.astro` — with a `label`, renders a quiet
  left-aligned mono "eyebrow" (no rule); with no label, a thin solid
  column-width divider. (The old full-bleed dashed rule + `FramePlus`
  corner marks were retired.)
- **Mono metadata**: dates, labels, and nav use `font-mono`, uppercase,
  wide tracking, `text-muted-foreground`.
- **Accent cards**: `ACCENT_CARD` from `@/lib/styles.ts` — bordered
  surface with a left-edge foreground rule that fades in on hover. Used
  on inner pages (e.g. `/uses`), not the home.
- **Grayscale → color**: imagery on inner pages is `grayscale` and
  animates to full color on hover (`group-hover:grayscale-0`, ~500ms).
- **Motion**: minimal; any entrance animation uses the
  `cubic-bezier(0.16, 1, 0.3, 1)` ease curve, gated behind
  `prefers-reduced-motion`.
- **Cursive signature**: `font-cursive` (Reenie Beanie) is reserved for
  Chris's name in the nav/home intro and the post sign-off — not general
  decoration.

## Key Files

- `src/lib/site.ts` - Site metadata, navigation links, social links
- `src/content.config.ts` - Content collection schemas
- `src/utils/utils.ts` - `cn()` utility, `formatDate()`
- `src/utils/blog-helpers.ts` - Blog post fetching and sorting
- `src/utils/og-image.ts` - Cloudinary OG image URL generation

## Environment Variables

- `PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name, used by
  `src/utils/og-image.ts` to build dynamic Open Graph image URLs.

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Run `pnpm build` before committing
