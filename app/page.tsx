'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Play, Code2, BookOpen, Webhook, Shield, Tv2, Radio,
  SkipForward, ArrowRight, Terminal, Braces, Lock,
  AlertCircle, RefreshCw, Loader2, Sun, Moon, Search,
  FileCode, Globe, Zap, Wifi, Clock, Smartphone,
  Copy, Check, ChevronDown, Heart,
} from 'lucide-react'
import CosmicGate from '@/components/CosmicGate'
import { TextHoverEffect } from '@/components/TextHoverEffect'

// ── hooks ─────────────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(true)
  useEffect(() => {
    document.body.style.background = dark ? '#050507' : '#f8f8f8'
    document.body.style.color = dark ? '#e4e4e7' : '#18181b'
  }, [dark])
  return { dark, toggle: () => setDark(d => !d) }
}
function useOrigin() {
  const [o, setO] = useState('')
  useEffect(() => setO(window.location.origin), [])
  return o
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, sm }: { text: string; sm?: boolean }) {
  const [ok, setOk] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500) }}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: sm ? 28 : 32, height: sm ? 28 : 32, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', color: ok ? '#4ade80' : 'rgba(255,255,255,0.35)', flexShrink: 0, transition: 'all 0.2s' }}>
      {ok ? <Check size={sm ? 11 : 13} /> : <Copy size={sm ? 11 : 13} />}
    </button>
  )
}

// ── Code block ────────────────────────────────────────────────────────────────
function Code({ code, lang = 'bash', title }: { code: string; lang?: string; title?: string }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', background: 'rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <FileCode size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.03em' }}>{title ?? lang}</span>
        </div>
        <CopyBtn text={code} sm />
      </div>
      <pre style={{ margin: 0, padding: '14px 16px', fontSize: 12, lineHeight: 1.75, overflowX: 'auto', color: 'rgba(255,255,255,0.5)', fontFamily: "'SF Mono','Fira Code',monospace", whiteSpace: 'pre' }}>{code}</pre>
    </div>
  )
}

