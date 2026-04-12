import { NextRequest, NextResponse } from 'next/server'

const HIANIME = 'https://api-rouge-zeta-61.vercel.app/api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ epId: string; lang: string }> }
) {
  const { epId, lang } = await params
  if (!epId) return NextResponse.json({ success: false, error: 'Missing epId' }, { status: 400 })

  // Handle both "136197" and "one-piece-100?ep=136197" formats
  const cleanEpId = epId.includes('?ep=') ? epId.split('?ep=')[1] : epId
  const validLang = lang === 'dub' ? 'dub' : 'sub'
  const origin = req.nextUrl.origin
  const embedUrl = `${origin}/embeds/${cleanEpId}/${validLang}`

  return NextResponse.json({
    success: true,
    results: {
      embedUrl,
      iframe: `<iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture; encrypted-media"></iframe>`,
      epId: cleanEpId,
      lang: validLang,
    },
  })
}
