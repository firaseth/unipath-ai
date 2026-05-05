'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  GraduationCap,
  Brain,
  Globe2,
  FileText,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'AI-Powered Matching',
    description: 'Our intelligent algorithm analyzes your profile to find the best university matches based on GPA, budget, preferences, and more.',
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: 'Global Coverage',
    description: 'Access universities across Iraq, the Arab world, Malaysia, Germany, UAE, Turkey, and many more countries.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'AI Document Generation',
    description: 'Auto-generate professional personal statements, motivation letters, and academic CVs tailored to each university.',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'What-If Simulator',
    description: 'Test different scenarios — change your GPA, budget, or preferences to see how your matches change in real time.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Smart Categorization',
    description: 'Every recommendation is tagged as Safe, Target, or Reach so you can build a balanced application strategy.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Complete Application Tracker',
    description: 'Track all your applications from draft to acceptance with status updates and document management.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function WelcomeView() {
  const { setCurrentStep } = useAppStore()
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    const seedUniversities = async () => {
      try {
        setSeeding(true)
        const res = await fetch('/api/universities?action=seed')
        const data = await res.json()
        if (data.totalUniversities) {
          console.log(`Seeded ${data.totalUniversities} universities`)
        }
      } catch (err) {
        console.error('Failed to seed universities:', err)
      } finally {
        setSeeding(false)
      }
    }
    seedUniversities()
  }, [])

  const handleGetStarted = () => {
    setCurrentStep('profile')
    toast.success('Let\'s get started! Tell us about yourself.')
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-200 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <GraduationCap className="h-4 w-4" />
            AI-Powered University Admissions
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight">
            UniPath AI
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-emerald-100 mb-3 font-medium">
            Your Intelligent University Admission Assistant
          </p>

          <p className="text-sm sm:text-base text-emerald-200/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Find your perfect university match with AI-driven recommendations,
            generate application documents automatically, and simulate different
            admission scenarios — all in one place.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 transition-all duration-300 h-auto"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="flex-1 px-4 sm:px-6 py-12 sm:py-16 bg-background">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Everything You Need to Get Admitted
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From smart matching to document generation, UniPath AI covers every step of your university application journey.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={item}>
              <Card className="h-full border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
                <CardContent className="p-5 sm:p-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-14 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { value: '200+', label: 'Universities' },
            { value: '15+', label: 'Countries' },
            { value: 'AI', label: 'Document Gen' },
            { value: '100%', label: 'Free to Use' },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
