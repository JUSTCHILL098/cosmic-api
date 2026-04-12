'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { ArrowLeft, Github, Globe, Zap } from 'lucide-react'

export default function AboutDevs() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Geist Mono',ui-monospace,monospace", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ maxWidth: 560, width: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#000" fill="#000" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.15em' }}>COSMIC</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <motion.h1
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
            About the Devs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>
            You ventured past the veil. Here lies what you sought.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'Cosmic Dev', role: 'Architect of the Void', note: 'Built the stream proxy, embed system, and Vidstack integration.' },
            { name: 'API Weaver', role: 'Data Conjurer', note: 'Wired the HiAnime API, episode fetching, and server routing.' },
          ].map(d => (
            <div key={d.name} style={{ padding: 20, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{d.role}</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>{d.note}</p>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}
          onClick={() => router.push('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99, color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: 'fit-content', letterSpacing: '0.04em' }}>
          <ArrowLeft size={13} />Return to Cosmic
        </motion.button>
      </motion.div>
    </div>
  )
}
