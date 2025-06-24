/**
 * TrustWrapper Universal Plugin Types
 * 
 * TypeScript definitions for all verification actions, responses, and configurations.
 */

// Core verification request and response types
export interface TradingDecisionRequest {
    decision: {
        action: 'buy' | 'sell' | 'hold';
        asset: string;
        amount: number;
        price: number;
        confidence: number;
        strategy: string;
        reasoning: string;
        timeframe: string;
        riskTolerance: 'low' | 'medium' | 'high';
    };
    context: {
        agentId: string;
        timestamp: number;
        portfolioValue?: number;
        currentPosition?: number;
        marketConditions?: string;
        urgency: 'low' | 'medium' | 'high';
    };
}

export interface VerificationResult {
    trustScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendation: 'approved' | 'warning' | 'rejected';
    reasoning?: string;
    compliance?: {
        status: 'compliant' | 'warning' | 'violation';
        details?: string;
    };
    marketData?: {
        status: 'verified' | 'limited' | 'unavailable';
        price?: number;
        volume?: number;
        volatility?: number;
    };
    blockchainData?: {
        status: 'verified' | 'pending' | 'failed';
        transactionHash?: string;
        confirmations?: number;
    };
    riskAssessment?: string;
    zkProof?: string;
    verificationId?: string;
    timestamp: number;
}

// Performance verification types
export interface PerformanceVerificationRequest {
    agentId: string;
    metrics: {
        accuracy: number;
        profitFactor: number;
        sharpeRatio: number;
        maxDrawdown: number;
        winRate: number;
        avgWin: number;
        avgLoss: number;
        totalTrades: number;
        timeframe: string;
    };
    metadata: {
        agentType: string;
        strategy: string;
        marketConditions: string;
        testPeriod: string;
        sampleSize: number;
        benchmarkComparison: string;
        timestamp: number;
    };
}

export interface PerformanceResult {
    verified: boolean;
    overallScore: number;
    accuracyScore: number;
    profitabilityScore: number;
    riskScore: number;
    consistencyScore: number;
    marketRanking?: string;
    benchmarkComparison?: string;
    relativePerformance?: string;
    peerRanking?: string;
    recommendations?: string[];
    verificationId?: string;
    timestamp: number;
}

// Compliance reporting types
export interface ComplianceReportRequest {
    agentId: string;
    requirements: {
        jurisdiction: 'US' | 'EU' | 'UK' | 'SG' | 'JP' | 'global';
        framework: 'SEC' | 'CFTC' | 'MiFID' | 'FCA' | 'MAS' | 'JFSA' | 'custom';
        reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'adhoc';
        includeAuditTrail: boolean;
        riskAssessment: boolean;
        transactionAnalysis: boolean;
    };
    scope: {
        startDate: string;
        endDate: string;
        agentActivities: string[];
        transactionTypes: string[];
        riskCategories: string[];
    };
    customRequirements: {
        additionalChecks?: string[];
        reportingStandards?: string[];
        complianceThresholds?: Record<string, number>;
    };
    timestamp: number;
}

export interface ComplianceResult {
    overallStatus: 'compliant' | 'warning' | 'non-compliant';
    complianceScore: number;
    reportId?: string;
    regulatoryAdherence: boolean;
    riskManagement?: {
        status: 'compliant' | 'warning' | 'violation';
        details?: string;
    };
    transactionMonitoring?: {
        status: 'active' | 'limited' | 'inactive';
        details?: string;
    };
    auditTrailIntegrity: boolean;
    findings?: Array<{
        category: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
    }>;
    riskAssessment?: {
        overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        operationalRisk: string;
        marketRisk: string;
        complianceRisk: string;
    };
    requirementsStatus?: Array<{
        requirement: string;
        status: 'met' | 'partial' | 'not-met';
        notes?: string;
    }>;
    transactionSummary?: {
        totalTransactions: number;
        flaggedTransactions: number;
        riskEvents: number;
    };
    recommendations?: string[];
    nextReviewDate?: string;
    validityPeriod?: string;
    deliverables?: {
        executiveSummary: boolean;
        detailedAnalysis: boolean;
        auditTrail: boolean;
        riskAssessment: boolean;
    };
    timestamp: number;
}

// Configuration types
export interface TrustWrapperConfig {
    apiEndpoint?: string;
    apiKey?: string;
    enableZkProofs?: boolean;
    enableBlockchainVerification?: boolean;
    enableMarketData?: boolean;
    riskThresholds?: {
        low: number;
        medium: number;
        high: number;
    };
    complianceSettings?: {
        defaultJurisdiction: string;
        defaultFramework: string;
        enableAuditTrail: boolean;
    };
    cacheSettings?: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
    };
}

// Provider and evaluator types
export interface TrustWrapperProviderData {
    trustScore?: number;
    riskLevel?: string;
    lastVerification?: {
        timestamp: number;
        type: string;
        result: any;
    };
    verificationHistory?: Array<{
        timestamp: number;
        type: string;
        trustScore: number;
        result: any;
    }>;
    agentReputation?: {
        score: number;
        rank: string;
        verificationCount: number;
    };
}

export interface TrustWrapperEvaluationCriteria {
    trustScoreWeight: number;
    complianceWeight: number;
    riskWeight: number;
    accuracyWeight: number;
    minimumTrustScore: number;
    maximumRiskLevel: string;
}

// Service types
export interface CachedData<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

export interface MarketDataPoint {
    symbol: string;
    price: number;
    volume: number;
    change24h: number;
    timestamp: number;
}

export interface BlockchainVerificationData {
    network: string;
    status: 'verified' | 'pending' | 'failed';
    transactionHash?: string;
    blockNumber?: number;
    confirmations?: number;
    timestamp: number;
}

// Error types
export interface TrustWrapperError {
    code: string;
    message: string;
    details?: any;
    timestamp: number;
}

// Event types for plugin lifecycle
export interface TrustWrapperEvent {
    type: 'verification_started' | 'verification_completed' | 'verification_failed' | 'config_updated';
    data: any;
    timestamp: number;
}

// Export utility type helpers
export type VerificationType = 'trading_decision' | 'performance' | 'compliance';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant';
export type RecommendationLevel = 'approved' | 'warning' | 'rejected';

// Re-export TrustWrapperConfig for external use
export type { TrustWrapperConfig };