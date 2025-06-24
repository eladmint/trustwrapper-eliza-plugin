# TrustWrapper Universal Plugin - Examples

Real-world examples and use cases for the TrustWrapper Universal Verification Plugin.

## Table of Contents

- [Quick Start Examples](#quick-start-examples)
- [Trading Agents](#trading-agents)
- [DeFi Applications](#defi-applications)
- [Compliance Monitoring](#compliance-monitoring)
- [Custom Configurations](#custom-configurations)
- [Integration Patterns](#integration-patterns)

## Quick Start Examples

### Basic Trading Agent

```typescript
import { TrustWrapperPlugin } from '@trustwrapper/eliza-verification-plugin';
import { AgentRuntime } from '@ai16z/eliza';

// Create a basic trading agent with TrustWrapper verification
const tradingAgent = new AgentRuntime({
  character: {
    name: 'Trading Assistant',
    description: 'AI trading assistant with verification capabilities'
  },
  plugins: [TrustWrapperPlugin]
});

// Example trading decision verification
const verifyTrade = async () => {
  const message = {
    content: {
      text: JSON.stringify({
        decision: {
          action: 'buy',
          asset: 'ETH',
          amount: 2.5,
          price: 3200,
          confidence: 0.88,
          strategy: 'breakout',
          reasoning: 'Strong breakout pattern with high volume confirmation',
          timeframe: '4h',
          riskTolerance: 'medium'
        },
        context: {
          portfolioValue: 50000,
          currentPosition: 0,
          marketConditions: 'bullish',
          urgency: 'medium'
        }
      })
    }
  };
  
  // The agent will automatically verify and respond
  return await tradingAgent.processMessage(message);
};
```

### Performance Validation

```typescript
const validatePerformance = async () => {
  const performanceData = {
    metrics: {
      accuracy: 0.87,
      profitFactor: 1.9,
      sharpeRatio: 1.4,
      maxDrawdown: 0.12,
      winRate: 0.68,
      avgWin: 180,
      avgLoss: -85,
      totalTrades: 320,
      timeframe: '90d'
    },
    metadata: {
      agentType: 'trading',
      strategy: 'momentum_scalping',
      marketConditions: 'volatile',
      testPeriod: '3 months',
      sampleSize: 320,
      benchmarkComparison: 'SPY'
    }
  };

  const message = {
    content: { text: JSON.stringify(performanceData) }
  };

  return await tradingAgent.processMessage(message);
};
```

## Trading Agents

### Momentum Trading Bot

```typescript
import { TrustWrapperPlugin, createTrustWrapperConfig } from '@trustwrapper/eliza-verification-plugin';

const momentumBot = new AgentRuntime({
  character: {
    name: 'Momentum Trader',
    description: 'High-frequency momentum trading with risk management',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.35,     // High trust requirement
          complianceWeight: 0.15,     // Standard compliance
          riskWeight: 0.35,           // High risk focus
          accuracyWeight: 0.15,       // Standard accuracy
          minimumTrustScore: 75,      // Higher threshold
          maximumRiskLevel: 'high'    // Allow high risk
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});

// Example momentum trade verification
const momentumTradeExample = {
  decision: {
    action: 'buy',
    asset: 'AAPL',
    amount: 100,
    price: 185.50,
    confidence: 0.92,
    strategy: 'momentum_breakout',
    reasoning: 'Strong momentum with 3% gap up, volume 2x average, RSI confirming',
    timeframe: '15m',
    riskTolerance: 'high'
  },
  context: {
    portfolioValue: 250000,
    currentPosition: 0,
    marketConditions: 'volatile_bullish',
    urgency: 'high'
  }
};
```

### Swing Trading Agent

```typescript
const swingTrader = new AgentRuntime({
  character: {
    name: 'Swing Trader',
    description: 'Medium-term swing trading with technical analysis',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.3,
          complianceWeight: 0.25,
          riskWeight: 0.25,
          accuracyWeight: 0.2,
          minimumTrustScore: 70,
          maximumRiskLevel: 'medium'
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});

// Example swing trade with detailed analysis
const swingTradeExample = {
  decision: {
    action: 'buy',
    asset: 'TSLA',
    amount: 50,
    price: 242.75,
    confidence: 0.78,
    strategy: 'swing_reversal',
    reasoning: 'Oversold bounce from key support, bullish divergence on MACD, volume increasing',
    timeframe: '1d',
    riskTolerance: 'medium'
  },
  context: {
    portfolioValue: 100000,
    currentPosition: 0,
    marketConditions: 'neutral_recovering',
    urgency: 'low'
  }
};
```

### Algorithmic Trading System

```typescript
import { configPresets } from '@trustwrapper/eliza-verification-plugin';

// High-performance algorithmic trading configuration
const algoTradingConfig = createTrustWrapperConfig({
  ...configPresets.performance,
  riskThresholds: {
    low: 25,      // Tighter risk controls
    medium: 55,
    high: 80
  },
  cacheSettings: {
    enabled: true,
    ttl: 30000,   // 30 second cache for high-frequency
    maxSize: 5000
  }
});

const algoTrader = new AgentRuntime({
  character: {
    name: 'Algorithmic Trader',
    description: 'High-frequency algorithmic trading system',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.4,      // Highest trust requirement
          complianceWeight: 0.3,      // High compliance
          riskWeight: 0.2,
          accuracyWeight: 0.1,
          minimumTrustScore: 85,      // Very high threshold
          maximumRiskLevel: 'medium'
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});
```

## DeFi Applications

### Yield Farming Optimizer

```typescript
const yieldFarmer = new AgentRuntime({
  character: {
    name: 'DeFi Yield Optimizer',
    description: 'Automated yield farming with smart contract risk assessment',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.25,
          complianceWeight: 0.1,      // Lower compliance for DeFi
          riskWeight: 0.45,           // High risk focus
          accuracyWeight: 0.2,
          minimumTrustScore: 65,      // Lower threshold for DeFi
          maximumRiskLevel: 'high'    // Accept high risk
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});

// Example yield farming decision
const yieldFarmExample = {
  decision: {
    action: 'buy',
    asset: 'USDC-ETH LP',
    amount: 10000,
    confidence: 0.82,
    strategy: 'liquidity_provision',
    reasoning: 'High APY (15.2%), low impermanent loss risk, established protocol',
    timeframe: '30d',
    riskTolerance: 'high'
  },
  context: {
    portfolioValue: 500000,
    currentPosition: 0,
    marketConditions: 'defi_bullish',
    urgency: 'medium'
  }
};
```

### DEX Arbitrage Bot

```typescript
const arbitrageBot = new AgentRuntime({
  character: {
    name: 'DEX Arbitrage Bot',
    description: 'Cross-DEX arbitrage with MEV protection',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.3,
          complianceWeight: 0.05,     // Minimal compliance
          riskWeight: 0.4,            // High risk management
          accuracyWeight: 0.25,       // High accuracy needed
          minimumTrustScore: 80,      // High accuracy requirement
          maximumRiskLevel: 'high'
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});

// Example arbitrage opportunity
const arbitrageExample = {
  decision: {
    action: 'buy',
    asset: 'WETH',
    amount: 5.0,
    confidence: 0.95,
    strategy: 'dex_arbitrage',
    reasoning: 'Price difference: Uniswap $3205, Sushiswap $3220, profit after gas: $45',
    timeframe: '1m',
    riskTolerance: 'medium'
  },
  context: {
    portfolioValue: 100000,
    currentPosition: 0,
    marketConditions: 'arbitrage_available',
    urgency: 'high'
  }
};
```

### Lending Protocol Manager

```typescript
const lendingManager = new AgentRuntime({
  character: {
    name: 'DeFi Lending Manager',
    description: 'Automated lending and borrowing optimization',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.3,
          complianceWeight: 0.2,
          riskWeight: 0.35,
          accuracyWeight: 0.15,
          minimumTrustScore: 70,
          maximumRiskLevel: 'medium'
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});

// Example lending decision
const lendingExample = {
  decision: {
    action: 'buy',
    asset: 'aUSDC',
    amount: 25000,
    confidence: 0.85,
    strategy: 'yield_lending',
    reasoning: 'Aave V3 offering 4.2% APY, low liquidation risk, stable asset',
    timeframe: '60d',
    riskTolerance: 'low'
  },
  context: {
    portfolioValue: 200000,
    currentPosition: 0,
    marketConditions: 'stable_rates',
    urgency: 'low'
  }
};
```

## Compliance Monitoring

### Enterprise Compliance Bot

```typescript
import { configPresets } from '@trustwrapper/eliza-verification-plugin';

const complianceBot = new AgentRuntime({
  character: {
    name: 'Compliance Monitor',
    description: 'Continuous regulatory compliance monitoring and reporting',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.2,
          complianceWeight: 0.6,      // Maximum compliance focus
          riskWeight: 0.15,
          accuracyWeight: 0.05,
          minimumTrustScore: 95,      // Highest standard
          maximumRiskLevel: 'low'     // Conservative risk
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});

// Example compliance report generation
const complianceReportExample = {
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
    agentActivities: ['trading', 'advisory', 'portfolio_management'],
    transactionTypes: ['equity', 'options', 'futures'],
    riskCategories: ['market', 'operational', 'credit', 'liquidity']
  },
  customRequirements: {
    additionalChecks: ['stress_testing', 'scenario_analysis'],
    reportingStandards: ['IFRS', 'GAAP'],
    complianceThresholds: {
      riskLimit: 0.10,
      concentrationLimit: 0.20,
      leverageLimit: 2.0
    }
  }
};
```

### Multi-Jurisdiction Compliance

```typescript
// EU MiFID compliance configuration
const euComplianceConfig = createTrustWrapperConfig({
  ...configPresets.enterprise,
  complianceSettings: {
    defaultJurisdiction: 'EU',
    defaultFramework: 'MiFID',
    enableAuditTrail: true
  }
});

const euComplianceBot = new AgentRuntime({
  character: {
    name: 'EU Compliance Monitor',
    description: 'MiFID II compliance monitoring for European operations'
  },
  plugins: [TrustWrapperPlugin]
});

// UK FCA compliance
const ukComplianceExample = {
  requirements: {
    jurisdiction: 'UK',
    framework: 'FCA',
    reportType: 'quarterly',
    includeAuditTrail: true,
    riskAssessment: true,
    transactionAnalysis: true
  },
  scope: {
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-03-31T23:59:59Z',
    agentActivities: ['trading', 'market_making'],
    transactionTypes: ['equity', 'bonds', 'derivatives'],
    riskCategories: ['market', 'operational', 'conduct']
  }
};
```

### Real-Time Risk Monitoring

```typescript
const riskMonitor = new AgentRuntime({
  character: {
    name: 'Real-Time Risk Monitor',
    description: 'Continuous risk assessment and alert system',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.25,
          complianceWeight: 0.35,
          riskWeight: 0.35,          // High risk focus
          accuracyWeight: 0.05,
          minimumTrustScore: 80,
          maximumRiskLevel: 'low'    // Conservative for risk monitoring
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});

// Example risk assessment for portfolio
const riskAssessmentExample = {
  decision: {
    action: 'hold',
    asset: 'PORTFOLIO',
    amount: 1000000,
    confidence: 0.90,
    strategy: 'risk_assessment',
    reasoning: 'Daily risk review: VaR within limits, stress test passed',
    timeframe: '1d',
    riskTolerance: 'low'
  },
  context: {
    portfolioValue: 1000000,
    currentPosition: 1000000,
    marketConditions: 'volatile',
    urgency: 'high'
  }
};
```

## Custom Configurations

### Hedge Fund Configuration

```typescript
const hedgeFundConfig = createTrustWrapperConfig({
  enableZkProofs: true,           // Full verification
  enableBlockchainVerification: true,
  enableMarketData: true,
  riskThresholds: {
    low: 15,                      // Very conservative
    medium: 35,
    high: 60
  },
  complianceSettings: {
    defaultJurisdiction: 'US',
    defaultFramework: 'SEC',
    enableAuditTrail: true
  },
  cacheSettings: {
    enabled: true,
    ttl: 60000,                   // 1 minute cache
    maxSize: 10000                // Large cache
  }
});

const hedgeFund = new AgentRuntime({
  character: {
    name: 'Hedge Fund Trading System',
    description: 'Institutional hedge fund trading with full compliance',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.35,
          complianceWeight: 0.35,
          riskWeight: 0.25,
          accuracyWeight: 0.05,
          minimumTrustScore: 90,    // Highest standard
          maximumRiskLevel: 'low'
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});
```

### Retail Trading App

```typescript
const retailConfig = createTrustWrapperConfig({
  ...configPresets.lightweight,   // Simplified for retail
  riskThresholds: {
    low: 40,                      // More permissive
    medium: 70,
    high: 90
  },
  complianceSettings: {
    defaultJurisdiction: 'US',
    defaultFramework: 'SEC',
    enableAuditTrail: false       // Simplified for retail
  }
});

const retailApp = new AgentRuntime({
  character: {
    name: 'Retail Trading Assistant',
    description: 'User-friendly trading assistant for retail investors',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.4,    // Focus on trust
          complianceWeight: 0.1,    // Lower compliance burden
          riskWeight: 0.3,
          accuracyWeight: 0.2,
          minimumTrustScore: 60,    // Lower threshold
          maximumRiskLevel: 'high'  // Allow user risk preference
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});
```

### Crypto Trading Bot

```typescript
const cryptoConfig = createTrustWrapperConfig({
  enableZkProofs: true,
  enableBlockchainVerification: true,  // Essential for crypto
  enableMarketData: true,
  riskThresholds: {
    low: 35,
    medium: 65,
    high: 85
  },
  complianceSettings: {
    defaultJurisdiction: 'global',      // Crypto is global
    defaultFramework: 'custom',
    enableAuditTrail: true
  }
});

const cryptoBot = new AgentRuntime({
  character: {
    name: 'Crypto Trading Bot',
    description: 'Multi-chain cryptocurrency trading with DeFi integration',
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.25,
          complianceWeight: 0.15,
          riskWeight: 0.4,          // High risk for crypto
          accuracyWeight: 0.2,
          minimumTrustScore: 65,
          maximumRiskLevel: 'high'
        }
      }
    }
  },
  plugins: [TrustWrapperPlugin]
});
```

## Integration Patterns

### Event-Driven Trading

```typescript
class EventDrivenTrader {
  private agent: AgentRuntime;
  
  constructor() {
    this.agent = new AgentRuntime({
      character: {
        name: 'Event-Driven Trader',
        description: 'Trading based on market events and news'
      },
      plugins: [TrustWrapperPlugin]
    });
  }
  
  async handleMarketEvent(event: MarketEvent) {
    const decision = this.analyzeEvent(event);
    
    const verificationRequest = {
      decision: {
        action: decision.action,
        asset: decision.asset,
        amount: decision.amount,
        confidence: decision.confidence,
        strategy: 'event_driven',
        reasoning: `Event: ${event.type} - ${decision.reasoning}`,
        timeframe: decision.timeframe,
        riskTolerance: decision.riskTolerance
      },
      context: {
        portfolioValue: await this.getPortfolioValue(),
        marketConditions: event.marketImpact,
        urgency: event.urgency
      }
    };
    
    return await this.agent.processMessage({
      content: { text: JSON.stringify(verificationRequest) }
    });
  }
  
  private analyzeEvent(event: MarketEvent) {
    // Event analysis logic
    return {
      action: 'buy',
      asset: event.affectedAsset,
      amount: this.calculatePosition(event),
      confidence: event.confidence,
      reasoning: event.analysis,
      timeframe: event.expectedDuration,
      riskTolerance: event.riskLevel
    };
  }
}
```

### Portfolio Rebalancing

```typescript
class PortfolioRebalancer {
  private agent: AgentRuntime;
  
  constructor() {
    this.agent = new AgentRuntime({
      character: {
        name: 'Portfolio Rebalancer',
        description: 'Automated portfolio rebalancing with risk management'
      },
      plugins: [TrustWrapperPlugin]
    });
  }
  
  async rebalancePortfolio(portfolio: Portfolio, targetAllocation: Allocation) {
    const rebalanceActions = this.calculateRebalancing(portfolio, targetAllocation);
    
    const verificationPromises = rebalanceActions.map(action => {
      const request = {
        decision: {
          action: action.type,
          asset: action.asset,
          amount: action.amount,
          confidence: 0.95,
          strategy: 'portfolio_rebalancing',
          reasoning: `Rebalancing: current ${action.currentWeight}% -> target ${action.targetWeight}%`,
          timeframe: '1d',
          riskTolerance: 'low'
        },
        context: {
          portfolioValue: portfolio.totalValue,
          currentPosition: action.currentAmount,
          marketConditions: 'rebalancing',
          urgency: 'low'
        }
      };
      
      return this.agent.processMessage({
        content: { text: JSON.stringify(request) }
      });
    });
    
    return await Promise.all(verificationPromises);
  }
}
```

### Multi-Strategy Trading

```typescript
class MultiStrategyTrader {
  private strategies: Map<string, AgentRuntime> = new Map();
  
  constructor() {
    // Momentum strategy
    this.strategies.set('momentum', new AgentRuntime({
      character: {
        name: 'Momentum Strategy',
        settings: {
          trustWrapper: {
            evaluationCriteria: {
              trustScoreWeight: 0.35,
              riskWeight: 0.35,
              minimumTrustScore: 75,
              maximumRiskLevel: 'high'
            }
          }
        }
      },
      plugins: [TrustWrapperPlugin]
    }));
    
    // Mean reversion strategy
    this.strategies.set('meanReversion', new AgentRuntime({
      character: {
        name: 'Mean Reversion Strategy',
        settings: {
          trustWrapper: {
            evaluationCriteria: {
              trustScoreWeight: 0.3,
              riskWeight: 0.3,
              minimumTrustScore: 70,
              maximumRiskLevel: 'medium'
            }
          }
        }
      },
      plugins: [TrustWrapperPlugin]
    }));
  }
  
  async executeStrategy(strategyName: string, signal: TradingSignal) {
    const agent = this.strategies.get(strategyName);
    if (!agent) throw new Error(`Strategy ${strategyName} not found`);
    
    const request = {
      decision: {
        action: signal.action,
        asset: signal.asset,
        amount: signal.amount,
        confidence: signal.confidence,
        strategy: strategyName,
        reasoning: signal.reasoning,
        timeframe: signal.timeframe,
        riskTolerance: signal.riskTolerance
      },
      context: signal.context
    };
    
    return await agent.processMessage({
      content: { text: JSON.stringify(request) }
    });
  }
}
```

---

## Support and Resources

- **Full Documentation**: https://trustwrapper.io/docs
- **GitHub Repository**: https://github.com/lamassu-labs/trustwrapper-eliza-plugin
- **Integration Support**: integration@trustwrapper.io
- **Discord Community**: https://discord.gg/trustwrapper

These examples demonstrate the flexibility and power of the TrustWrapper Universal Plugin across different trading strategies, risk profiles, and compliance requirements.