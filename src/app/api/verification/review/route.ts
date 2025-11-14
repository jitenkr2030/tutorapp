import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can review verification documents' }, { status: 403 });
    }

    const { documentId, status, rejectionReason, notes } = await request.json();

    if (!documentId || !status) {
      return NextResponse.json({ error: 'Document ID and status are required' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required when rejecting a document' }, { status: 400 });
    }

    // Get the document
    const document = await db.verificationDocument.findUnique({
      where: { id: documentId },
      include: {
        tutor: {
          include: {
            verification: true,
            verificationDocuments: true
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update document status
    await db.verificationDocument.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      }
    });

    // Update verification record
    let verification = document.tutor.verification;
    if (!verification) {
      verification = await db.verification.create({
        data: {
          tutorId: document.tutorId,
          overallStatus: 'pending'
        }
      });
    }

    // Check all documents for this tutor
    const allDocuments = await db.verificationDocument.findMany({
      where: { tutorId: document.tutorId }
    });

    const hasRejectedDocuments = allDocuments.some(doc => doc.status === 'rejected');
    const allDocumentsReviewed = allDocuments.every(doc => doc.status !== 'pending');
    const hasAllRequiredDocuments = allDocuments.some(doc => doc.type === 'id_proof') &&
                                   allDocuments.some(doc => doc.type === 'background_check') &&
                                   allDocuments.some(doc => doc.type === 'degree' || doc.type === 'certificate');

    let overallStatus = verification.overallStatus;
    let idVerified = verification.idVerified;
    let backgroundCheckVerified = verification.backgroundCheckVerified;
    let qualificationsVerified = verification.qualificationsVerified;

    if (allDocumentsReviewed) {
      if (hasRejectedDocuments) {
        overallStatus = 'rejected';
      } else if (hasAllRequiredDocuments) {
        overallStatus = 'approved';
        idVerified = allDocuments.some(doc => doc.type === 'id_proof' && doc.status === 'approved');
        backgroundCheckVerified = allDocuments.some(doc => doc.type === 'background_check' && doc.status === 'approved');
        qualificationsVerified = allDocuments.some(doc => (doc.type === 'degree' || doc.type === 'certificate') && doc.status === 'approved');
      } else {
        overallStatus = 'pending';
      }
    }

    await db.verification.update({
      where: { id: verification.id },
      data: {
        overallStatus,
        idVerified,
        backgroundCheckVerified,
        qualificationsVerified,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewerNotes: notes
      }
    });

    // Update tutor background check status
    if (overallStatus === 'approved') {
      await db.tutor.update({
        where: { id: document.tutorId },
        data: { backgroundCheck: true }
      });
    }

    return NextResponse.json({
      message: `Document ${status} successfully`,
      verificationStatus: overallStatus
    });

  } catch (error) {
    console.error('Error reviewing verification document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only administrators can view pending verifications' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const pendingVerifications = await db.verification.findMany({
      where: { overallStatus: status },
      include: {
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            verificationDocuments: {
              where: { status: 'pending' },
              orderBy: { uploadedAt: 'desc' }
            }
          }
        }
      },
      orderBy: { submittedAt: 'asc' }
    });

    return NextResponse.json({ pendingVerifications });

  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}