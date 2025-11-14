'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePWA } from '@/hooks/use-pwa';
import { pushNotificationService } from '@/lib/notifications/push-notifications';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Smartphone, 
  MessageSquare, 
  Calendar,
  CreditCard,
  Star,
  Users,
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react';

interface NotificationSettings {
  sessionReminders: boolean;
  newMessages: boolean;
  paymentConfirmations: boolean;
  reviewRequests: boolean;
  systemAnnouncements: boolean;
  marketingUpdates: boolean;
}

interface NotificationPermission {
  granted: boolean;
  subscribed: boolean;
}

export function NotificationManager() {
  const pwa = usePWA();
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    subscribed: false
  });
  const [settings, setSettings] = useState<NotificationSettings>({
    sessionReminders: true,
    newMessages: true,
    paymentConfirmations: true,
    reviewRequests: true,
    systemAnnouncements: true,
    marketingUpdates: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const granted = Notification.permission === 'granted';
    const subscribed = pwa.registration ? 
      await pwa.registration.pushManager.getSubscription().then(sub => !!sub) : 
      false;

    setPermission({ granted, subscribed });
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      const granted = await pwa.requestNotificationPermission();
      if (granted) {
        const subscription = await pwa.subscribeToPushNotifications();
        setPermission({ granted: true, subscribed: !!subscription });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const success = await pwa.unsubscribeFromPushNotifications();
      if (success) {
        setPermission(prev => ({ ...prev, subscribed: false }));
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await pushNotificationService.sendToUser('current-user', {
        title: 'Test Notification',
        body: 'This is a test notification from TutorConnect',
        icon: '/icon-192x192.png',
        data: {
          url: '/notifications',
          type: 'test'
        }
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, save to backend
  };

  const notificationTypes = [
    {
      id: 'sessionReminders' as keyof NotificationSettings,
      title: 'Session Reminders',
      description: 'Get notified before your sessions start',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: 'newMessages' as keyof NotificationSettings,
      title: 'New Messages',
      description: 'Receive notifications for new messages',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: 'paymentConfirmations' as keyof NotificationSettings,
      title: 'Payment Confirmations',
      description: 'Get notified when payments are processed',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'reviewRequests' as keyof NotificationSettings,
      title: 'Review Requests',
      description: 'Receive prompts to review completed sessions',
      icon: <Star className="h-5 w-5" />
    },
    {
      id: 'systemAnnouncements' as keyof NotificationSettings,
      title: 'System Announcements',
      description: 'Important updates and announcements',
      icon: <AlertCircle className="h-5 w-5" />
    },
    {
      id: 'marketingUpdates' as keyof NotificationSettings,
      title: 'Marketing Updates',
      description: 'Promotional content and feature updates',
      icon: <Users className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Status</span>
          </CardTitle>
          <CardDescription>
            Manage your push notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                permission.granted ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {permission.granted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">Permission Status</p>
                <p className="text-sm text-muted-foreground">
                  {permission.granted ? 'Notifications enabled' : 'Notifications disabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {permission.granted ? (
                <Badge variant="default">
                  <Bell className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline">
                  <BellOff className="h-3 w-3 mr-1" />
                  Disabled
                </Badge>
              )}
              {!permission.granted && (
                <Button 
                  onClick={requestPermission} 
                  disabled={loading}
                  size="sm"
                >
                  Enable
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                permission.subscribed ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Push Subscription</p>
                <p className="text-sm text-muted-foreground">
                  {permission.subscribed ? 'Subscribed to push notifications' : 'Not subscribed'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {permission.subscribed ? (
                <Badge variant="default">
                  Subscribed
                </Badge>
              ) : (
                <Badge variant="outline">
                  Not Subscribed
                </Badge>
              )}
              {permission.granted && (
                <Button 
                  onClick={permission.subscribed ? unsubscribe : requestPermission} 
                  disabled={loading}
                  variant={permission.subscribed ? "outline" : "default"}
                  size="sm"
                >
                  {permission.subscribed ? 'Unsubscribe' : 'Subscribe'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={sendTestNotification}
              disabled={!permission.subscribed || loading}
              variant="outline"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Notifications</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4">
                {notificationTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">
                        {type.icon}
                      </div>
                      <div>
                        <p className="font-medium">{type.title}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[type.id]}
                      onCheckedChange={(checked) => updateSetting(type.id, checked)}
                      disabled={!permission.subscribed}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="learning" className="space-y-4">
              <div className="grid gap-4">
                {notificationTypes
                  .filter(type => ['sessionReminders', 'newMessages', 'reviewRequests'].includes(type.id))
                  .map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">
                          {type.icon}
                        </div>
                        <div>
                          <p className="font-medium">{type.title}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings[type.id]}
                        onCheckedChange={(checked) => updateSetting(type.id, checked)}
                        disabled={!permission.subscribed}
                      />
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}