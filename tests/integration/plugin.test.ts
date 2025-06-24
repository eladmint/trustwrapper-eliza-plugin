/**
 * Plugin Integration Tests
 * 
 * Tests the complete plugin integration with Eliza framework.
 */

import { TrustWrapperPlugin } from '../../src/index.js';
import { 
    verifyTradingDecisionAction,
    verifyPerformanceAction,
    generateComplianceReportAction
} from '../../src/index.js';

// Mock Eliza types for testing
interface MockRuntime {
    agentId: string;
    messageManager: {
        createMemory: (memory: any) => Promise<void>;
        createMemoryId: () => string;
    };
    embed: (text: string) => number[];
    character?: {
        settings?: {
            trustWrapper?: any;
        };
    };
}

interface MockMemory {
    id: string;
    userId: string;
    agentId: string;
    content: {
        text: string;
        action?: string;
        source?: string;
    };
    roomId: string;
    timestamp: number;
    embedding?: number[];
}

interface MockState {
    [key: string]: any;
}

describe('TrustWrapper Plugin Integration', () => {
    let mockRuntime: MockRuntime;
    let mockMemory: MockMemory;
    let mockState: MockState;

    beforeEach(() => {
        mockRuntime = {
            agentId: 'test-agent',
            messageManager: {
                createMemory: jest.fn(),
                createMemoryId: () => 'mock-memory-id'
            },
            embed: (text: string) => [0.1, 0.2, 0.3] // Mock embedding
        };

        mockMemory = {
            id: 'test-memory',
            userId: 'test-user',
            agentId: 'test-agent',
            content: {
                text: '',
                source: 'test'
            },
            roomId: 'test-room',
            timestamp: Date.now()
        };

        mockState = {};
    });

    describe('Plugin Structure', () => {
        test('should have correct plugin structure', () => {
            expect(TrustWrapperPlugin.name).toBe('trustwrapper-universal-verification');
            expect(TrustWrapperPlugin.description).toContain('Universal AI verification');
            expect(TrustWrapperPlugin.actions).toHaveLength(3);
            expect(TrustWrapperPlugin.providers).toHaveLength(1);
            expect(TrustWrapperPlugin.evaluators).toHaveLength(1);
        });

        test('should export all required actions', () => {
            expect(verifyTradingDecisionAction).toBeDefined();
            expect(verifyTradingDecisionAction.name).toBe('VERIFY_TRADING_DECISION');
            
            expect(verifyPerformanceAction).toBeDefined();
            expect(verifyPerformanceAction.name).toBe('VERIFY_PERFORMANCE');
            
            expect(generateComplianceReportAction).toBeDefined();
            expect(generateComplianceReportAction.name).toBe('GENERATE_COMPLIANCE_REPORT');
        });

        test('should have proper action descriptions', () => {
            TrustWrapperPlugin.actions.forEach(action => {
                expect(action.name).toBeDefined();
                expect(action.description).toBeDefined();
                expect(action.description.length).toBeGreaterThan(50);
                expect(action.validate).toBeDefined();
                expect(action.handler).toBeDefined();
            });
        });
    });

    describe('Trading Decision Action Integration', () => {
        test('should validate valid trading decision', async () => {
            const validRequest = {
                decision: {
                    action: 'buy',
                    asset: 'BTC',
                    amount: 0.1,
                    confidence: 0.85
                }
            };

            mockMemory.content.text = JSON.stringify(validRequest);

            const isValid = await verifyTradingDecisionAction.validate(mockRuntime as any, mockMemory as any);
            expect(isValid).toBe(true);
        });

        test('should reject invalid trading decision', async () => {
            const invalidRequest = {
                decision: {
                    action: 'invalid-action',
                    asset: '',
                    amount: -1,
                    confidence: 2.0
                }
            };

            mockMemory.content.text = JSON.stringify(invalidRequest);

            const isValid = await verifyTradingDecisionAction.validate(mockRuntime as any, mockMemory as any);
            expect(isValid).toBe(false);
        });

        test('should handle trading decision execution', async () => {
            const validRequest = {
                decision: {
                    action: 'buy',
                    asset: 'BTC',
                    amount: 0.1,
                    price: 45000,
                    confidence: 0.85,
                    strategy: 'momentum',
                    reasoning: 'Strong bullish indicators',
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

            mockMemory.content.text = JSON.stringify(validRequest);

            const result = await verifyTradingDecisionAction.handler(
                mockRuntime as any, 
                mockMemory as any, 
                mockState as any
            );

            expect(result).toBe(true);
            expect(mockRuntime.messageManager.createMemory).toHaveBeenCalled();
            expect(mockState.verificationResult).toBeDefined();
        });
    });

    describe('Performance Verification Action Integration', () => {
        test('should validate performance metrics', async () => {
            const validRequest = {
                metrics: {
                    accuracy: 0.85,
                    profitFactor: 1.8,
                    winRate: 0.65,
                    totalTrades: 500
                },
                metadata: {
                    agentType: 'trading',
                    strategy: 'momentum'
                }
            };

            mockMemory.content.text = JSON.stringify(validRequest);

            const isValid = await verifyPerformanceAction.validate(mockRuntime as any, mockMemory as any);
            expect(isValid).toBe(true);
        });

        test('should reject invalid performance metrics', async () => {
            const invalidRequest = {
                metrics: {
                    accuracy: 1.5, // Invalid - over 1.0
                    winRate: -0.1, // Invalid - negative
                    maxDrawdown: 2.0 // Invalid - over 1.0
                }
            };

            mockMemory.content.text = JSON.stringify(invalidRequest);

            const isValid = await verifyPerformanceAction.validate(mockRuntime as any, mockMemory as any);
            expect(isValid).toBe(false);
        });

        test('should handle performance verification execution', async () => {
            const validRequest = {
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

            mockMemory.content.text = JSON.stringify(validRequest);

            const result = await verifyPerformanceAction.handler(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );

            expect(result).toBe(true);
            expect(mockRuntime.messageManager.createMemory).toHaveBeenCalled();
            expect(mockState.performanceVerification).toBeDefined();
        });
    });

    describe('Compliance Report Action Integration', () => {
        test('should validate compliance requirements', async () => {
            const validRequest = {
                requirements: {
                    jurisdiction: 'US',
                    framework: 'SEC',
                    reportType: 'monthly',
                    includeAuditTrail: true,
                    riskAssessment: true,
                    transactionAnalysis: true
                }
            };

            mockMemory.content.text = JSON.stringify(validRequest);

            const isValid = await generateComplianceReportAction.validate(mockRuntime as any, mockMemory as any);
            expect(isValid).toBe(true);
        });

        test('should reject invalid compliance requirements', async () => {
            const invalidRequest = {
                requirements: {
                    jurisdiction: 'INVALID',
                    framework: 'UNKNOWN',
                    reportType: 'invalid-type'
                }
            };

            mockMemory.content.text = JSON.stringify(invalidRequest);

            const isValid = await generateComplianceReportAction.validate(mockRuntime as any, mockMemory as any);
            expect(isValid).toBe(false);
        });

        test('should handle compliance report generation', async () => {
            const validRequest = {
                requirements: {
                    jurisdiction: 'EU',
                    framework: 'MiFID',
                    reportType: 'quarterly',
                    includeAuditTrail: true,
                    riskAssessment: true,
                    transactionAnalysis: true
                },
                scope: {
                    startDate: '2025-01-01T00:00:00Z',
                    endDate: '2025-03-31T23:59:59Z',
                    agentActivities: ['trading', 'advisory'],
                    transactionTypes: ['equity', 'derivatives'],
                    riskCategories: ['market', 'operational', 'credit']
                },
                customRequirements: {
                    additionalChecks: ['stress_testing'],
                    reportingStandards: ['IFRS'],
                    complianceThresholds: {
                        riskLimit: 0.15,
                        concentrationLimit: 0.25
                    }
                }
            };

            mockMemory.content.text = JSON.stringify(validRequest);

            const result = await generateComplianceReportAction.handler(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );

            expect(result).toBe(true);
            expect(mockRuntime.messageManager.createMemory).toHaveBeenCalled();
            expect(mockState.complianceReport).toBeDefined();
        });
    });

    describe('Provider Integration', () => {
        test('should provide context without verification history', async () => {
            const { trustWrapperProvider } = await import('../../src/providers/trustWrapperProvider.js');
            
            const context = await trustWrapperProvider.get(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );

            expect(context).toContain('TrustWrapper Agent Context');
            expect(context).toContain('Trust Score');
            expect(context).toContain('Not yet verified');
        });

        test('should provide context with verification history', async () => {
            const { trustWrapperProvider } = await import('../../src/providers/trustWrapperProvider.js');
            
            mockState.verificationHistory = [
                {
                    timestamp: Date.now(),
                    type: 'trading_decision',
                    result: { trustScore: 85, riskLevel: 'low' }
                }
            ];
            mockState.lastVerification = {
                timestamp: Date.now(),
                type: 'trading_decision',
                result: { trustScore: 85, riskLevel: 'low' }
            };

            const context = await trustWrapperProvider.get(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );

            expect(context).toContain('Trust Score: 85');
            expect(context).toContain('Risk Level: low');
            expect(context).toContain('Verification Count: 1');
        });
    });

    describe('Evaluator Integration', () => {
        test('should evaluate responses', async () => {
            const { trustWrapperEvaluator } = await import('../../src/evaluators/trustWrapperEvaluator.js');
            
            mockMemory.content.text = '🛡️ Trading decision verified with 85% trust score';
            
            const isValid = await trustWrapperEvaluator.validate(mockRuntime as any, mockMemory as any);
            expect(isValid).toBe(true);

            const evaluationResults = await trustWrapperEvaluator.handler(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );

            expect(Array.isArray(evaluationResults)).toBe(true);
            expect(evaluationResults.length).toBeGreaterThan(0);
            expect(mockState.lastEvaluation).toBeDefined();
        });

        test('should handle evaluation with verification context', async () => {
            const { trustWrapperEvaluator } = await import('../../src/evaluators/trustWrapperEvaluator.js');
            
            mockState.lastVerification = {
                timestamp: Date.now(),
                type: 'trading_decision',
                result: { trustScore: 90, riskLevel: 'low' }
            };
            mockState.complianceReport = {
                overallStatus: 'compliant',
                complianceScore: 95,
                timestamp: Date.now()
            };

            const evaluationResults = await trustWrapperEvaluator.handler(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );

            expect(evaluationResults[0].content.text).toContain('Quality Score');
            expect(evaluationResults[0].content.text).toContain('PLATINUM');
        });
    });

    describe('End-to-End Workflow', () => {
        test('should execute complete verification workflow', async () => {
            // Step 1: Trading Decision Verification
            const tradingRequest = {
                decision: {
                    action: 'buy',
                    asset: 'ETH',
                    amount: 2.5,
                    price: 3200,
                    confidence: 0.88,
                    strategy: 'breakout',
                    reasoning: 'Strong breakout pattern with high volume',
                    timeframe: '4h',
                    riskTolerance: 'medium'
                }
            };

            mockMemory.content.text = JSON.stringify(tradingRequest);
            
            let result = await verifyTradingDecisionAction.handler(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );
            expect(result).toBe(true);
            expect(mockState.verificationResult).toBeDefined();

            // Step 2: Performance Verification
            const performanceRequest = {
                metrics: {
                    accuracy: 0.87,
                    profitFactor: 1.9,
                    sharpeRatio: 1.4,
                    maxDrawdown: 0.12,
                    winRate: 0.68,
                    totalTrades: 320
                }
            };

            mockMemory.content.text = JSON.stringify(performanceRequest);
            
            result = await verifyPerformanceAction.handler(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );
            expect(result).toBe(true);
            expect(mockState.performanceVerification).toBeDefined();

            // Step 3: Compliance Report
            const complianceRequest = {
                requirements: {
                    jurisdiction: 'US',
                    framework: 'SEC',
                    reportType: 'adhoc',
                    includeAuditTrail: true,
                    riskAssessment: true,
                    transactionAnalysis: true
                }
            };

            mockMemory.content.text = JSON.stringify(complianceRequest);
            
            result = await generateComplianceReportAction.handler(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );
            expect(result).toBe(true);
            expect(mockState.complianceReport).toBeDefined();

            // Step 4: Final Evaluation
            const { trustWrapperEvaluator } = await import('../../src/evaluators/trustWrapperEvaluator.js');
            
            const evaluationResults = await trustWrapperEvaluator.handler(
                mockRuntime as any,
                mockMemory as any,
                mockState as any
            );

            expect(evaluationResults.length).toBeGreaterThan(0);
            expect(mockState.lastEvaluation).toBeDefined();
            expect(mockState.evaluationHistory).toBeDefined();

            // Verify complete state
            expect(mockState.verificationResult).toBeDefined();
            expect(mockState.performanceVerification).toBeDefined();
            expect(mockState.complianceReport).toBeDefined();
            expect(mockState.lastEvaluation).toBeDefined();
        });
    });
});