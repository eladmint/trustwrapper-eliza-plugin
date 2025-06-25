/**
 * TrustWrapper v2.0 Local Verification Engine
 * 
 * Secure, local-only verification system that eliminates the critical
 * vulnerabilities of v1.0 by running all verification logic locally
 * without any external API dependencies.
 */

import { createHash } from 'crypto';
import { 
  TradingDecision, 
  VerificationResult, 
  VerificationContext,
  RiskLevel,
  SignedVerificationResult,
  LocalVerificationConfig,
  RiskAssessment,
  PatternDetection,
  ComplianceResult,
  VerificationStatistics
} from '../types';
import { RiskAnalyzer } from './RiskAnalyzer';
import { PatternDetector } from './PatternDetector';
import { ComplianceChecker } from './ComplianceChecker';
import { CryptographicProvider } from './CryptographicProvider';

export class LocalVerificationEngine {
  private readonly riskAnalyzer: RiskAnalyzer;
  private readonly patternDetector: PatternDetector;
  private readonly complianceChecker: ComplianceChecker;
  private readonly cryptoProvider: CryptographicProvider;
  private readonly config: LocalVerificationConfig;
  private readonly startTime: number;

  constructor(config: LocalVerificationConfig) {
    this.config = this.validateConfig(config);
    this.riskAnalyzer = new RiskAnalyzer(config.riskRules);
    this.patternDetector = new PatternDetector(config.patternRules);
    this.complianceChecker = new ComplianceChecker(config.complianceRules);
    this.cryptoProvider = new CryptographicProvider();
    this.startTime = Date.now();
  }

  /**
   * Main verification method - completely local, no external calls
   */
  async verifyTradingDecision(
    decision: TradingDecision,
    context: VerificationContext = {}
  ): Promise<SignedVerificationResult> {
    
    const startTime = performance.now();
    
    try {
      // 1. Input validation and sanitization
      this.validateInput(decision);
      const sanitizedDecision = this.sanitizeDecision(decision);
      
      // 2. Parallel analysis for performance
      const [riskAssessment, patterns, compliance] = await Promise.all([
        this.riskAnalyzer.analyze(sanitizedDecision, context),
        this.patternDetector.detect(sanitizedDecision, context),
        this.complianceChecker.check(sanitizedDecision, context)
      ]);
      
      // 3. Aggregate results
      const result = this.aggregateResults(
        sanitizedDecision,
        riskAssessment,
        patterns,
        compliance,
        context
      );
      
      // 4. Performance validation
      const processingTime = performance.now() - startTime;
      if (processingTime > this.config.maxLatencyMs) {
        console.warn(`Verification exceeded target latency: ${processingTime}ms`);
      }
      
      // 5. Cryptographic signing for integrity
      const signature = await this.cryptoProvider.signResult(result);
      
      // 6. Create signed result
      const signedResult: SignedVerificationResult = {
        ...result,
        signature,
        nonce: this.cryptoProvider.generateNonce(),
        processingTimeMs: processingTime,
        version: '2.0.0',
        verificationId: this.generateVerificationId(decision, result)
      };
      
      // 7. Optional audit logging (local only)
      if (this.config.auditEnabled) {
        await this.auditVerification(decision, signedResult, context);
      }
      
      return signedResult;
      
    } catch (error) {
      // Secure error handling - no sensitive data in errors
      throw new Error(`Verification failed: ${this.sanitizeError(error)}`);
    }
  }

  /**
   * Batch verification for improved performance
   */
  async verifyBatch(
    decisions: TradingDecision[],
    context: VerificationContext = {}
  ): Promise<SignedVerificationResult[]> {
    
    if (decisions.length === 0) return [];
    
    if (decisions.length > this.config.maxBatchSize) {
      throw new Error(`Batch size ${decisions.length} exceeds maximum ${this.config.maxBatchSize}`);
    }
    
    // Process in parallel for better performance
    const verificationPromises = decisions.map(decision => 
      this.verifyTradingDecision(decision, context)
    );
    
    return await Promise.all(verificationPromises);
  }

  /**
   * Update verification rules at runtime
   */
  updateRules(newRules: Partial<LocalVerificationConfig>): void {
    if (newRules.riskRules) {
      this.riskAnalyzer.updateRules(newRules.riskRules);
    }
    
    if (newRules.patternRules) {
      this.patternDetector.updateRules(newRules.patternRules);
    }
    
    if (newRules.complianceRules) {
      this.complianceChecker.updateRules(newRules.complianceRules);
    }
  }

