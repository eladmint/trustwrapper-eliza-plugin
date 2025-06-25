/**
 * TrustWrapper v2.0 Pattern Detector
 * 
 * Advanced pattern recognition system that analyzes trading strategies,
 * reasoning patterns, and behavioral indicators to detect suspicious
 * or high-risk trading decisions.
 */

import { TradingDecision, VerificationContext } from '../types';

export interface PatternRules {
  suspiciousReasoningPatterns: PatternDefinition[];
  strategyPatterns: PatternDefinition[];
  behavioralPatterns: PatternDefinition[];
  confidenceThresholds: ConfidenceThresholds;
  temporalPatterns: TemporalPattern[];
}

interface PatternDefinition {
  name: string;
  pattern: RegExp;
  riskScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  category: 'scam' | 'manipulation' | 'emotion' | 'hype' | 'technical' | 'behavioral';
}

interface ConfidenceThresholds {
  minimum: number;
  warning: number;
  critical: number;
}

interface TemporalPattern {
  name: string;
  timeWindow: number; // minutes
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

interface DetectedPattern {
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  description: string;
  matchedText?: string;
  confidence: number;
}

export class PatternDetector {
  private rules: PatternRules;
  private detectionHistory: Map<string, DetectedPattern[]> = new Map();
  
  constructor(rules: PatternRules) {
    this.rules = this.validateRules(rules);
  }

  async detect(
    decision: TradingDecision,
    context: VerificationContext = {}
  ): Promise<PatternDetection> {
    
    const startTime = performance.now();
    
    try {
      // Analyze different aspects of the decision
      const [
        reasoningPatterns,
        strategyPatterns,
        behavioralPatterns,
        temporalPatterns,
        confidenceAnalysis
      ] = await Promise.all([
        this.analyzeReasoningPatterns(decision),
        this.analyzeStrategyPatterns(decision),
        this.analyzeBehavioralPatterns(decision, context),
        this.analyzeTemporalPatterns(decision, context),
        this.analyzeConfidence(decision)
      ]);
      
      // Combine all detected patterns
      const allPatterns = [
        ...reasoningPatterns,
        ...strategyPatterns,
        ...behavioralPatterns,
        ...temporalPatterns
      ];
      
      // Calculate overall risk and severity
      const riskScore = this.calculateRiskScore(allPatterns, confidenceAnalysis);
      const severity = this.calculateSeverity(riskScore, allPatterns);
      const warnings = this.generateWarnings(allPatterns, confidenceAnalysis);
      
      // Store detection history for temporal analysis
      const decisionId = this.generateDecisionId(decision);
      this.detectionHistory.set(decisionId, allPatterns);
      
      const processingTime = performance.now() - startTime;
      
      return {
        riskScore,
        severity,
        suspiciousPatterns: allPatterns,
        warnings,
        confidence: confidenceAnalysis.overallConfidence,
        details: {
          totalPatternsChecked: this.getTotalPatternCount(),
          patternsFound: allPatterns.length,
          categoryBreakdown: this.getCategoryBreakdown(allPatterns),
          processingTime
        }
      };
      
    } catch (error) {
      console.error('Pattern detection failed:', error);
      throw new Error('Pattern detection failed');
    }
  }

  updateRules(newRules: Partial<PatternRules>): void {
    this.rules = { ...this.rules, ...newRules };
  }

  private async analyzeReasoningPatterns(decision: TradingDecision): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    const reasoning = decision.reasoning?.toLowerCase() || '';
    
    if (!reasoning) return patterns;
    
    for (const patternDef of this.rules.suspiciousReasoningPatterns) {
      const match = patternDef.pattern.exec(reasoning);
      if (match) {
        patterns.push({
          name: patternDef.name,
          category: patternDef.category,
          severity: patternDef.severity,
          riskScore: patternDef.riskScore,
          description: patternDef.description,
          matchedText: match[0],
          confidence: this.calculatePatternConfidence(match, reasoning)
        });
      }
    }
    
    // Additional reasoning analysis
    patterns.push(...this.analyzeEmotionalLanguage(reasoning));
    patterns.push(...this.analyzeUrgencyIndicators(reasoning));
    patterns.push(...this.analyzeTechnicalClaimValidation(reasoning));
    
    return patterns;
  }

  private async analyzeStrategyPatterns(decision: TradingDecision): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    const strategy = decision.strategy?.toLowerCase() || '';
    
