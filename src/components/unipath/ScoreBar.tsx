'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ScoreBarProps {
  label: string
  value: number
  max?: number
  className?: string
  showValue?: boolean
  color?: 'emerald' | 'amber' | 'red' | 'teal'
}

const colorMap = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  teal: 'bg-teal-500',
}

const trackColorMap = {
  emerald: 'bg-emerald-100 dark:bg-emerald-950',
  amber: 'bg-amber-100 dark:bg-amber-950',
  red: 'bg-red-100 dark:bg-red-950',
  teal: 'bg-teal-100 dark:bg-teal-950',
}

export default function ScoreBar({
  label,
  value,
  max = 100,
  className,
  showValue = true,
  color = 'emerald',
}: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const getBarColor = (val: number) => {
    if (val >= 75) return 'emerald'
    if (val >= 55) return 'amber'
    return 'red'
  }

  const activeColor = color === 'teal' ? 'teal' : getBarColor(percentage)

  return (
    <div className={cn('w-full space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
        {showValue && (
          <span className={cn(
            'text-xs font-bold',
            percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' :
            percentage >= 55 ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
          )}>
            {Math.round(value)}/{max}
          </span>
        )}
      </div>
      <div className={cn('h-2 rounded-full overflow-hidden', trackColorMap[activeColor])}>
        <motion.div
          className={cn('h-full rounded-full', colorMap[activeColor])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}
