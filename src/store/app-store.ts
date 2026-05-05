import { create } from 'zustand'

export interface StudentProfile {
  id?: string
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  city: string
  country: string
  gpa: number
  gpaScale: number
  gradingSystem: string
  highSchoolType: string
  graduationYear: number
  subjects: string[]
  ieltsScore: number | null
  toeflScore: number | null
  budgetMin: number
  budgetMax: number
  preferredCountries: string[]
  preferredFields: string[]
  preferredDegree: string
  certificates: string[]
  normalizedGpa: number | null
  latitude?: number | null
  longitude?: number | null
}

export interface Recommendation {
  universityId: string
  universityName: string
  country: string
  city: string | null
  region: string
  ranking: number | null
  matchScore: number
  gpaMatch: number
  budgetMatch: number
  locationScore: number
  languageMatch: number
  roiScore: number
  category: 'safe' | 'target' | 'reach'
  tuitionPerYear: number
  costOfLiving: number
  totalCost: number
  acceptanceRate: number
  reasons: string[]
  programs: string[]
  scholarshipAvailable: boolean
}

export interface Application {
  id?: string
  studentId?: string
  universityId?: string
  universityName: string
  program: string
  degree: string
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted'
  personalStatement?: string
  motivationLetter?: string
  academicCv?: string
  submittedAt?: string
  outcome?: string
}

export type AppStep = 'welcome' | 'profile' | 'recommendations' | 'documents' | 'applications' | 'simulate'

interface AppState {
  currentStep: AppStep
  setCurrentStep: (step: AppStep) => void
  studentProfile: StudentProfile
  setStudentProfile: (profile: Partial<StudentProfile>) => void
  savedStudentId: string | null
  setSavedStudentId: (id: string | null) => void
  recommendations: Recommendation[]
  setRecommendations: (recs: Recommendation[]) => void
  selectedRecommendation: Recommendation | null
  setSelectedRecommendation: (rec: Recommendation | null) => void
  applications: Application[]
  setApplications: (apps: Application[]) => void
  documents: any[]
  setDocuments: (docs: any[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  simulationResults: Recommendation[]
  setSimulationResults: (results: Recommendation[]) => void
  generatedContent: { personalStatement: string; motivationLetter: string; academicCv: string }
  setGeneratedContent: (content: Partial<{ personalStatement: string; motivationLetter: string; academicCv: string }>) => void
}

const defaultProfile: StudentProfile = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  nationality: 'Iraqi',
  city: '',
  country: 'Iraq',
  gpa: 75,
  gpaScale: 100,
  gradingSystem: 'percentage',
  highSchoolType: 'Scientific',
  graduationYear: 2025,
  subjects: [],
  ieltsScore: null,
  toeflScore: null,
  budgetMin: 0,
  budgetMax: 30000,
  preferredCountries: ['Iraq', 'Germany', 'Malaysia', 'UAE'],
  preferredFields: ['Engineering', 'Computer Science', 'Medicine'],
  preferredDegree: 'Bachelor',
  certificates: [],
  normalizedGpa: null,
  latitude: 33.3152,
  longitude: 44.3661,
}

export const useAppStore = create<AppState>((set) => ({
  currentStep: 'welcome',
  setCurrentStep: (step) => set({ currentStep: step }),
  studentProfile: defaultProfile,
  setStudentProfile: (profile) =>
    set((state) => ({ studentProfile: { ...state.studentProfile, ...profile } })),
  savedStudentId: null,
  setSavedStudentId: (id) => set({ savedStudentId: id }),
  recommendations: [],
  setRecommendations: (recs) => set({ recommendations: recs }),
  selectedRecommendation: null,
  setSelectedRecommendation: (rec) => set({ selectedRecommendation: rec }),
  applications: [],
  setApplications: (apps) => set({ applications: apps }),
  documents: [],
  setDocuments: (docs) => set({ documents: docs }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  simulationResults: [],
  setSimulationResults: (results) => set({ simulationResults: results }),
  generatedContent: { personalStatement: '', motivationLetter: '', academicCv: '' },
  setGeneratedContent: (content) =>
    set((state) => ({
      generatedContent: { ...state.generatedContent, ...content },
    })),
}))
