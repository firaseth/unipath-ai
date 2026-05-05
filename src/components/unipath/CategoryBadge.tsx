'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Recommendation } from '@/store/app-store'

interface CategoryBadgeProps {
  category: Recommendation['category']
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const config = {
  safe: {
    label: 'Safe',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: '🛡️',
  },
  target: {
    label: 'Target',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: '🎯',
  },
  reach: {
    label: 'Reach',
    className: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: '🚀',
  },
}

const sizeConfig = {
  sm: 'text-[10px] px-1.5 py-0',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-3 py-1',
}

export default function CategoryBadge({ category, className, size = 'md' }: CategoryBadgeProps) {
  const c = config[category]

  return (
    <Badge
      variant="outline"
      className={cn(c.className, sizeConfig[size], 'font-semibold border gap-1', className)}
    >
      <span>{c.icon}</span>
      {c.label}
    </Badge>
  )
}
