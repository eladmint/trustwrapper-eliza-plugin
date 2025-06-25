/**
 * TrustWrapper v2.0 Compliance Checker
 * 
 * Multi-jurisdiction compliance validation system that ensures trading
 * decisions comply with relevant financial regulations without external
 * API calls or data transmission.
 */

import { TradingDecision, VerificationContext } from '../types';

export interface ComplianceRules {
  jurisdictions: string[];
  frameworks: ComplianceFramework[];
  restrictedAssets: { [jurisdiction: string]: string[] };
  tradingRestrictions: TradingRestriction[];
  reportingRequirements: ReportingRequirement[];
  riskLimits: RiskLimit[];
}

interface ComplianceFramework {
  name: string;
  jurisdiction: string;
  rules: FrameworkRule[];
  enabled: boolean;
}

interface FrameworkRule {
  id: string;
  description: string;
  ruleType: 'asset_restriction' | 'position_limit' | 'leverage_limit' | 'reporting' | 'disclosure';
  severity: 'warning' | 'violation' | 'critical';
  parameters: { [key: string]: any };
}

interface TradingRestriction {
  jurisdiction: string;
  assetType: string;
  restriction: 'prohibited' | 'licensed_only' | 'accredited_only' | 'limited';
  maxAmount?: number;
  maxLeverage?: number;
  requiresDisclosure: boolean;
}

interface ReportingRequirement {
  jurisdiction: string;
  threshold: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  reportType: 'position' | 'transaction' | 'pnl' | 'risk';
}

interface RiskLimit {
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

export class ComplianceChecker {
  private rules: ComplianceRules;
  private complianceCache: Map<string, ComplianceResult> = new Map();
  
  constructor(rules: ComplianceRules) {
    this.rules = this.validateRules(rules);
  }

  async check(
    decision: TradingDecision,
    context: VerificationContext = {}
  ): Promise<ComplianceResult> {
    
    try {
      // Generate cache key for performance
      const cacheKey = this.generateCacheKey(decision, context);
      if (this.complianceCache.has(cacheKey)) {
        return this.complianceCache.get(cacheKey)!;
      }
      
      // Determine applicable jurisdictions and frameworks
      const applicableJurisdictions = this.getApplicableJurisdictions(context);
      const applicableFrameworks = this.getApplicableFrameworks(applicableJurisdictions);
      
      // Perform compliance checks
      const [
        assetCompliance,
        positionCompliance,
        leverageCompliance,
        reportingCompliance,
        disclosureCompliance
      ] = await Promise.all([
        this.checkAssetCompliance(decision, applicableJurisdictions),
        this.checkPositionCompliance(decision, applicableJurisdictions),
        this.checkLeverageCompliance(decision, applicableJurisdictions),
        this.checkReportingRequirements(decision, applicableJurisdictions),
        this.checkDisclosureRequirements(decision, context, applicableJurisdictions)
      ]);
      
      // Aggregate results
      const result = this.aggregateComplianceResults(
        decision,
        [assetCompliance, positionCompliance, leverageCompliance, reportingCompliance, disclosureCompliance],
        applicableJurisdictions,
        applicableFrameworks
      );
      
      // Cache result for performance
      this.complianceCache.set(cacheKey, result);
      
      return result;
      
    } catch (error) {
      console.error('Compliance check failed:', error);
      
      // Return safe fallback result
      return {
        compliant: false,
        violations: ['Compliance check system error'],
        warnings: ['Unable to verify regulatory compliance'],
        jurisdictions: [],
        framework: 'error',
        score: 0,
        details: {
          rulesChecked: 0,
          violationsFound: 1,
          warningsIssued: 1,
          applicableFrameworks: [],
          reportingRequired: false,
          restrictionsApplied: []
        }
      };
    }
  }

  updateRules(newRules: Partial<ComplianceRules>): void {
    this.rules = { ...this.rules, ...newRules };
    this.complianceCache.clear(); // Clear cache when rules change
  }

