'use client'

import { useState, useMemo } from 'react'
import { useAppStore, type Recommendation } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  FlaskConical,
  Play,
  Loader2,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  DollarSign,
  Languages,
  Globe2,
  School,
  BarChart3,
  Plus,
  Sparkles,
} from 'lucide-react'
import CategoryBadge from './CategoryBadge'
import MatchScoreGauge from './MatchScoreGauge'

const ALL_COUNTRIES = [
  'Iraq', 'Syria', 'Jordan', 'Lebanon', 'Egypt', 'UAE', 'Saudi Arabia',
  'Kuwait', 'Oman', 'Qatar', 'Bahrain', 'Turkey', 'Malaysia',
  'Germany', 'UK', 'Canada', 'Australia', 'USA', 'India',
]

export default function SimulateView() {
  const { studentProfile, recommendations, simulationResults, setSimulationResults } = useAppStore()

  const [simGpa, setSimGpa] = useState(studentProfile.gpa)
  const [simGpaScale, setSimGpaScale] = useState(studentProfile.gpaScale)
  const [simBudgetMax, setSimBudgetMax] = useState(studentProfile.budgetMax)
  const [simIelts, setSimIelts] = useState<number | null>(studentProfile.ieltsScore)
  const [simCountries, setSimCountries] = useState<string[]>([...studentProfile.preferredCountries])
  const [simDegree, setSimDegree] = useState(studentProfile.preferredDegree)
  const [simulating, setSimulating] = useState(false)
  const [hasSimulated, setHasSimulated] = useState(false)

  const toggleCountry = (country: string) => {
    setSimCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    )
  }

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentProfile,
          overrides: {
            gpa: simGpa,
            gpaScale: simGpaScale,
            budgetMax: simBudgetMax,
            ieltsScore: simIelts,
            preferredCountries: simCountries,
            preferredDegree: simDegree,
          },
        }),
      })

      if (!res.ok) throw new Error('Simulation failed')

      const data = await res.json()
      setSimulationResults(data.results)
      setHasSimulated(true)
      toast.success(`Simulation complete! ${data.results.length} matches found.`)
    } catch (err: any) {
      toast.error(err.message || 'Simulation failed')
    } finally {
      setSimulating(false)
    }
  }

  // Compare results
  const comparison = useMemo(() => {
    if (!hasSimulated || simulationResults.length === 0) return null

    const currentIds = new Set(recommendations.map(r => r.universityId))
    const simIds = new Set(simulationResults.map(r => r.universityId))

    const newUnis = simulationResults.filter(r => !currentIds.has(r.universityId)).slice(0, 10)
    const lostUnis = recommendations.filter(r => !simIds.has(r.universityId)).slice(0, 10)

    const currentStats = {
      safe: recommendations.filter(r => r.category === 'safe').length,
      target: recommendations.filter(r => r.category === 'target').length,
      reach: recommendations.filter(r => r.category === 'reach').length,
      avgScore: recommendations.length > 0 ? Math.round(recommendations.reduce((s, r) => s + r.matchScore, 0) / recommendations.length) : 0,
      avgCost: recommendations.length > 0 ? Math.round(recommendations.reduce((s, r) => s + r.totalCost, 0) / recommendations.length) : 0,
    }

    const simStats = {
      safe: simulationResults.filter(r => r.category === 'safe').length,
      target: simulationResults.filter(r => r.category === 'target').length,
      reach: simulationResults.filter(r => r.category === 'reach').length,
      avgScore: simulationResults.length > 0 ? Math.round(simulationResults.reduce((s, r) => s + r.matchScore, 0) / simulationResults.length) : 0,
      avgCost: simulationResults.length > 0 ? Math.round(simulationResults.reduce((s, r) => s + r.totalCost, 0) / simulationResults.length) : 0,
    }

    return { newUnis, lostUnis, currentStats, simStats }
  }, [recommendations, simulationResults, hasSimulated])

  const StatDiff = ({ label, current, simulated }: { label: string; current: number; simulated: number }) => {
    const diff = simulated - current
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{current}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="font-bold">{simulated}</span>
          {diff !== 0 && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 ${
              diff > 0
                ? 'text-emerald-600 border-emerald-200 dark:border-emerald-800'
                : 'text-red-600 border-red-200 dark:border-red-800'
            }`}>
              {diff > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {diff > 0 ? '+' : ''}{diff}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FlaskConical className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">What-If Simulator</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Get your recommendations first, then use the simulator to test different scenarios and see how your matches change.
        </p>
        <Button onClick={() => useAppStore.getState().setCurrentStep('profile')} className="gap-2">
          Get Recommendations First
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          What-If Simulator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Modify your profile parameters and see how your university matches change in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Adjustments */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Adjust Parameters</CardTitle>
              <CardDescription>Modify values to simulate different scenarios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* GPA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    GPA
                  </Label>
                  <span className="text-sm font-bold text-primary">{simGpa} / {simGpaScale}</span>
                </div>
                <Slider
                  min={0}
                  max={simGpaScale}
                  step={simGpaScale <= 5 ? 0.1 : 1}
                  value={[simGpa]}
                  onValueChange={([v]) => setSimGpa(v)}
                />
              </div>

              <Separator />

              {/* GPA Scale */}
              <div className="space-y-2">
                <Label className="text-sm">GPA Scale</Label>
                <Select value={String(simGpaScale)} onValueChange={(v) => { setSimGpaScale(parseFloat(v)); setSimGpa(Math.min(simGpa, parseFloat(v))) }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4.0 Scale</SelectItem>
                    <SelectItem value="5">5.0 Scale</SelectItem>
                    <SelectItem value="10">10.0 Scale</SelectItem>
                    <SelectItem value="100">100 (Percentage)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Budget */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Max Budget
                  </Label>
                  <span className="text-sm font-bold text-primary">${simBudgetMax.toLocaleString()}</span>
                </div>
                <Slider
                  min={5000}
                  max={100000}
                  step={1000}
                  value={[simBudgetMax]}
                  onValueChange={([v]) => setSimBudgetMax(v)}
                />
              </div>

              <Separator />

              {/* IELTS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <Languages className="h-4 w-4 text-primary" />
                    IELTS Score
                  </Label>
                  <span className="text-sm font-bold text-primary">{simIelts ?? 'N/A'}</span>
                </div>
                <Slider
                  min={0}
                  max={9}
                  step={0.5}
                  value={[simIelts ?? 0]}
                  onValueChange={([v]) => setSimIelts(v === 0 ? null : v)}
                />
              </div>

              <Separator />

              {/* Degree */}
              <div className="space-y-2">
                <Label className="text-sm">Preferred Degree</Label>
                <Select value={simDegree} onValueChange={setSimDegree}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bachelor">Bachelor&apos;s</SelectItem>
                    <SelectItem value="Master">Master&apos;s</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Countries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                Countries ({simCountries.length} selected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                {ALL_COUNTRIES.map((country) => {
                  const isChecked = simCountries.includes(country)
                  return (
                    <label
                      key={country}
                      className={`flex items-center gap-1.5 p-1.5 rounded-md text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCountry(country)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="truncate">{country}</span>
                    </label>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Run Simulation */}
          <Button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 text-base"
          >
            {simulating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Run Simulation
              </>
            )}
          </Button>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-3 space-y-4">
          {!hasSimulated ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Simulation Results</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Adjust the parameters on the left and click &quot;Run Simulation&quot; to see how your university matches change.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Comparison Stats */}
              {comparison && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Current vs Simulated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">Current Matches</div>
                        <div className="text-2xl font-bold">{recommendations.length}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10">
                        <div className="text-xs text-muted-foreground mb-1">Simulated Matches</div>
                        <div className="text-2xl font-bold text-primary">{simulationResults.length}</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2.5">
                      <StatDiff label="Safe Matches" current={comparison.currentStats.safe} simulated={comparison.simStats.safe} />
                      <StatDiff label="Target Matches" current={comparison.currentStats.target} simulated={comparison.simStats.target} />
                      <StatDiff label="Reach Matches" current={comparison.currentStats.reach} simulated={comparison.simStats.reach} />
                      <StatDiff label="Avg Match Score" current={comparison.currentStats.avgScore} simulated={comparison.simStats.avgScore} />
                      <StatDiff label="Avg Cost/Year" current={comparison.currentStats.avgCost} simulated={comparison.simStats.avgCost} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* New Universities */}
              {comparison && comparison.newUnis.length > 0 && (
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <Plus className="h-4 w-4" />
                      New Matches ({comparison.newUnis.length})
                    </CardTitle>
                    <CardDescription>Universities that appear with your simulated profile.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {comparison.newUnis.map((rec) => (
                      <div key={rec.universityId} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{rec.universityName}</p>
                          <p className="text-xs text-muted-foreground">{rec.country}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={rec.category} size="sm" />
                          <MatchScoreGauge score={rec.matchScore} size="sm" showLabel={false} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Lost Universities */}
              {comparison && comparison.lostUnis.length > 0 && (
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-300">
                      <Minus className="h-4 w-4" />
                      Lost Matches ({comparison.lostUnis.length})
                    </CardTitle>
                    <CardDescription>Universities that no longer match with your simulated profile.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {comparison.lostUnis.map((rec) => (
                      <div key={rec.universityId} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{rec.universityName}</p>
                          <p className="text-xs text-muted-foreground">{rec.country}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={rec.category} size="sm" />
                          <MatchScoreGauge score={rec.matchScore} size="sm" showLabel={false} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Top Simulated Results */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Top Simulated Matches
                  </CardTitle>
                  <CardDescription>Your best matches based on the simulated profile.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-2">
                      {simulationResults.slice(0, 15).map((rec, idx) => (
                        <motion.div
                          key={rec.universityId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">#{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{rec.universityName}</p>
                              <p className="text-xs text-muted-foreground">{rec.country}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <CategoryBadge category={rec.category} size="sm" />
                            <span className="text-xs font-medium text-muted-foreground">${rec.totalCost.toLocaleString()}/yr</span>
                            <MatchScoreGauge score={rec.matchScore} size="sm" showLabel={false} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
