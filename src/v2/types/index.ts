/**
 * TrustWrapper v2.0 Type Definitions
 * 
 * Comprehensive type system for the secure local-first verification architecture
 */

// Core verification types
export interface TradingDecision {
  action: string;
  asset: string;
  amount?: number;
  price?: number;
  leverage?: number;
  reasoning?: string;
  strategy?: string;
  timeframe?: number; // minutes
  confidence?: number; // 0-100
  stopLoss?: number;
  takeProfit?: number;
  portfolioSize?: number;
  metadata?: { [key: string]: any };
}

export interface VerificationResult {
  verified: boolean;
  trustScore: number; // 0-100
  riskLevel: RiskLevel;
  warnings: string[];
  recommendation: 'approved' | 'warning' | 'rejected';
  timestamp: string;
  details: {
    riskAssessment?: any;
    patterns?: any;
    compliance?: any;
    verificationMethod: string;
    processingComponents: string[];
    configVersion: string;
  };
}

export interface SignedVerificationResult extends VerificationResult {
  signature: Signature;
  nonce: string;
  processingTimeMs: number;
  version: string;
  verificationId: string;
}

export interface VerificationContext {
  agentId?: string;
  jurisdiction?: string;
  marketData?: MarketData;
  historicalPerformance?: number; // 0-1
  marketConditions?: 'bull_market' | 'bear_market' | 'high_volatility' | 'stable';
  timestamp?: number;
  hasInsiderInformation?: boolean;
  hasConflictOfInterest?: boolean;
  recentTradeCount?: number;
  marketCapInfluence?: number;
  [key: string]: any;
}

