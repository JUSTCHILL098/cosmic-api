import EmbedPlayer from './player'

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ epId: string; lang: string }>
}) {
  const { epId, lang } = await params
  return (
    <>
      <style>{`
        body{margin:0;padding:0;background:#000;overflow:hidden}
        :root{--media-brand:#fff}
      `}</style>
      {/* Tell browser to send Referer header to CDN */}
      <meta name="referrer" content="no-referrer-when-downgrade" />
      <EmbedPlayer epId={epId} lang={lang} />
    </>
  )
}
