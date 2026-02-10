# Coding Agent Guidelines for chrisnowicki.dev

This document provides essential information for AI coding agents working on the Chris Nowicki portfolio website built with Astro, React, and TypeScript.

## Tech Stack

- **Framework**: Astro 5.x with SSR (Server-Side Rendering)
- **UI Components**: React 19.x with `framer-motion` for interactive components
- **Styling**: Tailwind CSS v4 with Vite plugin
- **TypeScript**: Strict mode enabled
- **Package Manager**: pnpm (v10.26.2)
- **Deployment**: Cloudflare Workers
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
├── components/       # Astro and React components
│   └── React/       # React-specific components
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
- **File extensions**: `.ts` for logic, `.astro` for Astro components, `.tsx` for React components

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

#### React Components (.tsx)

```tsx
import { useEffect, useState } from 'react'
import { cn } from '@/utils/utils'

interface Props {
  isActive?: boolean
}

export default function ExampleComponent({ isActive = false }: Props) {
  const [localState, setLocalState] = useState('')

  useEffect(() => {
    // Initialization
    return () => {
      // Cleanup
    }
  }, [])

  return <div className={cn('component-class', isActive && 'active')}>...</div>
}
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

- **Files**: `kebab-case.ts` for utilities, `PascalCase.astro/tsx` for components
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
2. React components for interactivity
3. Always define Props interface
4. Use semantic HTML and accessibility attributes

## Environment Variables

The following environment variables are required for full functionality:

- `PUBLIC_CONVEX_URL`: Your Convex deployment URL (e.g., `https://your-project.convex.cloud`)
- `ENABLE_VIEW_TRACKING`: Set to `true` to enable view count incrementing (should only be `true` in production)
- `PUBLIC_DISABLE_VIEW_COUNT_PROTECTION`: Set to `true` to disable view count protection for testing (local development only). When enabled, view counts will increment on every page load regardless of cooldown period.

**Note**: View tracking will gracefully degrade if Convex environment variables are not set (view counts will default to 0). The `ENABLE_VIEW_TRACKING` flag protects production data from being skewed during local development or preview deployments. The `PUBLIC_DISABLE_VIEW_COUNT_PROTECTION` flag allows you to test view counter functionality locally without waiting for the cooldown period.

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

- `getViewCount(slug)` - Query: Get view count and lastReadAt for a single post
- `getViewCounts(slugs)` - Query: Get view counts for multiple posts (returns `Record<string, number>`)
- `incrementViewCount(slug)` - Mutation: Increment view count (upserts if not exists), updates lastReadAt and updatedAt timestamps

### Client Setup

Client setup across two files:

- `src/lib/convex.ts` - `getConvexHttpClient()` async HTTP client for server-side queries (used in Astro SSR pages)
- `src/lib/convex-client.ts` - `initConvexClient()` async browser client with WebSocket for real-time subscriptions (used in React components)
- `isConvexConfigured()` - Helper function to check if Convex URL is set (in `convex.ts`)

Both clients return `null` if `PUBLIC_CONVEX_URL` is not configured, allowing graceful degradation.

### Real-time Updates

The `ViewCounter.tsx` component uses Convex's real-time subscriptions via `initConvexClient()` from `convex-client.ts`. When any user increments a view count, all connected clients see the update instantly.

**ViewCounter behavior:**
1. Subscribes to real-time updates for a specific slug on mount
2. Displays the current view count (or "loading..." while fetching)
3. Increments the view count once after the initial subscription callback fires
4. Automatically cleans up the subscription on destroy

### Usage Patterns

**Server-side (Astro SSR pages):**

```typescript
import { getConvexHttpClient } from '@/lib/convex'
import { api } from '../../../convex/_generated/api'

const httpClient = await getConvexHttpClient()
if (httpClient) {
  const viewCounts = await httpClient.query(api.blogViews.getViewCounts, { slugs })
}
```

**Client-side (React components):**

```typescript
import { initConvexClient } from '@/lib/convex-client'
import { api } from '../../../convex/_generated/api'

// Initialize client and subscribe to real-time updates
const client = await initConvexClient()
const unsubscribe = client.onUpdate(api.blogViews.getViewCount, { slug }, (result) => {
  setViewCount(result.viewCount)
})

// Mutate data
await client.mutation(api.blogViews.incrementViewCount, { slug })
```

## Important Notes

- No ESLint configuration present - rely on TypeScript and Prettier
- No automated tests exist yet - verify changes manually
- Images optimized via Cloudinary integration
- Site uses SSR mode on Cloudflare Workers deployment
- Blog index page uses SSR (`prerender = false`) to fetch view counts dynamically
- Individual blog posts use static generation (`prerender = true`) with client-side real-time view tracking via Convex
- Convex provides automatic caching and real-time sync - no custom caching layer needed
