import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, preferences, subject, level, budget, availability } = await request.json();

    // Get student profile
    const student = await db.user.findUnique({
      where: { id: studentId || session.user.id },
      include: {
        studentProfile: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get available tutors
    const tutors = await db.tutor.findMany({
      where: {
        status: 'APPROVED',
        subjects: {
          some: {
            subject: {
              name: {
                contains: subject || '',
                mode: 'insensitive'
              }
            }
          }
        }
      },
      include: {
        user: true,
        subjects: {
          include: {
            subject: true
          }
        },
        qualifications: true,
        availability: true
      }
    });

    if (tutors.length === 0) {
      return NextResponse.json({ error: 'No tutors found matching criteria' }, { status: 404 });
    }

    // Prepare data for AI matching
    const matchingData = {
      student: {
        id: student.id,
        name: student.name,
        grade: student.studentProfile?.grade,
        school: student.studentProfile?.school,
        location: student.studentProfile?.location,
        preferences: preferences || {}
      },
      requirements: {
        subject,
        level,
        budget,
        availability
      },
      availableTutors: tutors.map(tutor => ({
        id: tutor.id,
        name: tutor.user.name,
        hourlyRate: tutor.hourlyRate,
        experience: tutor.experience,
        subjects: tutor.subjects.map(s => s.subject.name),
        qualifications: tutor.qualifications.map(q => ({ title: q.title, institution: q.institution })),
        availability: tutor.availability,
        rating: tutor.user.tutorReviews.length > 0 
          ? tutor.user.tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutor.user.tutorReviews.length 
          : 0,
        totalSessions: tutor.user.tutorSessions.length
      }))
    };

    // Use AI for smart matching
    const zai = await ZAI.create();
    
    const prompt = `
    You are an expert educational consultant specializing in tutor-student matching. 
    Analyze the following student profile and available tutors to provide the best matches.
    
    Student Profile:
    ${JSON.stringify(matchingData.student, null, 2)}
    
    Requirements:
    ${JSON.stringify(matchingData.requirements, null, 2)}
    
    Available Tutors:
    ${JSON.stringify(matchingData.availableTutors, null, 2)}
    
    Please provide:
    1. Top 3 tutor recommendations with detailed reasoning
    2. Match scores (0-100) for each recommended tutor
    3. Key factors considered in the matching
    4. Additional recommendations for the student
    
    Format your response as JSON with the following structure:
    {
      "recommendations": [
        {
          "tutorId": "tutor_id",
          "matchScore": 95,
          "reasoning": "Detailed explanation of why this tutor is a good match",
          "strengths": ["strength1", "strength2"],
          "considerations": ["consideration1"]
        }
      ],
      "matchingFactors": [
        "Subject expertise alignment",
        "Teaching experience level",
        "Budget compatibility"
      ],
      "additionalRecommendations": [
        "Consider trial sessions",
        "Check availability alignment"
      ]
    }
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational consultant specializing in tutor-student matching.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    let aiResponse;
    try {
      aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      aiResponse = {
        recommendations: [],
        matchingFactors: [],
        additionalRecommendations: []
      };
    }

    // Store matching result in database
    const matchingResult = await db.aIMatching.create({
      data: {
        studentId: student.id,
        type: 'TUTOR_MATCHING',
        input: JSON.stringify(matchingData),
        result: JSON.stringify(aiResponse),
        confidence: calculateOverallConfidence(aiResponse.recommendations)
      }
    });

    // Enhance recommendations with full tutor data
    const enhancedRecommendations = aiResponse.recommendations.map((rec: any) => {
      const tutor = tutors.find(t => t.id === rec.tutorId);
      return {
        ...rec,
        tutor: tutor ? {
          id: tutor.id,
          name: tutor.user.name,
          hourlyRate: tutor.hourlyRate,
          experience: tutor.experience,
          subjects: tutor.subjects.map(s => s.subject.name),
          qualifications: tutor.qualifications,
          rating: tutor.user.tutorReviews.length > 0 
            ? tutor.user.tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutor.user.tutorReviews.length 
            : 0,
          totalSessions: tutor.user.tutorSessions.length,
          availability: tutor.availability
        } : null
      };
    });

    return NextResponse.json({
      matchingId: matchingResult.id,
      recommendations: enhancedRecommendations,
      matchingFactors: aiResponse.matchingFactors,
      additionalRecommendations: aiResponse.additionalRecommendations,
      totalTutorsConsidered: tutors.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI matching error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI matching' },
      { status: 500 }
    );
  }
}

function calculateOverallConfidence(recommendations: any[]): number {
  if (recommendations.length === 0) return 0;
  
  const avgScore = recommendations.reduce((sum, rec) => sum + (rec.matchScore || 0), 0) / recommendations.length;
  return Math.min(avgScore, 100);
}