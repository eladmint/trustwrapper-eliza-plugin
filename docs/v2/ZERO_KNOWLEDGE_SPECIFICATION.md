# TrustWrapper v2.0 Zero-Knowledge Proof Specification

**Version**: 2.0.0  
**Date**: June 25, 2025  
**Status**: Technical Specification  

## Overview

TrustWrapper v2.0 implements zero-knowledge proofs to enable verification result sharing without revealing sensitive trading decision details. This allows agents to prove they performed verification without exposing their trading strategies.

## 🎯 ZK Proof Objectives

1. **Privacy Preservation**: Prove verification was performed without revealing trading details
2. **Result Attestation**: Cryptographically prove verification results are authentic
3. **Selective Disclosure**: Share only necessary information (trust score, risk level)
4. **Non-Repudiation**: Verification results cannot be denied or forged
5. **Efficiency**: Fast proof generation and verification (<1s and <100ms respectively)

## 🧮 Mathematical Foundation

### Circuit Design

The zero-knowledge circuit proves the following statement:
> "I have a trading decision D and performed verification V(D) = R, where R contains the claimed trust score, risk level, and timestamp, without revealing D."

### Circuit Inputs

#### Private Inputs (Never Revealed)
```typescript
interface PrivateInputs {
  // Trading decision details
  asset: Field;           // Token/asset being traded (hashed)
  amount: Field;          // Trading amount (scaled)
  action: Field;          // BUY/SELL/HOLD (encoded)
  reasoning: Field;       // AI reasoning (hashed)
  strategy: Field;        // Trading strategy (hashed)
  
  // Additional context
  leverage: Field;        // Leverage amount
  timeframe: Field;       // Expected holding time
  confidence: Field;      // AI confidence level
}
```

#### Public Inputs (Can Be Shared)
```typescript
interface PublicInputs {
  // Verification results
  trustScore: Field;      // 0-100 trust score
  riskLevel: Field;       // 0=low, 1=medium, 2=high, 3=critical
  verified: Field;        // 0=rejected, 1=approved
  
  // Metadata
  timestamp: Field;       // Unix timestamp
  verifierVersion: Field; // TrustWrapper version
  rulesetHash: Field;     // Hash of verification rules used
}
```

### Circuit Constraints

```circom
pragma circom 2.0.0;

template TrustWrapperVerification() {
    // Private inputs
    signal private input asset;
    signal private input amount;
    signal private input action;
    signal private input reasoning;
    signal private input strategy;
    signal private input leverage;
    signal private input timeframe;
    signal private input confidence;
    
    // Public inputs
    signal input trustScore;
    signal input riskLevel;
    signal input verified;
    signal input timestamp;
    signal input verifierVersion;
    signal input rulesetHash;
    
    // Output
    signal output validVerification;
    
    // Components
    component riskAnalyzer = RiskAnalyzer();
    component patternDetector = PatternDetector();
    component complianceChecker = ComplianceChecker();
    component scoreAggregator = ScoreAggregator();
    
    // Risk analysis
    riskAnalyzer.asset <== asset;
    riskAnalyzer.amount <== amount;
    riskAnalyzer.reasoning <== reasoning;
    riskAnalyzer.leverage <== leverage;
    
    // Pattern detection
    patternDetector.reasoning <== reasoning;
    patternDetector.strategy <== strategy;
    patternDetector.action <== action;
    
    // Compliance checking
    complianceChecker.asset <== asset;
    complianceChecker.amount <== amount;
    complianceChecker.timeframe <== timeframe;
    
    // Score aggregation
    scoreAggregator.riskScore <== riskAnalyzer.score;
    scoreAggregator.patternScore <== patternDetector.score;
    scoreAggregator.complianceScore <== complianceChecker.score;
    scoreAggregator.confidence <== confidence;
    
    // Verify claimed results match computed results
    scoreAggregator.trustScore === trustScore;
    scoreAggregator.riskLevel === riskLevel;
    scoreAggregator.verified === verified;
    
    // Timestamp validation (within reasonable bounds)
    component timestampValidator = TimestampValidator();
    timestampValidator.timestamp <== timestamp;
    timestampValidator.valid === 1;
    
    // Version validation
    verifierVersion === 2; // v2.0.0
    
    // Output valid verification proof
    validVerification <== 1;
}

template RiskAnalyzer() {
    signal input asset;
    signal input amount;
    signal input reasoning;
    signal input leverage;
    signal output score;
    
    component scamDetector = ScamPatternDetector();
    component amountAnalyzer = AmountRiskAnalyzer();
    component leverageAnalyzer = LeverageRiskAnalyzer();
    
    scamDetector.reasoning <== reasoning;
    amountAnalyzer.amount <== amount;
    leverageAnalyzer.leverage <== leverage;
    
    // Risk score calculation
    score <== scamDetector.score + amountAnalyzer.score + leverageAnalyzer.score;
}

component main = TrustWrapperVerification();
```

