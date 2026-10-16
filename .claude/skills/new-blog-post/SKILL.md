---
name: new-blog-post
description: Start a new blog post as a draft in the EmDash CMS (posts collection) and explain where images and Polaroid galleries go
disable-model-invocation: true
---

Create a new blog post for chrisnowicki.dev. Posts live in the EmDash CMS
(`posts` collection, D1 + R2), not in the repo, so there is no file to
scaffold. You need a slug, title and description from the user; ask for
any that are missing.

## Steps

1. **Confirm inputs** with the user if not provided:
   - `slug` — kebab-case URL identifier (e.g. `my-new-post`); the post
     will live at `/blog/<slug>`
   - `title` — display title
   - `description` — one-sentence summary (used in lists, meta and llms.txt)

2. **Pick the target site**: local (`pnpm dev`, local D1/R2 under
   `.wrangler/state`) or production (`https://www.chrisnowicki.dev`).
   Ask if unclear; never write to production without the user's go-ahead.
   Authenticate once with `npx emdash login --url <site>` (or pass
   `-t <token>`, a personal access token from `/_emdash/admin`).

3. **Create the draft**:

   ```bash
   npx emdash content create posts --draft --slug <slug> \
     --url <site> \
     --data '{"title":"<title>","description":"<description>","date":"<YYYY-MM-DD>T12:00:00.000Z"}'
   ```

   Dates are stored at 12:00 UTC. Alternatively the user can create it in
   the admin at `<site>/_emdash/admin` (Posts collection).

4. **Tell the user how to write it** in `/_emdash/admin`:
   - The body is a rich-text (Portable Text) editor: headings (start at
     H2), lists, links, code blocks (set the language; the filename is
     optional and shows as the frame title)
   - **Images** go in the media library (upload in the editor or
     `npx emdash media upload <file> --url <site>`); always set alt text
   - **Cover** (`cover` field) is optional; the OG image is generated
     from the title and description either way
   - **Polaroid gallery**: insert a _gallery_ block and give each image a
     short caption — it renders as tilted Polaroids with the caption in
     the cursive font (`PolaroidGallery.astro`)
   - **Crops and focal points**: the cover is shown cropped to 2.5:1
     (further to 16:9 on phones) and gallery (Polaroid) images are
     cropped square. Crops are centered unless the image has a focal
     point. When the subject isn't centered (a face near the edge, a
     tall portrait in a gallery), open the image in the media library,
     set its focal point and save. The post keeps a copy of the focal
     point from when the image was inserted, so set it **before**
     inserting the image, or re-select the image in the cover field or
     gallery afterwards.
   - Preview the draft with the admin's preview link; publish (or
     schedule) from the admin or `npx emdash content publish posts <slug>`

5. **Before publishing**, suggest running the `blog-reviewer` agent on
   the slug, and remind the user to add the post to `public/llms.txt`.

6. **Confirm** by reporting the slug, the EmDash ID returned by the
   create command, and the admin URL for editing it.
