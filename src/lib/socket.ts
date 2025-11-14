import { Server } from 'socket.io';
import { db } from '@/lib/db';

interface SessionUser {
  userId: string;
  userName: string;
  socketId: string;
}

interface SessionRoom {
  sessionId: string;
  users: SessionUser[];
}

interface AnalyticsRoom {
  roomName: string;
  users: string[];
}

const sessionRooms = new Map<string, SessionRoom>();
const analyticsRooms = new Map<string, AnalyticsRoom>();

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle session join
    socket.on('join-session', async (data: { sessionId: string; userId: string; userName: string }) => {
      try {
        // Verify user has access to this session
        const session = await db.session.findUnique({
          where: { id: data.sessionId },
          select: {
            tutorId: true,
            studentId: true,
            status: true,
            scheduledAt: true,
            subject: true
          }
        });

        if (!session || (session.tutorId !== data.userId && session.studentId !== data.userId)) {
          socket.emit('error', { message: 'Access denied to this session' });
          return;
        }

        // Join session room
        socket.join(data.sessionId);

        // Add user to session room tracking
        if (!sessionRooms.has(data.sessionId)) {
          sessionRooms.set(data.sessionId, {
            sessionId: data.sessionId,
            users: []
          });
        }

        const room = sessionRooms.get(data.sessionId)!;
        const existingUserIndex = room.users.findIndex(u => u.userId === data.userId);
        
        if (existingUserIndex >= 0) {
          // Update existing user
          room.users[existingUserIndex] = {
            userId: data.userId,
            userName: data.userName,
            socketId: socket.id
          };
        } else {
          // Add new user
          room.users.push({
            userId: data.userId,
            userName: data.userName,
            socketId: socket.id
          });
        }

        // Notify other users in the room
        socket.to(data.sessionId).emit('user-joined', {
          userId: data.userId,
          userName: data.userName
        });

        // Send current room users to the joining user
        socket.emit('room-users', {
          users: room.users.filter(u => u.userId !== data.userId)
        });

        // Set up session reminders
        setupSessionReminders(socket, data.sessionId, session);

        console.log(`User ${data.userName} (${data.userId}) joined session ${data.sessionId}`);
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle analytics room join
    socket.on('join-analytics', async (data: { roomName: string; userId: string; userRole: string }) => {
      try {
        // Verify user has access to analytics (admin only)
        if (data.userRole !== 'ADMIN') {
          socket.emit('error', { message: 'Access denied to analytics' });
          return;
        }

        // Join analytics room
        socket.join(data.roomName);

        // Add user to analytics room tracking
        if (!analyticsRooms.has(data.roomName)) {
          analyticsRooms.set(data.roomName, {
            roomName: data.roomName,
            users: []
          });
        }

        const room = analyticsRooms.get(data.roomName)!;
        if (!room.users.includes(data.userId)) {
          room.users.push(data.userId);
        }

        // Send confirmation
        socket.emit('analytics-joined', {
          roomName: data.roomName,
          userCount: room.users.length
        });

        console.log(`User ${data.userId} joined analytics room ${data.roomName}`);
      } catch (error) {
        console.error('Error joining analytics room:', error);
        socket.emit('error', { message: 'Failed to join analytics room' });
      }
    });

    // Handle real-time analytics updates
    socket.on('request-analytics-update', async (data: { type: string; filters?: any }) => {
      try {
        // Verify user is admin
        // In a real implementation, you would verify the user's role here
        
        let analyticsData;
        
        switch (data.type) {
          case 'overview':
            analyticsData = await getOverviewAnalytics(data.filters);
            break;
          case 'learning':
            analyticsData = await getLearningAnalytics(data.filters);
            break;
          case 'tutors':
            analyticsData = await getTutorAnalytics(data.filters);
            break;
          case 'business':
            analyticsData = await getBusinessAnalytics(data.filters);
            break;
          case 'predictions':
            analyticsData = await getPredictiveAnalytics(data.filters);
            break;
          default:
            socket.emit('error', { message: 'Invalid analytics type' });
            return;
        }

        // Send analytics data to the requesting socket
        socket.emit('analytics-update', {
          type: data.type,
          data: analyticsData,
          timestamp: new Date().toISOString()
        });

        // Broadcast to other users in the same analytics room
        const rooms = Array.from(analyticsRooms.values());
        rooms.forEach(room => {
          if (room.users.includes(socket.id)) {
            socket.to(room.roomName).emit('analytics-broadcast', {
              type: data.type,
              data: analyticsData,
              timestamp: new Date().toISOString(),
              triggeredBy: socket.id
            });
          }
        });

      } catch (error) {
        console.error('Error fetching analytics update:', error);
        socket.emit('error', { message: 'Failed to fetch analytics update' });
      }
    });

    // Handle WebRTC signaling
    socket.on('offer', (data: { offer: any; to: string }) => {
      // Find the target user's socket ID
      const targetUser = findUserInRooms(data.to);
      if (targetUser) {
        io.to(targetUser.socketId).emit('offer', {
          offer: data.offer,
          from: socket.id
        });
      }
    });

    socket.on('answer', (data: { answer: any; to: string }) => {
      // Find the target user's socket ID
      const targetUser = findUserInRooms(data.to);
      if (targetUser) {
        io.to(targetUser.socketId).emit('answer', data.answer);
      }
    });

    socket.on('ice-candidate', (data: { candidate: any; to: string }) => {
      // Find the target user's socket ID
      const targetUser = findUserInRooms(data.to);
      if (targetUser) {
        io.to(targetUser.socketId).emit('ice-candidate', data.candidate);
      }
    });

    // Handle chat messages
    socket.on('chat-message', (data: { sessionId: string; message: any }) => {
      // Broadcast message to all users in the session room
      socket.to(data.sessionId).emit('chat-message', data.message);
      
      // Send notification to other users
      const room = sessionRooms.get(data.sessionId);
      if (room) {
        room.users.forEach(user => {
          if (user.userId !== data.message.senderId) {
            io.to(user.socketId).emit('new-message', {
              sessionId: data.sessionId,
              senderName: data.message.senderName,
              message: data.message.content
            });
          }
        });
      }
    });

    // Handle session end
    socket.on('end-session', (data: { sessionId: string }) => {
      // Notify all users in the session that the session has ended
      io.to(data.sessionId).emit('session-ended');
      
      // Send session ended notifications
      const room = sessionRooms.get(data.sessionId);
      if (room) {
        room.users.forEach(user => {
          io.to(user.socketId).emit('notification', {
            id: `ended-${data.sessionId}-${Date.now()}`,
            type: 'SESSION_ENDED',
            title: 'Session Ended',
            message: 'The tutoring session has ended',
            timestamp: new Date().toISOString(),
            read: false
          });
        });
      }
      
      // Clean up session room
      sessionRooms.delete(data.sessionId);
    });

    // Handle file sharing
    socket.on('file-share', (data: { sessionId: string; fileData: any }) => {
      // Broadcast file data to all users in the session room
      socket.to(data.sessionId).emit('file-shared', data.fileData);
      
      // Send file sharing notifications
      const room = sessionRooms.get(data.sessionId);
      if (room) {
        room.users.forEach(user => {
          if (user.userId !== data.fileData.uploadedBy) {
            io.to(user.socketId).emit('file-shared-notification', {
              sessionId: data.sessionId,
              fileName: data.fileData.name,
              sharedBy: data.fileData.uploadedByName
            });
          }
        });
      }
    });

    // Handle file removal
    socket.on('file-remove', (data: { sessionId: string; fileId: string }) => {
      // Broadcast file removal to all users in the session room
      socket.to(data.sessionId).emit('file-removed', data.fileId);
    });

    // Handle whiteboard updates
    socket.on('whiteboard-update', (data: { sessionId: string; update: any }) => {
      // Broadcast whiteboard update to all users in the session room
      socket.to(data.sessionId).emit('whiteboard-updated', data.update);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove user from all session rooms
      sessionRooms.forEach((room, sessionId) => {
        const userIndex = room.users.findIndex(u => u.socketId === socket.id);
        if (userIndex >= 0) {
          const disconnectedUser = room.users[userIndex];
          room.users.splice(userIndex, 1);
          
          // Notify other users
          socket.to(sessionId).emit('user-left', {
            userId: disconnectedUser.userId,
            userName: disconnectedUser.userName
          });
          
          // Clean up empty rooms
          if (room.users.length === 0) {
            sessionRooms.delete(sessionId);
          }
        }
      });

      // Remove user from analytics rooms
      analyticsRooms.forEach((room, roomName) => {
        const userIndex = room.users.indexOf(socket.id);
        if (userIndex >= 0) {
          room.users.splice(userIndex, 1);
          
          // Clean up empty rooms
          if (room.users.length === 0) {
            analyticsRooms.delete(roomName);
          }
        }
      });
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to Video Session Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};

// Analytics data fetching functions
async function getOverviewAnalytics(filters: any = {}) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const [totalUsers, newUsers, sessions, payments] = await Promise.all([
    db.user.count(),
    db.user.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    }),
    db.session.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    db.payment.findMany({
      where: {
        paidAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    })
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;

  return {
    totalUsers,
    newUsers,
    totalSessions: sessions.length,
    completedSessions,
    totalRevenue,
    timestamp: new Date().toISOString()
  };
}

async function getLearningAnalytics(filters: any = {}) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const studentPerformance = await db.studentPerformance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      student: true
    }
  });

  return {
    studentPerformance,
    totalStudents: studentPerformance.length,
    avgEngagementScore: studentPerformance.length > 0 
      ? studentPerformance.reduce((sum, p) => sum + p.engagementScore, 0) / studentPerformance.length 
      : 0,
    timestamp: new Date().toISOString()
  };
}

