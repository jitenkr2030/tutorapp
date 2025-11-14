import { NextRequest, NextResponse } from 'next/server';
import { LoadBalancer } from '@/lib/load-balancer';

// Mock load balancer for demonstration
const loadBalancer = new LoadBalancer({
  strategy: 'least-connections',
  healthCheckInterval: 30000,
  healthCheckTimeout: 5000,
  maxConnections: 1000,
  failoverTimeout: 60000,
  retryAttempts: 3
});

// Add some mock instances
loadBalancer.addInstance({
  id: 'instance-1',
  host: 'localhost',
  port: 3001,
  weight: 1,
  connections: 150
});

loadBalancer.addInstance({
  id: 'instance-2',
  host: 'localhost',
  port: 3002,
  weight: 1,
  connections: 200
});

loadBalancer.addInstance({
  id: 'instance-3',
  host: 'localhost',
  port: 3003,
  weight: 2,
  connections: 100
});

export async function GET(request: NextRequest) {
  try {
    const stats = loadBalancer.getStats();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get system stats:', error);
    return NextResponse.json(
      { error: 'Failed to get system stats' },
      { status: 500 }
    );
  }
}