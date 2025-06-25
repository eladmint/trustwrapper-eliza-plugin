/**
 * TrustWrapper v2.0 Performance Monitor
 * 
 * Real-time performance monitoring and metrics collection for the
 * local verification engine.
 */

import { PerformanceMetrics } from '../types';

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number;
  private verificationTimes: number[] = [];
  private maxSamples: number = 1000;

  constructor() {
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Record verification timing
   */
  recordVerification(duration: number, success: boolean): void {
    // Update latency metrics
    this.verificationTimes.push(duration);
    if (this.verificationTimes.length > this.maxSamples) {
      this.verificationTimes.shift();
    }

    this.updateLatencyMetrics();
    
    // Update throughput
    this.updateThroughputMetrics();
    
    // Update error metrics
    if (!success) {
      this.metrics.errors.validationErrors++;
    }
  }

  /**
   * Record batch verification
   */
  recordBatch(batchSize: number, duration: number, successes: number): void {
    const verificationsPerSecond = batchSize / (duration / 1000);
    this.metrics.throughput.batchesPerSecond = this.calculateEWMA(
      this.metrics.throughput.batchesPerSecond,
      1 / (duration / 1000),
      0.1
    );

    this.metrics.throughput.verificationsPerSecond = this.calculateEWMA(
      this.metrics.throughput.verificationsPerSecond,
      verificationsPerSecond,
      0.1
    );

    if (verificationsPerSecond > this.metrics.throughput.peakThroughput) {
      this.metrics.throughput.peakThroughput = verificationsPerSecond;
    }

    // Record errors
    const errors = batchSize - successes;
    this.metrics.errors.validationErrors += errors;
  }

  /**
   * Record cryptographic operation
   */
  recordCryptographicOperation(duration: number, success: boolean): void {
    if (!success) {
      this.metrics.errors.cryptographicErrors++;
    }
  }

  /**
   * Record configuration error
   */
  recordConfigurationError(): void {
    this.metrics.errors.configurationErrors++;
  }

  /**
   * Record system error
   */
  recordSystemError(): void {
    this.metrics.errors.systemErrors++;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    this.updateMemoryMetrics();
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  getSummary(): PerformanceSummary {
    const currentMetrics = this.getMetrics();
    const uptime = Date.now() - this.startTime;
    
    return {
      uptime,
      averageLatency: currentMetrics.latency.avg,
      currentThroughput: currentMetrics.throughput.verificationsPerSecond,
      peakThroughput: currentMetrics.throughput.peakThroughput,
      errorRate: this.calculateErrorRate(currentMetrics.errors),
      memoryUsage: currentMetrics.memory.heapUsed,
      status: this.getHealthStatus(currentMetrics)
    };
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.verificationTimes = [];
    this.startTime = Date.now();
  }

  /**
   * Check if performance is within acceptable bounds
   */
  isPerformanceHealthy(): boolean {
    const summary = this.getSummary();
    return (
      summary.averageLatency < 50 && // < 50ms
      summary.errorRate < 0.05 && // < 5% error rate
      summary.memoryUsage < 100 * 1024 * 1024 // < 100MB
    );
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      latency: {
        min: Infinity,
        max: 0,
        avg: 0,
        p95: 0,
        p99: 0
      },
      throughput: {
        verificationsPerSecond: 0,
        batchesPerSecond: 0,
        peakThroughput: 0
      },
      errors: {
        validationErrors: 0,
        cryptographicErrors: 0,
        configurationErrors: 0,
        systemErrors: 0
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      }
    };
  }

  private updateLatencyMetrics(): void {
    if (this.verificationTimes.length === 0) return;

    const sorted = [...this.verificationTimes].sort((a, b) => a - b);
    
    this.metrics.latency.min = Math.min(this.metrics.latency.min, sorted[0]);
    this.metrics.latency.max = Math.max(this.metrics.latency.max, sorted[sorted.length - 1]);
    
    // Calculate average
    this.metrics.latency.avg = sorted.reduce((sum, time) => sum + time, 0) / sorted.length;
    
    // Calculate percentiles
    this.metrics.latency.p95 = this.calculatePercentile(sorted, 0.95);
    this.metrics.latency.p99 = this.calculatePercentile(sorted, 0.99);
  }

  private updateThroughputMetrics(): void {
    const recentDuration = 5000; // 5 seconds
    const recentTimes = this.verificationTimes.filter(
      (_, index) => index >= this.verificationTimes.length - 100
    );
    
    if (recentTimes.length > 1) {
      const verificationsPerSecond = recentTimes.length / (recentDuration / 1000);
      this.metrics.throughput.verificationsPerSecond = this.calculateEWMA(
        this.metrics.throughput.verificationsPerSecond,
        verificationsPerSecond,
        0.1
      );

      if (verificationsPerSecond > this.metrics.throughput.peakThroughput) {
        this.metrics.throughput.peakThroughput = verificationsPerSecond;
      }
    }
  }

  private updateMemoryMetrics(): void {
    const memUsage = process.memoryUsage();
    this.metrics.memory = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    };
  }

  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateEWMA(current: number, newValue: number, alpha: number): number {
    return alpha * newValue + (1 - alpha) * current;
  }

  private calculateErrorRate(errors: PerformanceMetrics['errors']): number {
    const totalErrors = errors.validationErrors + 
                       errors.cryptographicErrors + 
                       errors.configurationErrors + 
                       errors.systemErrors;
    
    const totalOperations = this.verificationTimes.length + totalErrors;
    return totalOperations > 0 ? totalErrors / totalOperations : 0;
  }

  private getHealthStatus(metrics: PerformanceMetrics): 'healthy' | 'warning' | 'critical' {
    const errorRate = this.calculateErrorRate(metrics.errors);
    
    if (metrics.latency.avg > 100 || errorRate > 0.1) {
      return 'critical';
    }
    
    if (metrics.latency.avg > 50 || errorRate > 0.05) {
      return 'warning';
    }
    
    return 'healthy';
  }
}

interface PerformanceSummary {
  uptime: number;
  averageLatency: number;
  currentThroughput: number;
  peakThroughput: number;
  errorRate: number;
  memoryUsage: number;
  status: 'healthy' | 'warning' | 'critical';
}

// Global performance monitor instance
let globalMonitor: PerformanceMonitor | null = null;

export function getGlobalPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor();
  }
  return globalMonitor;
}

export function resetGlobalPerformanceMonitor(): void {
  globalMonitor = new PerformanceMonitor();
}