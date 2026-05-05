'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  BookOpen,
  Heart,
  ArrowLeft,
  ArrowRight,
  Loader2,
  X,
  Check,
  Sparkles,
} from 'lucide-react'

const NATIONALITIES = ['Iraqi', 'Syrian', 'Jordanian', 'Lebanese', 'Egyptian', 'Emirati', 'Saudi', 'Kuwaiti', 'Omani', 'Qatari', 'Bahraini', 'Yemeni', 'Sudanese', 'Moroccan', 'Tunisian', 'Algerian', 'Libyan', 'Palestinian', 'Iranian', 'Turkish', 'Malaysian', 'Other']

const COUNTRIES = ['Iraq', 'Syria', 'Jordan', 'Lebanon', 'Egypt', 'UAE', 'Saudi Arabia', 'Kuwait', 'Oman', 'Qatar', 'Bahrain', 'Yemen', 'Sudan', 'Morocco', 'Tunisia', 'Algeria', 'Libya', 'Palestine', 'Iran', 'Turkey', 'Malaysia', 'Germany', 'UK', 'Canada', 'Australia', 'USA', 'India', 'Other']

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Arabic', 'Computer Science', 'History', 'Geography', 'Economics', 'Philosophy', 'Art', 'Music', 'Physical Education', 'Religious Studies', 'French', 'German', 'Turkish']

const CERTIFICATES = ['IELTS', 'TOEFL', 'SAT', 'ACT', 'AP Courses', 'IB Diploma', 'French DELF/DALF', 'German DSH/TestDaF', 'Arabic Proficiency', 'Olympiad Award', 'Volunteer Certificate', 'STEM Competition', 'None']

const FIELDS = [
  'Engineering', 'Computer Science', 'Medicine', 'Dentistry', 'Pharmacy',
  'Business Administration', 'Law', 'Architecture', 'Design', 'Arts',
  'Sciences', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Political Science', 'International Relations',
  'Journalism', 'Education', 'Psychology', 'Nursing', 'Civil Engineering',
  'Electrical Engineering', 'Mechanical Engineering', 'Information Technology',
  'Data Science', 'Artificial Intelligence', 'Cybersecurity',
]

interface FormStep {
  key: string
  title: string
  description: string
  icon: React.ReactNode
}

const FORM_STEPS: FormStep[] = [
  { key: 'personal', title: 'Personal Information', description: 'Tell us who you are', icon: <User className="h-5 w-5" /> },
  { key: 'academic', title: 'Academic Profile', description: 'Your grades and achievements', icon: <BookOpen className="h-5 w-5" /> },
  { key: 'preferences', title: 'Preferences', description: 'Where and what you want to study', icon: <Heart className="h-5 w-5" /> },
]

