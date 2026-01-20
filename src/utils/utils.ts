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
 * Formats view count for display (e.g., 1000 -> "1k", 1200 -> "1.2k")
 */
export function formatViewCount(count: number): string {
  if (count < 1000) {
    return count.toString()
  }
  if (count < 10000) {
    const thousands = count / 1000
    return `${thousands.toFixed(1)}k`.replace(/\.0$/, 'k')
  }
  if (count < 1000000) {
    return `${Math.floor(count / 1000)}k`
  }
  const millions = count / 1000000
  return `${millions.toFixed(1)}M`.replace(/\.0$/, 'M')
}
