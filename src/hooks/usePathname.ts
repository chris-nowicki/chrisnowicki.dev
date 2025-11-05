import { useSyncExternalStore } from 'react'

/**
 * Custom hook similar to Next.js usePathname
 * Returns the current pathname and updates when navigation occurs
 * Uses useSyncExternalStore for synchronous updates without flicker
 * @returns The current pathname (e.g., "blog", "uses", etc.)
 */
function getPathname(): string {
  if (typeof window === 'undefined') return ''
  return window.location.pathname.split('/')[1] || ''
}

function subscribe(callback: () => void) {
  // Listen for browser back/forward navigation
  window.addEventListener('popstate', callback)

  // Also listen for clicks on anchor tags
  const handleClick = () => {
    // Small delay to ensure window.location has updated
    setTimeout(callback, 0)
  }
  document.addEventListener('click', handleClick)

  return () => {
    window.removeEventListener('popstate', callback)
    document.removeEventListener('click', handleClick)
  }
}

export function usePathname(): string {
  // Use useSyncExternalStore for synchronous updates during navigation
  // This ensures the pathname is always current during render, even on remount
  const pathname = useSyncExternalStore(
    subscribe,
    getPathname,
    () => '' // SSR fallback
  )

  return pathname
}
