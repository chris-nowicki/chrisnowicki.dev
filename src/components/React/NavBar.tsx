import { useState, useEffect } from 'react'
import { navLinks } from '@/lib/site'
import { cn } from '@/utils/utils'
import MobileMenu from './MobileMenu'

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname.split('/')[1] || '')
    }
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    document.body.style.overflow = !isOpen ? 'hidden' : ''
  }

  return (
    <div className="mt-8 flex w-full items-center justify-center px-4 pr-6">
      <nav
        className={cn(
          'text-muted-foreground flex w-full max-w-4xl items-center justify-between rounded-full bg-white shadow-none',
          isOpen && 'rounded-b-none border-b-0'
        )}
      >
        <a
          href="/"
          className="font-cursive rounded-full border border-black/90 px-2 py-1 text-2xl text-black/90 transition-all duration-100 ease-in-out hover:scale-105 hover:-rotate-10 hover:shadow-lg"
          onClick={() => setPathname('')}
        >
          CN
        </a>

        <ul
          className="hidden gap-4 rounded-full border px-4 py-2 text-lg md:flex"
          aria-label="Desktop navigation"
        >
          {navLinks.map(({ href, text }) => {
            const isActive = text === pathname
            return (
              <li key={href}>
                <a
                  href={href}
                  className={cn(
                    'group transition-colors duration-200 ease-in-out hover:text-blue-600',
                    isActive ? 'text-blue-600' : 'text-black'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setPathname(text)}
                >
                  {text}
                </a>
              </li>
            )
          })}
        </ul>
        <button
          className="hamburger flex justify-center md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isOpen}
        >
          <div className="relative flex h-6 w-8 flex-col justify-between">
            <span
              className={cn(
                'absolute h-0.5 w-full bg-black transition-all duration-300',
                isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
              )}
            ></span>
            <span
              className={cn(
                'absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-black transition-all duration-300',
                isOpen ? 'opacity-0' : 'opacity-100'
              )}
            ></span>
            <span
              className={cn(
                'absolute h-0.5 w-full bg-black transition-all duration-300',
                isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
              )}
            ></span>
          </div>
        </button>
      </nav>
      <MobileMenu isOpen={isOpen} onClose={toggleMenu} />
    </div>
  )
}
