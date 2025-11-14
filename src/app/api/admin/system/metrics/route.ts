import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get recent metrics from the database
    const metrics = await db.scalingMetric.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50 // Get last 50 metrics
    });

    // If no metrics exist, generate some mock data
    if (metrics.length === 0) {
      const mockMetrics = [];
      const now = new Date();
      
      for (let i = 49; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000); // Every minute
        mockMetrics.push({
          id: `metric-${i}`,
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          connections: Math.floor(Math.random() * 1000),
          responseTime: Math.random() * 200,
          errorRate: Math.random() * 10,
          timestamp
        });
      }

      // Save mock metrics to database
      await db.scalingMetric.createMany({
        data: mockMetrics
      });

      return NextResponse.json(mockMetrics);
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to get system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get system metrics' },
      { status: 500 }
    );
  }
}