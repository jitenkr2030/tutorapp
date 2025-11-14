'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServerInstance {
  id: string;
  host: string;
  port: number;
  weight: number;
  connections: number;
  healthy: boolean;
  lastHealthCheck: Date;
  responseTime: number;
}

interface ScalingMetrics {
  cpu: number;
  memory: number;
  connections: number;
  responseTime: number;
  errorRate: number;
  timestamp: Date;
}

interface SystemStats {
  totalInstances: number;
  healthyInstances: number;
  totalConnections: number;
  averageResponseTime: number;
  instances: ServerInstance[];
}

export function MonitoringDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [metrics, setMetrics] = useState<ScalingMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      const [statsResponse, metricsResponse] = await Promise.all([
        fetch('/api/admin/system/stats'),
        fetch('/api/admin/system/metrics')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getHealthColor = (healthy: boolean) => {
    return healthy ? 'bg-green-500' : 'bg-red-500';
  };

  const getLoadColor = (load: number) => {
    if (load < 50) return 'text-green-600';
    if (load < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const chartData = metrics.map(metric => ({
    time: formatTimestamp(metric.timestamp),
    cpu: metric.cpu,
    memory: metric.memory,
    connections: metric.connections,
    responseTime: metric.responseTime,
    errorRate: metric.errorRate
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleString()}
          </p>
        </div>
        <Button onClick={fetchSystemData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInstances || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.healthyInstances || 0} healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConnections || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all instances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageResponseTime.toFixed(2) || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.healthyInstances === stats.totalInstances ? 'Good' : 'Warning'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.healthyInstances || 0}/{stats?.totalInstances || 0} healthy
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="instances">Server Instances</TabsTrigger>
          <TabsTrigger value="scaling">Auto Scaling</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Metrics</CardTitle>
              <CardDescription>System performance metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.slice(-10).map((data, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">{data.time}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">CPU</p>
                      <p className={`text-sm ${getLoadColor(data.cpu)}`}>{data.cpu.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Memory</p>
                      <p className={`text-sm ${getLoadColor(data.memory)}`}>{data.memory.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Connections</p>
                      <p className="text-sm">{data.connections}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-sm">{data.responseTime.toFixed(2)}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Instances</CardTitle>
              <CardDescription>Detailed information about each server instance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.instances.map((instance) => (
                  <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getHealthColor(instance.healthy)}`} />
                      <div>
                        <h3 className="font-medium">{instance.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {instance.host}:{instance.port}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">Connections</p>
                        <p className={`text-lg ${getLoadColor(instance.connections / 1000 * 100)}`}>
                          {instance.connections}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Response Time</p>
                        <p className="text-lg">{instance.responseTime.toFixed(2)}ms</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Weight</p>
                        <p className="text-lg">{instance.weight}</p>
                      </div>
                      <Badge variant={instance.healthy ? "default" : "destructive"}>
                        {instance.healthy ? "Healthy" : "Unhealthy"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scaling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto Scaling Configuration</CardTitle>
              <CardDescription>Current scaling rules and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Instances</label>
                    <p className="text-2xl font-bold">1</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Instances</label>
                    <p className="text-2xl font-bold">10</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Scale Up Cooldown</label>
                    <p className="text-2xl font-bold">5m</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Scale Down Cooldown</label>
                    <p className="text-2xl font-bold">10m</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scaling Rules</CardTitle>
              <CardDescription>Active scaling rules and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">High CPU Usage Scale Up</h3>
                    <p className="text-sm text-muted-foreground">
                      CPU &gt; 80% for 5 minutes
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">High Memory Usage Scale Up</h3>
                    <p className="text-sm text-muted-foreground">
                      Memory &gt; 85% for 5 minutes
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Low CPU Usage Scale Down</h3>
                    <p className="text-sm text-muted-foreground">
                      CPU &lt; 20% for 30 minutes
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">High Error Rate Restart</h3>
                    <p className="text-sm text-muted-foreground">
                      Error Rate &gt; 10% for 1 minute
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}