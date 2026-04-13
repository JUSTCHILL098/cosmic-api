'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import Hls from 'hls.js'
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

// Glass skip button
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
  const videoRef   = useRef<HTMLVideoElement>(null)
  const hlsRef     = useRef<Hls | null>(null)
  const trackRefs  = useRef<HTMLTrackElement[]>([])

  const [stream, setStream]     = useState<StreamData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [blobSubs, setBlobSubs] = useState<StreamTrack[]>([])
  const [curTime, setCurTime]   = useState(0)

  const emit = useCallback((event: string, extra?: object) => {
    window.parent?.postMessage({ channel: 'cosmic', event, epId, lang, ...extra }, '*')
  }, [epId, lang])

  // Fetch stream
  useEffect(() => {
    const cleanId = epId.includes('?ep=') ? epId.split('?ep=')[1] : epId
    fetch(`/api/stream/${cleanId}/${lang}`)
      .then(r => r.json())
      .then(j => { if (!j.success) throw new Error(j.error); setStream(j.results) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [epId, lang])

  // Blob-preload subtitles
  useEffect(() => {
    if (!stream?.tracks?.length) { setBlobSubs([]); return }
    let cancelled = false
    const urls: string[] = []
    Promise.all(stream.tracks.map(async t => {
      try {
        const res  = await fetch(t.src, { mode: 'cors' })
        const text = await res.text()
        const blob = new Blob([text], { type: 'text/vtt' })
        const url  = URL.createObjectURL(blob)
        urls.push(url)
        return { ...t, src: url }
      } catch { return t }
    })).then(r => { if (!cancelled) setBlobSubs(r) })
    return () => { cancelled = true; urls.forEach(u => URL.revokeObjectURL(u)) }
  }, [stream?.tracks])

  // Init hls.js with xhrSetup to inject Referer header
  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream?.hlsUrl) return

    hlsRef.current?.destroy()

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        xhrSetup: (xhr: XMLHttpRequest) => {
          // Inject the referer that MegaCloud CDN expects
          xhr.setRequestHeader('Referer', 'https://megacloud.blog/')
        },
      })
      hlsRef.current = hls
      hls.loadSource(stream.hlsUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) emit('error')
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = stream.hlsUrl
      video.play().catch(() => {})
    }

    // Wire events
    const onTime   = () => {
      setCurTime(video.currentTime)
      if (!video.paused && video.duration > 0) emit('time', { time: video.currentTime })
    }
    const onEnded  = () => emit('complete')
    const onError  = () => emit('error')

    video.addEventListener('timeupdate', onTime)
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onError)

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
    }
  }, [stream?.hlsUrl, emit])

  const skipIntro = useCallback(() => {
    if (videoRef.current && stream?.intro) videoRef.current.currentTime = stream.intro.end
  }, [stream?.intro])

  const skipOutro = useCallback(() => {
    if (videoRef.current && stream?.outro) videoRef.current.currentTime = stream.outro.end
  }, [stream?.outro])

  const showIntro = !!stream?.intro && curTime >= stream.intro.start && curTime < stream.intro.end
  const showOutro = !!stream?.outro && curTime >= stream.outro.start && curTime < stream.outro.end

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
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        playsInline
        controls
      >
        {tracks.map((t, i) => (
          <track
            key={t.src + i}
            src={t.src}
            label={t.label || 'English'}
            kind="subtitles"
            default={t.default === true || i === 0}
          />
        ))}
      </video>

      <SkipBtn label="Skip Intro"  visible={showIntro} onClick={skipIntro} />
      <SkipBtn label="Skip Ending" visible={showOutro} onClick={skipOutro} />
    </div>
  )
}