export interface LocalVerificationConfig {
  maxLatencyMs: number;
  maxBatchSize: number;
  strictMode: boolean;
  auditEnabled: boolean;
  version: string;
  riskRules: RiskRules;
  patternRules: PatternRules;
  complianceRules: ComplianceRules;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Market data types
export interface MarketData {
  price?: number;
  volume?: number;
  volatility?: number;
  marketCap?: number;
  liquidity?: number;
  bidSpread?: number;
  timestamp: number;
}

// Cryptographic types
export interface Signature {
  algorithm: string;
  signature: string;
  publicKey: string;
  timestamp: number;
}

export interface CryptographicConfig {
  keySize: number;
  hashAlgorithm: 'blake3' | 'sha256' | 'sha3-256';
  signatureAlgorithm: 'ed25519' | 'rsa-pss' | 'ecdsa';
  nonceSize: number;
  enableTimestampValidation: boolean;
  maxTimestampAge: number;
}

// Risk analysis types
export interface RiskRules {
  scamPatterns: string[];
  riskTokens: string[];
  suspiciousActions: string[];
  maxAmount: number;
  maxLeverage: number;
  leverageThresholds: { [key: string]: number };
  volatilityThresholds: { [key: string]: number };
}

export interface RiskAssessment {
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  details: {
    checksPerformed: string[];
    patternsFound: number;
    timestamp: number;
    breakdown: RiskBreakdown;
  };
}

export interface RiskBreakdown {
  scamPatternScore: number;
  tokenRiskScore: number;
  amountRiskScore: number;
  leverageRiskScore: number;
  actionRiskScore: number;
  volatilityRiskScore: number;
  contextRiskScore: number;
}

// Pattern detection types
export interface PatternRules {
  suspiciousReasoningPatterns: PatternDefinition[];
  strategyPatterns: PatternDefinition[];
  behavioralPatterns: PatternDefinition[];
  confidenceThresholds: ConfidenceThresholds;
  temporalPatterns: TemporalPattern[];
}

export interface PatternDefinition {
  name: string;
  pattern: RegExp;
  riskScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  category: 'scam' | 'manipulation' | 'emotion' | 'hype' | 'technical' | 'behavioral';
}

export interface ConfidenceThresholds {
  minimum: number;
  warning: number;
  critical: number;
}

export interface TemporalPattern {
  name: string;
  timeWindow: number;
  maxFrequency: number;
  riskScore: number;
}

export interface PatternDetection {
  riskScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suspiciousPatterns: DetectedPattern[];
  warnings: string[];
  confidence: number;
  details: {
    totalPatternsChecked: number;
    patternsFound: number;
    categoryBreakdown: { [category: string]: number };
    processingTime: number;
  };
}

export interface DetectedPattern {
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  description: string;
  matchedText?: string;
  confidence: number;
}

// Compliance types
export interface ComplianceRules {
  jurisdictions: string[];
  frameworks: ComplianceFramework[];
  restrictedAssets: { [jurisdiction: string]: string[] };
  tradingRestrictions: TradingRestriction[];
  reportingRequirements: ReportingRequirement[];
  riskLimits: RiskLimit[];
}

export interface ComplianceFramework {
  name: string;
  jurisdiction: string;
  rules: FrameworkRule[];
  enabled: boolean;
}

export interface FrameworkRule {
  id: string;
  description: string;
  ruleType: 'asset_restriction' | 'position_limit' | 'leverage_limit' | 'reporting' | 'disclosure';
  severity: 'warning' | 'violation' | 'critical';
  parameters: { [key: string]: any };
}

export interface TradingRestriction {
  jurisdiction: string;
  assetType: string;
  restriction: 'prohibited' | 'licensed_only' | 'accredited_only' | 'limited';
  maxAmount?: number;
  maxLeverage?: number;
  requiresDisclosure: boolean;
}

export interface ReportingRequirement {
  jurisdiction: string;
  threshold: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  reportType: 'position' | 'transaction' | 'pnl' | 'risk';
}

export interface RiskLimit {
  jurisdiction: string;
  limitType: 'position_size' | 'leverage' | 'concentration' | 'volatility';
  maxValue: number;
  enforcement: 'advisory' | 'mandatory';
}

export interface ComplianceResult {
  compliant: boolean;
  violations: string[];
  warnings: string[];
  jurisdictions: string[];
  framework: string;
  score: number;
  details: {
    rulesChecked: number;
    violationsFound: number;
    warningsIssued: number;
    applicableFrameworks: string[];
    reportingRequired: boolean;
    restrictionsApplied: string[];
  };
}

// Zero-knowledge proof types
export interface ZKProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  publicInputs: PublicInputs;
  metadata: {
    version: string;
    timestamp: number;
    circuit: string;
    prover: string;
  };
}

export interface PublicInputs {
  trustScore: number;
  riskLevel: number;
  verified: number;
  timestamp: number;
  verifierVersion: number;
  rulesetHash: number;
}

export interface PrivateInputs {
  asset: bigint;
  amount: bigint;
  action: bigint;
  reasoning: bigint;
  strategy: bigint;
  leverage: bigint;
  timeframe: bigint;
  confidence: bigint;
}

export interface CircuitParameters {
  constraints: number;
  variables: number;
  publicInputCount: number;
  privateInputCount: number;
}

export interface VerificationAttestation {
  zkProof: ZKProof;
  attestation: {
    agentId: string;
    trustScore: number;
    riskLevel: RiskLevel;
    timestamp: number;
    verifierVersion: string;
  };
  signature: Signature;
}

// Migration types
export interface V1Config {
  apiUrl?: string;
  apiKey?: string;
  rules?: any;
  privacyMode?: string;
  strictMode?: boolean;
  complianceMode?: boolean;
  batchSize?: number;
  version?: string;
  jurisdictions?: string[];
  frameworks?: string[];
  auditLevel?: string;
}

export interface V2Config {
  localVerification: boolean;
  externalApiEnabled: boolean;
  zkProofEnabled: boolean;
  strictMode: boolean;
  verificationRules: any;
  auditMode: 'none' | 'basic' | 'detailed';
  auditLocal: boolean;
  auditRemote: boolean;
  maxLatency: number;
  batchSize: number;
  cacheEnabled: boolean;
  migratedFrom?: string;
  migrationDate?: string;
  migrationVersion?: string;
}

