'use client'

import { useState, useMemo } from 'react'
import { useAppStore, type Recommendation } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  MapPin,
  Trophy,
  DollarSign,
  Shield,
  Target,
  Rocket,
  Filter,
  SortAsc,
  TrendingUp,
  Award,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  School,
  Send,
} from 'lucide-react'
import MatchScoreGauge from './MatchScoreGauge'
import ScoreBar from './ScoreBar'
import CategoryBadge from './CategoryBadge'

type CategoryFilter = 'all' | 'safe' | 'target' | 'reach'
type SortOption = 'matchScore' | 'cost' | 'ranking'

export default function RecommendationsView() {
  const { recommendations, setCurrentStep, savedStudentId } = useAppStore()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Get unique regions
  const regions = useMemo(() => {
    const r = new Set(recommendations.map((rec) => rec.region))
    return Array.from(r).sort()
  }, [recommendations])

  // Stats
  const stats = useMemo(() => {
    const safe = recommendations.filter((r) => r.category === 'safe').length
    const target = recommendations.filter((r) => r.category === 'target').length
    const reach = recommendations.filter((r) => r.category === 'reach').length
    return { total: recommendations.length, safe, target, reach }
  }, [recommendations])

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...recommendations]

    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.category === categoryFilter)
    }
    if (regionFilter !== 'all') {
      result = result.filter((r) => r.region === regionFilter)
    }

    switch (sortBy) {
      case 'matchScore':
        result.sort((a, b) => b.matchScore - a.matchScore)
        break
      case 'cost':
        result.sort((a, b) => a.totalCost - b.totalCost)
        break
      case 'ranking':
        result.sort((a, b) => (a.ranking || 9999) - (b.ranking || 9999))
        break
    }

    return result
  }, [recommendations, categoryFilter, regionFilter, sortBy])

  const openDetail = (rec: Recommendation) => {
    setSelectedRec(rec)
    setDetailOpen(true)
  }

  const handleApply = (rec: Recommendation) => {
    if (!savedStudentId) return
    setDetailOpen(false)
    setCurrentStep('applications')
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <GraduationCap className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Recommendations Yet</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Complete your profile first to receive personalized university recommendations based on your academic profile and preferences.
        </p>
        <Button onClick={() => setCurrentStep('profile')} className="gap-2">
          <GraduationCap className="h-4 w-4" />
          Complete Your Profile
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Matches', value: stats.total, icon: <TrendingUp className="h-4 w-4" />, color: 'text-foreground' },
          { label: 'Safe', value: stats.safe, icon: <Shield className="h-4 w-4" />, color: 'text-emerald-600' },
          { label: 'Target', value: stats.target, icon: <Target className="h-4 w-4" />, color: 'text-amber-600' },
          { label: 'Reach', value: stats.reach, icon: <Rocket className="h-4 w-4" />, color: 'text-red-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${stat.color}`}>{stat.icon}</div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="target">Target</SelectItem>
              <SelectItem value="reach">Reach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {regions.length > 0 && (
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matchScore">Match Score</SelectItem>
              <SelectItem value="cost">Cost (Low)</SelectItem>
              <SelectItem value="ranking">Ranking</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {recommendations.length} universities
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((rec, idx) => (
            <motion.div
              key={rec.universityId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              layout
            >
              <Card
                className="cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-300 group overflow-hidden h-full"
                onClick={() => openDetail(rec)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                        {rec.universityName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{rec.city && `${rec.city}, `}{rec.country}</span>
                      </div>
                    </div>
                    <MatchScoreGauge score={rec.matchScore} size="sm" showLabel={false} />
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <CategoryBadge category={rec.category} size="sm" />
                    {rec.ranking && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Trophy className="h-3 w-3 text-amber-500" />
                        #{rec.ranking}
                      </Badge>
                    )}
                    {rec.scholarshipAvailable && (
                      <Badge variant="outline" className="text-xs gap-1 text-emerald-600 border-emerald-200 dark:border-emerald-800">
                        <Award className="h-3 w-3" />
                        Scholarship
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tuition</span>
                      <span className="font-medium">${rec.tuitionPerYear.toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Living Cost</span>
                      <span className="font-medium">${rec.costOfLiving.toLocaleString()}/yr</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total/Year</span>
                      <span className="font-bold text-primary">${rec.totalCost.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Top reasons */}
                  <div className="space-y-1">
                    {rec.reasons.slice(0, 2).map((reason, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{reason}</span>
                      </div>
                    ))}
                    {rec.reasons.length > 2 && (
                      <span className="text-xs text-primary font-medium cursor-pointer">
                        +{rec.reasons.length - 2} more reasons
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No universities match your current filters.</p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedRec && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2 flex-wrap">
                  {selectedRec.universityName}
                  <CategoryBadge category={selectedRec.category} size="sm" />
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedRec.city && `${selectedRec.city}, `}{selectedRec.country}
                  {selectedRec.ranking && ` • Ranked #${selectedRec.ranking}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* Match Score */}
                <div className="flex items-center justify-center py-2">
                  <MatchScoreGauge score={selectedRec.matchScore} size="lg" />
                </div>

                {/* Score Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Score Breakdown</h4>
                  <ScoreBar label="GPA Match" value={selectedRec.gpaMatch} />
                  <ScoreBar label="Budget Match" value={selectedRec.budgetMatch} />
                  <ScoreBar label="Location Score" value={selectedRec.locationScore} />
                  <ScoreBar label="Language Match" value={selectedRec.languageMatch} />
                  <ScoreBar label="ROI Score" value={selectedRec.roiScore} />
                </div>

                <Separator />

                {/* Cost Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Cost Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground">Tuition/Year</div>
                      <div className="text-lg font-bold text-foreground">${selectedRec.tuitionPerYear.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground">Living Cost/Year</div>
                      <div className="text-lg font-bold text-foreground">${selectedRec.costOfLiving.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 col-span-2">
                      <div className="text-xs text-muted-foreground">Total Estimated/Year</div>
                      <div className="text-lg font-bold text-primary">${selectedRec.totalCost.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {selectedRec.acceptanceRate > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Acceptance Rate</span>
                    <span className="font-semibold">{Math.round(selectedRec.acceptanceRate * 100)}%</span>
                  </div>
                )}

                <Separator />

                {/* Reasons */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Why This Match?</h4>
                  <div className="space-y-2">
                    {selectedRec.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Programs */}
                {selectedRec.programs.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">Available Programs</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRec.programs.map((program, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {program}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Apply Button */}
                <Button
                  onClick={() => handleApply(selectedRec)}
                  className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  <Send className="h-4 w-4" />
                  Apply to This University
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
