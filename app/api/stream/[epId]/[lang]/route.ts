import { NextRequest, NextResponse } from 'next/server'

const HIANIME = 'https://api-rouge-zeta-61.vercel.app/api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ epId: string; lang: string }> }
) {
  const { epId, lang } = await params
  const origin = req.nextUrl.origin
  const cleanEpId = epId.includes('?ep=') ? epId.split('?ep=')[1] : epId

  try {
    // 1. Get servers
    const sr = await fetch(`${HIANIME}/servers/x?ep=${cleanEpId}`)
    const sj = await sr.json()
    const servers: { serverName: string; type: string }[] =
      Array.isArray(sj.results) ? sj.results : sj.results?.servers ?? []

    // Force HD-2 first, then HD-1, then any available
    const preferred = ['HD-2', 'hd-2', 'HD-1', 'hd-1']
    const server =
      preferred.reduce<string | null>((found, name) => {
        if (found) return found
        return servers.find(s => s.serverName === name && s.type === lang)?.serverName
          ?? servers.find(s => s.serverName === name)?.serverName
          ?? null
      }, null)
      ?? servers.find(s => s.type === lang)?.serverName
      ?? servers[0]?.serverName

    if (!server) return NextResponse.json({ success: false, error: 'No servers' }, { status: 404 })

    // 2. Get stream — server-side only
    const r = await fetch(`${HIANIME}/stream?id=x?ep=${cleanEpId}&server=${server}&type=${lang}`)
    const j = await r.json()
    const res = j.results
    const item = res?.streamingLink?.[0]
    const raw = item?.link
    const hlsUrl = typeof raw === 'string' ? raw : (raw?.file ?? null)

    if (!hlsUrl) return NextResponse.json({ success: false, error: 'No stream URL' }, { status: 404 })

    // 3. Proxy through external proxy that handles CDN auth
    const EXT = 'https://vid-max.vercel.app/api/proxy?url='
    const proxiedHls = `${EXT}${encodeURIComponent(hlsUrl)}`

    // 4. Proxy subtitle tracks through same external proxy
    const rawTracks = res?.tracks ?? item?.tracks ?? []
    const tracks = rawTracks.map((t: { file: string; label: string; kind: string; default?: boolean }) => ({
      src: `${EXT}${encodeURIComponent(t.file)}`,
      label: t.label,
      kind: t.kind,
      default: t.default,
    }))

    const rawIntro = res?.intro ?? item?.intro
    const rawOutro = res?.outro ?? item?.outro

    return NextResponse.json({
      success: true,
      results: {
        hlsUrl: proxiedHls,
        tracks,
        intro: rawIntro?.end ? rawIntro : null,
        outro: rawOutro?.end ? rawOutro : null,
        server,
        epId: cleanEpId,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Stream fetch failed' }, { status: 500 })
  }
}
