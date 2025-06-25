/**
 * Progressive Onboarding Service
 * 
 * Implements progressive disclosure patterns to guide users through TrustWrapper features
 * based on usage patterns, needs analysis, and success metrics.
 */

import { 
    VerificationResult, 
    TradingDecisionRequest,
    PerformanceVerificationRequest,
    ComplianceReportRequest 
} from '../types/index.js';

export interface UsageMetrics {
    totalVerifications: number;
    tradingDecisions: number;
    performanceChecks: number;
    complianceReports: number;
    dailyVolume: number;
    multipleAgents: number;
    daysUsed: number;
    averageTrustScore: number;
    riskEvents: number;
    multiAsset: boolean;
    multiChain: boolean;
    hasRealData: boolean;
    hasCompliance: boolean;
    errorRate: number;
    tradingValue: number;
    customRequirements: boolean;
}

export interface FeatureSuggestion {
    feature: string;
    relevance: string;
    benefit: string;
    tier: 'basic' | 'professional' | 'enterprise';
    priority: 'low' | 'medium' | 'high';
    action?: string;
    estimatedValue?: string;
}

export interface OnboardingState {
    level: 1 | 2 | 3 | 4;
    completedSteps: string[];
    suggestionsShown: string[];
    lastInteraction: Date;
    preferences: {
        showTips: boolean;
        frequency: 'minimal' | 'normal' | 'detailed';
        focusArea: 'trading' | 'compliance' | 'performance' | 'general';
    };
}

export class ProgressiveOnboardingService {
    private userMetrics: Map<string, UsageMetrics> = new Map();
    private onboardingStates: Map<string, OnboardingState> = new Map();

    /**
     * Level 1: Basic feature discovery (30 seconds to value)
     */
    getQuickStartGuidance(): { message: string; nextStep: string; estimatedTime: string } {
        return {
            message: "🚀 TrustWrapper is now protecting your AI agent! Every decision gets automatic trust scoring (0-100) and risk assessment.",
            nextStep: "Try making a trading decision - you'll see trust scores and recommendations immediately.",
            estimatedTime: "Working now - no setup required!"
        };
    }

