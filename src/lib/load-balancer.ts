import { createServer } from 'http';
import { Cluster } from 'cluster';
import { cpus } from 'os';
import * as http from 'http';

export interface ServerInstance {
  id: string;
  host: string;
  port: number;
  weight: number;
  connections: number;
  healthy: boolean;
  lastHealthCheck: Date;
  responseTime: number;
}

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  healthCheckInterval: number;
  healthCheckTimeout: number;
  maxConnections: number;
  failoverTimeout: number;
  retryAttempts: number;
}

export class LoadBalancer {
  private instances: ServerInstance[] = [];
  private currentIndex = 0;
  private config: LoadBalancerConfig;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: Partial<LoadBalancerConfig> = {}) {
    this.config = {
      strategy: 'least-connections',
      healthCheckInterval: 30000, // 30 seconds
      healthCheckTimeout: 5000, // 5 seconds
      maxConnections: 1000,
      failoverTimeout: 60000, // 1 minute
      retryAttempts: 3,
      ...config
    };

    this.startHealthChecks();
  }

  addInstance(instance: Omit<ServerInstance, 'healthy' | 'lastHealthCheck'>): void {
    const newInstance: ServerInstance = {
      ...instance,
      healthy: true,
      lastHealthCheck: new Date(),
      responseTime: 0
    };

    this.instances.push(newInstance);
    console.log(`Added server instance: ${instance.host}:${instance.port}`);
  }

  removeInstance(instanceId: string): void {
    this.instances = this.instances.filter(instance => instance.id !== instanceId);
    console.log(`Removed server instance: ${instanceId}`);
  }

  getNextInstance(): ServerInstance | null {
    const healthyInstances = this.instances.filter(instance => instance.healthy);
    
    if (healthyInstances.length === 0) {
      console.warn('No healthy server instances available');
      return null;
    }

    switch (this.config.strategy) {
      case 'round-robin':
        return this.getRoundRobinInstance(healthyInstances);
      case 'least-connections':
        return this.getLeastConnectionsInstance(healthyInstances);
      case 'weighted':
        return this.getWeightedInstance(healthyInstances);
      case 'ip-hash':
        return this.getIPHashInstance(healthyInstances);
      default:
        return healthyInstances[0];
    }
  }

  private getRoundRobinInstance(instances: ServerInstance[]): ServerInstance {
    const instance = instances[this.currentIndex % instances.length];
    this.currentIndex++;
    return instance;
  }

  private getLeastConnectionsInstance(instances: ServerInstance[]): ServerInstance {
    return instances.reduce((least, current) => 
      current.connections < least.connections ? current : least
    );
  }

  private getWeightedInstance(instances: ServerInstance[]): ServerInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0);
    const random = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    for (const instance of instances) {
      cumulativeWeight += instance.weight;
      if (random <= cumulativeWeight) {
        return instance;
      }
    }
    
    return instances[instances.length - 1];
  }

  private getIPHashInstance(instances: ServerInstance[]): ServerInstance {
    // For demonstration, using a simple hash
    const hash = Math.floor(Math.random() * instances.length);
    return instances[hash % instances.length];
  }

  async healthCheck(): Promise<void> {
    for (const instance of this.instances) {
      try {
        const startTime = Date.now();
        const response = await fetch(`http://${instance.host}:${instance.port}/health`, {
          timeout: this.config.healthCheckTimeout
        });
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          instance.healthy = true;
          instance.responseTime = responseTime;
          instance.lastHealthCheck = new Date();
        } else {
          instance.healthy = false;
          console.warn(`Health check failed for ${instance.host}:${instance.port}: ${response.status}`);
        }
      } catch (error) {
        instance.healthy = false;
        console.warn(`Health check failed for ${instance.host}:${instance.port}:`, error);
      }
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.healthCheck().catch(console.error);
    }, this.config.healthCheckInterval);
  }

  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  getStats(): {
    totalInstances: number;
    healthyInstances: number;
    totalConnections: number;
    averageResponseTime: number;
    instances: ServerInstance[];
  } {
    const healthyInstances = this.instances.filter(instance => instance.healthy);
    const totalConnections = this.instances.reduce((sum, instance) => sum + instance.connections, 0);
    const averageResponseTime = healthyInstances.length > 0 
      ? healthyInstances.reduce((sum, instance) => sum + instance.responseTime, 0) / healthyInstances.length
      : 0;

    return {
      totalInstances: this.instances.length,
      healthyInstances: healthyInstances.length,
      totalConnections,
      averageResponseTime,
      instances: this.instances
    };
  }

  updateInstanceWeight(instanceId: string, weight: number): void {
    const instance = this.instances.find(instance => instance.id === instanceId);
    if (instance) {
      instance.weight = weight;
      console.log(`Updated weight for instance ${instanceId}: ${weight}`);
    }
  }

  incrementConnections(instanceId: string): void {
    const instance = this.instances.find(instance => instance.id === instanceId);
    if (instance) {
      instance.connections++;
    }
  }

  decrementConnections(instanceId: string): void {
    const instance = this.instances.find(instance => instance.id === instanceId);
    if (instance) {
      instance.connections = Math.max(0, instance.connections - 1);
    }
  }

  isOverloaded(): boolean {
    return this.instances.some(instance => 
      instance.connections >= this.config.maxConnections
    );
  }

  getLoadDistribution(): { instanceId: string; load: number }[] {
    return this.instances.map(instance => ({
      instanceId: instance.id,
      load: instance.connections / this.config.maxConnections
    }));
  }
}

