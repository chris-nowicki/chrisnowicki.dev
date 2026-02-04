import type { Site, Metadata, Status } from '@/types'

import GitHub from '@/assets/icons/github.svg'
import LinkedIn from '@/assets/icons/linkedin.svg'
import Twitch from '@/assets/icons/twitch.svg'
import X from '@/assets/icons/x.svg'

export const NUMBER_OF_ENTRIES = 3

export const navLinks = [
  { href: '/blog', text: 'Blog' },
  { href: '/speaking', text: 'Speaking' },
  { href: '/uses', text: 'Uses' },
  { href: '/contact', text: 'Contact' },
]

export const socialLinks = [
  {
    name: 'X',
    icon: X,
    url: 'https://twitter.com/iamwix',
    label: 'Visit my X Profile @iamwix',
  },
  {
    name: 'LinkedIn',
    icon: LinkedIn,
    url: 'https://www.linkedin.com/in/chris-nowicki/',
    label: 'Visit my LinkedIn Profile',
  },
  {
    name: 'GitHub',
    icon: GitHub,
    url: 'https://github.com/chris-nowicki',
    label: 'Visit my GitHub Profile',
  },
  {
    name: 'Twitch',
    icon: Twitch,
    url: 'https://www.twitch.tv/chriswix',
    label: 'Visit my Twitch Profile',
  },
] as const

export const SITE: Site = {
  NAME: 'Chris Nowicki',
  EMAIL: 'chris@chrisnowicki.dev',
}

export const STATUS: Status = {
  available: true,
  message: 'Available for speaking & collaborations',
}

export const HOME: Metadata = {
  TITLE: 'Home',
  DESCRIPTION: 'Full-Stack Developer & Technology Nerd.',
}

export const BLOG: Metadata = {
  TITLE: 'Blog',
  DESCRIPTION:
    'My ramblings on the web about all things tech, life, and productivity!',
}

export const SPEAKING: Metadata = {
  TITLE: 'Speaking',
  DESCRIPTION: 'My speaking engagements and conference talks!',
}

export const USES: Metadata = {
  TITLE: 'Uses',
  DESCRIPTION: 'The Gear That Keeps Me Caffeinated & Coding.',
}

export const CONTACT: Metadata = {
  TITLE: 'Contact',
  DESCRIPTION: 'Get in touch with me.',
}
