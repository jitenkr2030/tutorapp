import { LoadBalancer, LoadBalancerConfig } from './load-balancer';
import { db } from '@/lib/db';
import { AuditService, AuditActions, AuditResources } from './audit';

export interface ScalingMetrics {
  cpu: number;
  memory: number;
  connections: number;
  responseTime: number;
  errorRate: number;
  timestamp: Date;
}

export interface ScalingRule {
  id: string;
  name: string;
  metric: 'cpu' | 'memory' | 'connections' | 'responseTime' | 'errorRate';
  operator: 'gt' | 'lt' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds
  action: 'scale-up' | 'scale-down' | 'restart' | 'alert';
  cooldown: number; // seconds
  enabled: boolean;
}

export interface AutoScalingConfig {
  minInstances: number;
  maxInstances: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  metricsInterval: number;
  rules: ScalingRule[];
}

export class AutoScalingManager {
  private loadBalancer: LoadBalancer;
  private config: AutoScalingConfig;
  private metrics: ScalingMetrics[] = [];
  private lastScaleAction: { type: string; timestamp: Date } | null = null;
  private metricsInterval?: NodeJS.Timeout;
  private ruleCheckInterval?: NodeJS.Timeout;

  constructor(loadBalancer: LoadBalancer, config: AutoScalingConfig) {
    this.loadBalancer = loadBalancer;
    this.config = config;
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Collect metrics regularly
    this.metricsInterval = setInterval(() => {
      this.collectMetrics().catch(console.error);
    }, this.config.metricsInterval * 1000);

    // Check scaling rules
    this.ruleCheckInterval = setInterval(() => {
      this.checkScalingRules().catch(console.error);
    }, 5000); // Check every 5 seconds
  }

  private async collectMetrics(): Promise<void> {
    try {
      const stats = this.loadBalancer.getStats();
      const metrics: ScalingMetrics = {
        cpu: await this.getCPUUsage(),
        memory: await this.getMemoryUsage(),
        connections: stats.totalConnections,
        responseTime: stats.averageResponseTime,
        errorRate: await this.getErrorRate(),
        timestamp: new Date()
      };

      this.metrics.push(metrics);
      
      // Keep only last 100 metrics
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }

      // Store metrics in database
      await db.scalingMetric.create({
        data: {
          cpu: metrics.cpu,
          memory: metrics.memory,
          connections: metrics.connections,
          responseTime: metrics.responseTime,
          errorRate: metrics.errorRate,
          timestamp: metrics.timestamp
        }
      });
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }

  private async getCPUUsage(): Promise<number> {
    // Simulated CPU usage - in production, use system monitoring
    const usage = Math.random() * 100;
    return Math.round(usage * 100) / 100;
  }

  private async getMemoryUsage(): Promise<number> {
    // Simulated memory usage - in production, use system monitoring
    const usage = Math.random() * 100;
    return Math.round(usage * 100) / 100;
  }

  private async getErrorRate(): Promise<number> {
    // Simulated error rate - in production, track actual errors
    const rate = Math.random() * 5; // 0-5%
    return Math.round(rate * 100) / 100;
  }

  private async checkScalingRules(): Promise<void> {
    if (this.lastScaleAction) {
      const timeSinceLastAction = Date.now() - this.lastScaleAction.timestamp.getTime();
      const cooldown = this.lastScaleAction.type === 'scale-up' 
        ? this.config.scaleUpCooldown 
        : this.config.scaleDownCooldown;
      
      if (timeSinceLastAction < cooldown * 1000) {
        return; // Still in cooldown period
      }
    }

    for (const rule of this.config.rules.filter(r => r.enabled)) {
      if (await this.shouldTriggerRule(rule)) {
        await this.executeScalingAction(rule);
        break; // Execute only one rule at a time
      }
    }
  }

  private async shouldTriggerRule(rule: ScalingRule): Promise<boolean> {
    const recentMetrics = this.metrics.filter(metric => {
      const timeDiff = Date.now() - metric.timestamp.getTime();
      return timeDiff <= rule.duration * 1000;
    });

    if (recentMetrics.length === 0) return false;

    const metricValues = recentMetrics.map(m => m[rule.metric]);
    const average = metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length;

    switch (rule.operator) {
      case 'gt':
        return average > rule.threshold;
      case 'lt':
        return average < rule.threshold;
      case 'gte':
        return average >= rule.threshold;
      case 'lte':
        return average <= rule.threshold;
      default:
        return false;
    }
  }

  private async executeScalingAction(rule: ScalingRule): Promise<void> {
    const stats = this.loadBalancer.getStats();
    
    switch (rule.action) {
      case 'scale-up':
        if (stats.totalInstances < this.config.maxInstances) {
          await this.scaleUp();
          this.lastScaleAction = { type: 'scale-up', timestamp: new Date() };
          await AuditService.logSystemAction(
            'scaling.scale-up',
            'system',
            undefined,
            { rule: rule.name, instances: stats.totalInstances + 1 }
          );
        }
        break;
        
      case 'scale-down':
        if (stats.totalInstances > this.config.minInstances) {
          await this.scaleDown();
          this.lastScaleAction = { type: 'scale-down', timestamp: new Date() };
          await AuditService.logSystemAction(
            'scaling.scale-down',
            'system',
            undefined,
            { rule: rule.name, instances: stats.totalInstances - 1 }
          );
        }
        break;
        
      case 'restart':
        await this.restartUnhealthyInstances();
        await AuditService.logSystemAction(
          'scaling.restart',
          'system',
          undefined,
          { rule: rule.name }
        );
        break;
        
      case 'alert':
        await this.sendAlert(rule);
        await AuditService.logSystemAction(
          'scaling.alert',
          'system',
          undefined,
          { rule: rule.name, threshold: rule.threshold }
        );
        break;
    }
  }

