/**
 * TrustWrapper v2.0 Configuration Utilities
 * 
 * Secure configuration management with validation and defaults
 */

import { LocalVerificationConfig, RiskRules, PatternRules, ComplianceRules } from '../types';

export function createSecureConfig(config?: Partial<LocalVerificationConfig>): LocalVerificationConfig {
  const defaults = getDefaultConfig();
  const mergedConfig = { ...defaults, ...config };
  
  validateConfig(mergedConfig);
  return mergedConfig;
}

export function validateConfig(config: LocalVerificationConfig): void {
  // Validate basic constraints
  if (config.maxLatencyMs < 1 || config.maxLatencyMs > 10000) {
    throw new Error('maxLatencyMs must be between 1 and 10000');
  }
  
  if (config.maxBatchSize < 1 || config.maxBatchSize > 1000) {
    throw new Error('maxBatchSize must be between 1 and 1000');
  }
  
  // Validate risk rules
  validateRiskRules(config.riskRules);
  
  // Validate pattern rules
  validatePatternRules(config.patternRules);
  
  // Validate compliance rules
  validateComplianceRules(config.complianceRules);
}

function getDefaultConfig(): LocalVerificationConfig {
  return {
    maxLatencyMs: 10,
    maxBatchSize: 100,
    strictMode: true,
    auditEnabled: false,
    version: '2.0.0',
    riskRules: getDefaultRiskRules(),
    patternRules: getDefaultPatternRules(),
    complianceRules: getDefaultComplianceRules()
  };
}

function getDefaultRiskRules(): RiskRules {
  return {
    scamPatterns: [
      'guaranteed.*profit', 'risk.?free', '100%.*return', 'get.*rich.*quick',
      'insider.*info', 'pump.*dump', 'rug.*pull', 'honeypot', 'easy.*money',
      'no.*risk', 'unlimited.*profit', 'secret.*strategy', 'exclusive.*deal'
    ],
    riskTokens: [
      'scam', 'fake', 'test', 'rug', 'honey', 'ponzi', 'pyramid', 'fraud'
    ],
    suspiciousActions: [
      'pump', 'dump', 'manipulate', 'exploit', 'hack', 'rug'
    ],
    maxAmount: 100000,
    maxLeverage: 20,
    leverageThresholds: { 
      low: 2, 
      medium: 5, 
      high: 10, 
      extreme: 20 
    },
    volatilityThresholds: { 
      low: 0.1, 
      medium: 0.2, 
      high: 0.3, 
      extreme: 0.5 
    }
  };
}

function getDefaultPatternRules(): PatternRules {
  return {
    suspiciousReasoningPatterns: [
      {
        name: 'guaranteed_returns',
        pattern: /guaranteed.*return|sure.*profit/i,
        riskScore: 40,
        severity: 'high',
        description: 'Guaranteed return claims',
        category: 'scam'
      },
      {
        name: 'pump_dump_language',
        pattern: /pump.*dump|dump.*pump/i,
        riskScore: 50,
        severity: 'critical',
        description: 'Pump and dump language',
        category: 'manipulation'
      },
      {
        name: 'fomo_indicators',
        pattern: /fomo|fear.*missing|now.*or.*never/i,
        riskScore: 25,
        severity: 'medium',
        description: 'FOMO manipulation',
        category: 'emotion'
      }
    ],
    strategyPatterns: [
      {
        name: 'martingale_strategy',
        pattern: /martingale|double.*down.*loss/i,
        riskScore: 30,
        severity: 'high',
        description: 'High-risk martingale strategy',
        category: 'technical'
      },
      {
        name: 'all_in_strategy',
        pattern: /all.?in|everything.*on|bet.*everything/i,
        riskScore: 45,
        severity: 'critical',
        description: 'All-in trading strategy',
        category: 'behavioral'
      }
    ],
    behavioralPatterns: [
      {
        name: 'revenge_trading',
        pattern: /revenge|get.*back.*loss/i,
        riskScore: 35,
        severity: 'high',
        description: 'Revenge trading pattern',
        category: 'behavioral'
      },
      {
        name: 'panic_selling',
        pattern: /panic|emergency.*sell|must.*sell.*now/i,
        riskScore: 30,
        severity: 'medium',
        description: 'Panic trading behavior',
        category: 'emotion'
      }
    ],
    confidenceThresholds: {
      minimum: 30,
      warning: 50,
      critical: 20
    },
    temporalPatterns: [
      {
        name: 'high_frequency_trading',
        timeWindow: 5, // 5 minutes
        maxFrequency: 10,
        riskScore: 20
      },
      {
        name: 'rapid_position_changes',
        timeWindow: 1, // 1 minute
        maxFrequency: 5,
        riskScore: 25
      }
    ]
  };
}

