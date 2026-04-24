import React, { useMemo, useState } from 'react'

declare global {
  interface Window {
    MusicKit?: {
      configure: (options: { developerToken: string; app: { name: string; build: string } }) => void
      getInstance: () => { authorize: () => Promise<string> }
    }
  }
}

const TRACKS = [
  {
    artist: 'Sega Bodega',
    title: 'Kepko',
    preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/8e/53/84/8e5384d4-e287-9c5d-9bf8-fc5570388947/mzaf_18396465659277096053.plus.aac.p.m4a',
  },
  {
    artist: 'Oklou',
    title: 'gods chariots',
    preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/c7/4e/4f/c74e4f45-dc67-c200-a6ed-2127f753e863/mzaf_2111332684133692730.plus.aac.p.m4a',
  },
]

export const AppleMusicDock: React.FC = () => {
  const [active, setActive] = useState(0)
  const [authorized, setAuthorized] = useState(false)

  const track = useMemo(() => TRACKS[active], [active])

  const handleLogin = async () => {
    if (!window.MusicKit) return
    try {
      const token = process.env.NEXT_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN
      if (!token) return

      window.MusicKit.configure({
        developerToken: token,
        app: { name: 'MARIANOMTZA', build: '1.0.0' },
      })

      await window.MusicKit.getInstance().authorize()
      setAuthorized(true)
    } catch {
      setAuthorized(false)
    }
  }

  return (
    <aside className="fixed bottom-4 left-1/2 z-50 w-[min(760px,calc(100%-1.5rem))] -translate-x-1/2 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.2em] text-[color:var(--fg-muted)]">APPLE MUSIC DOCK</p>
          <h4 className="truncate text-base text-[color:var(--fg)]">{track.artist} — {track.title}</h4>
        </div>

        <audio key={track.preview} controls src={track.preview} className="h-10 w-full md:w-[280px]" />

        <div className="flex gap-2">
          {TRACKS.map((item, idx) => (
            <button key={item.title} onClick={() => setActive(idx)} className={`rounded-full border px-3 py-2 text-[10px] tracking-[0.12em] ${idx === active ? 'border-white/40 text-[color:var(--fg)]' : 'border-white/20 text-[color:var(--fg-muted)]'}`}>
              {item.artist}
            </button>
          ))}
          <button onClick={handleLogin} className="rounded-full border border-white/20 px-3 py-2 text-[10px] tracking-[0.12em] text-[color:var(--fg)]">
            {authorized ? 'FULL TRACK READY' : 'LOGIN'}
          </button>
        </div>
      </div>
    </aside>
  )
}