    if (!strategy) return patterns;
    
    for (const patternDef of this.rules.strategyPatterns) {
      const match = patternDef.pattern.exec(strategy);
      if (match) {
        patterns.push({
          name: patternDef.name,
          category: patternDef.category,
          severity: patternDef.severity,
          riskScore: patternDef.riskScore,
          description: patternDef.description,
          matchedText: match[0],
          confidence: this.calculatePatternConfidence(match, strategy)
        });
      }
    }
    
    // Strategy-specific analysis
    patterns.push(...this.analyzeRiskRewardRatio(decision));
    patterns.push(...this.analyzeTimeframeConsistency(decision));
    patterns.push(...this.analyzePositionSizing(decision));
    
    return patterns;
  }

  private async analyzeBehavioralPatterns(
    decision: TradingDecision,
    context: VerificationContext
  ): Promise<DetectedPattern[]> {
    
    const patterns: DetectedPattern[] = [];
    
    for (const patternDef of this.rules.behavioralPatterns) {
      // Behavioral patterns require context analysis
      if (this.matchesBehavioralPattern(decision, context, patternDef)) {
        patterns.push({
          name: patternDef.name,
          category: patternDef.category,
          severity: patternDef.severity,
          riskScore: patternDef.riskScore,
          description: patternDef.description,
          confidence: 0.8 // Behavioral patterns have inherent uncertainty
        });
      }
    }
    
    // Additional behavioral analysis
    patterns.push(...this.analyzeOverconfidence(decision));
    patterns.push(...this.analyzeInconsistency(decision, context));
    patterns.push(...this.analyzeHerdBehavior(decision, context));
    
    return patterns;
  }

  private async analyzeTemporalPatterns(
    decision: TradingDecision,
    context: VerificationContext
  ): Promise<DetectedPattern[]> {
    
    const patterns: DetectedPattern[] = [];
    
    for (const temporalPattern of this.rules.temporalPatterns) {
      if (this.detectTemporalPattern(decision, context, temporalPattern)) {
        patterns.push({
          name: temporalPattern.name,
          category: 'behavioral',
          severity: 'medium',
          riskScore: temporalPattern.riskScore,
          description: `High frequency pattern detected: ${temporalPattern.name}`,
          confidence: 0.9
        });
      }
    }
    
    return patterns;
  }

  private analyzeEmotionalLanguage(reasoning: string): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    const emotionalPatterns = [
      { pattern: /(fomo|fear.*missing)/i, name: 'FOMO_detected', score: 15 },
      { pattern: /(panic|emergency|urgent)/i, name: 'panic_indicators', score: 20 },
      { pattern: /(revenge.*trad|get.*back)/i, name: 'revenge_trading', score: 25 },
      { pattern: /(desperate|last.*chance)/i, name: 'desperation', score: 30 },
      { pattern: /(sure.*thing|can.t.*lose)/i, name: 'overconfidence', score: 20 }
    ];
    
    for (const emotional of emotionalPatterns) {
      const match = emotional.pattern.exec(reasoning);
      if (match) {
        patterns.push({
          name: emotional.name,
          category: 'emotion',
          severity: emotional.score > 25 ? 'high' : 'medium',
          riskScore: emotional.score,
          description: 'Emotional decision making detected',
          matchedText: match[0],
          confidence: 0.85
        });
      }
    }
    
    return patterns;
  }

  private analyzeUrgencyIndicators(reasoning: string): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    const urgencyPatterns = [
      { pattern: /(now.*or.*never|limited.*time)/i, name: 'artificial_urgency', score: 25 },
      { pattern: /(hurry|quick|fast|immediate)/i, name: 'time_pressure', score: 15 },
      { pattern: /(before.*it.s.*too.*late|miss.*out)/i, name: 'missed_opportunity', score: 20 }
    ];
    
    for (const urgency of urgencyPatterns) {
      const match = urgency.pattern.exec(reasoning);
      if (match) {
        patterns.push({
          name: urgency.name,
          category: 'manipulation',
          severity: 'medium',
          riskScore: urgency.score,
          description: 'Urgency manipulation detected',
          matchedText: match[0],
          confidence: 0.8
        });
      }
    }
    
    return patterns;
  }

  private analyzeTechnicalClaimValidation(reasoning: string): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Look for unsubstantiated technical claims
    const technicalClaims = [
      { pattern: /(technical.*analysis.*shows)/i, name: 'unverified_ta', score: 10 },
      { pattern: /(chart.*pattern.*indicates)/i, name: 'pattern_claim', score: 8 },
      { pattern: /(support.*resistance.*at)/i, name: 'level_claim', score: 5 },
      { pattern: /(breakout.*imminent|moon.*incoming)/i, name: 'prediction_claim', score: 15 }
    ];
    
    for (const claim of technicalClaims) {
      const match = claim.pattern.exec(reasoning);
      if (match) {
        patterns.push({
          name: claim.name,
          category: 'technical',
          severity: 'low',
          riskScore: claim.score,
          description: 'Unverified technical claim',
          matchedText: match[0],
          confidence: 0.6
        });
      }
    }
    
    return patterns;
  }

  private analyzeConfidence(decision: TradingDecision): ConfidenceAnalysis {
    const confidence = decision.confidence || 50;
    
    let overallConfidence = confidence / 100;
    let riskAdjustment = 0;
    
    // Confidence-based risk assessment
    if (confidence < this.rules.confidenceThresholds.critical) {
      riskAdjustment += 30;
    } else if (confidence < this.rules.confidenceThresholds.warning) {
      riskAdjustment += 15;
    } else if (confidence > 95) {
      // Overconfidence can also be risky
      riskAdjustment += 10;
      overallConfidence = 0.85; // Cap overconfident decisions
    }
    
    return {
      overallConfidence,
      riskAdjustment,
      confidenceCategory: this.categorizeConfidence(confidence)
    };
  }

  private analyzeRiskRewardRatio(decision: TradingDecision): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Analyze if stop loss and take profit make sense
    if (decision.stopLoss && decision.takeProfit && decision.price) {
      const downside = Math.abs(decision.price - decision.stopLoss);
      const upside = Math.abs(decision.takeProfit - decision.price);
      const ratio = upside / downside;
      
      if (ratio < 0.5) {
        patterns.push({
          name: 'poor_risk_reward',
          category: 'technical',
          severity: 'medium',
          riskScore: 20,
          description: 'Poor risk/reward ratio detected',
          confidence: 0.9
        });
      }
    }
    
    return patterns;
  }

  private analyzeTimeframeConsistency(decision: TradingDecision): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Check if timeframe matches strategy
    const strategy = decision.strategy?.toLowerCase() || '';
    const timeframe = decision.timeframe;
    
    if (strategy.includes('scalp') && timeframe && timeframe > 60) {
      patterns.push({
        name: 'timeframe_mismatch',
        category: 'technical',
        severity: 'low',
        riskScore: 10,
        description: 'Strategy and timeframe mismatch',
        confidence: 0.7
      });
    }
    
    return patterns;
  }

  private analyzePositionSizing(decision: TradingDecision): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Check for excessive position sizing
    if (decision.amount && decision.portfolioSize) {
      const positionPercent = (decision.amount / decision.portfolioSize) * 100;
      
      if (positionPercent > 50) {
        patterns.push({
          name: 'excessive_position_size',
          category: 'behavioral',
          severity: 'high',
          riskScore: 35,
          description: 'Excessive position size relative to portfolio',
          confidence: 0.95
        });
      } else if (positionPercent > 25) {
        patterns.push({
          name: 'large_position_size',
          category: 'behavioral',
          severity: 'medium',
          riskScore: 20,
          description: 'Large position size detected',
          confidence: 0.9
        });
      }
    }
    
    return patterns;
  }

  private analyzeOverconfidence(decision: TradingDecision): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    if (decision.confidence && decision.confidence > 95) {
      patterns.push({
        name: 'overconfidence_bias',
        category: 'behavioral',
        severity: 'medium',
        riskScore: 15,
        description: 'Overconfidence bias detected',
        confidence: 0.8
      });
    }
    
    return patterns;
  }

  private analyzeInconsistency(decision: TradingDecision, context: VerificationContext): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Check for inconsistencies between reasoning and action
    const reasoning = decision.reasoning?.toLowerCase() || '';
    const action = decision.action.toLowerCase();
    
    if (reasoning.includes('bear') && action === 'buy') {
      patterns.push({
        name: 'reasoning_action_mismatch',
        category: 'behavioral',
        severity: 'medium',
        riskScore: 20,
        description: 'Reasoning contradicts action',
        confidence: 0.85
      });
    }
    
    return patterns;
  }

  private analyzeHerdBehavior(decision: TradingDecision, context: VerificationContext): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    const reasoning = decision.reasoning?.toLowerCase() || '';
    
    // Look for herd mentality indicators
    if (reasoning.includes('everyone') || reasoning.includes('everyone else')) {
      patterns.push({
        name: 'herd_mentality',
        category: 'behavioral',
        severity: 'medium',
        riskScore: 15,
        description: 'Herd behavior detected',
        confidence: 0.75
      });
    }
    
    return patterns;
  }

  private calculateRiskScore(patterns: DetectedPattern[], confidence: ConfidenceAnalysis): number {
    let totalRisk = patterns.reduce((sum, pattern) => sum + pattern.riskScore, 0);
    
    // Apply confidence adjustment
    totalRisk += confidence.riskAdjustment;
    
    // Weight by pattern confidence
    const weightedRisk = patterns.reduce((sum, pattern) => 
      sum + (pattern.riskScore * pattern.confidence), 0
    );
    
    return Math.min(Math.round(Math.max(totalRisk, weightedRisk)), 100);
  }

  private calculateSeverity(riskScore: number, patterns: DetectedPattern[]): 'low' | 'medium' | 'high' | 'critical' {
    // Check for any critical patterns
    if (patterns.some(p => p.severity === 'critical')) {
      return 'critical';
    }
    
    // Overall score-based severity
    if (riskScore >= 70) return 'critical';
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }

  private generateWarnings(patterns: DetectedPattern[], confidence: ConfidenceAnalysis): string[] {
    const warnings: string[] = [];
    
    // Pattern-based warnings
    for (const pattern of patterns) {
      if (pattern.severity === 'critical' || pattern.severity === 'high') {
        warnings.push(`${pattern.description}: ${pattern.name}`);
      }
    }
    
    // Confidence-based warnings
    if (confidence.confidenceCategory === 'very_low') {
      warnings.push('Very low AI confidence in decision');
    } else if (confidence.confidenceCategory === 'overconfident') {
      warnings.push('Potential overconfidence bias detected');
    }
    
    return warnings.slice(0, 10); // Limit warnings
  }

  private matchesBehavioralPattern(
    decision: TradingDecision,
    context: VerificationContext,
    pattern: PatternDefinition
  ): boolean {
    // Complex behavioral pattern matching logic
    // This would be implemented based on specific behavioral indicators
    return false; // Placeholder
  }

  private detectTemporalPattern(
    decision: TradingDecision,
    context: VerificationContext,
    pattern: TemporalPattern
  ): boolean {
    // Temporal pattern detection logic
    // Would track decision frequency over time windows
    return false; // Placeholder
  }

  private calculatePatternConfidence(match: RegExpExecArray, text: string): number {
    // Calculate confidence based on match quality and context
    const matchLength = match[0].length;
    const textLength = text.length;
    const matchRatio = matchLength / textLength;
    
    // Base confidence on match characteristics
    let confidence = 0.5 + (matchRatio * 0.3);
    
    // Adjust for exact matches
    if (match[0] === match.input) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  private categorizeConfidence(confidence: number): string {
    if (confidence < 20) return 'very_low';
    if (confidence < 40) return 'low';
    if (confidence < 60) return 'medium';
    if (confidence < 80) return 'high';
    if (confidence < 95) return 'very_high';
    return 'overconfident';
  }

  private getTotalPatternCount(): number {
    return this.rules.suspiciousReasoningPatterns.length +
           this.rules.strategyPatterns.length +
           this.rules.behavioralPatterns.length;
  }

  private getCategoryBreakdown(patterns: DetectedPattern[]): { [category: string]: number } {
    const breakdown: { [category: string]: number } = {};
    
    for (const pattern of patterns) {
      breakdown[pattern.category] = (breakdown[pattern.category] || 0) + 1;
    }
    
    return breakdown;
  }

  private generateDecisionId(decision: TradingDecision): string {
    return `${decision.action}_${decision.asset}_${Date.now()}`;
  }

  private validateRules(rules: PatternRules): PatternRules {
    const defaults: PatternRules = {
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
          timeWindow: 5,
          maxFrequency: 10,
          riskScore: 20
        }
      ]
    };
    
    return { ...defaults, ...rules };
  }
}

interface ConfidenceAnalysis {
  overallConfidence: number;
  riskAdjustment: number;
  confidenceCategory: string;
}