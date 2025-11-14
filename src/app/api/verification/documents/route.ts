import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a tutor
    const tutor = await db.tutor.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    });

    if (!tutor) {
      return NextResponse.json({ error: 'Only tutors can upload verification documents' }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const documentType = data.get('type') as string;
    const description = data.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed' 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Create verification directory if it doesn't exist
    const verificationDir = path.join(process.cwd(), 'verification-docs');
    try {
      await writeFile(path.join(verificationDir, '.gitkeep'), '');
    } catch (error) {
      // Directory already exists or couldn't be created
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${tutor.id}_${documentType}_${timestamp}${fileExtension}`;
    const filePath = path.join(verificationDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save document info to database
    const verificationDocument = await db.verificationDocument.create({
      data: {
        tutorId: tutor.id,
        type: documentType,
        name: file.name,
        description: description || null,
        fileUrl: `/verification-docs/${fileName}`,
        fileName: fileName,
        fileSize: file.size,
        mimeType: file.type,
        status: 'pending'
      }
    });

    // Update or create verification record
    let verification = await db.verification.findUnique({
      where: { tutorId: tutor.id }
    });

    if (!verification) {
      verification = await db.verification.create({
        data: {
          tutorId: tutor.id,
          overallStatus: 'pending',
          submittedAt: new Date()
        }
      });
    } else if (verification.overallStatus === 'approved' || verification.overallStatus === 'rejected') {
      // Reset status if new documents are uploaded
      await db.verification.update({
        where: { id: verification.id },
        data: {
          overallStatus: 'pending',
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          reviewerNotes: null
        }
      });
    }

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: {
        id: verificationDocument.id,
        type: verificationDocument.type,
        name: verificationDocument.name,
        status: verificationDocument.status,
        uploadedAt: verificationDocument.uploadedAt
      }
    });

  } catch (error) {
    console.error('Error uploading verification document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tutor = await db.tutor.findUnique({
      where: { userId: session.user.id }
    });

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    const documents = await db.verificationDocument.findMany({
      where: { tutorId: tutor.id },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ documents });

  } catch (error) {
    console.error('Error fetching verification documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}