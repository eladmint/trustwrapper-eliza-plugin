/**
 * TrustWrapper Universal Verification Plugin for Eliza
 * 
 * Universal AI verification infrastructure for any Eliza-based AI agent.
 * Provides real-time trust scoring, compliance validation, and zero-knowledge verification.
 */

import { Plugin } from '@ai16z/eliza';
import { verifyTradingDecisionAction } from './actions/verifyTradingDecision.js';
import { verifyPerformanceAction } from './actions/verifyPerformance.js';
import { generateComplianceReportAction } from './actions/generateComplianceReport.js';
import { trustWrapperProvider } from './providers/trustWrapperProvider.js';
import { trustWrapperEvaluator } from './evaluators/trustWrapperEvaluator.js';

/**
 * TrustWrapper Universal Verification Plugin
 * 
 * Enables any Eliza-based AI agent to use TrustWrapper's verification infrastructure:
 * - Real-time trading decision verification
 * - AI performance validation 
 * - Regulatory compliance monitoring
 * - Zero-knowledge proof generation
 */
export const TrustWrapperPlugin: Plugin = {
    name: 'trustwrapper-universal-verification',
    description: 'Universal AI verification infrastructure for Eliza agents - trust scoring, compliance, and zero-knowledge verification',
    
    actions: [
        verifyTradingDecisionAction,
        verifyPerformanceAction,
        generateComplianceReportAction
    ],
    
    providers: [
        trustWrapperProvider
    ],
    
    evaluators: [
        trustWrapperEvaluator
    ]
};

// Export individual components for advanced usage
export {
    verifyTradingDecisionAction,
    verifyPerformanceAction, 
    generateComplianceReportAction,
    trustWrapperProvider,
    trustWrapperEvaluator
};

// Export types for TypeScript users
export * from './types/index.js';

// Export configuration utilities
export { TrustWrapperConfig, createTrustWrapperConfig } from './config/index.js';

// Export the service for direct usage
export { TrustWrapperService } from './services/trustWrapperService.js';

// Default export for easy importing
export default TrustWrapperPlugin;