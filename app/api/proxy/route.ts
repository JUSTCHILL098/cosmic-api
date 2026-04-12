import { NextRequest, NextResponse } from 'next/server'

// External proxy that handles MegaCloud CDN auth
const EXT_PROXY = 'https://pro-xi-mocha.vercel.app/?url='

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  try {
    const decoded = decodeURIComponent(url)
    const isM3u8 = decoded.includes('.m3u8') || decoded.includes('m3u8')

    // Fetch through external proxy which handles CDN auth
    const proxyUrl = `${EXT_PROXY}${encodeURIComponent(decoded)}`
    const r = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!r.ok) {
      return new NextResponse(`Upstream error: ${r.status}`, { status: r.status })
    }

    const body = await r.arrayBuffer()
    const contentType = r.headers.get('content-type') ?? 'application/octet-stream'

    if (isM3u8) {
      const text = new TextDecoder().decode(body)
      const base = decoded.substring(0, decoded.lastIndexOf('/') + 1)

      // Rewrite all segment/key URLs to go through our proxy
      const rewritten = text.split('\n').map(line => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return line
        const segUrl = trimmed.startsWith('http') ? trimmed : base + trimmed
        return `/api/proxy?url=${encodeURIComponent(segUrl)}`
      }).join('\n')

      return new NextResponse(rewritten, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // TS segments, key files, etc.
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
