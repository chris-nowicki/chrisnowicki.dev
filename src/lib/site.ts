import type { Site, Metadata } from '@/types'

export const NUMBER_OF_ENTRIES = 3

export const navLinks = [
  { href: '/blog', text: 'blog' },
  { href: '/speaking', text: 'speaking' },
  { href: '/uses', text: 'uses' },
  { href: '/contact', text: 'contact' },
]

export const SITE: Site = {
  NAME: 'Chris Nowicki',
  EMAIL: 'chris@chrisnowicki.dev',
}

export const HOME: Metadata = {
  TITLE: 'Home',
  DESCRIPTION: 'Full-Stack Developer & Technology Nerd.',
}

export const NOW: Metadata = {
  TITLE: 'Now',
  DESCRIPTION: 'What I am doing now.',
}

export const BLOG: Metadata = {
  TITLE: 'Blog',
  DESCRIPTION:
    'Checkout my latest articles on all things life, tech, and productivity.',
}

export const SPEAKING: Metadata = {
  TITLE: 'Speaking',
  DESCRIPTION: 'Upcoming and past speaking engagements.',
}

export const USES: Metadata = {
  TITLE: 'Uses',
  DESCRIPTION: 'Software, Hardware & Peripherals I use daily.',
}

export const CONTACT: Metadata = {
  TITLE: 'Contact',
  DESCRIPTION: 'Get in touch with me.',
}