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
 */
export const LATEST_POST_CARD = [
  'group card-link card-surface block h-full overflow-hidden',
  'border-b border-border last:border-b-0 sm:border-b-0',
  'md:rounded-lg md:border md:ring-1 md:ring-inset md:ring-foreground/5',
].join(' ')