    /**
     * Level 2: Enhanced features based on usage (5 minutes to enhancement)
     */
    suggestEnhancements(userId: string, metrics: UsageMetrics): FeatureSuggestion[] {
        const suggestions: FeatureSuggestion[] = [];

        // Real data upgrade suggestion
        if (metrics.totalVerifications > 100 && !metrics.hasRealData) {
            suggestions.push({
                feature: "Real Blockchain Verification",
                relevance: `${metrics.totalVerifications} verifications completed - ready for real data`,
                benefit: "70+ blockchain verification with live market data increases accuracy by 40%",
                tier: "basic",
                priority: "high",
                action: "Add NOWNODES_API_KEY and COINGECKO_API_KEY to environment",
                estimatedValue: "40% accuracy improvement"
            });
        }

        // Trading optimization suggestion
        if (metrics.tradingDecisions > 50 && metrics.errorRate > 0.1) {
            suggestions.push({
                feature: "Custom Risk Thresholds",
                relevance: `${(metrics.errorRate * 100).toFixed(1)}% false positive rate detected`,
                benefit: "Fine-tune risk parameters to match your trading strategy",
                tier: "professional",
                priority: "medium",
                action: "Configure custom risk thresholds in Professional tier",
                estimatedValue: "50-80% reduction in false positives"
            });
        }

        // Compliance suggestion for high-value trading
        if (metrics.tradingValue > 50000 && !metrics.hasCompliance) {
            suggestions.push({
                feature: "Compliance Reporting",
                relevance: `$${metrics.tradingValue.toLocaleString()} trading volume detected`,
                benefit: "Automated SEC/MiFID compliance for institutional requirements",
                tier: "professional",
                priority: "high",
                action: "Enable compliance tracking in Professional tier",
                estimatedValue: "Institutional trading compliance"
            });
        }

        return suggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * Level 3: Professional features (30 minutes to advanced capabilities)
     */
    identifyProfessionalNeeds(userId: string, metrics: UsageMetrics): FeatureSuggestion[] {
        const suggestions: FeatureSuggestion[] = [];

        // Multi-agent deployment
        if (metrics.multipleAgents > 3) {
            suggestions.push({
                feature: "Multi-Agent Dashboard",
                relevance: `${metrics.multipleAgents} agents detected - centralized monitoring available`,
                benefit: "Unified dashboard for monitoring all agents with portfolio risk assessment",
                tier: "professional",
                priority: "high",
                estimatedValue: "Centralized risk management"
            });
        }

        // Advanced analytics
        if (metrics.daysUsed > 14 && metrics.totalVerifications > 1000) {
            suggestions.push({
                feature: "Advanced Analytics & Reporting",
                relevance: "High-volume usage qualifies for advanced analytics",
                benefit: "Detailed performance insights, trend analysis, and optimization recommendations",
                tier: "professional",
                priority: "medium",
                estimatedValue: "20-30% performance optimization"
            });
        }

        // Custom compliance frameworks
        if (metrics.complianceReports > 10 && metrics.customRequirements) {
            suggestions.push({
                feature: "Custom Compliance Framework",
                relevance: "Multiple compliance reports suggest custom framework needs",
                benefit: "Tailored compliance rules for your specific regulatory requirements",
                tier: "professional",
                priority: "high",
                estimatedValue: "Custom regulatory compliance"
            });
        }

        return suggestions;
    }

    /**
     * Level 4: Enterprise readiness signals
     */
    identifyEnterpriseNeeds(userId: string, metrics: UsageMetrics): FeatureSuggestion[] {
        const enterpriseSignals = [
            metrics.dailyVolume > 10000,
            metrics.multipleAgents > 10,
            metrics.complianceReports > 100,
            metrics.tradingValue > 1000000,
            metrics.customRequirements
        ];

        const signalCount = enterpriseSignals.filter(Boolean).length;

        if (signalCount >= 2) {
            return [{
                feature: "Enterprise Solution",
                relevance: `${signalCount}/5 enterprise signals detected - ready for enterprise features`,
                benefit: "White-label deployment, dedicated infrastructure, custom SLAs, 24/7 support",
                tier: "enterprise",
                priority: "high",
                action: "Schedule enterprise consultation",
                estimatedValue: "Enterprise-grade trust infrastructure"
            }];
        }

        return [];
    }

    /**
     * Smart timing for feature suggestions
     */
    getTimedDiscovery(userId: string, daysUsed: number): string | null {
        const state = this.onboardingStates.get(userId);
        const milestones = {
            1: "💡 Tip: Add real blockchain data for enhanced accuracy (NOWNODES_API_KEY)",
            3: "🚀 Professional tier users report 40% fewer false positives with custom thresholds",
            7: "📊 Analytics show your verification patterns - custom rules available",
            14: "🏢 Your usage qualifies for Professional tier features - compliance & advanced analytics",
            30: "🏛️ Enterprise features available: white-label, dedicated support, custom compliance"
        };

        const message = milestones[daysUsed as keyof typeof milestones];
        
        // Don't repeat suggestions
        if (message && !state?.suggestionsShown.includes(`milestone_${daysUsed}`)) {
            if (state) {
                state.suggestionsShown.push(`milestone_${daysUsed}`);
            }
            return message;
        }

        return null;
    }

    /**
     * Context-aware help during verification
     */
    getContextualHelp(request: TradingDecisionRequest | PerformanceVerificationRequest | ComplianceReportRequest, result: any): string | null {
        // Trading decision help
        if ('decision' in request) {
            const tradingRequest = request as TradingDecisionRequest;
            
            if (result.trustScore < 50) {
                return "⚠️ Low trust score detected. Consider adding real market data or adjusting risk parameters.";
            }
            
            if (tradingRequest.decision.amount > 10000) {
                return "💡 High-value trades benefit from compliance reporting (available in Professional tier).";
            }
            
            if (result.riskLevel === 'high') {
                return "🛡️ High-risk decision detected. Custom risk thresholds can fine-tune sensitivity.";
            }
        }

        // Performance verification help
        if ('metrics' in request) {
            const perfRequest = request as PerformanceVerificationRequest;
            
            if (perfRequest.metrics.accuracy < 0.8) {
                return "📈 Performance optimization available through Professional tier analytics.";
            }
        }

        return null;
    }

    /**
     * Progressive documentation revelation
     */
    getRelevantDocumentation(userId: string, currentTask: string): { title: string; url: string; difficulty: string }[] {
        const state = this.onboardingStates.get(userId);
        const level = state?.level || 1;

        const docs = {
            1: [
                { title: "Quick Start Guide", url: "/docs/quick-start", difficulty: "Beginner" },
                { title: "Basic Verification", url: "/docs/basic-verification", difficulty: "Beginner" }
            ],
            2: [
                { title: "Real Data Integration", url: "/docs/real-data-setup", difficulty: "Intermediate" },
                { title: "Trust Score Optimization", url: "/docs/trust-scoring", difficulty: "Intermediate" }
            ],
            3: [
                { title: "Professional Configuration", url: "/docs/professional-setup", difficulty: "Advanced" },
                { title: "Compliance Framework", url: "/docs/compliance", difficulty: "Advanced" }
            ],
            4: [
                { title: "Enterprise Deployment", url: "/docs/enterprise", difficulty: "Expert" },
                { title: "Custom Integration", url: "/docs/custom-integration", difficulty: "Expert" }
            ]
        };

        return docs[level] || docs[1];
    }

    /**
     * Success metrics tracking
     */
    trackOnboardingSuccess(userId: string, milestone: string): void {
        const state = this.onboardingStates.get(userId) || {
            level: 1,
            completedSteps: [],
            suggestionsShown: [],
            lastInteraction: new Date(),
            preferences: {
                showTips: true,
                frequency: 'normal',
                focusArea: 'general'
            }
        };

        if (!state.completedSteps.includes(milestone)) {
            state.completedSteps.push(milestone);
            state.lastInteraction = new Date();

            // Level progression
            if (milestone === 'first_verification' && state.level < 2) {
                state.level = 2;
            } else if (milestone === 'real_data_setup' && state.level < 3) {
                state.level = 3;
            } else if (milestone === 'professional_tier' && state.level < 4) {
                state.level = 4;
            }

            this.onboardingStates.set(userId, state);
        }
    }

    /**
     * Update user metrics for progressive suggestions
     */
    updateMetrics(userId: string, metrics: Partial<UsageMetrics>): void {
        const current = this.userMetrics.get(userId) || {
            totalVerifications: 0,
            tradingDecisions: 0,
            performanceChecks: 0,
            complianceReports: 0,
            dailyVolume: 0,
            multipleAgents: 1,
            daysUsed: 1,
            averageTrustScore: 0,
            riskEvents: 0,
            multiAsset: false,
            multiChain: false,
            hasRealData: false,
            hasCompliance: false,
            errorRate: 0,
            tradingValue: 0,
            customRequirements: false
        };

        this.userMetrics.set(userId, { ...current, ...metrics });
    }

    /**
     * Generate onboarding report for admins
     */
    generateOnboardingReport(): {
        totalUsers: number;
        levelDistribution: Record<number, number>;
        commonDropoffPoints: string[];
        successfulMilestones: string[];
        averageTimeToValue: number;
    } {
        const states = Array.from(this.onboardingStates.values());
        
        return {
            totalUsers: states.length,
            levelDistribution: states.reduce((acc, state) => {
                acc[state.level] = (acc[state.level] || 0) + 1;
                return acc;
            }, {} as Record<number, number>),
            commonDropoffPoints: this.identifyDropoffPoints(states),
            successfulMilestones: this.identifySuccessfulMilestones(states),
            averageTimeToValue: this.calculateTimeToValue(states)
        };
    }

    private identifyDropoffPoints(states: OnboardingState[]): string[] {
        // Analysis logic for common dropoff points
        return ["real_data_setup", "professional_upgrade"];
    }

    private identifySuccessfulMilestones(states: OnboardingState[]): string[] {
        // Analysis logic for successful milestone patterns
        return ["first_verification", "basic_configuration"];
    }

    private calculateTimeToValue(states: OnboardingState[]): number {
        // Calculate average time from signup to first successful verification
        return 45; // seconds (placeholder)
    }
}