function getDefaultComplianceRules(): ComplianceRules {
  return {
    jurisdictions: ['US'],
    frameworks: [
      {
        name: 'SEC',
        jurisdiction: 'US',
        enabled: true,
        rules: [
          {
            id: 'SEC_RULE_10b5',
            description: 'Prohibition against insider trading',
            ruleType: 'disclosure',
            severity: 'critical',
            parameters: {}
          },
          {
            id: 'SEC_POSITION_LIMITS',
            description: 'Position size limitations',
            ruleType: 'position_limit',
            severity: 'violation',
            parameters: { maxPosition: 50000 }
          }
        ]
      }
    ],
    restrictedAssets: {
      'US': ['ponzi', 'scam', 'illegal', 'sanctioned']
    },
    tradingRestrictions: [
      {
        jurisdiction: 'US',
        assetType: 'derivative',
        restriction: 'licensed_only',
        maxLeverage: 2,
        requiresDisclosure: true
      }
    ],
    reportingRequirements: [
      {
        jurisdiction: 'US',
        threshold: 50000,
        timeframe: 'monthly',
        reportType: 'position'
      }
    ],
    riskLimits: [
      {
        jurisdiction: 'US',
        limitType: 'leverage',
        maxValue: 2,
        enforcement: 'mandatory'
      },
      {
        jurisdiction: 'US',
        limitType: 'position_size',
        maxValue: 100000,
        enforcement: 'advisory'
      }
    ]
  };
}

function validateRiskRules(rules: RiskRules): void {
  if (!Array.isArray(rules.scamPatterns)) {
    throw new Error('scamPatterns must be an array');
  }
  
  if (!Array.isArray(rules.riskTokens)) {
    throw new Error('riskTokens must be an array');
  }
  
  if (rules.maxAmount <= 0) {
    throw new Error('maxAmount must be positive');
  }
  
  if (rules.maxLeverage <= 0) {
    throw new Error('maxLeverage must be positive');
  }
}

function validatePatternRules(rules: PatternRules): void {
  if (!Array.isArray(rules.suspiciousReasoningPatterns)) {
    throw new Error('suspiciousReasoningPatterns must be an array');
  }
  
  if (!Array.isArray(rules.strategyPatterns)) {
    throw new Error('strategyPatterns must be an array');
  }
  
  if (!Array.isArray(rules.behavioralPatterns)) {
    throw new Error('behavioralPatterns must be an array');
  }
  
  // Validate pattern definitions
  for (const pattern of rules.suspiciousReasoningPatterns) {
    validatePatternDefinition(pattern);
  }
}

function validateComplianceRules(rules: ComplianceRules): void {
  if (!Array.isArray(rules.jurisdictions)) {
    throw new Error('jurisdictions must be an array');
  }
  
  if (!Array.isArray(rules.frameworks)) {
    throw new Error('frameworks must be an array');
  }
  
  if (typeof rules.restrictedAssets !== 'object') {
    throw new Error('restrictedAssets must be an object');
  }
}

function validatePatternDefinition(pattern: any): void {
  if (!pattern.name || typeof pattern.name !== 'string') {
    throw new Error('Pattern name must be a non-empty string');
  }
  
  if (!(pattern.pattern instanceof RegExp)) {
    throw new Error('Pattern must be a RegExp');
  }
  
  if (typeof pattern.riskScore !== 'number' || pattern.riskScore < 0 || pattern.riskScore > 100) {
    throw new Error('Pattern riskScore must be a number between 0 and 100');
  }
}