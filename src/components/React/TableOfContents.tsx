import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X } from 'lucide-react'
import { cn } from '@/utils/utils'

interface TocHeading {
  depth: number
  slug: string
  text: string
}

interface Props {
  headings: TocHeading[]
}

function useActiveHeading(headings: TocHeading[]) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.slug))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-112px 0px -66% 0px' }
    )

    for (const el of elements) {
      observer.observe(el)
    }

    // Edge case: when scrolled to bottom, activate last heading
    const handleScroll = () => {
      const { scrollHeight, clientHeight } = document.documentElement
      const scrollTop = window.scrollY
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setActiveId(headings[headings.length - 1].slug)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])

  return activeId
}

function useMobileButtonVisible() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return visible
}

export default function TableOfContents({ headings }: Props) {
  const activeId = useActiveHeading(headings)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileButtonVisible = useMobileButtonVisible()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
      e.preventDefault()
      const el = document.getElementById(slug)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        history.pushState(null, '', `#${slug}`)
      }
      setMobileOpen(false)
    },
    []
  )

  // Body scroll lock for mobile sheet
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Escape key closes mobile sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    if (mobileOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  const tocList = (mobile = false) => (
    <ul className={cn(mobile && 'space-y-0.5')}>
      {headings.map((heading) => {
        const isActive = activeId === heading.slug
        return (
          <li key={heading.slug}>
            <a
              href={`#${heading.slug}`}
              onClick={(e) => handleClick(e, heading.slug)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'block transition-colors duration-200',
                heading.depth === 3 && (mobile ? 'pl-3' : 'pl-3'),
                mobile ? 'py-2 text-base' : 'py-1 text-xs',
                isActive
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {heading.text}
            </a>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Table of contents"
        className="absolute top-0 bottom-0 hidden xl:block"
        style={{
          left: '100%',
          width: 'calc(50vw - 50%)',
        }}
      >
        <div className="sticky top-32 flex justify-center">
          <div className="w-40 2xl:w-48">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            On this page
          </p>
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
            {tocList()}
          </div>
          </div>
        </div>
      </nav>

      {/* Mobile floating button */}
      <AnimatePresence>
        {mobileButtonVisible && !mobileOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(true)}
            className="fixed bottom-10 left-6 z-40 rounded-full bg-foreground p-3 text-background shadow-lg xl:hidden"
            aria-label="Open table of contents"
          >
            <List className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-background xl:hidden"
            >
              <div className="flex items-center justify-between px-6 pt-4 pb-2">
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" />
              </div>
              <div className="flex items-center justify-between px-6 pb-3">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  On this page
                </p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Close table of contents"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav
                aria-label="Table of contents"
                className="max-h-[70vh] overflow-y-auto px-6 pb-10"
              >
                {tocList(true)}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