  private async scaleUp(): Promise<void> {
    // In production, this would provision new server instances
    const newPort = 3000 + this.loadBalancer.getStats().totalInstances + 1;
    
    this.loadBalancer.addInstance({
      id: `instance-${Date.now()}`,
      host: 'localhost',
      port: newPort,
      weight: 1,
      connections: 0
    });

    console.log(`Scaled up: Added new instance on port ${newPort}`);
  }

  private async scaleDown(): Promise<void> {
    const stats = this.loadBalancer.getStats();
    const instanceToRemove = stats.instances
      .filter(instance => instance.healthy)
      .sort((a, b) => a.connections - b.connections)[0];

    if (instanceToRemove) {
      this.loadBalancer.removeInstance(instanceToRemove.id);
      console.log(`Scaled down: Removed instance ${instanceToRemove.id}`);
    }
  }

  private async restartUnhealthyInstances(): Promise<void> {
    const stats = this.loadBalancer.getStats();
    const unhealthyInstances = stats.instances.filter(instance => !instance.healthy);

    for (const instance of unhealthyInstances) {
      // In production, this would restart the container/VM
      console.log(`Restarting unhealthy instance: ${instance.id}`);
      
      // Remove and re-add the instance
      this.loadBalancer.removeInstance(instance.id);
      
      setTimeout(() => {
        this.loadBalancer.addInstance({
          id: instance.id,
          host: instance.host,
          port: instance.port,
          weight: instance.weight,
          connections: 0
        });
      }, 5000); // Wait 5 seconds before re-adding
    }
  }

  private async sendAlert(rule: ScalingRule): Promise<void> {
    // In production, this would send email, Slack, or other notifications
    console.log(`ALERT: Scaling rule "${rule.name}" triggered`);
    console.log(`Metric: ${rule.metric}, Threshold: ${rule.threshold}, Operator: ${rule.operator}`);
  }

  stop(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    if (this.ruleCheckInterval) {
      clearInterval(this.ruleCheckInterval);
    }
  }

  getMetrics(): ScalingMetrics[] {
    return [...this.metrics];
  }

  getConfig(): AutoScalingConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<AutoScalingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Circuit breaker pattern for resilience
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private cooldownPeriod: number;
  private failureThreshold: number;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(failureThreshold: number = 5, cooldownPeriod: number = 60000) {
    this.failureThreshold = failureThreshold;
    this.cooldownPeriod = cooldownPeriod;
    this.startMonitoring();
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      if (this.state === 'open' && Date.now() - this.lastFailureTime > this.cooldownPeriod) {
        this.state = 'half-open';
        console.log('Circuit breaker moved to half-open state');
      }
    }, 5000);
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open - service unavailable');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
      console.log('Circuit breaker moved to closed state');
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      console.log(`Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
    console.log('Circuit breaker reset');
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

// Rate limiting for scalability
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowSize: number;
  private maxRequests: number;

  constructor(windowSize: number = 60000, maxRequests: number = 100) {
    this.windowSize = windowSize;
    this.maxRequests = maxRequests;
    this.startCleanup();
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of this.requests.entries()) {
        const validTimestamps = timestamps.filter(timestamp => now - timestamp < this.windowSize);
        if (validTimestamps.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validTimestamps);
        }
      }
    }, this.windowSize);
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    
    const recentTimestamps = timestamps.filter(timestamp => now - timestamp < this.windowSize);
    
    if (recentTimestamps.length >= this.maxRequests) {
      return false;
    }
    
    recentTimestamps.push(now);
    this.requests.set(identifier, recentTimestamps);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    const recentTimestamps = timestamps.filter(timestamp => now - timestamp < this.windowSize);
    return Math.max(0, this.maxRequests - recentTimestamps.length);
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Factory function to create scaling manager
export function createScalingManager(
  loadBalancer: LoadBalancer,
  config?: Partial<AutoScalingConfig>
): AutoScalingManager {
  const defaultConfig: AutoScalingConfig = {
    minInstances: 1,
    maxInstances: 10,
    scaleUpCooldown: 300, // 5 minutes
    scaleDownCooldown: 600, // 10 minutes
    metricsInterval: 30, // 30 seconds
    rules: [
      {
        id: 'cpu-scale-up',
        name: 'High CPU Usage Scale Up',
        metric: 'cpu',
        operator: 'gt',
        threshold: 80,
        duration: 300,
        action: 'scale-up',
        cooldown: 300,
        enabled: true
      },
      {
        id: 'memory-scale-up',
        name: 'High Memory Usage Scale Up',
        metric: 'memory',
        operator: 'gt',
        threshold: 85,
        duration: 300,
        action: 'scale-up',
        cooldown: 300,
        enabled: true
      },
      {
        id: 'connections-scale-up',
        name: 'High Connections Scale Up',
        metric: 'connections',
        operator: 'gt',
        threshold: 800,
        duration: 60,
        action: 'scale-up',
        cooldown: 300,
        enabled: true
      },
      {
        id: 'cpu-scale-down',
        name: 'Low CPU Usage Scale Down',
        metric: 'cpu',
        operator: 'lt',
        threshold: 20,
        duration: 1800,
        action: 'scale-down',
        cooldown: 600,
        enabled: true
      },
      {
        id: 'error-restart',
        name: 'High Error Rate Restart',
        metric: 'errorRate',
        operator: 'gt',
        threshold: 10,
        duration: 60,
        action: 'restart',
        cooldown: 300,
        enabled: true
      }
    ]
  };

  return new AutoScalingManager(loadBalancer, { ...defaultConfig, ...config });
}