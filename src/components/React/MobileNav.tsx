import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/utils'
import { navLinks, socialLinks } from '@/lib/site'

const mobileNavLinks = [{ href: '/', text: 'Home' }, ...navLinks]

// quartOut easing as cubic bezier
const quartOut = [0.25, 1, 0.5, 1] as const

const slideVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: quartOut },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: { duration: 0.3, ease: quartOut },
  },
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
      {/* Hamburger Button */}
      <button
        className="hamburger flex justify-center md:hidden"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
        onClick={() => toggleMenu()}
      >
        <div className="relative flex h-6 w-8 flex-col justify-between">
          <span
            className={cn(
              'absolute h-0.5 w-full bg-black transition-all duration-300',
              isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
            )}
          />
          <span
            className={cn(
              'absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-black transition-all duration-300',
              isOpen ? 'opacity-0' : 'opacity-100'
            )}
          />
          <span
            className={cn(
              'absolute h-0.5 w-full bg-black transition-all duration-300',
              isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
            )}
          />
        </div>
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 top-20 z-40 bg-white"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <nav className="h-full px-4 pt-8">
              <ul className="flex flex-col items-start gap-2 text-2xl">
                {mobileNavLinks.map(({ href, text }) => {
                  const isActive =
                    (text === 'Home' && pathname === '') ||
                    text.toLowerCase() === pathname
                  return (
                    <li key={href} className="w-full">
                      <a
                        href={href}
                        className={cn(
                          'flex w-full p-2 text-center transition-colors duration-300 ease-in-out hover:text-foreground',
                          isActive
                            ? 'font-medium text-foreground'
                            : 'text-black'
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
              <div className="mt-8 flex flex-col items-center justify-center rounded-xl border p-3 text-center text-xl text-black">
                Hi. 👋🏻 so, I realllllly love coffee!
                <a
                  href="https://buymeacoffee.com/chrisnowicki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 underline"
                >
                  Buy me a cup? ☕
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center gap-4">
                {socialLinks.map(({ url, label, name }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-black"
                  >
                    {name === 'X' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 512 512"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M389.2 48h70.6L305.6 224.2L487 464H345L233.7 318.6L106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9zm-24.8 373.8h39.1L151.1 88h-42z"
                        />
                      </svg>
                    )}
                    {name === 'LinkedIn' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 15 15"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M2 1a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm1.05 5h1.9v6h-1.9zm2.025-1.995a1.075 1.075 0 1 1-2.15 0a1.075 1.075 0 0 1 2.15 0M12 8.357c0-1.805-1.167-2.507-2.326-2.507a2.206 2.206 0 0 0-1.095.231c-.257.13-.526.424-.734.938h-.053V6H6v6.005h1.906V8.81c-.027-.327.077-.75.291-1.001c.215-.252.52-.312.753-.342h.073c.606 0 1.056.375 1.056 1.32v3.217h1.906z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {name === 'GitHub' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 15 15"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M7.5.25a7.25 7.25 0 0 0-2.292 14.13c.363.066.495-.158.495-.35c0-.172-.006-.628-.01-1.233c-2.016.438-2.442-.972-2.442-.972c-.33-.838-.805-1.06-.805-1.06c-.658-.45.05-.441.05-.441c.728.051 1.11.747 1.11.747c.647 1.108 1.697.788 2.11.602c.066-.468.254-.788.46-.969c-1.61-.183-3.302-.805-3.302-3.583a2.8 2.8 0 0 1 .747-1.945c-.075-.184-.324-.92.07-1.92c0 0 .61-.194 1.994.744A6.963 6.963 0 0 1 7.5 3.756A6.97 6.97 0 0 1 9.315 4c1.384-.938 1.992-.743 1.992-.743c.396.998.147 1.735.072 1.919c.465.507.745 1.153.745 1.945c0 2.785-1.695 3.398-3.31 3.577c.26.224.492.667.492 1.343c0 .97-.009 1.751-.009 1.989c0 .194.131.42.499.349A7.25 7.25 0 0 0 7.499.25"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {name === 'Twitch' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30.57"
                        height="32"
                        viewBox="0 0 256 268"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M17.458 0L0 46.556v186.201h63.983v34.934h34.931l34.898-34.934h52.36L256 162.954V0zm23.259 23.263H232.73v128.029l-40.739 40.741H128L93.113 226.920v-34.886H40.717zm64.008 116.405H128V69.844h-23.275zm63.997 0h23.27V69.844h-23.27z"
                        />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
