/**
 * TrustWrapper Configuration
 * 
 * Configuration utilities and defaults for the TrustWrapper universal verification plugin.
 */

import { TrustWrapperConfig } from '../types/index.js';

/**
 * Default TrustWrapper configuration
 */
export const defaultConfig: TrustWrapperConfig = {
    apiEndpoint: 'https://api.trustwrapper.io',
    apiKey: '',
    enableZkProofs: true,
    enableBlockchainVerification: true,
    enableMarketData: true,
    riskThresholds: {
        low: 30,
        medium: 60,
        high: 80
    },
    complianceSettings: {
        defaultJurisdiction: 'US',
        defaultFramework: 'SEC',
        enableAuditTrail: true
    },
    cacheSettings: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000
    }
};

/**
 * Environment-based configuration
 */
export const environmentConfig: Partial<TrustWrapperConfig> = {
    // API Configuration
    apiEndpoint: process.env.TRUSTWRAPPER_API_ENDPOINT || defaultConfig.apiEndpoint,
    apiKey: process.env.TRUSTWRAPPER_API_KEY || defaultConfig.apiKey,
    
    // Feature flags
    enableZkProofs: process.env.TRUSTWRAPPER_ENABLE_ZK_PROOFS !== 'false',
    enableBlockchainVerification: process.env.TRUSTWRAPPER_ENABLE_BLOCKCHAIN !== 'false',
    enableMarketData: process.env.TRUSTWRAPPER_ENABLE_MARKET_DATA !== 'false',
    
    // Risk thresholds
    riskThresholds: {
        low: parseInt(process.env.TRUSTWRAPPER_RISK_LOW || '30'),
        medium: parseInt(process.env.TRUSTWRAPPER_RISK_MEDIUM || '60'),
        high: parseInt(process.env.TRUSTWRAPPER_RISK_HIGH || '80')
    },
    
    // Compliance settings
    complianceSettings: {
        defaultJurisdiction: (process.env.TRUSTWRAPPER_DEFAULT_JURISDICTION || 'US') as 'US' | 'EU' | 'UK' | 'SG' | 'JP' | 'global',
        defaultFramework: (process.env.TRUSTWRAPPER_DEFAULT_FRAMEWORK || 'SEC') as 'SEC' | 'CFTC' | 'MiFID' | 'FCA' | 'MAS' | 'JFSA' | 'custom',
        enableAuditTrail: process.env.TRUSTWRAPPER_ENABLE_AUDIT_TRAIL !== 'false'
    },
    
    // Cache settings
    cacheSettings: {
        enabled: process.env.TRUSTWRAPPER_CACHE_ENABLED !== 'false',
        ttl: parseInt(process.env.TRUSTWRAPPER_CACHE_TTL || '300000'),
        maxSize: parseInt(process.env.TRUSTWRAPPER_CACHE_MAX_SIZE || '1000')
    }
};

/**
 * Create a TrustWrapper configuration with custom overrides
 */
export function createTrustWrapperConfig(overrides?: Partial<TrustWrapperConfig>): TrustWrapperConfig {
    return {
        ...defaultConfig,
        ...environmentConfig,
        ...overrides,
        // Deep merge nested objects
        riskThresholds: {
            ...defaultConfig.riskThresholds,
            ...environmentConfig.riskThresholds,
            ...overrides?.riskThresholds
        },
        complianceSettings: {
            ...defaultConfig.complianceSettings,
            ...environmentConfig.complianceSettings,
            ...overrides?.complianceSettings
        },
        cacheSettings: {
            ...defaultConfig.cacheSettings,
            ...environmentConfig.cacheSettings,
            ...overrides?.cacheSettings
        }
    };
}

/**
 * Validate TrustWrapper configuration
 */
