import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FamilyManagement from '@/components/family/family-management';

export default async function FamilyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'PARENT') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      <FamilyManagement />
    </div>
  );
}