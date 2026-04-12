import { NextRequest, NextResponse } from 'next/server'

// Common referers used by anime stream servers
const REFERERS = [
  'https://megacloud.blog/',
  'https://rapid-cloud.co/',
  'https://aniwatchtv.to/',
  'https://hianime.to/',
  'https://aniwatch.to/',
]

async function fetchWithReferer(url: string, referer: string) {
  return fetch(url, {
    headers: {
      'Referer': referer,
      'Origin': new URL(referer).origin,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
    },
  })
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  // Optional: caller can hint which referer to use
  const refererHint = req.nextUrl.searchParams.get('ref')

  try {
    const decoded = decodeURIComponent(url)

    // Try referers in order until one works
    const refererList = refererHint
      ? [refererHint, ...REFERERS]
      : REFERERS

    let r: Response | null = null
    for (const referer of refererList) {
      try {
        const res = await fetchWithReferer(decoded, referer)
        if (res.ok || res.status === 206) {
          r = res
          break
        }
      } catch { /* try next */ }
    }

    // Last resort — no referer
    if (!r) {
      r = await fetch(decoded, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
    }

    if (!r.ok && r.status !== 206) {
      return new NextResponse(`Upstream error: ${r.status}`, { status: r.status })
    }

    const contentType = r.headers.get('content-type') ?? 'application/octet-stream'
    const body = await r.arrayBuffer()
    const isM3u8 = contentType.includes('mpegurl') || decoded.includes('.m3u8') || decoded.includes('m3u8')

    if (isM3u8) {
      const text = new TextDecoder().decode(body)
      const base = decoded.substring(0, decoded.lastIndexOf('/') + 1)

      const rewritten = text.split('\n').map(line => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return line

        // Absolute URL
        if (trimmed.startsWith('http')) {
          return `/api/proxy?url=${encodeURIComponent(trimmed)}`
        }
        // Relative URL
        return `/api/proxy?url=${encodeURIComponent(base + trimmed)}`
      }).join('\n')

      return new NextResponse(rewritten, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'no-cache, no-store',
        },
      })
    }

    // TS/MP4 segments and key files
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
