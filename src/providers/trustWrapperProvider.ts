/**
 * TrustWrapper Provider
 * 
 * Provides context and information about the agent's verification history,
 * trust metrics, and reputation for enhanced AI decision making.
 */

import { Provider, IAgentRuntime, Memory, State } from '@ai16z/eliza';
import { TrustWrapperProviderData } from '../types/index.js';
import { TrustWrapperService } from '../services/trustWrapperService.js';

export const trustWrapperProvider: Provider = {
    name: 'trustwrapper',
    
    description: 'Provides AI agent verification history, trust metrics, and reputation data for enhanced decision making and context awareness.',
    
    get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
        try {
            const trustWrapperService = new TrustWrapperService();
            
            // Get verification history from state
            const verificationHistory = state?.verificationHistory || [];
            const lastVerification = state?.lastVerification;
            const performanceVerification = state?.performanceVerification;
            const complianceReport = state?.complianceReport;
            
            // Calculate agent reputation metrics
            const agentReputation = calculateAgentReputation(verificationHistory);
            
            // Get recent trust trends
            const trustTrend = calculateTrustTrend(verificationHistory);
            
            // Build comprehensive context
            const providerData: TrustWrapperProviderData = {
                trustScore: lastVerification?.result?.trustScore,
                riskLevel: lastVerification?.result?.riskLevel,
                lastVerification,
                verificationHistory: verificationHistory.slice(-10), // Last 10 verifications
                agentReputation
            };
            
            // Format context for AI agent
            const contextText = `🛡️ **TrustWrapper Agent Context**

**Current Trust Status**
• **Trust Score**: ${providerData.trustScore || 'Not yet verified'}/100
• **Risk Level**: ${providerData.riskLevel || 'Unknown'}
• **Reputation Tier**: ${agentReputation.rank}
• **Verification Count**: ${agentReputation.verificationCount} total verifications

**Recent Performance**
${formatRecentPerformance(performanceVerification)}

**Compliance Status** 
${formatComplianceStatus(complianceReport)}

**Trust Trend Analysis**
${formatTrustTrend(trustTrend)}

**Verification History**
${formatVerificationHistory(verificationHistory)}

**Recommendations for Agent**
${generateAgentRecommendations(providerData)}

---
*This context helps the agent understand its current trust standing and make better decisions based on historical performance and reputation.*`;

            return contextText;
            
        } catch (error) {
            console.error('TrustWrapper provider error:', error);
            
            return `🛡️ **TrustWrapper Context** 

**Status**: Context temporarily unavailable
**Fallback**: Operating with standard trust parameters

The TrustWrapper verification system is temporarily unavailable. The agent will continue operating with default trust settings.

Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
};

// Helper functions for calculating reputation and trends
function calculateAgentReputation(verificationHistory: any[]): { score: number; rank: string; verificationCount: number } {
    if (!verificationHistory || verificationHistory.length === 0) {
        return {
            score: 50,
            rank: '🔰 NEW AGENT',
            verificationCount: 0
        };
    }
    
    const totalVerifications = verificationHistory.length;
    const averageTrustScore = verificationHistory.reduce((sum, v) => 
        sum + (v.result?.trustScore || 50), 0) / totalVerifications;
    
    // Calculate rank based on score and verification count
    let rank: string;
    if (averageTrustScore >= 90 && totalVerifications >= 50) {
        rank = '🏆 PLATINUM AGENT';
    } else if (averageTrustScore >= 80 && totalVerifications >= 25) {
        rank = '🥇 GOLD AGENT';
    } else if (averageTrustScore >= 70 && totalVerifications >= 10) {
        rank = '🥈 SILVER AGENT';
    } else if (averageTrustScore >= 60 && totalVerifications >= 5) {
        rank = '🥉 BRONZE AGENT';
    } else {
        rank = '📊 STANDARD AGENT';
    }
    
    return {
        score: Math.round(averageTrustScore),
        rank,
        verificationCount: totalVerifications
    };
}

function calculateTrustTrend(verificationHistory: any[]): { direction: 'improving' | 'stable' | 'declining'; change: number; period: string } {
    if (!verificationHistory || verificationHistory.length < 3) {
        return {
            direction: 'stable',
            change: 0,
            period: 'insufficient data'
        };
    }
    
    const recent = verificationHistory.slice(-5); // Last 5 verifications
    const older = verificationHistory.slice(-10, -5); // Previous 5 verifications
    
    const recentAvg = recent.reduce((sum, v) => sum + (v.result?.trustScore || 50), 0) / recent.length;
    const olderAvg = older.length > 0 ? 
        older.reduce((sum, v) => sum + (v.result?.trustScore || 50), 0) / older.length : recentAvg;
    
    const change = recentAvg - olderAvg;
    
    let direction: 'improving' | 'stable' | 'declining';
    if (change > 5) {
        direction = 'improving';
    } else if (change < -5) {
        direction = 'declining';
    } else {
        direction = 'stable';
    }
    
    return {
        direction,
        change: Math.round(change * 10) / 10,
        period: `last ${recent.length} verifications`
    };
}

function formatRecentPerformance(performanceVerification: any): string {
    if (!performanceVerification) {
        return '• No recent performance verification available';
    }
    
    const perf = performanceVerification;
    return `• **Overall Score**: ${perf.overallScore}/100
• **Accuracy**: ${perf.accuracyScore}/100
• **Profitability**: ${perf.profitabilityScore}/100
• **Risk Management**: ${perf.riskScore}/100
• **Market Ranking**: ${perf.marketRanking || 'Not ranked'}`;
}

function formatComplianceStatus(complianceReport: any): string {
    if (!complianceReport) {
        return '• No recent compliance report available';
    }
    
    const status = complianceReport.overallStatus;
    const emoji = status === 'compliant' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    
    return `• **Status**: ${emoji} ${status.toUpperCase()}
• **Compliance Score**: ${complianceReport.complianceScore}/100
• **Last Review**: ${new Date(complianceReport.timestamp).toLocaleDateString()}`;
}

function formatTrustTrend(trustTrend: any): string {
    const emoji = trustTrend.direction === 'improving' ? '📈' : 
                  trustTrend.direction === 'declining' ? '📉' : '📊';
    
    return `• **Trend**: ${emoji} ${trustTrend.direction.toUpperCase()}
• **Change**: ${trustTrend.change > 0 ? '+' : ''}${trustTrend.change} points
• **Period**: ${trustTrend.period}`;
}

function formatVerificationHistory(verificationHistory: any[]): string {
    if (!verificationHistory || verificationHistory.length === 0) {
        return '• No verification history available';
    }
    
    const recent = verificationHistory.slice(-5);
    const historyText = recent.map(v => {
        const date = new Date(v.timestamp).toLocaleDateString();
        const score = v.result?.trustScore || 'N/A';
        const type = v.type || 'unknown';
        return `  - ${date}: ${type} (Score: ${score})`;
    }).join('\n');
    
    return `Recent verifications:\n${historyText}`;
}

function generateAgentRecommendations(providerData: TrustWrapperProviderData): string {
    const recommendations: string[] = [];
    
    // Trust score recommendations
    if (!providerData.trustScore || providerData.trustScore < 70) {
        recommendations.push('Consider more thorough market analysis before making decisions');
        recommendations.push('Provide detailed reasoning for trading decisions');
    }
    
    // Risk level recommendations
    if (providerData.riskLevel === 'high' || providerData.riskLevel === 'critical') {
        recommendations.push('Review risk tolerance settings');
        recommendations.push('Consider implementing additional risk controls');
    }
    
    // Reputation recommendations
    if (providerData.agentReputation && providerData.agentReputation.verificationCount < 10) {
        recommendations.push('Build verification history through consistent performance');
    }
    
    // Default recommendations if all good
    if (recommendations.length === 0) {
        recommendations.push('Continue current verification practices');
        recommendations.push('Monitor compliance requirements regularly');
    }
    
    return recommendations.map(rec => `• ${rec}`).join('\n');
}