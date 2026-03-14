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
      aria-hidden="true"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

export default function SpotifyLastPlayed() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchTrack() {
      try {
        const res = await fetch('/api/spotify')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data.title) {
          setTrack(data)
        }
      } catch {
        // Silently degrade
      }
    }

    fetchTrack()
    const interval = setInterval(fetchTrack, 90_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (!track) return <></>

  return (
    <div className="flex items-center gap-2.5">
      <span className="mr-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {track.isPlaying ? 'Now playing' : 'Last played'}
      </span>
      <a
        href={track.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open in Spotify"
        className="text-[#1DB954] grayscale transition-all duration-200 hover:grayscale-0"
      >
        <SpotifyIcon className="h-5 w-5" />
      </a>
      <img
        src={track.albumArt}
        alt={`${track.title} album art`}
        className="h-5 w-5 rounded-sm object-cover"
      />
      <a
        href={track.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {track.title} by {track.artist}
      </a>
    </div>
  )
}
