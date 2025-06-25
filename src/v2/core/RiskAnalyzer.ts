/**
 * TrustWrapper v2.0 Risk Analyzer
 * 
 * Advanced risk analysis engine that detects scam patterns, validates tokens,
 * and assesses trading decision risk without external API calls.
 */

import { TradingDecision, VerificationContext } from '../types';

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

interface RiskBreakdown {
  scamPatternScore: number;
  tokenRiskScore: number;
  amountRiskScore: number;
  leverageRiskScore: number;
  actionRiskScore: number;
  volatilityRiskScore: number;
  contextRiskScore: number;
}

export class RiskAnalyzer {
  private rules: RiskRules;
  private verificationCount: number = 0;
  private totalLatency: number = 0;
  private successCount: number = 0;
  private riskDistribution: { [key: string]: number } = {
    low: 0, medium: 0, high: 0, critical: 0
  };

  // Compiled regex patterns for better performance
  private scamPatterns: RegExp[];
  
  constructor(rules: RiskRules) {
    this.rules = this.validateRules(rules);
    this.compilePatterns();
  }

  async analyze(
    decision: TradingDecision,
    context: VerificationContext = {}
  ): Promise<RiskAssessment> {
    
    const startTime = performance.now();
    this.verificationCount++;
    
    try {
      const breakdown: RiskBreakdown = {
        scamPatternScore: await this.analyzeScamPatterns(decision),
        tokenRiskScore: await this.analyzeTokenRisk(decision),
        amountRiskScore: await this.analyzeAmountRisk(decision),
        leverageRiskScore: await this.analyzeLeverageRisk(decision),
        actionRiskScore: await this.analyzeActionRisk(decision),
        volatilityRiskScore: await this.analyzeVolatilityRisk(decision, context),
        contextRiskScore: await this.analyzeContextRisk(decision, context)
      };
      
      const totalScore = this.calculateTotalScore(breakdown);
      const severity = this.calculateSeverity(totalScore, breakdown);
      const warnings = this.generateWarnings(breakdown, decision);
      
      const assessment: RiskAssessment = {
        score: totalScore,
        severity,
        warnings,
        details: {
          checksPerformed: this.getChecksPerformed(breakdown),
          patternsFound: this.countPatternsFound(breakdown),
          timestamp: Date.now(),
          breakdown
        }
      };
      
      // Update statistics
      const processingTime = performance.now() - startTime;
      this.updateStatistics(assessment, processingTime);
      
      return assessment;
      
    } catch (error) {
      console.error('Risk analysis failed:', error);
      throw new Error('Risk analysis failed');
    }
  }

  updateRules(newRules: Partial<RiskRules>): void {
    this.rules = { ...this.rules, ...newRules };
    this.compilePatterns();
  }

  getVerificationCount(): number {
    return this.verificationCount;
  }

  getAverageLatency(): number {
    return this.verificationCount > 0 ? this.totalLatency / this.verificationCount : 0;
  }

  getSuccessRate(): number {
    return this.verificationCount > 0 ? this.successCount / this.verificationCount : 0;
  }

  getRiskDistribution(): { [key: string]: number } {
    return { ...this.riskDistribution };
  }

