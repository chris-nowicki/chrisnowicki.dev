import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    document.documentElement.classList.toggle('dark')
    setIsDark(!isDark)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative cursor-pointer rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Toggle theme"
    >
      <Moon
        className={`h-5 w-5 transition-all ${isDark ? 'scale-0 -rotate-90' : 'scale-100 rotate-0'}`}
        aria-hidden="true"
      />
      <Sun
        className={`absolute top-2 left-2 h-5 w-5 transition-all ${isDark ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`}
        aria-hidden="true"
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
