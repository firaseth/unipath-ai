'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface MatchScoreGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeMap = {
  sm: { outer: 48, strokeWidth: 4, fontSize: 'text-xs' },
  md: { outer: 72, strokeWidth: 5, fontSize: 'text-sm' },
  lg: { outer: 100, strokeWidth: 6, fontSize: 'text-lg' },
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10b981' // emerald-500
  if (score >= 55) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 75) return 'Strong'
  if (score >= 65) return 'Good'
  if (score >= 55) return 'Moderate'
  return 'Low'
}

export default function MatchScoreGauge({ score, size = 'md', showLabel = true, className }: MatchScoreGaugeProps) {
  const { outer, strokeWidth, fontSize } = sizeMap[size]
  const radius = (outer - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: outer, height: outer }}>
        <svg
          width={outer}
          height={outer}
          className="transform -rotate-90"
          viewBox={`0 0 ${outer} ${outer}`}
        >
          {/* Background circle */}
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/50"
          />
          {/* Progress circle */}
          <motion.circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={cn('font-bold', fontSize)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ color }}
          >
            {Math.round(score)}
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('text-muted-foreground font-medium', size === 'sm' ? 'text-[10px]' : 'text-xs')}>
          {getScoreLabel(score)} Match
        </span>
      )}
    </div>
  )
}
