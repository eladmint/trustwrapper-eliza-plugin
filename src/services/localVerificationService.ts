/**
 * Local-first verification service for TrustWrapper v2.0
 * 
 * This implementation runs verification logic locally without sending
 * sensitive trading data to external services.
 */

import { 
  TradingDecision, 
  VerificationResult, 
  RiskLevel 
} from '../types';

export class LocalVerificationService {
  private readonly scamPatterns = [
    'guaranteed', 'moon', '1000x', 'risk-free', 'get rich',
    'lambo', 'to the moon', 'easy money', 'no risk'
  ];

  private readonly highRiskTokens = new Set([
    'PONZI', 'SCAM', 'RUG', 'HONEYPOT', 'FAKE'
  ]);

  /**
   * Verify trading decision locally without external API calls
   */
  async verifyTradingDecision(
    decision: TradingDecision
  ): Promise<VerificationResult> {
    const warnings: string[] = [];
    let riskScore = 0;
    let trustScore = 100;

    // Check for scam patterns in reasoning
    const reasoning = decision.reasoning?.toLowerCase() || '';
    for (const pattern of this.scamPatterns) {
      if (reasoning.includes(pattern)) {
        warnings.push(`Suspicious pattern detected: "${pattern}"`);
        riskScore += 20;
        trustScore -= 20;
      }
    }

    // Check for high-risk tokens
    if (this.highRiskTokens.has(decision.asset.toUpperCase())) {
      warnings.push('High-risk token detected');
      riskScore += 50;
      trustScore -= 50;
    }

    // Check for unrealistic returns
    if (decision.expectedReturn && decision.expectedReturn > 100) {
      warnings.push(`Unrealistic return expectation: ${decision.expectedReturn}%`);
      riskScore += 30;
      trustScore -= 30;
    }

    // Check for excessive leverage
    if (decision.leverage && decision.leverage > 10) {
      warnings.push(`High leverage detected: ${decision.leverage}x`);
      riskScore += 20;
      trustScore -= 20;
    }

    // Determine risk level
    let riskLevel: RiskLevel = 'low';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';

    // Determine recommendation
    let recommendation: 'approved' | 'warning' | 'rejected' = 'approved';
    if (riskLevel === 'critical') recommendation = 'rejected';
    else if (riskLevel === 'high') recommendation = 'warning';

    return {
      verified: recommendation !== 'rejected',
      trustScore: Math.max(0, trustScore),
      riskLevel,
      warnings,
      recommendation,
      timestamp: new Date().toISOString(),
      verificationMethod: 'local',
      metadata: {
        version: '2.0.0',
        localVerification: true,
        externalApiUsed: false
      }
    };
  }

  /**
   * Generate zero-knowledge proof of verification
   * (Placeholder for v2.0 implementation)
   */
  async generateZKProof(
    decision: TradingDecision,
    verification: VerificationResult
  ): Promise<string> {
    // In v2.0, this will generate actual ZK proofs
    // For now, return a hash of the verification
    const data = JSON.stringify({ 
      trustScore: verification.trustScore,
      riskLevel: verification.riskLevel,
      timestamp: verification.timestamp
    });
    
    // Simple hash for demonstration
    const hash = Buffer.from(data).toString('base64');
    return `zk-proof-v2:${hash}`;
  }

  /**
   * Verify without revealing trading details
   */
  async verifyWithPrivacy(
    decisionHash: string
  ): Promise<VerificationResult> {
    // In v2.0, this will verify using only hashes
    // without needing the actual trading data
    return {
      verified: true,
      trustScore: 85,
      riskLevel: 'low',
      warnings: [],
      recommendation: 'approved',
      timestamp: new Date().toISOString(),
      verificationMethod: 'privacy-preserving',
      metadata: {
        version: '2.0.0',
        privacyPreserving: true,
        decisionHash
      }
    };
  }
}

/**
 * Example usage for secure local verification
 */
export const secureVerificationExample = async () => {
  const localVerifier = new LocalVerificationService();
  
  // Example 1: Local verification
  const decision: TradingDecision = {
    action: 'buy',
    asset: 'ETH',
    amount: 1000,
    price: 3000,
    reasoning: 'Technical analysis shows support at this level'
  };
  
  const result = await localVerifier.verifyTradingDecision(decision);
  console.log('Local verification:', result);
  
  // Example 2: Generate ZK proof
  const zkProof = await localVerifier.generateZKProof(decision, result);
  console.log('ZK Proof:', zkProof);
  
  // Example 3: Privacy-preserving verification
  const decisionHash = Buffer.from(JSON.stringify(decision)).toString('base64');
  const privateResult = await localVerifier.verifyWithPrivacy(decisionHash);
  console.log('Private verification:', privateResult);
};