export function validateConfig(config: TrustWrapperConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate API endpoint
    if (!config.apiEndpoint) {
        errors.push('API endpoint is required');
    } else {
        try {
            new URL(config.apiEndpoint);
        } catch {
            errors.push('API endpoint must be a valid URL');
        }
    }
    
    // Validate risk thresholds
    if (!config.riskThresholds) {
        errors.push('Risk thresholds are required');
    } else {
        const { low, medium, high } = config.riskThresholds;
        if (low >= medium || medium >= high) {
            errors.push('Risk thresholds must be in ascending order (low < medium < high)');
        }
        if (low < 0 || high > 100) {
            errors.push('Risk thresholds must be between 0 and 100');
        }
    }
    
    // Validate compliance settings
    if (!config.complianceSettings) {
        errors.push('Compliance settings are required');
    } else {
        const validJurisdictions = ['US', 'EU', 'UK', 'SG', 'JP', 'global'];
        if (!validJurisdictions.includes(config.complianceSettings.defaultJurisdiction)) {
            errors.push(`Default jurisdiction must be one of: ${validJurisdictions.join(', ')}`);
        }
        
        const validFrameworks = ['SEC', 'CFTC', 'MiFID', 'FCA', 'MAS', 'JFSA', 'custom'];
        if (!validFrameworks.includes(config.complianceSettings.defaultFramework)) {
            errors.push(`Default framework must be one of: ${validFrameworks.join(', ')}`);
        }
    }
    
    // Validate cache settings
    if (config.cacheSettings) {
        if (config.cacheSettings.ttl < 0) {
            errors.push('Cache TTL must be non-negative');
        }
        if (config.cacheSettings.maxSize < 1) {
            errors.push('Cache max size must be at least 1');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Get configuration for specific environments
 */
export function getEnvironmentConfig(environment: 'development' | 'staging' | 'production'): Partial<TrustWrapperConfig> {
    const configs = {
        development: {
            apiEndpoint: 'https://dev-api.trustwrapper.io',
            enableZkProofs: false, // Disable for faster development
            cacheSettings: {
                enabled: false, // Disable cache for development
                ttl: 60000, // 1 minute
                maxSize: 100
            }
        },
        staging: {
            apiEndpoint: 'https://staging-api.trustwrapper.io',
            enableZkProofs: true,
            cacheSettings: {
                enabled: true,
                ttl: 180000, // 3 minutes
                maxSize: 500
            }
        },
        production: {
            apiEndpoint: 'https://api.trustwrapper.io',
            enableZkProofs: true,
            enableBlockchainVerification: true,
            enableMarketData: true,
            cacheSettings: {
                enabled: true,
                ttl: 300000, // 5 minutes
                maxSize: 1000
            }
        }
    };
    
    return configs[environment] || configs.production;
}

/**
 * Configuration presets for common use cases
 */
export const configPresets = {
    /**
     * Lightweight configuration for testing and development
     */
    lightweight: {
        enableZkProofs: false,
        enableBlockchainVerification: false,
        enableMarketData: false,
        cacheSettings: {
            enabled: false,
            ttl: 60000,
            maxSize: 50
        }
    } as Partial<TrustWrapperConfig>,
    
    /**
     * High-security configuration for enterprise environments
     */
    enterprise: {
        enableZkProofs: true,
        enableBlockchainVerification: true,
        enableMarketData: true,
        complianceSettings: {
            defaultJurisdiction: 'US',
            defaultFramework: 'SEC',
            enableAuditTrail: true
        },
        riskThresholds: {
            low: 20, // More strict thresholds
            medium: 50,
            high: 70
        }
    } as Partial<TrustWrapperConfig>,
    
    /**
     * Performance-optimized configuration
     */
    performance: {
        enableZkProofs: false, // Disable for speed
        enableBlockchainVerification: false, // Disable for speed
        enableMarketData: true,
        cacheSettings: {
            enabled: true,
            ttl: 600000, // 10 minutes
            maxSize: 2000
        }
    } as Partial<TrustWrapperConfig>
};

/**
 * Export the main configuration type and utilities
 */
export { TrustWrapperConfig } from '../types/index.js';