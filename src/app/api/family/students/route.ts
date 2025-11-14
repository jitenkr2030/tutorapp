import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parent = await db.parent.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    return NextResponse.json({ students: parent.students });

  } catch (error) {
    console.error('Error fetching family students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, dateOfBirth, grade, school, bio, location } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const parent = await db.parent.findUnique({
      where: { userId: session.user.id }
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Create user for student
    const studentUser = await db.user.create({
      data: {
        name,
        email,
        role: 'STUDENT'
      }
    });

    // Create student profile
    const student = await db.student.create({
      data: {
        userId: studentUser.id,
        parentId: parent.id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        grade,
        school,
        bio,
        location
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({ student });

  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}