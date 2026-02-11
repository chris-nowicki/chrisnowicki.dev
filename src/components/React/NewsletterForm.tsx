import { useState } from 'react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const honeypot = formData.get('_gotcha') as string

    setState('loading')
    setMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _gotcha: honeypot }),
      })

      const data = await res.json()
      setState(data.success ? 'success' : 'error')
      setMessage(data.message)
    } catch {
      setState('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {message}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-3 sm:flex-row">
      {/* Honeypot — invisible to users, bots auto-fill it */}
      <input
        type="text"
        name="_gotcha"
        autoComplete="off"
        tabIndex={-1}
        className="absolute h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (state === 'error') setState('idle')
        }}
        placeholder="you@example.com"
        required
        className="flex-1 rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
      />

      <button
        type="submit"
        disabled={state === 'loading'}
        className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-tight text-background shadow-sm transition-colors hover:bg-foreground/90 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {state === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>

      {state === 'error' && message && (
        <p className="text-sm text-red-500 sm:absolute sm:top-full sm:mt-2">
          {message}
        </p>
      )}
    </form>
  )
}
