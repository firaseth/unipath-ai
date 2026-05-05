import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { seedUniversities } from '@/lib/university-data'
import { Prisma } from '@prisma/client'

// GET: Return all universities with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Seed action
    const action = searchParams.get('action')
    if (action === 'seed') {
      await seedUniversities()
      const count = await db.university.count()
      return NextResponse.json({
        message: 'Universities seeded successfully',
        totalUniversities: count,
      })
    }

    // Build filter conditions
    const where: Prisma.UniversityWhereInput = {}

    const country = searchParams.get('country')
    if (country) {
      where.country = country
    }

    const region = searchParams.get('region')
    if (region) {
      where.region = region
    }

    const minRanking = searchParams.get('minRanking')
    if (minRanking) {
      where.ranking = {
        lte: Number(minRanking),
      }
    }

    const maxTuition = searchParams.get('maxTuition')
    if (maxTuition) {
      where.tuitionPerYear = {
        lte: Number(maxTuition),
      }
    }

    const program = searchParams.get('program')
    if (program) {
      where.programs = {
        contains: program,
      }
    }

    // Pagination
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50))
    const skip = (page - 1) * limit

    const [universities, total] = await Promise.all([
      db.university.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ranking: 'asc' },
      }),
      db.university.count({ where }),
    ])

    return NextResponse.json({
      data: universities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching universities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch universities', details: error.message },
      { status: 500 }
    )
  }
}
