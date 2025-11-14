import { db } from '@/lib/db';
import { encryption } from './encryption';
import { AuditService, AuditActions, AuditResources } from './audit';

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  version: string;
  granted: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt?: Date;
  error?: string;
  retentionPeriod?: number; // days
}

export class ComplianceService {
  // Consent Management
  static async recordConsent(
    userId: string,
    consentType: string,
    version: string,
    granted: boolean,
    request?: Request
  ): Promise<ConsentRecord> {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    const consent = await db.consentRecord.create({
      data: {
        userId,
        consentType,
        version,
        granted,
        grantedAt: new Date(),
        ipAddress,
        userAgent
      }
    });

    await AuditService.logUserAction(
      await db.user.findUnique({ where: { id: userId } })!,
      granted ? AuditActions.DATA_ACCESS : 'data.consent.revoke',
      AuditResources.USER,
      userId,
      { consentType, version, granted },
      request
    );

    return consent;
  }

  static async getConsentStatus(userId: string, consentType: string): Promise<boolean> {
    const latestConsent = await db.consentRecord.findFirst({
      where: {
        userId,
        consentType,
        revokedAt: null
      },
      orderBy: { grantedAt: 'desc' }
    });

    return latestConsent?.granted || false;
  }

  static async getAllConsents(userId: string): Promise<ConsentRecord[]> {
    return await db.consentRecord.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' }
    });
  }

  static async revokeConsent(
    userId: string,
    consentType: string,
    request?: Request
  ): Promise<void> {
    await db.consentRecord.updateMany({
      where: {
        userId,
        consentType,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    await AuditService.logUserAction(
      await db.user.findUnique({ where: { id: userId } })!,
      'data.consent.revoke',
      AuditResources.USER,
      userId,
      { consentType },
      request
    );
  }

  // Data Export (GDPR Right to Access)
  static async requestDataExport(userId: string): Promise<DataExportRequest> {
    const request = await db.dataExportRequest.create({
      data: {
        userId,
        status: 'pending',
        requestedAt: new Date()
      }
    });

    // Start processing in background
    this.processDataExport(request.id).catch(console.error);

    await AuditService.logUserAction(
      await db.user.findUnique({ where: { id: userId } })!,
      AuditActions.DATA_EXPORT,
      AuditResources.USER,
      userId,
      { requestId: request.id }
    );

    return request;
  }

  private static async processDataExport(requestId: string): Promise<void> {
    try {
      await db.dataExportRequest.update({
        where: { id: requestId },
        data: { status: 'processing' }
      });

      const request = await db.dataExportRequest.findUnique({
        where: { id: requestId },
        include: { user: true }
      });

      if (!request) throw new Error('Request not found');

      const exportData = await this.compileUserData(request.userId);

      // Create encrypted export file
      const exportContent = JSON.stringify(exportData, null, 2);
      const encrypted = encryption.encryptField(exportContent);
      
      // In a real implementation, you'd store this in a secure file storage
      const downloadUrl = `/api/exports/${requestId}/download`;

      await db.dataExportRequest.update({
        where: { id: requestId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          downloadUrl
        }
      });
    } catch (error) {
      await db.dataExportRequest.update({
        where: { id: requestId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  private static async compileUserData(userId: string): Promise<any> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        parentProfile: true,
        tutorProfile: true,
        accounts: true,
        studentSessions: {
          include: {
            tutor: { select: { id: true, name: true, email: true } }
          }
        },
        tutorSessions: {
          include: {
            student: { select: { id: true, name: true, email: true } }
          }
        },
        bookings: true,
        payments: true,
        reviews: true,
        notifications: true,
        consentRecords: true
      }
    });

    if (!user) throw new Error('User not found');

    // Decrypt sensitive fields
    const decryptedUser = {
      ...user,
      email: encryption.decryptField(user.email),
      phone: user.phone ? encryption.decryptField(user.phone) : null,
      stripeCustomerId: user.stripeCustomerId ? encryption.decryptField(user.stripeCustomerId) : null
    };

    return {
      profile: decryptedUser,
      sessions: user.studentSessions.concat(user.tutorSessions),
      bookings: user.bookings,
      payments: user.payments,
      reviews: user.reviews,
      notifications: user.notifications,
      consents: user.consentRecords,
      exportedAt: new Date().toISOString()
    };
  }

  // Data Deletion (GDPR Right to Erasure / CCPA Right to Delete)
  static async requestDataDeletion(
    userId: string,
    retentionPeriod?: number
  ): Promise<DataDeletionRequest> {
    const request = await db.dataDeletionRequest.create({
      data: {
        userId,
        status: 'pending',
        requestedAt: new Date(),
        retentionPeriod
      }
    });

    // Start processing in background
    this.processDataDeletion(request.id).catch(console.error);

    await AuditService.logUserAction(
      await db.user.findUnique({ where: { id: userId } })!,
      AuditActions.DATA_DELETE,
      AuditResources.USER,
      userId,
      { requestId: request.id, retentionPeriod }
    );

    return request;
  }

  private static async processDataDeletion(requestId: string): Promise<void> {
    try {
      await db.dataDeletionRequest.update({
        where: { id: requestId },
        data: { status: 'processing' }
      });

      const request = await db.dataDeletionRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) throw new Error('Request not found');

      await this.deleteUserData(request.userId, request.retentionPeriod);

      await db.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });
    } catch (error) {
      await db.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  private static async deleteUserData(userId: string, retentionPeriod?: number): Promise<void> {
    // If retention period is specified, schedule deletion for future
    if (retentionPeriod && retentionPeriod > 0) {
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + retentionPeriod);
      
      await db.scheduledDeletion.create({
        data: {
          userId,
          deletionDate,
          status: 'scheduled'
        }
      });
      return;
    }

    // Immediate deletion
    await db.$transaction([
      // Delete user-related data
      db.notification.deleteMany({ where: { userId } }),
      db.payment.deleteMany({ where: { userId } }),
      db.review.deleteMany({ where: { OR: [{ tutorId: userId }, { studentId: userId }] } }),
      db.booking.deleteMany({ where: { userId } }),
      db.session.deleteMany({ where: { OR: [{ tutorId: userId }, { studentId: userId }] } }),
      db.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
      db.consentRecord.deleteMany({ where: { userId } }),
      
      // Delete profile data
      db.student.delete({ where: { userId } }).catch(() => {}),
      db.parent.delete({ where: { userId } }).catch(() => {}),
      db.tutor.delete({ where: { userId } }).catch(() => {}),
      
      // Delete accounts and finally the user
      db.account.deleteMany({ where: { userId } }),
      db.user.delete({ where: { id: userId } })
    ]);
  }

  // Data Retention Management
  static async processScheduledDeletions(): Promise<number> {
    const now = new Date();
    const scheduledDeletions = await db.scheduledDeletion.findMany({
      where: {
        deletionDate: { lte: now },
        status: 'scheduled'
      }
    });

    let processedCount = 0;
    for (const deletion of scheduledDeletions) {
      try {
        await this.deleteUserData(deletion.userId);
        await db.scheduledDeletion.update({
          where: { id: deletion.id },
          data: { status: 'completed' }
        });
        processedCount++;
      } catch (error) {
        await db.scheduledDeletion.update({
          where: { id: deletion.id },
          data: { 
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    return processedCount;
  }

  // Privacy Policy Management
  static async getPrivacyPolicy(): Promise<any> {
    return await db.privacyPolicy.findFirst({
      orderBy: { version: 'desc' }
    });
  }

  static async createPrivacyPolicy(
    content: string,
    version: string,
    effectiveDate: Date
  ): Promise<any> {
    return await db.privacyPolicy.create({
      data: {
        content,
        version,
        effectiveDate
      }
    });
  }

  // Cookie Consent Management
  static async getCookieConsent(userId: string): Promise<any> {
    return await db.cookieConsent.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async setCookieConsent(
    userId: string,
    preferences: any,
    request?: Request
  ): Promise<any> {
    const consent = await db.cookieConsent.create({
      data: {
        userId,
        preferences: JSON.stringify(preferences),
        createdAt: new Date()
      }
    });

    await AuditService.logUserAction(
      await db.user.findUnique({ where: { id: userId } })!,
      'cookie.consent.set',
      AuditResources.USER,
      userId,
      { preferences },
      request
    );

    return consent;
  }
}

// Consent types
export const ConsentTypes = {
  MARKETING: 'marketing',
  ANALYTICS: 'analytics',
  COOKIES: 'cookies',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  SMS_NOTIFICATIONS: 'sms_notifications',
  DATA_SHARING: 'data_sharing',
  LOCATION_TRACKING: 'location_tracking',
  PROFILE_VISIBILITY: 'profile_visibility'
};