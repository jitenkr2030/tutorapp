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

    const tutor = await db.tutor.findUnique({
      where: { userId: session.user.id },
      include: {
        verification: true,
        verificationDocuments: {
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    const verificationStatus = {
      overallStatus: tutor.verification?.overallStatus || 'not_started',
      submittedAt: tutor.verification?.submittedAt,
      reviewedAt: tutor.verification?.reviewedAt,
      reviewerNotes: tutor.verification?.reviewerNotes,
      documents: tutor.verificationDocuments.map(doc => ({
        id: doc.id,
        type: doc.type,
        name: doc.name,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        reviewedAt: doc.reviewedAt,
        rejectionReason: doc.rejectionReason
      })),
      requirements: {
        idProof: tutor.verificationDocuments.some(doc => doc.type === 'id_proof'),
        backgroundCheck: tutor.verificationDocuments.some(doc => doc.type === 'background_check'),
        qualifications: tutor.verificationDocuments.some(doc => doc.type === 'degree' || doc.type === 'certificate')
      }
    };

    return NextResponse.json(verificationStatus);

  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}