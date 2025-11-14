import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TutorVerification from '@/components/verification/tutor-verification';

export default async function VerificationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'TUTOR') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      <TutorVerification />
    </div>
  );
}