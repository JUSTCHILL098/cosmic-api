import { NextRequest, NextResponse } from 'next/server'

// Proxies HLS segments/manifests to avoid CORS issues
// Usage: /api/proxy?url=<encoded-url>
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  try {
    const decoded = decodeURIComponent(url)
    const r = await fetch(decoded, {
      headers: {
        'Referer': 'https://megacloud.blog/',
        'Origin': 'https://megacloud.blog',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const contentType = r.headers.get('content-type') ?? 'application/octet-stream'
    const body = await r.arrayBuffer()

    // If it's an m3u8, rewrite segment URLs to go through our proxy too
    if (contentType.includes('mpegurl') || decoded.includes('.m3u8')) {
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
          'Cache-Control': 'no-cache',
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
    return new NextResponse('Proxy error', { status: 500 })
  }
}
