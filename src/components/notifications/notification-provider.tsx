'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { toast } from 'sonner'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  type: 'SESSION_REMINDER' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'NEW_MESSAGE' | 'FILE_SHARED' | 'PAYMENT_RECEIVED'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const { data: session } = useSession()

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!session) return

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('Notification system connected')
    })

    // Handle different notification types
    socketInstance.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      
      // Show toast notification
      toast(notification.title, {
        description: notification.message,
        action: notification.actionUrl ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = notification.actionUrl}
          >
            View
          </Button>
        ) : undefined
      })
    })

    // Handle session reminders
    socketInstance.on('session-reminder', (data: { sessionId: string; subject: string; time: string }) => {
      const notification: Notification = {
        id: `reminder-${data.sessionId}-${Date.now()}`,
        type: 'SESSION_REMINDER',
        title: 'Session Reminder',
        message: `Your ${data.subject} session starts in ${data.time}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/session/${data.sessionId}`
      }
      
      setNotifications(prev => [notification, ...prev])
      toast('Session Reminder', {
        description: `Your ${data.subject} session starts in ${data.time}`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/session/${data.sessionId}`}
          >
            Join Session
          </Button>
        )
      })
    })

    // Handle session started
    socketInstance.on('session-started', (data: { sessionId: string; subject: string; startedBy: string }) => {
      const notification: Notification = {
        id: `started-${data.sessionId}-${Date.now()}`,
        type: 'SESSION_STARTED',
        title: 'Session Started',
        message: `${data.subject} session has been started by ${data.startedBy}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/session/${data.sessionId}`
      }
      
      setNotifications(prev => [notification, ...prev])
      toast('Session Started', {
        description: `${data.subject} session has been started`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/session/${data.sessionId}`}
          >
            Join Session
          </Button>
        )
      })
    })

    // Handle new messages
    socketInstance.on('new-message', (data: { sessionId: string; senderName: string; message: string }) => {
      const notification: Notification = {
        id: `message-${data.sessionId}-${Date.now()}`,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        message: `${data.senderName}: ${data.message}`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/session/${data.sessionId}`
      }
      
      setNotifications(prev => [notification, ...prev])
    })

    // Handle file sharing
    socketInstance.on('file-shared-notification', (data: { sessionId: string; fileName: string; sharedBy: string }) => {
      const notification: Notification = {
        id: `file-${data.sessionId}-${Date.now()}`,
        type: 'FILE_SHARED',
        title: 'File Shared',
        message: `${data.sharedBy} shared "${data.fileName}"`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: `/session/${data.sessionId}`
      }
      
      setNotifications(prev => [notification, ...prev])
      toast('File Shared', {
        description: `${data.sharedBy} shared "${data.fileName}"`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/session/${data.sessionId}`}
          >
            View File
          </Button>
        )
      })
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [session])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification
    }}>
      {children}
      <NotificationPanel />
    </NotificationContext.Provider>
  )
}

function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'SESSION_REMINDER':
        return <Bell className="w-4 h-4 text-blue-500" />
      case 'SESSION_STARTED':
        return <Bell className="w-4 h-4 text-green-500" />
      case 'SESSION_ENDED':
        return <Bell className="w-4 h-4 text-gray-500" />
      case 'NEW_MESSAGE':
        return <Bell className="w-4 h-4 text-purple-500" />
      case 'FILE_SHARED':
        return <Bell className="w-4 h-4 text-orange-500" />
      case 'PAYMENT_RECEIVED':
        return <Bell className="w-4 h-4 text-green-600" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="w-80 max-h-96 mt-2 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}