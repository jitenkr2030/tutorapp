import { db } from '@/lib/db';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export class PushNotificationService {
  private vapidPublicKey: string;
  private vapidPrivateKey: string;
  private vapidEmail: string;

  constructor() {
    // VAPID keys for push notifications
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    this.vapidEmail = process.env.VAPID_EMAIL || 'noreply@tutorconnect.com';

    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      console.warn('VAPID keys not configured. Push notifications will not work.');
    }
  }

  async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      // Store subscription in database - we'll need to add this model
      console.log('Saving subscription for user:', userId, subscription);
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    try {
      // Remove subscription from database
      console.log('Removing subscription for user:', userId, endpoint);
    } catch (error) {
      console.error('Error removing push subscription:', error);
      throw error;
    }
  }

  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      // In a real implementation, this would use web-push library
      console.log('Sending notification to user:', userId, payload);
    } catch (error) {
      console.error('Error sending push notification to user:', error);
      throw error;
    }
  }

  async sendToMultipleUsers(userIds: string[], payload: NotificationPayload): Promise<void> {
    try {
      const sendPromises = userIds.map(userId => 
        this.sendToUser(userId, payload).catch(error => {
          console.error(`Error sending to user ${userId}:`, error);
        })
      );

      await Promise.allSettled(sendPromises);
    } catch (error) {
      console.error('Error sending push notification to multiple users:', error);
      throw error;
    }
  }

  async sendToAllUsers(payload: NotificationPayload): Promise<void> {
    try {
      // Get all users and send notification
      console.log('Sending notification to all users:', payload);
    } catch (error) {
      console.error('Error sending push notification to all users:', error);
      throw error;
    }
  }

  async sendSessionReminder(sessionId: string): Promise<void> {
    try {
      const payload: NotificationPayload = {
        title: 'Upcoming Session Reminder',
        body: 'Your session starts in 30 minutes',
        icon: '/icon-192x192.png',
        data: {
          url: `/session/${sessionId}`,
          sessionId,
          type: 'session_reminder'
        },
        actions: [
          {
            action: 'view_session',
            title: 'View Session',
            icon: '/icon-72x72.png'
          }
        ]
      };

      await this.sendToUser('current-user', payload); // Placeholder
    } catch (error) {
      console.error('Error sending session reminder:', error);
    }
  }

  async sendNewMessageNotification(receiverId: string, senderName: string): Promise<void> {
    try {
      const payload: NotificationPayload = {
        title: 'New Message',
        body: `You have a new message from ${senderName}`,
        icon: '/icon-192x192.png',
        data: {
          url: '/communication',
          type: 'new_message'
        },
        actions: [
          {
            action: 'view_messages',
            title: 'View Messages',
            icon: '/icon-72x72.png'
          }
        ]
      };

      await this.sendToUser(receiverId, payload);
    } catch (error) {
      console.error('Error sending new message notification:', error);
    }
  }

  async sendPaymentConfirmation(userId: string, amount: number, sessionTitle?: string): Promise<void> {
    try {
      const payload: NotificationPayload = {
        title: 'Payment Confirmed',
        body: `Your payment of $${amount.toFixed(2)} has been processed successfully${sessionTitle ? ` for "${sessionTitle}"` : ''}`,
        icon: '/icon-192x192.png',
        data: {
          url: '/dashboard/student/transactions',
          type: 'payment_confirmation'
        }
      };

      await this.sendToUser(userId, payload);
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
    }
  }

  async sendReviewRequest(sessionId: string, studentId: string, tutorName: string): Promise<void> {
    try {
      const payload: NotificationPayload = {
        title: 'Rate Your Session',
        body: `How was your session with ${tutorName}? Please leave a review`,
        icon: '/icon-192x192.png',
        data: {
          url: `/session/${sessionId}`,
          sessionId,
          type: 'review_request'
        },
        actions: [
          {
            action: 'leave_review',
            title: 'Leave Review',
            icon: '/icon-72x72.png'
          }
        ]
      };

      await this.sendToUser(studentId, payload);
    } catch (error) {
      console.error('Error sending review request:', error);
    }
  }

  async sendSystemAnnouncement(title: string, body: string, targetUsers?: string[]): Promise<void> {
    try {
      const payload: NotificationPayload = {
        title,
        body,
        icon: '/icon-192x192.png',
        data: {
          url: '/notifications',
          type: 'system_announcement'
        }
      };

      if (targetUsers && targetUsers.length > 0) {
        await this.sendToMultipleUsers(targetUsers, payload);
      } else {
        await this.sendToAllUsers(payload);
      }
    } catch (error) {
      console.error('Error sending system announcement:', error);
    }
  }

  getVapidPublicKey(): string {
    return this.vapidPublicKey;
  }

  isConfigured(): boolean {
    return !!(this.vapidPublicKey && this.vapidPrivateKey);
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();