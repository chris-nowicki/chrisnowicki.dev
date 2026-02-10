# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
pnpm dev              # Start development server at localhost:4321
pnpm build            # Build for production
pnpm preview          # Preview production build locally
pnpm test             # Run tests with Vitest
pnpm test <file>      # Run specific test file
```

## Tech Stack

- **Astro 5.x** with SSR (Server-Side Rendering) on Vercel
- **React 19.x** with `framer-motion` for interactive components
- **Tailwind CSS v4** with Vite plugin
- **TypeScript** in strict mode
- **Convex** for real-time blog view tracking
- **pnpm** package manager

## Architecture

### Rendering Strategy

- **Static pages**: Home page and individual blog posts use `prerender = true`
- **SSR pages**: Blog index uses `prerender = false` to fetch dynamic view counts
- **Client-side interactivity**: React components hydrate on the client for real-time features

### Component Organization

- **Astro components** (`.astro`) for static/server-rendered content
- **React components** (`.tsx`) in `src/components/React/` for client-side interactivity
- Props interfaces always named `Props` with optional fields having defaults

### Data Layer

- **Content collections** in `src/content/` with Zod validation
- **Static data** in `src/data/` (speaking.ts, uses.ts)
- **Site constants** in `src/lib/site.ts` (navigation, social links, metadata)
- **Convex** handles real-time view tracking with WebSocket subscriptions

### Convex Database

Schema (blogViews table):
- `slug` (string) - Blog post identifier
- `viewCount` (number), `lastReadAt` (number), `updatedAt` (number)

Functions in `convex/blogViews.ts`:
- `getViewCount(slug)` / `getViewCounts(slugs)` - Queries
- `incrementViewCount(slug)` - Mutation (upserts)

Client setup:
- `src/lib/convex.ts` - `getConvexHttpClient()` async HTTP client for SSR (Astro)
- `src/lib/convex-client.ts` - `initConvexClient()` async browser client for real-time subscriptions (React)
- Gracefully degrades if `PUBLIC_CONVEX_URL` not set

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
- Light theme only (no dark mode)

## Key Files

- `src/lib/site.ts` - Site metadata, navigation links, social links
- `src/lib/convex.ts` - Convex HTTP client for SSR
- `src/lib/convex-client.ts` - Convex browser client for React components
- `src/content.config.ts` - Content collection schemas
- `src/utils/utils.ts` - `cn()` utility, `formatDate()`, `formatViewCount()`
- `src/utils/blog-helpers.ts` - Blog post fetching and sorting

## Environment Variables

- `PUBLIC_CONVEX_URL` - Convex deployment URL
- `ENABLE_VIEW_TRACKING` - Set to `true` only in production to increment views
- `PUBLIC_DISABLE_VIEW_COUNT_PROTECTION` - Set to `true` to disable view count protection for testing (local development only)

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Run `pnpm build` before committing
