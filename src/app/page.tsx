'use client'

import { useAppStore } from '@/store/app-store'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import StepNavigation from '@/components/unipath/StepNavigation'
import WelcomeView from '@/components/unipath/WelcomeView'
import ProfileForm from '@/components/unipath/ProfileForm'
import RecommendationsView from '@/components/unipath/RecommendationsView'
import DocumentsView from '@/components/unipath/DocumentsView'
import ApplicationsView from '@/components/unipath/ApplicationsView'
import SimulateView from '@/components/unipath/SimulateView'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function Home() {
  const { currentStep } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderCurrentView = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeView />
      case 'profile':
        return <ProfileForm />
      case 'recommendations':
        return <RecommendationsView />
      case 'documents':
        return <DocumentsView />
      case 'applications':
        return <ApplicationsView />
      case 'simulate':
        return <SimulateView />
      default:
        return <WelcomeView />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">
                  UniPath <span className="text-primary">AI</span>
                </h1>
                <p className="text-[10px] text-muted-foreground leading-none hidden sm:block">Smart Admissions</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <TooltipProvider delayDuration={0}>
                <StepNavigation />
              </TooltipProvider>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
              >
                <div className="pb-4">
                  <TooltipProvider delayDuration={0}>
                    <StepNavigation />
                  </TooltipProvider>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {currentStep !== 'welcome' && (
        <footer className="border-t border-border/40 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>UniPath AI &mdash; Smart University Admissions</span>
              </div>
              <div>
                AI-powered admission assistant for Iraqi, Arab, and Western universities
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
