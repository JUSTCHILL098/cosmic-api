import { NextRequest, NextResponse } from 'next/server'

const CDN_REFERERS = [
  'https://megacloud.blog/',
  'https://rapid-cloud.co/',
  'https://hianime.to/',
  'https://aniwatch.to/',
  'https://aniwatchtv.to/',
]

const HEADERS = (referer: string) => ({
  'Referer': referer,
  'Origin': new URL(referer).origin,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
})

async function tryFetch(url: string): Promise<Response | null> {
  for (const referer of CDN_REFERERS) {
    try {
      const r = await fetch(url, { headers: HEADERS(referer) })
      if (r.ok || r.status === 206) return r
    } catch { /* try next */ }
  }
  // Last resort — no referer
  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  try {
    const decoded = decodeURIComponent(url)
    const r = await tryFetch(decoded)

    if (!r || !r.ok) {
      return new NextResponse(`Upstream ${r?.status ?? 'error'}`, { status: r?.status ?? 502 })
    }

    const contentType = r.headers.get('content-type') ?? 'application/octet-stream'
    const body = await r.arrayBuffer()
    const isM3u8 = contentType.includes('mpegurl') || decoded.includes('.m3u8')
    const isVtt  = contentType.includes('vtt') || decoded.includes('.vtt')

    if (isM3u8) {
      const text = new TextDecoder().decode(body)
      const base = decoded.substring(0, decoded.lastIndexOf('/') + 1)

      const rewritten = text.split('\n').map(line => {
        const t = line.trim()
        if (!t || t.startsWith('#')) return line
        const segUrl = t.startsWith('http') ? t : base + t
        return `/api/proxy?url=${encodeURIComponent(segUrl)}`
      }).join('\n')

      return new NextResponse(rewritten, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      })
    }

    if (isVtt) {
      return new NextResponse(body, {
        headers: {
          'Content-Type': 'text/vtt',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    console.error('Proxy error:', e)
    return new NextResponse('Proxy error', { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  })
}