## 🔧 Implementation

### Proof Generation

```typescript
class ZKProofGenerator {
  private readonly circuit: WasmCircuit;
  private readonly provingKey: Uint8Array;
  private readonly verifyingKey: Uint8Array;

  constructor() {
    this.circuit = new WasmCircuit('./circuits/trustwrapper.wasm');
    const keys = this.loadKeys();
    this.provingKey = keys.proving;
    this.verifyingKey = keys.verifying;
  }

  async generateProof(
    decision: TradingDecision,
    verification: VerificationResult
  ): Promise<ZKProof> {
    
    // Prepare private inputs
    const privateInputs = {
      asset: this.hashToField(decision.asset),
      amount: this.scaleAmount(decision.amount || 0),
      action: this.encodeAction(decision.action),
      reasoning: this.hashToField(decision.reasoning || ''),
      strategy: this.hashToField(decision.strategy || ''),
      leverage: this.scaleValue(decision.leverage || 1),
      timeframe: this.scaleValue(decision.timeframe || 24),
      confidence: this.scaleValue(decision.confidence || 50)
    };

    // Prepare public inputs
    const publicInputs = {
      trustScore: this.scaleValue(verification.trustScore),
      riskLevel: this.encodeRiskLevel(verification.riskLevel),
      verified: verification.verified ? 1 : 0,
      timestamp: Math.floor(Date.now() / 1000),
      verifierVersion: 2,
      rulesetHash: this.getCurrentRulesetHash()
    };

    // Generate witness
    const witness = await this.circuit.calculateWitness({
      ...privateInputs,
      ...publicInputs
    });

    // Generate proof
    const { proof, publicSignals } = await groth16.fullProve(
      witness,
      './circuits/trustwrapper.wasm',
      this.provingKey
    );

    return {
      proof: {
        pi_a: proof.pi_a,
        pi_b: proof.pi_b,
        pi_c: proof.pi_c
      },
      publicSignals,
      publicInputs,
      metadata: {
        version: '2.0.0',
        timestamp: Date.now(),
        circuit: 'trustwrapper-v2',
        prover: 'groth16'
      }
    };
  }

  async verifyProof(zkProof: ZKProof): Promise<boolean> {
    try {
      const isValid = await groth16.verify(
        this.verifyingKey,
        zkProof.publicSignals,
        zkProof.proof
      );

      // Additional validation
      if (isValid) {
        return this.validatePublicInputs(zkProof.publicInputs);
      }

      return false;
    } catch (error) {
      console.error('Proof verification failed:', error);
      return false;
    }
  }

  private hashToField(input: string): bigint {
    const hash = blake3(input);
    return BigInt('0x' + hash.slice(0, 62)); // Fit in field
  }

  private scaleAmount(amount: number): bigint {
    // Scale to avoid floating point in circuit
    return BigInt(Math.floor(amount * 1000000));
  }

  private encodeAction(action: string): bigint {
    const actionMap = { 'buy': 1n, 'sell': 2n, 'hold': 3n };
    return actionMap[action.toLowerCase()] || 0n;
  }

  private encodeRiskLevel(level: string): bigint {
    const levelMap = { 'low': 0n, 'medium': 1n, 'high': 2n, 'critical': 3n };
    return levelMap[level] || 0n;
  }

  private scaleValue(value: number): bigint {
    return BigInt(Math.floor(value));
  }

  private validatePublicInputs(inputs: PublicInputs): boolean {
    // Validate trust score range
    if (inputs.trustScore < 0 || inputs.trustScore > 100) {
      return false;
    }

    // Validate risk level
    if (inputs.riskLevel < 0 || inputs.riskLevel > 3) {
      return false;
    }

    // Validate timestamp (within last 24 hours)
    const now = Math.floor(Date.now() / 1000);
    if (inputs.timestamp > now || inputs.timestamp < now - 86400) {
      return false;
    }

    return true;
  }
}
```

