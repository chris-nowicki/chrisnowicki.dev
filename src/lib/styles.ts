/**
 * Shared bordered card with a soft surface fade and keyboard focus outline.
 * Compose with layout/rounding utilities per grid, e.g.
 *   cn(ACCENT_CARD, "flex flex-col gap-2 rounded-xl p-2")
 */
export const ACCENT_CARD =
  "group card-link card-surface border";

/**
 * Homepage "Latest Posts" card frame, shared by the real cards and the
 * server-island fallback skeleton so both occupy the same box.
 *
 * The min-height is what keeps the skeleton → island swap free of layout
 * shift: real cards size to their content, the skeleton can't know it, so
 * both are held to the same floor. It is just above the tallest current
 * card (mobile 161px: 2-line title + 2-line description; sm+ 206px: 3-line
 * title + 2-line description); a card with more content still grows.
 */
export const LATEST_POST_CARD = [
  'group card-link card-surface block h-full min-h-41 overflow-hidden sm:min-h-52',
  'border-b border-border last:border-b-0 sm:border-b-0',
  'md:rounded-lg md:border md:ring-1 md:ring-inset md:ring-foreground/5',
].join(' ')
