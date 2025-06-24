/**
 * TrustWrapper Evaluator
 * 
 * Evaluates AI agent responses based on verification status, trust metrics,
 * and compliance requirements. Provides quality scoring for marketplace trust.
 */

import { Evaluator, IAgentRuntime, Memory, State } from '@ai16z/eliza';
import { TrustWrapperEvaluationCriteria } from '../types/index.js';

export const trustWrapperEvaluator: Evaluator = {
    name: 'trustwrapper',
    
    description: 'Evaluates AI agent responses based on verification status, trust metrics, compliance requirements, and response quality for marketplace trust scoring.',
    
    similes: [
        'TRUST_EVALUATION',
        'VERIFICATION_SCORING',
        'COMPLIANCE_ASSESSMENT',
        'QUALITY_EVALUATION',
        'REPUTATION_SCORING'
    ],
    
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        // Always validate - we want to evaluate all responses for trust scoring
        return true;
    },
    
    handler: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<Memory[]> => {
        try {
            // Get evaluation criteria from config or defaults
            const criteria: TrustWrapperEvaluationCriteria = {
                trustScoreWeight: 0.3,
                complianceWeight: 0.25,
                riskWeight: 0.2,
                accuracyWeight: 0.25,
                minimumTrustScore: 60,
                maximumRiskLevel: 'high',
                ...(runtime.character?.settings?.trustWrapper?.evaluationCriteria || {})
            };
            
            // Perform comprehensive evaluation
            const evaluation = await evaluateResponse({
                message,
                state,
                criteria,
                runtime
            });
            
            // Create evaluation result memory
            const evaluationMemory: Memory = {
                id: runtime.messageManager.createMemoryId(),
                userId: message.userId,
                agentId: runtime.agentId,
                content: {
                    text: formatEvaluationResults(evaluation),
                    action: 'TRUSTWRAPPER_EVALUATION',
                    source: 'trustwrapper_evaluator'
                },
                roomId: message.roomId,
                timestamp: Date.now(),
                embedding: runtime.embed(formatEvaluationResults(evaluation))
            };
            
            // Update state with evaluation results
            if (state) {
                state.lastEvaluation = {
                    timestamp: Date.now(),
                    score: evaluation.overallScore,
                    criteria: evaluation.criteria,
                    details: evaluation.details
                };
                
                // Update evaluation history
                if (!state.evaluationHistory) {
                    state.evaluationHistory = [];
                }
                state.evaluationHistory.push({
                    timestamp: Date.now(),
                    messageId: message.id,
                    score: evaluation.overallScore,
                    details: evaluation.details
                });
                
                // Keep only last 50 evaluations
                if (state.evaluationHistory.length > 50) {
                    state.evaluationHistory = state.evaluationHistory.slice(-50);
                }
            }
            
            return [evaluationMemory];
            
        } catch (error) {
            console.error('TrustWrapper evaluation failed:', error);
            
            // Return error evaluation
            const errorMemory: Memory = {
                id: runtime.messageManager.createMemoryId(),
                userId: message.userId,
                agentId: runtime.agentId,
                content: {
                    text: `🛡️ **TrustWrapper Evaluation Error**\n\nEvaluation temporarily unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    action: 'TRUSTWRAPPER_EVALUATION_ERROR',
                    source: 'trustwrapper_evaluator'
                },
                roomId: message.roomId,
                timestamp: Date.now(),
                embedding: runtime.embed('TrustWrapper evaluation error')
            };
            
            return [errorMemory];
        }
    },
    
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Trading decision: Buy 0.1 BTC at $45,000"
                }
            },
            {
                user: "assistant",
                content: {
                    text: "🛡️ TrustWrapper Evaluation: Trust Score 85/100, Compliant, Low Risk",
                    action: "TRUSTWRAPPER_EVALUATION"
                }
            }
        ]
    ]
};

// Core evaluation logic
async function evaluateResponse(params: {
    message: Memory;
    state?: State;
    criteria: TrustWrapperEvaluationCriteria;
    runtime: IAgentRuntime;
}): Promise<EvaluationResult> {
    const { message, state, criteria } = params;
    
    // Extract verification data from state
    const lastVerification = state?.lastVerification;
    const verificationHistory = state?.verificationHistory || [];
    const complianceReport = state?.complianceReport;
    const performanceVerification = state?.performanceVerification;
    
    // Calculate individual scores
    const trustScore = calculateTrustScore(lastVerification, criteria);
    const complianceScore = calculateComplianceScore(complianceReport, criteria);
    const riskScore = calculateRiskScore(lastVerification, criteria);
    const accuracyScore = calculateAccuracyScore(performanceVerification, message, criteria);
    
    // Calculate weighted overall score
    const overallScore = Math.round(
        (trustScore.score * criteria.trustScoreWeight) +
        (complianceScore.score * criteria.complianceWeight) +
        (riskScore.score * criteria.riskWeight) +
        (accuracyScore.score * criteria.accuracyWeight)
    );
    
    // Determine quality tier
    const qualityTier = getQualityTier(overallScore);
    
    // Generate recommendations
    const recommendations = generateRecommendations({
        trustScore,
        complianceScore,
        riskScore,
        accuracyScore,
        overallScore,
        criteria
    });
    
    // Check if response meets minimum standards
    const meetsStandards = checkMinimumStandards(overallScore, lastVerification, criteria);
    
    return {
        overallScore,
        qualityTier,
        meetsStandards,
        criteria: {
            trustScore,
            complianceScore,
            riskScore,
            accuracyScore
        },
        details: {
            verificationCount: verificationHistory.length,
            lastVerificationTime: lastVerification?.timestamp,
            hasCompliance: !!complianceReport,
            hasPerformanceData: !!performanceVerification
        },
        recommendations,
        timestamp: Date.now()
    };
}

// Individual scoring functions
function calculateTrustScore(lastVerification: any, criteria: TrustWrapperEvaluationCriteria): ScoreResult {
    if (!lastVerification || !lastVerification.result) {
        return {
            score: 50,
            details: 'No recent verification available',
            status: 'warning'
        };
    }
    
    const trustScore = lastVerification.result.trustScore || 0;
    
    return {
        score: trustScore,
        details: `Current trust score: ${trustScore}/100`,
        status: trustScore >= criteria.minimumTrustScore ? 'good' : 'warning'
    };
}

function calculateComplianceScore(complianceReport: any, criteria: TrustWrapperEvaluationCriteria): ScoreResult {
    if (!complianceReport) {
        return {
            score: 70,
            details: 'No compliance report available - using default score',
            status: 'warning'
        };
    }
    
    const complianceScore = complianceReport.complianceScore || 0;
    const status = complianceReport.overallStatus;
    
    return {
        score: complianceScore,
        details: `Compliance status: ${status}, Score: ${complianceScore}/100`,
        status: status === 'compliant' ? 'good' : status === 'warning' ? 'warning' : 'poor'
    };
}

function calculateRiskScore(lastVerification: any, criteria: TrustWrapperEvaluationCriteria): ScoreResult {
    if (!lastVerification || !lastVerification.result) {
        return {
            score: 60,
            details: 'No risk data available',
            status: 'warning'
        };
    }
    
    const riskLevel = lastVerification.result.riskLevel;
    let score: number;
    let status: 'good' | 'warning' | 'poor';
    
    switch (riskLevel) {
        case 'low':
            score = 90;
            status = 'good';
            break;
        case 'medium':
            score = 70;
            status = 'warning';
            break;
        case 'high':
            score = 40;
            status = 'poor';
            break;
        case 'critical':
            score = 20;
            status = 'poor';
            break;
        default:
            score = 60;
            status = 'warning';
    }
    
    return {
        score,
        details: `Risk level: ${riskLevel}`,
        status
    };
}

function calculateAccuracyScore(performanceVerification: any, message: Memory, criteria: TrustWrapperEvaluationCriteria): ScoreResult {
    if (!performanceVerification) {
        // Evaluate response quality based on content
        const contentQuality = evaluateContentQuality(message.content.text);
        return {
            score: contentQuality.score,
            details: contentQuality.reasoning,
            status: contentQuality.score >= 70 ? 'good' : contentQuality.score >= 50 ? 'warning' : 'poor'
        };
    }
    
    const accuracyScore = performanceVerification.accuracyScore || 0;
    
    return {
        score: accuracyScore,
        details: `Historical accuracy: ${accuracyScore}/100`,
        status: accuracyScore >= 80 ? 'good' : accuracyScore >= 60 ? 'warning' : 'poor'
    };
}

function evaluateContentQuality(content: string): { score: number; reasoning: string } {
    let score = 50; // Base score
    const reasons: string[] = [];
    
    // Length check
    if (content.length > 100) {
        score += 10;
        reasons.push('Adequate response length');
    }
    
    // Structure check
    if (content.includes('**') || content.includes('•') || content.includes('\n')) {
        score += 10;
        reasons.push('Well-structured formatting');
    }
    
    // TrustWrapper integration check
    if (content.includes('🛡️') || content.toLowerCase().includes('verification')) {
        score += 15;
        reasons.push('Includes verification context');
    }
    
    // Data or numbers check
    if (/\d+/.test(content)) {
        score += 10;
        reasons.push('Contains quantitative data');
    }
    
    // Error handling check
    if (content.toLowerCase().includes('error') && content.toLowerCase().includes('fallback')) {
        score += 5;
        reasons.push('Includes error handling');
    }
    
    return {
        score: Math.min(100, score),
        reasoning: reasons.join(', ') || 'Basic response quality'
    };
}

function getQualityTier(score: number): string {
    if (score >= 90) return '🏆 PLATINUM';
    if (score >= 80) return '🥇 GOLD';
    if (score >= 70) return '🥈 SILVER';
    if (score >= 60) return '🥉 BRONZE';
    return '📊 STANDARD';
}

function checkMinimumStandards(overallScore: number, lastVerification: any, criteria: TrustWrapperEvaluationCriteria): boolean {
    // Check overall score
    if (overallScore < criteria.minimumTrustScore) return false;
    
    // Check risk level
    if (lastVerification?.result?.riskLevel === 'critical') return false;
    
    // Add other minimum standard checks as needed
    return true;
}

function generateRecommendations(data: {
    trustScore: ScoreResult;
    complianceScore: ScoreResult;
    riskScore: ScoreResult;
    accuracyScore: ScoreResult;
    overallScore: number;
    criteria: TrustWrapperEvaluationCriteria;
}): string[] {
    const recommendations: string[] = [];
    
    if (data.trustScore.status !== 'good') {
        recommendations.push('Improve verification trust score through better decision reasoning');
    }
    
    if (data.complianceScore.status !== 'good') {
        recommendations.push('Address compliance gaps and implement audit trail');
    }
    
    if (data.riskScore.status !== 'good') {
        recommendations.push('Implement stronger risk management controls');
    }
    
    if (data.accuracyScore.status !== 'good') {
        recommendations.push('Enhance response accuracy and detail');
    }
    
    if (data.overallScore < 80) {
        recommendations.push('Overall performance improvement needed for higher marketplace ranking');
    }
    
    return recommendations.length > 0 ? recommendations : ['Performance meets quality standards'];
}

function formatEvaluationResults(evaluation: EvaluationResult): string {
    const statusEmoji = evaluation.meetsStandards ? '✅' : '⚠️';
    
    return `🛡️ **TrustWrapper Quality Evaluation**

**Overall Assessment**
• **Quality Score**: ${evaluation.overallScore}/100
• **Quality Tier**: ${evaluation.qualityTier}
• **Standards**: ${statusEmoji} ${evaluation.meetsStandards ? 'MEETS STANDARDS' : 'REVIEW NEEDED'}

**Detailed Scoring**
• **Trust Score**: ${evaluation.criteria.trustScore.score}/100 (${evaluation.criteria.trustScore.details})
• **Compliance**: ${evaluation.criteria.complianceScore.score}/100 (${evaluation.criteria.complianceScore.details})
• **Risk Management**: ${evaluation.criteria.riskScore.score}/100 (${evaluation.criteria.riskScore.details})
• **Response Quality**: ${evaluation.criteria.accuracyScore.score}/100 (${evaluation.criteria.accuracyScore.details})

**Verification Context**
• **Total Verifications**: ${evaluation.details.verificationCount}
• **Last Verification**: ${evaluation.details.lastVerificationTime ? new Date(evaluation.details.lastVerificationTime).toLocaleString() : 'None'}
• **Compliance Report**: ${evaluation.details.hasCompliance ? 'Available' : 'Not available'}
• **Performance Data**: ${evaluation.details.hasPerformanceData ? 'Available' : 'Not available'}

**Recommendations**
${evaluation.recommendations.map(rec => `• ${rec}`).join('\n')}

---
*Evaluation powered by TrustWrapper universal AI verification platform*`;
}

// Type definitions for evaluation results
interface ScoreResult {
    score: number;
    details: string;
    status: 'good' | 'warning' | 'poor';
}

interface EvaluationResult {
    overallScore: number;
    qualityTier: string;
    meetsStandards: boolean;
    criteria: {
        trustScore: ScoreResult;
        complianceScore: ScoreResult;
        riskScore: ScoreResult;
        accuracyScore: ScoreResult;
    };
    details: {
        verificationCount: number;
        lastVerificationTime?: number;
        hasCompliance: boolean;
        hasPerformanceData: boolean;
    };
    recommendations: string[];
    timestamp: number;
}