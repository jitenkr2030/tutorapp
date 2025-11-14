'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePWA } from '@/hooks/use-pwa';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function PWAInstall() {
  const pwa = usePWA();
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);

  const handleInstall = async () => {
    await pwa.installPWA();
    setShowInstallDialog(false);
  };

  const handleEnableNotifications = async () => {
    const permissionGranted = await pwa.requestNotificationPermission();
    if (permissionGranted) {
      await pwa.subscribeToPushNotifications();
    }
  };

  const pwaFeatures = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile App Experience",
      description: "Install on your home screen for app-like experience"
    },
    {
      icon: <WifiOff className="h-6 w-6" />,
      title: "Offline Access",
      description: "Access your learning materials even without internet"
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Push Notifications",
      description: "Get instant updates about sessions and messages"
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "Background Sync",
      description: "Automatically sync your data when back online"
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      title: "Cross-Platform",
      description: "Works seamlessly on desktop, tablet, and mobile"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Fast Loading",
      description: "Instant loading with cached resources"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Installation Banner */}
      {pwa.isInstallable && !pwa.isInstalled && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Install TutorConnect App</p>
                  <p className="text-sm text-blue-700">Get the best learning experience on your device</p>
                </div>
              </div>
              <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Install
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Install TutorConnect</DialogTitle>
                    <DialogDescription>
                      Install TutorConnect on your device for a better learning experience with offline access and push notifications.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {pwaFeatures.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          {feature.icon}
                          <div>
                            <p className="font-medium">{feature.title}</p>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleInstall} className="flex-1">
                        Install Now
                      </Button>
                      <Button variant="outline" onClick={() => setShowInstallDialog(false)}>
                        Later
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>App Status</span>
          </CardTitle>
          <CardDescription>
            Current PWA status and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Installation</span>
                <Badge variant={pwa.isInstalled ? "default" : pwa.isInstallable ? "secondary" : "outline"}>
                  {pwa.isInstalled ? (
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Installed</span>
                    </span>
                  ) : pwa.isInstallable ? (
                    <span className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>Installable</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Not Installable</span>
                    </span>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network Status</span>
                <Badge variant={pwa.isOnline ? "default" : "destructive"}>
                  {pwa.isOnline ? (
                    <span className="flex items-center space-x-1">
                      <Wifi className="h-3 w-3" />
                      <span>Online</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <WifiOff className="h-3 w-3" />
                      <span>Offline</span>
                    </span>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications</span>
                <Badge variant={pwa.supportsNotifications ? "default" : "outline"}>
                  {pwa.supportsNotifications ? (
                    <span className="flex items-center space-x-1">
                      <Bell className="h-3 w-3" />
                      <span>Supported</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <BellOff className="h-3 w-3" />
                      <span>Not Supported</span>
                    </span>
                  )}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offline Support</span>
                <Badge variant={pwa.supportsOffline ? "default" : "outline"}>
                  {pwa.supportsOffline ? "Available" : "Unavailable"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Sync</span>
                <Badge variant={pwa.supportsBackgroundSync ? "default" : "outline"}>
                  {pwa.supportsBackgroundSync ? "Available" : "Unavailable"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Display Mode</span>
                <Badge variant="outline">
                  {pwa.isStandalone ? "Standalone" : "Browser"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {pwa.isInstallable && !pwa.isInstalled && (
              <Button onClick={() => setShowInstallDialog(true)} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            )}
            
            {pwa.supportsNotifications && (
              <Button onClick={handleEnableNotifications} variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}
            
            <Button onClick={pwa.checkForUpdates} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Updates
            </Button>
            
            <Button onClick={pwa.clearCache} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            
            <Dialog open={showFeaturesDialog} onOpenChange={setShowFeaturesDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View Features
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>PWA Features</DialogTitle>
                  <DialogDescription>
                    Discover all the powerful features available in our Progressive Web App
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pwaFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="text-blue-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}