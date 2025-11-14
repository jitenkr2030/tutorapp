import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const tutorId = searchParams.get('tutorId')

    // Build query based on user role and provided parameters
    let whereClause: any = {}
    
    if (session.user.role === 'student') {
      whereClause.studentId = session.user.id
    } else if (session.user.role === 'tutor') {
      whereClause.tutorId = session.user.id
    } else if (session.user.role === 'admin') {
      // Admin can see all plans or filter by student/tutor
      if (studentId) whereClause.studentId = studentId
      if (tutorId) whereClause.tutorId = tutorId
    }

    const learningPlans = await db.learningPlan.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        goals: {
          include: {
            milestones: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(learningPlans)
  } catch (error) {
    console.error('Error fetching learning plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, subject, studentId, tutorId, goals } = body

    // Validate required fields
    if (!title || !subject || !studentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check permissions
    if (session.user.role === 'student' && session.user.id !== studentId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (session.user.role === 'tutor' && session.user.id !== tutorId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create learning plan
    const learningPlan = await db.learningPlan.create({
      data: {
        title,
        description,
        subject,
        studentId,
        tutorId: tutorId || null,
        goals: {
          create: goals?.map((goal: any) => ({
            title: goal.title,
            description: goal.description,
            subject: goal.subject,
            targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
            priority: goal.priority,
            status: goal.status,
            progress: goal.progress,
            milestones: {
              create: goal.milestones?.map((milestone: any) => ({
                title: milestone.title,
                description: milestone.description,
                targetDate: milestone.targetDate ? new Date(milestone.targetDate) : null,
                completed: milestone.completed,
                resources: milestone.resources || []
              })) || []
            }
          })) || []
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        goals: {
          include: {
            milestones: true
          }
        }
      }
    })

    return NextResponse.json(learningPlan)
  } catch (error) {
    console.error('Error creating learning plan:', error)
    return NextResponse.json(
      { error: 'Failed to create learning plan' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, subject, studentId, tutorId, goals } = body

    if (!id) {
      return NextResponse.json({ error: 'Learning plan ID is required' }, { status: 400 })
    }

    // Check if the plan exists and user has access
    const existingPlan = await db.learningPlan.findUnique({
      where: { id },
      include: {
        goals: {
          include: {
            milestones: true
          }
        }
      }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Learning plan not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === 'student' && existingPlan.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (session.user.role === 'tutor' && existingPlan.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update learning plan
    const updatedPlan = await db.learningPlan.update({
      where: { id },
      data: {
        title: title || existingPlan.title,
        description: description || existingPlan.description,
        subject: subject || existingPlan.subject,
        tutorId: tutorId || existingPlan.tutorId,
        goals: goals ? {
          // Delete existing goals and create new ones
          deleteMany: {},
          create: goals.map((goal: any) => ({
            title: goal.title,
            description: goal.description,
            subject: goal.subject,
            targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
            priority: goal.priority,
            status: goal.status,
            progress: goal.progress,
            milestones: {
              create: goal.milestones?.map((milestone: any) => ({
                title: milestone.title,
                description: milestone.description,
                targetDate: milestone.targetDate ? new Date(milestone.targetDate) : null,
                completed: milestone.completed,
                resources: milestone.resources || []
              })) || []
            }
          }))
        } : undefined
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        goals: {
          include: {
            milestones: true
          }
        }
      }
    })

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error('Error updating learning plan:', error)
    return NextResponse.json(
      { error: 'Failed to update learning plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('id')

    if (!planId) {
      return NextResponse.json({ error: 'Learning plan ID is required' }, { status: 400 })
    }

    // Check if the plan exists and user has access
    const existingPlan = await db.learningPlan.findUnique({
      where: { id: planId }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Learning plan not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === 'student' && existingPlan.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (session.user.role === 'tutor' && existingPlan.tutorId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete learning plan (cascade will handle goals and milestones)
    await db.learningPlan.delete({
      where: { id: planId }
    })

    return NextResponse.json({ message: 'Learning plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting learning plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete learning plan' },
      { status: 500 }
    )
  }
}