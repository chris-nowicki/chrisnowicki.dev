import { act,render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SpotifyBentoCard from './SpotifyBentoCard'

const MOCK_TRACK = {
  isPlaying: true,
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  albumArt: 'https://example.com/album.jpg',
  songUrl: 'https://open.spotify.com/track/123',
}

function mockFetch(response: object, ok = true) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    json: async () => response,
  } as Response)
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('SpotifyBentoCard', () => {
  it('shows skeleton while loading', () => {
    mockFetch(MOCK_TRACK)
    render(<SpotifyBentoCard />)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders track info when now playing', async () => {
    mockFetch(MOCK_TRACK)
    render(<SpotifyBentoCard />)

    await act(async () => {})

    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument()
    expect(screen.getByText('Queen')).toBeInTheDocument()
    expect(screen.getByText('Now playing')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', MOCK_TRACK.songUrl)
    expect(screen.getByAltText('Album art for Bohemian Rhapsody')).toBeInTheDocument()
  })

  it('shows "Last played" when track is not currently playing', async () => {
    mockFetch({ ...MOCK_TRACK, isPlaying: false })
    render(<SpotifyBentoCard />)

    await act(async () => {})

    expect(screen.getByText('Last played')).toBeInTheDocument()
    expect(screen.queryByText('Now playing')).not.toBeInTheDocument()
  })

  it('renders nothing when API returns no track', async () => {
    mockFetch({ isPlaying: false, title: null })
    const { container } = render(<SpotifyBentoCard />)

    await act(async () => {})

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))
    const { container } = render(<SpotifyBentoCard />)

    await act(async () => {})

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when response is not ok', async () => {
    mockFetch({}, false)
    const { container } = render(<SpotifyBentoCard />)

    await act(async () => {})

    expect(container).toBeEmptyDOMElement()
  })

  it('polls every 60 seconds', async () => {
    const spy = mockFetch(MOCK_TRACK)
    render(<SpotifyBentoCard />)

    await act(async () => {})
    expect(spy).toHaveBeenCalledTimes(1)

    await act(async () => { vi.advanceTimersByTime(60_000) })
    expect(spy).toHaveBeenCalledTimes(2)

    await act(async () => { vi.advanceTimersByTime(60_000) })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('cancels in-flight fetch and clears interval on unmount', async () => {
    const spy = mockFetch(MOCK_TRACK)
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    const { unmount } = render(<SpotifyBentoCard />)
    await act(async () => {})

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()

    // Advance past polling interval — no additional fetches after unmount
    await act(async () => { vi.advanceTimersByTime(60_000) })
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
