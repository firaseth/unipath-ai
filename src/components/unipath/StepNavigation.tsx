'use client'

import { useAppStore, type AppStep } from '@/store/app-store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Home,
  User,
  GraduationCap,
  FileText,
  Send,
  FlaskConical,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StepConfig {
  key: AppStep
  label: string
  shortLabel: string
  icon: React.ReactNode
}

const STEPS: StepConfig[] = [
  { key: 'welcome', label: 'Welcome', shortLabel: 'Home', icon: <Home className="h-4 w-4" /> },
  { key: 'profile', label: 'Profile', shortLabel: 'Profile', icon: <User className="h-4 w-4" /> },
  { key: 'recommendations', label: 'Matches', shortLabel: 'Matches', icon: <GraduationCap className="h-4 w-4" /> },
  { key: 'documents', label: 'Documents', shortLabel: 'Docs', icon: <FileText className="h-4 w-4" /> },
  { key: 'applications', label: 'Applications', shortLabel: 'Apply', icon: <Send className="h-4 w-4" /> },
  { key: 'simulate', label: 'Simulate', shortLabel: 'What-If', icon: <FlaskConical className="h-4 w-4" /> },
]

const STEP_ORDER: AppStep[] = ['welcome', 'profile', 'recommendations', 'documents', 'applications', 'simulate']

export default function StepNavigation() {
  const { currentStep, setCurrentStep, savedStudentId } = useAppStore()

  const currentIndex = STEP_ORDER.indexOf(currentStep)

  const canNavigateTo = (step: AppStep): boolean => {
    const stepIndex = STEP_ORDER.indexOf(step)
    if (stepIndex === 0) return true
    // Welcome is always accessible
    if (step === 'welcome') return true
    // Profile is always accessible
    if (step === 'profile') return true
    // Everything after profile requires a saved student
    if (!savedStudentId) return false
    // Can go back to any completed step
    return stepIndex <= currentIndex
  }

  return (
    <nav className="w-full" aria-label="Progress">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex
          const isActive = step.key === currentStep
          const isAccessible = canNavigateTo(step.key)

          return (
            <Tooltip key={step.key}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => isAccessible && setCurrentStep(step.key)}
                  disabled={!isAccessible}
                  className={cn(
                    'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200',
                    isActive && 'bg-primary/10 text-primary shadow-sm',
                    isCompleted && isAccessible && 'text-primary hover:bg-primary/5 cursor-pointer',
                    !isActive && !isCompleted && isAccessible && 'text-muted-foreground hover:bg-primary/5 hover:text-primary cursor-pointer',
                    !isAccessible && 'text-muted-foreground/40 cursor-not-allowed'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full text-xs font-bold shrink-0 transition-all duration-200',
                      isActive && 'bg-primary text-primary-foreground shadow-md',
                      isCompleted && isAccessible && 'bg-primary/20 text-primary',
                      !isActive && !isCompleted && isAccessible && 'bg-muted text-muted-foreground',
                      !isAccessible && 'bg-muted/50 text-muted-foreground/40'
                    )}
                  >
                    {isCompleted && isAccessible ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      step.icon
                    )}
                  </span>
                  <span className="hidden md:inline truncate max-w-[100px]">{step.label}</span>
                  <span className="md:hidden truncate max-w-[40px]">{step.shortLabel}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{step.label}</p>
                {isCompleted && isAccessible && <p className="text-xs text-muted-foreground">Completed</p>}
                {!isAccessible && <p className="text-xs text-muted-foreground">Complete previous steps first</p>}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          initial={false}
          animate={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </nav>
  )
}
