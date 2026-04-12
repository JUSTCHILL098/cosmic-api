'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw } from 'lucide-react'

const SENTENCES = [
  'A cold silence drifts beneath dying starlight.',
  'You seek to trespass into the unseen side of the cosmos—',
  'where light forgets its purpose,',
  'and the void begins to notice you.',
]

const MONO = "'Geist Mono',ui-monospace,monospace"

interface Props { open: boolean; onClose: () => void }

// Renders a sentence word by word, calls onDone when all words are visible
function SentenceReveal({ sentence, onDone }: { sentence: string; onDone: () => void }) {
  const words = sentence.split(' ')
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    words.forEach((_, i) => {
      timers.push(setTimeout(() => setCount(i + 1), i * 110))
    })
    // call onDone 500ms after last word
    timers.push(setTimeout(onDone, words.length * 110 + 500))
    return () => timers.forEach(clearTimeout)
  }, [sentence])

  return (
    <p style={{
      margin: 0,
      fontSize: 'clamp(18px,3vw,26px)',
      lineHeight: 1.7,
      color: 'rgba(255,255,255,0.75)',
      letterSpacing: '0.01em',
      fontFamily: MONO,
      fontWeight: 400,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '0.3em',
      textAlign: 'center',
    }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={count > i ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}

export default function CosmicGate({ open, onClose }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)          // 0..3 = sentences, 4 = buttons
  const [exiting, setExiting] = useState(false) // true while current sentence fades out
  const [phase, setPhase] = useState<'reading' | 'turnback' | 'leaving'>('reading')

  // Reset on open
  useEffect(() => {
    if (!open) return
    setStep(0)
    setExiting(false)
    setPhase('reading')
  }, [open])

  // When a sentence finishes, fade it out then show next
  const handleSentenceDone = () => {
    if (step < SENTENCES.length - 1) {
      setExiting(true)
      setTimeout(() => {
        setStep(s => s + 1)
        setExiting(false)
      }, 500)
    } else {
      // Last sentence done — show buttons
      setExiting(true)
      setTimeout(() => {
        setStep(SENTENCES.length) // buttons step
        setExiting(false)
      }, 500)
    }
  }

  const handleYes = () => {
    setPhase('leaving')
    setTimeout(() => router.push('/aboutdevs'), 900)
  }

  const handleNo = () => {
    setPhase('turnback')
    setTimeout(() => { onClose(); setStep(0); setPhase('reading') }, 2400)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 40,
            fontFamily: MONO,
          }}
        >
          <div style={{ maxWidth: 560, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, textAlign: 'center' }}>

            <AnimatePresence mode="wait">

              {/* ── SENTENCES ── */}
              {phase === 'reading' && step < SENTENCES.length && (
                <motion.div
                  key={`sentence-${step}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: exiting ? 0 : 1 }}
                  transition={{ duration: 0.45 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}
                >
                  {/* Rotating sigil */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 36, height: 36, border: '1px solid rgba(255,255,255,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}
                  >
                    <div style={{ width: 4, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', width: 28, height: 28, border: '1px dashed rgba(255,255,255,0.04)', borderRadius: '50%' }} />
                  </motion.div>

                  {/* Sentence counter */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {SENTENCES.map((_, i) => (
                      <div key={i} style={{ width: i === step ? 20 : 5, height: 2, borderRadius: 99, background: i === step ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)', transition: 'all 0.4s ease' }} />
                    ))}
                  </div>

                  <SentenceReveal
                    key={step}
                    sentence={SENTENCES[step]}
                    onDone={handleSentenceDone}
                  />
                </motion.div>
              )}

              {/* ── BUTTONS ── */}
              {phase === 'reading' && step === SENTENCES.length && (
                <motion.div
                  key="buttons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
                >
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.16em', fontFamily: MONO }}>
                    DO YOU WISH TO PROCEED?
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleYes}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 99, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: MONO, letterSpacing: '0.1em', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}>
                      YES <ArrowRight size={13} />
                    </button>
                    <button onClick={handleNo}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 99, color: 'rgba(255,255,255,0.22)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: MONO, letterSpacing: '0.1em', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.22)' }}>
                      <RotateCcw size={12} /> NO
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── TURN BACK ── */}
              {phase === 'turnback' && (
                <motion.div key="turnback"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <p style={{ margin: 0, fontSize: 'clamp(22px,4vw,36px)', fontWeight: 700, color: 'rgba(255,255,255,0.1)', letterSpacing: '-0.01em', fontFamily: MONO }}>
                    TURN BACK
                  </p>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
                    style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.07)', letterSpacing: '0.14em', fontFamily: MONO }}>
                    the void releases you... for now
                  </motion.p>
                </motion.div>
              )}

              {/* ── LEAVING ── */}
              {phase === 'leaving' && (
                <motion.div key="leaving"
                  initial={{ opacity: 1 }} animate={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.9, ease: 'easeIn' }}
                  style={{ fontSize: 11, color: 'rgba(255,255,255,0.1)', letterSpacing: '0.2em', fontFamily: MONO }}>
                  ENTERING THE VOID...
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
