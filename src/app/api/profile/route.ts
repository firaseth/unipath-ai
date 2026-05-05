import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { normalizeGpa } from '@/lib/gpa-normalizer'

// GET: Return all student profiles
export async function GET() {
  try {
    const students = await db.student.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(students)
  } catch (error: any) {
    console.error('Error fetching student profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student profiles' },
      { status: 500 }
    )
  }
}

// POST: Create a new student profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      nationality,
      city,
      country,
      gpa,
      gpaScale,
      gradingSystem,
      highSchoolType,
      graduationYear,
      subjects,
      ieltsScore,
      toeflScore,
      budgetMin,
      budgetMax,
      preferredCountries,
      preferredFields,
      preferredDegree,
      certificates,
    } = body

    if (!fullName) {
      return NextResponse.json(
        { error: 'fullName is required' },
        { status: 400 }
      )
    }

    // Normalize GPA
    const normalized = normalizeGpa({
      gpa: Number(gpa),
      scale: Number(gpaScale) || 4.0,
      system: gradingSystem || '4.0',
    })

    const student = await db.student.create({
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        nationality: nationality || 'Iraqi',
        city: city || null,
        country: country || 'Iraq',
        gpa: Number(gpa),
        gpaScale: Number(gpaScale) || 4.0,
        gradingSystem: gradingSystem || '4.0',
        normalizedGpa: normalized.gpa4,
        highSchoolType: highSchoolType || null,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        subjects: typeof subjects === 'string' ? subjects : JSON.stringify(subjects || []),
        ieltsScore: ieltsScore != null ? Number(ieltsScore) : null,
        toeflScore: toeflScore != null ? Number(toeflScore) : null,
        budgetMin: Number(budgetMin) || 0,
        budgetMax: Number(budgetMax) || 50000,
        preferredCountries: typeof preferredCountries === 'string' ? preferredCountries : JSON.stringify(preferredCountries || []),
        preferredFields: typeof preferredFields === 'string' ? preferredFields : JSON.stringify(preferredFields || []),
        preferredDegree: preferredDegree || 'Bachelor',
        certificates: typeof certificates === 'string' ? certificates : JSON.stringify(certificates || []),
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    console.error('Error creating student profile:', error)
    return NextResponse.json(
      { error: 'Failed to create student profile', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE: Delete a student by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      )
    }

    await db.student.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting student:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}
