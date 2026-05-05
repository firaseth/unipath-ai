// University Matching Engine
// Matches student profiles against university requirements

import { normalizeGpa, haversineDistance, type NormalizedGpa } from './gpa-normalizer'

export interface StudentProfile {
  id?: string
  gpa: number
  gpaScale: number
  gradingSystem: string
  ieltsScore?: number | null
  toeflScore?: number | null
  subjects?: string[]
  certificates?: string[]
  budgetMin?: number
  budgetMax?: number
  preferredCountries?: string[]
  preferredFields?: string[]
  preferredDegree?: string
  latitude?: number | null
  longitude?: number | null
  nationality?: string
}

export interface UniversityRecord {
  id: string
  name: string
  nameAr?: string | null
  country: string
  city?: string | null
  region: string
  latitude?: number | null
  longitude?: number | null
  ranking?: number | null
  minGpa: number
  minIelts?: number | null
  minToefl?: number | null
  tuitionPerYear: number
  costOfLiving: number
  programs: string
  degreesOffered: string
  acceptanceRate: number
  visaDifficulty: number
  scholarshipAvailable: boolean
  description?: string | null
  tags: string
}

export interface MatchResult {
  universityId: string
  universityName: string
  country: string
  city: string | null
  region: string
  ranking: number | null
  matchScore: number       // 0-100 overall match
  gpaMatch: number         // 0-100 GPA compatibility
  budgetMatch: number      // 0-100 budget compatibility
  locationScore: number    // 0-100 proximity score
  languageMatch: number    // 0-100 language score
  roiScore: number         // 0-100 ROI score
  category: 'safe' | 'target' | 'reach'
  tuitionPerYear: number
  costOfLiving: number
  totalCost: number
  acceptanceRate: number
  reasons: string[]
  programs: string[]
  scholarshipAvailable: boolean
}

export function matchStudentToUniversities(
  student: StudentProfile,
  universities: UniversityRecord[]
): MatchResult[] {
  const normalized: NormalizedGpa = normalizeGpa({
    gpa: student.gpa,
    scale: student.gpaScale,
    system: student.gradingSystem,
  })

  const preferredCountries = student.preferredCountries || []
  const preferredFields = student.preferredFields || []
  const preferredDegree = student.preferredDegree || 'Bachelor'

  const results: MatchResult[] = universities.map(univ => {
    const programs: string[] = JSON.parse(univ.programs || '[]')
    const degrees: string[] = JSON.parse(univ.degreesOffered || '[]')

    // 1. GPA Match (40% weight)
    const gpaDiff = normalized.gpa4 - univ.minGpa
    const gpaMatch = Math.min(100, Math.max(0, 50 + gpaDiff * 25))

    // 2. Budget Match (20% weight)
    const totalCost = univ.tuitionPerYear + univ.costOfLiving
    const budgetMax = student.budgetMax || 50000
    const budgetMin = student.budgetMin || 0
    let budgetMatch = 100
    if (totalCost > budgetMax) {
      budgetMatch = Math.max(0, 100 - ((totalCost - budgetMax) / budgetMax) * 50)
    } else if (totalCost < budgetMin) {
      budgetMatch = 50
    }

    // 3. Language Match (15% weight)
    let languageMatch = 80 // base score
    if (student.ieltsScore && univ.minIelts) {
      languageMatch = student.ieltsScore >= univ.minIelts ? 100 : Math.max(0, 50 - (univ.minIelts - student.ieltsScore) * 20)
    } else if (student.toeflScore && univ.minToefl) {
      languageMatch = student.toeflScore >= univ.minToefl ? 100 : Math.max(0, 50 - (univ.minToefl - student.toeflScore) * 0.5)
    }

    // 4. Location/Proximity Score (10% weight)
    let locationScore = 60
    if (student.latitude && student.longitude && univ.latitude && univ.longitude) {
      const dist = haversineDistance(student.latitude, student.longitude, univ.latitude, univ.longitude)
      // Closer = better, max score for nearby countries
      if (dist < 500) locationScore = 100
      else if (dist < 1500) locationScore = 90
      else if (dist < 3000) locationScore = 75
      else if (dist < 5000) locationScore = 60
      else locationScore = 45
    }
    // Bonus for preferred countries
    if (preferredCountries.length > 0 && preferredCountries.includes(univ.country)) {
      locationScore = Math.min(100, locationScore + 15)
    }

    // 5. Field Match (10% weight)
    let fieldMatch = 60
    if (preferredFields.length > 0) {
      const fieldOverlap = preferredFields.filter(f =>
        programs.some(p => p.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(p.toLowerCase()))
      ).length
      fieldMatch = preferredFields.length > 0
        ? Math.min(100, 40 + (fieldOverlap / preferredFields.length) * 60)
        : 60
    }

    // 6. Degree Match (5% weight)
    const degreeMatch = degrees.includes(preferredDegree) ? 100 : 50

    // Weighted overall score
    const matchScore = Math.round(
      gpaMatch * 0.35 +
      budgetMatch * 0.20 +
      languageMatch * 0.15 +
      locationScore * 0.10 +
      fieldMatch * 0.10 +
      degreeMatch * 0.05 +
      (univ.acceptanceRate * 100) * 0.05
    )

    // ROI Score: quality vs cost
    const qualityProxy = univ.ranking ? Math.max(0, 100 - (univ.ranking / 10)) : 50
    const roiScore = Math.round(
      (qualityProxy * 0.4 + matchScore * 0.3 + (100 - (totalCost / 500))) * 0.3
    )

    // Categorize
    const category = categorize(normalized.gpa4, univ.minGpa, matchScore, univ.acceptanceRate)

    // Generate reasons
    const reasons = generateReasons(normalized, student, univ, matchScore, category)

    return {
      universityId: univ.id,
      universityName: univ.name,
      country: univ.country,
      city: univ.city || null,
      region: univ.region,
      ranking: univ.ranking,
      matchScore: Math.min(100, Math.max(0, matchScore)),
      gpaMatch: Math.round(gpaMatch),
      budgetMatch: Math.round(budgetMatch),
      locationScore: Math.round(locationScore),
      languageMatch: Math.round(languageMatch),
      roiScore: Math.min(100, Math.max(0, Math.round(roiScore))),
      category,
      tuitionPerYear: univ.tuitionPerYear,
      costOfLiving: univ.costOfLiving,
      totalCost,
      acceptanceRate: univ.acceptanceRate,
      reasons,
      programs,
      scholarshipAvailable: univ.scholarshipAvailable,
    }
  })

  // Sort by match score descending
  return results.sort((a, b) => b.matchScore - a.matchScore)
}

