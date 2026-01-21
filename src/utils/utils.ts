import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formats view count for display with comma separators (e.g., 1234 -> "1,234")
 */
export function formatViewCount(count: number): string {
  return count.toLocaleString('en-US')
}
