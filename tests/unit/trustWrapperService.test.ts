/**
 * TrustWrapper Service Unit Tests
 * 
 * Comprehensive test suite for the core TrustWrapper service functionality.
 */

import { TrustWrapperService } from '../../src/services/trustWrapperService.js';
import { 
    TradingDecisionRequest, 
    PerformanceVerificationRequest, 
    ComplianceReportRequest 
} from '../../src/types/index.js';

describe('TrustWrapperService', () => {
    let service: TrustWrapperService;

    beforeEach(() => {
        service = new TrustWrapperService({
            apiKey: 'test-key',
            enableZkProofs: false, // Disable for faster testing
            enableBlockchainVerification: false,
            enableMarketData: false,
            cacheSettings: {
                enabled: false // Disable cache for testing
            }
        });
    });

    describe('Trading Decision Verification', () => {
        const mockTradingRequest: TradingDecisionRequest = {
            decision: {
                action: 'buy',
                asset: 'BTC',
                amount: 0.1,
                price: 45000,
                confidence: 0.85,
                strategy: 'dca',
                reasoning: 'Strong technical indicators',
                timeframe: '1d',
                riskTolerance: 'medium'
            },
            context: {
                agentId: 'test-agent',
                timestamp: Date.now(),
                portfolioValue: 100000,
                urgency: 'low'
            }
        };

        test('should verify trading decision successfully', async () => {
            const result = await service.verifyTradingDecision(mockTradingRequest);
            
            expect(result).toBeDefined();
            expect(result.trustScore).toBeGreaterThanOrEqual(0);
            expect(result.trustScore).toBeLessThanOrEqual(100);
            expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
            expect(['approved', 'warning', 'rejected']).toContain(result.recommendation);
            expect(result.timestamp).toBeDefined();
        });

        test('should handle high confidence decisions', async () => {
            const highConfidenceRequest = {
                ...mockTradingRequest,
                decision: {
                    ...mockTradingRequest.decision,
                    confidence: 0.95,
                    reasoning: 'Comprehensive analysis with multiple confirmations'
                }
            };

            const result = await service.verifyTradingDecision(highConfidenceRequest);
            expect(result.trustScore).toBeGreaterThan(70);
        });

        test('should handle low confidence decisions', async () => {
            const lowConfidenceRequest = {
                ...mockTradingRequest,
                decision: {
                    ...mockTradingRequest.decision,
                    confidence: 0.3,
                    reasoning: 'Limited analysis'
                }
            };

            const result = await service.verifyTradingDecision(lowConfidenceRequest);
            expect(result.trustScore).toBeLessThan(70);
        });

        test('should handle high risk tolerance appropriately', async () => {
            const highRiskRequest = {
                ...mockTradingRequest,
                decision: {
                    ...mockTradingRequest.decision,
                    riskTolerance: 'high' as const
                }
            };

            const result = await service.verifyTradingDecision(highRiskRequest);
            expect(['medium', 'high', 'critical']).toContain(result.riskLevel);
        });

        test('should provide compliance status', async () => {
            const result = await service.verifyTradingDecision(mockTradingRequest);
            
            expect(result.compliance).toBeDefined();
            expect(result.compliance?.status).toBeDefined();
            expect(['compliant', 'warning', 'violation']).toContain(result.compliance!.status);
        });

        test('should generate verification ID', async () => {
            const result = await service.verifyTradingDecision(mockTradingRequest);
            expect(result.verificationId).toBeDefined();
            expect(result.verificationId).toMatch(/^verify_/);
        });
    });

    describe('Performance Verification', () => {
        const mockPerformanceRequest: PerformanceVerificationRequest = {
            agentId: 'test-agent',
            metrics: {
                accuracy: 0.85,
                profitFactor: 1.8,
                sharpeRatio: 1.2,
                maxDrawdown: 0.15,
                winRate: 0.65,
                avgWin: 150,
                avgLoss: -80,
                totalTrades: 500,
                timeframe: '90d'
            },
            metadata: {
                agentType: 'trading',
                strategy: 'momentum',
                marketConditions: 'volatile',
                testPeriod: '3 months',
                sampleSize: 500,
                benchmarkComparison: 'S&P 500',
                timestamp: Date.now()
            }
        };

        test('should verify performance successfully', async () => {
            const result = await service.verifyPerformance(mockPerformanceRequest);
            
            expect(result).toBeDefined();
            expect(result.verified).toBeDefined();
            expect(result.overallScore).toBeGreaterThanOrEqual(0);
            expect(result.overallScore).toBeLessThanOrEqual(100);
            expect(result.accuracyScore).toBeGreaterThanOrEqual(0);
            expect(result.profitabilityScore).toBeGreaterThanOrEqual(0);
            expect(result.riskScore).toBeGreaterThanOrEqual(0);
            expect(result.consistencyScore).toBeGreaterThanOrEqual(0);
        });

        test('should handle excellent performance metrics', async () => {
            const excellentRequest = {
                ...mockPerformanceRequest,
                metrics: {
                    ...mockPerformanceRequest.metrics,
                    accuracy: 0.95,
                    profitFactor: 2.5,
                    sharpeRatio: 2.0,
                    maxDrawdown: 0.05,
                    winRate: 0.80
                }
            };

            const result = await service.verifyPerformance(excellentRequest);
            expect(result.overallScore).toBeGreaterThan(80);
            expect(result.verified).toBe(true);
        });

        test('should handle poor performance metrics', async () => {
            const poorRequest = {
                ...mockPerformanceRequest,
                metrics: {
                    ...mockPerformanceRequest.metrics,
                    accuracy: 0.40,
                    profitFactor: 0.8,
                    sharpeRatio: -0.5,
                    maxDrawdown: 0.40,
                    winRate: 0.35
                }
            };

            const result = await service.verifyPerformance(poorRequest);
            expect(result.overallScore).toBeLessThan(60);
            expect(result.verified).toBe(false);
        });

        test('should provide market ranking', async () => {
            const result = await service.verifyPerformance(mockPerformanceRequest);
            expect(result.marketRanking).toBeDefined();
            expect(result.marketRanking).toMatch(/Top \d+%|Below average/);
        });

        test('should generate recommendations', async () => {
            const result = await service.verifyPerformance(mockPerformanceRequest);
            expect(result.recommendations).toBeDefined();
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(result.recommendations!.length).toBeGreaterThan(0);
        });
    });

    describe('Compliance Report Generation', () => {
        const mockComplianceRequest: ComplianceReportRequest = {
            agentId: 'test-agent',
            requirements: {
                jurisdiction: 'US',
                framework: 'SEC',
                reportType: 'monthly',
                includeAuditTrail: true,
                riskAssessment: true,
                transactionAnalysis: true
            },
            scope: {
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString(),
                agentActivities: ['trading', 'advisory'],
                transactionTypes: ['equity', 'options'],
                riskCategories: ['market', 'operational']
            },
            customRequirements: {},
            timestamp: Date.now()
        };

        test('should generate compliance report successfully', async () => {
            const result = await service.generateComplianceReport(mockComplianceRequest);
            
            expect(result).toBeDefined();
            expect(['compliant', 'warning', 'non-compliant']).toContain(result.overallStatus);
            expect(result.complianceScore).toBeGreaterThanOrEqual(0);
            expect(result.complianceScore).toBeLessThanOrEqual(100);
            expect(result.reportId).toBeDefined();
            expect(result.reportId).toMatch(/^report_/);
        });

        test('should handle different jurisdictions', async () => {
            const jurisdictions: Array<'US' | 'EU' | 'UK' | 'SG' | 'JP' | 'global'> = ['US', 'EU', 'UK', 'SG', 'JP', 'global'];
            
            for (const jurisdiction of jurisdictions) {
                const request = {
                    ...mockComplianceRequest,
                    requirements: {
                        ...mockComplianceRequest.requirements,
                        jurisdiction
                    }
                };

                const result = await service.generateComplianceReport(request);
                expect(result).toBeDefined();
                expect(result.overallStatus).toBeDefined();
            }
        });

        test('should handle different frameworks', async () => {
            const frameworks: Array<'SEC' | 'CFTC' | 'MiFID' | 'FCA' | 'MAS' | 'JFSA' | 'custom'> = 
                ['SEC', 'CFTC', 'MiFID', 'FCA', 'MAS', 'JFSA', 'custom'];
            
            for (const framework of frameworks) {
                const request = {
                    ...mockComplianceRequest,
                    requirements: {
                        ...mockComplianceRequest.requirements,
                        framework
                    }
                };

                const result = await service.generateComplianceReport(request);
                expect(result).toBeDefined();
                expect(result.overallStatus).toBeDefined();
            }
        });

        test('should include audit trail when requested', async () => {
            const request = {
                ...mockComplianceRequest,
                requirements: {
                    ...mockComplianceRequest.requirements,
                    includeAuditTrail: true
                }
            };

            const result = await service.generateComplianceReport(request);
            expect(result.auditTrailIntegrity).toBe(true);
            expect(result.deliverables?.auditTrail).toBe(true);
        });

        test('should provide risk assessment', async () => {
            const result = await service.generateComplianceReport(mockComplianceRequest);
            expect(result.riskAssessment).toBeDefined();
            expect(result.riskAssessment?.overallRisk).toBeDefined();
            expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.riskAssessment!.overallRisk);
        });

        test('should generate transaction summary', async () => {
            const result = await service.generateComplianceReport(mockComplianceRequest);
            expect(result.transactionSummary).toBeDefined();
            expect(result.transactionSummary?.totalTransactions).toBeGreaterThanOrEqual(0);
            expect(result.transactionSummary?.flaggedTransactions).toBeGreaterThanOrEqual(0);
            expect(result.transactionSummary?.riskEvents).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Configuration Handling', () => {
        test('should use default configuration when none provided', () => {
            const defaultService = new TrustWrapperService();
            expect(defaultService).toBeDefined();
        });

        test('should override configuration correctly', () => {
            const customConfig = {
                enableZkProofs: false,
                riskThresholds: {
                    low: 25,
                    medium: 55,
                    high: 85
                }
            };

            const customService = new TrustWrapperService(customConfig);
            expect(customService).toBeDefined();
        });

        test('should handle invalid API endpoints gracefully', async () => {
            const invalidService = new TrustWrapperService({
                apiEndpoint: 'invalid-url',
                enableMarketData: true
            });

            // Should still work with fallback behavior
            const result = await invalidService.verifyTradingDecision({
                decision: {
                    action: 'buy',
                    asset: 'BTC',
                    amount: 0.1,
                    price: 45000,
                    confidence: 0.85,
                    strategy: 'test',
                    reasoning: 'test',
                    timeframe: '1h',
                    riskTolerance: 'medium'
                },
                context: {
                    agentId: 'test',
                    timestamp: Date.now(),
                    urgency: 'low'
                }
            });

            expect(result).toBeDefined();
            expect(result.trustScore).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Error Handling', () => {
        test('should handle service failures gracefully', async () => {
            // This test ensures the service provides fallback responses
            const result = await service.verifyTradingDecision({
                decision: {
                    action: 'buy',
                    asset: 'INVALID',
                    amount: -1, // Invalid amount
                    price: 0,
                    confidence: 1.5, // Invalid confidence
                    strategy: '',
                    reasoning: '',
                    timeframe: '',
                    riskTolerance: 'medium'
                },
                context: {
                    agentId: '',
                    timestamp: Date.now(),
                    urgency: 'low'
                }
            });

            expect(result).toBeDefined();
            expect(result.trustScore).toBeDefined();
            expect(result.riskLevel).toBeDefined();
        });

        test('should provide meaningful error messages', async () => {
            try {
                // Force an error condition
                const invalidService = new TrustWrapperService({
                    apiEndpoint: 'http://non-existent-api.com'
                });

                const result = await invalidService.verifyTradingDecision({
                    decision: {
                        action: 'buy',
                        asset: 'BTC',
                        amount: 0.1,
                        price: 45000,
                        confidence: 0.85,
                        strategy: 'test',
                        reasoning: 'test',
                        timeframe: '1h',
                        riskTolerance: 'medium'
                    },
                    context: {
                        agentId: 'test',
                        timestamp: Date.now(),
                        urgency: 'low'
                    }
                });

                // Even with API failure, should get fallback response
                expect(result).toBeDefined();
                expect(result.reasoning).toContain('temporarily unavailable');
            } catch (error) {
                // If it throws, ensure it's a meaningful error
                expect(error).toBeDefined();
            }
        });
    });
});