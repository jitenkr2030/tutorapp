'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import VideoCall from '@/components/video-call/video-call';
import { db } from '@/lib/db';

interface SessionData {
  id: string;
  title: string;
  tutorId: string;
  studentId: string;
  tutor: {
    user: {
      id: string;
      name: string;
    };
  };
  student: {
    user: {
      id: string;
      name: string;
    };
  };
}

export default function VideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = params.sessionId as string;

  useEffect(() => {
    if (session && sessionId) {
      fetchSessionData();
    }
  }, [session, sessionId]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionData(data.session);
        
        // Check if user is authorized to join this session
        const userId = session?.user?.id;
        const isTutor = userId === data.session.tutor.user.id;
        const isStudent = userId === data.session.student.user.id;
        
        if (!isTutor && !isStudent) {
          setError('You are not authorized to join this session');
          return;
        }
      } else {
        setError('Session not found');
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Session not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const userId = session?.user?.id || '';
  const userName = session?.user?.name || '';
  const userRole = userId === sessionData.tutor.user.id ? 'tutor' : 'student';
  const otherUserId = userId === sessionData.tutor.user.id 
    ? sessionData.student.user.id 
    : sessionData.tutor.user.id;
  const otherUserName = userId === sessionData.tutor.user.id 
    ? sessionData.student.user.name 
    : sessionData.tutor.user.name;

  return (
    <VideoCall
      sessionId={sessionId}
      userId={userId}
      userName={userName}
      userRole={userRole}
      otherUserId={otherUserId}
      otherUserName={otherUserName}
      onEndCall={handleEndCall}
    />
  );
}