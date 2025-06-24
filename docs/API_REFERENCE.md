# TrustWrapper Universal Plugin - API Reference

Complete API documentation for the TrustWrapper Universal Verification Plugin.

## Table of Contents

- [Plugin Structure](#plugin-structure)
- [Actions](#actions)
- [Providers](#providers)
- [Evaluators](#evaluators)
- [Types](#types)
- [Configuration](#configuration)
- [Error Handling](#error-handling)

## Plugin Structure

The TrustWrapper plugin exports the following components:

```typescript
export const TrustWrapperPlugin: Plugin = {
  name: 'trustwrapper-universal-verification',
  description: 'Universal AI verification infrastructure',
  actions: [
    verifyTradingDecisionAction,
    verifyPerformanceAction,
    generateComplianceReportAction
  ],
  providers: [trustWrapperProvider],
  evaluators: [trustWrapperEvaluator]
};
```

## Actions

### verifyTradingDecision

Verifies autonomous trading decisions with real-time analysis.

#### Action Details
- **Name**: `VERIFY_TRADING_DECISION`
- **Similes**: `VALIDATE_TRADE`, `CHECK_TRADING_DECISION`, `VERIFY_TRADE_DECISION`
- **Description**: Comprehensive trading decision verification with market data and risk assessment

#### Input Schema

```typescript
interface TradingDecisionActionContent {
  decision: {
    action: 'buy' | 'sell' | 'hold';
    asset: string;
    amount: number;
    price?: number;
    strategy?: string;
    confidence: number; // 0.0 - 1.0
    reasoning?: string;
    timeframe?: string;
    riskTolerance?: 'low' | 'medium' | 'high';
  };
  context?: {
    portfolioValue?: number;
    currentPosition?: number;
    marketConditions?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
}
```

#### Validation Rules

- `decision.action` must be 'buy', 'sell', or 'hold'
- `decision.asset` must be a non-empty string
- `decision.amount` must be a positive number
- `decision.confidence` must be between 0.0 and 1.0

#### Response Format

```typescript
interface VerificationResult {
  trustScore: number;           // 0-100
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
  zkProof?: string;
  verificationId?: string;
  timestamp: number;
}
```

#### Example Usage

```typescript
const request = {
  decision: {
    action: 'buy',
    asset: 'BTC',
    amount: 0.1,
    price: 45000,
    confidence: 0.85,
    strategy: 'momentum',
    reasoning: 'Strong bullish momentum with volume confirmation',
    timeframe: '1d',
    riskTolerance: 'medium'
  },
  context: {
    portfolioValue: 100000,
    currentPosition: 0,
    marketConditions: 'bullish',
    urgency: 'low'
  }
};

// Agent will automatically handle verification and respond with detailed analysis
```

### verifyPerformance

Validates AI agent performance metrics with comprehensive scoring.

#### Action Details
- **Name**: `VERIFY_PERFORMANCE`
- **Similes**: `VALIDATE_PERFORMANCE`, `CHECK_AGENT_PERFORMANCE`, `SKILL_VERIFICATION`
- **Description**: AI agent performance validation with marketplace trust scoring

#### Input Schema

```typescript
interface PerformanceActionContent {
  metrics: {
    accuracy?: number;        // 0.0 - 1.0
    profitFactor?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;     // 0.0 - 1.0
    winRate?: number;         // 0.0 - 1.0
    avgWin?: number;
    avgLoss?: number;
    totalTrades?: number;
    timeframe?: string;
  };
  metadata?: {
    agentType?: string;
    strategy?: string;
    marketConditions?: string;
    testPeriod?: string;
    sampleSize?: number;
    benchmarkComparison?: string;
  };
}
```

#### Validation Rules

- At least one performance metric must be provided
- `accuracy`, `winRate`, `maxDrawdown` must be between 0.0 and 1.0 if provided
- Numeric values must be valid numbers

#### Response Format

```typescript
interface PerformanceResult {
  verified: boolean;
  overallScore: number;       // 0-100
  accuracyScore: number;      // 0-100
  profitabilityScore: number; // 0-100
  riskScore: number;          // 0-100
  consistencyScore: number;   // 0-100
  marketRanking?: string;     // e.g., "Top 15%"
  benchmarkComparison?: string;
  relativePerformance?: string; // e.g., "+15.3%"
  peerRanking?: string;
  recommendations?: string[];
  verificationId?: string;
  timestamp: number;
}
```

#### Scoring Algorithm

- **Accuracy Score**: Direct conversion of accuracy metric (0-100)
- **Profitability Score**: Based on profit factor and Sharpe ratio
- **Risk Score**: Calculated from max drawdown and Sharpe ratio
- **Consistency Score**: Based on win rate and sample size
- **Overall Score**: Weighted average of all component scores

#### Quality Tiers

- **🏆 PLATINUM**: 90+ overall score
- **🥇 GOLD**: 80-89 overall score
- **🥈 SILVER**: 70-79 overall score
- **🥉 BRONZE**: 60-69 overall score
- **📊 STANDARD**: Below 60 overall score

### generateComplianceReport

Generates comprehensive regulatory compliance reports.

#### Action Details
- **Name**: `GENERATE_COMPLIANCE_REPORT`
- **Similes**: `CREATE_COMPLIANCE_REPORT`, `REGULATORY_REPORT`, `AUDIT_REPORT`
- **Description**: Multi-jurisdiction regulatory compliance reporting

#### Input Schema

```typescript
interface ComplianceActionContent {
  requirements: {
    jurisdiction: 'US' | 'EU' | 'UK' | 'SG' | 'JP' | 'global';
    framework: 'SEC' | 'CFTC' | 'MiFID' | 'FCA' | 'MAS' | 'JFSA' | 'custom';
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'adhoc';
    includeAuditTrail?: boolean;
    riskAssessment?: boolean;
    transactionAnalysis?: boolean;
  };
  scope?: {
    startDate?: string;
    endDate?: string;
    agentActivities?: string[];
    transactionTypes?: string[];
    riskCategories?: string[];
  };
  customRequirements?: {
    additionalChecks?: string[];
    reportingStandards?: string[];
    complianceThresholds?: Record<string, number>;
  };
}
```

#### Validation Rules

- `jurisdiction` must be a valid jurisdiction code
- `framework` must be a supported compliance framework
- `reportType` must be a valid report frequency

#### Response Format

```typescript
interface ComplianceResult {
  overallStatus: 'compliant' | 'warning' | 'non-compliant';
  complianceScore: number;    // 0-100
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
  recommendations?: string[];
  timestamp: number;
}
```

#### Supported Jurisdictions & Frameworks

| Jurisdiction | Framework | Description |
|-------------|-----------|-------------|
| US | SEC | Securities and Exchange Commission |
| US | CFTC | Commodity Futures Trading Commission |
| EU | MiFID | Markets in Financial Instruments Directive |
| UK | FCA | Financial Conduct Authority |
| SG | MAS | Monetary Authority of Singapore |
| JP | JFSA | Japan Financial Services Agency |
| Global | custom | Custom compliance frameworks |

## Providers

### trustWrapperProvider

Provides context about agent verification history and trust metrics.

#### Provider Details
- **Name**: `trustwrapper`
- **Description**: Agent verification history and trust metrics for enhanced decision making

#### Context Data

```typescript
interface TrustWrapperProviderData {
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
```

#### Reputation Ranking

- **🏆 PLATINUM AGENT**: 90+ average trust score, 50+ verifications
- **🥇 GOLD AGENT**: 80+ average trust score, 25+ verifications
- **🥈 SILVER AGENT**: 70+ average trust score, 10+ verifications
- **🥉 BRONZE AGENT**: 60+ average trust score, 5+ verifications
- **📊 STANDARD AGENT**: Below thresholds or insufficient data

#### Trust Trend Analysis

```typescript
interface TrustTrend {
  direction: 'improving' | 'stable' | 'declining';
  change: number;           // Points change
  period: string;           // Analysis period
}
```

## Evaluators

### trustWrapperEvaluator

Evaluates agent responses based on verification status and quality metrics.

#### Evaluator Details
- **Name**: `trustwrapper`
- **Description**: Response quality evaluation based on trust metrics and compliance

#### Evaluation Criteria

```typescript
interface TrustWrapperEvaluationCriteria {
  trustScoreWeight: number;     // Default: 0.3
  complianceWeight: number;     // Default: 0.25
  riskWeight: number;           // Default: 0.2
  accuracyWeight: number;       // Default: 0.25
  minimumTrustScore: number;    // Default: 60
  maximumRiskLevel: string;     // Default: 'high'
}
```

#### Evaluation Process

1. **Trust Score Assessment**: Based on latest verification results
2. **Compliance Evaluation**: Regulatory adherence checking
3. **Risk Analysis**: Risk level validation against thresholds
4. **Content Quality**: Response structure and detail analysis
5. **Overall Scoring**: Weighted combination of all factors

#### Quality Scoring

- **🏆 PLATINUM**: 90-100 points
- **🥇 GOLD**: 80-89 points
- **🥈 SILVER**: 70-79 points
- **🥉 BRONZE**: 60-69 points
- **📊 STANDARD**: Below 60 points

## Types

### Core Types

```typescript
// Main plugin export
export interface Plugin {
  name: string;
  description: string;
  actions: Action[];
  providers: Provider[];
  evaluators: Evaluator[];
}

// Configuration
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
```

### Utility Types

```typescript
export type VerificationType = 'trading_decision' | 'performance' | 'compliance';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant';
export type RecommendationLevel = 'approved' | 'warning' | 'rejected';
```

### Error Types

```typescript
export interface TrustWrapperError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}
```

## Configuration

### Configuration Factory

```typescript
export function createTrustWrapperConfig(
  overrides?: Partial<TrustWrapperConfig>
): TrustWrapperConfig
```

Creates a complete configuration with defaults and overrides.

### Configuration Validation

```typescript
export function validateConfig(
  config: TrustWrapperConfig
): { valid: boolean; errors: string[] }
```

Validates configuration and returns any errors.

### Environment Configuration

```typescript
export function getEnvironmentConfig(
  environment: 'development' | 'staging' | 'production'
): Partial<TrustWrapperConfig>
```

Returns environment-specific configuration presets.

### Configuration Presets

```typescript
export const configPresets = {
  lightweight: Partial<TrustWrapperConfig>;    // For testing/development
  enterprise: Partial<TrustWrapperConfig>;     // High-security enterprise
  performance: Partial<TrustWrapperConfig>;    // Performance-optimized
};
```

## Error Handling

### Graceful Degradation

All actions implement graceful degradation:

1. **API Failures**: Return fallback responses with reduced functionality
2. **Network Issues**: Use cached data when available
3. **Configuration Errors**: Log warnings and use defaults
4. **Validation Failures**: Provide clear error messages

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  fallback?: any;
}
```

### Common Error Codes

- `INVALID_INPUT`: Input validation failed
- `API_UNAVAILABLE`: External API service unavailable
- `CONFIGURATION_ERROR`: Invalid configuration detected
- `NETWORK_ERROR`: Network connectivity issues
- `RATE_LIMIT_EXCEEDED`: API rate limits exceeded
- `AUTHENTICATION_FAILED`: Invalid API credentials

### Error Recovery

The plugin implements automatic error recovery:

1. **Retry Logic**: Automatic retries for transient failures
2. **Circuit Breaker**: Temporary service disabling after repeated failures
3. **Fallback Responses**: Meaningful responses even when services fail
4. **Logging**: Comprehensive error logging for debugging

---

## Support

For technical support and questions:
- **GitHub Issues**: https://github.com/lamassu-labs/trustwrapper-eliza-plugin/issues
- **Documentation**: https://trustwrapper.io/docs
- **API Support**: api-support@trustwrapper.io