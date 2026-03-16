import { useEffect, useState } from 'react'

interface SpotifyTrack {
  isPlaying: boolean
  title: string
  artist: string
  albumArt: string
  songUrl: string
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

function EqualizerBars() {
  const delays = ['0ms', '150ms', '300ms', '150ms', '0ms']
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {delays.map((delay, i) => (
        <span
          key={i}
          className="animate-equalizer block w-[3px] origin-bottom rounded-full bg-[#1DB954]"
          style={{ height: '14px', animationDelay: delay }}
        />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex min-h-[140px] animate-pulse overflow-hidden rounded-xl border-2 border-dashed border-border">
      <div className="w-[120px] shrink-0 bg-muted sm:w-[140px]" />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="mt-1 h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function SpotifyBentoCard() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchTrack() {
      try {
        const res = await fetch('/api/spotify')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setTrack(data.title ? data : null)
          setIsLoading(false)
        }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchTrack()
    const interval = setInterval(fetchTrack, 90_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (isLoading) return <SkeletonCard />
  if (!track) return null

  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex min-h-[140px] overflow-hidden rounded-xl border bg-transparent">

      {/* Spotify green fade — right to left */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-l from-[#1DB954]/20 via-[#1DB954]/5 to-transparent" aria-hidden="true" />

      {/* Album art — full left panel, contained scale+tilt on hover */}
      <div className="relative w-[120px] shrink-0 overflow-hidden sm:w-[140px]">
        <img
          src={track.albumArt}
          alt={`Album art for ${track.title}`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-2"
        />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 sm:p-5">
        {/* Status row */}
        <div className="flex items-center gap-2">
          {track.isPlaying && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1DB954] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1DB954]" />
            </span>
          )}
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {track.isPlaying ? 'Now playing' : 'Last played'}
          </span>
          {track.isPlaying && <EqualizerBars />}
        </div>

        <p className="truncate text-sm font-bold leading-tight text-foreground sm:text-base">
          {track.title}
        </p>
        <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
          {track.artist}
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          <SpotifyIcon className="h-3.5 w-3.5 shrink-0 text-[#1DB954]" />
          <span className="whitespace-nowrap font-mono text-xs text-muted-foreground transition-colors duration-200 group-hover:text-[#1DB954]">
            Open in Spotify
          </span>
        </div>
      </div>
    </a>
  )
}
