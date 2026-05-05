'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, type Application, type Recommendation } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
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
import { toast } from 'sonner'
import {
  Send,
  Plus,
  FileText,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  Pause,
  GraduationCap,
  School,
  BookOpen,
  FileSignature,
  Briefcase,
  ArrowRight,
  Trash2,
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700', icon: <FileText className="h-3.5 w-3.5" />, step: 0 },
  submitted: { label: 'Submitted', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: <Send className="h-3.5 w-3.5" />, step: 1 },
  under_review: { label: 'Under Review', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800', icon: <Clock className="h-3.5 w-3.5" />, step: 2 },
  accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', icon: <CheckCircle2 className="h-3.5 w-3.5" />, step: 3 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800', icon: <XCircle className="h-3.5 w-3.5" />, step: 3 },
  waitlisted: { label: 'Waitlisted', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: <Pause className="h-3.5 w-3.5" />, step: 3 },
}

const STATUS_PIPELINE = ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted']

const GENERATE_TYPES = [
  { key: 'personalStatement', label: 'Personal Statement', icon: <FileSignature className="h-4 w-4" /> },
  { key: 'motivationLetter', label: 'Motivation Letter', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'academicCv', label: 'Academic CV', icon: <Briefcase className="h-4 w-4" /> },
]

