---
date: 2026-02-10
title: 'How to Create Dynamic OG Images in Astro with Cloudinary'
description: 'Generate dynamic Open Graph images on the fly using Cloudinary and Astro.'
category: 'tech'
draft: true
---

If you've ever shared a link on Twitter or LinkedIn and cringed at the generic preview image, this one's for you. I got tired of manually creating OG images for every page on my site, so I set up a system where Cloudinary generates them dynamically with custom text overlays.

## What We're Building

We're going to upload a base template to [Cloudinary](https://cloudinary.com/) and layer dynamic text on top of it using URL-based transformations. The `astro-cloudinary` package makes this super easy.

Here's what the end result looks like:

![Example of a generated OG image with dynamic text overlays](/blog/og-generated-example.jpeg)

## Prerequisites

1. You have an [Astro](https://astro.build/) project set up
2. You have a [Cloudinary](https://cloudinary.com/) account (free tier works great)
3. You're somewhat familiar with how OG meta tags work

## Step 1: Create Your OG Template

First, you need a base image template. This is the background that Cloudinary will overlay text onto. Design it at **1200x630** pixels (the standard OG image size) with empty space where you want your dynamic text to go.

Upload this template to your Cloudinary media library. Take note of the **[public ID](https://cloudinary.com/documentation/upload_images#public_id)**, which includes the folder path. For example, mine is `portfolio/og-template`, where `portfolio` is the folder and `og-template` is the image name.

Here's what my template looks like:

![OG base template before text overlays](/blog/og-base-template.png)

## Step 2: Install astro-cloudinary

```bash
pnpm add astro-cloudinary
```

Then add your Cloudinary cloud name to your `.env` file:

```bash
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Step 3: Create the OG Image Utility

Here's where the magic happens. Create a utility function that generates a Cloudinary URL with text overlays.

```typescript
// src/utils/og-image.ts
import { getCldOgImageUrl } from 'astro-cloudinary/helpers'

// Cloudinary uses commas as URL delimiters, so we need to replace
// any commas in our text with a URL-encoded unicode character
function formatCloudinaryText(text: string): string {
  if (!text.includes(',')) {
    return text
  }

  const CLOUDINARY_COMMA = '%E2%80%9A'
  return text.replace(/,/g, CLOUDINARY_COMMA)
}

const publicId = 'portfolio/og-template' // your template's public ID

interface GenerateOgImageUrlProps {
  header: string
  description: string
  readTime?: string
}

const generateOgImageUrl = ({
  header,
  description,
  readTime,
}: GenerateOgImageUrlProps): string => {
  const formattedDescription = formatCloudinaryText(description)

  // Using Arial here. Swap for a custom font if you follow Step 4
  const baseOverlays = [
    {
      position: {
        x: 100,
        y: 80,
        gravity: 'north_west',
      },
      text: {
        color: 'black',
        fontFamily: 'Arial',
        fontSize: 100,
        text: header,
      },
    },
    {
      width: 1000,
      crop: 'fit',
      position: {
        x: 100,
        y: 190,
        gravity: 'north_west',
      },
      text: {
        color: 'black',
        fontFamily: 'Arial',
        fontSize: 65,
        text: formattedDescription,
      },
    },
  ]

  const overlays = readTime
    ? [
        ...baseOverlays,
        {
          position: {
            x: 205,
            y: 490,
            gravity: 'north_west',
          },
          text: {
            color: 'black',
            fontFamily: 'Arial',
            fontSize: 35,
            text: readTime,
          },
        },
      ]
    : baseOverlays

  return getCldOgImageUrl({
    src: publicId,
    width: 1200,
    height: 630,
    format: 'jpg',
    quality: 'auto',
    overlays,
  })
}

export default generateOgImageUrl
```

Let's break down what's happening:

- **`getCldOgImageUrl`** from `astro-cloudinary/helpers` generates a Cloudinary URL with all of our transformations baked in. No API calls at runtime, it's just a URL.
- **`overlays`** is an array of text layers. Each one has a position, font, size, and the text content.
- **`gravity: 'north_west'`** anchors positioning from the top-left corner, so `x` and `y` are offsets from there.
- **`width` and `crop: 'fit'`** on the description ensures long text wraps instead of overflowing.
- If a **`readTime`** is provided (for blog posts), we add a third overlay to display it.

## Step 4: Using Custom Fonts

**This step is optional.** Cloudinary supports standard fonts (Arial, Times New Roman, etc.) and [Google Fonts](https://fonts.google.com/) out of the box. Just use the font name as the `fontFamily` value. If that's enough for you, skip ahead to Step 5.

Want to use a custom font like Geist? Here's the catch. You can't just drag and drop a font file into the Cloudinary media library and call it a day. Font files need to be uploaded as **authenticated raw assets**. This means the font file is protected from being downloaded directly, but Cloudinary can still use it in transformations.

You'll need to upload the font using the Cloudinary API with `resource_type: 'raw'` and `type: 'authenticated'`. Here's a simplified example using `curl` (see the [Cloudinary upload docs](https://cloudinary.com/documentation/upload_images#uploading_with_a_direct_call_to_the_rest_api) for the full signed upload flow):

```bash
curl https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/raw/authenticated/upload \
  -X POST \
  -F "file=@Geist-Bold.ttf" \
  -F "public_id=Geist-Bold.ttf" \
  -F "api_key=YOUR_API_KEY" \
  -F "api_secret=YOUR_API_SECRET" \
  -F "timestamp=$(date +%s)"
```

The key parts here:

- **`resource_type: 'raw'`** - font files aren't images or videos, so they fall under Cloudinary's "raw" category. This is baked into the URL path (`/raw/authenticated/upload`).
- **`type: 'authenticated'`** - this protects the font from being downloaded by users while still allowing Cloudinary to use it in transformations. This is important for licensed fonts.
- **`public_id`** - set this to the font filename (e.g., `Geist-Bold.ttf`). This is what you'll reference in the `fontFamily` field of your overlays.

Once uploaded, you reference the font by its public ID in the `fontFamily` field and you're good to go. I'm using **Geist** (Bold and Regular) but you can use whatever fits your brand.

Check out the [Cloudinary custom fonts docs](https://cloudinary.com/documentation/layers#custom_fonts) for more details.

## Step 5: Wire It Up in Your Pages

Now use the utility in any Astro page to generate an OG image URL and pass it to your layout. Here's how I use it in my blog post template:

```astro
---
// src/pages/blog/[slug].astro
import generateOgImageUrl from '@/utils/og-image'
import PageLayout from '@/layouts/PageLayout.astro'

// `post` and `postReadTime` come from your content collection logic
const ogImageUrl = generateOgImageUrl({
  header: '/BLOG',
  description: post.data.title,
  readTime: postReadTime,
})
---

<PageLayout
  title={post.data.title}
  description={post.data.description}
  image={ogImageUrl}>
  <!-- your page content -->
</PageLayout>
```

In your layout's `<head>`, make sure you have these meta tags:

```html
<meta property="og:image" content={imageUrl} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:image" content={imageUrl} />
```

And that's the wiring done. Each page now generates its own unique OG image based on the content. No build step, no image processing. Cloudinary handles it all through URL transformations.

## Testing Your OG Images

You can test your OG images using these tools:

- [OpenGraph.xyz](https://www.opengraph.xyz/) - preview how your link will look when shared
- [Social Share Preview](https://socialsharepreview.com/) - test how your link looks across social platforms
- Or just paste the generated Cloudinary URL directly in your browser to see the image

## Conclusion

And that is it! No more manually creating OG images in Figma for every new page. Upload a template, add some text overlays, and Cloudinary handles the rest. The best part is there's no server-side rendering or edge function needed. It's literally just a URL with transformations baked in.

If you have any questions or want to see how I'm using this across my entire site, check out the [source code](https://github.com/chris-nowicki/chrisnowicki.dev).
