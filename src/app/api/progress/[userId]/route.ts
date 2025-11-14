import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const userType = searchParams.get('type') || 'student'

    // Check if user has access to this progress data
    if (session.user.id !== params.userId && session.user.role !== 'admin') {
      // For tutors, they can only see their own progress
      // For students, they can only see their own progress
      // For admins, they can see anyone's progress
      if (session.user.role === 'tutor' || session.user.role === 'student') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get basic progress data
    const sessions = await db.session.findMany({
      where: {
        OR: [
          { tutorId: params.userId },
          { studentId: params.userId }
        ],
        status: 'COMPLETED'
      },
      include: {
        reviews: true,
        subject: true
      }
    })

    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length
    
    // Calculate total hours (assuming 60 minutes per session as default)
    const totalHours = sessions.reduce((total, session) => total + (session.duration || 60), 0)
    
    // Calculate average rating
    const ratings = sessions.flatMap(s => s.reviews.map(r => r.rating))
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0

    // Get subject progress
    const subjectProgress = await getSubjectProgress(params.userId, sessions)
    
    // Get monthly progress
    const monthlyProgress = await getMonthlyProgress(params.userId, period, sessions)
    
    // Get skills progress
    const skillsProgress = await getSkillsProgress(params.userId)
    
    // Get achievements
    const achievements = await getAchievements(params.userId, sessions)

    const progressData = {
      totalSessions,
      completedSessions,
      totalHours,
      averageRating,
      subjects: subjectProgress,
      monthlyProgress,
      skills: skillsProgress,
      achievements
    }

    return NextResponse.json(progressData)
  } catch (error) {
    console.error('Error fetching progress data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    )
  }
}

async function getSubjectProgress(userId: string, sessions: any[]) {
  const subjectMap = new Map()
  
  sessions.forEach(session => {
    const subjectName = session.subject?.name || 'Unknown'
    const isTutor = session.tutorId === userId
    
    if (!subjectMap.has(subjectName)) {
      subjectMap.set(subjectName, {
        subject: subjectName,
        sessions: 0,
        hours: 0,
        progress: 0,
        rating: 0,
        ratings: []
      })
    }
    
    const subject = subjectMap.get(subjectName)
    subject.sessions += 1
    subject.hours += session.duration || 60
    
    // Add ratings
    session.reviews.forEach((review: any) => {
      if ((isTutor && review.revieweeId === userId) || (!isTutor && review.reviewerId === userId)) {
        subject.ratings.push(review.rating)
      }
    })
  })
  
  // Calculate averages and progress
  const result = Array.from(subjectMap.values()).map(subject => {
    const avgRating = subject.ratings.length > 0 
      ? subject.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / subject.ratings.length 
      : 0
    
    // Simple progress calculation based on sessions and hours
    const progress = Math.min(100, (subject.sessions * 10) + (subject.hours / 60 * 5))
    
    return {
      ...subject,
      progress: Math.round(progress),
      rating: avgRating
    }
  })
  
  return result
}

async function getMonthlyProgress(userId: string, period: string, sessions: any[]) {
  const now = new Date()
  const months = []
  let monthCount = period === 'week' ? 4 : period === 'month' ? 12 : 12
  
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const monthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.scheduledAt)
      return sessionDate >= monthStart && sessionDate <= monthEnd
    })
    
    const monthHours = monthSessions.reduce((total, session) => total + (session.duration || 60), 0)
    const monthProgress = Math.min(100, (monthSessions.length * 15) + (monthHours / 60 * 3))
    
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      sessions: monthSessions.length,
      hours: monthHours,
      progress: Math.round(monthProgress)
    })
  }
  
  return months
}

async function getSkillsProgress(userId: string) {
  // This would typically come from a skills assessment system
  // For now, we'll return mock data based on sessions completed
  const skills = [
    { skill: 'Problem Solving', level: 1, progress: 65 },
    { skill: 'Communication', level: 2, progress: 78 },
    { skill: 'Critical Thinking', level: 1, progress: 45 },
    { skill: 'Creativity', level: 1, progress: 52 },
    { skill: 'Technical Knowledge', level: 2, progress: 83 },
    { skill: 'Time Management', level: 1, progress: 70 }
  ]
  
  return skills.map(skill => ({
    ...skill,
    lastAssessed: new Date().toISOString()
  }))
}

async function getAchievements(userId: string, sessions: any[]) {
  const totalSessions = sessions.length
  const totalHours = sessions.reduce((total, session) => total + (session.duration || 60), 0)
  const ratings = sessions.flatMap(s => s.reviews.map(r => r.rating))
  const avgRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
  
  const achievements = [
    {
      id: 'first-session',
      title: 'First Session',
      description: 'Complete your first tutoring session',
      icon: '🎯',
      unlocked: totalSessions >= 1
    },
    {
      id: 'five-sessions',
      title: 'Getting Started',
      description: 'Complete 5 tutoring sessions',
      icon: '📚',
      unlocked: totalSessions >= 5
    },
    {
      id: 'ten-sessions',
      title: 'Dedicated Learner',
      description: 'Complete 10 tutoring sessions',
      icon: '🏆',
      unlocked: totalSessions >= 10
    },
    {
      id: 'twenty-five-sessions',
      title: 'Expert Learner',
      description: 'Complete 25 tutoring sessions',
      icon: '🌟',
      unlocked: totalSessions >= 25
    },
    {
      id: 'fifty-hours',
      title: 'Time Master',
      description: 'Accumulate 50 hours of learning',
      icon: '⏰',
      unlocked: totalHours >= 3000 // 50 hours in minutes
    },
    {
      id: 'hundred-hours',
      title: 'Knowledge Seeker',
      description: 'Accumulate 100 hours of learning',
      icon: '🎓',
      unlocked: totalHours >= 6000 // 100 hours in minutes
    },
    {
      id: 'five-star',
      title: 'Excellent Tutor',
      description: 'Achieve an average rating of 5.0',
      icon: '⭐',
      unlocked: avgRating >= 5.0
    },
    {
      id: 'four-star',
      title: 'Great Tutor',
      description: 'Achieve an average rating of 4.0 or higher',
      icon: '🌟',
      unlocked: avgRating >= 4.0
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Complete a session before 9 AM',
      icon: '🌅',
      unlocked: sessions.some(s => new Date(s.scheduledAt).getHours() < 9)
    },
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Complete a session after 8 PM',
      icon: '🌙',
      unlocked: sessions.some(s => new Date(s.scheduledAt).getHours() >= 20)
    }
  ]
  
  return achievements.map(achievement => ({
    ...achievement,
    unlockedAt: achievement.unlocked ? new Date().toISOString() : undefined
  }))
}