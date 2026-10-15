import { Block } from 'emdash/ui'

import Blockquote from './Blockquote.astro'
import CodeBlock from './CodeBlock.astro'
import Heading from './Heading.astro'
import PolaroidGallery from './PolaroidGallery.astro'
import ProseImage from './ProseImage.astro'

/**
 * Blog overrides merged over EmDash's built-in Portable Text renderers.
 *
 * `block` is a per-style record so headings get anchors while paragraphs
 * keep EmDash's `Block` (which honours `textAlign`). Headings expect the
 * value to have gone through `withHeadingIds()`; `BlogPortableText` does it.
 */
export const blogPortableTextComponents = {
  block: {
    h1: Heading,
    h2: Heading,
    h3: Heading,
    h4: Heading,
    h5: Heading,
    h6: Heading,
    blockquote: Blockquote,
    normal: Block,
  },
  type: {
    code: CodeBlock,
    image: ProseImage,
    gallery: PolaroidGallery,
  },
}