  private async analyzeScamPatterns(decision: TradingDecision): Promise<number> {
    let score = 0;
    const reasoning = decision.reasoning?.toLowerCase() || '';
    const strategy = decision.strategy?.toLowerCase() || '';
    
    // Check against compiled regex patterns
    for (const pattern of this.scamPatterns) {
      if (pattern.test(reasoning) || pattern.test(strategy)) {
        score += 25; // Each pattern adds significant risk
      }
    }
    
    // Additional scam indicators
    const scamIndicators = [
      { pattern: /guaranteed.*profit/i, score: 30 },
      { pattern: /risk[- ]?free/i, score: 35 },
      { pattern: /100%.*return/i, score: 40 },
      { pattern: /get.*rich.*quick/i, score: 30 },
      { pattern: /insider.*info/i, score: 45 },
      { pattern: /pump.*dump/i, score: 50 },
      { pattern: /rug.*pull/i, score: 50 },
      { pattern: /honeypot/i, score: 50 }
    ];
    
    for (const indicator of scamIndicators) {
      if (indicator.pattern.test(reasoning) || indicator.pattern.test(strategy)) {
        score += indicator.score;
      }
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  private async analyzeTokenRisk(decision: TradingDecision): Promise<number> {
    let score = 0;
    const asset = decision.asset.toLowerCase();
    
    // Check against known risk tokens
    if (this.rules.riskTokens.includes(asset)) {
      score += 50;
    }
    
    // Pattern-based token risk analysis
    const riskPatterns = [
      { pattern: /^(scam|fake|rug|honey)/i, score: 60 },
      { pattern: /\d+\.?\d*x$/i, score: 30 }, // Tokens ending in multipliers
      { pattern: /(elon|doge|safe|moon)/i, score: 20 },
      { pattern: /^test|demo/i, score: 10 },
      { pattern: /\$[a-z]+coin$/i, score: 15 }
    ];
    
    for (const riskPattern of riskPatterns) {
      if (riskPattern.pattern.test(asset)) {
        score += riskPattern.score;
        break; // Only apply first matching pattern
      }
    }
    
    // Unknown token risk
    const knownTokens = ['btc', 'eth', 'ada', 'sol', 'matic', 'avax', 'dot', 'link'];
    if (!knownTokens.includes(asset) && asset.length < 3) {
      score += 25; // Very short token symbols are risky
    }
    
    return Math.min(score, 100);
  }

  private async analyzeAmountRisk(decision: TradingDecision): Promise<number> {
    if (!decision.amount) return 0;
    
    let score = 0;
    const amount = decision.amount;
    
    // Progressive risk based on amount thresholds
    if (amount > this.rules.maxAmount) {
      score += 50; // Exceeds maximum allowed
    } else if (amount > this.rules.maxAmount * 0.8) {
      score += 30; // High amount
    } else if (amount > this.rules.maxAmount * 0.5) {
      score += 15; // Medium-high amount
    } else if (amount > this.rules.maxAmount * 0.1) {
      score += 5; // Medium amount
    }
    
    // Unusual amount patterns
    if (amount.toString().match(/^(123|999|666|777)/)) {
      score += 10; // Suspicious round numbers
    }
    
    return Math.min(score, 50); // Amount risk capped at 50
  }

  private async analyzeLeverageRisk(decision: TradingDecision): Promise<number> {
    if (!decision.leverage || decision.leverage <= 1) return 0;
    
    let score = 0;
    const leverage = decision.leverage;
    
    // Progressive leverage risk
    if (leverage > this.rules.maxLeverage) {
      score += 60; // Exceeds maximum
    } else if (leverage > 50) {
      score += 40; // Extremely high leverage
    } else if (leverage > 20) {
      score += 25; // Very high leverage
    } else if (leverage > 10) {
      score += 15; // High leverage
    } else if (leverage > 5) {
      score += 8; // Moderate leverage
    } else if (leverage > 2) {
      score += 3; // Low leverage
    }
    
    return Math.min(score, 60);
  }

  private async analyzeActionRisk(decision: TradingDecision): Promise<number> {
    const action = decision.action.toLowerCase();
    
    // Check suspicious actions
    if (this.rules.suspiciousActions.includes(action)) {
      return 30;
    }
    
    // Action-specific risk
    const actionRisk: { [key: string]: number } = {
      'market_buy': 10,
      'market_sell': 10,
      'limit_buy': 5,
      'limit_sell': 5,
      'stop_loss': 8,
      'take_profit': 5,
      'short': 15,
      'margin_trade': 20,
      'futures': 25,
      'options': 30
    };
    
    return actionRisk[action] || 0;
  }

  private async analyzeVolatilityRisk(
    decision: TradingDecision,
    context: VerificationContext
  ): Promise<number> {
    
    // If no context provided, use asset-based heuristics
    if (!context.marketData) {
      const asset = decision.asset.toLowerCase();
      
      // Known volatile assets
      const volatileAssets = ['doge', 'shib', 'pepe', 'floki', 'safemoon'];
      if (volatileAssets.includes(asset)) {
        return 20;
      }
      
      // Stablecoins (lower volatility risk)
      const stablecoins = ['usdt', 'usdc', 'dai', 'busd'];
      if (stablecoins.includes(asset)) {
        return 0;
      }
      
      return 10; // Default moderate volatility risk
    }
    
    // Use provided market data if available
    const volatility = context.marketData.volatility || 0;
    
    if (volatility > 0.5) return 30; // Very high volatility
    if (volatility > 0.3) return 20; // High volatility
    if (volatility > 0.2) return 10; // Medium volatility
    if (volatility > 0.1) return 5;  // Low volatility
    
    return 0; // Very low volatility
  }

  private async analyzeContextRisk(
    decision: TradingDecision,
    context: VerificationContext
  ): Promise<number> {
    
    let score = 0;
    
    // Historical performance context
    if (context.historicalPerformance !== undefined) {
      if (context.historicalPerformance < 0.3) {
        score += 25; // Poor performance history
      } else if (context.historicalPerformance < 0.5) {
        score += 10; // Below average performance
      }
    }
    
    // Market conditions context
    if (context.marketConditions === 'high_volatility') {
      score += 15;
    } else if (context.marketConditions === 'bear_market') {
      score += 10;
    }
    
    // Time-based risk
    if (context.timestamp) {
      const hour = new Date(context.timestamp).getHours();
      // Higher risk during off-hours (potential for manipulation)
      if (hour < 6 || hour > 22) {
        score += 5;
      }
    }
    
    // Rapid trading frequency
    if (context.recentTradeCount && context.recentTradeCount > 10) {
      score += 15; // High frequency trading risk
    }
    
    return Math.min(score, 40);
  }

  private calculateTotalScore(breakdown: RiskBreakdown): number {
    // Weighted combination of risk factors
    const weights = {
      scamPattern: 0.3,
      tokenRisk: 0.25,
      amountRisk: 0.15,
      leverageRisk: 0.15,
      actionRisk: 0.05,
      volatilityRisk: 0.05,
      contextRisk: 0.05
    };
    
    const weightedScore = (
      breakdown.scamPatternScore * weights.scamPattern +
      breakdown.tokenRiskScore * weights.tokenRisk +
      breakdown.amountRiskScore * weights.amountRisk +
      breakdown.leverageRiskScore * weights.leverageRisk +
      breakdown.actionRiskScore * weights.actionRisk +
      breakdown.volatilityRiskScore * weights.volatilityRisk +
      breakdown.contextRiskScore * weights.contextRisk
    );
    
    return Math.min(Math.round(weightedScore), 100);
  }

  private calculateSeverity(
    totalScore: number,
    breakdown: RiskBreakdown
  ): 'low' | 'medium' | 'high' | 'critical' {
    
    // Critical if any component indicates critical risk
    if (breakdown.scamPatternScore >= 80 || 
        breakdown.tokenRiskScore >= 80 ||
        totalScore >= 80) {
      return 'critical';
    }
    
    if (totalScore >= 60) return 'high';
    if (totalScore >= 30) return 'medium';
    return 'low';
  }

  private generateWarnings(breakdown: RiskBreakdown, decision: TradingDecision): string[] {
    const warnings: string[] = [];
    
    if (breakdown.scamPatternScore > 20) {
      warnings.push('Suspicious language patterns detected in reasoning');
    }
    
    if (breakdown.tokenRiskScore > 30) {
      warnings.push(`High-risk token detected: ${decision.asset}`);
    }
    
    if (breakdown.amountRiskScore > 20) {
      warnings.push('Large transaction amount detected');
    }
    
    if (breakdown.leverageRiskScore > 20) {
      warnings.push(`High leverage detected: ${decision.leverage}x`);
    }
    
    if (breakdown.actionRiskScore > 15) {
      warnings.push(`High-risk trading action: ${decision.action}`);
    }
    
    if (breakdown.volatilityRiskScore > 20) {
      warnings.push('High volatility asset detected');
    }
    
    if (breakdown.contextRiskScore > 20) {
      warnings.push('Poor trading context detected');
    }
    
    return warnings;
  }

  private getChecksPerformed(breakdown: RiskBreakdown): string[] {
    const checks: string[] = [];
    
    if (breakdown.scamPatternScore > 0) checks.push('scam_pattern_analysis');
    if (breakdown.tokenRiskScore > 0) checks.push('token_risk_assessment');
    if (breakdown.amountRiskScore > 0) checks.push('amount_validation');
    if (breakdown.leverageRiskScore > 0) checks.push('leverage_analysis');
    if (breakdown.actionRiskScore > 0) checks.push('action_risk_check');
    if (breakdown.volatilityRiskScore > 0) checks.push('volatility_assessment');
    if (breakdown.contextRiskScore > 0) checks.push('context_analysis');
    
    return checks;
  }

  private countPatternsFound(breakdown: RiskBreakdown): number {
    let count = 0;
    
    if (breakdown.scamPatternScore > 0) count++;
    if (breakdown.tokenRiskScore > 0) count++;
    if (breakdown.amountRiskScore > 0) count++;
    if (breakdown.leverageRiskScore > 0) count++;
    if (breakdown.actionRiskScore > 0) count++;
    if (breakdown.volatilityRiskScore > 0) count++;
    if (breakdown.contextRiskScore > 0) count++;
    
    return count;
  }

  private updateStatistics(assessment: RiskAssessment, processingTime: number): void {
    this.totalLatency += processingTime;
    this.successCount++;
    this.riskDistribution[assessment.severity]++;
  }

  private validateRules(rules: RiskRules): RiskRules {
    const defaults: RiskRules = {
      scamPatterns: [
        'guaranteed.*profit', 'risk.?free', '100%.*return', 'get.*rich.*quick',
        'insider.*info', 'pump.*dump', 'rug.*pull', 'honeypot', 'easy.*money',
        'no.*risk', 'unlimited.*profit', 'secret.*strategy', 'exclusive.*deal'
      ],
      riskTokens: [
        'scam', 'fake', 'test', 'rug', 'honey', 'ponzi', 'pyramid'
      ],
      suspiciousActions: [
        'pump', 'dump', 'manipulate', 'exploit', 'hack'
      ],
      maxAmount: 100000,
      maxLeverage: 20,
      leverageThresholds: { low: 2, medium: 5, high: 10, extreme: 20 },
      volatilityThresholds: { low: 0.1, medium: 0.2, high: 0.3, extreme: 0.5 }
    };
    
    return { ...defaults, ...rules };
  }

  private compilePatterns(): void {
    this.scamPatterns = this.rules.scamPatterns.map(pattern => 
      new RegExp(pattern, 'i')
    );
  }
}