  private async checkAssetCompliance(
    decision: TradingDecision,
    jurisdictions: string[]
  ): Promise<ComplianceCheckResult> {
    
    const violations: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    
    for (const jurisdiction of jurisdictions) {
      const restrictedAssets = this.rules.restrictedAssets[jurisdiction] || [];
      
      if (restrictedAssets.includes(decision.asset.toLowerCase())) {
        violations.push(`Asset ${decision.asset} is restricted in ${jurisdiction}`);
        score -= 50;
      }
      
      // Check for derivative instruments compliance
      if (this.isDerivativeInstrument(decision)) {
        const derivativeRestriction = this.getDerivativeRestriction(jurisdiction);
        if (derivativeRestriction) {
          if (derivativeRestriction.restriction === 'prohibited') {
            violations.push(`Derivative trading prohibited in ${jurisdiction}`);
            score -= 50;
          } else if (derivativeRestriction.restriction === 'accredited_only') {
            warnings.push(`Derivative trading may require accredited investor status in ${jurisdiction}`);
            score -= 10;
          }
        }
      }
      
      // Check for stablecoin regulations
      if (this.isStablecoin(decision.asset)) {
        const stablecoinRules = this.getStablecoinRules(jurisdiction);
        if (stablecoinRules && stablecoinRules.requiresLicense) {
          warnings.push(`Stablecoin trading may require licensing in ${jurisdiction}`);
          score -= 5;
        }
      }
    }
    
    return {
      checkType: 'asset_compliance',
      violations,
      warnings,
      score: Math.max(0, score),
      rulesApplied: jurisdictions.length
    };
  }

  private async checkPositionCompliance(
    decision: TradingDecision,
    jurisdictions: string[]
  ): Promise<ComplianceCheckResult> {
    
    const violations: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    
    for (const jurisdiction of jurisdictions) {
      const positionLimits = this.getPositionLimits(jurisdiction);
      
      if (decision.amount && positionLimits.maxPositionSize) {
        if (decision.amount > positionLimits.maxPositionSize) {
          violations.push(`Position size exceeds ${jurisdiction} limit of ${positionLimits.maxPositionSize}`);
          score -= 30;
        } else if (decision.amount > positionLimits.maxPositionSize * 0.8) {
          warnings.push(`Position size approaching ${jurisdiction} regulatory limit`);
          score -= 10;
        }
      }
      
      // Check concentration limits
      if (decision.portfolioSize && decision.amount) {
        const concentrationRatio = decision.amount / decision.portfolioSize;
        const maxConcentration = positionLimits.maxConcentrationRatio || 0.2;
        
        if (concentrationRatio > maxConcentration) {
          violations.push(`Position concentration exceeds ${jurisdiction} limit of ${maxConcentration * 100}%`);
          score -= 25;
        }
      }
      
      // Check for position disclosure requirements
      if (decision.amount && positionLimits.disclosureThreshold) {
        if (decision.amount > positionLimits.disclosureThreshold) {
          warnings.push(`Position may require disclosure under ${jurisdiction} regulations`);
          score -= 5;
        }
      }
    }
    
    return {
      checkType: 'position_compliance',
      violations,
      warnings,
      score: Math.max(0, score),
      rulesApplied: jurisdictions.length
    };
  }

  private async checkLeverageCompliance(
    decision: TradingDecision,
    jurisdictions: string[]
  ): Promise<ComplianceCheckResult> {
    
    const violations: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    
    if (!decision.leverage || decision.leverage <= 1) {
      return {
        checkType: 'leverage_compliance',
        violations,
        warnings,
        score,
        rulesApplied: 0
      };
    }
    
    for (const jurisdiction of jurisdictions) {
      const leverageLimits = this.getLeverageLimits(jurisdiction);
      
      if (leverageLimits.maxRetailLeverage && decision.leverage > leverageLimits.maxRetailLeverage) {
        if (leverageLimits.enforcement === 'mandatory') {
          violations.push(`Leverage ${decision.leverage}x exceeds ${jurisdiction} retail limit of ${leverageLimits.maxRetailLeverage}x`);
          score -= 40;
        } else {
          warnings.push(`Leverage ${decision.leverage}x exceeds recommended ${jurisdiction} limit`);
          score -= 15;
        }
      }
      
      // Asset-specific leverage limits
      const assetLeverageLimit = leverageLimits.assetSpecificLimits?.[decision.asset.toLowerCase()];
      if (assetLeverageLimit && decision.leverage > assetLeverageLimit) {
        violations.push(`Leverage for ${decision.asset} exceeds ${jurisdiction} limit of ${assetLeverageLimit}x`);
        score -= 35;
      }
      
      // Professional trader limits
      if (leverageLimits.maxProfessionalLeverage && decision.leverage > leverageLimits.maxProfessionalLeverage) {
        warnings.push(`Leverage may require professional trader classification in ${jurisdiction}`);
        score -= 10;
      }
    }
    
    return {
      checkType: 'leverage_compliance',
      violations,
      warnings,
      score: Math.max(0, score),
      rulesApplied: jurisdictions.length
    };
  }

