# Migration Guide: TrustWrapper v1.0 to v2.0

## Overview

TrustWrapper v2.0 introduces a **local-first architecture** that addresses the critical security vulnerabilities in v1.0. This guide helps you migrate safely.

## Key Changes

### 🔒 Security Model
- **v1.0**: Centralized API receives pre-trade data
- **v2.0**: Local verification with optional API for post-trade auditing

### 🏗️ Architecture
- **v1.0**: External API dependency
- **v2.0**: Local-first with progressive enhancement

### 🔐 Privacy
- **v1.0**: Full trading details sent to API
- **v2.0**: Zero-knowledge proofs and local verification

## Migration Steps

### Step 1: Update Package

```bash
# Uninstall v1.0
npm uninstall trustwrapper-eliza-plugin

# Install v2.0 (when available)
npm install trustwrapper-eliza-plugin@2.0.0
```

### Step 2: Update Imports

```typescript
// v1.0 (DEPRECATED)
import { trustWrapperPlugin } from 'trustwrapper-eliza-plugin';

// v2.0 (NEW)
import { 
  trustWrapperPlugin,
  LocalVerificationService,
  PrivacyMode 
} from 'trustwrapper-eliza-plugin';
```

### Step 3: Configure Local Verification

```typescript
// v1.0 Configuration (INSECURE)
const plugin = trustWrapperPlugin({
  apiUrl: 'http://74.50.113.152:8083',
  apiKey: 'your-api-key'
});

// v2.0 Configuration (SECURE)
const plugin = trustWrapperPlugin({
  mode: 'local-first',
  privacyMode: PrivacyMode.MAXIMUM,
  localVerification: {
    enabled: true,
    strictMode: true
  },
  // Optional: Post-trade auditing only
  apiConfig: {
    enabled: false, // Disabled by default
    postTradeOnly: true,
    apiUrl: 'https://api.trustwrapper.io/v2',
    apiKey: process.env.TRUSTWRAPPER_API_KEY
  }
});
```

### Step 4: Update Verification Logic

```typescript
// v1.0 (INSECURE - Sends pre-trade data)
const decision = {
  action: 'buy',
  asset: 'ETH',
  amount: 1000,
  price: 3000
};

// This exposed your trading strategy!
const result = await trustWrapper.verify(decision);

// v2.0 (SECURE - Local verification)
const localVerifier = new LocalVerificationService();

// Option 1: Full local verification
const result = await localVerifier.verifyTradingDecision(decision);

// Option 2: Privacy-preserving verification
const decisionHash = hashDecision(decision);
const result = await localVerifier.verifyWithPrivacy(decisionHash);

// Option 3: Post-trade auditing only (safe)
if (tradeExecuted) {
  await trustWrapper.auditCompletedTrade(executedTrade);
}
```

### Step 5: Implement Zero-Knowledge Proofs

```typescript
// v2.0 NEW: Generate ZK proofs locally
const zkProof = await localVerifier.generateZKProof(decision, result);

// Share proof without revealing trading details
await shareVerificationProof(zkProof);
```

## Security Best Practices

### ✅ DO:
- Run all pre-trade verification locally
- Use post-trade auditing for compliance
- Generate ZK proofs for verification sharing
- Keep sensitive logic in your agent

### ❌ DON'T:
- Send pre-trade decisions to any external API
- Trust external services with trading strategies
- Use v1.0 for production trading
- Expose trading logic to third parties

## Feature Comparison

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Pre-trade Verification | External API ❌ | Local ✅ |
| Post-trade Auditing | External API | Optional API ✅ |
| Zero-Knowledge Proofs | No | Yes ✅ |
| Privacy Protection | No | Yes ✅ |
| Front-running Risk | High ❌ | None ✅ |
| Network Dependency | Required | Optional ✅ |
| Offline Operation | No | Yes ✅ |

## Code Examples

### Example 1: Safe Trading Bot

```typescript
import { LocalVerificationService } from 'trustwrapper-eliza-plugin';

class SecureTradingBot {
  private verifier = new LocalVerificationService();
  
  async executeTrade(decision: TradingDecision) {
    // 1. Verify locally (no external calls)
    const verification = await this.verifier.verifyTradingDecision(decision);
    
    // 2. Only proceed if safe
    if (verification.recommendation === 'approved') {
      const trade = await this.executeOnBlockchain(decision);
      
      // 3. Optional: Audit after execution
      if (this.auditingEnabled) {
        await this.auditCompletedTrade(trade);
      }
      
      return trade;
    }
    
    throw new Error(`Trade rejected: ${verification.warnings.join(', ')}`);
  }
}
```

### Example 2: Privacy-Preserving Verification

```typescript
class PrivacyFirstAgent {
  async verifyWithoutExposure(decision: TradingDecision) {
    // Generate hash locally
    const decisionHash = this.hashDecision(decision);
    
    // Verify using hash only
    const result = await this.verifier.verifyWithPrivacy(decisionHash);
    
    // Generate proof for sharing
    if (result.verified) {
      const proof = await this.verifier.generateZKProof(decision, result);
      return { verified: true, proof };
    }
    
    return { verified: false };
  }
}
```

## Timeline

- **June 25, 2025**: v1.0 security advisory published
- **July 1, 2025**: v2.0 beta release
- **July 15, 2025**: v2.0 stable release
- **August 1, 2025**: v1.0 deprecation notice
- **September 1, 2025**: v1.0 API shutdown

## Support

- **Security Issues**: security@trustwrapper.io
- **Migration Help**: support@trustwrapper.io
- **Documentation**: https://docs.trustwrapper.io/v2

## Conclusion

v2.0 represents a fundamental shift to local-first, privacy-preserving verification. This migration is critical for protecting your trading strategies and preventing front-running attacks.

**Remember**: Never trust external services with pre-trade information in adversarial trading environments.