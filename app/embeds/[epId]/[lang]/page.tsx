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
      {/* No referrer — CDN allows requests without referer */}
      <meta name="referrer" content="no-referrer" />
      <EmbedPlayer epId={epId} lang={lang} />
    </>
  )
}
