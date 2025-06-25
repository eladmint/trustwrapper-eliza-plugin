import axios from 'axios';
import { TradingDecision, VerificationResult, PerformanceData, ComplianceRequest } from '../types';

const API_BASE_URL = process.env.TRUSTWRAPPER_API_URL || 'http://74.50.113.152:8083';

export class TrustWrapperService {
    private apiKey?: string;
    
    constructor(apiKey?: string) {
        this.apiKey = apiKey;
    }
    
    async verifyTradingDecision(decision: TradingDecision): Promise<VerificationResult> {
        try {
            const response = await axios.post(`${API_BASE_URL}/verify/trading`, decision, {
                headers: this.getHeaders(),
                timeout: 5000
            });
            
            return response.data;
        } catch (error) {
            console.error('TrustWrapper API error:', error);
            // Return safe default if API is unavailable
            return {
                verified: false,
                trust_score: 0,
                risk_level: 'HIGH',
                warnings: ['TrustWrapper API unavailable - defaulting to safe mode'],
                recommendation: 'REVIEW',
                details: { error: error.message },
                timestamp: new Date().toISOString()
            };
        }
    }
    
    async verifyPerformance(performanceData: PerformanceData): Promise<any> {
        // Placeholder for future implementation
        return {
            status: 'not_implemented',
            message: 'Performance verification coming in v1.1'
        };
    }
    
    async generateComplianceReport(request: ComplianceRequest): Promise<any> {
        // Placeholder for future implementation
        return {
            status: 'not_implemented',
            message: 'Compliance reporting coming in v1.1'
        };
    }
    
    private getHeaders() {
        const headers: any = {
            'Content-Type': 'application/json'
        };
        
        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }
        
        return headers;
    }
}

// Export singleton instance for convenience
export const trustWrapperService = new TrustWrapperService();
