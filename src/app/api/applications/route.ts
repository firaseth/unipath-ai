import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get all applications for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId query parameter is required' },
        { status: 400 }
      )
    }

    const applications = await db.application.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(applications)
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST: Create a new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, universityId, universityName, program, degree } = body

    if (!studentId || !universityName || !program) {
      return NextResponse.json(
        { error: 'studentId, universityName, and program are required' },
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

    const application = await db.application.create({
      data: {
        studentId,
        universityId: universityId || null,
        universityName,
        program,
        degree: degree || 'Bachelor',
        status: 'draft',
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error: any) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application', details: error.message },
      { status: 500 }
    )
  }
}

// PUT: Update an application
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, outcome, submittedAt, personalStatement, motivationLetter, academicCv } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Build update data dynamically
    const updateData: any = {}

    if (status !== undefined) updateData.status = status
    if (outcome !== undefined) updateData.outcome = outcome
    if (submittedAt !== undefined) {
      updateData.submittedAt = submittedAt ? new Date(submittedAt) : null
    }
    if (personalStatement !== undefined) updateData.personalStatement = personalStatement
    if (motivationLetter !== undefined) updateData.motivationLetter = motivationLetter
    if (academicCv !== undefined) updateData.academicCv = academicCv

    // Auto-set submittedAt when status changes to 'submitted'
    if (status === 'submitted' && !submittedAt) {
      updateData.submittedAt = new Date()
    }

    const application = await db.application.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error updating application:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update application', details: error.message },
      { status: 500 }
    )
  }
}
