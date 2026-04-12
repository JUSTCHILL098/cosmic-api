// ── Cosmic Embed URL Builders ─────────────────────────────────────────────────
// Reverse engineered from VidPlays, Peachify, VidCore, MegaPlay documentation

export type Lang = 'sub' | 'dub'

export interface EmbedResult {
  embedUrl: string
  iframe: string
  source: string
  type: string
  [key: string]: string | number | undefined
}

function iframe(url: string) {
  return `<iframe src="${url}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture; encrypted-media"></iframe>`
}

// ── VidPlays ──────────────────────────────────────────────────────────────────
export function vidplaysAnime(anilistId: string, ep: string, lang: Lang = 'sub', q: Record<string, string> = {}): EmbedResult {
  const u = new URL(`https://vidplays.fun/embed/anime/${anilistId}/${ep}/${lang}`)
  if (q.autoSkip !== 'false') u.searchParams.set('autoSkip', 'true')
  if (q.startAt) u.searchParams.set('startAt', q.startAt)
  const url = u.toString()
  return { embedUrl: url, iframe: iframe(url), source: 'vidplays', type: 'anime', anilistId, ep, lang }
}

export function vidplaysMovie(tmdbId: string, q: Record<string, string> = {}): EmbedResult {
  const u = new URL(`https://vidplays.fun/embed/movie/${tmdbId}`)
  if (q.autoplay !== 'false') u.searchParams.set('autoplay', 'true')
  if (q.startAt) u.searchParams.set('startAt', q.startAt)
  const url = u.toString()
  return { embedUrl: url, iframe: iframe(url), source: 'vidplays', type: 'movie', tmdbId }
}

export function vidplaysTV(tmdbId: string, season: string, ep: string, q: Record<string, string> = {}): EmbedResult {
  const u = new URL(`https://vidplays.fun/embed/tv/${tmdbId}/${season}/${ep}`)
  if (q.autoplay !== 'false') u.searchParams.set('autoplay', 'true')
  const url = u.toString()
  return { embedUrl: url, iframe: iframe(url), source: 'vidplays', type: 'tv', tmdbId, season, ep }
}

// ── Peachify ──────────────────────────────────────────────────────────────────
export function peachifyMovie(tmdbId: string, q: Record<string, string> = {}): EmbedResult {
  const u = new URL(`https://peachify.top/embed/movie/${tmdbId}`)
  if (q.server) u.searchParams.set('server', q.server)
  if (q.dub) u.searchParams.set('dub', q.dub)
  if (q.startAt) u.searchParams.set('startAt', q.startAt)
  if (q.accent) u.searchParams.set('accent', q.accent.replace('#', ''))
  for (const k of ['pip', 'cast', 'fullscreen', 'volume', 'servers', 'captions', 'quality']) {
    if (q[k] === 'hide' || q[k] === 'false' || q[k] === '0') u.searchParams.set(k, 'hide')
  }
  const url = u.toString()
  return { embedUrl: url, iframe: iframe(url), source: 'peachify', type: 'movie', tmdbId }
}

export function peachifyTV(tmdbId: string, season: string, ep: string, q: Record<string, string> = {}): EmbedResult {
  const u = new URL(`https://peachify.top/embed/tv/${tmdbId}/${season}/${ep}`)
  if (q.server) u.searchParams.set('server', q.server)
  if (q.dub) u.searchParams.set('dub', q.dub)
  if (q.startAt) u.searchParams.set('startAt', q.startAt)
  const url = u.toString()
  return { embedUrl: url, iframe: iframe(url), source: 'peachify', type: 'tv', tmdbId, season, ep }
}

// ── VidCore ───────────────────────────────────────────────────────────────────
export function vidcoreMovie(id: string, q: Record<string, string> = {}): EmbedResult {
  const u = new URL(`https://vidcore.net/movie/${id}`)
  if (q.autoPlay !== 'false') u.searchParams.set('autoPlay', 'true')
  if (q.theme) u.searchParams.set('theme', q.theme.replace('#', ''))
  if (q.sub) u.searchParams.set('sub', q.sub)
  if (q.server) u.searchParams.set('server', q.server)
  if (q.hideServer) u.searchParams.set('hideServer', 'true')
  const url = u.toString()
  return { embedUrl: url, iframe: iframe(url), source: 'vidcore', type: 'movie', id }
}

