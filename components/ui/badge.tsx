import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-white/10 text-white/70',
        white:    'bg-white text-black',
        indigo:   'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
        outline:  'border border-white/15 text-white/50',
        success:  'bg-green-500/15 text-green-400 border border-green-500/25',
        glass:    'bg-white/5 border border-white/10 text-white/50 backdrop-blur-sm',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
