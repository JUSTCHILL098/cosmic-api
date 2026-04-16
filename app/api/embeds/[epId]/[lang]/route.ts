import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api-rouge-zeta-61.vercel.app/api'

export async function GET(
  req: NextRequest,
  { params }: { params: { epId?: string; animeId?: string; lang?: string } }
) {
  try {
    const { epId, animeId, lang } = params

    const validType = lang === 'dub' ? 'dub' : 'sub'
    let finalId = epId

    // ✅ STEP 1: fallback to animeId → get episode
    if (!finalId && animeId) {
      const epRes = await fetch(`${BASE}/episodes/${animeId}`)
      const epData = await epRes.json()

      finalId = epData?.episodes?.[0]?.id
      if (!finalId) {
        return NextResponse.json({ success: false, error: 'No episodes found' }, { status: 404 })
      }
    }

    if (!finalId) {
      return NextResponse.json({ success: false, error: 'Missing epId or animeId' }, { status: 400 })
    }

    // Clean format
    const cleanId = finalId.includes('?ep=')
      ? finalId
      : `${finalId}`

    const query = `id=${cleanId}&server=hd-1&type=${validType}`

    // ✅ STEP 2: PRIMARY STREAM API
    let res = await fetch(`${BASE}/stream?${query}`)
    let data = await res.json()

    // ❗ STEP 3: FALLBACK API
    if (!data?.success) {
      console.log('Primary failed → using fallback')

      res = await fetch(`${BASE}/stream/fallback?${query}`)
      data = await res.json()
    }

    if (!data?.success) {
      return NextResponse.json({ success: false, error: 'Streaming API failed' }, { status: 500 })
    }

    const stream = data.results.streamingLink?.[0]

    return NextResponse.json({
      success: true,
      results: {
        video: stream?.link,          // HLS .m3u8
        iframe: stream?.iframe,       // embed player
        tracks: data.results.tracks,  // subtitles
        intro: data.results.intro,
        outro: data.results.outro,
        servers: data.results.servers,
      },
    })

  } catch (err) {
    console.error('STREAM ERROR:', err)

    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
`}```