function categorize(
  gpa4: number,
  minGpa: number,
  matchScore: number,
  acceptanceRate: number
): 'safe' | 'target' | 'reach' {
  const gpaBuffer = gpa4 - minGpa

  if (gpaBuffer >= 0.5 && matchScore >= 75 && acceptanceRate >= 0.4) {
    return 'safe'
  } else if (gpaBuffer >= 0 && matchScore >= 55) {
    return 'target'
  } else {
    return 'reach'
  }
}

function generateReasons(
  normalized: NormalizedGpa,
  student: StudentProfile,
  univ: UniversityRecord,
  matchScore: number,
  category: 'safe' | 'target' | 'reach'
): string[] {
  const reasons: string[] = []

  if (normalized.gpa4 >= univ.minGpa) {
    reasons.push(`Your GPA (${normalized.gpa4}/4.0) meets the minimum requirement (${univ.minGpa}/4.0)`)
  } else {
    reasons.push(`Your GPA (${normalized.gpa4}/4.0) is below the minimum (${univ.minGpa}/4.0) - consider retaking courses`)
  }

  if (student.ieltsScore && univ.minIelts) {
    if (student.ieltsScore >= univ.minIelts) {
      reasons.push(`IELTS score ${student.ieltsScore} meets requirement of ${univ.minIelts}`)
    } else {
      reasons.push(`IELTS score needs improvement: ${student.ieltsScore} vs required ${univ.minIelts}`)
    }
  }

  const totalCost = univ.tuitionPerYear + univ.costOfLiving
  if (totalCost <= (student.budgetMax || 50000)) {
    reasons.push(`Total estimated cost ($${totalCost.toLocaleString()}/year) fits your budget`)
  } else {
    reasons.push(`Total cost ($${totalCost.toLocaleString()}/year) exceeds your budget`)
  }

  if (univ.scholarshipAvailable) {
    reasons.push('Scholarships available - can significantly reduce costs')
  }

  if (matchScore >= 75) {
    reasons.push('Strong overall match based on your profile')
  } else if (matchScore >= 55) {
    reasons.push('Moderate match - some areas may need improvement')
  }

  if (category === 'safe') {
    reasons.push('High probability of admission')
  } else if (category === 'reach') {
    reasons.push('Competitive - consider as a stretch option')
  }

  return reasons
}
