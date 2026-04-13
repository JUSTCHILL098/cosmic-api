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

const MONO = "'Geist Mono',ui-monospace,monospace"

function SkipBtn({ label, visible, onClick }: { label: string; visible: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  if (!visible) return null
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', bottom: 64, right: 16, zIndex: 50,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 16px',
        background: hov ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8, color: '#fff', cursor: 'pointer',
        fontSize: 13, fontWeight: 600, fontFamily: MONO,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'background 0.15s',
      }}
    >
      <SkipForward size={15} />
      {label}
    </button>
  )
}

export default function EmbedPlayer({ epId, lang }: { epId: string; lang: string }) {
  const playerRef  = useRef<MediaPlayerInstance>(null)
  const mediaElRef = useRef<HTMLVideoElement | null>(null)

  const [stream, setStream]         = useState<StreamData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [blobSubs, setBlobSubs]     = useState<StreamTrack[]>([])
  const [curTime, setCurTime]       = useState(0)
  const [showIntro, setShowIntro]   = useState(false)
  const [showOutro, setShowOutro]   = useState(false)

  const emit = useCallback((event: string, extra?: object) => {
    window.parent?.postMessage({ channel: 'cosmic', event, epId, lang, ...extra }, '*')
  }, [epId, lang])

  // Fetch stream — all URLs already proxied server-side
  useEffect(() => {
    const cleanId = epId.includes('?ep=') ? epId.split('?ep=')[1] : epId
    fetch(`/api/stream/${cleanId}/${lang}`)
      .then(r => r.json())
      .then(j => { if (!j.success) throw new Error(j.error); setStream(j.results) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [epId, lang])

  // Blob-preload subtitles from proxied URLs — instant display, no CORS lag
  useEffect(() => {
    if (!stream?.tracks?.length) { setBlobSubs([]); return }
    let cancelled = false
    const urls: string[] = []
    Promise.all(stream.tracks.map(async t => {
      try {
        const res  = await fetch(t.src)
        const text = await res.text()
        const blob = new Blob([text], { type: 'text/vtt' })
        const url  = URL.createObjectURL(blob)
        urls.push(url)
        return { ...t, src: url }
      } catch { return t }
    })).then(r => { if (!cancelled) setBlobSubs(r) })
    return () => { cancelled = true; urls.forEach(u => URL.revokeObjectURL(u)) }
  }, [stream?.tracks])

  // Wire native video element for timeupdate + skip logic
  useEffect(() => {
    const player = playerRef.current
    if (!player || !stream?.hlsUrl) return

    const onReady = () => {
      // @ts-ignore
      const el: HTMLVideoElement | null = player.nativeEl ?? player.el?.querySelector('video')
      if (!el) return
      mediaElRef.current = el

      const onTime = () => {
        const t = el.currentTime
        setCurTime(t)
        if (!el.paused && el.duration > 0) emit('time', { time: t, duration: el.duration })
      }
      const onEnded = () => emit('complete')
      const onErr   = () => emit('error')

      el.addEventListener('timeupdate', onTime)
      el.addEventListener('ended', onEnded)
      el.addEventListener('error', onErr)
      return () => {
        el.removeEventListener('timeupdate', onTime)
        el.removeEventListener('ended', onEnded)
        el.removeEventListener('error', onErr)
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
    setShowIntro(!!(stream?.intro && curTime >= stream.intro.start && curTime < stream.intro.end))
    setShowOutro(!!(stream?.outro && curTime >= stream.outro.start && curTime < stream.outro.end))
  }, [curTime, stream?.intro, stream?.outro])

  const skipIntro = useCallback(() => {
    if (mediaElRef.current && stream?.intro) mediaElRef.current.currentTime = stream.intro.end
  }, [stream?.intro])

  const skipOutro = useCallback(() => {
    if (mediaElRef.current && stream?.outro) mediaElRef.current.currentTime = stream.outro.end
  }, [stream?.outro])

  if (loading) return (
    <div style={{ width: '100%', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="rgba(255,255,255,0.4)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error || !stream) return (
    <div style={{ width: '100%', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <WifiOff size={36} color="rgba(255,255,255,0.15)" />
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontFamily: MONO, letterSpacing: '0.1em', margin: 0 }}>STREAM UNAVAILABLE</p>
    </div>
  )

  const tracks = blobSubs.length ? blobSubs : stream.tracks

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <style>{`:root{--media-brand:#fff;--media-focus-ring-color:rgba(255,255,255,0.4)}`}</style>

      <MediaPlayer
        ref={playerRef}
        src={stream.hlsUrl}
        style={{ width: '100%', height: '100%' }}
        playsInline
        autoPlay
        onEnded={() => emit('complete')}
        onError={() => emit('error')}
      >
        <MediaProvider>
          {tracks.map((t, i) => (
            <Track
              key={t.src + i}
              src={t.src}
              label={t.label || 'English'}
              kind={t.kind as 'subtitles' | 'captions'}
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

      <SkipBtn label="Skip Intro"  visible={showIntro} onClick={skipIntro} />
      <SkipBtn label="Skip Ending" visible={showOutro} onClick={skipOutro} />
    </div>
  )
}
