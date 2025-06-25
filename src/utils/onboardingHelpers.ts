/**
 * Onboarding Helper Utilities
 * 
 * Utility functions for progressive disclosure, smart messaging, and user guidance
 */

export interface WelcomeMessage {
    level: number;
    title: string;
    description: string;
    quickAction: string;
    estimatedTime: string;
    nextSteps: string[];
}

export interface SmartTip {
    id: string;
    message: string;
    action?: string;
    dismissible: boolean;
    priority: 'low' | 'medium' | 'high';
    timing: 'immediate' | 'after_first_use' | 'after_success' | 'periodic';
}

/**
 * Generate contextual welcome messages based on user setup
 */
export function generateWelcomeMessage(hasApiKey: boolean, isFirstTime: boolean): WelcomeMessage {
    if (isFirstTime && !hasApiKey) {
        return {
            level: 1,
            title: "🛡️ TrustWrapper: Instant AI Verification",
            description: "Your AI agent now has automatic trust scoring! Every decision gets verified with 0-100 trust scores and risk assessment.",
            quickAction: "Make any AI decision to see trust verification in action",
            estimatedTime: "Working immediately",
            nextSteps: [
                "Test verification with a trading decision",
                "Check trust scores and risk levels", 
                "Add real data keys for enhanced accuracy (optional)"
            ]
        };
    }

    if (isFirstTime && hasApiKey) {
        return {
            level: 2,
            title: "🚀 TrustWrapper: Enhanced with Real Data",
            description: "Premium verification active! Your agent now uses live blockchain and market data for enhanced accuracy.",
            quickAction: "Make a trading decision to see real-time verification",
            estimatedTime: "Enhanced verification ready",
            nextSteps: [
                "Experience real blockchain verification",
                "See live market data integration",
                "Explore compliance features (Professional tier)"
            ]
        };
    }

    if (!isFirstTime && hasApiKey) {
        return {
            level: 3,
            title: "🏢 TrustWrapper: Professional Ready",
            description: "Your usage patterns suggest readiness for Professional features: compliance reporting, custom risk rules, and advanced analytics.",
            quickAction: "Check Professional tier features for your use case",
            estimatedTime: "Upgrade available now",
            nextSteps: [
                "Review compliance reporting options",
                "Configure custom risk thresholds",
                "Enable advanced analytics dashboard"
            ]
        };
    }

    return {
        level: 1,
        title: "🛡️ TrustWrapper: Welcome Back",
        description: "AI verification active. All decisions protected with trust scoring and risk assessment.",
        quickAction: "Continue using verified AI decisions",
        estimatedTime: "Always active",
        nextSteps: ["Explore new features", "Check verification history"]
    };
}

/**
 * Smart tips based on usage patterns and context
 */
export function getSmartTips(context: {
    verificationsCount: number;
    hasErrors: boolean;
    tradingVolume: number;
    daysUsed: number;
    hasRealData: boolean;
    hasCompliance: boolean;
}): SmartTip[] {
    const tips: SmartTip[] = [];

    // Level 1: Basic usage tips
    if (context.verificationsCount === 0) {
        tips.push({
            id: 'first_verification',
            message: "💡 Make your first AI decision to see TrustWrapper verification in action",
            action: "Try a trading decision or performance check",
            dismissible: false,
            priority: 'high',
            timing: 'immediate'
        });
    }

    // Level 2: Enhancement opportunities
    if (context.verificationsCount > 50 && !context.hasRealData) {
        tips.push({
            id: 'real_data_upgrade',
            message: "🚀 Add real blockchain data for 40% better accuracy",
            action: "Set NOWNODES_API_KEY and COINGECKO_API_KEY",
            dismissible: true,
            priority: 'high',
            timing: 'after_success'
        });
    }

    if (context.hasErrors && context.verificationsCount > 20) {
        tips.push({
            id: 'custom_thresholds',
            message: "🎯 Custom risk thresholds can reduce false positives by 50-80%",
            action: "Explore Professional tier configuration",
            dismissible: true,
            priority: 'medium',
            timing: 'after_first_use'
        });
    }

    // Level 3: Professional features
    if (context.tradingVolume > 50000 && !context.hasCompliance) {
        tips.push({
            id: 'compliance_needed',
            message: "⚖️ High trading volume detected - compliance reporting recommended",
            action: "Enable SEC/MiFID compliance in Professional tier",
            dismissible: true,
            priority: 'high',
            timing: 'immediate'
        });
    }

    if (context.daysUsed > 7 && context.verificationsCount > 500) {
        tips.push({
            id: 'analytics_available',
            message: "📊 Your usage qualifies for advanced analytics and optimization",
            action: "View Professional tier analytics features",
            dismissible: true,
            priority: 'medium',
            timing: 'periodic'
        });
    }

    // Sort by priority
    return tips.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
}