  private async checkReportingRequirements(
    decision: TradingDecision,
    jurisdictions: string[]
  ): Promise<ComplianceCheckResult> {
    
    const violations: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    
    for (const jurisdiction of jurisdictions) {
      const reportingReqs = this.rules.reportingRequirements.filter(r => r.jurisdiction === jurisdiction);
      
      for (const req of reportingReqs) {
        if (decision.amount && decision.amount >= req.threshold) {
          warnings.push(`Transaction may require ${req.reportType} reporting in ${jurisdiction} (${req.timeframe})`);
          score -= 5;
        }
      }
      
      // Check for beneficial ownership reporting
      if (decision.amount && this.requiresBeneficialOwnershipReporting(jurisdiction, decision.amount)) {
        warnings.push(`Position may require beneficial ownership disclosure in ${jurisdiction}`);
        score -= 5;
      }
    }
    
    return {
      checkType: 'reporting_compliance',
      violations,
      warnings,
      score: Math.max(0, score),
      rulesApplied: jurisdictions.length
    };
  }

  private async checkDisclosureRequirements(
    decision: TradingDecision,
    context: VerificationContext,
    jurisdictions: string[]
  ): Promise<ComplianceCheckResult> {
    
    const violations: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    
    for (const jurisdiction of jurisdictions) {
      // Market manipulation disclosure
      if (this.couldInfluenceMarket(decision, context)) {
        warnings.push(`Trade may require market influence disclosure in ${jurisdiction}`);
        score -= 10;
      }
      
      // Insider information disclosure
      if (context.hasInsiderInformation) {
        violations.push(`Trading with insider information prohibited in ${jurisdiction}`);
        score -= 50;
      }
      
      // Conflict of interest disclosure
      if (context.hasConflictOfInterest) {
        warnings.push(`Conflict of interest disclosure may be required in ${jurisdiction}`);
        score -= 15;
      }
    }
    
    return {
      checkType: 'disclosure_compliance',
      violations,
      warnings,
      score: Math.max(0, score),
      rulesApplied: jurisdictions.length
    };
  }

  private getApplicableJurisdictions(context: VerificationContext): string[] {
    // Determine jurisdictions based on context
    if (context.jurisdiction) {
      return [context.jurisdiction];
    }
    
    // Default to configured jurisdictions
    return this.rules.jurisdictions;
  }

  private getApplicableFrameworks(jurisdictions: string[]): ComplianceFramework[] {
    return this.rules.frameworks.filter(f => 
      f.enabled && jurisdictions.includes(f.jurisdiction)
    );
  }

  private aggregateComplianceResults(
    decision: TradingDecision,
    results: ComplianceCheckResult[],
    jurisdictions: string[],
    frameworks: ComplianceFramework[]
  ): ComplianceResult {
    
    const allViolations = results.flatMap(r => r.violations);
    const allWarnings = results.flatMap(r => r.warnings);
    const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const totalRulesChecked = results.reduce((sum, r) => sum + r.rulesApplied, 0);
    
    return {
      compliant: allViolations.length === 0,
      violations: allViolations,
      warnings: allWarnings,
      jurisdictions,
      framework: frameworks.map(f => f.name).join(', ') || 'default',
      score: Math.round(totalScore),
      details: {
        rulesChecked: totalRulesChecked,
        violationsFound: allViolations.length,
        warningsIssued: allWarnings.length,
        applicableFrameworks: frameworks.map(f => f.name),
        reportingRequired: allWarnings.some(w => w.includes('reporting')),
        restrictionsApplied: results.map(r => r.checkType)
      }
    };
  }

