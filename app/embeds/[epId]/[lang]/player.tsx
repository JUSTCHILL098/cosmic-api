'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import { MediaPlayer, MediaProvider, Track, type MediaPlayerInstance } from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { SkipForward, WifiOff, Loader2 } from 'lucide-react'

interface StreamTrack { src: string; label: string; kind: string; default?: boolean }
interface SkipTime { start: number; end: number }
interface StreamData {
  hlsUrl: string
  tracks: StreamTrack[]
  intro: SkipTime | null
  outro: SkipTime | null
}

export default function EmbedPlayer({ epId, lang }: { epId: string; lang: string }) {
  const playerRef  = useRef<MediaPlayerInstance>(null)
  const mediaElRef = useRef<HTMLVideoElement | null>(null)

  const [stream, setStream]           = useState<StreamData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [blobSubs, setBlobSubs]       = useState<StreamTrack[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [showSkipIntro, setShowSkipIntro] = useState(false)
  const [showSkipOutro, setShowSkipOutro] = useState(false)

  const emit = useCallback((event: string, extra?: object) => {
    window.parent?.postMessage({ channel: 'cosmic', event, epId, lang, ...extra }, '*')
  }, [epId, lang])

  // Fetch stream from our API
  useEffect(() => {
    const cleanId = epId.includes('?ep=') ? epId.split('?ep=')[1] : epId
    fetch(`/api/stream/${cleanId}/${lang}`)
      .then(r => r.json())
      .then(j => {
        if (!j.success) throw new Error(j.error ?? 'No stream')
        setStream(j.results)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [epId, lang])

  // Preload subtitles as blob URLs — no CORS lag, instant display
  useEffect(() => {
    if (!stream?.tracks?.length) { setBlobSubs([]); return }
    let cancelled = false
    const urls: string[] = []

    Promise.all(
      stream.tracks.map(async t => {
        try {
          const res  = await fetch(t.src, { mode: 'cors' })
          const text = await res.text()
          const blob = new Blob([text], { type: 'text/vtt' })
          const url  = URL.createObjectURL(blob)
          urls.push(url)
          return { ...t, src: url }
        } catch {
          return t // fallback to original URL
        }
      })
    ).then(resolved => {
      if (!cancelled) setBlobSubs(resolved)
    })

    return () => {
      cancelled = true
      urls.forEach(u => URL.revokeObjectURL(u))
    }
  }, [stream?.tracks])

  // Wire timeupdate on the native video element (same pattern as reference)
  useEffect(() => {
    const player = playerRef.current
    if (!player || !stream?.hlsUrl) return

    const onReady = () => {
      // @ts-ignore — access native video element
      const el: HTMLVideoElement | null = player.nativeEl ?? player.el?.querySelector('video')
      if (!el) return
      mediaElRef.current = el

      const onTime = () => {
        const t = el.currentTime
        setCurrentTime(t)
        if (!el.paused && el.duration > 0) {
          emit('time', { time: t, duration: el.duration })
        }
      }

      const onEnded = () => emit('complete')
      const onError = () => emit('error')

      el.addEventListener('timeupdate', onTime)
      el.addEventListener('ended', onEnded)
      el.addEventListener('error', onError)

      return () => {
        el.removeEventListener('timeupdate', onTime)
        el.removeEventListener('ended', onEnded)
        el.removeEventListener('error', onError)
      }
    }

    // @ts-ignore
    player.addEventListener?.('can-play', onReady)
    const cleanup = onReady()

    return () => {
      // @ts-ignore
      player.removeEventListener?.('can-play', onReady)
      cleanup?.()
    }
  }, [stream?.hlsUrl, emit])

  // Show/hide skip buttons based on currentTime
  useEffect(() => {
    setShowSkipIntro(!!(stream?.intro && currentTime >= stream.intro.start && currentTime < stream.intro.end))
    setShowSkipOutro(!!(stream?.outro && currentTime >= stream.outro.start && currentTime < stream.outro.end))
  }, [currentTime, stream?.intro, stream?.outro])

  const skipIntro = useCallback(() => {
    if (mediaElRef.current && stream?.intro) mediaElRef.current.currentTime = stream.intro.end
  }, [stream?.intro])

  const skipOutro = useCallback(() => {
    if (mediaElRef.current && stream?.outro) mediaElRef.current.currentTime = stream.outro.end
  }, [stream?.outro])

  // ── Loading ──
  if (loading) return (
    <div style={{ width: '100%', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="rgba(255,255,255,0.4)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Error ──
  if (error || !stream) return (
    <div style={{ width: '100%', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <WifiOff size={36} color="rgba(255,255,255,0.15)" />
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: "'Geist Mono',monospace", letterSpacing: '0.1em', margin: 0 }}>
        STREAM UNAVAILABLE
      </p>
    </div>
  )

  const tracks = blobSubs.length ? blobSubs : stream.tracks

  return (
    <div
      key={stream.hlsUrl}
      style={{ width: '100%', height: '100vh', background: '#000', overflow: 'hidden', position: 'relative' }}
    >
      {/* White Vidstack theme */}
      <style>{`
        :root { --media-brand: #ffffff; --media-focus-ring-color: rgba(255,255,255,0.4); }
        .vds-controls { background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%) !important; }
      `}</style>

      <MediaPlayer
        ref={playerRef}
        src={stream.hlsUrl}
        style={{ width: '100%', height: '100%' }}
        crossOrigin="anonymous"
        playsInline
        autoPlay
        onError={() => emit('error')}
      >
        <MediaProvider>
          {tracks.map((t, i) => (
            <Track
              key={t.src + i}
              src={t.src}
              label={t.label || 'English'}
              kind="subtitles"
              default={t.default === true || i === 0}
            />
          ))}
        </MediaProvider>
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          noScrubGesture={false}
          slots={{ pipButton: null }}
        />
      </MediaPlayer>

      {/* Skip Intro — translucent glass */}
      {showSkipIntro && (
        <button
          onClick={skipIntro}
          className="absolute bottom-16 right-4 flex items-center gap-2 font-mono text-sm font-semibold transition-all"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '8px 16px',
            color: '#fff',
            zIndex: 50,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Geist Mono',ui-monospace,monospace",
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
        >
          <SkipForward size={15} />
          Skip Intro
        </button>
      )}

      {/* Skip Outro / Ending — translucent glass */}
      {showSkipOutro && (
        <button
          onClick={skipOutro}
          className="absolute bottom-16 right-4 flex items-center gap-2 font-mono text-sm font-semibold transition-all"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '8px 16px',
            color: '#fff',
            zIndex: 50,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Geist Mono',ui-monospace,monospace",
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
        >
          <SkipForward size={15} />
          Skip Ending
        </button>
      )}
    </div>
  )
}
