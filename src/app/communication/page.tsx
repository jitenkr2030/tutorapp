import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ParentTutorChat from '@/components/communication/parent-tutor-chat';

export default async function CommunicationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'PARENT') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Communication</h1>
        <p className="text-muted-foreground">
          Chat with your children's tutors
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <ParentTutorChat />
      </div>
    </div>
  );
}