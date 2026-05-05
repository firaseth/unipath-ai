import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { matchStudentToUniversities } from '@/lib/matching-engine'
import { normalizeGpa } from '@/lib/gpa-normalizer'

// POST: Simulate matching with a virtual student profile (what-if scenario)
// This does NOT save anything to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Build student profile from request body
    const studentProfile = {
      gpa: Number(body.gpa) || 3.0,
      gpaScale: Number(body.gpaScale) || 4.0,
      gradingSystem: body.gradingSystem || '4.0',
      ieltsScore: body.ieltsScore != null ? Number(body.ieltsScore) : null,
      toeflScore: body.toeflScore != null ? Number(body.toeflScore) : null,
      subjects: typeof body.subjects === 'string' ? JSON.parse(body.subjects) : (body.subjects || []),
      certificates: typeof body.certificates === 'string' ? JSON.parse(body.certificates) : (body.certificates || []),
      budgetMin: Number(body.budgetMin) || 0,
      budgetMax: Number(body.budgetMax) || 50000,
      preferredCountries: typeof body.preferredCountries === 'string'
        ? JSON.parse(body.preferredCountries)
        : (body.preferredCountries || []),
      preferredFields: typeof body.preferredFields === 'string'
        ? JSON.parse(body.preferredFields)
        : (body.preferredFields || []),
      preferredDegree: body.preferredDegree || 'Bachelor',
      nationality: body.nationality || 'Iraqi',
      latitude: body.latitude || null,
      longitude: body.longitude || null,
    }

    // Apply optional overrides
    const overrides = body.overrides || {}
    if (overrides.gpa) {
      studentProfile.gpa = Number(overrides.gpa)
    }
    if (overrides.budgetMax) {
      studentProfile.budgetMax = Number(overrides.budgetMax)
    }
    if (overrides.preferredCountries) {
      studentProfile.preferredCountries = typeof overrides.preferredCountries === 'string'
        ? JSON.parse(overrides.preferredCountries)
        : overrides.preferredCountries
    }
    if (overrides.ieltsScore) {
      studentProfile.ieltsScore = Number(overrides.ieltsScore)
    }
    if (overrides.toeflScore) {
      studentProfile.toeflScore = Number(overrides.toeflScore)
    }
    if (overrides.preferredFields) {
      studentProfile.preferredFields = typeof overrides.preferredFields === 'string'
        ? JSON.parse(overrides.preferredFields)
        : overrides.preferredFields
    }
    if (overrides.preferredDegree) {
      studentProfile.preferredDegree = overrides.preferredDegree
    }

    // Normalize GPA for reference
    const normalized = normalizeGpa({
      gpa: studentProfile.gpa,
      scale: studentProfile.gpaScale,
      system: studentProfile.gradingSystem,
    })

    // Fetch all universities
    const universities = await db.university.findMany()

    // Run matching
    const results = matchStudentToUniversities(studentProfile, universities)

    return NextResponse.json({
      profile: {
        ...studentProfile,
        normalizedGpa: normalized.gpa4,
        letterGrade: normalized.letterGrade,
        classification: normalized.classification,
      },
      results,
      totalResults: results.length,
    })
  } catch (error: any) {
    console.error('Error simulating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to simulate recommendations', details: error.message },
      { status: 500 }
    )
  }
}
