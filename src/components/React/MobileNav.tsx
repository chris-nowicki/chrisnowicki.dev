import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'
import { navLinks } from '@/lib/site'

const mobileNavLinks = [{ href: '/', text: 'Home' }, ...navLinks]

// Cubic bezier easing curve
const quartOut = [0.25, 1, 0.5, 1] as const

const slideVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: 0.3, ease: quartOut },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.3, ease: quartOut },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    setPathname(window.location.pathname.split('/')[1])

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  function toggleMenu(forceClose = false) {
    const newState = forceClose ? false : !isOpen
    setIsOpen(newState)
    document.body.style.overflow = newState ? 'hidden' : ''
  }

  return (
    <>
      <button
        className="hamburger relative z-50 flex justify-center md:hidden"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
        onClick={() => toggleMenu()}
      >
        <div className="relative flex h-6 w-8 flex-col justify-between">
          <span
            className={cn(
              'absolute right-0 h-0.5 bg-foreground transition-all duration-300',
              isOpen
                ? 'top-1/2 w-full -translate-y-1/2 rotate-45'
                : 'top-0 w-[40%]'
            )}
          />
          <span
            className={cn(
              'absolute right-0 top-1/2 h-0.5 -translate-y-1/2 bg-foreground transition-all duration-300',
              isOpen ? 'w-full opacity-0' : 'w-[65%] opacity-100'
            )}
          />
          <span
            className={cn(
              'absolute right-0 h-0.5 bg-foreground transition-all duration-300',
              isOpen
                ? 'top-1/2 w-full -translate-y-1/2 -rotate-45'
                : 'bottom-0 w-full'
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => toggleMenu(true)}
            />

            {/* Panel */}
            <motion.div
              className="fixed top-0 bottom-0 right-0 z-40 w-[65vw] bg-background shadow-2xl"
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <nav className="h-full px-6 pt-24">
                <ul className="flex flex-col items-start gap-1 text-xl">
                  {mobileNavLinks.map(({ href, text }) => {
                    const isActive =
                      (text === 'Home' && pathname === '') ||
                      text.toLowerCase() === pathname
                    return (
                      <li key={href} className="w-full">
                        <a
                          href={href}
                          className={cn(
                            'block w-full rounded-lg px-3 py-2.5 transition-colors duration-200',
                            isActive
                              ? 'font-medium text-foreground bg-accent'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                          onClick={() => toggleMenu(true)}
                          aria-current={isActive ? 'page' : undefined}
                          data-astro-prefetch
                        >
                          {text}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