  // Helper methods for compliance checks
  private isDerivativeInstrument(decision: TradingDecision): boolean {
    const derivativeKeywords = ['future', 'option', 'swap', 'cfd', 'forward'];
    const strategy = decision.strategy?.toLowerCase() || '';
    return derivativeKeywords.some(keyword => strategy.includes(keyword)) || 
           (decision.leverage && decision.leverage > 1);
  }

  private isStablecoin(asset: string): boolean {
    const stablecoins = ['usdt', 'usdc', 'dai', 'busd', 'frax', 'tusd', 'usdp'];
    return stablecoins.includes(asset.toLowerCase());
  }

  private getDerivativeRestriction(jurisdiction: string): TradingRestriction | null {
    return this.rules.tradingRestrictions.find(r => 
      r.jurisdiction === jurisdiction && r.assetType === 'derivative'
    ) || null;
  }

  private getStablecoinRules(jurisdiction: string): any {
    // Simplified stablecoin rules
    const stablecoinRules: { [key: string]: any } = {
      'US': { requiresLicense: false },
      'EU': { requiresLicense: true },
      'UK': { requiresLicense: true },
      'SG': { requiresLicense: true }
    };
    
    return stablecoinRules[jurisdiction];
  }

  private getPositionLimits(jurisdiction: string): any {
    // Simplified position limits
    const positionLimits: { [key: string]: any } = {
      'US': {
        maxPositionSize: 1000000,
        maxConcentrationRatio: 0.25,
        disclosureThreshold: 50000
      },
      'EU': {
        maxPositionSize: 500000,
        maxConcentrationRatio: 0.20,
        disclosureThreshold: 25000
      },
      'UK': {
        maxPositionSize: 750000,
        maxConcentrationRatio: 0.30,
        disclosureThreshold: 40000
      }
    };
    
    return positionLimits[jurisdiction] || positionLimits['US'];
  }

  private getLeverageLimits(jurisdiction: string): any {
    // Simplified leverage limits
    const leverageLimits: { [key: string]: any } = {
      'US': {
        maxRetailLeverage: 2,
        maxProfessionalLeverage: 50,
        enforcement: 'mandatory'
      },
      'EU': {
        maxRetailLeverage: 30,
        maxProfessionalLeverage: 500,
        enforcement: 'mandatory'
      },
      'UK': {
        maxRetailLeverage: 30,
        maxProfessionalLeverage: 500,
        enforcement: 'mandatory'
      }
    };
    
    return leverageLimits[jurisdiction] || leverageLimits['US'];
  }

  private requiresBeneficialOwnershipReporting(jurisdiction: string, amount: number): boolean {
    const thresholds: { [key: string]: number } = {
      'US': 100000,
      'EU': 50000,
      'UK': 75000
    };
    
    return amount >= (thresholds[jurisdiction] || 100000);
  }

  private couldInfluenceMarket(decision: TradingDecision, context: VerificationContext): boolean {
    // Simplified market influence check
    return (decision.amount && decision.amount > 500000) || 
           (context.marketCapInfluence && context.marketCapInfluence > 0.01);
  }

  private generateCacheKey(decision: TradingDecision, context: VerificationContext): string {
    const keyData = {
      asset: decision.asset,
      action: decision.action,
      amount: decision.amount,
      leverage: decision.leverage,
      jurisdiction: context.jurisdiction || 'default'
    };
    
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  private validateRules(rules: ComplianceRules): ComplianceRules {
    const defaults: ComplianceRules = {
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
            }
          ]
        }
      ],
      restrictedAssets: {
        'US': ['ponzi', 'scam', 'illegal']
      },
      tradingRestrictions: [],
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
        }
      ]
    };
    
    return { ...defaults, ...rules };
  }
}

interface ComplianceCheckResult {
  checkType: string;
  violations: string[];
  warnings: string[];
  score: number;
  rulesApplied: number;
}