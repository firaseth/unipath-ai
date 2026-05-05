import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { matchStudentToUniversities } from '@/lib/matching-engine'

// GET: Get recommendations for a student
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

    const recommendations = await db.recommendation.findMany({
      where: { studentId },
      orderBy: { matchScore: 'desc' },
    })

    return NextResponse.json(recommendations)
  } catch (error: any) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

// POST: Generate recommendations for a student
export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json()

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      )
    }

    // Fetch student profile
    const student = await db.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Fetch all universities
    const universities = await db.university.findMany()

    // Build student profile for matching engine
    const studentProfile = {
      id: student.id,
      gpa: student.gpa,
      gpaScale: student.gpaScale,
      gradingSystem: student.gradingSystem,
      ieltsScore: student.ieltsScore,
      toeflScore: student.toeflScore,
      subjects: JSON.parse(student.subjects || '[]'),
      certificates: JSON.parse(student.certificates || '[]'),
      budgetMin: student.budgetMin,
      budgetMax: student.budgetMax,
      preferredCountries: JSON.parse(student.preferredCountries || '[]'),
      preferredFields: JSON.parse(student.preferredFields || '[]'),
      preferredDegree: student.preferredDegree,
      latitude: student.latitude,
      longitude: student.longitude,
      nationality: student.nationality,
    }

    // Run matching
    const results = matchStudentToUniversities(studentProfile, universities)

    // Delete existing recommendations for this student
    await db.recommendation.deleteMany({
      where: { studentId },
    })

    // Save top 30 results
    const topResults = results.slice(0, 30)
    const savedRecommendations = await db.recommendation.createMany({
      data: topResults.map((result) => ({
        studentId,
        universityId: result.universityId,
        universityName: result.universityName,
        country: result.country,
        matchScore: result.matchScore,
        category: result.category,
        roiScore: result.roiScore,
        reasons: JSON.stringify(result.reasons),
      })),
    })

    // Fetch and return saved recommendations sorted by matchScore
    const recommendations = await db.recommendation.findMany({
      where: { studentId },
      orderBy: { matchScore: 'desc' },
    })

    return NextResponse.json({
      message: `Generated ${savedRecommendations.count} recommendations`,
      recommendations: topResults, // Return full match results with all score breakdowns
    })
  } catch (error: any) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error.message },
      { status: 500 }
    )
  }
}