export default function ProfileForm() {
  const {
    studentProfile,
    setStudentProfile,
    setCurrentStep,
    setSavedStudentId,
    setIsLoading,
  } = useAppStore()

  const [formStep, setFormStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [normalizedGpaPreview, setNormalizedGpaPreview] = useState<number | null>(null)

  const stepIndex = formStep

  const updateField = (field: string, value: any) => {
    setStudentProfile({ [field]: value })
    if (field === 'gpa' || field === 'gpaScale') {
      // Simple local normalization preview
      const gpa = field === 'gpa' ? Number(value) : studentProfile.gpa
      const scale = field === 'gpaScale' ? Number(value) : studentProfile.gpaScale
      if (scale > 0) {
        const normalized = (gpa / scale) * 4.0
        setNormalizedGpaPreview(Math.min(4.0, Math.max(0, normalized)))
      }
    }
  }

  const toggleArrayItem = (field: 'subjects' | 'certificates' | 'preferredCountries' | 'preferredFields', item: string) => {
    const arr = [...(studentProfile[field] || [])]
    const idx = arr.indexOf(item)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(item)
    setStudentProfile({ [field]: arr })
  }

  const isValid = () => {
    if (stepIndex === 0) {
      return studentProfile.fullName.trim() !== '' && studentProfile.email.trim() !== ''
    }
    if (stepIndex === 1) {
      return studentProfile.gpa > 0
    }
    return true
  }

  const handleNext = () => {
    if (!isValid()) {
      toast.error('Please fill in all required fields')
      return
    }
    if (stepIndex < FORM_STEPS.length - 1) {
      setFormStep(stepIndex + 1)
    }
  }

  const handleBack = () => {
    if (stepIndex > 0) setFormStep(stepIndex - 1)
  }

  const handleSaveAndRecommend = async () => {
    if (!isValid()) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    setIsLoading(true)

    try {
      // Create student profile
      const profileRes = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentProfile),
      })

      if (!profileRes.ok) {
        throw new Error('Failed to save profile')
      }

      const student = await profileRes.json()
      setSavedStudentId(student.id)
      setStudentProfile({ normalizedGpa: student.normalizedGpa })

      toast.success('Profile saved successfully!')

      // Get recommendations
      const recRes = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id }),
      })

      if (!recRes.ok) {
        throw new Error('Failed to generate recommendations')
      }

      const recData = await recRes.json()
      const { useAppStore: _ } = await import('@/store/app-store')
      // Import store to update recommendations
      const store = useAppStore.getState()
      store.setRecommendations(recData.recommendations || [])

      toast.success(`Found ${recData.recommendations?.length || 0} matching universities!`)
      setCurrentStep('recommendations')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {FORM_STEPS.map((step, idx) => (
          <div key={step.key} className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => idx <= stepIndex && setFormStep(idx)}
              disabled={idx > stepIndex}
              className="flex items-center gap-2"
            >
              <div
                className={`flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full text-sm font-bold transition-all duration-200 ${
                  idx < stepIndex
                    ? 'bg-emerald-500 text-white'
                    : idx === stepIndex
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx < stepIndex ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span
                className={`hidden sm:block text-sm font-medium ${
                  idx <= stepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </span>
            </button>
            {idx < FORM_STEPS.length - 1 && (
              <div
                className={`hidden sm:block w-12 h-0.5 rounded-full ${
                  idx < stepIndex ? 'bg-emerald-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={formStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {stepIndex === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Tell us about yourself. Fields marked with * are required.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g., Ahmed Al-Rashid"
                      value={studentProfile.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ahmed@example.com"
                      value={studentProfile.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+964 7xx xxx xxxx"
                      value={studentProfile.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={studentProfile.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Select
                      value={studentProfile.nationality}
                      onValueChange={(v) => updateField('nationality', v)}
                    >
                      <SelectTrigger id="nationality">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {NATIONALITIES.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Baghdad"
                      value={studentProfile.city}
                      onChange={(e) => updateField('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={studentProfile.country}
                      onValueChange={(v) => updateField('country', v)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stepIndex === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Academic Profile
                </CardTitle>
                <CardDescription>Enter your academic information and achievements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA *</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 85 or 3.5"
                      value={studentProfile.gpa}
                      onChange={(e) => updateField('gpa', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpaScale">GPA Scale</Label>
                    <Select
                      value={String(studentProfile.gpaScale)}
                      onValueChange={(v) => updateField('gpaScale', parseFloat(v))}
                    >
                      <SelectTrigger id="gpaScale">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradingSystem">Grading System</Label>
                    <Select
                      value={studentProfile.gradingSystem}
                      onValueChange={(v) => updateField('gradingSystem', v)}
                    >
                      <SelectTrigger id="gradingSystem">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4.0">4.0 Point System</SelectItem>
                        <SelectItem value="5.0">5.0 Point System</SelectItem>
                        <SelectItem value="10">10 Point System</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highSchoolType">High School Type</Label>
                    <Select
                      value={studentProfile.highSchoolType}
                      onValueChange={(v) => updateField('highSchoolType', v)}
                    >
                      <SelectTrigger id="highSchoolType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scientific">Scientific</SelectItem>
                        <SelectItem value="Literary">Literary</SelectItem>
                        <SelectItem value="Applied">Applied / Vocational</SelectItem>
                        <SelectItem value="International">International (IB/A-Level)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Select
                      value={String(studentProfile.graduationYear)}
                      onValueChange={(v) => updateField('graduationYear', parseInt(v))}
                    >
                      <SelectTrigger id="graduationYear">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* GPA Normalization Preview */}
                {normalizedGpaPreview !== null && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Normalized GPA</span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Your GPA normalizes to <span className="font-bold text-base">{normalizedGpaPreview.toFixed(2)}</span> / 4.0 scale
                    </p>
                  </div>
                )}

                <Separator />

                {/* Subjects */}
                <div className="space-y-3">
                  <Label>Subjects Studied</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((subject) => {
                      const isSelected = studentProfile.subjects.includes(subject)
                      return (
                        <Badge
                          key={subject}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'hover:bg-primary/10 hover:border-primary/30'
                          }`}
                          onClick={() => toggleArrayItem('subjects', subject)}
                        >
                          {subject}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Certificates */}
                <div className="space-y-3">
                  <Label>Certificates & Test Scores</Label>
                  <div className="flex flex-wrap gap-2">
                    {CERTIFICATES.map((cert) => {
                      const isSelected = studentProfile.certificates.includes(cert)
                      return (
                        <Badge
                          key={cert}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'hover:bg-primary/10 hover:border-primary/30'
                          }`}
                          onClick={() => toggleArrayItem('certificates', cert)}
                        >
                          {cert}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stepIndex === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Preferences
                </CardTitle>
                <CardDescription>Tell us what and where you&apos;d like to study.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Annual Budget (USD)</Label>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget Range</span>
                    <span className="font-bold text-primary">
                      ${studentProfile.budgetMin.toLocaleString()} — ${studentProfile.budgetMax.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100000}
                    step={1000}
                    value={[studentProfile.budgetMin, studentProfile.budgetMax]}
                    onValueChange={([min, max]) => {
                      setStudentProfile({ budgetMin: min, budgetMax: max })
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$25,000</span>
                    <span>$50,000</span>
                    <span>$75,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                <Separator />

                {/* Preferred Degree */}
                <div className="space-y-2">
                  <Label>Preferred Degree</Label>
                  <Select
                    value={studentProfile.preferredDegree}
                    onValueChange={(v) => updateField('preferredDegree', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelor">Bachelor&apos;s Degree</SelectItem>
                      <SelectItem value="Master">Master&apos;s Degree</SelectItem>
                      <SelectItem value="PhD">PhD / Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Preferred Countries */}
                <div className="space-y-3">
                  <Label>Preferred Countries</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COUNTRIES.map((country) => {
                      const isChecked = studentProfile.preferredCountries.includes(country)
                      return (
                        <label
                          key={country}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                            isChecked
                              ? 'bg-primary/10 border-primary/30 text-primary'
                              : 'border-border hover:border-primary/20 hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleArrayItem('preferredCountries', country)}
                          />
                          <span className="truncate">{country}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Preferred Fields */}
                <div className="space-y-3">
                  <Label>Preferred Fields of Study</Label>
                  <div className="flex flex-wrap gap-2">
                    {FIELDS.map((field) => {
                      const isSelected = studentProfile.preferredFields.includes(field)
                      return (
                        <Badge
                          key={field}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'hover:bg-primary/10 hover:border-primary/30'
                          }`}
                          onClick={() => toggleArrayItem('preferredFields', field)}
                        >
                          {field}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Language Scores */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Language Test Scores (Optional)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ielts">IELTS Score</Label>
                      <Input
                        id="ielts"
                        type="number"
                        step="0.5"
                        min="0"
                        max="9"
                        placeholder="e.g., 6.5"
                        value={studentProfile.ieltsScore ?? ''}
                        onChange={(e) => updateField('ieltsScore', e.target.value ? parseFloat(e.target.value) : null)}
                      />
                      <p className="text-xs text-muted-foreground">Scale: 0.0 - 9.0</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toefl">TOEFL Score</Label>
                      <Input
                        id="toefl"
                        type="number"
                        step="1"
                        min="0"
                        max="120"
                        placeholder="e.g., 85"
                        value={studentProfile.toeflScore ?? ''}
                        onChange={(e) => updateField('toeflScore', e.target.value ? parseInt(e.target.value) : null)}
                      />
                      <p className="text-xs text-muted-foreground">Scale: 0 - 120</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Step {stepIndex + 1} of {FORM_STEPS.length}
          </span>
        </div>

        {stepIndex < FORM_STEPS.length - 1 ? (
          <Button onClick={handleNext} className="gap-2">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSaveAndRecommend}
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Save & Get Recommendations
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