### Batch Verification

```typescript
class BatchZKVerifier {
  private readonly verifier: ZKProofGenerator;

  constructor() {
    this.verifier = new ZKProofGenerator();
  }

  async verifyBatch(proofs: ZKProof[]): Promise<boolean[]> {
    // Parallel verification for efficiency
    const verificationPromises = proofs.map(proof => 
      this.verifier.verifyProof(proof)
    );

    return await Promise.all(verificationPromises);
  }

  async verifyBatchOptimized(proofs: ZKProof[]): Promise<boolean> {
    // Aggregate verification (future optimization)
    // Uses batch verification techniques for better performance
    
    if (proofs.length === 0) return true;
    if (proofs.length === 1) return this.verifier.verifyProof(proofs[0]);

    // For now, verify all and return true if all valid
    const results = await this.verifyBatch(proofs);
    return results.every(result => result);
  }
}
```

## 📊 Performance Characteristics

### Proof Generation
- **Time**: <1 second for standard verification
- **Memory**: <100MB during generation
- **Proof Size**: <1KB per proof
- **Circuit Size**: ~10,000 constraints

### Proof Verification
- **Time**: <100ms per proof
- **Memory**: <10MB during verification
- **Batch Size**: Up to 100 proofs efficiently
- **Parallelization**: Full support

### Storage Requirements
- **Circuit Files**: ~50MB (wasm + proving key)
- **Verifying Key**: ~1KB
- **Proof Archive**: ~1KB per proof + metadata

## 🔐 Security Analysis

### Cryptographic Assumptions
- **Discrete Log**: Elliptic curve discrete logarithm hardness
- **Knowledge of Exponent**: Strong knowledge of exponent assumption
- **Random Oracle**: Hash functions modeled as random oracles

### Soundness
- **Perfect Soundness**: Impossible to generate false proofs
- **Knowledge Extraction**: Prover must know private inputs
- **Non-malleability**: Proofs cannot be modified

### Zero-Knowledge
- **Perfect Zero-Knowledge**: No information leaked about private inputs
- **Simulation**: Proofs indistinguishable from simulated proofs
- **Composability**: Multiple proofs don't leak information

## 🛠️ Development Tools

### Circuit Development
```bash
# Compile circuit
circom trustwrapper.circom --r1cs --wasm --sym

# Generate trusted setup
snarkjs groth16 setup trustwrapper.r1cs pot12_final.ptau circuit_final.zkey

# Export verifying key
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# Generate proof
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json

# Verify proof
snarkjs groth16 verify verification_key.json public.json proof.json
```

### Testing Framework
```typescript
class ZKTestSuite {
  async testProofGeneration() {
    const decision = createTestDecision();
    const verification = await verifyLocally(decision);
    const proof = await this.generator.generateProof(decision, verification);
    
    assert(proof.proof !== null);
    assert(proof.publicInputs.trustScore === verification.trustScore);
  }

  async testProofVerification() {
    const proof = await this.generateTestProof();
    const isValid = await this.generator.verifyProof(proof);
    
    assert(isValid === true);
  }

  async testInvalidProofRejection() {
    const proof = await this.generateInvalidProof();
    const isValid = await this.generator.verifyProof(proof);
    
    assert(isValid === false);
  }
}
```

## 📋 Integration Guide

### Basic Usage
```typescript
import { ZKProofGenerator } from 'trustwrapper-eliza-plugin/zk';

const zkGenerator = new ZKProofGenerator();

// After local verification
const verification = await localVerifier.verify(decision);

// Generate proof
const proof = await zkGenerator.generateProof(decision, verification);

// Share proof (safe - no trading details revealed)
await shareVerificationProof(proof);

// Verify received proof
const isValid = await zkGenerator.verifyProof(receivedProof);
```

### Advanced Features
```typescript
// Batch proof generation
const proofs = await Promise.all(
  verifications.map(v => zkGenerator.generateProof(v.decision, v.result))
);

// Aggregate verification
const allValid = await batchVerifier.verifyBatchOptimized(proofs);

// Proof archival
await proofArchive.store(proof, {
  agentId: agent.id,
  timestamp: Date.now(),
  metadata: proof.metadata
});
```

---

This zero-knowledge proof system enables TrustWrapper v2.0 to provide verification attestation while maintaining complete privacy of trading strategies.