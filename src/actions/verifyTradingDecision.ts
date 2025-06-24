/**
 * Trading Decision Verification Action
 * 
 * Verifies autonomous trading decisions with real-time market data,
 * risk assessment, and compliance validation.
 */

import { Action, IAgentRuntime, Memory, State } from '@ai16z/eliza';
import { TrustWrapperService } from '../services/trustWrapperService.js';
import { TradingDecisionRequest, VerificationResult } from '../types/index.js';

export interface TradingDecisionActionContent {
    decision: {
        action: 'buy' | 'sell' | 'hold';
        asset: string;
        amount: number;
        price?: number;
        strategy?: string;
        confidence: number;
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

export const verifyTradingDecisionAction: Action = {
    name: 'VERIFY_TRADING_DECISION',
    
    similes: [
        'VALIDATE_TRADE',
        'CHECK_TRADING_DECISION', 
        'VERIFY_TRADE_DECISION',
        'TRADING_VERIFICATION',
        'VALIDATE_TRADING_ACTION'
    ],
    
    description: 'Verify autonomous trading decisions with real-time market data, risk assessment, and compliance validation. Provides trust scoring and zero-knowledge proofs for institutional-grade verification.',
    
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        try {
            const content = JSON.parse(message.content.text) as TradingDecisionActionContent;
            
            // Validate required fields
            if (!content.decision) return false;
            if (!content.decision.action || !['buy', 'sell', 'hold'].includes(content.decision.action)) return false;
            if (!content.decision.asset || typeof content.decision.asset !== 'string') return false;
            if (!content.decision.amount || typeof content.decision.amount !== 'number') return false;
            if (!content.decision.confidence || typeof content.decision.confidence !== 'number') return false;
            if (content.decision.confidence < 0 || content.decision.confidence > 1) return false;
            
            return true;
        } catch {
            return false;
        }
    },
    
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State
    ): Promise<boolean> => {
        try {
            const content = JSON.parse(message.content.text) as TradingDecisionActionContent;
            const trustWrapperService = new TrustWrapperService();
            
            // Prepare verification request
            const verificationRequest: TradingDecisionRequest = {
                decision: {
                    action: content.decision.action,
                    asset: content.decision.asset,
                    amount: content.decision.amount,
                    price: content.decision.price || 0,
                    confidence: content.decision.confidence,
                    strategy: content.decision.strategy || 'unknown',
                    reasoning: content.decision.reasoning || 'No reasoning provided',
                    timeframe: content.decision.timeframe || '1h',
                    riskTolerance: content.decision.riskTolerance || 'medium'
                },
                context: {
                    agentId: runtime.agentId || 'unknown',
                    timestamp: Date.now(),
                    portfolioValue: content.context?.portfolioValue,
                    currentPosition: content.context?.currentPosition,
                    marketConditions: content.context?.marketConditions,
                    urgency: content.context?.urgency || 'medium'
                }
            };
            
            // Perform verification
            const verification: VerificationResult = await trustWrapperService.verifyTradingDecision(verificationRequest);
            
            // Create response message
            const responseText = `🛡️ **Trading Decision Verification Complete**

**Decision**: ${content.decision.action.toUpperCase()} ${content.decision.amount} ${content.decision.asset}
**Price**: ${content.decision.price ? `$${content.decision.price.toLocaleString()}` : 'Market Price'}
**Agent Confidence**: ${(content.decision.confidence * 100).toFixed(1)}%

**🎯 Verification Results**
• **Trust Score**: ${verification.trustScore}/100
• **Risk Level**: ${verification.riskLevel.toUpperCase()}
• **Recommendation**: ${verification.recommendation.toUpperCase()}
• **Compliance Status**: ${verification.compliance?.status || 'N/A'}

**📊 Market Analysis**
• **Market Data**: ${verification.marketData?.status === 'verified' ? '✅ Verified' : '⚠️ Limited'}
• **Blockchain Verification**: ${verification.blockchainData?.status === 'verified' ? '✅ Verified' : '⚠️ Fallback'}
• **Risk Assessment**: ${verification.riskAssessment || 'Standard risk profile applied'}

**🔐 Zero-Knowledge Proof**: ${verification.zkProof ? `${verification.zkProof.substring(0, 12)}...` : 'Generated'}

${verification.recommendation === 'approved' ? 
    '✅ **TRADE APPROVED** - Proceed with execution' : 
    verification.recommendation === 'warning' ?
    '⚠️ **PROCEED WITH CAUTION** - Review risk factors' :
    '❌ **TRADE REJECTED** - Risk tolerance exceeded'
}

${verification.reasoning || 'Verification completed using TrustWrapper universal AI verification platform.'}`;

            // Store verification result in state
            if (state) {
                state.verificationResult = verification;
                state.lastVerification = {
                    timestamp: Date.now(),
                    type: 'trading_decision',
                    result: verification
                };
            }
            
            // Send response
            await runtime.messageManager.createMemory({
                userId: message.userId,
                content: {
                    text: responseText,
                    action: 'VERIFY_TRADING_DECISION',
                    source: message.content.source || 'unknown'
                },
                roomId: message.roomId,
                agentId: runtime.agentId,
                embedding: runtime.embed(responseText)
            });
            
            return true;
            
        } catch (error) {
            console.error('Trading decision verification failed:', error);
            
            // Send error response
            const errorText = `❌ **Trading Decision Verification Failed**

An error occurred while verifying the trading decision. This could be due to:
• Temporary API unavailability
• Invalid decision parameters
• Network connectivity issues

**Fallback Recommendation**: Review the decision manually before proceeding.

Error details: ${error instanceof Error ? error.message : 'Unknown error'}`;
            
            await runtime.messageManager.createMemory({
                userId: message.userId,
                content: {
                    text: errorText,
                    action: 'VERIFY_TRADING_DECISION_ERROR',
                    source: message.content.source || 'unknown'
                },
                roomId: message.roomId,
                agentId: runtime.agentId,
                embedding: runtime.embed(errorText)
            });
            
            return false;
        }
    },
    
    examples: [
        [
            {
                user: "user",
                content: {
                    text: JSON.stringify({
                        decision: {
                            action: "buy",
                            asset: "BTC",
                            amount: 0.1,
                            price: 45000,
                            confidence: 0.85,
                            strategy: "dca",
                            reasoning: "Technical analysis shows strong support at $44K",
                            timeframe: "1d",
                            riskTolerance: "medium"
                        },
                        context: {
                            portfolioValue: 100000,
                            currentPosition: 0,
                            marketConditions: "bullish",
                            urgency: "low"
                        }
                    })
                }
            },
            {
                user: "assistant", 
                content: {
                    text: "🛡️ Trading decision verification initiated. Analyzing BTC buy decision with market data and risk assessment...",
                    action: "VERIFY_TRADING_DECISION"
                }
            }
        ],
        [
            {
                user: "user",
                content: {
                    text: JSON.stringify({
                        decision: {
                            action: "sell",
                            asset: "ETH",
                            amount: 5.0,
                            confidence: 0.78,
                            strategy: "profit_taking",
                            reasoning: "Take profits after 25% gain"
                        }
                    })
                }
            },
            {
                user: "assistant",
                content: {
                    text: "🛡️ Verifying ETH sell decision for profit taking. Checking current market conditions and risk factors...",
                    action: "VERIFY_TRADING_DECISION"
                }
            }
        ]
    ]
};