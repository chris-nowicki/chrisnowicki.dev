---
name: new-blog-post
description: Scaffold a new blog post MDX file with correct frontmatter and image directory structure
disable-model-invocation: true
---

Create a new blog post for chrisnowicki.dev. You will need a slug, title, description, and category from the user before proceeding. If any are missing, ask for them.

## Steps

1. **Confirm inputs** with the user if not provided:
   - `slug` — kebab-case URL identifier (e.g. `my-new-post`)
   - `title` — display title string
   - `description` — one-sentence summary
   - `category` — must be one of: `life`, `tech` (check existing posts in `src/content/blog/` if unsure)

2. **Create the MDX file** at `src/content/blog/<slug>.mdx`:

```mdx
---
date: <TODAY's date in YYYY-MM-DD format>
title: '<title>'
description: '<description>'
image: ''
category: '<category>'
draft: true
---

```

3. **Create the image directory** at `src/assets/images/blog/<slug>/` so Astro-optimized images have a home. Remind the user:
   - Place post body images here (imported in MDX via `import MyImg from '@/assets/images/blog/<slug>/filename.jpg'`)
   - For a cover/OG image, add it to `public/blog/<slug>-cover.webp` and set the `image` frontmatter field to `/blog/<slug>-cover.webp`

4. **Confirm** by listing the created file path and image directory path.