  /**
   * Get verification engine statistics
   */
  getStatistics(): VerificationStatistics {
    return {
      version: '2.0.0',
      uptime: Date.now() - this.startTime,
      totalVerifications: this.riskAnalyzer.getVerificationCount(),
      averageLatency: this.riskAnalyzer.getAverageLatency(),
      successRate: this.riskAnalyzer.getSuccessRate(),
      riskDistribution: this.riskAnalyzer.getRiskDistribution(),
      memoryUsage: process.memoryUsage(),
      configHash: this.getConfigHash()
    };
  }

  private validateInput(decision: TradingDecision): void {
    if (!decision.action || !decision.asset) {
      throw new Error('Missing required fields: action and asset');
    }
    
    if (decision.amount !== undefined && decision.amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    if (decision.leverage !== undefined && decision.leverage <= 0) {
      throw new Error('Leverage must be positive');
    }
    
    // Additional validation based on config
    if (this.config.strictMode) {
      this.performStrictValidation(decision);
    }
  }

  private sanitizeDecision(decision: TradingDecision): TradingDecision {
    return {
      action: decision.action.toLowerCase().trim(),
      asset: decision.asset.toUpperCase().trim(),
      amount: decision.amount,
      price: decision.price,
      leverage: decision.leverage,
      reasoning: decision.reasoning?.trim().substring(0, 1000), // Limit reasoning length
      strategy: decision.strategy?.trim().substring(0, 500),
      timeframe: decision.timeframe,
      confidence: decision.confidence ? Math.max(0, Math.min(100, decision.confidence)) : undefined,
      metadata: decision.metadata ? this.sanitizeMetadata(decision.metadata) : undefined
    };
  }

  private aggregateResults(
    decision: TradingDecision,
    riskAssessment: RiskAssessment,
    patterns: PatternDetection,
    compliance: ComplianceResult,
    context: VerificationContext
  ): VerificationResult {
    
    const warnings: string[] = [];
    let trustScore = 100;
    
    // Risk assessment impact
    trustScore -= riskAssessment.score;
    warnings.push(...riskAssessment.warnings);
    
    // Pattern detection impact
    trustScore -= patterns.riskScore;
    warnings.push(...patterns.warnings);
    
    // Compliance impact
    if (!compliance.compliant) {
      trustScore -= 20;
      warnings.push(...compliance.violations);
    }
    
    // Confidence impact
    if (decision.confidence && decision.confidence < 70) {
      const confidencePenalty = (70 - decision.confidence) / 2;
      trustScore -= confidencePenalty;
      warnings.push(`Low AI confidence: ${decision.confidence}%`);
    }
    
    // Context-based adjustments
    if (context.historicalPerformance && context.historicalPerformance < 0.5) {
      trustScore -= 10;
      warnings.push('Poor historical performance detected');
    }
    
    // Ensure trust score bounds
    trustScore = Math.max(0, Math.min(100, trustScore));
    
    // Determine risk level
    const riskLevel = this.calculateRiskLevel(trustScore, riskAssessment, patterns);
    
    // Determine recommendation
    const recommendation = this.getRecommendation(riskLevel, trustScore);
    
    return {
      verified: recommendation !== 'rejected',
      trustScore,
      riskLevel,
      warnings: warnings.slice(0, 20), // Limit warnings
      recommendation,
      timestamp: new Date().toISOString(),
      details: {
        riskAssessment: this.sanitizeRiskAssessment(riskAssessment),
        patterns: this.sanitizePatterns(patterns),
        compliance: this.sanitizeCompliance(compliance),
        verificationMethod: 'local-v2',
        processingComponents: ['risk', 'pattern', 'compliance'],
        configVersion: this.config.version || '2.0.0'
      }
    };
  }

  private calculateRiskLevel(
    trustScore: number,
    riskAssessment: RiskAssessment,
    patterns: PatternDetection
  ): RiskLevel {
    
    // Multiple factors determine risk level
    if (trustScore < 30 || riskAssessment.severity === 'critical' || patterns.severity === 'critical') {
      return 'critical';
    }
    
    if (trustScore < 50 || riskAssessment.severity === 'high' || patterns.severity === 'high') {
      return 'high';
    }
    
    if (trustScore < 70 || riskAssessment.severity === 'medium' || patterns.severity === 'medium') {
      return 'medium';
    }
    
    return 'low';
  }

  private getRecommendation(riskLevel: RiskLevel, trustScore: number): 'approved' | 'warning' | 'rejected' {
    if (riskLevel === 'critical' || trustScore < 20) {
      return 'rejected';
    }
    
    if (riskLevel === 'high' || trustScore < 50) {
      return 'warning';
    }
    
    return 'approved';
  }

  private generateVerificationId(decision: TradingDecision, result: VerificationResult): string {
    const data = {
      action: decision.action,
      asset: decision.asset,
      timestamp: result.timestamp,
      trustScore: result.trustScore,
      riskLevel: result.riskLevel
    };
    
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
  }

  private async auditVerification(
    decision: TradingDecision,
    result: SignedVerificationResult,
    context: VerificationContext
  ): Promise<void> {
    
    const auditEntry = {
      timestamp: new Date().toISOString(),
      verificationId: result.verificationId,
      action: decision.action,
      asset: decision.asset,
      trustScore: result.trustScore,
      riskLevel: result.riskLevel,
      recommendation: result.recommendation,
      processingTime: result.processingTimeMs,
      warningCount: result.warnings.length,
      contextPresent: Object.keys(context).length > 0,
      configHash: this.getConfigHash()
    };
    
    // Local audit logging only - never transmitted externally
    console.log('[AUDIT]', JSON.stringify(auditEntry));
  }

  private validateConfig(config: LocalVerificationConfig): LocalVerificationConfig {
    const defaults: Partial<LocalVerificationConfig> = {
      maxLatencyMs: 10,
      maxBatchSize: 100,
      strictMode: true,
      auditEnabled: false,
      version: '2.0.0'
    };
    
    return { ...defaults, ...config };
  }

  private performStrictValidation(decision: TradingDecision): void {
    // Additional strict mode validations
    if (decision.action && !['buy', 'sell', 'hold'].includes(decision.action.toLowerCase())) {
      throw new Error(`Invalid action: ${decision.action}`);
    }
    
    if (decision.leverage && decision.leverage > 100) {
      throw new Error('Leverage exceeds maximum allowed');
    }
    
    if (decision.amount && decision.amount > 1000000) {
      throw new Error('Amount exceeds maximum allowed');
    }
  }

  private sanitizeMetadata(metadata: any): any {
    // Remove potentially sensitive metadata
    const safe = { ...metadata };
    delete safe.privateKey;
    delete safe.seedPhrase;
    delete safe.password;
    delete safe.apiKey;
    
    return safe;
  }

  private sanitizeError(error: any): string {
    if (error instanceof Error) {
      return error.message.replace(/[a-f0-9]{32,}/gi, '[REDACTED]'); // Remove potential keys
    }
    return 'Unknown error';
  }

  private sanitizeRiskAssessment(assessment: RiskAssessment): any {
    return {
      score: assessment.score,
      severity: assessment.severity,
      warningCount: assessment.warnings.length,
      checksPerformed: assessment.details.checksPerformed
    };
  }

  private sanitizePatterns(patterns: PatternDetection): any {
    return {
      riskScore: patterns.riskScore,
      severity: patterns.severity,
      patternsFound: patterns.suspiciousPatterns.length,
      warningCount: patterns.warnings.length
    };
  }

  private sanitizeCompliance(compliance: ComplianceResult): any {
    return {
      compliant: compliance.compliant,
      violationCount: compliance.violations.length,
      jurisdictions: compliance.jurisdictions,
      framework: compliance.framework
    };
  }

  private getConfigHash(): string {
    return createHash('sha256')
      .update(JSON.stringify(this.config))
      .digest('hex')
      .substring(0, 8);
  }
}

// Type definitions
interface RiskAssessment {
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  details: {
    checksPerformed: string[];
    patternsFound: number;
    timestamp: number;
  };
}

interface PatternDetection {
  riskScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suspiciousPatterns: string[];
  warnings: string[];
  confidence: number;
}

interface ComplianceResult {
  compliant: boolean;
  violations: string[];
  jurisdictions: string[];
  framework: string;
  score: number;
}

interface VerificationStatistics {
  version: string;
  uptime: number;
  totalVerifications: number;
  averageLatency: number;
  successRate: number;
  riskDistribution: { [key in RiskLevel]: number };
  memoryUsage: NodeJS.MemoryUsage;
  configHash: string;
}