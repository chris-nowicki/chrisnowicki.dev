/**
 * Shared "blueprint" accent card: a bordered surface with a foreground
 * rule on its left edge that fades in on hover (alongside the border).
 * Compose with layout/rounding utilities per grid, e.g.
 *   cn(ACCENT_CARD, 'flex flex-col gap-2 rounded-xl p-2 before:rounded-l-xl')
 */
export const ACCENT_CARD =
  'group relative border transition-all duration-200 before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-foreground before:opacity-0 before:transition-opacity before:duration-200 hover:border-border hover:before:opacity-100'
