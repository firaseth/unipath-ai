// GPA Normalization Engine
// Supports multiple grading systems and converts to 4.0 scale

export type GradingSystem =
  | '4.0'        // US 4.0 scale
  | '5.0'        // Some Middle Eastern systems
  | '10.0'       // Indian, some Arab systems
  | '20.0'       // French-influenced systems (Tunisia, Morocco)
  | '100'        // Percentage scale (Iraq, Saudi Arabia)
  | 'percentage' // Explicit percentage

export interface GpaInput {
  gpa: number
  scale: number
  system: string
}

export interface NormalizedGpa {
  gpa4: number      // Normalized to 4.0 scale
  percentage: number  // Converted to percentage
  letterGrade: string // US letter grade equivalent
  classification: string // Honors classification
}

export function normalizeGpa(input: GpaInput): NormalizedGpa {
  const { gpa, scale, system } = input

  let percentage: number
  let gpa4: number

  switch (system) {
    case 'percentage':
    case '100':
      percentage = Math.min(100, Math.max(0, gpa))
      gpa4 = percentageToGpa4(percentage)
      break
    case '10.0':
      percentage = (gpa / scale) * 100
      gpa4 = percentageToGpa4(percentage)
      break
    case '20.0':
      percentage = (gpa / scale) * 100
      gpa4 = percentageToGpa4(percentage)
      break
    case '5.0':
      percentage = (gpa / scale) * 100
      gpa4 = (gpa / scale) * 4.0
      break
    case '4.0':
    default:
      gpa4 = Math.min(4.0, Math.max(0, gpa))
      percentage = gpa4ToPercentage(gpa4)
      break
  }

  return {
    gpa4: Math.round(gpa4 * 100) / 100,
    percentage: Math.round(percentage * 10) / 10,
    letterGrade: getLetterGrade(gpa4),
    classification: getClassification(gpa4),
  }
}

function percentageToGpa4(percentage: number): number {
  if (percentage >= 97) return 4.0
  if (percentage >= 93) return 3.9
  if (percentage >= 90) return 3.7
  if (percentage >= 87) return 3.5
  if (percentage >= 83) return 3.3
  if (percentage >= 80) return 3.0
  if (percentage >= 77) return 2.7
  if (percentage >= 73) return 2.3
  if (percentage >= 70) return 2.0
  if (percentage >= 67) return 1.7
  if (percentage >= 63) return 1.3
  if (percentage >= 60) return 1.0
  if (percentage >= 57) return 0.7
  if (percentage >= 53) return 0.3
  return 0.0
}

function gpa4ToPercentage(gpa4: number): number {
  // Inverse of the above table (approximate)
  if (gpa4 >= 3.9) return 97
  if (gpa4 >= 3.7) return 93
  if (gpa4 >= 3.5) return 87
  if (gpa4 >= 3.3) return 83
  if (gpa4 >= 3.0) return 80
  if (gpa4 >= 2.7) return 77
  if (gpa4 >= 2.3) return 73
  if (gpa4 >= 2.0) return 70
  if (gpa4 >= 1.7) return 67
  if (gpa4 >= 1.3) return 63
  if (gpa4 >= 1.0) return 60
  return 50
}

function getLetterGrade(gpa4: number): string {
  if (gpa4 >= 3.7) return 'A'
  if (gpa4 >= 3.3) return 'B+'
  if (gpa4 >= 3.0) return 'B'
  if (gpa4 >= 2.7) return 'B-'
  if (gpa4 >= 2.3) return 'C+'
  if (gpa4 >= 2.0) return 'C'
  if (gpa4 >= 1.7) return 'C-'
  if (gpa4 >= 1.3) return 'D+'
  if (gpa4 >= 1.0) return 'D'
  return 'F'
}

function getClassification(gpa4: number): string {
  if (gpa4 >= 3.7) return 'Excellent / First Class Honors'
  if (gpa4 >= 3.3) return 'Very Good / Upper Second'
  if (gpa4 >= 2.7) return 'Good / Lower Second'
  if (gpa4 >= 2.0) return 'Pass / Third Class'
  return 'Below Passing'
}

// Distance between two GPS points in km
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