export function vidcoreTV(id: string, season: string, ep: string, q: Record<string, string> = {}): EmbedResult {
  const u = new URL(`https://vidcore.net/tv/${id}/${season}/${ep}`)
  if (q.autoPlay !== 'false') u.searchParams.set('autoPlay', 'true')
  if (q.theme) u.searchParams.set('theme', q.theme.replace('#', ''))
  if (q.sub) u.searchParams.set('sub', q.sub)
  const url = u.toString()
  return { embedUrl: url, iframe: iframe(url), source: 'vidcore', type: 'tv', id, season, ep }
}

// ── MegaPlay ──────────────────────────────────────────────────────────────────
export function megaplayByEpId(epId: string, lang: Lang = 'sub'): EmbedResult {
  const url = `https://megaplay.buzz/stream/s-2/${epId}/${lang}`
  return { embedUrl: url, iframe: iframe(url), source: 'megaplay', type: 'anime', epId, lang, note: 'epId = ?ep= value from aniwatchtv.to' }
}

export function megaplayByMal(malId: string, ep: string, lang: Lang = 'sub'): EmbedResult {
  const url = `https://megaplay.buzz/stream/mal/${malId}/${ep}/${lang}`
  return { embedUrl: url, iframe: iframe(url), source: 'megaplay', type: 'anime', malId, ep, lang }
}

export function megaplayByAnilist(anilistId: string, ep: string, lang: Lang = 'sub'): EmbedResult {
  const url = `https://megaplay.buzz/stream/ani/${anilistId}/${ep}/${lang}`
  return { embedUrl: url, iframe: iframe(url), source: 'megaplay', type: 'anime', anilistId, ep, lang }
}

// ── Index ─────────────────────────────────────────────────────────────────────
export const EMBED_INDEX = {
  name: 'Cosmic Embed API',
  version: '1.0.0',
  description: 'Generate iframe embed URLs for anime, movies and TV. One API, four sources.',
  sources: ['vidplays', 'peachify', 'vidcore', 'megaplay'],
  endpoints: {
    'GET /api/embed/anime/:anilistId/:ep/:lang':           'VidPlays anime — AniList ID + episode + sub|dub',
    'GET /api/embed/movie/:tmdbId':                        'VidPlays movie — TMDB ID',
    'GET /api/embed/tv/:tmdbId/:season/:ep':               'VidPlays TV — TMDB ID + season + episode',
    'GET /api/embed/peachify/movie/:tmdbId':               'Peachify movie — TMDB ID',
    'GET /api/embed/peachify/tv/:tmdbId/:season/:ep':      'Peachify TV — TMDB ID + season + episode',
    'GET /api/embed/vidcore/movie/:id':                    'VidCore movie — IMDB or TMDB ID',
    'GET /api/embed/vidcore/tv/:id/:season/:ep':           'VidCore TV — IMDB or TMDB ID + season + episode',
    'GET /api/embed/megaplay/:epId/:lang':                 'MegaPlay anime — Aniwatch episode ID + sub|dub',
    'GET /api/embed/megaplay/mal/:malId/:ep/:lang':        'MegaPlay anime — MAL ID + episode + sub|dub',
    'GET /api/embed/megaplay/ani/:anilistId/:ep/:lang':    'MegaPlay anime — AniList ID + episode + sub|dub',
  },
  queryParams: {
    redirect:   'true — 302 redirect to embed URL instead of JSON',
    autoSkip:   'false — disable auto intro/outro skip (VidPlays anime, on by default)',
    startAt:    'number — start playback at this second',
    server:     'iron|spider|wolf|prime|hulk — force server (Peachify)',
    dub:        'English — force audio language (Peachify)',
    accent:     'hex without # — player accent color (Peachify)',
    theme:      'hex without # — player theme color (VidCore)',
    sub:        'en|es|fr — default subtitle language (VidCore)',
    hideServer: 'true — hide server selector (VidCore)',
    pip:        'hide — hide PiP button (Peachify)',
    cast:       'hide — hide cast button (Peachify)',
  },
  examples: {
    anime:    '/api/embed/anime/172463/1/sub',
    movie:    '/api/embed/movie/550',
    tv:       '/api/embed/tv/1396/1/1',
    peachify: '/api/embed/peachify/movie/550?server=iron',
    vidcore:  '/api/embed/vidcore/movie/tt0816692',
    megaplay: '/api/embed/megaplay/136197/sub',
  },
}
