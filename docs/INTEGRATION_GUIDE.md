# TrustWrapper Universal Plugin - Integration Guide

Complete guide for integrating TrustWrapper verification into any Eliza-based AI agent.

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Basic Usage](#basic-usage)
- [Advanced Configuration](#advanced-configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Quick Start

Get TrustWrapper verification running in your Eliza agent in under 5 minutes:

### 1. Install the Plugin

```bash
npm install @trustwrapper/eliza-verification-plugin
```

### 2. Add to Your Agent

```typescript
import { TrustWrapperPlugin } from '@trustwrapper/eliza-verification-plugin';

// Add to your Eliza agent configuration
const agent = new AgentRuntime({
  // ... your existing configuration
  plugins: [
    TrustWrapperPlugin,
    // ... your other plugins
  ]
});
```

### 3. Configure Environment Variables

```bash
# Optional: Configure TrustWrapper settings
export TRUSTWRAPPER_API_KEY="your-api-key"
export TRUSTWRAPPER_ENABLE_ZK_PROOFS="true"
export TRUSTWRAPPER_ENABLE_BLOCKCHAIN="true"
```

### 4. Start Using Verification

```typescript
// Your agent now has access to verification actions:
// - VERIFY_TRADING_DECISION
// - VERIFY_PERFORMANCE  
// - GENERATE_COMPLIANCE_REPORT

// Plus enhanced context through:
// - trustwrapper provider (trust metrics)
// - trustwrapper evaluator (quality scoring)
```

That's it! Your agent now has enterprise-grade verification capabilities.

## Installation

### NPM Installation

```bash
npm install @trustwrapper/eliza-verification-plugin
```

### Yarn Installation

```bash
yarn add @trustwrapper/eliza-verification-plugin
```

### Requirements

- Node.js 18.0.0 or higher
- TypeScript 5.0.0 or higher (for TypeScript projects)
- Eliza framework (any version)

## Configuration

### Environment Variables

TrustWrapper supports configuration through environment variables:

```bash
# API Configuration
TRUSTWRAPPER_API_ENDPOINT="https://api.trustwrapper.io"
TRUSTWRAPPER_API_KEY="your-api-key"

# Feature Flags
TRUSTWRAPPER_ENABLE_ZK_PROOFS="true"
TRUSTWRAPPER_ENABLE_BLOCKCHAIN="true" 
TRUSTWRAPPER_ENABLE_MARKET_DATA="true"

# Risk Thresholds (0-100)
TRUSTWRAPPER_RISK_LOW="30"
TRUSTWRAPPER_RISK_MEDIUM="60"
TRUSTWRAPPER_RISK_HIGH="80"

# Compliance Settings
TRUSTWRAPPER_DEFAULT_JURISDICTION="US"
TRUSTWRAPPER_DEFAULT_FRAMEWORK="SEC"
TRUSTWRAPPER_ENABLE_AUDIT_TRAIL="true"

# Cache Settings
TRUSTWRAPPER_CACHE_ENABLED="true"
TRUSTWRAPPER_CACHE_TTL="300000"  # 5 minutes
TRUSTWRAPPER_CACHE_MAX_SIZE="1000"
```

### Programmatic Configuration

```typescript
import { TrustWrapperPlugin, createTrustWrapperConfig } from '@trustwrapper/eliza-verification-plugin';

// Create custom configuration
const config = createTrustWrapperConfig({
  apiKey: 'your-api-key',
  enableZkProofs: true,
  riskThresholds: {
    low: 25,
    medium: 55,
    high: 85
  },
  complianceSettings: {
    defaultJurisdiction: 'EU',
    defaultFramework: 'MiFID',
    enableAuditTrail: true
  }
});

// The plugin will automatically use this configuration
```

### Configuration Presets

Choose from predefined configurations for common use cases:

```typescript
import { configPresets, createTrustWrapperConfig } from '@trustwrapper/eliza-verification-plugin';

// Lightweight for development/testing
const devConfig = createTrustWrapperConfig(configPresets.lightweight);

// High-security for enterprise
const enterpriseConfig = createTrustWrapperConfig(configPresets.enterprise);

// Performance-optimized
const perfConfig = createTrustWrapperConfig(configPresets.performance);
```

## Basic Usage

### Trading Decision Verification

Verify autonomous trading decisions with real-time market data:

```typescript
// Agent receives trading decision request
const tradingDecision = {
  decision: {
    action: 'buy',
    asset: 'BTC',
    amount: 0.1,
    price: 45000,
    confidence: 0.85,
    strategy: 'momentum',
    reasoning: 'Strong technical indicators with bullish momentum',
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

// The VERIFY_TRADING_DECISION action will automatically:
// 1. Validate the decision parameters
// 2. Assess risk using multiple factors
// 3. Check market data and conditions
// 4. Generate trust score (0-100)
// 5. Provide recommendation (approved/warning/rejected)
// 6. Create zero-knowledge proof (if enabled)
```

### Performance Verification

Validate AI agent performance metrics:

```typescript
const performanceMetrics = {
  metrics: {
    accuracy: 0.92,
    profitFactor: 2.1,
    sharpeRatio: 1.8,
    maxDrawdown: 0.08,
    winRate: 0.74,
    avgWin: 180,
    avgLoss: -85,
    totalTrades: 750,
    timeframe: '180d'
  },
  metadata: {
    agentType: 'trading',
    strategy: 'momentum_scalping',
    marketConditions: 'volatile',
    testPeriod: '6 months',
    sampleSize: 750,
    benchmarkComparison: 'SPY'
  }
};

// The VERIFY_PERFORMANCE action will:
// 1. Calculate individual scores (accuracy, profitability, risk, consistency)
// 2. Determine overall performance score
// 3. Assign quality tier (Platinum/Gold/Silver/Bronze)
// 4. Compare against market benchmarks
// 5. Generate improvement recommendations
```

### Compliance Reporting

Generate regulatory compliance reports:

```typescript
const complianceRequest = {
  requirements: {
    jurisdiction: 'US',
    framework: 'SEC',
    reportType: 'monthly',
    includeAuditTrail: true,
    riskAssessment: true,
    transactionAnalysis: true
  },
  scope: {
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-01-31T23:59:59Z',
    agentActivities: ['trading', 'advisory'],
    transactionTypes: ['equity', 'options'],
    riskCategories: ['market', 'operational']
  }
};

// The GENERATE_COMPLIANCE_REPORT action will:
// 1. Analyze agent activities for compliance
// 2. Check regulatory requirements
// 3. Assess risk management practices
// 4. Generate compliance score
// 5. Provide detailed findings and recommendations
// 6. Create audit trail (if requested)
```

## Advanced Configuration

### Custom Risk Assessment

```typescript
const customConfig = createTrustWrapperConfig({
  riskThresholds: {
    low: 20,      // More conservative
    medium: 50,   // Stricter medium threshold
    high: 75      // Earlier high-risk warning
  },
  complianceSettings: {
    defaultJurisdiction: 'EU',
    defaultFramework: 'MiFID',
    enableAuditTrail: true
  }
});
```

### Multi-Environment Setup

```typescript
import { getEnvironmentConfig, createTrustWrapperConfig } from '@trustwrapper/eliza-verification-plugin';

const environment = process.env.NODE_ENV || 'development';
const envConfig = getEnvironmentConfig(environment as 'development' | 'staging' | 'production');

const config = createTrustWrapperConfig({
  ...envConfig,
  // Override specific settings
  apiKey: process.env.TRUSTWRAPPER_API_KEY
});
```

### Custom Evaluation Criteria

```typescript
// Configure custom evaluation weights in your agent
const agent = new AgentRuntime({
  character: {
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.4,      // Increase trust score importance
          complianceWeight: 0.3,      // High compliance focus
          riskWeight: 0.2,            // Standard risk weighting
          accuracyWeight: 0.1,        // Lower accuracy weight
          minimumTrustScore: 70,      // Higher minimum threshold
          maximumRiskLevel: 'medium'  // Stricter risk tolerance
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});
```

## API Reference

### Actions

#### VERIFY_TRADING_DECISION

Verifies autonomous trading decisions with comprehensive analysis.

**Input Format:**
```typescript
{
  decision: {
    action: 'buy' | 'sell' | 'hold';
    asset: string;
    amount: number;
    price?: number;
    confidence: number; // 0.0 - 1.0
    strategy?: string;
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

**Response includes:**
- Trust score (0-100)
- Risk level assessment
- Recommendation (approved/warning/rejected)
- Market data verification
- Blockchain verification (if enabled)
- Zero-knowledge proof (if enabled)

#### VERIFY_PERFORMANCE

Validates AI agent performance metrics with comprehensive scoring.

**Input Format:**
```typescript
{
  metrics: {
    accuracy?: number;      // 0.0 - 1.0
    profitFactor?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;   // 0.0 - 1.0
    winRate?: number;       // 0.0 - 1.0
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

**Response includes:**
- Overall performance score
- Individual component scores
- Quality tier assignment
- Market ranking
- Improvement recommendations

#### GENERATE_COMPLIANCE_REPORT

Generates comprehensive regulatory compliance reports.

**Input Format:**
```typescript
{
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

**Response includes:**
- Compliance status and score
- Regulatory adherence assessment
- Risk management evaluation
- Detailed findings
- Improvement recommendations

### Provider

The **trustwrapper** provider enriches agent context with:
- Current trust scores and risk levels
- Verification history
- Agent reputation metrics
- Trust trend analysis
- Performance recommendations

### Evaluator

The **trustwrapper** evaluator assesses response quality based on:
- Trust score compliance
- Risk management adherence
- Response accuracy and detail
- Compliance requirements
- Overall marketplace positioning

## Examples

### Enterprise Trading Agent

```typescript
import { TrustWrapperPlugin, createTrustWrapperConfig, configPresets } from '@trustwrapper/eliza-verification-plugin';

// Configure for enterprise trading
const config = createTrustWrapperConfig({
  ...configPresets.enterprise,
  apiKey: process.env.TRUSTWRAPPER_API_KEY,
  complianceSettings: {
    defaultJurisdiction: 'US',
    defaultFramework: 'SEC',
    enableAuditTrail: true
  }
});

const tradingAgent = new AgentRuntime({
  character: {
    name: 'Enterprise Trading Agent',
    description: 'Institutional-grade trading agent with full compliance monitoring',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.3,
          complianceWeight: 0.4,  // High compliance focus
          riskWeight: 0.2,
          accuracyWeight: 0.1,
          minimumTrustScore: 80,  // Enterprise threshold
          maximumRiskLevel: 'medium'
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});
```

### DeFi Yield Optimizer

```typescript
const defiAgent = new AgentRuntime({
  character: {
    name: 'DeFi Yield Optimizer',
    description: 'Automated yield farming with risk management',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.25,
          complianceWeight: 0.15,
          riskWeight: 0.4,        // High risk focus for DeFi
          accuracyWeight: 0.2,
          minimumTrustScore: 70,
          maximumRiskLevel: 'high'  // Allow higher risk for DeFi
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});
```

### Regulatory Compliance Bot

```typescript
const complianceBot = new AgentRuntime({
  character: {
    name: 'Compliance Monitor',
    description: 'Continuous regulatory compliance monitoring',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.2,
          complianceWeight: 0.5,  // Maximum compliance focus
          riskWeight: 0.2,
          accuracyWeight: 0.1,
          minimumTrustScore: 90,  // Very high standard
          maximumRiskLevel: 'low' // Conservative risk tolerance
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});
```

## Troubleshooting

### Common Issues

#### Plugin Not Loading

**Problem:** Plugin doesn't appear in agent actions
**Solution:** 
```typescript
// Ensure correct import and plugin registration
import { TrustWrapperPlugin } from '@trustwrapper/eliza-verification-plugin';

const agent = new AgentRuntime({
  plugins: [TrustWrapperPlugin], // Make sure it's in the plugins array
});
```

#### API Connection Issues

**Problem:** Verification requests fail with network errors
**Solution:**
```bash
# Check API endpoint configuration
export TRUSTWRAPPER_API_ENDPOINT="https://api.trustwrapper.io"
export TRUSTWRAPPER_API_KEY="your-valid-api-key"

# Test connection
curl -H "Authorization: Bearer $TRUSTWRAPPER_API_KEY" $TRUSTWRAPPER_API_ENDPOINT/health
```

#### TypeScript Compilation Errors

**Problem:** Type errors when using the plugin
**Solution:**
```typescript
// Ensure proper type imports
import type { TrustWrapperConfig } from '@trustwrapper/eliza-verification-plugin';

// Use type assertion if needed
const config = createTrustWrapperConfig({
  // ... configuration
} as Partial<TrustWrapperConfig>);
```

#### Configuration Validation Errors

**Problem:** Invalid configuration causing startup failures
**Solution:**
```typescript
import { validateConfig, createTrustWrapperConfig } from '@trustwrapper/eliza-verification-plugin';

const config = createTrustWrapperConfig({
  // your configuration
});

const validation = validateConfig(config);
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
  // Fix configuration based on error messages
}
```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
export DEBUG="trustwrapper:*"
export TRUSTWRAPPER_LOG_LEVEL="debug"
```

### Performance Issues

If experiencing slow verification responses:

```typescript
// Use performance preset
const config = createTrustWrapperConfig({
  ...configPresets.performance,
  cacheSettings: {
    enabled: true,
    ttl: 600000,  // 10 minutes
    maxSize: 2000 // Larger cache
  }
});
```

### Support

For additional support:
- **Documentation**: https://trustwrapper.io/docs
- **GitHub Issues**: https://github.com/lamassu-labs/trustwrapper-eliza-plugin/issues
- **Discord**: https://discord.gg/trustwrapper
- **Email**: support@trustwrapper.io

---

## Next Steps

After integration:
1. **Test verification actions** with sample data
2. **Configure compliance requirements** for your jurisdiction
3. **Set up monitoring** for trust scores and performance
4. **Customize evaluation criteria** for your use case
5. **Enable advanced features** like ZK proofs and blockchain verification

Happy building with TrustWrapper! 🛡️