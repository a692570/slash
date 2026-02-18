// ===========================================
// CORE TYPE DEFINITIONS - SLASH
// ===========================================

// -------------------------------------------
// USER TYPES
// -------------------------------------------

export interface User {
  id: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  phone: string;
}

export interface UserResponse {
  id: string;
  email: string;
  phone: string;
  createdAt: string;
}

// -------------------------------------------
// PROVIDER TYPES
// -------------------------------------------

export type ProviderId = 
  | 'comcast'
  | 'spectrum'
  | 'att'
  | 'verizon'
  | 'cox'
  | 'optimum';

export interface Provider {
  id: ProviderId;
  name: string;
  displayName: string;
  logoUrl: string;
  retentionDepartmentPhone?: string;
}

// -------------------------------------------
// BILL TYPES
// -------------------------------------------

export type BillStatus = 'active' | 'negotiating' | 'pending' | 'cancelled';

export interface Bill {
  id: string;
  userId: string;
  provider: ProviderId;
  accountNumber: string;
  currentRate: number;
  planName?: string;
  billDate?: string;
  status: BillStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillCreateInput {
  provider: ProviderId;
  accountNumber: string;
  currentRate: number;
  planName?: string;
  billDate?: string;
}

export interface BillUpdateInput {
  accountNumber?: string;
  currentRate?: number;
  planName?: string;
  billDate?: string;
  status?: BillStatus;
}

export interface BillResponse {
  id: string;
  provider: ProviderId;
  accountNumber: string;
  currentRate: number;
  planName?: string;
  billDate?: string;
  status: BillStatus;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------
// NEGOTIATION TYPES
// -------------------------------------------

export type NegotiationStatus = 
  | 'pending'
  | 'researching'
  | 'calling'
  | 'negotiating'
  | 'success'
  | 'failed'
  | 'cancelled';

export type NegotiationTactic = 
  | 'competitor_conquest'
  | 'loyalty_play'
  | 'churn_threat'
  | 'retention_close'
  | 'supervisor_request';

export interface NegotiationAttempt {
  tactic: NegotiationTactic;
  timestamp: Date;
  outcome: 'success' | 'failed' | 'escalated';
  notes?: string;
}

export interface Negotiation {
  id: string;
  billId: string;
  userId: string;
  status: NegotiationStatus;
  
  // Research data
  competitorRates?: CompetitorRate[];
  
  // Strategy
  selectedTactics?: NegotiationTactic[];
  currentTacticIndex?: number;
  
  // Call details
  telnyxCallId?: string;
  startedAt?: Date;
  completedAt?: Date;
  
  // Results
  originalRate: number;
  newRate?: number;
  monthlySavings?: number;
  totalSavings?: number;
  
  // History
  attempts: NegotiationAttempt[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NegotiationResponse {
  id: string;
  billId: string;
  status: NegotiationStatus;
  originalRate: number;
  newRate?: number;
  monthlySavings?: number;
  attempts: NegotiationAttempt[];
  createdAt: string;
}

// -------------------------------------------
// COMPETITOR RESEARCH TYPES
// -------------------------------------------

export interface CompetitorRate {
  provider: ProviderId;
  planName: string;
  monthlyRate: number;
  contractTerms?: string;
  source: string;
  scrapedAt: Date;
}

// -------------------------------------------
// KNOWLEDGE GRAPH TYPES (Neo4j)
// -------------------------------------------

export interface RetentionOffer {
  provider: ProviderId;
  trigger: string;
  typicalDiscount: number;
  successRate: number;
}

export interface ProviderLeverage {
  provider: ProviderId;
  competitorOffers: CompetitorRate[];
  retentionOffers: RetentionOffer[];
  historicalNegotiations: number;
  averageSavings: number;
}

// -------------------------------------------
// API RESPONSE TYPES
// -------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// -------------------------------------------
// WEBHOOK TYPES (Telnyx)
// -------------------------------------------

export interface TelnyxWebhookPayload {
  event_type: string;
  payload: {
    call_id: string;
    call_control_id: string;
    state: string;
    duration?: number;
    result?: {
      outcome?: string;
      recording_url?: string;
    };
  };
}

// -------------------------------------------
// DASHBOARD TYPES
// -------------------------------------------

export interface UserStats {
  totalBills: number;
  activeNegotiations: number;
  completedNegotiations: number;
  successfulNegotiations: number;
  totalMonthlySavings: number;
  totalLifetimeSavings: number;
  successRate: number;
}

export interface DashboardData {
  user: UserResponse;
  stats: UserStats;
  recentNegotiations: NegotiationResponse[];
  activeBills: BillResponse[];
}

// -------------------------------------------
// CONSTANTS
// -------------------------------------------

export const PROVIDERS: Record<ProviderId, Provider> = {
  comcast: {
    id: 'comcast',
    name: 'comcast',
    displayName: 'Xfinity',
    logoUrl: '/logos/comcast.svg',
    retentionDepartmentPhone: '1-800-934-6489'
  },
  spectrum: {
    id: 'spectrum',
    name: 'spectrum',
    displayName: 'Spectrum',
    logoUrl: '/logos/spectrum.svg',
    retentionDepartmentPhone: '1-866-564-2255'
  },
  att: {
    id: 'att',
    name: 'att',
    displayName: 'AT&T Internet',
    logoUrl: '/logos/att.svg',
    retentionDepartmentPhone: '1-800-331-0500'
  },
  verizon: {
    id: 'verizon',
    name: 'verizon',
    displayName: 'Verizon Fios',
    logoUrl: '/logos/verizon.svg',
    retentionDepartmentPhone: '1-888-294-4357'
  },
  cox: {
    id: 'cox',
    name: 'cox',
    displayName: 'Cox Communications',
    logoUrl: '/logos/cox.svg',
    retentionDepartmentPhone: '1-800-234-3993'
  },
  optimum: {
    id: 'optimum',
    name: 'optimum',
    displayName: 'Optimum',
    logoUrl: '/logos/optimum.svg',
    retentionDepartmentPhone: '1-866-218-3130'
  }
};

export const DEFAULT_FEE_PERCENTAGE = 0.10; // 10% of savings

export const NEGOTIATION_TACTICS: Record<NegotiationTactic, {
  name: string;
  description: string;
  priority: number;
}> = {
  competitor_conquest: {
    name: 'Competitor Conquest',
    description: 'Use competitor pricing as leverage',
    priority: 1
  },
  loyalty_play: {
    name: 'Loyalty Play',
    description: 'Emphasize customer tenure and loyalty',
    priority: 2
  },
  churn_threat: {
    name: 'Churn Threat',
    description: 'Express intent to cancel or switch',
    priority: 3
  },
  retention_close: {
    name: 'Retention Close',
    description: 'Close when rep offers discount',
    priority: 4
  },
  supervisor_request: {
    name: 'Supervisor Request',
    description: 'Escalate to supervisor for better offers',
    priority: 5
  }
};