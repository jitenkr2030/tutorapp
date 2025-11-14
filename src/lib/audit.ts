import { db } from '@/lib/db';
import { User } from '@prisma/client';

export interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditService {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          sessionId: data.sessionId,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static async getLogs(filters: AuditLogFilters = {}): Promise<any[]> {
    const {
      userId,
      action,
      resource,
      resourceId,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = filters;

    const where: any = {};
    
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (resourceId) where.resourceId = resourceId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return await db.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });
  }

  static async getLogCount(filters: AuditLogFilters = {}): Promise<number> {
    const {
      userId,
      action,
      resource,
      resourceId,
      startDate,
      endDate
    } = filters;

    const where: any = {};
    
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (resourceId) where.resourceId = resourceId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return await db.auditLog.count({ where });
  }

  static async logUserAction(
    user: User,
    action: string,
    resource: string,
    resourceId?: string,
    details?: any,
    request?: Request
  ): Promise<void> {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await this.log({
      userId: user.id,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent
    });
  }

  static async logSystemAction(
    action: string,
    resource: string,
    resourceId?: string,
    details?: any
  ): Promise<void> {
    await this.log({
      userId: 'system',
      action,
      resource,
      resourceId,
      details
    });
  }

  static async getRecentUserActivity(userId: string, limit: number = 10): Promise<any[]> {
    return await this.getLogs({
      userId,
      limit
    });
  }

  static async getSystemLogs(limit: number = 100): Promise<any[]> {
    return await this.getLogs({
      userId: 'system',
      limit
    });
  }

  static async cleanupOldLogs(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await db.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }
}

// Audit action types
export const AuditActions = {
  // User actions
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTER: 'user.register',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  
  // Authentication actions
  AUTH_2FA_ENABLE: 'auth.2fa.enable',
  AUTH_2FA_DISABLE: 'auth.2fa.disable',
  AUTH_2FA_VERIFY: 'auth.2fa.verify',
  AUTH_SOCIAL_LOGIN: 'auth.social.login',
  
  // Session actions
  SESSION_CREATE: 'session.create',
  SESSION_UPDATE: 'session.update',
  SESSION_CANCEL: 'session.cancel',
  SESSION_COMPLETE: 'session.complete',
  
  // Payment actions
  PAYMENT_CREATE: 'payment.create',
  PAYMENT_COMPLETE: 'payment.complete',
  PAYMENT_REFUND: 'payment.refund',
  PAYMENT_FAILED: 'payment.failed',
  
  // Data actions
  DATA_ACCESS: 'data.access',
  DATA_EXPORT: 'data.export',
  DATA_DELETE: 'data.delete',
  
  // Admin actions
  ADMIN_USER_SUSPEND: 'admin.user.suspend',
  ADMIN_USER_RESTORE: 'admin.user.restore',
  ADMIN_CONFIG_UPDATE: 'admin.config.update',
  
  // System actions
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',
  SYSTEM_ERROR: 'system.error'
};

// Resource types
export const AuditResources = {
  USER: 'user',
  SESSION: 'session',
  PAYMENT: 'payment',
  BOOKING: 'booking',
  REVIEW: 'review',
  FILE: 'file',
  SETTINGS: 'settings',
  SYSTEM: 'system'
};