// Cluster-based load balancing for Node.js
export class ClusterLoadBalancer {
  private workers: any[] = [];
  private currentIndex = 0;

  constructor() {
    if (Cluster.isPrimary) {
      this.setupCluster();
    }
  }

  private setupCluster(): void {
    const numCPUs = cpus().length;
    
    console.log(`Starting cluster with ${numCPUs} workers`);
    
    for (let i = 0; i < numCPUs; i++) {
      const worker = Cluster.fork();
      this.workers.push(worker);
      
      worker.on('exit', (code: number, signal: string) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        console.log('Starting a new worker');
        const newWorker = Cluster.fork();
        this.workers = this.workers.filter(w => w !== worker);
        this.workers.push(newWorker);
      });
    }
  }

  getNextWorker(): any {
    if (this.workers.length === 0) return null;
    
    const worker = this.workers[this.currentIndex % this.workers.length];
    this.currentIndex++;
    return worker;
  }

  getWorkerStats(): { pid: number; uptime: number }[] {
    return this.workers.map(worker => ({
      pid: worker.process.pid,
      uptime: process.uptime() - worker.process.uptime()
    }));
  }
}

// Reverse proxy load balancer
export class ReverseProxyLoadBalancer {
  private loadBalancer: LoadBalancer;
  private server: any;

  constructor(config: Partial<LoadBalancerConfig> = {}) {
    this.loadBalancer = new LoadBalancer(config);
    this.server = createServer(this.handleRequest.bind(this));
  }

  private async handleRequest(req: any, res: any): Promise<void> {
    const instance = this.loadBalancer.getNextInstance();
    
    if (!instance) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Service Unavailable: No healthy instances');
      return;
    }

    this.loadBalancer.incrementConnections(instance.id);

    try {
      const options = {
        hostname: instance.host,
        port: instance.port,
        path: req.url,
        method: req.method,
        headers: req.headers
      };

      const proxyReq = await new Promise((resolve, reject) => {
        const proxyReq = http.request(options, (proxyRes: any) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
          resolve(proxyRes);
        });

        proxyReq.on('error', reject);
        req.pipe(proxyReq);
      });

      this.loadBalancer.decrementConnections(instance.id);
    } catch (error) {
      this.loadBalancer.decrementConnections(instance.id);
      console.error(`Proxy request failed for ${instance.host}:${instance.port}:`, error);
      
      // Try next instance
      const nextInstance = this.loadBalancer.getNextInstance();
      if (nextInstance && nextInstance.id !== instance.id) {
        this.handleRequest(req, res);
      } else {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('Service Unavailable: All instances failed');
      }
    }
  }

  start(port: number): void {
    this.server.listen(port, () => {
      console.log(`Load balancer listening on port ${port}`);
    });
  }

  stop(): void {
    this.loadBalancer.stopHealthChecks();
    this.server.close();
  }

  addServerInstance(host: string, port: number, weight: number = 1): void {
    this.loadBalancer.addInstance({
      id: `${host}:${port}`,
      host,
      port,
      weight,
      connections: 0
    });
  }

  getStats() {
    return this.loadBalancer.getStats();
  }
}

// Factory function to create load balancer
export function createLoadBalancer(type: 'cluster' | 'reverse-proxy' = 'cluster', config?: Partial<LoadBalancerConfig>) {
  switch (type) {
    case 'cluster':
      return new ClusterLoadBalancer();
    case 'reverse-proxy':
      return new ReverseProxyLoadBalancer(config);
    default:
      throw new Error(`Unknown load balancer type: ${type}`);
  }
}