async function getTutorAnalytics(filters: any = {}) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const tutorPerformance = await db.tutorPerformance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      tutor: true
    }
  });

  return {
    tutorPerformance,
    totalTutors: tutorPerformance.length,
    avgRating: tutorPerformance.length > 0 
      ? tutorPerformance.reduce((sum, p) => sum + p.avgRating, 0) / tutorPerformance.length 
      : 0,
    timestamp: new Date().toISOString()
  };
}

async function getBusinessAnalytics(filters: any = {}) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const payments = await db.payment.findMany({
    where: {
      paidAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'COMPLETED'
    }
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalRevenue,
    totalPayments: payments.length,
    avgPaymentAmount: payments.length > 0 ? totalRevenue / payments.length : 0,
    timestamp: new Date().toISOString()
  };
}

async function getPredictiveAnalytics(filters: any = {}) {
  const predictions = await db.predictionModel.findMany({
    where: {
      targetDate: {
        gte: new Date()
      }
    },
    orderBy: {
      targetDate: 'asc'
    }
  });

  return {
    predictions,
    timestamp: new Date().toISOString()
  };
}

// Helper function to find a user across all session rooms
function findUserInRooms(userId: string): SessionUser | null {
  for (const room of sessionRooms.values()) {
    const user = room.users.find(u => u.userId === userId);
    if (user) {
      return user;
    }
  }
  return null;
}

// Helper function to set up session reminders
function setupSessionReminders(socket: any, sessionId: string, session: any) {
  const sessionTime = new Date(session.scheduledAt);
  const now = new Date();
  const timeUntilSession = sessionTime.getTime() - now.getTime();

  // 15-minute reminder
  const fifteenMinutes = 15 * 60 * 1000;
  if (timeUntilSession > fifteenMinutes) {
    setTimeout(() => {
      socket.emit('session-reminder', {
        sessionId,
        subject: session.subject,
        time: '15 minutes'
      });
    }, timeUntilSession - fifteenMinutes);
  }

  // 5-minute reminder
  const fiveMinutes = 5 * 60 * 1000;
  if (timeUntilSession > fiveMinutes) {
    setTimeout(() => {
      socket.emit('session-reminder', {
        sessionId,
        subject: session.subject,
        time: '5 minutes'
      });
    }, timeUntilSession - fiveMinutes);
  }

  // 1-minute reminder
  const oneMinute = 1 * 60 * 1000;
  if (timeUntilSession > oneMinute) {
    setTimeout(() => {
      socket.emit('session-reminder', {
        sessionId,
        subject: session.subject,
        time: '1 minute'
      });
    }, timeUntilSession - oneMinute);
  }
}