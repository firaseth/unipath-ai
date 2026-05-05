import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST: Mock document processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, type, fileName } = body

    if (!studentId || !type || !fileName) {
      return NextResponse.json(
        { error: 'studentId, type, and fileName are required' },
        { status: 400 }
      )
    }

    // Verify student exists
    const student = await db.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Create document record with "processing" status
    const document = await db.document.create({
      data: {
        studentId,
        type: type || 'transcript',
        fileName,
        status: 'processing',
      },
    })

    // Simulate async processing with a short delay
    setTimeout(async () => {
      try {
        // Generate mock extracted data based on document type
        let mockData: Record<string, any>

        switch (type) {
          case 'transcript':
            mockData = {
              extractedGpa: student.gpa,
              extractedScale: student.gpaScale,
              subjects: JSON.parse(student.subjects || '[]'),
              graduationYear: student.graduationYear,
              institution: `${student.highSchoolType || 'High School'}, ${student.city || student.country}`,
              extractionConfidence: 0.92,
            }
            break
          case 'ielts':
            mockData = {
              overallScore: student.ieltsScore || 6.0,
              reading: (student.ieltsScore || 6.0) - 0.5,
              writing: (student.ieltsScore || 6.0) - 0.3,
              listening: (student.ieltsScore || 6.0) + 0.2,
              speaking: (student.ieltsScore || 6.0) - 0.1,
              testDate: '2024-03-15',
              extractionConfidence: 0.88,
            }
            break
          case 'toefl':
            mockData = {
              totalScore: student.toeflScore || 80,
              reading: Math.round((student.toeflScore || 80) * 0.25),
              writing: Math.round((student.toeflScore || 80) * 0.25),
              listening: Math.round((student.toeflScore || 80) * 0.27),
              speaking: Math.round((student.toeflScore || 80) * 0.23),
              testDate: '2024-02-20',
              extractionConfidence: 0.85,
            }
            break
          case 'certificate':
            mockData = {
              certificateName: 'Certificate of Achievement',
              issuingBody: 'Educational Authority',
              dateIssued: '2024-01-10',
              extractionConfidence: 0.78,
            }
            break
          default:
            mockData = {
              documentType: type,
              pagesScanned: 2,
              textExtracted: true,
              extractionConfidence: 0.80,
            }
        }

        await db.document.update({
          where: { id: document.id },
          data: {
            status: 'completed',
            extractedData: JSON.stringify(mockData),
          },
        })
      } catch (updateError) {
        console.error('Error updating document status:', updateError)
        await db.document.update({
          where: { id: document.id },
          data: {
            status: 'failed',
            extractedData: JSON.stringify({ error: 'Processing failed' }),
          },
        })
      }
    }, 1500) // 1.5 second simulated delay

    return NextResponse.json(
      {
        document,
        message: 'Document uploaded and processing started',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error processing document:', error)
    return NextResponse.json(
      { error: 'Failed to process document', details: error.message },
      { status: 500 }
    )
  }
}