// ── Endpoint card ─────────────────────────────────────────────────────────────
function EP({ path, desc, params, example, response }: {
  path: string; desc: string
  params?: { name: string; type: string; req?: boolean; desc: string; ex?: string }[]
  example?: string; response?: string
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'ex' | 'res'>('ex')
  const origin = useOrigin()

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: '#e4e4e7' }}>
        <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(11,72,214,0.2)', color: '#05f4cc', flexShrink: 0 }}>GET</span>
        <code style={{ fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.7)', fontFamily: "'SF Mono','Fira Code',monospace" }}>{path}</code>
        <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{desc}</p>
          {origin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
              <Globe size={12} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              <code style={{ fontSize: 11, flex: 1, wordBreak: 'break-all', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono','Fira Code',monospace" }}>{origin}{path}</code>
              <CopyBtn text={`${origin}${path}`} sm />
            </div>
          )}
          {params && (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: 11, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Parameters</p>
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 60px 1fr', padding: '7px 14px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                  <span>Name</span><span>Type</span><span>Description</span>
                </div>
                {params.map(p => (
                  <div key={p.name} style={{ display: 'grid', gridTemplateColumns: '150px 60px 1fr', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, gap: 8, alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <code style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'SF Mono','Fira Code',monospace" }}>{p.name}</code>
                      {p.req && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(11,72,214,0.2)', color: '#05f4cc' }}>req</span>}
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>{p.type}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>
                      {p.desc}{p.ex && <><br /><code style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'SF Mono','Fira Code',monospace" }}>e.g. {p.ex}</code></>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(example || response) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, width: 'fit-content' }}>
                {example && <button onClick={() => setTab('ex')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: tab === 'ex' ? 'rgba(255,255,255,0.08)' : 'none', border: 'none', color: tab === 'ex' ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}><Terminal size={11} />Example</button>}
                {response && <button onClick={() => setTab('res')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: tab === 'res' ? 'rgba(255,255,255,0.08)' : 'none', border: 'none', color: tab === 'res' ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}><Braces size={11} />Response</button>}
              </div>
              {tab === 'ex' && example && <Code code={example} lang="javascript" />}
              {tab === 'res' && response && <Code code={response} lang="json" />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Anime poster marquee columns ──────────────────────────────────────────────
const POSTERS = [
  // Col 1
  ['https://cdn.noitatnemucod.net/thumbnail/300x400/100/bcd84731a3eda4f4a306250769675065.jpg', // One Piece
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/a1c21d8b67b4a99bc693f26bf8fcd2e5.jpg', // JJK
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/edb439410a78d22ec940f8a938e144f5.jpg', // Hell's Paradise
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/c464a5af29d7c23cee182abf1a775016.jpg', // Sentenced
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/b3da1326e07269ddd8d73475c5dabf2c.jpg', // Chainsaw Man
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/5e61f3e7c0045e46b670d31a5bb39c68.jpg', // Death Note
  ],
  // Col 2
  ['https://cdn.noitatnemucod.net/thumbnail/300x400/100/82402f796b7d84d7071ab1e03ff7747a.jpg', // JJK TV
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/debf027d032c6d40b91fab16b2ff9bd4.jpg', // AoT
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/b51f863b05f30576cf9d85fa9b911bb5.png', // JJK S2
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/30df93feaa422101659e14d0a2a2f582.jpg', // Demon Slayer
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/fced51e392ffd80041b3a1581ba7de2f.jpg', // Blue Lock
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/a8b56a7589ff9edb6c86977c31e27a06.jpg', // DanDaDan
  ],
  // Col 3
  ['https://cdn.noitatnemucod.net/thumbnail/300x400/100/5db400c33f7494bc8ae96f9e634958d0.jpg', // Naruto
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/bd5ae1d387a59c5abcf5e1a6a616728c.jpg', // Bleach
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/f58b0204c20ae3310f65ae7b8cb9987e.jpg', // Black Clover
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/65f92e6e315a931ef872da4b312442b8.jpg', // Solo Leveling S2
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/5e766fbd23e796462040a67203345a7b.jpg', // Frieren
   'https://cdn.noitatnemucod.net/thumbnail/300x400/100/d3cd9af95553a60cca782566d80ea31b.jpg', // Frieren S2
  ],
]

function MarqueeCol({ posters, duration, reverse }: { posters: string[]; duration: number; reverse?: boolean }) {
  const doubled = [...posters, ...posters]
  return (
    <div style={{ width: 150, overflow: 'hidden', height: '100%', flexShrink: 0 }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        animation: `marqueeUp ${duration}s linear infinite`,
        animationDirection: reverse ? 'reverse' : 'normal',
      }}>
        {doubled.map((src, i) => (
          <div key={i} style={{ width: 150, height: 225, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, background: 'rgba(255,255,255,0.02)', transition: 'all 0.4s' }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Episode grid ──────────────────────────────────────────────────────────────
function EpGrid({ episodes, current, onSelect }: {
  episodes: { id: string; episode_no: number; title?: string }[]
  current: string
  onSelect: (ep: { id: string; episode_no: number; title?: string }) => void
}) {
  const [search, setSearch] = useState('')
  const [chunk, setChunk] = useState(0)
  const N = 100
  const filtered = search ? episodes.filter(e => String(e.episode_no).includes(search) || e.title?.toLowerCase().includes(search.toLowerCase())) : episodes
  const chunks = Math.ceil(episodes.length / N)
  const visible = search ? filtered : filtered.slice(chunk * N, chunk * N + N)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>{episodes.length} EPISODES</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
          <Search size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 11, color: '#e4e4e7', width: 80, fontFamily: 'inherit' }} />
        </div>
      </div>
      {chunks > 1 && !search && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {Array.from({ length: chunks }).map((_, i) => (
            <button key={i} onClick={() => setChunk(i)}
              style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8, background: chunk === i ? '#05f4cc' : 'rgba(255,255,255,0.04)', color: chunk === i ? '#fff' : 'rgba(255,255,255,0.3)', border: `1px solid ${chunk === i ? '#05f4cc' : 'rgba(255,255,255,0.08)'}` }}>
              {i * N + 1}–{Math.min((i + 1) * N, episodes.length)}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: 3, maxHeight: 180, overflowY: 'auto' }}>
        {visible.map(ep => (
          <button key={ep.id} onClick={() => onSelect(ep)} title={ep.title ?? `Ep ${ep.episode_no}`}
            style={{ height: 34, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 9, transition: 'all 0.15s', background: current === ep.id ? '#05f4cc' : 'rgba(255,255,255,0.04)', color: current === ep.id ? '#fff' : 'rgba(255,255,255,0.35)', border: `1px solid ${current === ep.id ? '#05f4cc' : 'rgba(255,255,255,0.08)'}` }}>
            {ep.episode_no}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Demo player ───────────────────────────────────────────────────────────────
function Demo() {
  const origin = useOrigin()
  const [animeId, setAnimeId] = useState('')
  const [episodes, setEpisodes] = useState<{ id: string; episode_no: number; title?: string }[]>([])
  const [currentEp, setCurrentEp] = useState<{ id: string; episode_no: number; title?: string } | null>(null)
  const [lang, setLang] = useState<'sub' | 'dub'>('sub')
  const [embedUrl, setEmbedUrl] = useState('')
  const [loadingEps, setLoadingEps] = useState(false)
  const [active, setActive] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchEps = async () => {
    if (!animeId.trim()) return
    setLoadingEps(true); setErr(''); setEpisodes([]); setCurrentEp(null); setActive(false)
    try {
      const r = await fetch(`https://api-rouge-zeta-61.vercel.app/api/episodes/${animeId.trim()}`)
      const j = await r.json()
      const eps = j.results?.episodes ?? []
      setEpisodes(eps)
      if (eps[0]) setCurrentEp(eps[0])
    } catch { setErr('Failed to fetch episodes') }
    finally { setLoadingEps(false) }
  }

  const load = async () => {
    if (!currentEp) return
    const rawId = currentEp.id
    const epId = rawId.includes('?ep=') ? rawId.split('?ep=')[1] : rawId
    const r = await fetch(`/api/embeds/${epId}/${lang}`)
    const j = await r.json()
    if (j.success) { setEmbedUrl(j.results.embedUrl); setActive(true) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, transition: 'border-color 0.2s' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(236,72,153,0.4)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
          <Tv2 size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          <input value={animeId} onChange={e => setAnimeId(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchEps()}
            placeholder="Anime ID  e.g. one-piece-100"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#e4e4e7', fontFamily: 'inherit' }} />
        </div>
        <button onClick={fetchEps} disabled={!animeId || loadingEps}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'linear-gradient(135deg,#0b48d6,#05f4cc)', color: '#fff', fontSize: 12, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: "'Geist Mono',ui-monospace,monospace", letterSpacing: '0.12em', borderRadius: 8, opacity: (!animeId || loadingEps) ? 0.5 : 1, boxShadow: '0 0 20px rgba(11,72,214,0.4), 0 0 40px rgba(5,244,204,0.15)', position: 'relative', overflow: 'hidden' }}>
          {loadingEps ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
          LOAD
        </button>
      </div>

      {err && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#f87171', fontSize: 12, borderRadius: 10 }}>
          <AlertCircle size={13} />{err}
        </div>
      )}

      {episodes.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            {currentEp && (
              <div style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 600 }}>
                Ep {currentEp.episode_no}
                {currentEp.title && <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}> — {currentEp.title}</span>}
              </div>
            )}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
              {(['sub', 'dub'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: '6px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', background: lang === l ? '#05f4cc' : 'transparent', color: lang === l ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <EpGrid episodes={episodes} current={currentEp?.id ?? ''} onSelect={ep => { setCurrentEp(ep); setActive(false) }} />
          <button onClick={load} disabled={!currentEp}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, background: 'linear-gradient(135deg,#0b48d6,#05f4cc)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em', borderRadius: 12, opacity: !currentEp ? 0.4 : 1, boxShadow: '0 4px 20px rgba(11,72,214,0.3)' }}>
            <Play size={14} fill="white" />WATCH EPISODE {currentEp?.episode_no}
          </button>
        </div>
      )}

      {embedUrl && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4ade80', letterSpacing: '0.06em' }}>
            <Lock size={11} />EMBED URL READY
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
            <code style={{ fontSize: 11, flex: 1, wordBreak: 'break-all', color: 'rgba(255,255,255,0.4)', fontFamily: "'SF Mono','Fira Code',monospace" }}>{embedUrl}</code>
            <button onClick={() => { navigator.clipboard.writeText(embedUrl); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
              style={{ display: 'flex', padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ade80' : 'rgba(255,255,255,0.2)' }}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      )}

      {/* Player */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: -2, background: 'linear-gradient(135deg,rgba(11,72,214,0.15),rgba(139,92,246,0.15))', borderRadius: 22, filter: 'blur(12px)', opacity: active ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
          {!active ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ width: 56, height: 56, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={22} style={{ color: 'rgba(255,255,255,0.15)', marginLeft: 3 }} fill="currentColor" />
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.06em', margin: 0 }}>
                {episodes.length === 0 ? 'ENTER ANIME ID → LOAD → WATCH' : 'SELECT EPISODE → WATCH'}
              </p>
            </div>
          ) : (
            <iframe key={embedUrl} src={embedUrl} style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen allow="autoplay; fullscreen; picture-in-picture; encrypted-media" title="Cosmic" />
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const FEATURES_DATA = [
  { color: '#05f4cc', bg: 'rgba(236,72,153,0.1)', Icon: Zap,        title: 'Zero Ads',       desc: 'Watch without interruptions. No banners, no pop-ups, ever.' },
  { color: '#0b48d6', bg: 'rgba(139,92,246,0.1)', Icon: Tv2,        title: 'Sub & Dub',      desc: 'Every title in both subbed and dubbed formats.' },
  { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',  Icon: Wifi,       title: 'HD Streaming',   desc: 'Up to 1080p with adaptive bitrate for any connection.' },
  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', Icon: Clock,      title: 'Daily Updates',  desc: 'New episodes added within hours of Japanese broadcast.' },
  { color: '#10b981', bg: 'rgba(16,185,129,0.1)', Icon: Smartphone, title: 'Any Device',     desc: 'Works seamlessly on desktop, tablet, and mobile.' },
  { color: '#05f4cc', bg: 'rgba(236,72,153,0.1)', Icon: Shield,     title: 'No Auth',        desc: 'No API keys, no sign-up. Just drop the iframe and go.' },
]

const NAV_ITEMS = [{"id":"player","label":"Player"},{"id":"embed","label":"Embed"},{"id":"features","label":"Features"},{"id":"docs","label":"Docs"},{"id":"events","label":"Events"}]

export default function Home() {
  const { dark, toggle } = useTheme()
  const origin = useOrigin()
  const [gateOpen, setGateOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('player')

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }) },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    NAV_ITEMS.forEach(n => { const el = document.getElementById(n.id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#050507', color: '#e4e4e7', fontFamily: '"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <CosmicGate open={gateOpen} onClose={() => setGateOpen(false)} />

      {/* ── NAVBAR ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '12px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(5,5,7,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <button onClick={() => setGateOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 18, fontWeight: 800, letterSpacing: '0.12em', color: '#fff' }}>
            COSMIC
          </button>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="nav-links">
            {NAV_ITEMS.map(n => (
              <a key={n.id} href={`#${n.id}`}
                style={{ background: 'none', border: 'none', color: activeSection === n.id ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                {n.label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggle}
              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <a href="#player"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(11,72,214,0.12)', color: '#05f4cc', border: '1px solid rgba(11,72,214,0.2)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
              <Play size={13} fill="currentColor" />Try Player
            </a>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 80 }}>
        {/* Grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%,black 20%,transparent 80%)' }} />
        {/* Glows */}
        <div style={{ position: 'absolute', width: 500, height: 500, background: 'rgba(11,72,214,0.08)', borderRadius: '50%', filter: 'blur(100px)', top: '10%', left: '5%', animation: 'glowPulse 8s ease-in-out infinite alternate', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, background: 'rgba(139,92,246,0.06)', borderRadius: '50%', filter: 'blur(100px)', bottom: '10%', right: '10%', animation: 'glowPulse 8s ease-in-out infinite alternate', animationDelay: '-4s', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, padding: '40px 24px', width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Left text */}
          <div style={{ flex: '0 0 auto', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 0, animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 6, background: 'rgba(11,72,214,0.08)', border: '1px solid rgba(11,72,214,0.25)', fontSize: 11, fontWeight: 700, color: '#05f4cc', letterSpacing: '0.08em', marginBottom: 24, width: 'fit-content', animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.1s both', fontFamily: "'Geist Mono',ui-monospace,monospace" }}>
              <span style={{ width: 5, height: 5, borderRadius: 1, background: '#05f4cc', animation: 'dotPulse 2s ease-in-out infinite', display: 'inline-block' }} />
              Next Generation Streaming API
            </div>

            <div style={{ height: 'clamp(55px,8vw,88px)', marginBottom: 16, marginLeft: -8, animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.15s both', overflow: 'visible' }}>
              <TextHoverEffect text="COSMIC" />
            </div>

            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', marginBottom: 32, maxWidth: 420, animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.25s both' }}>
              The <em style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'normal', fontWeight: 500 }}>most powerful</em> anime streaming embed. Lightning-fast, ad-free, fully customizable.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 28, animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.35s both' }}>
              {[['5K+','Anime'],['HLS','Stream'],['Free','No Auth']].map(([v,l]) => (
                <div key={l} style={{ padding: '14px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', transition: 'all 0.3s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(11,72,214,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                  <span style={{ display: 'block', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>{v}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.45s both' }}>
              <a href="#player" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#fff', background: 'linear-gradient(135deg,#0b48d6,#05f4cc)', border: 'none', cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 20px rgba(11,72,214,0.3)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(5,244,204,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(11,72,214,0.3)' }}>
                GET STARTED <ArrowRight size={16} />
              </a>
              <a href="#docs" style={{ padding: '12px 24px', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', textDecoration: 'none', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
                Documentation
              </a>
            </div>
          </div>

          {/* Right: poster marquee */}
          <div style={{ flex: 1, position: 'relative', height: 580, overflow: 'hidden', display: 'flex', gap: 14, justifyContent: 'center', animation: 'fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
            <div style={{ position: 'absolute', top: -16, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom,#050507,transparent)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -16, left: 0, right: 0, height: 120, background: 'linear-gradient(to top,#050507,transparent)', zIndex: 10, pointerEvents: 'none' }} />
            <MarqueeCol posters={POSTERS[0]} duration={24} />
            <MarqueeCol posters={POSTERS[1]} duration={28} reverse />
            <MarqueeCol posters={POSTERS[2]} duration={22} />
          </div>
        </div>
      </section>

      {/* ── PLAYER ── */}
      <section id="player" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, background: 'linear-gradient(135deg,#fff 40%,#71717a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Try it now</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>Enter an anime ID, pick an episode, stream it instantly.</p>
        </div>
        <Demo />
      </section>

      {/* ── EMBED ── */}
      <section id="embed" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, background: 'linear-gradient(135deg,#fff 40%,#71717a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Embed on your site</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>One iframe. Streams, subtitles, skip times, auto-next — all handled.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Code lang="html" title="Basic embed" code={`<iframe
  src="${origin || 'https://your-domain.com'}/embeds/{episode-id}/sub"
  width="100%"
  height="100%"
  frameborder="0"
  allowfullscreen
  allow="autoplay; fullscreen; picture-in-picture">
</iframe>`} />
          <Code lang="javascript" title="How to switch episodes" code={`// 1. Fetch episode list from HiAnime API
const eps = await fetch("https://api-rouge-zeta-61.vercel.app/api/episodes/one-piece-100")
  .then(r => r.json()).then(j => j.results.episodes)
// eps[0] = { id: "one-piece-100?ep=136197", episode_no: 1, title: "..." }

// 2. Extract the numeric episode ID
const epId = eps[0].id.split("?ep=")[1]  // → "136197"

// 3. Get embed URL from Cosmic API
const { results } = await fetch(\`/api/embeds/\${epId}/sub\`).then(r => r.json())
// results.embedUrl → "/embeds/136197/sub"

// 4. Set iframe src — this changes the episode
document.querySelector("iframe").src = results.embedUrl

// 5. To switch to next episode, repeat with eps[1], eps[2], etc.`} />
          <Code lang="javascript" title="Full episode switcher example" code={`const HIANIME = "https://api-rouge-zeta-61.vercel.app/api"
const iframe = document.getElementById("player")
let episodes = []
let currentIndex = 0

// Load episode list
async function loadAnime(animeId) {
  const r = await fetch(\`\${HIANIME}/episodes/\${animeId}\`)
  const j = await r.json()
  episodes = j.results.episodes
  playEpisode(0)
}

// Play episode by index
async function playEpisode(index) {
  currentIndex = index
  const ep = episodes[index]
  const epId = ep.id.includes("?ep=") ? ep.id.split("?ep=")[1] : ep.id
  const r = await fetch(\`/api/embeds/\${epId}/sub\`)
  const { results } = await r.json()
  iframe.src = results.embedUrl
}

// Auto-next on complete
window.addEventListener("message", ({ data }) => {
  if (data?.channel !== "cosmic") return
  if (data.event === "complete" && currentIndex < episodes.length - 1) {
    playEpisode(currentIndex + 1)
  }
})

loadAnime("one-piece-100")`} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, background: 'linear-gradient(135deg,#fff 40%,#71717a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Why Cosmic?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>Everything you need for seamless anime streaming integration.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
          {FEATURES_DATA.map(({ color, bg, Icon, title, desc }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: '24px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 14, transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DOCS ── */}
      <section id="docs" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, background: 'linear-gradient(135deg,#fff 40%,#71717a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>API Documentation</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>Integrate Cosmic in seconds with our simple embed URLs.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <EP path="/api/embeds/:epId/:lang" desc="Get the embed URL for an episode. Returns your domain URL — use it as an iframe src."
            params={[
              { name: ':epId', type: 'string', req: true, desc: 'Aniwatch episode ID (the ?ep= value from aniwatchtv.to)', ex: '136197' },
              { name: ':lang', type: 'string', req: true, desc: 'Language track — sub or dub', ex: 'sub' },
            ]}
            example={`const r = await fetch("/api/embeds/136197/sub")
const { results } = await r.json()

// results.embedUrl → "${origin || 'https://your-domain.com'}/embeds/136197/sub"
// results.iframe   → full <iframe> HTML snippet`}
            response={`{
  "success": true,
  "results": {
    "embedUrl": "${origin || 'https://your-domain.com'}/embeds/136197/sub",
    "iframe": "<iframe src=\"...\" ...></iframe>",
    "epId": "136197",
    "lang": "sub"
  }
}`}
          />
          <EP path="/embeds/:epId/:lang" desc="The actual embed page. Load this in an iframe. Fetches the stream internally and plays it with Vidstack."
            params={[
              { name: ':epId', type: 'string', req: true, desc: 'Aniwatch episode ID', ex: '136197' },
              { name: ':lang', type: 'string', req: true, desc: 'sub or dub', ex: 'sub' },
            ]}
            example={`<iframe
  src="/embeds/136197/sub"
  width="100%" height="500"
  frameborder="0" allowfullscreen
  allow="autoplay; fullscreen; picture-in-picture">
</iframe>`}
          />
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, background: 'linear-gradient(135deg,#fff 40%,#71717a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Player Events</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>Listen to player events from your parent page.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
            {[
              { icon: Radio, e: 'time', d: 'Every second — { time }', color: '#05f4cc' },
              { icon: Play, e: 'complete', d: 'Episode ended', color: '#0b48d6' },
              { icon: AlertCircle, e: 'error', d: 'Stream failed', color: '#f59e0b' },
            ].map(({ icon: Icon, e, d, color }) => (
              <div key={e} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
                <div style={{ width: 32, height: 32, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <code style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'SF Mono','Fira Code',monospace" }}>{e}</code>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <Code lang="javascript" title="Listen to events" code={`window.addEventListener("message", (event) => {
  const d = event.data;
  if (d?.channel !== "cosmic") return;

  switch (d.event) {
    case "time":     updateProgress(d.time); break;
    case "complete": loadNextEpisode(); break;
    case "error":    showError(); break;
  }
});`} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
          {/* Left — COSMIC */}
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.15em', color: '#fff', fontFamily: "'Geist Mono',ui-monospace,monospace" }}>COSMIC</span>
          {/* Center — Made with heart */}
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: "'Geist Mono',ui-monospace,monospace", margin: 0, whiteSpace: 'nowrap' }}>
            Made with <Heart size={12} style={{ color: '#05f4cc', fill: '#05f4cc' }} /> by Cosmic
          </p>
          {/* Right — nav links */}
          <nav style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
            {NAV_ITEMS.map(n => (
              <a key={n.id} href={`#${n.id}`} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.2s', fontFamily: "'Geist Mono',ui-monospace,monospace" }}
                onMouseEnter={e => (e.currentTarget.style.color = '#05f4cc')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>

      <style>{`
        @media(max-width:900px){
          .nav-links{display:none!important}
        }
        @media(max-width:768px){
          section > div > div[style*="flex: 0 0 auto"]{max-width:100%!important}
          section > div[style*="display: flex"][style*="gap: 60px"]{flex-direction:column!important;gap:32px!important}
          section > div[style*="height: 580px"]{height:280px!important}
        }
      `}</style>
    </div>
  )
}