export default function ApplicationsView() {
  const {
    savedStudentId,
    recommendations,
    applications,
    setApplications,
  } = useAppStore()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState<string>('')
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null) // "appId-type"
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [contentDialogOpen, setContentDialogOpen] = useState(false)
  const [expandedApp, setExpandedApp] = useState<string | null>(null)
  const [loadingApps, setLoadingApps] = useState(true)

  // Fetch applications on mount
  useEffect(() => {
    const fetchApps = async () => {
      if (!savedStudentId) {
        setLoadingApps(false)
        return
      }
      try {
        const res = await fetch(`/api/applications?studentId=${savedStudentId}`)
        if (res.ok) {
          const data = await res.json()
          setApplications(data)
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      } finally {
        setLoadingApps(false)
      }
    }
    fetchApps()
  }, [savedStudentId, setApplications])

  // Get available programs for selected university
  const availablePrograms = useCallback(() => {
    if (!selectedUniversity) return []
    const rec = recommendations.find(r => r.universityName === selectedUniversity)
    return rec?.programs || ['General Admission']
  }, [selectedUniversity, recommendations])

  const handleCreateApplication = async () => {
    if (!savedStudentId || !selectedUniversity || !selectedProgram) {
      toast.error('Please select a university and program')
      return
    }

    setCreating(true)
    try {
      const rec = recommendations.find(r => r.universityName === selectedUniversity)
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: savedStudentId,
          universityId: rec?.universityId || null,
          universityName: selectedUniversity,
          program: selectedProgram,
          degree: rec?.programs.includes(selectedProgram) ? 'Bachelor' : 'Bachelor',
        }),
      })

      if (!res.ok) throw new Error('Failed to create application')

      const newApp = await res.json()
      setApplications([newApp, ...applications])
      setCreateDialogOpen(false)
      setSelectedUniversity('')
      setSelectedProgram('')
      toast.success(`Application to ${selectedUniversity} created!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create application')
    } finally {
      setCreating(false)
    }
  }

  const handleGenerate = async (app: Application, type: string) => {
    if (!savedStudentId) return

    const genKey = `${app.id}-${type}`
    setGenerating(genKey)

    try {
      const rec = recommendations.find(r => r.universityName === app.universityName)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: savedStudentId,
          universityId: rec?.universityId || app.universityId || null,
          universityName: app.universityName,
          program: app.program,
          degree: app.degree,
          type: type === 'personalStatement' ? 'personal_statement' : type === 'motivationLetter' ? 'motivation_letter' : 'academic_cv',
        }),
      })

      if (!res.ok) throw new Error('Generation failed')

      const data = await res.json()

      // Update the application
      const updatedApps = applications.map(a => {
        if (a.id === app.id) {
          const fieldMap: Record<string, string> = {
            personalStatement: 'personalStatement',
            motivationLetter: 'motivationLetter',
            academicCv: 'academicCv',
          }
          return { ...a, [type]: data.content }
        }
        return a
      })
      setApplications(updatedApps)

      // Also update in the backend
      await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: app.id,
          [type]: data.content,
        }),
      })

      setGeneratedContent(data.content)
      setContentDialogOpen(true)
      toast.success(`${type === 'personalStatement' ? 'Personal Statement' : type === 'motivationLetter' ? 'Motivation Letter' : 'Academic CV'} generated!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate content')
    } finally {
      setGenerating(null)
    }
  }

  const handleStatusChange = async (app: Application, newStatus: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: app.id, status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      const updatedApp = await res.json()
      setApplications(applications.map(a => a.id === app.id ? updatedApp : a))
      toast.success(`Status updated to "${STATUS_CONFIG[newStatus]?.label}"`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  if (!savedStudentId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Send className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Applications</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Complete your profile first to start creating and tracking your university applications.
        </p>
        <Button onClick={() => useAppStore.getState().setCurrentStep('profile')} className="gap-2">
          Complete Profile First
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            My Applications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all your university applications in one place.
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      {/* Pipeline Overview */}
      {applications.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3">Application Pipeline</h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {STATUS_PIPELINE.map((status, idx) => {
                const count = applications.filter(a => a.status === status).length
                const config = STATUS_CONFIG[status]
                return (
                  <div key={status} className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">{config.icon}</span>
                      <span className="text-xs font-medium">{config.label}</span>
                      {count > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{count}</Badge>
                      )}
                    </div>
                    {idx < STATUS_PIPELINE.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      {loadingApps ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Start by creating your first application. Select a university from your recommendations and choose a program.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {applications.map((app) => {
              const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft
              const isExpanded = expandedApp === app.id
              const docCount = [
                app.personalStatement,
                app.motivationLetter,
                app.academicCv,
              ].filter(Boolean).length

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <Card className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'ring-1 ring-primary/20' : ''}`}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base">
                              {app.universityName}
                            </h3>
                            <Badge variant="outline" className={`${statusConf.color} text-xs gap-1 border`}>
                              {statusConf.icon}
                              {statusConf.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {app.program} • {app.degree}
                          </p>
                          {app.submittedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs gap-1">
                            <FileText className="h-3 w-3" />
                            {docCount}/3 docs
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <Separator className="my-4" />

                            {/* Generate Buttons */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold">Generate Documents</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {GENERATE_TYPES.map(({ key, label, icon }) => {
                                  const genKey = `${app.id}-${key}`
                                  const hasContent = !!app[key]
                                  const isGenerating = generating === genKey

                                  return (
                                    <Button
                                      key={key}
                                      variant={hasContent ? 'outline' : 'default'}
                                      size="sm"
                                      className={`gap-2 justify-start h-auto py-2.5 ${
                                        hasContent
                                          ? 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                          : ''
                                      }`}
                                      disabled={isGenerating}
                                      onClick={() => handleGenerate(app, key)}
                                    >
                                      {isGenerating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : hasContent ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                      ) : (
                                        icon
                                      )}
                                      {label}
                                      {hasContent && <span className="text-[10px]">(Ready)</span>}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>

                            <Separator className="my-4" />

                            {/* Status Change */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold">Update Status</h4>
                              <div className="flex flex-wrap gap-2">
                                {STATUS_PIPELINE.map((status) => {
                                  const conf = STATUS_CONFIG[status]
                                  const isActive = app.status === status
                                  return (
                                    <Button
                                      key={status}
                                      variant={isActive ? 'default' : 'outline'}
                                      size="sm"
                                      className={`gap-1.5 text-xs ${
                                        isActive ? '' : 'hover:bg-primary/5'
                                      }`}
                                      disabled={isActive}
                                      onClick={() => handleStatusChange(app, status)}
                                    >
                                      {conf.icon}
                                      {conf.label}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Application Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Application</DialogTitle>
            <DialogDescription>Select a university and program to start your application.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">University</label>
              <Select value={selectedUniversity} onValueChange={(v) => { setSelectedUniversity(v); setSelectedProgram('') }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a university" />
                </SelectTrigger>
                <SelectContent>
                  {recommendations.map((rec) => (
                    <SelectItem key={rec.universityId} value={rec.universityName}>
                      <div className="flex items-center gap-2">
                        <School className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{rec.universityName}</span>
                        <span className="text-xs text-muted-foreground">({rec.country})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUniversity && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Program</label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrograms().map((prog) => (
                      <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleCreateApplication}
              disabled={!selectedUniversity || !selectedProgram || creating}
              className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Application
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generated Content Dialog */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generated Document
            </DialogTitle>
            <DialogDescription>AI-generated content for your application.</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="p-4 rounded-lg bg-muted/50 border border-border whitespace-pre-wrap text-sm leading-relaxed">
              {generatedContent}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => {
                navigator.clipboard.writeText(generatedContent)
                toast.success('Copied to clipboard!')
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
