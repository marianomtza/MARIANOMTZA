'use client'

import React, { useEffect, useState } from 'react'

declare global {
  interface Window {
    MusicKit?: {
      configure: (config: { developerToken: string; app: { name: string; build: string } }) => void
      getInstance: () => { isAuthorized: boolean; authorize: () => Promise<string> }
    }
  }
}

const TRACKS = [
  { artist: 'Sega Bodega', title: 'U Suck', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/bf/d6/10/bfd61052-7549-5f95-7dc5-e6f2954f6bc9/mzaf_741930831368865084.plus.aac.p.m4a' },
  { artist: 'Oklou', title: 'gods chariots', preview: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4a/26/a3/4a26a39f-7447-e6bd-f7fa-bc241a7a84db/mzaf_7844935561767801645.plus.aac.p.m4a' },
]

export const AppleMusicDock: React.FC = () => {
  const [active, setActive] = useState(0)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js'
    script.async = true
    script.onload = () => {
      const token = process.env.NEXT_PUBLIC_MUSICKIT_DEVELOPER_TOKEN
      if (token && window.MusicKit) {
        window.MusicKit.configure({ developerToken: token, app: { name: 'MARIANOMTZA', build: '1.0.0' } })
      }
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const authorize = async () => {
    if (!window.MusicKit) return
    const instance = window.MusicKit.getInstance()
    await instance.authorize()
    setAuthorized(instance.isAuthorized)
  }

  return (
    <aside className="fixed bottom-4 left-1/2 z-[90] w-[min(760px,calc(100%-24px))] -translate-x-1/2 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3">
        {TRACKS.map((track, i) => (
          <button
            key={track.title}
            onClick={() => setActive(i)}
            className={`rounded-xl px-4 py-2 text-left text-xs ${active === i ? 'bg-white/20' : 'bg-transparent'}`}
          >
            <p className="font-medium text-white">{track.title}</p>
            <p className="text-white/70">{track.artist}</p>
          </button>
        ))}

        <audio className="ml-auto h-8" controls src={TRACKS[active].preview} preload="none" />

        <button onClick={authorize} className="rounded-full border border-white/30 px-4 py-2 text-[10px] tracking-[0.18em] text-white">
          {authorized ? 'APPLE CONNECTED' : 'LOGIN APPLE MUSIC'}
        </button>
      </div>
    </aside>
  )
}
