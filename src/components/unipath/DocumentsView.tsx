'use client'

import { useState, useCallback, useRef } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Upload,
  FileText,
  FileCheck,
  FileClock,
  FileX,
  Loader2,
  Trash2,
  GraduationCap,
  ScrollText,
  Fingerprint,
  FileType2,
  CloudUpload,
} from 'lucide-react'

interface DocumentItem {
  id: string
  fileName: string
  type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  uploadedAt: string
  extractedData?: any
}

const DOC_TYPES = [
  { value: 'transcript', label: 'Academic Transcript', icon: <ScrollText className="h-4 w-4" /> },
  { value: 'certificate', label: 'Certificate / Diploma', icon: <FileCheck className="h-4 w-4" /> },
  { value: 'passport', label: 'Passport / ID', icon: <Fingerprint className="h-4 w-4" /> },
  { value: 'ielts', label: 'IELTS Score Report', icon: <FileText className="h-4 w-4" /> },
  { value: 'toefl', label: 'TOEFL Score Report', icon: <FileText className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <FileType2 className="h-4 w-4" /> },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', icon: <FileClock className="h-3.5 w-3.5" /> },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', icon: <FileCheck className="h-3.5 w-3.5" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300', icon: <FileX className="h-3.5 w-3.5" /> },
}

export default function DocumentsView() {
  const { savedStudentId, documents, setDocuments } = useAppStore()
  const [selectedType, setSelectedType] = useState('transcript')
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (fileName: string) => {
    if (!savedStudentId) {
      toast.error('Please complete your profile first')
      return
    }
    if (!fileName) return

    setUploading(true)
    const tempDoc: DocumentItem = {
      id: `temp-${Date.now()}`,
      fileName,
      type: selectedType,
      status: 'processing',
      uploadedAt: new Date().toISOString(),
    }

    setDocuments([...documents, tempDoc])

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: savedStudentId,
          type: selectedType,
          fileName,
        }),
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()

      // Wait a bit for the simulated processing
      setTimeout(() => {
        setDocuments(prev =>
          prev.map(d =>
            d.id === tempDoc.id
              ? { ...d, id: data.document.id, status: 'completed' as const, extractedData: 'Data extracted successfully' }
              : d
          )
        )
        toast.success(`"${fileName}" processed successfully!`)
      }, 2000)
    } catch (err: any) {
      setDocuments(prev =>
        prev.map(d =>
          d.id === tempDoc.id ? { ...d, status: 'failed' as const } : d
        )
      )
      toast.error(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }, [savedStudentId, selectedType, documents, setDocuments])

  const handleFileSelect = () => {
    // Simulate file selection — in production this would use a real file input
    const sampleNames = [
      'academic_transcript_2024.pdf',
      'ielts_score_report.pdf',
      'high_school_certificate.pdf',
      'passport_scan.pdf',
      'recommendation_letter.pdf',
    ]

    const typeIndex = DOC_TYPES.findIndex(d => d.value === selectedType)
    const sampleName = sampleNames[typeIndex] || sampleNames[0]
    handleUpload(sampleName)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect()
  }, [handleFileSelect])

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id))
    toast.success('Document removed')
  }

  const getTypeIcon = (type: string) => {
    return DOC_TYPES.find(d => d.value === type)?.icon || <FileType2 className="h-4 w-4" />
  }

  if (!savedStudentId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Upload Documents</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Complete your profile first to start uploading and processing your admission documents.
        </p>
        <Button onClick={() => useAppStore.getState().setCurrentStep('profile')} className="gap-2">
          Complete Profile First
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Document Upload
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your academic transcripts, certificates, and other documents for AI-powered extraction and verification.
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>
                      <div className="flex items-center gap-2">
                        {dt.icon}
                        {dt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={handleFileSelect}
            className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/30 hover:bg-muted/30'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
                isDragOver ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <CloudUpload className={`h-7 w-7 transition-colors ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Uploaded Documents
            {documents.length > 0 && (
              <Badge variant="secondary" className="ml-1">{documents.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {documents.map((doc) => {
                  const status = statusConfig[doc.status] || statusConfig.pending
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{doc.type.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`${status.color} text-xs gap-1 border`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                        {doc.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeDocument(doc.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supported Document Types Info */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Supported Document Types</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DOC_TYPES.map((dt) => (
              <div key={dt.value} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-primary">{dt.icon}</span>
                <span>{dt.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
