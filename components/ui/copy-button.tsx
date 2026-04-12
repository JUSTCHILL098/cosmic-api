'use client'
import { useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'outline' | 'ghost' | 'glass'
}

export function CopyButton({ text, className, variant = 'ghost' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn('relative h-7 w-7 disabled:opacity-100', className)}
      onClick={handleCopy}
      disabled={copied}
    >
      <span className={cn('absolute transition-all duration-200', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}>
        <CheckIcon className="w-3.5 h-3.5 text-green-400" />
      </span>
      <span className={cn('transition-all duration-200', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100')}>
        <CopyIcon className="w-3.5 h-3.5" />
      </span>
    </Button>
  )
}
