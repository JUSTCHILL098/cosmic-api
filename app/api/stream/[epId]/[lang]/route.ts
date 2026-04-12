import { NextRequest, NextResponse } from 'next/server'

const HIANIME = 'https://api-rouge-zeta-61.vercel.app/api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ epId: string; lang: string }> }
) {
  const { epId, lang } = await params
  const origin = req.nextUrl.origin

  // Handle both "136197" and "one-piece-100?ep=136197" formats
  const cleanEpId = epId.includes('?ep=') ? epId.split('?ep=')[1] : epId

  try {
    // 1. Get servers
    const sr = await fetch(`${HIANIME}/servers/x?ep=${cleanEpId}`)
    const sj = await sr.json()
    const servers: { serverName: string; type: string }[] =
      Array.isArray(sj.results) ? sj.results : sj.results?.servers ?? []

    const server =
      servers.find(s => s.type === lang)?.serverName ??
      servers.find(s => s.type === 'sub')?.serverName ??
      servers[0]?.serverName

    if (!server) return NextResponse.json({ success: false, error: 'No servers' }, { status: 404 })

    // 2. Get stream — server-side only, m3u8 never reaches browser
    const r = await fetch(`${HIANIME}/stream?id=x?ep=${cleanEpId}&server=${server}&type=${lang}`)
    const j = await r.json()
    const res = j.results
    const item = res?.streamingLink?.[0]
    const raw = item?.link
    const hlsUrl = typeof raw === 'string' ? raw : (raw?.file ?? null)

    if (!hlsUrl) return NextResponse.json({ success: false, error: 'No stream URL' }, { status: 404 })

    // 3. Use external proxy directly — handles CDN auth + CORS
    const proxiedUrl = `https://pro-xi-mocha.vercel.app/?url=${encodeURIComponent(hlsUrl)}`

    const tracks = (res?.tracks ?? item?.tracks ?? []).map((t: { file: string; label: string; kind: string; default?: boolean }) => ({
      src: t.file,
      label: t.label,
      kind: t.kind,
      default: t.default,
    }))

    const rawIntro = res?.intro ?? item?.intro
    const rawOutro = res?.outro ?? item?.outro

    return NextResponse.json({
      success: true,
      results: {
        hlsUrl: proxiedUrl,
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
