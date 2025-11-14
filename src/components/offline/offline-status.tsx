'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { offlineManager } from '@/lib/offline/offline-manager';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Database, 
  Sync, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';

interface SyncStatus {
  isOnline: boolean;
  pendingActions: number;
  lastSync: Date;
  cachedData: any;
}

export function OfflineStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    updateSyncStatus();
    
    const interval = setInterval(updateSyncStatus, 5000);
    
    // Listen for online/offline events
    const handleOnline = () => updateSyncStatus();
    const handleOffline = () => updateSyncStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateSyncStatus = async () => {
    try {
      const status = await offlineManager.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error getting sync status:', error);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await offlineManager.forceSync();
      await updateSyncStatus();
    } catch (error) {
      console.error('Error forcing sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      try {
        await offlineManager.clearAllData();
        await updateSyncStatus();
      } catch (error) {
        console.error('Error clearing offline data:', error);
      }
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getCachedDataSize = () => {
    if (!syncStatus?.cachedData) return 0;
    
    const data = syncStatus.cachedData;
    const size = JSON.stringify(data).length;
    return Math.round(size / 1024); // Convert to KB
  };

  if (!syncStatus) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        <span>Loading offline status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {syncStatus.isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span>Connection Status</span>
          </CardTitle>
          <CardDescription>
            Current network and synchronization status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                syncStatus.isOnline ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {syncStatus.isOnline ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {syncStatus.isOnline 
                    ? 'All features available' 
                    : 'Limited functionality - working offline'
                  }
                </p>
              </div>
            </div>
            <Badge variant={syncStatus.isOnline ? "default" : "secondary"}>
              {syncStatus.isOnline ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {!syncStatus.isOnline && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are currently offline. Some features may be limited. Your actions will be synced automatically when you reconnect.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sync className="h-5 w-5" />
            <span>Synchronization</span>
          </CardTitle>
          <CardDescription>
            Data synchronization status and pending actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Actions</span>
                <Badge variant={syncStatus.pendingActions > 0 ? "destructive" : "default"}>
                  {syncStatus.pendingActions}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Sync</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatLastSync(syncStatus.lastSync)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cached Data</span>
                <span className="text-sm text-muted-foreground">
                  {getCachedDataSize()} KB
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sessions</span>
                <span className="text-sm text-muted-foreground">
                  {syncStatus.cachedData.sessions?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Messages</span>
                <span className="text-sm text-muted-foreground">
                  {syncStatus.cachedData.messages?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications</span>
                <span className="text-sm text-muted-foreground">
                  {syncStatus.cachedData.notifications?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {syncStatus.pendingActions > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sync Progress</span>
                <span className="text-sm text-muted-foreground">
                  {syncStatus.pendingActions} actions pending
                </span>
              </div>
              <Progress value={Math.max(0, 100 - syncStatus.pendingActions * 10)} className="h-2" />
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleForceSync} 
              disabled={!syncStatus.isOnline || isSyncing}
              size="sm"
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            
            <Button 
              onClick={handleClearData} 
              variant="outline" 
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Offline Capabilities</span>
          </CardTitle>
          <CardDescription>
            Features available when offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Available Offline</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">View cached sessions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Read messages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Access learning materials</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Queue actions for sync</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Requires Internet</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Book new sessions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Send messages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Make payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Video calls</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}