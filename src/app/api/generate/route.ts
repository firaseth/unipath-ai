import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

const VALID_TYPES = ['personal_statement', 'motivation_letter', 'academic_cv'] as const

function buildSystemPrompt(
  type: string,
  universityName: string,
  program: string,
  degree: string,
  profile: any
): string {
  const profileText = `
Full Name: ${profile.fullName}
Nationality: ${profile.nationality}
GPA: ${profile.gpa}/${profile.gpaScale} (${profile.gradingSystem} grading system, normalized: ${profile.normalizedGpa || 'N/A'}/4.0)
High School: ${profile.highSchoolType || 'N/A'}
Graduation Year: ${profile.graduationYear || 'N/A'}
Subjects: ${profile.subjects || 'N/A'}
IELTS Score: ${profile.ieltsScore || 'Not provided'}
TOEFL Score: ${profile.toeflScore || 'Not provided'}
Certificates: ${profile.certificates || 'None'}
Preferred Fields: ${profile.preferredFields || 'N/A'}
City/Country: ${profile.city || 'N/A'}, ${profile.country || 'N/A'}
  `.trim()

  switch (type) {
    case 'personal_statement':
      return `You are an expert university admissions consultant. Write a compelling personal statement for a student applying to ${universityName} for ${program} (${degree}). The student's profile:\n${profileText}\n\nThe statement should be professional, genuine, and highlight academic achievements, extracurricular activities, and career goals. Write in English. Output the statement only, no title needed. Around 500-600 words.`

    case 'motivation_letter':
      return `You are an expert university admissions consultant. Write a persuasive motivation letter for a student applying to ${universityName} for ${program} (${degree}). The student's profile:\n${profileText}\n\nThe letter should explain why the student is motivated to study this program at this specific university, connecting their background and aspirations to the program's offerings. Write in English. Output the letter only, no title needed. Around 300-400 words.`

    case 'academic_cv':
      return `Generate a structured academic CV in HTML format for a student. Include sections: Personal Information, Education, Academic Achievements, Skills, Languages, and Career Objectives. Student profile:\n${profileText}\n\nUse clean, professional HTML with appropriate headings and styling. Around 400-500 words equivalent.`

    default:
      throw new Error(`Unknown document type: ${type}`)
  }
}

// POST: Generate AI content for application documents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, universityId, universityName, program, degree, type } = body

    // Validate required fields
    if (!studentId || !universityName || !program || !degree || !type) {
      return NextResponse.json(
        { error: 'studentId, universityName, program, degree, and type are required' },
        { status: 400 }
      )
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
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

    // Build the system prompt
    const systemPrompt = buildSystemPrompt(
      type,
      universityName,
      program,
      degree,
      student
    )

    // Generate content using z-ai-web-dev-sdk
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Please generate the ${type.replace(/_/g, ' ')} now.`,
        },
      ],
    })

    const generatedText =
      completion?.choices?.[0]?.message?.content ||
      (typeof completion === 'string' ? completion : JSON.stringify(completion))

    return NextResponse.json({
      type,
      studentId,
      universityId: universityId || null,
      universityName,
      program,
      degree,
      content: generatedText,
    })
  } catch (error: any) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content', details: error.message },
      { status: 500 }
    )
  }
}
