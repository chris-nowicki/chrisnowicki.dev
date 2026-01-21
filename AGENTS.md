# Coding Agent Guidelines for chrisnowicki.dev

This document provides essential information for AI coding agents working on the Chris Nowicki portfolio website built with Astro, Svelte, and TypeScript.

## Tech Stack

- **Framework**: Astro 5.x with SSR (Server-Side Rendering)
- **UI Components**: Svelte 5.x for interactive components
- **Styling**: Tailwind CSS v4 with Vite plugin
- **TypeScript**: Strict mode enabled
- **Package Manager**: pnpm (v10.26.2)
- **Deployment**: Vercel
- **Database**: Convex for view tracking with real-time subscriptions
- **Content**: Markdown with rehype plugins for auto-linking headings

## Build and Development Commands

```bash
# Development
pnpm dev              # Start development server at localhost:4321

# Building
pnpm build            # Build for production
pnpm preview          # Preview production build locally

# Testing
pnpm test             # Run tests with Vitest
pnpm test <file>      # Run specific test file
pnpm test:watch       # Run tests in watch mode

# Astro CLI
pnpm astro            # Access Astro CLI commands
```

## Project Structure

```
src/
├── assets/           # Images and icons
├── components/       # Astro and Svelte components
│   └── Svelte/      # Svelte-specific components
├── content/         # Content collections (blog posts)
├── data/            # Static data files
├── layouts/         # Layout templates
├── lib/             # Core library files and constants
│   └── convex.ts    # Convex client configuration
├── pages/           # Astro page routes
├── styles/          # Global styles
├── types.ts         # TypeScript type definitions
└── utils/           # Utility functions

convex/               # Convex backend (at project root)
├── schema.ts        # Database schema definition
├── blogViews.ts     # Query and mutation functions
└── _generated/      # Auto-generated types and API (do not edit)
```

## Code Style Guidelines

### Import Organization

1. **Order**: External packages → Astro components → Internal modules → Types → Assets
2. **Path aliases**: Use `@/` for `src/` directory imports
3. **Type imports**: Always use `import type` for TypeScript types

```typescript
// Example import order
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Site, Metadata } from '@/types'
import Link from './Link.astro'
import Button from './Button.astro'
import ArrowSquiggle from '@/assets/icons/arrow-squiggle.svg'
```

### TypeScript Conventions

- **Strict mode**: Always enabled - handle null checks properly
- **Type exports**: Define shared types in `src/types.ts`
- **Const assertions**: Use `as const` for readonly arrays/objects
- **File extensions**: `.ts` for logic, `.astro` for components

### Component Guidelines

#### Astro Components (.astro)

```astro
---
// Props interface first
interface Props {
  title: string
  description?: string
}

// Destructure props with defaults
const { title, description = 'Default description' } = Astro.props
---

<section class="component-class">
  <!-- Component markup -->
</section>
```

#### Svelte Components (.svelte)

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { cn } from '@/utils/utils'

  // Props
  export let isActive = false

  // State
  let localState = ''

  // Lifecycle
  onMount(() => {
    // Initialization
    return () => {
      // Cleanup
    }
  })
</script>
```

### Styling Conventions

- **Tailwind CSS**: Use utility classes, avoid custom CSS
- **Class merging**: Use `cn()` utility from `utils/utils.ts`
- **Responsive**: Mobile-first approach (default → sm → md → lg)
- **Dark mode**: Not implemented (light theme only)

### Formatting Rules (Prettier)

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "singleQuote": true,
  "semi": false,
  "trailingComma": "es5",
  "bracketSameLine": true (for .astro files)
}
```

### Naming Conventions

- **Files**: `kebab-case.ts` for utilities, `PascalCase.astro/svelte` for components
- **Variables/Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE` for global constants
- **Types/Interfaces**: `PascalCase`
- **Props interfaces**: Always name as `Props` in components

### Error Handling

- Use TypeScript's strict null checks
- Validate props with TypeScript interfaces
- Handle async errors with try/catch blocks
- Provide meaningful error messages

### Performance Considerations

- Use Astro's `Image` component for optimized images
- Implement proper loading states for async operations
- Use `transition:persist` for client-side navigation
- Leverage Astro's partial hydration (only hydrate interactive components)

## Content Management

- Blog posts stored in `src/content/blog/` as Markdown files
- Content collections defined in `src/content.config.ts`
- Frontmatter validation through Zod schemas
- Reading time calculated automatically

## Testing Guidelines

- Test files: `*.test.ts` or `*.spec.ts`
- Framework: Vitest
- Focus on utility functions and business logic
- Component testing not currently implemented

## Git Workflow

- Commit messages: Use conventional commits (feat:, fix:, docs:, etc.)
- Branch naming: `feature/description` or `fix/description`
- Always run `pnpm build` before committing

## Common Tasks

### Adding a New Page

1. Create `.astro` file in `src/pages/`
2. Import and use `PageLayout` from `src/layouts/`
3. Add to navigation in `src/lib/site.ts` if needed

### Adding a Blog Post

1. Create `.md` file in `src/content/blog/`
2. Include required frontmatter (title, date, description, tags)
3. Images go in `public/blog/[slug]/`

### Creating Components

1. Astro components for static content
2. Svelte components for interactivity
3. Always define Props interface
4. Use semantic HTML and accessibility attributes

## Environment Variables

The following environment variables are required for full functionality:

- `PUBLIC_CONVEX_URL`: Your Convex deployment URL (e.g., `https://your-project.convex.cloud`)
- `ENABLE_VIEW_TRACKING`: Set to `true` to enable view count incrementing (should only be `true` in production)

**Note**: View tracking will gracefully degrade if Convex environment variables are not set (view counts will default to 0). The `ENABLE_VIEW_TRACKING` flag protects production data from being skewed during local development or preview deployments.

## Database (Convex)

Convex is used for blog post view tracking with real-time subscriptions.

### Schema

- **Table**: `blogViews`
- **Columns**:
  - `slug` (string) - Blog post identifier
  - `viewCount` (number) - Total view count
  - `lastReadAt` (number) - Unix timestamp of last view
  - `updatedAt` (number) - Unix timestamp of last update
- **Index**: `by_slug` for efficient slug lookups

### Functions

Located in `convex/blogViews.ts`:

- `getViewCount(slug)` - Query: Get view count for a single post
- `getViewCounts(slugs)` - Query: Get view counts for multiple posts
- `incrementViewCount(slug)` - Mutation: Increment view count (upserts if not exists)
- `seedViewCount(slug, viewCount, lastReadAt)` - Mutation: Seed data (for migrations)

### Client Setup

See `src/lib/convex.ts` for client configuration:

- `convexClient` - Browser client with WebSocket for real-time subscriptions (used in Svelte components)
- `convexHttpClient` - HTTP client for server-side queries (used in Astro SSR pages)

### Real-time Updates

The `ViewCounter.svelte` component uses Convex's real-time subscriptions via `convexClient.onUpdate()`. When any user increments a view count, all connected clients see the update instantly.

## Important Notes

- No ESLint configuration present - rely on TypeScript and Prettier
- No automated tests exist yet - verify changes manually
- Images optimized via Cloudinary integration
- Site uses SSR mode on Vercel deployment
- Blog index page uses SSR (`prerender = false`) to fetch view counts dynamically
- Individual blog posts use static generation (`prerender = true`) with client-side real-time view tracking via Convex
- Convex provides automatic caching and real-time sync - no custom caching layer needed
