'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface AnalyticsData {
  type: string;
  data: any;
  timestamp: string;
}

interface UseAnalyticsSocketOptions {
  enabled?: boolean;
  roomName?: string;
  onUpdate?: (data: AnalyticsData) => void;
  onBroadcast?: (data: AnalyticsData & { triggeredBy: string }) => void;
}

export function useAnalyticsSocket(options: UseAnalyticsSocketOptions = {}) {
  const { 
    enabled = true, 
    roomName = 'main-analytics',
    onUpdate,
    onBroadcast 
  } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Analytics socket connected');
      
      // Join analytics room
      socket.emit('join-analytics', {
        roomName,
        userId: 'current-user', // In real app, get from auth context
        userRole: 'ADMIN' // In real app, get from auth context
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Analytics socket disconnected');
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsConnected(false);
      console.error('Analytics socket connection error:', err);
    });

    // Analytics events
    socket.on('analytics-joined', (data) => {
      console.log('Joined analytics room:', data);
    });

    socket.on('analytics-update', (data: AnalyticsData) => {
      setLastUpdate(data);
      onUpdate?.(data);
    });

    socket.on('analytics-broadcast', (data: AnalyticsData & { triggeredBy: string }) => {
      setLastUpdate(data);
      onBroadcast?.(data);
    });

    socket.on('error', (data) => {
      setError(data.message);
      console.error('Analytics socket error:', data);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, roomName, onUpdate, onBroadcast]);

  // Function to request analytics update
  const requestUpdate = (type: string, filters?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('request-analytics-update', { type, filters });
    }
  };

  // Auto-refresh functionality
  const startAutoRefresh = (type: string, interval: number = 30000, filters?: any) => {
    if (!enabled || !isConnected) return;

    const refreshInterval = setInterval(() => {
      requestUpdate(type, filters);
    }, interval);

    return () => clearInterval(refreshInterval);
  };

  return {
    isConnected,
    lastUpdate,
    error,
    requestUpdate,
    startAutoRefresh
  };
}

// Hook for real-time overview analytics
export function useOverviewAnalytics(filters?: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { requestUpdate, startAutoRefresh, isConnected } = useAnalyticsSocket({
    onUpdate: (analyticsData) => {
      if (analyticsData.type === 'overview') {
        setData(analyticsData.data);
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isConnected) {
      requestUpdate('overview', filters);
      const cleanup = startAutoRefresh('overview', 30000, filters);
      return cleanup;
    }
  }, [isConnected, filters]);

  return { data, loading, isConnected, refetch: () => requestUpdate('overview', filters) };
}

// Hook for real-time learning analytics
export function useLearningAnalytics(filters?: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { requestUpdate, startAutoRefresh, isConnected } = useAnalyticsSocket({
    onUpdate: (analyticsData) => {
      if (analyticsData.type === 'learning') {
        setData(analyticsData.data);
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isConnected) {
      requestUpdate('learning', filters);
      const cleanup = startAutoRefresh('learning', 60000, filters);
      return cleanup;
    }
  }, [isConnected, filters]);

  return { data, loading, isConnected, refetch: () => requestUpdate('learning', filters) };
}

// Hook for real-time tutor analytics
export function useTutorAnalytics(filters?: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { requestUpdate, startAutoRefresh, isConnected } = useAnalyticsSocket({
    onUpdate: (analyticsData) => {
      if (analyticsData.type === 'tutors') {
        setData(analyticsData.data);
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isConnected) {
      requestUpdate('tutors', filters);
      const cleanup = startAutoRefresh('tutors', 45000, filters);
      return cleanup;
    }
  }, [isConnected, filters]);

  return { data, loading, isConnected, refetch: () => requestUpdate('tutors', filters) };
}

// Hook for real-time business analytics
export function useBusinessAnalytics(filters?: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { requestUpdate, startAutoRefresh, isConnected } = useAnalyticsSocket({
    onUpdate: (analyticsData) => {
      if (analyticsData.type === 'business') {
        setData(analyticsData.data);
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isConnected) {
      requestUpdate('business', filters);
      const cleanup = startAutoRefresh('business', 120000, filters);
      return cleanup;
    }
  }, [isConnected, filters]);

  return { data, loading, isConnected, refetch: () => requestUpdate('business', filters) };
}

// Hook for real-time predictive analytics
export function usePredictiveAnalytics(filters?: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { requestUpdate, startAutoRefresh, isConnected } = useAnalyticsSocket({
    onUpdate: (analyticsData) => {
      if (analyticsData.type === 'predictions') {
        setData(analyticsData.data);
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isConnected) {
      requestUpdate('predictions', filters);
      const cleanup = startAutoRefresh('predictions', 300000, filters); // 5 minutes
      return cleanup;
    }
  }, [isConnected, filters]);

  return { data, loading, isConnected, refetch: () => requestUpdate('predictions', filters) };
}