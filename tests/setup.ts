/**
 * Jest Test Setup
 * 
 * Global test configuration and mocks for TrustWrapper Universal Plugin
 */

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress console output during tests unless explicitly testing console output
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Global test timeout
jest.setTimeout(10000);

// Mock environment variables for consistent testing
process.env.TRUSTWRAPPER_API_ENDPOINT = 'https://test-api.trustwrapper.io';
process.env.TRUSTWRAPPER_API_KEY = 'test-api-key';
process.env.TRUSTWRAPPER_ENABLE_ZK_PROOFS = 'false';
process.env.TRUSTWRAPPER_ENABLE_BLOCKCHAIN = 'false';
process.env.TRUSTWRAPPER_ENABLE_MARKET_DATA = 'false';
process.env.TRUSTWRAPPER_CACHE_ENABLED = 'false';

// Mock global fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      success: true,
      data: {
        trustScore: 85,
        riskLevel: 'medium',
        recommendation: 'approved'
      }
    }),
  })
) as jest.Mock;

// Common test utilities
export const createMockRuntime = (overrides = {}) => ({
  agentId: 'test-agent',
  messageManager: {
    createMemory: jest.fn(),
    createMemoryId: () => 'mock-memory-id'
  },
  embed: (text: string) => [0.1, 0.2, 0.3],
  character: {
    settings: {
      trustWrapper: {
        evaluationCriteria: {
          trustScoreWeight: 0.3,
          complianceWeight: 0.25,
          riskWeight: 0.2,
          accuracyWeight: 0.25,
          minimumTrustScore: 60,
          maximumRiskLevel: 'high'
        }
      }
    }
  },
  ...overrides
});

export const createMockMemory = (overrides = {}) => ({
  id: 'test-memory',
  userId: 'test-user',
  agentId: 'test-agent',
  content: {
    text: '',
    source: 'test'
  },
  roomId: 'test-room',
  timestamp: Date.now(),
  ...overrides
});

export const createMockState = (overrides = {}) => ({
  verificationHistory: [],
  evaluationHistory: [],
  ...overrides
});

// Test data factories
export const createTradingDecisionRequest = (overrides = {}) => ({
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
    currentPosition: 0,
    marketConditions: 'bullish',
    urgency: 'low'
  },
  ...overrides
});

export const createPerformanceRequest = (overrides = {}) => ({
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
  },
  ...overrides
});

export const createComplianceRequest = (overrides = {}) => ({
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
  timestamp: Date.now(),
  ...overrides
});

// Mock performance.now() for consistent timing tests
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now())
  }
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});