/**
 * Generate setup progress indicators
 */
export function getSetupProgress(config: {
    hasPlugin: boolean;
    hasApiKey: boolean;
    hasBlockchainKey: boolean;
    hasMarketKey: boolean;
    hasCompliance: boolean;
}): {
    level: number;
    progress: number;
    currentStep: string;
    nextStep: string;
    completedSteps: string[];
    remainingSteps: string[];
} {
    const steps = [
        { id: 'plugin', label: 'Install TrustWrapper Plugin', completed: config.hasPlugin },
        { id: 'api_key', label: 'Add TrustWrapper API Key (Free)', completed: config.hasApiKey },
        { id: 'blockchain', label: 'Add Blockchain Verification (Optional)', completed: config.hasBlockchainKey },
        { id: 'market', label: 'Add Market Data (Optional)', completed: config.hasMarketKey },
        { id: 'compliance', label: 'Enable Compliance (Professional)', completed: config.hasCompliance }
    ];

    const completedSteps = steps.filter(s => s.completed);
    const remainingSteps = steps.filter(s => !s.completed);
    const progress = (completedSteps.length / steps.length) * 100;

    let level = 1;
    if (completedSteps.length >= 2) level = 2;
    if (completedSteps.length >= 4) level = 3;
    if (completedSteps.length === 5) level = 4;

    return {
        level,
        progress,
        currentStep: remainingSteps[0]?.label || 'Setup Complete',
        nextStep: remainingSteps[1]?.label || 'Explore Advanced Features',
        completedSteps: completedSteps.map(s => s.label),
        remainingSteps: remainingSteps.map(s => s.label)
    };
}

/**
 * Context-aware error messages with helpful suggestions
 */
export function getHelpfulErrorMessage(error: string, context: {
    hasApiKey: boolean;
    hasBlockchainData: boolean;
    verificationsCount: number;
}): {
    message: string;
    suggestion: string;
    action?: string;
    documentationLink?: string;
} {
    // API key errors
    if (error.includes('API key') || error.includes('authentication')) {
        return {
            message: "Authentication issue detected",
            suggestion: context.hasApiKey 
                ? "Your API key might be invalid or expired"
                : "Add a free TrustWrapper API key to enable enhanced features",
            action: context.hasApiKey 
                ? "Check API key validity at https://api.trustwrapper.io/validate"
                : "Get free API key at https://trustwrapper.io/signup",
            documentationLink: "/docs/authentication"
        };
    }

    // Network errors
    if (error.includes('network') || error.includes('timeout')) {
        return {
            message: "Network connectivity issue",
            suggestion: context.hasBlockchainData 
                ? "Blockchain data services may be temporarily unavailable"
                : "Using mock data mode - add blockchain keys for live data",
            action: "Check network connection or try again in a moment",
            documentationLink: "/docs/troubleshooting"
        };
    }

    // Configuration errors
    if (error.includes('config') || error.includes('invalid')) {
        return {
            message: "Configuration issue detected",
            suggestion: "TrustWrapper configuration needs adjustment",
            action: "Review configuration guide for proper setup",
            documentationLink: "/docs/configuration"
        };
    }

    // Generic helpful error
    return {
        message: "Verification issue encountered",
        suggestion: context.verificationsCount === 0 
            ? "This appears to be your first verification - check the quick start guide"
            : "Check recent changes to your configuration or API keys",
        action: "Review troubleshooting guide or contact support",
        documentationLink: "/docs/troubleshooting"
    };
}

/**
 * Success celebration messages based on milestones
 */
