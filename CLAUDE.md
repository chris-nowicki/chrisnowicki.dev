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
