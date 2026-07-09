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

- **Astro 7.x** on Cloudflare Workers
- **React 19.x** with `framer-motion` — currently used only by the mobile nav
- **Tailwind CSS v4** with Vite plugin
- **TypeScript** in strict mode
- **Plausible Analytics** for privacy-friendly pageview tracking (initialized in `Head.astro`)
- **pnpm** package manager

## Architecture

### Rendering Strategy

- Every page sets `prerender = true` — the site is effectively static.
- The Cloudflare adapter runs in `output: 'server'` mode, but the only
  dynamic route is `src/pages/robots.txt.ts`.
- **Client-side interactivity**: React islands hydrate on the client
  (currently just the mobile nav).

### Component Organization

- **Astro components** (`.astro`) for static/server-rendered content
- **React components** (`.tsx`) in `src/components/React/` for client-side interactivity
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
