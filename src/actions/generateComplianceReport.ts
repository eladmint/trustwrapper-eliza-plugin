/**
 * Compliance Report Generation Action
 * 
 * Generates regulatory compliance reports for institutional AI agent deployment.
 * Supports multiple jurisdictions and compliance frameworks.
 */

import { Action, IAgentRuntime, Memory, State } from '@ai16z/eliza';
import { TrustWrapperService } from '../services/trustWrapperService.js';
import { ComplianceReportRequest, ComplianceResult } from '../types/index.js';

export interface ComplianceActionContent {
    requirements: {
        jurisdiction: 'US' | 'EU' | 'UK' | 'SG' | 'JP' | 'global';
        framework: 'SEC' | 'CFTC' | 'MiFID' | 'FCA' | 'MAS' | 'JFSA' | 'custom';
        reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'adhoc';
        includeAuditTrail?: boolean;
        riskAssessment?: boolean;
        transactionAnalysis?: boolean;
    };
    scope?: {
        startDate?: string;
        endDate?: string;
        agentActivities?: string[];
        transactionTypes?: string[];
        riskCategories?: string[];
    };
    customRequirements?: {
        additionalChecks?: string[];
        reportingStandards?: string[];
        complianceThresholds?: Record<string, number>;
    };
}

export const generateComplianceReportAction: Action = {
    name: 'GENERATE_COMPLIANCE_REPORT',
    
    similes: [
        'CREATE_COMPLIANCE_REPORT',
        'COMPLIANCE_REPORTING',
        'REGULATORY_REPORT',
        'AUDIT_REPORT',
        'COMPLIANCE_CHECK',
        'REGULATORY_COMPLIANCE'
    ],
    
    description: 'Generate comprehensive regulatory compliance reports for institutional AI agent deployment. Supports multiple jurisdictions including US SEC, EU MiFID, UK FCA, and custom compliance frameworks.',
    
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        try {
            const content = JSON.parse(message.content.text) as ComplianceActionContent;
            
            // Validate required fields
            if (!content.requirements) return false;
            if (!content.requirements.jurisdiction || 
                !['US', 'EU', 'UK', 'SG', 'JP', 'global'].includes(content.requirements.jurisdiction)) return false;
            if (!content.requirements.framework || 
                !['SEC', 'CFTC', 'MiFID', 'FCA', 'MAS', 'JFSA', 'custom'].includes(content.requirements.framework)) return false;
            if (!content.requirements.reportType || 
                !['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'adhoc'].includes(content.requirements.reportType)) return false;
            
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
            const content = JSON.parse(message.content.text) as ComplianceActionContent;
            const trustWrapperService = new TrustWrapperService();
            
            // Prepare compliance report request
            const reportRequest: ComplianceReportRequest = {
                agentId: runtime.agentId || 'unknown',
                requirements: {
                    jurisdiction: content.requirements.jurisdiction,
                    framework: content.requirements.framework,
                    reportType: content.requirements.reportType,
                    includeAuditTrail: content.requirements.includeAuditTrail ?? true,
                    riskAssessment: content.requirements.riskAssessment ?? true,
                    transactionAnalysis: content.requirements.transactionAnalysis ?? true
                },
                scope: {
                    startDate: content.scope?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: content.scope?.endDate || new Date().toISOString(),
                    agentActivities: content.scope?.agentActivities || ['all'],
                    transactionTypes: content.scope?.transactionTypes || ['all'],
                    riskCategories: content.scope?.riskCategories || ['all']
                },
                customRequirements: content.customRequirements || {},
                timestamp: Date.now()
            };
            
            // Generate compliance report
            const complianceReport: ComplianceResult = await trustWrapperService.generateComplianceReport(reportRequest);
            
            // Get jurisdiction-specific details
            const getJurisdictionInfo = (jurisdiction: string, framework: string) => {
                const info = {
                    'US-SEC': { regulator: 'Securities and Exchange Commission', focus: 'Securities trading and investment advice' },
                    'US-CFTC': { regulator: 'Commodity Futures Trading Commission', focus: 'Derivatives and commodities trading' },
                    'EU-MiFID': { regulator: 'European Securities and Markets Authority', focus: 'Markets in Financial Instruments Directive' },
                    'UK-FCA': { regulator: 'Financial Conduct Authority', focus: 'Financial services regulation' },
                    'SG-MAS': { regulator: 'Monetary Authority of Singapore', focus: 'Financial services oversight' },
                    'JP-JFSA': { regulator: 'Japan Financial Services Agency', focus: 'Financial instruments and exchanges' }
                };
                return info[`${jurisdiction}-${framework}`] || { regulator: 'Custom Framework', focus: 'Custom compliance requirements' };
            };
            
            const jurisdictionInfo = getJurisdictionInfo(content.requirements.jurisdiction, content.requirements.framework);
            
            // Create detailed response
            const responseText = `🛡️ **Compliance Report Generated**

**📋 Report Summary**
• **Jurisdiction**: ${content.requirements.jurisdiction} - ${jurisdictionInfo.regulator}
• **Framework**: ${content.requirements.framework} - ${jurisdictionInfo.focus}
• **Report Type**: ${content.requirements.reportType.toUpperCase()}
• **Compliance Status**: ${complianceReport.overallStatus === 'compliant' ? '✅ COMPLIANT' : complianceReport.overallStatus === 'warning' ? '⚠️ ATTENTION REQUIRED' : '❌ NON-COMPLIANT'}
• **Compliance Score**: ${complianceReport.complianceScore}/100

**📊 Compliance Assessment**
• **Regulatory Adherence**: ${complianceReport.regulatoryAdherence ? '✅ Confirmed' : '❌ Issues Found'}
• **Risk Management**: ${complianceReport.riskManagement?.status === 'compliant' ? '✅ Adequate' : '⚠️ Review Required'}
• **Transaction Monitoring**: ${complianceReport.transactionMonitoring?.status === 'active' ? '✅ Active' : '⚠️ Limited'}
• **Audit Trail Integrity**: ${complianceReport.auditTrailIntegrity ? '✅ Complete' : '⚠️ Gaps Identified'}

**🔍 Key Findings**
${complianceReport.findings?.map(finding => 
    `• ${finding.severity === 'high' ? '🔴' : finding.severity === 'medium' ? '🟡' : '🟢'} **${finding.category}**: ${finding.description}`
).join('\n') || '• No significant compliance issues identified'}

**📈 Risk Analysis**
• **Overall Risk Level**: ${complianceReport.riskAssessment?.overallRisk || 'LOW'}
• **Operational Risk**: ${complianceReport.riskAssessment?.operationalRisk || 'Low'}
• **Market Risk**: ${complianceReport.riskAssessment?.marketRisk || 'Low'}  
• **Compliance Risk**: ${complianceReport.riskAssessment?.complianceRisk || 'Low'}

**📋 Regulatory Requirements Status**
${complianceReport.requirementsStatus?.map(req => 
    `• **${req.requirement}**: ${req.status === 'met' ? '✅ Met' : req.status === 'partial' ? '⚠️ Partial' : '❌ Not Met'} ${req.notes ? `(${req.notes})` : ''}`
).join('\n') || '• All basic requirements assessed'}

**📊 Period Analysis**
• **Report Period**: ${new Date(reportRequest.scope.startDate).toLocaleDateString()} - ${new Date(reportRequest.scope.endDate).toLocaleDateString()}
• **Total Transactions**: ${complianceReport.transactionSummary?.totalTransactions || 'N/A'}
• **Flagged Transactions**: ${complianceReport.transactionSummary?.flaggedTransactions || 0}
• **Risk Events**: ${complianceReport.transactionSummary?.riskEvents || 0}

**🛡️ Verification Details**
• **Report ID**: ${complianceReport.reportId || 'Generated'}
• **Generated**: ${new Date().toISOString()}
• **Next Review**: ${complianceReport.nextReviewDate || 'Based on report type'}
• **Validity Period**: ${complianceReport.validityPeriod || '30 days'}

${complianceReport.recommendations?.length ? 
    `**💡 Recommendations**\n${complianceReport.recommendations.map(rec => `• ${rec}`).join('\n')}` : 
    ''
}

**📁 Report Deliverables**
• **Executive Summary**: ${complianceReport.deliverables?.executiveSummary ? '✅ Included' : '❌ Not Generated'}
• **Detailed Analysis**: ${complianceReport.deliverables?.detailedAnalysis ? '✅ Included' : '❌ Not Generated'}
• **Audit Trail**: ${content.requirements.includeAuditTrail ? '✅ Complete' : '⏸️ Not Requested'}
• **Risk Assessment**: ${content.requirements.riskAssessment ? '✅ Included' : '⏸️ Not Requested'}

${complianceReport.overallStatus === 'compliant' ? 
    '✅ **COMPLIANCE CONFIRMED** - Agent meets all regulatory requirements for deployment' :
    complianceReport.overallStatus === 'warning' ?
    '⚠️ **ATTENTION REQUIRED** - Minor compliance issues identified, review recommended' :
    '❌ **COMPLIANCE ISSUES** - Significant issues found, remediation required before deployment'
}`;

            // Store compliance result in state
            if (state) {
                state.complianceReport = complianceReport;
                state.lastCompliance = {
                    timestamp: Date.now(),
                    jurisdiction: content.requirements.jurisdiction,
                    framework: content.requirements.framework,
                    status: complianceReport.overallStatus
                };
            }
            
            // Send response
            await runtime.messageManager.createMemory({
                userId: message.userId,
                content: {
                    text: responseText,
                    action: 'GENERATE_COMPLIANCE_REPORT',
                    source: message.content.source || 'unknown'
                },
                roomId: message.roomId,
                agentId: runtime.agentId,
                embedding: runtime.embed(responseText)
            });
            
            return true;
            
        } catch (error) {
            console.error('Compliance report generation failed:', error);
            
            // Send error response
            const errorText = `❌ **Compliance Report Generation Failed**

An error occurred while generating the compliance report. This could be due to:
• Invalid compliance framework configuration
• Temporary compliance service unavailability
• Insufficient data for report generation
• Network connectivity issues

**Fallback**: Manual compliance review recommended by qualified compliance officer.

Error details: ${error instanceof Error ? error.message : 'Unknown error'}`;
            
            await runtime.messageManager.createMemory({
                userId: message.userId,
                content: {
                    text: errorText,
                    action: 'GENERATE_COMPLIANCE_REPORT_ERROR',
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
                        requirements: {
                            jurisdiction: "US",
                            framework: "SEC",
                            reportType: "monthly",
                            includeAuditTrail: true,
                            riskAssessment: true,
                            transactionAnalysis: true
                        },
                        scope: {
                            agentActivities: ["trading", "advisory"],
                            transactionTypes: ["equity", "options"],
                            riskCategories: ["market", "operational"]
                        }
                    })
                }
            },
            {
                user: "assistant",
                content: {
                    text: "🛡️ Generating US SEC compliance report for monthly review. Analyzing trading and advisory activities...",
                    action: "GENERATE_COMPLIANCE_REPORT"
                }
            }
        ],
        [
            {
                user: "user",
                content: {
                    text: JSON.stringify({
                        requirements: {
                            jurisdiction: "EU",
                            framework: "MiFID",
                            reportType: "quarterly",
                            includeAuditTrail: true
                        }
                    })
                }
            },
            {
                user: "assistant",
                content: {
                    text: "🛡️ Creating EU MiFID quarterly compliance report with full audit trail analysis...",
                    action: "GENERATE_COMPLIANCE_REPORT"
                }
            }
        ]
    ]
};