export interface MigrationIssue {
  type: 'package_version' | 'api_call' | 'configuration' | 'dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line?: number;
  message: string;
  autofix: boolean;
}

export interface MigrationReport {
  totalIssues: number;
  criticalIssues: number;
  issues: MigrationIssue[];
  migrationComplexity: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
}

export interface MigrationOptions {
  createBackup: boolean;
  updateTests: boolean;
  updateDocs: boolean;
  validateMigration: boolean;
  preserveComments: boolean;
}

export interface MigrationResult {
  success: boolean;
  issues: MigrationIssue[];
  warnings: string[];
  migrationTime: number;
  filesModified: string[];
}

// Statistics and monitoring types
export interface VerificationStatistics {
  version: string;
  uptime: number;
  totalVerifications: number;
  averageLatency: number;
  successRate: number;
  riskDistribution: { [key in RiskLevel]: number };
  memoryUsage: NodeJS.MemoryUsage;
  configHash: string;
}

export interface PerformanceMetrics {
  latency: {
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: {
    verificationsPerSecond: number;
    batchesPerSecond: number;
    peakThroughput: number;
  };
  errors: {
    validationErrors: number;
    cryptographicErrors: number;
    configurationErrors: number;
    systemErrors: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

// Plugin integration types
export interface TrustWrapperPlugin {
  version: string;
  verificationEngine: LocalVerificationEngine;
  zkProofGenerator?: ZKProofGenerator;
  migrationDetector?: MigrationDetector;
  statistics: VerificationStatistics;
}

export interface PluginConfig {
  mode: 'local-first' | 'hybrid' | 'legacy';
  privacyMode: 'maximum' | 'balanced' | 'minimal';
  localVerification: {
    enabled: boolean;
    strictMode: boolean;
    maxLatency: number;
  };
  apiConfig?: {
    enabled: boolean;
    postTradeOnly: boolean;
    apiUrl?: string;
    apiKey?: string;
  };
  zkConfig?: {
    enabled: boolean;
    circuit: string;
    provingKey: string;
    verifyingKey: string;
  };
}

// Error types
export interface TrustWrapperError extends Error {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: { [key: string]: any };
  timestamp: number;
}

export class ValidationError extends Error implements TrustWrapperError {
  code = 'VALIDATION_ERROR';
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  context?: { [key: string]: any };
  timestamp = Date.now();
}

export class CryptographicError extends Error implements TrustWrapperError {
  code = 'CRYPTOGRAPHIC_ERROR';
  severity: 'low' | 'medium' | 'high' | 'critical' = 'high';
  context?: { [key: string]: any };
  timestamp = Date.now();
}

export class ConfigurationError extends Error implements TrustWrapperError {
  code = 'CONFIGURATION_ERROR';
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  context?: { [key: string]: any };
  timestamp = Date.now();
}

// Re-export from core implementations
export { LocalVerificationEngine } from '../core/LocalVerificationEngine';
export { RiskAnalyzer } from '../core/RiskAnalyzer';
export { PatternDetector } from '../core/PatternDetector';
export { ComplianceChecker } from '../core/ComplianceChecker';
export { CryptographicProvider } from '../core/CryptographicProvider';

// Security validation types
export interface SecurityValidationResult {
  version: string;
  architecture: string;
  vulnerabilities: string[];
  securityLevel: string;
  recommendations: string[];
  lastAudit: string;
  passed: boolean;
}

// Forward declarations for components to be implemented
export interface ZKProofGenerator {
  generateProof(decision: TradingDecision, verification: VerificationResult): Promise<ZKProof>;
  verifyProof(proof: ZKProof): Promise<boolean>;
  generateCircuit(verificationLogic: any): any;
}

export interface MigrationDetector {
  detectV1Usage(codebase: string[]): MigrationReport;
  migrateConfig(v1Config: V1Config): V2Config;
  migrateCodebase(projectPath: string, options?: MigrationOptions): Promise<MigrationResult>;
}