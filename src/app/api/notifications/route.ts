import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Mock notification data - in a real app, this would come from the database
const mockNotifications = [
  {
    id: '1',
    type: 'SESSION_REMINDER' as const,
    title: 'Upcoming Session Reminder',
    message: 'Your Calculus tutoring session with Dr. Sarah Johnson is scheduled for tomorrow at 3:00 PM.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: { sessionId: 'session-1', tutorId: 'tutor-1' }
  },
  {
    id: '2',
    type: 'NEW_MESSAGE' as const,
    title: 'New Message from Prof. Michael Chen',
    message: 'I have uploaded the study materials for our next session.',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    data: { messageId: 'msg-1', senderId: 'tutor-2' }
  },
  {
    id: '3',
    type: 'PAYMENT_CONFIRMATION' as const,
    title: 'Payment Confirmed',
    message: 'Your payment for Alice\'s Calculus session has been processed successfully.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: { paymentId: 'pay-1', amount: 45 }
  },
  {
    id: '4',
    type: 'REVIEW_REQUEST' as const,
    title: 'Please Review Your Tutor',
    message: 'How was your session with Dr. Sarah Johnson? Please leave a review.',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    data: { sessionId: 'session-1', tutorId: 'tutor-1' }
  },
  {
    id: '5',
    type: 'MARKETING_UPDATE' as const,
    title: 'New Feature: Group Sessions',
    message: 'We now offer group tutoring sessions at discounted rates!',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    data: { featureId: 'group-sessions' }
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, you would fetch notifications from the database
    // For now, we'll return mock data
    return NextResponse.json({ 
      notifications: mockNotifications 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, title, message, data } = await request.json();

    if (!type || !title || !message) {
      return NextResponse.json({ 
        error: 'Type, title, and message are required' 
      }, { status: 400 });
    }

    // In a real implementation, you would create a new notification in the database
    const newNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      data: data || {}
    };

    console.log('Created notification:', newNotification);

    return NextResponse.json({ 
      success: true, 
      notification: newNotification 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}