export function getCelebrationMessage(milestone: string, metrics: {
    verificationsCount: number;
    trustScore: number;
    daysUsed: number;
}): string | null {
    const messages = {
        'first_verification': "🎉 First verification complete! Your AI agent is now protected with trust scoring.",
        'tenth_verification': "🚀 10 verifications done! You're getting the hang of AI trust verification.",
        'real_data_connected': "⚡ Real blockchain data connected! Your verifications are now enhanced with live data.",
        'high_trust_score': metrics.trustScore >= 90 
            ? "🏆 Excellent! 90+ trust score - your AI decisions are highly trustworthy."
            : null,
        'week_milestone': metrics.daysUsed === 7 
            ? "📅 One week with TrustWrapper! Your AI agent has been protected for 7 days."
            : null,
        'hundred_verifications': metrics.verificationsCount === 100 
            ? "💯 100 verifications milestone! Your AI agent is well-protected with trust verification."
            : null,
        'professional_ready': metrics.verificationsCount > 500 
            ? "🏢 Professional tier ready! Your usage patterns qualify for advanced features."
            : null
    };

    return messages[milestone as keyof typeof messages] || null;
}

/**
 * Progressive feature discovery based on usage
 */
export function discoverFeatures(usage: {
    tradingDecisions: number;
    complianceReports: number;
    multiChain: boolean;
    highValue: boolean;
    errors: number;
}): {
    feature: string;
    description: string;
    benefit: string;
    tier: string;
    priority: number;
}[] {
    const features = [];

    if (usage.tradingDecisions > 20 && usage.errors > 2) {
        features.push({
            feature: "Custom Risk Thresholds",
            description: "Fine-tune risk sensitivity to match your trading strategy",
            benefit: "Reduce false positives by 50-80%",
            tier: "Professional",
            priority: 8
        });
    }

    if (usage.highValue && usage.complianceReports === 0) {
        features.push({
            feature: "Automated Compliance Reporting",
            description: "Generate SEC, MiFID, and FCA compliant reports automatically",
            benefit: "Meet institutional requirements effortlessly",
            tier: "Professional",
            priority: 9
        });
    }

    if (usage.multiChain && usage.tradingDecisions > 50) {
        features.push({
            feature: "Cross-Chain Risk Assessment",
            description: "Portfolio-level risk analysis across multiple blockchains",
            benefit: "Holistic risk management for multi-chain strategies",
            tier: "Professional",
            priority: 7
        });
    }

    return features.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate dynamic help content based on user context
 */
export function getDynamicHelp(context: {
    currentAction: string;
    userLevel: number;
    hasIssues: boolean;
    lastSuccess: Date | null;
}): {
    primaryHelp: string;
    tips: string[];
    documentation: string[];
    nextSteps: string[];
} {
    const baseHelp = {
        trading_decision: "Trading decisions are verified for trust, risk, and market conditions",
        performance_check: "Performance verification validates AI agent capabilities and metrics",
        compliance_report: "Compliance reports ensure regulatory requirements are met"
    };

    const levelTips = {
        1: [
            "Trust scores range from 0-100, with 70+ recommended for execution",
            "Risk levels are calculated from multiple market and decision factors",
            "All verifications work immediately with mock data"
        ],
        2: [
            "Real blockchain data provides enhanced accuracy and market validation",
            "Live price feeds ensure decisions use current market conditions",
            "Historical verification data builds performance insights"
        ],
        3: [
            "Custom risk thresholds can be tuned to your specific requirements",
            "Compliance frameworks support multiple jurisdictions and standards",
            "Advanced analytics reveal optimization opportunities"
        ],
        4: [
            "Enterprise features include white-label deployment options",
            "Dedicated infrastructure ensures consistent performance",
            "Custom integrations available for specific business needs"
        ]
    };

    return {
        primaryHelp: baseHelp[context.currentAction as keyof typeof baseHelp] || "TrustWrapper provides comprehensive AI verification",
        tips: levelTips[context.userLevel as keyof typeof levelTips] || levelTips[1],
        documentation: [
            `/docs/level-${context.userLevel}`,
            `/docs/${context.currentAction}`,
            "/docs/troubleshooting"
        ],
        nextSteps: context.hasIssues 
            ? ["Check configuration", "Review error logs", "Contact support"]
            : ["Explore advanced features", "Optimize settings", "Review analytics"]
    };
}