'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import {
  MediaPlayer, MediaProvider, Track,
  type MediaPlayerInstance,
} from '@vidstack/react'
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

// ── Translucent glass skip button ─────────────────────────────────────────────
function SkipBtn({
  label, visible, onSkip,
}: { label: string; visible: boolean; onSkip: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onSkip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        bottom: 72,
        right: 16,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 18px',
        fontFamily: "'Geist Mono', ui-monospace, monospace",
        fontSize: 13,
        fontWeight: 600,
        color: '#fff',
        letterSpacing: '0.02em',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 0, // squarish
        background: hovered ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
        transition: 'background 0.15s, opacity 0.2s, transform 0.2s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <SkipForward size={15} />
      Skip {label}
    </button>
  )
}

// ── Main player ───────────────────────────────────────────────────────────────
export default function EmbedPlayer({ epId, lang }: { epId: string; lang: string }) {
  const playerRef  = useRef<MediaPlayerInstance>(null)
  const mediaElRef = useRef<HTMLVideoElement | null>(null)

  const [stream, setStream]           = useState<StreamData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [blobSubs, setBlobSubs]       = useState<StreamTrack[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [showIntro, setShowIntro]     = useState(false)
  const [showOutro, setShowOutro]     = useState(false)

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

  // Preload subtitles as blob URLs to avoid CORS/network lag
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

  // Wire timeupdate on native video element
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
        if (!el.paused && el.duration > 0) emit('time', { time: t })
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

  // Show/hide skip buttons
  useEffect(() => {
    setShowIntro(!!(stream?.intro && currentTime >= stream.intro.start && currentTime < stream.intro.end))
    setShowOutro(!!(stream?.outro && currentTime >= stream.outro.start && currentTime < stream.outro.end))
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
        :root {
          --media-brand: #ffffff;
          --media-focus-ring-color: rgba(255,255,255,0.4);
          --media-slider-track-fill-bg: #ffffff;
          --media-time-slider-track-fill-bg: #ffffff;
          --media-live-button-bg: #ffffff;
        }
        .vds-play-button svg, .vds-mute-button svg, .vds-fullscreen-button svg,
        .vds-pip-button svg, .vds-caption-button svg, .vds-settings-button svg,
        .vds-seek-button svg { color: #ffffff !important; }
        .vds-time { color: rgba(255,255,255,0.85) !important; }
        .vds-slider-track-fill { background: #ffffff !important; }
        .vds-slider-thumb { background: #ffffff !important; border-color: #ffffff !important; }
        .vds-controls { background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%) !important; }
      `}</style>

      <MediaPlayer
        ref={playerRef}
        src={stream.hlsUrl}
        style={{ width: '100%', height: '100%' }}
        crossOrigin="anonymous"
        playsInline
        autoPlay
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
      <SkipBtn label="Intro" visible={showIntro} onSkip={skipIntro} />

      {/* Skip Outro — translucent glass */}
      <SkipBtn label="Ending" visible={showOutro} onSkip={skipOutro} />
    </div>
  )
}
