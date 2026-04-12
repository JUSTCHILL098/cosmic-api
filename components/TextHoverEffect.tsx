'use client'
import { useRef, useEffect, useState } from 'react'

interface Props {
  text: string
  duration?: number
  className?: string
}

export function TextHoverEffect({ text, duration = 0.3, className = '' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [maskPos, setMaskPos] = useState({ cx: '50%', cy: '50%' })

  useEffect(() => {
    if (!svgRef.current || !hovered) return
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const cx = ((cursor.x - rect.left) / rect.width) * 100
    const cy = ((cursor.y - rect.top) / rect.height) * 100
    setMaskPos({ cx: `${cx}%`, cy: `${cy}%` })
  }, [cursor, hovered])

  const id = `mask-${text.replace(/\s/g, '')}`

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 64"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={e => setCursor({ x: e.clientX, y: e.clientY })}
      className={className}
      style={{ cursor: 'pointer', display: 'block' }}
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0b48d6" />
          <stop offset="100%" stopColor="#05f4cc" />
        </linearGradient>
        <radialGradient id={`radial-${id}`} cx={maskPos.cx} cy={maskPos.cy} r="35%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <mask id={id}>
          <rect width="100%" height="100%" fill={`url(#radial-${id})`} />
        </mask>
      </defs>

      {/* Base — dim outline */}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        fontSize="48" fontWeight="900"
        fontFamily="'Geist Mono',ui-monospace,monospace"
        letterSpacing="0.1em"
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1">
        {text}
      </text>

      {/* Gradient reveal on hover */}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        fontSize="48" fontWeight="900"
        fontFamily="'Geist Mono',ui-monospace,monospace"
        letterSpacing="0.1em"
        fill={`url(#grad-${id})`} stroke="none"
        mask={`url(#${id})`}
        style={{ opacity: hovered ? 1 : 0, transition: `opacity ${duration}s ease` }}>
        {text}
      </text>
    </svg>
  )
}
